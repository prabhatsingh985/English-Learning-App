import React, { useState, useEffect } from 'react';

const VocabularyList = ({ token, onClose }) => {
  const [vocab, setVocab] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newWord, setNewWord] = useState('');
  const [newMeaning, setNewMeaning] = useState('');

  const fetchVocab = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/vocabulary', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setVocab(data);
    } catch (error) {
      console.error('Error fetching vocabulary:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVocab();
  }, [token]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newWord.trim()) return;

    try {
      const response = await fetch('http://localhost:3000/api/vocabulary', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ word: newWord, meaning: newMeaning })
      });
      if (response.ok) {
        setNewWord('');
        setNewMeaning('');
        fetchVocab();
      }
    } catch (error) {
      console.error('Error adding word:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`http://localhost:3000/api/vocabulary/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setVocab(vocab.filter(v => v._id !== id));
    } catch (error) {
      console.error('Error deleting word:', error);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '2rem', maxWidth: '800px', margin: '0 auto', color: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>My Vocabulary Bank</h2>
        <button onClick={onClose} className="btn btn-secondary">Back to Dashboard</button>
      </div>

      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: '1rem' }}>
            <input 
                type="text" 
                placeholder="New Word" 
                value={newWord}
                onChange={(e) => setNewWord(e.target.value)}
                style={{ flex: 1, padding: '0.8rem', borderRadius: '0.5rem', border: '1px solid #ddd', background: 'rgba(255,255,255,0.1)', color: 'white' }}
            />
            <input 
                type="text" 
                placeholder="Meaning (optional)" 
                value={newMeaning}
                onChange={(e) => setNewMeaning(e.target.value)}
                style={{ flex: 2, padding: '0.8rem', borderRadius: '0.5rem', border: '1px solid #ddd', background: 'rgba(255,255,255,0.1)', color: 'white' }}
            />
            <button type="submit" className="btn btn-primary">Add</button>
        </form>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {vocab.length === 0 && <p style={{ opacity: 0.7, textAlign: 'center' }}>No words saved yet.</p>}
          {vocab.map(item => (
            <div key={item._id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--accent-color)' }}>{item.word}</h3>
                {item.meaning && <p style={{ margin: '0.5rem 0 0', opacity: 0.8 }}>{item.meaning}</p>}
                <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>{new Date(item.createdAt).toLocaleDateString()}</span>
              </div>
              <button 
                onClick={() => handleDelete(item._id)}
                style={{ background: 'transparent', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '1.2rem' }}
                title="Delete"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VocabularyList;

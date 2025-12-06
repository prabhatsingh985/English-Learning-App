const run = async () => {
    // Native fetch in Node 18+
    require('dotenv').config();
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-001:generateContent?key=${apiKey}`;
    
    console.log("Testing REST 1.5 Flash...");
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "Hello" }] }]
            })
        });

        if (response.ok) {
            const data = await response.json();
            console.log("SUCCESS:", data.candidates[0].content.parts[0].text);
        } else {
            console.log("FAILED:", response.status, await response.text());
        }
    } catch (e) {
        console.error("ERROR:", e);
    }
};

run();

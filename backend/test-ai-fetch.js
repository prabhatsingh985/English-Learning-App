const fetch = require('node-fetch'); // or built-in in node 18+
require('dotenv').config();

const run = async () => {
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    console.log("Testing URL:", url.replace(apiKey, "HIDDEN_KEY"));

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents: [{
                parts: [{ text: "Hello" }]
            }]
        })
    });

    if (response.ok) {
        const data = await response.json();
        console.log("SUCCESS:", JSON.stringify(data, null, 2));
    } else {
        const text = await response.text();
        console.log("FAILED:", response.status, text);
    }
};

run();

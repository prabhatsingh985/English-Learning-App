const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const run = async () => {
    const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-1.0-pro", "gemini-pro"];
    
    for (const modelName of models) {
        console.log(`\nTesting model: ${modelName}`);
        try {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: modelName});
            
            const result = await model.generateContent("Hello");
            const response = await result.response;
            console.log(`SUCCESS with ${modelName}:`, response.text());
            return; // Exit on first success
        } catch (error) {
            console.log(`FAILED with ${modelName}: ${error.status || error.message}`);
        }
    }
};

run();

const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const run = async () => {
  try {
    console.log("Testing Gemini 1.5 Flash with current key...");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

    const prompt = "Hello";
    const result = await model.generateContent(prompt);
    const response = await result.response;
    console.log("SUCCESS:", response.text());
  } catch (error) {
    console.error("FAILED:", error.message);
  }
};

run();

const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const run = async () => {
  try {
    console.log("Testing Gemini 2.0 Flash Exp...");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp"});

    const prompt = "Hello";
    const result = await model.generateContent(prompt);
    const response = await result.response;
    console.log("Response:", response.text());
  } catch (error) {
    console.error("Error:", error.message);
    if (error.response) {
       console.error("Details:", JSON.stringify(error.response, null, 2));
    }
  }
};

run();

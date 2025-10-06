import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // stored in .env4
  timeout: 120000, // 60 seconds
});

export default openai;

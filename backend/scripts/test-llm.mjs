import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

const skip = (process.env.SKIP_OPENAI ?? process.env.skip_openai)?.toLowerCase() === 'true';
console.log('SKIP_OPENAI:', skip);

const models = (process.env.GEMINI_MODEL || 'gemini-2.5-flash').split(',');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

for (const name of models) {
  try {
    const model = genAI.getGenerativeModel({ model: name.trim() });
    const result = await model.generateContent('Reply with exactly: OK');
    console.log(name.trim(), '->', result.response.text().trim());
    process.exit(0);
  } catch (e) {
    console.log(name.trim(), '-> FAIL:', e.message.slice(0, 100));
  }
}
process.exit(1);

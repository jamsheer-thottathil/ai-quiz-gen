import { GoogleGenerativeAI } from '@google/generative-ai';
import type { QuizSettings, GeminiResponse } from '../types/quiz';

// Read all keys from env (comma separated)
const apiKeys = (process.env.REACT_APP_GEMINI_API_KEYS || '')
  .split(',')
  .map(k => k.trim())
  .filter(Boolean);

if (apiKeys.length === 0) {
  throw new Error('No Gemini API keys found in REACT_APP_GEMINI_API_KEYS');
}

// Shuffle helper for random selection
function shuffle<T>(arr: T[]): T[] {
  return arr.sort(() => Math.random() - 0.5);
}

export class GeminiService {
  async generateQuiz(settings: QuizSettings): Promise<GeminiResponse> {
    let lastError: any;

    // Pick keys in random order for this request
    const shuffledKeys = shuffle([...apiKeys]);

    for (const key of shuffledKeys) {
      try {
        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = this.buildPrompt(settings);
        console.log('Generated prompt:', prompt);

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
        if (!jsonMatch) {
          throw new Error('Invalid response format from Gemini API');
        }

        const { questions } = JSON.parse(jsonMatch[1]);
        return { questions, prompt };
      } catch (err: any) {
        console.warn(`Gemini request failed with key ${key}:`, err.message);
        lastError = err;
        // try next key
      }
    }

    // If all keys fail
    console.error('All Gemini API keys failed');
    throw new Error(`Failed to generate quiz. Last error: ${lastError?.message}`);
  }

  private buildPrompt(settings: QuizSettings): string {
    const { topic, difficulty, numQuestions, questionType } = settings;
    return `Generate a ${difficulty} level quiz about "${topic}" with ${numQuestions} ${questionType} questions.

Please provide the response in the following JSON format:

\`\`\`json
{
  "questions": [
    {
      "question": "Your question here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Brief explanation of why this is the correct answer"
    }
  ]
}
\`\`\`

Requirements:
- Make questions engaging and educational
- Ensure all options are plausible but only one is correct
- Provide clear explanations for correct answers
- Use 0-based indexing for correctAnswer (0 = first option, 1 = second option, etc.)
- For true-false questions, use ["True", "False"] as options
- Make sure the difficulty level matches the specified level
- Focus on the topic: ${topic}

Generate exactly ${numQuestions} questions.`;
  }
}

export const geminiService = new GeminiService();

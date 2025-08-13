import { GoogleGenerativeAI } from '@google/generative-ai';
import type { QuizSettings, GeminiResponse } from '../types/quiz';

const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY || '');

export class GeminiService {
  private model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  async generateQuiz(settings: QuizSettings): Promise<GeminiResponse> {
    try {
      const prompt = this.buildPrompt(settings);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
      if (!jsonMatch) {
        throw new Error('Invalid response format from Gemini API');
      }
      const quizData = JSON.parse(jsonMatch[1]);
      return quizData;
    } catch (error) {
      console.error('Error generating quiz:', error);
      throw new Error('Failed to generate quiz. Please try again.');
    }
  }

  private buildPrompt(settings: QuizSettings): string {
    const { topic, difficulty, numQuestions, questionType } = settings;
    return `Generate a ${difficulty} level quiz about "${topic}" with ${numQuestions} ${questionType} questions.\n\nPlease provide the response in the following JSON format:\n\n\`\`\`json\n{\n  "questions": [\n    {\n      "question": "Your question here?",\n      "options": ["Option A", "Option B", "Option C", "Option D"],\n      "correctAnswer": 0,\n      "explanation": "Brief explanation of why this is the correct answer"\n    }\n  ]\n}\n\`\`\`\n\nRequirements:\n- Make questions engaging and educational\n- Ensure all options are plausible but only one is correct\n- Provide clear explanations for correct answers\n- Use 0-based indexing for correctAnswer (0 = first option, 1 = second option, etc.)\n- For true-false questions, use [\"True\", \"False\"] as options\n- Make sure the difficulty level matches the specified level\n- Focus on the topic: ${topic}\n\nGenerate exactly ${numQuestions} questions.`;
  }
}

export const geminiService = new GeminiService(); 
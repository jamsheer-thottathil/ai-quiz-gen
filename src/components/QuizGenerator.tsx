import { useState } from 'react';
import { Brain, Loader2, Sparkles } from 'lucide-react';
import type { QuizSettings, Quiz } from '../types/quiz';
import { geminiService } from '../services/geminiService';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Select,
  MenuItem,
  Button,
  Stack,
  Alert,
  InputLabel,
  FormControl,
} from '@mui/material';

interface QuizGeneratorProps {
  onQuizGenerated: (quiz: Quiz) => void;
}

export const QuizGenerator: React.FC<QuizGeneratorProps> = ({ onQuizGenerated }) => {
  const [settings, setSettings] = useState<QuizSettings>({
    topic: '',
    difficulty: 'medium',
    numQuestions: 5,
    questionType: 'multiple-choice',
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof QuizSettings, value: string | number) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings.topic.trim()) {
      setError('Please enter a topic');
      return;
    }
    setIsGenerating(true);
    setError(null);
    try {
      const response = await geminiService.generateQuiz(settings);
      const quiz: Quiz = {
        id: Date.now().toString(),
        title: `${settings.topic} Quiz`,
        description: `A ${settings.difficulty} level quiz about ${settings.topic}`,
        topic: settings.topic,
        difficulty: settings.difficulty,
        questions: response.questions.map((q, index) => ({
          id: index.toString(),
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
        })),
        createdAt: new Date(),
      };
      onQuizGenerated(quiz);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate quiz');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="flex-start" minHeight="60vh">
      <Card sx={{ width: '100%', maxWidth: 600, p: 2, boxShadow: 3 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={2} mb={3}>
            <Box sx={{ p: 1, bgcolor: '#e0e7ff', borderRadius: 2, display: 'flex', alignItems: 'center' }}>
              <Brain size={28} color="#2563eb" />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700} color="text.primary">
                AI Quiz Generator
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Generate custom quizzes powered by AI
              </Typography>
            </Box>
          </Stack>

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Stack spacing={3}>
              <TextField
                label="Topic *"
                value={settings.topic}
                onChange={(e) => handleInputChange('topic', e.target.value)}
                placeholder="e.g., JavaScript, World History, Biology..."
                disabled={isGenerating}
                fullWidth
                required
              />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <FormControl fullWidth>
                  <InputLabel id="difficulty-label">Difficulty</InputLabel>
                  <Select
                    labelId="difficulty-label"
                    value={settings.difficulty}
                    label="Difficulty"
                    onChange={(e) => handleInputChange('difficulty', e.target.value as 'easy' | 'medium' | 'hard')}
                    disabled={isGenerating}
                  >
                    <MenuItem value="easy">Easy</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="hard">Hard</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel id="numQuestions-label">Questions</InputLabel>
                  <Select
                    labelId="numQuestions-label"
                    value={String(settings.numQuestions)}
                    label="Questions"
                    onChange={(e) => handleInputChange('numQuestions', Number(e.target.value))}
                    disabled={isGenerating}
                  >
                    <MenuItem value={3}>3 Questions</MenuItem>
                    <MenuItem value={5}>5 Questions</MenuItem>
                    <MenuItem value={10}>10 Questions</MenuItem>
                    <MenuItem value={15}>15 Questions</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel id="questionType-label">Type</InputLabel>
                  <Select
                    labelId="questionType-label"
                    value={settings.questionType}
                    label="Type"
                    onChange={(e) => handleInputChange('questionType', e.target.value as 'multiple-choice' | 'true-false')}
                    disabled={isGenerating}
                  >
                    <MenuItem value="multiple-choice">Multiple Choice</MenuItem>
                    <MenuItem value="true-false">True/False</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
              {error && <Alert severity="error">{error}</Alert>}
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                disabled={isGenerating || !settings.topic.trim()}
                startIcon={isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles />}
              >
                {isGenerating ? 'Generating Quiz...' : 'Generate Quiz'}
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}; 
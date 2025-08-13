import { CheckCircle, XCircle, Trophy, ArrowLeft } from 'lucide-react';
import type { Quiz, QuizResult } from '../types/quiz';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Paper,
  Alert,
} from '@mui/material';
import { useState } from 'react';
import PromptResult from './PromtResult';

interface QuizResultsProps {
  quiz: Quiz;
  result: QuizResult;
  onBack: () => void;
  promptAndResult: {
    prompt: string;
    questions: {
      question: string;
      options: string[];
      correctAnswer: number;
      explanation: string;
    }[];
  } | null;
}

export const QuizResults: React.FC<QuizResultsProps> = ({ quiz, result, onBack, promptAndResult }) => {
  const [open, setOpen] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'success.main';
    if (score >= 60) return 'warning.main';
    return 'error.main';
  };

  const getScoreMessage = (score: number) => {
    if (score >= 90) return 'Excellent! Outstanding performance!';
    if (score >= 80) return 'Great job! Well done!';
    if (score >= 70) return 'Good work! Keep it up!';
    if (score >= 60) return 'Not bad! Room for improvement.';
    return 'Keep practicing! You can do better!';
  };

  const formatTime = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <Box display="flex" justifyContent="center" alignItems="flex-start" minHeight="60vh">
      <Card sx={{ width: '100%', maxWidth: 800, p: 2, boxShadow: 3 }}>
        <CardContent>
          <Stack alignItems="center" spacing={2} mb={4}>
            <Trophy size={48} color="#fbc02d" />
            <Typography variant="h4" fontWeight={700} color="text.primary">
              Quiz Complete!
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {/* You've finished the {quiz.title} */}
              {result.score >= 80 ? "Congratulations! You won!" : 'Better luck next time!'}
            </Typography>
          </Stack>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
            sx={{ mb: 4 }}
          >
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.lighter', flex: 1 }}>
              <Typography variant="h5" fontWeight={700} color={getScoreColor(result.score)}>
                {Math.round(result.score)}%
              </Typography>
              <Typography variant="body2" color="success.main">Score</Typography>
            </Paper>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'info.lighter', flex: 1 }}>
              <Typography variant="h5" fontWeight={700} color="info.main">
                {result.correctAnswers}/{result.totalQuestions}
              </Typography>
              <Typography variant="body2" color="info.main">Correct Answers</Typography>
            </Paper>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.lighter', flex: 1 }}>
              <Typography variant="h5" fontWeight={700} color="warning.main">
                {formatTime(result.timeTaken)}
              </Typography>
              <Typography variant="body2" color="warning.main">Time Taken</Typography>
            </Paper>
          </Stack>

          <Alert severity="info" sx={{ mb: 4, textAlign: 'center' }}>
            <Typography variant="subtitle1" color={getScoreColor(result.score)}>
              {getScoreMessage(result.score)}
            </Typography>
          </Alert>

          <Box mb={4}>
            <Typography variant="h6" fontWeight={600} mb={2}>
              Question Review
            </Typography>
            <Stack spacing={2}>
              {quiz.questions.map((question, index) => {
                const answer = result.answers[index];
                const isCorrect = answer.isCorrect;
                return (
                  <Paper key={question.id} sx={{ p: 2, border: isCorrect ? '2px solid #43a047' : '2px solid #e53935', bgcolor: isCorrect ? '#e8f5e9' : '#ffebee' }}>
                    <Stack direction="row" alignItems="center" spacing={2} mb={1}>
                      {isCorrect ? (
                        <CheckCircle size={20} color="#43a047" />
                      ) : (
                        <XCircle size={20} color="#e53935" />
                      )}
                      <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                        Question {index + 1}: {question.question}
                      </Typography>
                    </Stack>
                    <Stack spacing={1}>
                      {question.options.map((option, optionIndex) => (
                        <Box
                          key={optionIndex}
                          sx={{
                            p: 1,
                            borderRadius: 1,
                            bgcolor:
                              optionIndex === question.correctAnswer
                                ? '#e8f5e9'
                                : optionIndex === answer.selectedAnswer && !isCorrect
                                  ? '#ffebee'
                                  : 'white',
                            border:
                              optionIndex === question.correctAnswer
                                ? '1px solid #43a047'
                                : optionIndex === answer.selectedAnswer && !isCorrect
                                  ? '1px solid #e53935'
                                  : '1px solid #e0e0e0',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <Typography variant="body2">{option}</Typography>
                          {optionIndex === question.correctAnswer && (
                            <CheckCircle size={16} color="#43a047" style={{ marginLeft: 8 }} />
                          )}
                          {optionIndex === answer.selectedAnswer && !isCorrect && (
                            <XCircle size={16} color="#e53935" style={{ marginLeft: 8 }} />
                          )}
                        </Box>
                      ))}
                    </Stack>
                    {question.explanation && (
                      <Alert severity="info" sx={{ mt: 2 }}>
                        <strong>Explanation:</strong> {question.explanation}
                      </Alert>
                    )}
                  </Paper>
                );
              })}
            </Stack>
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button onClick={onBack} variant="outlined" color="inherit" startIcon={<ArrowLeft />}>
              Generate New Quiz
            </Button>
            <Button onClick={() => setOpen(true)} variant="contained" color="primary" >
              Show Prompt and Results
            </Button>
            {open && <PromptResult open={open} onClose={() => setOpen(false)} promptAndResult={promptAndResult} />}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}; 
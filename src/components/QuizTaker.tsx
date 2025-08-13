import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Trophy } from 'lucide-react';
import type { Quiz, QuizResult } from '../types/quiz';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  LinearProgress,
  Paper,
  IconButton,
} from '@mui/material';

interface QuizTakerProps {
  quiz: Quiz;
  onQuizComplete: (result: QuizResult) => void;
  onBack: () => void;
}

export const QuizTaker: React.FC<QuizTakerProps> = ({ quiz, onQuizComplete, onBack }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [timeStarted] = useState<Date>(new Date());

  useEffect(() => {
    setSelectedAnswers(new Array(quiz.questions.length).fill(-1));
  }, [quiz.questions.length]);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const hasAnsweredCurrent = selectedAnswers[currentQuestionIndex] !== -1;

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleFinish = () => {
    const timeTaken = Date.now() - timeStarted.getTime();
    const correctAnswers = selectedAnswers.filter((answer, index) =>
      answer === quiz.questions[index].correctAnswer
    ).length;

    const result: QuizResult = {
      quizId: quiz.id,
      score: (correctAnswers / quiz.questions.length) * 100,
      totalQuestions: quiz.questions.length,
      correctAnswers,
      timeTaken,
      answers: selectedAnswers.map((answer, index) => ({
        questionId: quiz.questions[index].id,
        selectedAnswer: answer,
        isCorrect: answer === quiz.questions[index].correctAnswer,
      })),
      completedAt: new Date(),
    };

    onQuizComplete(result);
  };

  const getProgressPercentage = () => {
    return ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  };

  const getTimeElapsed = () => {
    const elapsed = Date.now() - timeStarted.getTime();
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="flex-start" minHeight="60vh">
      <Card sx={{ width: '100%', maxWidth: 700, p: 2, boxShadow: 3 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
            <Button onClick={onBack} startIcon={<ArrowLeft />} variant="outlined" color="inherit">
              Back
            </Button>
            <Stack direction="row" spacing={3} alignItems="center">
              <Typography variant="body2" color="text.secondary">
                {getTimeElapsed()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Question {currentQuestionIndex + 1} of {quiz.questions.length}
              </Typography>
            </Stack>
          </Stack>

          <Box mb={3}>
            <LinearProgress variant="determinate" value={getProgressPercentage()} sx={{ height: 8, borderRadius: 5 }} />
          </Box>

          <Typography variant="h6" fontWeight={600} mb={2}>
            {currentQuestion.question}
          </Typography>

          <Stack spacing={2} mb={4}>
            {currentQuestion.options.map((option, index) => (
              <Paper
                key={index}
                elevation={selectedAnswers[currentQuestionIndex] === index ? 6 : 1}
                sx={{
                  p: 2,
                  border: selectedAnswers[currentQuestionIndex] === index ? '2px solid #2563eb' : '1px solid #e0e0e0',
                  bgcolor: selectedAnswers[currentQuestionIndex] === index ? '#e3edfa' : 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onClick={() => handleAnswerSelect(index)}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      border: '2px solid',
                      borderColor: selectedAnswers[currentQuestionIndex] === index ? '#2563eb' : '#bdbdbd',
                      bgcolor: selectedAnswers[currentQuestionIndex] === index ? '#2563eb' : 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {selectedAnswers[currentQuestionIndex] === index && (
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'white' }} />
                    )}
                  </Box>
                  <Typography variant="body1">{option}</Typography>
                </Stack>
              </Paper>
            ))}
          </Stack>

          <Stack direction="row" justifyContent="space-between" mt={2}>
            <Button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              variant="outlined"
              color="inherit"
              startIcon={<ArrowLeft />}
            >
              Previous
            </Button>
            {isLastQuestion ? (
              <Button
                onClick={handleFinish}
                disabled={!hasAnsweredCurrent}
                variant="contained"
                color="primary"
                endIcon={<Trophy />}
              >
                Finish Quiz
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!hasAnsweredCurrent}
                variant="contained"
                color="primary"
                endIcon={<ArrowRight />}
              >
                Next
              </Button>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}; 
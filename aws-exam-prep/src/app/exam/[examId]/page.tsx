'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ExamState } from '@/lib/types';
import { scoringService } from '@/lib/services/scoringService';

export default function ExamPage({ params }: { params: Promise<{ examId: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [examState, setExamState] = useState<ExamState | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);

  // Load exam state from sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem('currentExam');
    if (stored) {
      const exam = JSON.parse(stored) as ExamState;
      if (exam.id === resolvedParams.examId) {
        setExamState(exam);
        setTimeRemaining(exam.timerState.remainingTime);
      } else {
        router.push('/');
      }
    } else {
      router.push('/');
    }
  }, [resolvedParams.examId, router]);

  // Define handleSubmit before it's used in useEffect
  const handleSubmit = useCallback(() => {
    if (!examState) {
      console.error('No exam state available');
      return;
    }

    console.log('Submitting exam...', examState.id);

    const completedExam = {
      ...examState,
      endTime: Date.now(),
      isComplete: true
    };

    // Calculate results
    const result = scoringService.calculateScore(completedExam);
    console.log('Score calculated:', result.score.percentageScore);
    console.log('Result ID that will be stored:', result.id);
    
    // Store result SYNCHRONOUSLY - this must complete before navigation
    try {
      const resultJson = JSON.stringify(result);
      sessionStorage.setItem('examResult', resultJson);
      sessionStorage.removeItem('currentExam');
      console.log('Result stored successfully. Stored ID:', result.id);
      
      // Verify it was stored
      const verifyStored = sessionStorage.getItem('examResult');
      if (verifyStored) {
        const parsed = JSON.parse(verifyStored);
        console.log('Verified stored result ID:', parsed.id);
      }
    } catch (error) {
      console.error('Error storing result:', error);
      return;
    }

    // Navigate to results using window.location for more reliable navigation
    const resultsUrl = `/exam/results/${result.id}`;
    console.log('Navigating to results page:', resultsUrl);
    window.location.href = resultsUrl;
  }, [examState]);

  // Timer countdown
  useEffect(() => {
    if (!examState || examState.config.timeLimit === 0 || isPaused) return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [examState, handleSubmit, isPaused]);

  // Save exam state when it changes
  useEffect(() => {
    if (examState) {
      sessionStorage.setItem('currentExam', JSON.stringify(examState));
    }
  }, [examState]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (answerIndex: number) => {
    if (!examState) return;

    const currentQuestion = examState.questions[currentIndex];
    const newAnswers = currentQuestion.multipleAnswers
      ? toggleAnswer(examState.userAnswers[currentQuestion.id] || [], answerIndex)
      : [answerIndex];

    setExamState({
      ...examState,
      userAnswers: {
        ...examState.userAnswers,
        [currentQuestion.id]: newAnswers
      }
    });
  };

  const toggleAnswer = (current: number[], index: number): number[] => {
    if (current.includes(index)) {
      return current.filter(i => i !== index);
    }
    return [...current, index];
  };

  const handleNext = () => {
    if (currentIndex < (examState?.questions.length || 0) - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleMarkForReview = () => {
    if (!examState) return;

    const currentQuestion = examState.questions[currentIndex];
    const marked = examState.markedForReview.includes(currentQuestion.id);

    setExamState({
      ...examState,
      markedForReview: marked
        ? examState.markedForReview.filter(id => id !== currentQuestion.id)
        : [...examState.markedForReview, currentQuestion.id]
    });
  };

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
  };

  const handleExit = () => {
    sessionStorage.removeItem('currentExam');
    router.push('/');
  };

  if (!examState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p>Loading exam...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = examState.questions[currentIndex];
  const userAnswer = examState.userAnswers[currentQuestion.id] || [];
  const isMarked = examState.markedForReview.includes(currentQuestion.id);
  const answeredCount = Object.keys(examState.userAnswers).length;
  const progressPercentage = (answeredCount / examState.questions.length) * 100;

  const timerColor = timeRemaining > 900 ? 'text-gray-700' : timeRemaining > 300 ? 'text-orange-600' : 'text-red-600';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-900">AWS Cloud Practitioner Practice Exam</h1>
              <p className="text-sm text-gray-500">
                Question {currentIndex + 1} of {examState.questions.length}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Timer */}
              {examState.config.timeLimit > 0 && (
                <div className="flex items-center gap-3">
                  <div className={`text-2xl font-mono font-bold ${timerColor}`}>
                    {formatTime(timeRemaining)}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePauseResume}
                  >
                    {isPaused ? '▶️ Resume' : '⏸️ Pause'}
                  </Button>
                </div>
              )}
              
              {/* Exit Button */}
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowExitDialog(true)}
              >
                🚪 Exit
              </Button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>{answeredCount} answered</span>
              <span>{examState.markedForReview.length} marked for review</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">
                Question {currentIndex + 1} of {examState.questions.length}
              </CardTitle>
              <Button
                variant={isMarked ? "default" : "outline"}
                size="sm"
                onClick={handleMarkForReview}
              >
                {isMarked ? '🚩 Marked' : '🏳️ Mark for Review'}
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Question Text */}
            <div className="text-lg leading-relaxed">
              <p className="mb-2">{currentQuestion.questionText}</p>
              {currentQuestion.multipleAnswers && (
                <p className="text-sm text-amber-600 font-semibold">
                  (Select ALL that apply)
                </p>
              )}
            </div>

            {/* Answer Options */}
            <div className="space-y-3">
              {currentQuestion.multipleAnswers ? (
                // Multiple choice (checkboxes)
                currentQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <Checkbox
                      id={`option-${index}`}
                      checked={userAnswer.includes(index)}
                      onCheckedChange={() => handleAnswerChange(index)}
                    />
                    <Label
                      htmlFor={`option-${index}`}
                      className="flex-1 cursor-pointer text-base"
                    >
                      {option}
                    </Label>
                  </div>
                ))
              ) : (
                // Single choice (radio buttons)
                <RadioGroup 
                  key={`${currentQuestion.id}-radiogroup`}
                  value={userAnswer.length > 0 ? userAnswer[0]?.toString() : undefined} 
                  onValueChange={(val) => handleAnswerChange(parseInt(val))}
                >
                  {currentQuestion.options.map((option, index) => (
                    <div key={`${currentQuestion.id}-option-${index}`} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value={index.toString()} id={`${currentQuestion.id}-option-${index}`} />
                      <Label htmlFor={`${currentQuestion.id}-option-${index}`} className="flex-1 cursor-pointer text-base">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
            </div>

            {/* Study Mode: Show Answer Button */}
            {examState.config.mode === 'study' && userAnswer.length > 0 && (
              <div className="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-3">Explanation:</h4>
                <p className="text-blue-800 mb-4">{currentQuestion.explanation}</p>
                <div className="text-sm">
                  <p className="text-blue-700">
                    <strong>Source:</strong> <a href={currentQuestion.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">{currentQuestion.sourceName}</a>
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="max-w-4xl mx-auto mt-6 flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            ← Previous
          </Button>

          <div className="flex gap-4">
            {currentIndex === examState.questions.length - 1 ? (
              <Button onClick={() => setShowSubmitDialog(true)} size="lg">
                Submit Exam
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Next →
              </Button>
            )}
          </div>
        </div>
      </main>

      {/* Submit Dialog */}
      {showSubmitDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Submit Exam?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Are you sure you want to submit your exam?</p>
              <p className="text-sm text-gray-600">
                You have answered {answeredCount} of {examState.questions.length} questions.
                {examState.questions.length - answeredCount > 0 && (
                  <span className="text-amber-600 font-semibold">
                    {' '}{examState.questions.length - answeredCount} questions are unanswered.
                  </span>
                )}
              </p>
              {examState.config.timeLimit > 0 && (
                <p className="text-sm text-gray-600">
                  Time remaining: <span className="font-semibold">{formatTime(timeRemaining)}</span>
                </p>
              )}
              <div className="flex gap-4 mt-6">
                <Button variant="outline" onClick={() => setShowSubmitDialog(false)} className="flex-1">
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    debugger;
                    console.log('Submit button clicked!');
                    handleSubmit();
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Yes, Submit
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Exit Dialog */}
      {showExitDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Exit Exam?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-red-600 font-semibold">⚠️ Warning: Your progress will be lost!</p>
              <p>Are you sure you want to exit? All your answers will be discarded.</p>
              <div className="flex gap-4 mt-6">
                <Button variant="outline" onClick={() => setShowExitDialog(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleExit} variant="destructive" className="flex-1">
                  Yes, Exit
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Paused Overlay */}
      {isPaused && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-40">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle className="text-center text-2xl">⏸️ Exam Paused</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-lg">Take a break! Click Resume when you&apos;re ready to continue.</p>
              <Button onClick={handlePauseResume} size="lg" className="w-full">
                ▶️ Resume Exam
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}


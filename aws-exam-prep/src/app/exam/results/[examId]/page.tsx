'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ExamResult } from '@/lib/types';

export default function ResultsPage({ params }: { params: Promise<{ examId: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [result, setResult] = useState<ExamResult | null>(null);
  const [showDetailedReview, setShowDetailedReview] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'correct' | 'incorrect'>('all');

  useEffect(() => {
    console.log('Results page loading for examId:', resolvedParams.examId);
    const stored = sessionStorage.getItem('examResult');
    console.log('Stored examResult:', stored ? 'Found' : 'Not found');
    
    if (stored) {
      const examResult = JSON.parse(stored) as ExamResult;
      console.log('Parsed examResult ID:', examResult.id);
      console.log('Expected examId:', resolvedParams.examId);
      console.log('IDs match:', examResult.id === resolvedParams.examId);
      
      if (examResult.id === resolvedParams.examId) {
        console.log('Setting result state');
        setResult(examResult);
        
        // Save to exam history
        saveToHistory(examResult);
      } else {
        console.error('ID mismatch! Redirecting to home');
        router.push('/');
      }
    } else {
      console.error('No examResult in sessionStorage! Redirecting to home');
      router.push('/');
    }
  }, [resolvedParams.examId, router]);

  // Save exam result to persistent history
  const saveToHistory = async (examResult: ExamResult) => {
    try {
      const response = await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(examResult)
      });
      
      const data = await response.json();
      if (data.success) {
        console.log('✅ Exam saved to history');
      } else {
        console.error('❌ Failed to save to history:', data.message);
      }
    } catch (error) {
      console.error('❌ Error saving to history:', error);
    }
  };

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p>Loading results...</p>
        </div>
      </div>
    );
  }

  const isPassed = result.score.passFail === 'pass';

  // Filter questions based on review filter
  const filteredQuestions = reviewFilter === 'all' 
    ? result.questions 
    : reviewFilter === 'correct'
    ? result.questions.filter(q => q.isCorrect)
    : result.questions.filter(q => !q.isCorrect);

  if (showDetailedReview) {
    // Handle case where there are no questions in the filtered category
    if (filteredQuestions.length === 0) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="pt-8 text-center">
              <h2 className="text-2xl font-bold mb-4">No Questions Found</h2>
              <p className="text-gray-600 mb-6">
                {reviewFilter === 'correct' 
                  ? "You didn't get any questions correct. Review the incorrect answers to improve!"
                  : "Great job! You got all questions correct!"}
              </p>
              <Button onClick={() => {
                setShowDetailedReview(false);
                setReviewFilter('all');
                setReviewIndex(0);
              }}>
                Back to Summary
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    const attempt = filteredQuestions[reviewIndex];
    const isCorrect = attempt.isCorrect;

    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-xl font-bold">Detailed Review</h1>
                {reviewFilter !== 'all' && (
                  <p className="text-sm text-gray-600 mt-1">
                    Showing {reviewFilter === 'correct' ? 'Correct' : 'Incorrect'} Answers Only
                    <button 
                      onClick={() => {
                        setReviewFilter('all');
                        setReviewIndex(0);
                      }}
                      className="ml-2 text-indigo-600 hover:text-indigo-800 underline"
                    >
                      Show All
                    </button>
                  </p>
                )}
              </div>
              <Button variant="outline" onClick={() => {
                setShowDetailedReview(false);
                setReviewFilter('all');
                setReviewIndex(0);
              }}>
                ← Back to Summary
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>
                  Question {reviewIndex + 1} of {filteredQuestions.length}
                </CardTitle>
                <span className={`px-4 py-2 rounded-full font-semibold ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                </span>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Question Text */}
              <div>
                <p className="text-lg mb-2">{attempt.question.questionText}</p>
                {attempt.question.multipleAnswers && (
                  <p className="text-sm text-amber-600">(Select ALL that apply)</p>
                )}
              </div>

              {/* Answer Options */}
              <div className="space-y-3">
                {attempt.question.options.map((option, index) => {
                  const isCorrectAnswer = attempt.correctAnswers.includes(index);
                  const isUserAnswer = attempt.userAnswers.includes(index);
                  
                  let bgColor = 'bg-white';
                  let borderColor = 'border-gray-200';
                  let icon = '';

                  if (isCorrectAnswer) {
                    bgColor = 'bg-green-50';
                    borderColor = 'border-green-500';
                    icon = '✓';
                  }
                  if (isUserAnswer && !isCorrectAnswer) {
                    bgColor = 'bg-red-50';
                    borderColor = 'border-red-500';
                    icon = '✗';
                  }

                  return (
                    <div
                      key={index}
                      className={`p-4 border-2 rounded-lg ${bgColor} ${borderColor}`}
                    >
                      <div className="flex items-start gap-3">
                        {icon && <span className="text-xl font-bold">{icon}</span>}
                        <div className="flex-1">
                          <p>{option}</p>
                          {isCorrectAnswer && (
                            <p className="text-sm text-green-700 mt-1">Correct Answer</p>
                          )}
                          {isUserAnswer && !isCorrectAnswer && (
                            <p className="text-sm text-red-700 mt-1">Your Answer</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Explanation */}
              <div className="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-3">Explanation:</h4>
                <p className="text-blue-800 mb-4">{attempt.question.explanation}</p>
                <div className="text-sm">
                  <p className="text-blue-700">
                    <strong>Domain:</strong> {attempt.question.domain} • <strong>Topic:</strong> {attempt.question.topic}
                  </p>
                  <p className="text-blue-700 mt-2">
                    <strong>Source:</strong>{' '}
                    <a 
                      href={attempt.question.sourceUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="underline hover:text-blue-900"
                    >
                      {attempt.question.sourceName}
                    </a>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="max-w-4xl mx-auto mt-6 flex justify-between">
            <Button
              variant="outline"
              onClick={() => setReviewIndex(Math.max(0, reviewIndex - 1))}
              disabled={reviewIndex === 0}
            >
              ← Previous
            </Button>
            <Button
              onClick={() => setReviewIndex(Math.min(filteredQuestions.length - 1, reviewIndex + 1))}
              disabled={reviewIndex === filteredQuestions.length - 1}
            >
              Next →
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Exam Results</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Score Card */}
        <Card className={`max-w-4xl mx-auto mb-8 ${isPassed ? 'border-green-500 border-2' : 'border-red-500 border-2'}`}>
          <CardContent className="pt-8">
            <div className="text-center">
              {/* Pass/Fail Badge */}
              <div className={`inline-block px-12 py-6 rounded-2xl mb-6 ${isPassed ? 'bg-green-100' : 'bg-red-100'}`}>
                <h2 className={`text-5xl font-bold ${isPassed ? 'text-green-800' : 'text-red-800'}`}>
                  {isPassed ? 'PASS' : 'FAIL'}
                </h2>
              </div>

              {/* Scaled Score */}
              <div className="mb-8">
                <p className="text-gray-600 text-lg mb-2">Your Score</p>
                <p className={`text-6xl font-bold ${isPassed ? 'text-green-600' : 'text-red-600'}`}>
                  {result.score.scaledScore}
                </p>
                <p className="text-gray-500 mt-2">Passing score: 700</p>
              </div>

              {/* Performance Summary */}
              <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto mb-8">
                <button 
                  onClick={() => {
                    setReviewFilter('correct');
                    setReviewIndex(0);
                    setShowDetailedReview(true);
                  }}
                  className="p-4 bg-green-50 hover:bg-green-100 border-2 border-green-200 hover:border-green-400 rounded-lg transition-all cursor-pointer text-left"
                >
                  <p className="text-3xl font-bold text-green-700">{result.score.correctAnswers}</p>
                  <p className="text-sm text-green-600">Correct Answers</p>
                  <p className="text-xs text-green-500 mt-1">Click to review →</p>
                </button>
                <button 
                  onClick={() => {
                    setReviewFilter('incorrect');
                    setReviewIndex(0);
                    setShowDetailedReview(true);
                  }}
                  className="p-4 bg-red-50 hover:bg-red-100 border-2 border-red-200 hover:border-red-400 rounded-lg transition-all cursor-pointer text-left"
                >
                  <p className="text-3xl font-bold text-red-700">{result.score.incorrectAnswers}</p>
                  <p className="text-sm text-red-600">Incorrect Answers</p>
                  <p className="text-xs text-red-500 mt-1">Click to review →</p>
                </button>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-3xl font-bold text-gray-900">{Math.round(result.score.percentageScore)}%</p>
                  <p className="text-sm text-gray-600">Overall Score</p>
                </div>
              </div>

              {/* Time Taken */}
              <p className="text-gray-600">
                Time taken: <span className="font-semibold">{Math.floor(result.timeTaken / 60)} minutes {Math.round(result.timeTaken % 60)} seconds</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Domain Breakdown */}
        <Card className="max-w-4xl mx-auto mb-8">
          <CardHeader>
            <CardTitle>Score by Domain</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Cloud Concepts */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">Cloud Concepts</span>
                <span className="text-gray-600">
                  {result.score.domainScores.cloudConcepts.correctInDomain} / {result.score.domainScores.cloudConcepts.questionsInDomain}
                  {' '}({Math.round(result.score.domainScores.cloudConcepts.percentageScore)}%)
                </span>
              </div>
              <Progress value={result.score.domainScores.cloudConcepts.percentageScore} className="h-3" />
            </div>

            {/* Security */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">Security & Compliance</span>
                <span className="text-gray-600">
                  {result.score.domainScores.security.correctInDomain} / {result.score.domainScores.security.questionsInDomain}
                  {' '}({Math.round(result.score.domainScores.security.percentageScore)}%)
                </span>
              </div>
              <Progress value={result.score.domainScores.security.percentageScore} className="h-3" />
            </div>

            {/* Technology */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">Technology</span>
                <span className="text-gray-600">
                  {result.score.domainScores.technology.correctInDomain} / {result.score.domainScores.technology.questionsInDomain}
                  {' '}({Math.round(result.score.domainScores.technology.percentageScore)}%)
                </span>
              </div>
              <Progress value={result.score.domainScores.technology.percentageScore} className="h-3" />
            </div>

            {/* Billing */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">Billing & Pricing</span>
                <span className="text-gray-600">
                  {result.score.domainScores.billing.correctInDomain} / {result.score.domainScores.billing.questionsInDomain}
                  {' '}({Math.round(result.score.domainScores.billing.percentageScore)}%)
                </span>
              </div>
              <Progress value={result.score.domainScores.billing.percentageScore} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="max-w-4xl mx-auto flex gap-4 justify-center">
          <Button size="lg" onClick={() => {
            setReviewFilter('all');
            setReviewIndex(0);
            setShowDetailedReview(true);
          }}>
            Review All Answers
          </Button>
          <Button size="lg" variant="outline" onClick={() => router.push('/')}>
            Take New Exam
          </Button>
        </div>
      </main>
    </div>
  );
}


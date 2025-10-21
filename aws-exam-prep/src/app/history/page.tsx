'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calendar, Clock, Target, TrendingUp, Trash2 } from 'lucide-react';
import { ExamResult } from '@/lib/types';
import { format } from 'date-fns';

export default function HistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalExams: 0,
    averageScore: 0,
    passRate: 0,
    totalQuestions: 0,
    bestScore: 0,
    recentScore: 0
  });

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const response = await fetch('/api/history');
      const data = await response.json();
      
      if (data.success) {
        const exams = data.data as ExamResult[];
        setHistory(exams);
        calculateStats(exams);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (exams: ExamResult[]) => {
    if (exams.length === 0) {
      return;
    }

    const totalExams = exams.length;
    const passedExams = exams.filter(e => e.score.passFail === 'pass').length;
    const totalQuestions = exams.reduce((sum, e) => sum + e.score.totalQuestions, 0);
    const averageScore = exams.reduce((sum, e) => sum + e.score.percentageScore, 0) / totalExams;
    const bestScore = Math.max(...exams.map(e => e.score.percentageScore));
    const recentScore = exams[0]?.score.percentageScore || 0;

    setStats({
      totalExams,
      averageScore: Math.round(averageScore),
      passRate: Math.round((passedExams / totalExams) * 100),
      totalQuestions,
      bestScore: Math.round(bestScore),
      recentScore: Math.round(recentScore)
    });
  };

  const clearHistory = async () => {
    if (!confirm('Are you sure you want to clear all exam history? This cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch('/api/history', {
        method: 'DELETE'
      });
      
      const data = await response.json();
      if (data.success) {
        setHistory([]);
        setStats({
          totalExams: 0,
          averageScore: 0,
          passRate: 0,
          totalQuestions: 0,
          bestScore: 0,
          recentScore: 0
        });
        alert('History cleared successfully');
      }
    } catch (error) {
      console.error('Error clearing history:', error);
      alert('Failed to clear history');
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m ${secs}s`;
  };

  const getExamModeLabel = (mode: string) => {
    switch (mode) {
      case 'full': return 'Full Practice Exam';
      case 'quick': return 'Quick Practice';
      case 'study': return 'Study Mode';
      default: return mode;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p>Loading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => router.push('/')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back Home
              </Button>
              <h1 className="text-3xl font-bold text-gray-900">Exam History</h1>
            </div>
            {history.length > 0 && (
              <Button variant="destructive" size="sm" onClick={clearHistory}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear History
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {history.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Exam History Yet</h2>
            <p className="text-gray-600 mb-8">
              Take your first practice exam to start tracking your progress!
            </p>
            <Button size="lg" onClick={() => router.push('/')}>
              Start Your First Exam
            </Button>
          </div>
        ) : (
          <>
            {/* Statistics Overview */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-indigo-600">{stats.totalExams}</p>
                    <p className="text-sm text-gray-600 mt-1">Total Exams</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600">{stats.averageScore}%</p>
                    <p className="text-sm text-gray-600 mt-1">Avg Score</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">{stats.passRate}%</p>
                    <p className="text-sm text-gray-600 mt-1">Pass Rate</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-purple-600">{stats.totalQuestions}</p>
                    <p className="text-sm text-gray-600 mt-1">Questions</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-amber-600">{stats.bestScore}%</p>
                    <p className="text-sm text-gray-600 mt-1">Best Score</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-teal-600">{stats.recentScore}%</p>
                    <p className="text-sm text-gray-600 mt-1">Recent</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Exam History List */}
            <Card>
              <CardHeader>
                <CardTitle>Your Exam Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {history.map((exam, index) => (
                    <div
                      key={exam.id}
                      className={`p-6 border-2 rounded-lg ${
                        exam.score.passFail === 'pass'
                          ? 'border-green-200 bg-green-50 hover:bg-green-100'
                          : 'border-red-200 bg-red-50 hover:bg-red-100'
                      } transition-colors cursor-pointer`}
                      onClick={() => {
                        // Store the exam result and navigate to results page
                        sessionStorage.setItem('examResult', JSON.stringify(exam));
                        router.push(`/exam/results/${exam.id}`);
                      }}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        {/* Left: Exam Info */}
                        <div className="flex-1 min-w-[200px]">
                          <div className="flex items-center gap-3 mb-2">
                            <span
                              className={`px-4 py-1 rounded-full text-sm font-semibold ${
                                exam.score.passFail === 'pass'
                                  ? 'bg-green-200 text-green-800'
                                  : 'bg-red-200 text-red-800'
                              }`}
                            >
                              {exam.score.passFail === 'pass' ? '✓ PASS' : '✗ FAIL'}
                            </span>
                            <span className="text-sm text-gray-600">
                              {getExamModeLabel(exam.examMode)}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {format(new Date(exam.timestamp), 'MMM d, yyyy')}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {formatDuration(exam.timeTaken)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Target className="h-4 w-4" />
                              {exam.score.totalQuestions} Questions
                            </div>
                          </div>
                        </div>

                        {/* Right: Score Display */}
                        <div className="text-right">
                          <div className="text-4xl font-bold text-gray-900 mb-1">
                            {Math.round(exam.score.percentageScore)}%
                          </div>
                          <div className="text-sm text-gray-600">
                            {exam.score.correctAnswers} / {exam.score.totalQuestions} correct
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Scaled: {exam.score.scaledScore} / 1000
                          </div>
                        </div>
                      </div>

                      {/* Domain Breakdown (Compact) */}
                      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                        <div className="bg-white/50 p-2 rounded">
                          <span className="font-medium">Cloud:</span>{' '}
                          {exam.score.domainScores.cloudConcepts.correctInDomain}/
                          {exam.score.domainScores.cloudConcepts.questionsInDomain} (
                          {Math.round(exam.score.domainScores.cloudConcepts.percentageScore)}%)
                        </div>
                        <div className="bg-white/50 p-2 rounded">
                          <span className="font-medium">Security:</span>{' '}
                          {exam.score.domainScores.security.correctInDomain}/
                          {exam.score.domainScores.security.questionsInDomain} (
                          {Math.round(exam.score.domainScores.security.percentageScore)}%)
                        </div>
                        <div className="bg-white/50 p-2 rounded">
                          <span className="font-medium">Tech:</span>{' '}
                          {exam.score.domainScores.technology.correctInDomain}/
                          {exam.score.domainScores.technology.questionsInDomain} (
                          {Math.round(exam.score.domainScores.technology.percentageScore)}%)
                        </div>
                        <div className="bg-white/50 p-2 rounded">
                          <span className="font-medium">Billing:</span>{' '}
                          {exam.score.domainScores.billing.correctInDomain}/
                          {exam.score.domainScores.billing.questionsInDomain} (
                          {Math.round(exam.score.domainScores.billing.percentageScore)}%)
                        </div>
                      </div>

                      <div className="mt-3 text-xs text-gray-500 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        Click to view detailed results
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance Insights */}
            {history.length >= 3 && (
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>Performance Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">📈 Progress Trend</h4>
                      <p className="text-sm text-blue-800">
                        {history[0].score.percentageScore > history[2].score.percentageScore
                          ? '🎉 Great job! Your scores are improving over time!'
                          : '💪 Keep practicing! Consistency is key to success.'}
                      </p>
                    </div>

                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-semibold text-purple-900 mb-2">🎯 Recommendation</h4>
                      <p className="text-sm text-purple-800">
                        {stats.averageScore >= 70
                          ? "You're ready for the exam! Keep reviewing weak areas."
                          : 'Focus on understanding core AWS concepts and practice more.'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>
    </div>
  );
}


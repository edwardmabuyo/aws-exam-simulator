'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { BarChart3 } from 'lucide-react';
import { ExamConfig } from '@/lib/types';

export default function Home() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [fullExamCount, setFullExamCount] = useState('50');
  const [quickExamCount, setQuickExamCount] = useState('20');
  const [studyExamCount, setStudyExamCount] = useState('10');

  const startExam = async (mode: 'full' | 'quick' | 'study', customCount?: number) => {
    setIsCreating(true);
    try {
      let config: ExamConfig;
      
      if (mode === 'full') {
        config = {
          mode: 'full',
          questionCount: customCount || parseInt(fullExamCount),
          timeLimit: Math.round((customCount || parseInt(fullExamCount)) * 1.8 * 60), // 1.8 min per question
          randomize: true
        };
      } else if (mode === 'quick') {
        config = {
          mode: 'quick',
          questionCount: customCount || parseInt(quickExamCount),
          timeLimit: Math.round((customCount || parseInt(quickExamCount)) * 1.4 * 60), // 1.4 min per question
          randomize: true
        };
      } else {
        const isAllQuestions = studyExamCount === 'all';
        const studyQuestionCount = isAllQuestions ? 99999 : (customCount || parseInt(studyExamCount));
        config = {
          mode: 'study',
          questionCount: studyQuestionCount,
          timeLimit: 0, // Untimed
          randomize: !isAllQuestions // Don't randomize if ALL questions selected
        };
      }
      
      const response = await fetch('/api/exam/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });

      const result = await response.json();
      
      if (result.success) {
        // Store exam state in sessionStorage and navigate
        sessionStorage.setItem('currentExam', JSON.stringify(result.data));
        router.push(`/exam/${result.data.id}`);
      }
    } catch (error) {
      console.error('Error starting exam:', error);
      alert('Failed to start exam. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-16">
        {/* Header with History Button */}
        <div className="relative">
          <div className="absolute top-0 right-0">
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => router.push('/history')}
              className="flex items-center gap-2 shadow-md hover:shadow-lg transition-shadow"
            >
              <BarChart3 className="h-5 w-5" />
              Exam History
            </Button>
          </div>
          
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              AWS Cloud Practitioner
            </h1>
            <h2 className="text-3xl font-semibold text-indigo-600 mb-6">
              Exam Preparation
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Practice with 1,139 verified questions and realistic exam simulation
            </p>
          </div>
        </div>

        {/* Exam Mode Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Full Practice Exam */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-2xl">Full Practice Exam</CardTitle>
              <CardDescription>
                Timed exam simulation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="text-sm text-gray-600 space-y-2">
                <li>✓ Realistic exam simulation</li>
                <li>✓ Timed assessment</li>
                <li>✓ Domain-weighted questions</li>
                <li>✓ Complete performance analysis</li>
              </ul>
              
              <div className="space-y-2">
                <Label htmlFor="full-count">Number of Questions</Label>
                <Select value={fullExamCount} onValueChange={setFullExamCount}>
                  <SelectTrigger id="full-count">
                    <SelectValue placeholder="Select count" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 questions (~18 min)</SelectItem>
                    <SelectItem value="20">20 questions (~36 min)</SelectItem>
                    <SelectItem value="30">30 questions (~54 min)</SelectItem>
                    <SelectItem value="40">40 questions (~72 min)</SelectItem>
                    <SelectItem value="50">50 questions (~90 min)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                className="w-full" 
                size="lg"
                onClick={() => startExam('full')}
                disabled={isCreating}
              >
                {isCreating ? 'Starting...' : 'Start Full Exam'}
              </Button>
            </CardContent>
          </Card>

          {/* Quick Practice */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-2xl">Quick Practice</CardTitle>
              <CardDescription>
                Timed practice session
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="text-sm text-gray-600 space-y-2">
                <li>✓ Faster practice sessions</li>
                <li>✓ Timed assessment</li>
                <li>✓ Perfect for daily review</li>
                <li>✓ Score tracking</li>
              </ul>
              
              <div className="space-y-2">
                <Label htmlFor="quick-count">Number of Questions</Label>
                <Select value={quickExamCount} onValueChange={setQuickExamCount}>
                  <SelectTrigger id="quick-count">
                    <SelectValue placeholder="Select count" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 questions (~7 min)</SelectItem>
                    <SelectItem value="10">10 questions (~14 min)</SelectItem>
                    <SelectItem value="15">15 questions (~21 min)</SelectItem>
                    <SelectItem value="20">20 questions (~28 min)</SelectItem>
                    <SelectItem value="25">25 questions (~35 min)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                className="w-full" 
                size="lg"
                variant="outline"
                onClick={() => startExam('quick')}
                disabled={isCreating}
              >
                {isCreating ? 'Starting...' : 'Start Quick Practice'}
              </Button>
            </CardContent>
          </Card>

          {/* Study Mode */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-2xl">Study Mode</CardTitle>
              <CardDescription>
                Untimed learning
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="text-sm text-gray-600 space-y-2">
                <li>✓ Learn at your own pace</li>
                <li>✓ Immediate feedback</li>
                <li>✓ Detailed explanations</li>
                <li>✓ Source references</li>
              </ul>
              
              <div className="space-y-2">
                <Label htmlFor="study-count">Number of Questions</Label>
                <Select value={studyExamCount} onValueChange={setStudyExamCount}>
                  <SelectTrigger id="study-count">
                    <SelectValue placeholder="Select count" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 questions</SelectItem>
                    <SelectItem value="10">10 questions</SelectItem>
                    <SelectItem value="15">15 questions</SelectItem>
                    <SelectItem value="20">20 questions</SelectItem>
                    <SelectItem value="30">30 questions</SelectItem>
                    <SelectItem value="all">ALL questions (1,347)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                className="w-full" 
                size="lg"
                variant="secondary"
                onClick={() => startExam('study')}
                disabled={isCreating}
              >
                {isCreating ? 'Starting...' : 'Start Study Mode'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-semibold text-gray-900 mb-8">Why Practice With Us?</h3>
          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <div className="p-6 bg-white rounded-lg shadow">
              <div className="text-3xl mb-3">📚</div>
              <h4 className="font-semibold mb-2">1,139 Questions</h4>
              <p className="text-sm text-gray-600">Verified from official AWS sources</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow">
              <div className="text-3xl mb-3">⏱️</div>
              <h4 className="font-semibold mb-2">Realistic Timer</h4>
              <p className="text-sm text-gray-600">Matches actual exam conditions</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow">
              <div className="text-3xl mb-3">📊</div>
              <h4 className="font-semibold mb-2">Detailed Analytics</h4>
              <p className="text-sm text-gray-600">Track your progress over time</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow">
              <div className="text-3xl mb-3">✨</div>
              <h4 className="font-semibold mb-2">100% Free</h4>
              <p className="text-sm text-gray-600">No hidden costs or limits</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-sm text-gray-500">
          <p>This is an unofficial practice tool. Not affiliated with Amazon Web Services.</p>
          <p className="mt-2">Questions are sourced from official AWS documentation and reputable training materials.</p>
        </div>
      </div>
    </div>
  );
}

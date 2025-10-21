// Result Models

import { DomainType } from './question.types';
import { ExamConfig, QuestionAttempt } from './exam.types';

export interface ExamResult {
  id: string;
  timestamp: number;
  examMode: 'full' | 'quick' | 'study';
  configuration: ExamConfig;
  questions: QuestionAttempt[];
  score: ScoreBreakdown;
  timeTaken: number;
  averageTimePerQuestion: number;
  completed: boolean;
  submittedAt: number;
}

export interface ScoreBreakdown {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unansweredQuestions: number;
  rawScore: number;
  percentageScore: number;
  scaledScore: number; // 100-1000 (AWS style)
  passFail: 'pass' | 'fail';
  domainScores: DomainScores;
}

export interface DomainScores {
  cloudConcepts: DomainScore;
  security: DomainScore;
  technology: DomainScore;
  billing: DomainScore;
}

export interface DomainScore {
  domain: DomainType;
  questionsInDomain: number;
  correctInDomain: number;
  percentageScore: number;
  scaledScore: number;
}

export interface ExamHistory {
  results: ExamResult[];
  statistics: HistoryStatistics;
  lastUpdated: number;
}

export interface HistoryStatistics {
  totalExams: number;
  totalQuestions: number;
  averageScore: number;
  bestScore: number;
  worstScore: number;
  passRate: number;
  averageTimePerExam: number;
  improvementRate: number;
  domainAverages: DomainScores;
  recentTrend: 'improving' | 'declining' | 'stable';
  estimatedReadiness: number;
}


// Exam Models

import { DomainType, DifficultyLevel, Question } from './question.types';

export interface ExamConfig {
  mode: 'full' | 'quick' | 'study';
  questionCount: number;
  timeLimit: number; // in seconds, 0 for untimed
  domainFilter?: DomainType;
  difficultyFilter?: DifficultyLevel;
  includeOnlyIncorrect?: boolean;
  includeBookmarked?: boolean;
  randomize: boolean;
}

export interface ExamState {
  id: string;
  config: ExamConfig;
  questions: Question[];
  currentQuestionIndex: number;
  userAnswers: Record<string, number[]>;
  markedForReview: string[];
  startTime: number;
  endTime: number | null;
  timerState: TimerState;
  isComplete: boolean;
  questionStartTimes: Record<string, number>;
}

export interface TimerState {
  startTime: number;
  duration: number;
  remainingTime: number;
  isRunning: boolean;
  isPaused: boolean;
  warnings: {
    fifteenMinute: boolean;
    fiveMinute: boolean;
  };
}

export interface QuestionAttempt {
  questionId: string;
  question: Question;
  userAnswers: number[];
  correctAnswers: number[];
  isCorrect: boolean;
  timeSpent: number;
  wasMarkedForReview: boolean;
  domain: DomainType;
}


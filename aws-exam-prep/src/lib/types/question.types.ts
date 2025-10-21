// Question Models

export type DomainType = 'cloud-concepts' | 'security' | 'technology' | 'billing';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctAnswers: number[];
  multipleAnswers: boolean;
  explanation: string;
  domain: DomainType;
  topic: string;
  difficulty?: DifficultyLevel;
  sourceUrl: string;
  sourceName: string;
  tags: string[];
  metadata?: {
    createdAt?: number;
    updatedAt?: number;
    version?: string;
  };
}

export interface QuestionBank {
  version: string;
  lastUpdated: number;
  totalQuestions: number;
  domainDistribution: Record<DomainType, number>;
  questions: Question[];
}


// Question Service - Handles loading and managing questions

import { Question, QuestionBank, DomainType } from '../types';
import cloudConceptsData from '../../../data/questions/cloud-concepts.json';
import securityData from '../../../data/questions/security.json';
import technologyData from '../../../data/questions/technology.json';
import billingData from '../../../data/questions/billing.json';

class QuestionService {
  private allQuestions: Question[] = [];
  private questionsByDomain: Record<DomainType, Question[]> = {
    'cloud-concepts': [],
    'security': [],
    'technology': [],
    'billing': []
  };

  constructor() {
    this.loadAllQuestions();
  }

  /**
   * Load all questions from JSON files
   */
  private loadAllQuestions(): void {
    try {
      // Load questions from each domain
      const domains = [
        { data: cloudConceptsData, domain: 'cloud-concepts' as DomainType },
        { data: securityData, domain: 'security' as DomainType },
        { data: technologyData, domain: 'technology' as DomainType },
        { data: billingData, domain: 'billing' as DomainType }
      ];

      domains.forEach(({ data, domain }) => {
        // The new JSON files are arrays directly, not objects with a questions field
        const questions = (Array.isArray(data) ? data : []) as Question[];
        this.questionsByDomain[domain] = questions;
        this.allQuestions.push(...questions);
      });

      console.log(`Loaded ${this.allQuestions.length} questions total`);
    } catch (error) {
      console.error('Error loading questions:', error);
      throw new Error('Failed to load question bank');
    }
  }

  /**
   * Get all questions
   */
  getAllQuestions(): Question[] {
    return [...this.allQuestions];
  }

  /**
   * Get questions by domain
   */
  getQuestionsByDomain(domain: DomainType): Question[] {
    return [...this.questionsByDomain[domain]];
  }

  /**
   * Get a specific question by ID
   */
  getQuestionById(id: string): Question | undefined {
    return this.allQuestions.find(q => q.id === id);
  }

  /**
   * Get total question count
   */
  getTotalQuestionCount(): number {
    return this.allQuestions.length;
  }

  /**
   * Get question count by domain
   */
  getQuestionCountByDomain(domain: DomainType): number {
    return this.questionsByDomain[domain].length;
  }

  /**
   * Get question bank metadata
   */
  getQuestionBank(): QuestionBank {
    return {
      version: '1.0.0',
      lastUpdated: Date.now(),
      totalQuestions: this.allQuestions.length,
      domainDistribution: {
        'cloud-concepts': this.questionsByDomain['cloud-concepts'].length,
        'security': this.questionsByDomain['security'].length,
        'technology': this.questionsByDomain['technology'].length,
        'billing': this.questionsByDomain['billing'].length
      },
      questions: this.allQuestions
    };
  }

  /**
   * Validate question structure
   */
  validateQuestion(question: Question): boolean {
    return !!(
      question.id &&
      question.questionText &&
      question.options &&
      question.options.length >= 2 &&
      question.correctAnswers &&
      question.correctAnswers.length > 0 &&
      question.domain &&
      question.explanation
    );
  }
}

// Export singleton instance
export const questionService = new QuestionService();


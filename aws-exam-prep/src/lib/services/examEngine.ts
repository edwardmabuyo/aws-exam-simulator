// Exam Engine - Handles exam creation, randomization, and configuration

import { v4 as uuidv4 } from 'uuid';
import { Question, ExamConfig, ExamState, DomainType } from '../types';
import { questionService } from './questionService';

class ExamEngine {
  /**
   * Create a new exam with the specified configuration
   */
  createExam(config: ExamConfig): ExamState {
    // Select questions based on configuration
    const questions = this.selectQuestions(config);

    // Initialize exam state
    const examState: ExamState = {
      id: uuidv4(),
      config,
      questions,
      currentQuestionIndex: 0,
      userAnswers: {},
      markedForReview: [],
      startTime: Date.now(),
      endTime: null,
      timerState: {
        startTime: Date.now(),
        duration: config.timeLimit,
        remainingTime: config.timeLimit,
        isRunning: config.timeLimit > 0,
        isPaused: false,
        warnings: {
          fifteenMinute: false,
          fiveMinute: false
        }
      },
      isComplete: false,
      questionStartTimes: {}
    };

    return examState;
  }

  /**
   * Select questions based on exam configuration
   */
  private selectQuestions(config: ExamConfig): Question[] {
    let availableQuestions: Question[];

    // Filter by domain if specified
    if (config.domainFilter) {
      availableQuestions = questionService.getQuestionsByDomain(config.domainFilter);
    } else {
      // For full and quick exams, maintain domain distribution
      if (config.mode === 'full' || config.mode === 'quick') {
        return this.selectQuestionsWithDistribution(config.questionCount);
      }
      availableQuestions = questionService.getAllQuestions();
    }

    // Filter by difficulty if specified
    if (config.difficultyFilter) {
      availableQuestions = availableQuestions.filter(
        q => q.difficulty === config.difficultyFilter
      );
    }

    // Shuffle if randomization is enabled
    if (config.randomize) {
      availableQuestions = this.shuffleArray([...availableQuestions]);
    }

    // Return the requested number of questions
    return availableQuestions.slice(0, config.questionCount);
  }

  /**
   * Select questions maintaining proper domain distribution
   * Cloud Concepts: 26%, Security: 25%, Technology: 33%, Billing: 16%
   */
  private selectQuestionsWithDistribution(totalQuestions: number): Question[] {
    const distribution = {
      'cloud-concepts': Math.round(totalQuestions * 0.26),
      'security': Math.round(totalQuestions * 0.25),
      'technology': Math.round(totalQuestions * 0.33),
      'billing': Math.round(totalQuestions * 0.16)
    };

    // Adjust to ensure we get exactly the requested number
    const sum = Object.values(distribution).reduce((a, b) => a + b, 0);
    if (sum !== totalQuestions) {
      distribution.technology += (totalQuestions - sum);
    }

    const selectedQuestions: Question[] = [];

    // Select from each domain
    Object.entries(distribution).forEach(([domain, count]) => {
      const domainQuestions = questionService.getQuestionsByDomain(domain as DomainType);
      const shuffled = this.shuffleArray([...domainQuestions]);
      selectedQuestions.push(...shuffled.slice(0, count));
    });

    // Shuffle the final selection
    return this.shuffleArray(selectedQuestions);
  }

  /**
   * Shuffle array using Fisher-Yates algorithm
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Get exam configuration presets
   */
  getExamPresets(): Record<string, ExamConfig> {
    return {
      full: {
        mode: 'full',
        questionCount: 50, // Using 50 since we have 50 questions (normally would be 65)
        timeLimit: 90 * 60, // 90 minutes in seconds
        randomize: true
      },
      quick20: {
        mode: 'quick',
        questionCount: 20,
        timeLimit: 28 * 60, // 28 minutes
        randomize: true
      },
      quick30: {
        mode: 'quick',
        questionCount: 30,
        timeLimit: 42 * 60, // 42 minutes
        randomize: true
      },
      study: {
        mode: 'study',
        questionCount: 10,
        timeLimit: 0, // No time limit
        randomize: false
      }
    };
  }
}

// Export singleton instance
export const examEngine = new ExamEngine();


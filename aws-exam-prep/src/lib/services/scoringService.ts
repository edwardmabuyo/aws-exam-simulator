// Scoring Service - Calculates exam scores and results

import { ExamState, ScoreBreakdown, DomainScore, DomainScores, QuestionAttempt, ExamResult } from '../types';
import { v4 as uuidv4 } from 'uuid';

class ScoringService {
  /**
   * Calculate exam score and results
   */
  calculateScore(examState: ExamState): ExamResult {
    const questionAttempts = this.createQuestionAttempts(examState);
    const scoreBreakdown = this.calculateScoreBreakdown(questionAttempts, examState.questions.length);
    const timeTaken = examState.endTime 
      ? (examState.endTime - examState.startTime) / 1000 
      : 0;

    const result: ExamResult = {
      id: uuidv4(),
      timestamp: Date.now(),
      examMode: examState.config.mode,
      configuration: examState.config,
      questions: questionAttempts,
      score: scoreBreakdown,
      timeTaken,
      averageTimePerQuestion: timeTaken / examState.questions.length,
      completed: true,
      submittedAt: Date.now()
    };

    return result;
  }

  /**
   * Create question attempt records
   */
  private createQuestionAttempts(examState: ExamState): QuestionAttempt[] {
    return examState.questions.map(question => {
      const userAnswers = examState.userAnswers[question.id] || [];
      const isCorrect = this.checkAnswer(userAnswers, question.correctAnswers);
      const timeSpent = this.calculateTimeSpent(question.id, examState);

      return {
        questionId: question.id,
        question,
        userAnswers,
        correctAnswers: question.correctAnswers,
        isCorrect,
        timeSpent,
        wasMarkedForReview: examState.markedForReview.includes(question.id),
        domain: question.domain
      };
    });
  }

  /**
   * Check if user's answers match correct answers
   */
  private checkAnswer(userAnswers: number[], correctAnswers: number[]): boolean {
    if (userAnswers.length !== correctAnswers.length) return false;
    
    const sortedUser = [...userAnswers].sort();
    const sortedCorrect = [...correctAnswers].sort();
    
    return sortedUser.every((answer, index) => answer === sortedCorrect[index]);
  }

  /**
   * Calculate time spent on a question
   */
  private calculateTimeSpent(questionId: string, examState: ExamState): number {
    const startTime = examState.questionStartTimes[questionId];
    if (!startTime) return 0;
    
    const endTime = examState.endTime || Date.now();
    return (endTime - startTime) / 1000; // Convert to seconds
  }

  /**
   * Calculate detailed score breakdown
   */
  private calculateScoreBreakdown(attempts: QuestionAttempt[], totalQuestions: number): ScoreBreakdown {
    const correctAnswers = attempts.filter(a => a.isCorrect).length;
    const incorrectAnswers = attempts.filter(a => !a.isCorrect && a.userAnswers.length > 0).length;
    const unansweredQuestions = attempts.filter(a => a.userAnswers.length === 0).length;
    
    const percentageScore = (correctAnswers / totalQuestions) * 100;
    const scaledScore = this.calculateScaledScore(percentageScore);
    const passFail = scaledScore >= 700 ? 'pass' : 'fail';

    const domainScores = this.calculateDomainScores(attempts);

    return {
      totalQuestions,
      correctAnswers,
      incorrectAnswers,
      unansweredQuestions,
      rawScore: correctAnswers,
      percentageScore,
      scaledScore,
      passFail,
      domainScores
    };
  }

  /**
   * Calculate AWS-style scaled score (100-1000)
   */
  private calculateScaledScore(percentageScore: number): number {
    // AWS uses a 100-1000 scale where:
    // 0% = 100, 100% = 1000
    // Formula: (percentage * 900) + 100
    return Math.round((percentageScore / 100) * 900 + 100);
  }

  /**
   * Calculate scores for each domain
   */
  private calculateDomainScores(attempts: QuestionAttempt[]): DomainScores {
    const domainAttempts = {
      cloudConcepts: attempts.filter(a => a.domain === 'cloud-concepts'),
      security: attempts.filter(a => a.domain === 'security'),
      technology: attempts.filter(a => a.domain === 'technology'),
      billing: attempts.filter(a => a.domain === 'billing')
    };

    const calculateDomainScore = (domainName: string, domainAttemptsList: QuestionAttempt[]): Omit<DomainScore, 'domain'> => {
      const questionsInDomain = domainAttemptsList.length;
      const correctInDomain = domainAttemptsList.filter(a => a.isCorrect).length;
      const percentageScore = questionsInDomain > 0 
        ? (correctInDomain / questionsInDomain) * 100 
        : 0;
      const scaledScore = this.calculateScaledScore(percentageScore);

      return {
        questionsInDomain,
        correctInDomain,
        percentageScore,
        scaledScore
      };
    };

    return {
      cloudConcepts: {
        domain: 'cloud-concepts',
        ...calculateDomainScore('cloud-concepts', domainAttempts.cloudConcepts)
      },
      security: {
        domain: 'security',
        ...calculateDomainScore('security', domainAttempts.security)
      },
      technology: {
        domain: 'technology',
        ...calculateDomainScore('technology', domainAttempts.technology)
      },
      billing: {
        domain: 'billing',
        ...calculateDomainScore('billing', domainAttempts.billing)
      }
    };
  }
}

// Export singleton instance
export const scoringService = new ScoringService();


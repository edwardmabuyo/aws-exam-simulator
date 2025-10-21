// API Route: GET /api/questions
// Returns all questions or filtered questions

import { NextRequest, NextResponse } from 'next/server';
import { questionService } from '@/lib/services/questionService';
import { DomainType } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const domain = searchParams.get('domain') as DomainType | null;

    // If domain filter is specified, return filtered questions
    if (domain) {
      const questions = questionService.getQuestionsByDomain(domain);
      return NextResponse.json({
        success: true,
        data: questions,
        count: questions.length
      });
    }

    // Otherwise return all questions
    const questionBank = questionService.getQuestionBank();
    return NextResponse.json({
      success: true,
      data: questionBank
    });
  } catch (error) {
    console.error('Error in questions API:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to load questions'
      },
      { status: 500 }
    );
  }
}


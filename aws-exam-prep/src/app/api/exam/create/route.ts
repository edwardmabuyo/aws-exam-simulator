// API Route: POST /api/exam/create
// Creates a new exam with specified configuration

import { NextRequest, NextResponse } from 'next/server';
import { examEngine } from '@/lib/services/examEngine';
import { ExamConfig } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const config: ExamConfig = await request.json();

    // Validate configuration
    if (!config.mode || !config.questionCount) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid exam configuration'
        },
        { status: 400 }
      );
    }

    // Create exam
    const examState = examEngine.createExam(config);

    return NextResponse.json({
      success: true,
      data: examState
    });
  } catch (error) {
    console.error('Error creating exam:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create exam'
      },
      { status: 500 }
    );
  }
}


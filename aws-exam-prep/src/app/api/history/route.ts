import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { ExamResult } from '@/lib/types';

const HISTORY_DIR = path.join(process.cwd(), 'data', 'history');
const HISTORY_FILE = path.join(HISTORY_DIR, 'exam-history.json');

// Ensure history directory and file exist
async function ensureHistoryFile() {
  try {
    await fs.access(HISTORY_DIR);
  } catch {
    await fs.mkdir(HISTORY_DIR, { recursive: true });
  }

  try {
    await fs.access(HISTORY_FILE);
  } catch {
    await fs.writeFile(HISTORY_FILE, JSON.stringify({ exams: [] }, null, 2));
  }
}

// GET: Retrieve exam history
export async function GET() {
  try {
    await ensureHistoryFile();
    const data = await fs.readFile(HISTORY_FILE, 'utf-8');
    const history = JSON.parse(data);
    
    // Sort by timestamp, most recent first
    history.exams.sort((a: ExamResult, b: ExamResult) => b.timestamp - a.timestamp);
    
    return NextResponse.json({ 
      success: true, 
      data: history.exams 
    });
  } catch (error) {
    console.error('Error retrieving history:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error retrieving exam history' 
    }, { status: 500 });
  }
}

// POST: Save exam result to history
export async function POST(request: Request) {
  try {
    const examResult: ExamResult = await request.json();
    
    await ensureHistoryFile();
    const data = await fs.readFile(HISTORY_FILE, 'utf-8');
    const history = JSON.parse(data);
    
    // Add new exam result
    history.exams.push(examResult);
    
    // Keep only last 100 exams to prevent file from growing too large
    if (history.exams.length > 100) {
      history.exams = history.exams.slice(-100);
    }
    
    // Save updated history
    await fs.writeFile(HISTORY_FILE, JSON.stringify(history, null, 2));
    
    return NextResponse.json({ 
      success: true, 
      message: 'Exam result saved to history' 
    });
  } catch (error) {
    console.error('Error saving to history:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error saving exam result' 
    }, { status: 500 });
  }
}

// DELETE: Clear all history (optional, for testing)
export async function DELETE() {
  try {
    await ensureHistoryFile();
    await fs.writeFile(HISTORY_FILE, JSON.stringify({ exams: [] }, null, 2));
    
    return NextResponse.json({ 
      success: true, 
      message: 'History cleared' 
    });
  } catch (error) {
    console.error('Error clearing history:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error clearing history' 
    }, { status: 500 });
  }
}


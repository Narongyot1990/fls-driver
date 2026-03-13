import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Task } from '@/models/Task';
import { requireAuth } from '@/lib/api-auth';

// GET /api/tasks/scores?userId=xxx
// Returns aggregated quiz scores for a user
export async function GET(request: NextRequest) {
  try {
    const authResult = requireAuth(request);
    if ('error' in authResult) return authResult.error;

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    await dbConnect();

    // Find all tasks where this user has submitted
    const tasks = await Task.find({
      'submissions.userId': userId,
    }).select('title category submissions');

    let totalScore = 0;
    let totalQuestions = 0;
    let completedTasks = 0;
    const categoryScores: Record<string, { score: number; total: number; count: number }> = {};
    const recentScores: { title: string; category: string; score: number; total: number; percentage: number; submittedAt: string }[] = [];

    for (const task of tasks) {
      const submission = task.submissions.find(
        (s: any) => s.userId.toString() === userId
      );
      if (!submission) continue;

      completedTasks++;
      totalScore += submission.score;
      totalQuestions += submission.total;

      const cat = task.category || 'ทั่วไป';
      if (!categoryScores[cat]) {
        categoryScores[cat] = { score: 0, total: 0, count: 0 };
      }
      categoryScores[cat].score += submission.score;
      categoryScores[cat].total += submission.total;
      categoryScores[cat].count++;

      recentScores.push({
        title: task.title,
        category: cat,
        score: submission.score,
        total: submission.total,
        percentage: submission.total > 0 ? Math.round((submission.score / submission.total) * 100) : 0,
        submittedAt: submission.submittedAt?.toISOString() || '',
      });
    }

    // Sort recent scores by date desc
    recentScores.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

    const overallPercentage = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;

    // Determine knowledge level
    let knowledgeLevel = 'Beginner';
    let knowledgeLevelTh = 'เริ่มต้น';
    let levelColor = '#94a3b8';
    if (overallPercentage >= 90) {
      knowledgeLevel = 'Expert';
      knowledgeLevelTh = 'ผู้เชี่ยวชาญ';
      levelColor = '#f59e0b';
    } else if (overallPercentage >= 75) {
      knowledgeLevel = 'Advanced';
      knowledgeLevelTh = 'ขั้นสูง';
      levelColor = '#8b5cf6';
    } else if (overallPercentage >= 60) {
      knowledgeLevel = 'Intermediate';
      knowledgeLevelTh = 'ปานกลาง';
      levelColor = '#3b82f6';
    } else if (overallPercentage >= 40) {
      knowledgeLevel = 'Elementary';
      knowledgeLevelTh = 'พื้นฐาน';
      levelColor = '#10b981';
    }

    return NextResponse.json({
      success: true,
      data: {
        totalScore,
        totalQuestions,
        overallPercentage,
        completedTasks,
        knowledgeLevel,
        knowledgeLevelTh,
        levelColor,
        categoryScores,
        recentScores: recentScores.slice(0, 5),
      },
    });
  } catch (error) {
    console.error('Get Task Scores Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

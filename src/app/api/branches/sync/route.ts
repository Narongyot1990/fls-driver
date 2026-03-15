import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { requireSuperuser } from '@/lib/api-auth';

const DEFAULT_BRANCHES = [
  { code: 'AYA', name: 'AYA', description: '', location: { lat: 14.234071, lon: 100.693918 }, radius: 450, active: true },
  { code: 'CBI', name: 'CBI', description: '', location: null, radius: 50, active: true },
  { code: 'RA2', name: 'RA2', description: '', location: null, radius: 50, active: true },
  { code: 'KSN', name: 'KSN', description: '', location: null, radius: 50, active: true },
  { code: 'BBT', name: 'BBT', description: '', location: null, radius: 50, active: true },
];

// POST /api/branches/sync - Sync/reset branches to default (admin only)
export async function POST(request: NextRequest) {
  try {
    const authResult = requireSuperuser(request);
    if ('error' in authResult) return authResult.error;

    await dbConnect();

    const { default: mongoose } = await import('mongoose');
    
    const Settings = mongoose.models.Settings || mongoose.model('Settings', new mongoose.Schema({
      branches: [{
        code: String,
        name: String,
        description: String,
        location: {
          lat: Number,
          lon: Number,
        },
        active: Boolean,
        radius: Number,
      }],
    }, { collection: 'settings' }));

    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = await Settings.create({ branches: DEFAULT_BRANCHES });
    } else {
      // Update existing branches or add new ones
      for (const defaultBranch of DEFAULT_BRANCHES) {
        const existing = settings.branches.find((b: any) => b.code === defaultBranch.code);
        if (existing) {
          // Update existing branch with new defaults
          existing.location = defaultBranch.location;
          existing.radius = defaultBranch.radius;
          existing.active = defaultBranch.active;
        } else {
          // Add new branch
          settings.branches.push(defaultBranch);
        }
      }
      await settings.save();
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Branches synced successfully',
      branches: settings.branches 
    });
  } catch (error) {
    console.error('Sync Branches Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

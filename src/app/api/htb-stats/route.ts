import { NextRequest, NextResponse } from 'next/server';

interface MappedHtbStats {
  rank: string;
  rankPoints: number;
  currentSeasonRank: string;
  totalXP: number;
  ownsUser: number;
  ownsRoot: number;
  hackingTeam: string;
  userTag: string;
  userName: string;
  userAvatar: string;
  countryCode: string;
  countryName: string;
  isMock: boolean;
  machineDifficulties?: Array<{
    name: string;
    owned_machines: number;
    total_machines: number;
    completion_percentage: number;
  }>;
  recentActivity?: Array<{
    blood: boolean;
    avatar: string;
    type: string;
    id: number;
    name: string;
    points: number;
    ownDate: string;
  }>;
}

interface HtbBasicProfile {
  profile: {
    id: number;
    name: string;
    system_owns: number;
    user_owns: number;
    rank: string;
    ranking: number | null;
    points: number;
    team: {
      id: number | null;
      name: string | null;
    } | null;
    current_season_ranking?: number | null;
    avatar?: string;
    country_code?: string;
    country_name?: string;
  };
}

// In-memory cache singleton (persistent across serverless invocations within the same container instance)
let cache: {
  data: MappedHtbStats | null;
  timestamp: number;
} = {
  data: null,
  timestamp: 0,
};

const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

// In-memory rate limiting map
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS = 60; // 60 requests per hour

const MOCK_DATA: MappedHtbStats = {
  rank: '#805',
  rankPoints: 229,
  currentSeasonRank: '#240',
  totalXP: 229,
  ownsUser: 50,
  ownsRoot: 43,
  hackingTeam: 'Apophis',
  userTag: 'Pro Hacker',
  userName: 'FluXi0n',
  userAvatar: 'https://htb-sso-prod-public-storage.s3.eu-central-1.amazonaws.com/users/ff998aeb-eb01-4c92-8807-baf80fddd0c6-avatar.png',
  countryCode: 'IN',
  countryName: 'India',
  isMock: true,
  machineDifficulties: [
    { name: 'Easy', owned_machines: 17, total_machines: 161, completion_percentage: 10.56 },
    { name: 'Medium', owned_machines: 17, total_machines: 192, completion_percentage: 8.85 },
    { name: 'Hard', owned_machines: 8, total_machines: 122, completion_percentage: 6.56 },
    { name: 'Insane', owned_machines: 1, total_machines: 68, completion_percentage: 1.47 }
  ],
  recentActivity: [
    { blood: false, avatar: 'https://cdn.services-k8s.prod.aws.htb.systems/content/machines/avatar/a1e513f0-690d-4dc2-bd2c-946d3983d026-1780052541.png', type: 'user', id: 912, name: 'Nimbus', points: 20, ownDate: '2026-07-02T14:08:27.000Z' },
    { blood: false, avatar: 'https://cdn.services-k8s.prod.aws.htb.systems/content/machines/avatar/a1e514a2-69e8-4e79-82ab-176c3b5a26b4-1780052657.png', type: 'root', id: 915, name: 'Enigma', points: 20, ownDate: '2026-07-01T14:45:38.000Z' },
    { blood: false, avatar: 'https://cdn.services-k8s.prod.aws.htb.systems/content/machines/avatar/a1e514a2-69e8-4e79-82ab-176c3b5a26b4-1780052657.png', type: 'user', id: 915, name: 'Enigma', points: 10, ownDate: '2026-06-30T15:49:59.000Z' },
    { blood: false, avatar: 'https://cdn.services-k8s.prod.aws.htb.systems/content/machines/avatar/a1e5130b-96c5-4d6b-a7c3-aaa82554d1b2-1780052391.png', type: 'root', id: 909, name: 'Checkpoint', points: 30, ownDate: '2026-06-20T16:10:39.000Z' },
    { blood: false, avatar: 'https://cdn.services-k8s.prod.aws.htb.systems/content/machines/avatar/a1e5130b-96c5-4d6b-a7c3-aaa82554d1b2-1780052391.png', type: 'user', id: 909, name: 'Checkpoint', points: 15, ownDate: '2026-06-20T16:07:39.000Z' }
  ]
};

export async function GET(request: NextRequest) {
  // 1. Simple IP-based Rate Limiting
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';
  const now = Date.now();
  
  let timestamps = rateLimitMap.get(ip) || [];
  // Filter out expired timestamps
  timestamps = timestamps.filter(ts => now - ts < RATE_LIMIT_WINDOW);
  
  if (timestamps.length >= MAX_REQUESTS) {
    return NextResponse.json(
      { error: 'Too many requests. Limit is 60 requests per hour.' },
      { status: 429 }
    );
  }
  
  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);

  // 2. Environment Variables Check
  const htbToken = process.env.HTB_APP_TOKEN;
  const htbUserId = process.env.HTB_USER_ID;

  if (!htbToken || !htbUserId) {
    // Return mock data if credentials are not configured
    return NextResponse.json({ ...MOCK_DATA, cached: false });
  }

  // 3. Cache Hit Check
  if (cache.data && now - cache.timestamp < CACHE_TTL) {
    return NextResponse.json({
      ...cache.data,
      cached: true,
      updatedAt: new Date(cache.timestamp).toISOString(),
    });
  }

  // 4. Fetch Live Data from Hack The Box
  try {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${htbToken}`,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    };

    // Fetch endpoints concurrently
    const [basicRes, progressRes, activityRes] = await Promise.allSettled([
      fetch(`https://labs.hackthebox.com/api/v4/user/profile/basic/${htbUserId}`, { headers, next: { revalidate: 600 } }),
      fetch(`https://labs.hackthebox.com/api/v4/user/profile/progress/machines/${htbUserId}`, { headers, next: { revalidate: 600 } }),
      fetch(`https://labs.hackthebox.com/api/v5/user/profile/activity/${htbUserId}`, { headers, next: { revalidate: 600 } })
    ]);

    let basicJson: HtbBasicProfile | null = null;
    if (basicRes.status === 'fulfilled' && basicRes.value.ok) {
      basicJson = await basicRes.value.json();
    } else {
      throw new Error('HTB Basic Profile API failed or returned non-ok status');
    }

    if (!basicJson || !basicJson.profile) {
      throw new Error('Invalid HTB API response format');
    }

    const p = basicJson.profile;

    // Parse progress json
    let machineDifficulties = MOCK_DATA.machineDifficulties;
    if (progressRes.status === 'fulfilled' && progressRes.value.ok) {
      try {
        const progressJson = await progressRes.value.json();
        if (progressJson && progressJson.profile && progressJson.profile.machine_difficulties) {
          machineDifficulties = progressJson.profile.machine_difficulties;
        }
      } catch (e) {
        console.error('Error parsing progress JSON:', e);
      }
    }

    // Parse activity json
    let recentActivity = MOCK_DATA.recentActivity;
    if (activityRes.status === 'fulfilled' && activityRes.value.ok) {
      try {
        const activityJson = await activityRes.value.json();
        if (activityJson && activityJson.data) {
          recentActivity = activityJson.data;
        }
      } catch (e) {
        console.error('Error parsing activity JSON:', e);
      }
    }

    // Map HTB API response to our custom schema
    const mappedData: MappedHtbStats = {
      rank: p.ranking ? `#${p.ranking.toLocaleString()}` : '#805',
      rankPoints: p.points || 0,
      currentSeasonRank: p.current_season_ranking ? `#${p.current_season_ranking.toLocaleString()}` : '#240',
      totalXP: p.points || 0,
      ownsUser: p.user_owns || 0,
      ownsRoot: p.system_owns || 0,
      hackingTeam: p.team ? p.team.name || 'Apophis' : 'Apophis',
      userTag: p.rank || 'Pro Hacker',
      userName: p.name || 'FluXi0n',
      userAvatar: p.avatar || 'https://htb-sso-prod-public-storage.s3.eu-central-1.amazonaws.com/users/ff998aeb-eb01-4c92-8807-baf80fddd0c6-avatar.png',
      countryCode: p.country_code || 'IN',
      countryName: p.country_name || 'India',
      isMock: false,
      machineDifficulties,
      recentActivity
    };

    // Update in-memory cache
    cache = {
      data: mappedData,
      timestamp: now,
    };

    return NextResponse.json({
      ...mappedData,
      cached: false,
      updatedAt: new Date(now).toISOString(),
    });

  } catch (error) {
    console.error('Failed to fetch live HTB stats:', error);

    // Graceful Degradation / Fallbacks
    if (cache.data) {
      return NextResponse.json({
        ...cache.data,
        cached: true,
        stale: true,
        updatedAt: new Date(cache.timestamp).toISOString(),
      });
    }

    return NextResponse.json({
      ...MOCK_DATA,
      cached: false,
      stale: true,
      error: 'Failed to fetch live stats and no cache was found. Displaying fallback values.',
    });
  }
}

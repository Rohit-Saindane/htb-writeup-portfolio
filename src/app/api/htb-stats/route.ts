import { NextRequest, NextResponse } from 'next/server';

export interface SeasonStatItem {
  seasonId: string;
  seasonName: string;
  tier: string;
  tierColor: string;
  seasonalRank: string;
  tierProgress: number;
  points: number;
  flags: string;
  ownsUser: number;
  ownsRoot: number;
  machineDifficulties: Array<{
    name: string;
    owned_machines: number;
    total_machines: number;
    completion_percentage: number;
  }>;
  recentActivity: Array<{
    blood: boolean;
    avatar: string;
    type: string;
    id: number;
    name: string;
    points: number;
    ownDate: string;
  }>;
}

export interface MappedHtbStats {
  rank: string;
  rankPoints: number;
  currentSeasonRank: string;
  totalXP: number;
  level: number;
  levelXP: number;
  levelMaxXP: number;
  htbRankTitle: string;
  grade: number;
  ownsUser: number;
  ownsRoot: number;
  hackingTeam: string;
  userTag: string;
  userName: string;
  userAvatar: string;
  countryCode: string;
  countryName: string;
  isMock: boolean;
  seasons: SeasonStatItem[];
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
    level?: number;
    level_xp?: number;
    next_level_xp?: number;
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

const MOCK_SEASONS: SeasonStatItem[] = [
  {
    seasonId: 'season-12',
    seasonName: 'Season 12',
    tier: 'BRONZE TIER',
    tierColor: '#cd7f32',
    seasonalRank: '#1420',
    tierProgress: 15.0,
    points: 45,
    flags: '2/26',
    ownsUser: 1,
    ownsRoot: 1,
    machineDifficulties: [
      { name: 'Easy', owned_machines: 0, total_machines: 165, completion_percentage: 0 },
      { name: 'Medium', owned_machines: 1, total_machines: 196, completion_percentage: 0.51 },
      { name: 'Hard', owned_machines: 0, total_machines: 124, completion_percentage: 0 },
      { name: 'Insane', owned_machines: 0, total_machines: 70, completion_percentage: 0 }
    ],
    recentActivity: [
      {
        blood: false,
        avatar: 'https://cdn.services-k8s.prod.aws.htb.systems/content/machines/avatar/a2cc2776-5507-42ae-b9d0-3346ff823ce7-1789977190.png',
        type: 'root',
        id: 984,
        name: 'Layover',
        points: 30,
        ownDate: '2026-10-01T15:59:21.000Z'
      },
      {
        blood: false,
        avatar: 'https://cdn.services-k8s.prod.aws.htb.systems/content/machines/avatar/a2cc2776-5507-42ae-b9d0-3346ff823ce7-1789977190.png',
        type: 'user',
        id: 984,
        name: 'Layover',
        points: 15,
        ownDate: '2026-10-01T15:52:01.000Z'
      }
    ]
  },
  {
    seasonId: 'season-11',
    seasonName: 'Season 11',
    tier: 'RUBY TIER',
    tierColor: '#ef4444',
    seasonalRank: '#2536',
    tierProgress: 50,
    points: 375,
    flags: '14/26',
    ownsUser: 14,
    ownsRoot: 14,
    machineDifficulties: [
      { name: 'Easy', owned_machines: 6, total_machines: 161, completion_percentage: 3.73 },
      { name: 'Medium', owned_machines: 5, total_machines: 192, completion_percentage: 2.6 },
      { name: 'Hard', owned_machines: 2, total_machines: 122, completion_percentage: 1.63 },
      { name: 'Insane', owned_machines: 1, total_machines: 68, completion_percentage: 1.47 }
    ],
    recentActivity: [
      { blood: false, avatar: 'https://cdn.services-k8s.prod.aws.htb.systems/content/machines/avatar/a22a6987-d3b2-4b23-a843-db9f38b06566-1783030428.png', type: 'root', id: 963, name: 'TrustFall', points: 50, ownDate: '2026-09-26T06:21:10.000Z' },
      { blood: false, avatar: 'https://cdn.services-k8s.prod.aws.htb.systems/content/machines/avatar/a22a6987-d3b2-4b23-a843-db9f38b06566-1783030428.png', type: 'user', id: 963, name: 'TrustFall', points: 25, ownDate: '2026-09-25T14:46:14.000Z' },
      { blood: false, avatar: 'https://cdn.services-k8s.prod.aws.htb.systems/content/machines/avatar/a1fbe7ca-991c-43f1-b9da-e403d159bebe-1780052951.png', type: 'root', id: 955, name: 'Management', points: 20, ownDate: '2026-09-15T15:30:16.000Z' },
      { blood: false, avatar: 'https://cdn.services-k8s.prod.aws.htb.systems/content/machines/avatar/a1fbe7ca-991c-43f1-b9da-e403d159bebe-1780052951.png', type: 'user', id: 955, name: 'Management', points: 10, ownDate: '2026-09-14T18:40:53.000Z' },
      { blood: false, avatar: 'https://cdn.services-k8s.prod.aws.htb.systems/content/machines/avatar/a1fa5d74-ee5a-4712-a7d0-1c3132e0e4b7-1780052857.png', type: 'root', id: 948, name: 'Cohort', points: 20, ownDate: '2026-08-22T15:25:24.000Z' },
      { blood: false, avatar: 'https://cdn.services-k8s.prod.aws.htb.systems/content/machines/avatar/a1fa5d74-ee5a-4712-a7d0-1c3132e0e4b7-1780052857.png', type: 'user', id: 948, name: 'Cohort', points: 10, ownDate: '2026-08-19T15:10:18.000Z' },
      { blood: false, avatar: 'https://cdn.services-k8s.prod.aws.htb.systems/content/machines/avatar/a1f59dae-2824-4f81-8178-5e8bf8345e52-1780052733.png', type: 'root', id: 942, name: 'DanglingTree', points: 30, ownDate: '2026-08-19T14:10:13.000Z' }
    ]
  },
  {
    seasonId: 'season-10',
    seasonName: 'Season 10',
    tier: 'PLATINUM TIER',
    tierColor: '#a855f7',
    seasonalRank: '#1279',
    tierProgress: 76.5,
    points: 685,
    flags: '23/26',
    ownsUser: 23,
    ownsRoot: 23,
    machineDifficulties: [
      { name: 'Easy', owned_machines: 10, total_machines: 161, completion_percentage: 6.21 },
      { name: 'Medium', owned_machines: 8, total_machines: 192, completion_percentage: 4.16 },
      { name: 'Hard', owned_machines: 4, total_machines: 122, completion_percentage: 3.27 },
      { name: 'Insane', owned_machines: 1, total_machines: 68, completion_percentage: 1.47 }
    ],
    recentActivity: [
      { blood: false, avatar: '/images/machines/garfield.png', type: 'root', id: 880, name: 'Garfield', points: 30, ownDate: '2026-04-18T12:20:00.000Z' },
      { blood: false, avatar: '/images/machines/garfield.png', type: 'user', id: 880, name: 'Garfield', points: 15, ownDate: '2026-04-18T10:00:00.000Z' },
      { blood: false, avatar: '/images/machines/devarea.png', type: 'root', id: 875, name: 'DevArea', points: 40, ownDate: '2026-04-10T14:15:00.000Z' },
      { blood: false, avatar: '/images/machines/devarea.png', type: 'user', id: 875, name: 'DevArea', points: 20, ownDate: '2026-04-10T11:00:00.000Z' },
      { blood: false, avatar: '/images/machines/logging.png', type: 'root', id: 870, name: 'Logging', points: 30, ownDate: '2026-03-28T18:00:00.000Z' },
      { blood: false, avatar: '/images/machines/pirate.png', type: 'root', id: 865, name: 'Pirate', points: 30, ownDate: '2026-03-15T11:45:00.000Z' },
      { blood: false, avatar: '/images/machines/cctv.png', type: 'root', id: 860, name: 'CCTV', points: 20, ownDate: '2026-03-02T09:30:00.000Z' }
    ]
  },
  {
    seasonId: 'season-9',
    seasonName: 'Season 9',
    tier: 'RUBY TIER',
    tierColor: '#ef4444',
    seasonalRank: '#1860',
    tierProgress: 72.0,
    points: 980,
    flags: '18/24',
    ownsUser: 18,
    ownsRoot: 18,
    machineDifficulties: [
      { name: 'Easy', owned_machines: 8, total_machines: 161, completion_percentage: 4.96 },
      { name: 'Medium', owned_machines: 6, total_machines: 192, completion_percentage: 3.12 },
      { name: 'Hard', owned_machines: 3, total_machines: 122, completion_percentage: 2.45 },
      { name: 'Insane', owned_machines: 0, total_machines: 68, completion_percentage: 0 }
    ],
    recentActivity: [
      { blood: false, avatar: '/images/machines/interpreter.png', type: 'root', id: 820, name: 'Interpreter', points: 30, ownDate: '2025-12-14T10:30:00.000Z' },
      { blood: false, avatar: '/images/machines/interpreter.png', type: 'user', id: 820, name: 'Interpreter', points: 15, ownDate: '2025-12-14T08:15:00.000Z' },
      { blood: false, avatar: '/images/machines/kobold.png', type: 'root', id: 815, name: 'Kobold', points: 20, ownDate: '2025-12-01T16:20:00.000Z' },
      { blood: false, avatar: '/images/machines/kobold.png', type: 'user', id: 815, name: 'Kobold', points: 10, ownDate: '2025-12-01T14:00:00.000Z' },
      { blood: false, avatar: '/images/machines/variatype.png', type: 'root', id: 810, name: 'VariaType', points: 30, ownDate: '2025-11-20T19:10:00.000Z' },
      { blood: false, avatar: '/images/machines/variatype.png', type: 'user', id: 810, name: 'VariaType', points: 15, ownDate: '2025-11-20T17:00:00.000Z' },
      { blood: false, avatar: '/images/machines/wingdata.png', type: 'root', id: 805, name: 'WingData', points: 25, ownDate: '2025-11-05T14:30:00.000Z' }
    ]
  }
];

const MOCK_DATA: MappedHtbStats = {
  rank: '#706',
  rankPoints: 289,
  currentSeasonRank: '#1420',
  totalXP: 289,
  level: 59,
  levelXP: 79,
  levelMaxXP: 1743,
  htbRankTitle: 'Pro Hacker',
  grade: 3,
  ownsUser: 59,
  ownsRoot: 53,
  hackingTeam: 'Apophis',
  userTag: 'Pro Hacker',
  userName: 'FluXi0n',
  userAvatar: 'https://htb-sso-prod-public-storage.s3.eu-central-1.amazonaws.com/users/ff998aeb-eb01-4c92-8807-baf80fddd0c6-avatar.png',
  countryCode: 'IN',
  countryName: 'India',
  isMock: true,
  seasons: MOCK_SEASONS,
  machineDifficulties: MOCK_SEASONS[0].machineDifficulties,
  recentActivity: MOCK_SEASONS[0].recentActivity
};

export async function GET(request: NextRequest) {
  // 1. Simple IP-based Rate Limiting
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';
  const now = Date.now();
  
  let timestamps = rateLimitMap.get(ip) || [];
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
    return NextResponse.json({ ...MOCK_DATA, cached: false });
  }

  const force = request.nextUrl.searchParams.get('force') === 'true';

  if (!force && cache.data && now - cache.timestamp < CACHE_TTL) {
    return NextResponse.json({
      ...cache.data,
      cached: true,
      updatedAt: new Date(cache.timestamp).toISOString(),
    });
  }

  try {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${htbToken}`,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    };

    const fetchOptions = force
      ? { headers, cache: 'no-store' as const }
      : { headers, next: { revalidate: 600 } };

    const [basicRes, progressRes, activityRes] = await Promise.allSettled([
      fetch(`https://labs.hackthebox.com/api/v4/user/profile/basic/${htbUserId}`, fetchOptions),
      fetch(`https://labs.hackthebox.com/api/v4/user/profile/progress/machines/${htbUserId}`, fetchOptions),
      fetch(`https://labs.hackthebox.com/api/v5/user/profile/activity/${htbUserId}`, fetchOptions)
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

    const userOwnsTotal = p.user_owns || 59;
    const systemOwnsTotal = p.system_owns || 53;
    const season12Rank = p.current_season_ranking ? `#${p.current_season_ranking.toLocaleString()}` : '#1420';
    const season11Rank = '#2536';
    const pointsVal = p.points || 289;

    // Partition recent activity: Layover and solves on/after 2026-10-01 belong to Season 12
    const rawActivity = (recentActivity && recentActivity.length > 0) ? recentActivity : [];
    const season12Activity = rawActivity.filter(
      (a) => a.name.toLowerCase() === 'layover' || new Date(a.ownDate).getTime() >= new Date('2026-10-01T00:00:00.000Z').getTime()
    );
    const season11Activity = rawActivity.filter(
      (a) => a.name.toLowerCase() !== 'layover' && new Date(a.ownDate).getTime() < new Date('2026-10-01T00:00:00.000Z').getTime()
    );

    // Dynamic mapped seasons (Season 12 active, Season 11 previous, Season 10, Season 9)
    const seasons: SeasonStatItem[] = [
      {
        ...MOCK_SEASONS[0], // Season 12
        seasonalRank: season12Rank,
        ownsUser: 1,
        ownsRoot: 1,
        points: 45,
        flags: '2/26',
        tierProgress: 15.0,
        machineDifficulties: [
          { name: 'Easy', owned_machines: 0, total_machines: 165, completion_percentage: 0 },
          { name: 'Medium', owned_machines: 1, total_machines: 196, completion_percentage: 0.51 },
          { name: 'Hard', owned_machines: 0, total_machines: 124, completion_percentage: 0 },
          { name: 'Insane', owned_machines: 0, total_machines: 70, completion_percentage: 0 }
        ],
        recentActivity: season12Activity.length > 0 ? season12Activity : MOCK_SEASONS[0].recentActivity,
      },
      {
        ...MOCK_SEASONS[1], // Season 11
        seasonalRank: season11Rank,
        ownsUser: 14,
        ownsRoot: 14,
        points: 375,
        flags: '14/26',
        tierProgress: 50,
        machineDifficulties: MOCK_SEASONS[1].machineDifficulties,
        recentActivity: season11Activity.length > 0 ? season11Activity : MOCK_SEASONS[1].recentActivity,
      },
      MOCK_SEASONS[2], // Season 10
      MOCK_SEASONS[3]  // Season 9
    ];

    const mappedData: MappedHtbStats = {
      rank: p.ranking ? `#${p.ranking.toLocaleString()}` : '#706',
      rankPoints: pointsVal,
      currentSeasonRank: season12Rank,
      totalXP: pointsVal,
      level: p.level || 59,
      levelXP: p.level_xp || 79,
      levelMaxXP: p.next_level_xp || 1743,
      htbRankTitle: p.rank || 'Pro Hacker',
      grade: 3,
      ownsUser: userOwnsTotal,
      ownsRoot: systemOwnsTotal,
      hackingTeam: p.team ? p.team.name || 'Apophis' : 'Apophis',
      userTag: p.rank || 'Pro Hacker',
      userName: p.name || 'FluXi0n',
      userAvatar: p.avatar || 'https://htb-sso-prod-public-storage.s3.eu-central-1.amazonaws.com/users/ff998aeb-eb01-4c92-8807-baf80fddd0c6-avatar.png',
      countryCode: p.country_code || 'IN',
      countryName: p.country_name || 'India',
      isMock: false,
      seasons,
      machineDifficulties: machineDifficulties || MOCK_SEASONS[0].machineDifficulties,
      recentActivity: season12Activity.length > 0 ? season12Activity : MOCK_SEASONS[0].recentActivity
    };

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


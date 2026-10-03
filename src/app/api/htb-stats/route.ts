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
      { blood: false, avatar: 'https://cdn.services-k8s.prod.aws.htb.systems/content/machines/avatar/a1e513f0-690d-4dc2-bd2c-946d3983d026-1780052541.png', type: 'root', id: 912, name: 'Bedside', points: 30, ownDate: '2026-07-24T15:41:44.000Z' },
      { blood: false, avatar: 'https://cdn.services-k8s.prod.aws.htb.systems/content/machines/avatar/a1e513f0-690d-4dc2-bd2c-946d3983d026-1780052541.png', type: 'user', id: 912, name: 'Bedside', points: 15, ownDate: '2026-07-23T14:08:27.000Z' },
      { blood: false, avatar: 'https://cdn.services-k8s.prod.aws.htb.systems/content/machines/avatar/a1e514a2-69e8-4e79-82ab-176c3b5a26b4-1780052657.png', type: 'root', id: 915, name: 'Paperwork', points: 20, ownDate: '2026-07-18T14:45:38.000Z' },
      { blood: false, avatar: 'https://cdn.services-k8s.prod.aws.htb.systems/content/machines/avatar/a1e514a2-69e8-4e79-82ab-176c3b5a26b4-1780052657.png', type: 'user', id: 915, name: 'Paperwork', points: 10, ownDate: '2026-07-18T12:49:59.000Z' },
      { blood: false, avatar: 'https://cdn.services-k8s.prod.aws.htb.systems/content/machines/avatar/a1e5130b-96c5-4d6b-a7c3-aaa82554d1b2-1780052391.png', type: 'root', id: 909, name: 'DevHub', points: 30, ownDate: '2026-07-10T16:10:39.000Z' },
      { blood: false, avatar: 'https://cdn.services-k8s.prod.aws.htb.systems/content/machines/avatar/a1e5130b-96c5-4d6b-a7c3-aaa82554d1b2-1780052391.png', type: 'user', id: 909, name: 'DevHub', points: 15, ownDate: '2026-07-10T15:07:39.000Z' },
      { blood: false, avatar: 'https://cdn.services-k8s.prod.aws.htb.systems/content/machines/avatar/a1e513f0-690d-4dc2-bd2c-946d3983d026-1780052541.png', type: 'root', id: 905, name: 'Nimbus', points: 40, ownDate: '2026-07-02T11:20:00.000Z' }
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
  rank: '#805',
  rankPoints: 375,
  currentSeasonRank: '#2536',
  totalXP: 375,
  level: 59,
  levelXP: 79,
  levelMaxXP: 1743,
  htbRankTitle: 'Professional',
  grade: 3,
  ownsUser: 50,
  ownsRoot: 44,
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

    const userOwnsTotal = p.user_owns || 56;
    const systemOwnsTotal = p.system_owns || 49;
    const season11OwnsUser = 14;
    const season11OwnsRoot = 14;
    const seasonRankStr = p.current_season_ranking ? `#${p.current_season_ranking.toLocaleString()}` : '#2536';
    const pointsVal = p.points || 375;

    // Dynamic mapped seasons with live S11 overlay
    const seasons: SeasonStatItem[] = [
      {
        ...MOCK_SEASONS[0],
        seasonalRank: seasonRankStr,
        ownsUser: season11OwnsUser,
        ownsRoot: season11OwnsRoot,
        points: pointsVal,
        flags: '14/26',
        tierProgress: 50,
        machineDifficulties: machineDifficulties || MOCK_SEASONS[0].machineDifficulties,
        recentActivity: recentActivity || MOCK_SEASONS[0].recentActivity,
      },
      MOCK_SEASONS[1],
      MOCK_SEASONS[2]
    ];

    const mappedData: MappedHtbStats = {
      rank: p.ranking ? `#${p.ranking.toLocaleString()}` : '#805',
      rankPoints: pointsVal,
      currentSeasonRank: seasonRankStr,
      totalXP: pointsVal,
      level: p.level || 59,
      levelXP: p.level_xp || 79,
      levelMaxXP: p.next_level_xp || 1743,
      htbRankTitle: p.rank || 'Professional',
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
      machineDifficulties,
      recentActivity
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


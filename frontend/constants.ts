import { ContestConfig, ProblemData, Team, ProblemStatus } from './types';

export const PROBLEMS: ProblemData[] = [
  { id: 'p1', label: 'A', name: 'Problem A' },
  { id: 'p2', label: 'B', name: 'Problem B' },
  { id: 'p3', label: 'C', name: 'Problem C' },
  { id: 'p4', label: 'D', name: 'Problem D' },
  { id: 'p5', label: 'E', name: 'Problem E' },
  { id: 'p6', label: 'F', name: 'Problem F' },
  { id: 'p7', label: 'G', name: 'Problem G' },
  { id: 'p8', label: 'H', name: 'Problem H' },
  { id: 'p9', label: 'I', name: 'Problem I' },
];

const NOW = Date.now();
const ONE_MINUTE = 1 * 60 * 1000;

// ====================================================================================
// CONTEST TIMING - Uses current time + 1 minute
// ====================================================================================
// In mock mode: uses current time
// In production mode: uses current time when frontend loads + 1 minute duration
// ====================================================================================

const getContestStart = (): number => {
  const useMockMode = import.meta.env.VITE_USE_MOCK_DATA === 'true';

  if (useMockMode) {
    console.log('🎭 Mock mode: Using current time as contest start');
    return NOW;
  }

  // Production mode: Start at current time
  console.log('🚀 Production mode: Contest starts at current time');
  return NOW;
};

const getContestEnd = (): number => {
  const startTime = getContestStart();

  // Always use 1-minute duration
  console.log('⏰ Setting 1-minute contest duration');
  return startTime + ONE_MINUTE;
};

export const INITIAL_CONFIG: ContestConfig = {
  title: "PROCOM'26 PHANTOMVERSE",
  startTime: getContestStart(),
  endTime: getContestEnd(),
  problems: PROBLEMS,
};

// Mock teams for testing - simplified to match real data format
export const MOCK_TEAMS: Team[] = [
  {
    id: 't1',
    name: 'SegFault Survivors',
    university: '',
    solved: 3,
    penalty: 45,
    rank: 1,
    trend: 'same',
    submissions: {
      p1: { problemId: 'p1', status: ProblemStatus.ACCEPTED, attempts: 1, time: 15, isFirstBlood: true },
      p2: { problemId: 'p2', status: ProblemStatus.ACCEPTED, attempts: 2, time: 30, isFirstBlood: false },
      p4: { problemId: 'p4', status: ProblemStatus.ACCEPTED, attempts: 1, time: 60, isFirstBlood: false },
      p3: { problemId: 'p3', status: ProblemStatus.NOT_ATTEMPTED, attempts: 0, time: 0, isFirstBlood: false },
      p5: { problemId: 'p5', status: ProblemStatus.NOT_ATTEMPTED, attempts: 0, time: 0, isFirstBlood: false },
      p6: { problemId: 'p6', status: ProblemStatus.NOT_ATTEMPTED, attempts: 0, time: 0, isFirstBlood: false },
      p7: { problemId: 'p7', status: ProblemStatus.NOT_ATTEMPTED, attempts: 0, time: 0, isFirstBlood: false },
      p8: { problemId: 'p8', status: ProblemStatus.NOT_ATTEMPTED, attempts: 0, time: 0, isFirstBlood: false },
    }
  },
  {
    id: 't2',
    name: 'Binary Bandits',
    university: '',
    solved: 3,
    penalty: 50,
    rank: 2,
    trend: 'same',
    submissions: {
      p1: { problemId: 'p1', status: ProblemStatus.ACCEPTED, attempts: 1, time: 20, isFirstBlood: false },
      p2: { problemId: 'p2', status: ProblemStatus.ACCEPTED, attempts: 1, time: 35, isFirstBlood: false },
      p3: { problemId: 'p3', status: ProblemStatus.ACCEPTED, attempts: 2, time: 45, isFirstBlood: false },
      p4: { problemId: 'p4', status: ProblemStatus.NOT_ATTEMPTED, attempts: 0, time: 0, isFirstBlood: false },
      p5: { problemId: 'p5', status: ProblemStatus.NOT_ATTEMPTED, attempts: 0, time: 0, isFirstBlood: false },
      p6: { problemId: 'p6', status: ProblemStatus.NOT_ATTEMPTED, attempts: 0, time: 0, isFirstBlood: false },
      p7: { problemId: 'p7', status: ProblemStatus.NOT_ATTEMPTED, attempts: 0, time: 0, isFirstBlood: false },
      p8: { problemId: 'p8', status: ProblemStatus.NOT_ATTEMPTED, attempts: 0, time: 0, isFirstBlood: false },
    }
  },
  {
    id: 't3',
    name: 'Recursive Nightmares',
    university: '',
    solved: 2,
    penalty: 40,
    rank: 3,
    trend: 'same',
    submissions: {
      p1: { problemId: 'p1', status: ProblemStatus.ACCEPTED, attempts: 1, time: 25, isFirstBlood: false },
      p3: { problemId: 'p3', status: ProblemStatus.ACCEPTED, attempts: 1, time: 40, isFirstBlood: false },
      p2: { problemId: 'p2', status: ProblemStatus.WRONG_ANSWER, attempts: 2, time: 0, isFirstBlood: false },
      p4: { problemId: 'p4', status: ProblemStatus.NOT_ATTEMPTED, attempts: 0, time: 0, isFirstBlood: false },
      p5: { problemId: 'p5', status: ProblemStatus.NOT_ATTEMPTED, attempts: 0, time: 0, isFirstBlood: false },
      p6: { problemId: 'p6', status: ProblemStatus.NOT_ATTEMPTED, attempts: 0, time: 0, isFirstBlood: false },
      p7: { problemId: 'p7', status: ProblemStatus.NOT_ATTEMPTED, attempts: 0, time: 0, isFirstBlood: false },
      p8: { problemId: 'p8', status: ProblemStatus.NOT_ATTEMPTED, attempts: 0, time: 0, isFirstBlood: false },
    }
  },
  {
    id: 't4',
    name: 'Code Phantoms',
    university: '',
    solved: 2,
    penalty: 55,
    rank: 4,
    trend: 'same',
    submissions: {
      p1: { problemId: 'p1', status: ProblemStatus.ACCEPTED, attempts: 2, time: 30, isFirstBlood: false },
      p4: { problemId: 'p4', status: ProblemStatus.ACCEPTED, attempts: 1, time: 50, isFirstBlood: false },
      p2: { problemId: 'p2', status: ProblemStatus.NOT_ATTEMPTED, attempts: 0, time: 0, isFirstBlood: false },
      p3: { problemId: 'p3', status: ProblemStatus.NOT_ATTEMPTED, attempts: 0, time: 0, isFirstBlood: false },
      p5: { problemId: 'p5', status: ProblemStatus.NOT_ATTEMPTED, attempts: 0, time: 0, isFirstBlood: false },
      p6: { problemId: 'p6', status: ProblemStatus.NOT_ATTEMPTED, attempts: 0, time: 0, isFirstBlood: false },
      p7: { problemId: 'p7', status: ProblemStatus.NOT_ATTEMPTED, attempts: 0, time: 0, isFirstBlood: false },
      p8: { problemId: 'p8', status: ProblemStatus.NOT_ATTEMPTED, attempts: 0, time: 0, isFirstBlood: false },
    }
  },
  {
    id: 't5',
    name: 'Logic Glitchers',
    university: '',
    solved: 2,
    penalty: 60,
    rank: 5,
    trend: 'same',
    submissions: {
      p2: { problemId: 'p2', status: ProblemStatus.ACCEPTED, attempts: 1, time: 28, isFirstBlood: false },
      p3: { problemId: 'p3', status: ProblemStatus.ACCEPTED, attempts: 2, time: 55, isFirstBlood: false },
      p1: { problemId: 'p1', status: ProblemStatus.NOT_ATTEMPTED, attempts: 0, time: 0, isFirstBlood: false },
      p4: { problemId: 'p4', status: ProblemStatus.NOT_ATTEMPTED, attempts: 0, time: 0, isFirstBlood: false },
      p5: { problemId: 'p5', status: ProblemStatus.NOT_ATTEMPTED, attempts: 0, time: 0, isFirstBlood: false },
      p6: { problemId: 'p6', status: ProblemStatus.NOT_ATTEMPTED, attempts: 0, time: 0, isFirstBlood: false },
      p7: { problemId: 'p7', status: ProblemStatus.NOT_ATTEMPTED, attempts: 0, time: 0, isFirstBlood: false },
      p8: { problemId: 'p8', status: ProblemStatus.NOT_ATTEMPTED, attempts: 0, time: 0, isFirstBlood: false },
    }
  },
  {
    id: 't6',
    name: 'Syntax Errors',
    university: '',
    solved: 1,
    penalty: 25,
    rank: 6,
    trend: 'same',
    submissions: {
      p1: { problemId: 'p1', status: ProblemStatus.ACCEPTED, attempts: 1, time: 25, isFirstBlood: false },
      p2: { problemId: 'p2', status: ProblemStatus.NOT_ATTEMPTED, attempts: 0, time: 0, isFirstBlood: false },
      p3: { problemId: 'p3', status: ProblemStatus.NOT_ATTEMPTED, attempts: 0, time: 0, isFirstBlood: false },
      p4: { problemId: 'p4', status: ProblemStatus.NOT_ATTEMPTED, attempts: 0, time: 0, isFirstBlood: false },
      p5: { problemId: 'p5', status: ProblemStatus.NOT_ATTEMPTED, attempts: 0, time: 0, isFirstBlood: false },
      p6: { problemId: 'p6', status: ProblemStatus.NOT_ATTEMPTED, attempts: 0, time: 0, isFirstBlood: false },
      p7: { problemId: 'p7', status: ProblemStatus.NOT_ATTEMPTED, attempts: 0, time: 0, isFirstBlood: false },
      p8: { problemId: 'p8', status: ProblemStatus.NOT_ATTEMPTED, attempts: 0, time: 0, isFirstBlood: false },
    }
  },
  {
    id: 't7',
    name: 'Cyber Drifters',
    university: '',
    solved: 1,
    penalty: 35,
    rank: 7,
    trend: 'same',
    submissions: {
      p2: { problemId: 'p2', status: ProblemStatus.ACCEPTED, attempts: 3, time: 35, isFirstBlood: false },
      p1: { problemId: 'p1', status: ProblemStatus.WRONG_ANSWER, attempts: 1, time: 0, isFirstBlood: false },
      p3: { problemId: 'p3', status: ProblemStatus.NOT_ATTEMPTED, attempts: 0, time: 0, isFirstBlood: false },
      p4: { problemId: 'p4', status: ProblemStatus.NOT_ATTEMPTED, attempts: 0, time: 0, isFirstBlood: false },
      p5: { problemId: 'p5', status: ProblemStatus.NOT_ATTEMPTED, attempts: 0, time: 0, isFirstBlood: false },
      p6: { problemId: 'p6', status: ProblemStatus.NOT_ATTEMPTED, attempts: 0, time: 0, isFirstBlood: false },
      p7: { problemId: 'p7', status: ProblemStatus.NOT_ATTEMPTED, attempts: 0, time: 0, isFirstBlood: false },
      p8: { problemId: 'p8', status: ProblemStatus.NOT_ATTEMPTED, attempts: 0, time: 0, isFirstBlood: false },
    }
  },
  {
    id: 't8',
    name: 'Null Pointers',
    university: '',
    solved: 0,
    penalty: 0,
    rank: 8,
    trend: 'same',
    submissions: {
      p1: { problemId: 'p1', status: ProblemStatus.NOT_ATTEMPTED, attempts: 0, time: 0, isFirstBlood: false },
      p2: { problemId: 'p2', status: ProblemStatus.NOT_ATTEMPTED, attempts: 0, time: 0, isFirstBlood: false },
      p3: { problemId: 'p3', status: ProblemStatus.NOT_ATTEMPTED, attempts: 0, time: 0, isFirstBlood: false },
      p4: { problemId: 'p4', status: ProblemStatus.NOT_ATTEMPTED, attempts: 0, time: 0, isFirstBlood: false },
      p5: { problemId: 'p5', status: ProblemStatus.NOT_ATTEMPTED, attempts: 0, time: 0, isFirstBlood: false },
      p6: { problemId: 'p6', status: ProblemStatus.NOT_ATTEMPTED, attempts: 0, time: 0, isFirstBlood: false },
      p7: { problemId: 'p7', status: ProblemStatus.NOT_ATTEMPTED, attempts: 0, time: 0, isFirstBlood: false },
      p8: { problemId: 'p8', status: ProblemStatus.NOT_ATTEMPTED, attempts: 0, time: 0, isFirstBlood: false },
    }
  },
  {
    id: 't9',
    name: 'Stack Overflow',
    university: '',
    solved: 0,
    penalty: 0,
    rank: 9,
    trend: 'same',
    submissions: {
      p1: { problemId: 'p1', status: ProblemStatus.WRONG_ANSWER, attempts: 2, time: 0, isFirstBlood: false },
      p2: { problemId: 'p2', status: ProblemStatus.NOT_ATTEMPTED, attempts: 0, time: 0, isFirstBlood: false },
      p3: { problemId: 'p3', status: ProblemStatus.NOT_ATTEMPTED, attempts: 0, time: 0, isFirstBlood: false },
      p4: { problemId: 'p4', status: ProblemStatus.NOT_ATTEMPTED, attempts: 0, time: 0, isFirstBlood: false },
      p5: { problemId: 'p5', status: ProblemStatus.NOT_ATTEMPTED, attempts: 0, time: 0, isFirstBlood: false },
      p6: { problemId: 'p6', status: ProblemStatus.NOT_ATTEMPTED, attempts: 0, time: 0, isFirstBlood: false },
      p7: { problemId: 'p7', status: ProblemStatus.NOT_ATTEMPTED, attempts: 0, time: 0, isFirstBlood: false },
      p8: { problemId: 'p8', status: ProblemStatus.NOT_ATTEMPTED, attempts: 0, time: 0, isFirstBlood: false },
    }
  },
  {
    id: 't10',
    name: 'Heap Hackers',
    university: '',
    solved: 0,
    penalty: 0,
    rank: 10,
    trend: 'same',
    submissions: {
      p1: { problemId: 'p1', status: ProblemStatus.NOT_ATTEMPTED, attempts: 0, time: 0, isFirstBlood: false },
      p2: { problemId: 'p2', status: ProblemStatus.NOT_ATTEMPTED, attempts: 0, time: 0, isFirstBlood: false },
      p3: { problemId: 'p3', status: ProblemStatus.NOT_ATTEMPTED, attempts: 0, time: 0, isFirstBlood: false },
      p4: { problemId: 'p4', status: ProblemStatus.NOT_ATTEMPTED, attempts: 0, time: 0, isFirstBlood: false },
      p5: { problemId: 'p5', status: ProblemStatus.NOT_ATTEMPTED, attempts: 0, time: 0, isFirstBlood: false },
      p6: { problemId: 'p6', status: ProblemStatus.NOT_ATTEMPTED, attempts: 0, time: 0, isFirstBlood: false },
      p7: { problemId: 'p7', status: ProblemStatus.NOT_ATTEMPTED, attempts: 0, time: 0, isFirstBlood: false },
      p8: { problemId: 'p8', status: ProblemStatus.NOT_ATTEMPTED, attempts: 0, time: 0, isFirstBlood: false },
    }
  },
  ...Array.from({ length: 40 }, (_, i) => {
    const teamNum = i + 11;
    const solved = Math.max(0, Math.floor(Math.random() * 4));
    const penalty = solved > 0 ? 20 + Math.floor(Math.random() * 100) : 0;

    const createSubmissions = () => {
      const subs: any = {};
      const solvedProblems = new Set<string>();

      // Randomly select which problems to solve
      if (solved > 0) {
        const problemIds = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8'];
        const shuffled = problemIds.sort(() => Math.random() - 0.5);
        for (let j = 0; j < solved; j++) {
          solvedProblems.add(shuffled[j]);
        }
      }

      // Create submission for each problem
      PROBLEMS.forEach(prob => {
        if (solvedProblems.has(prob.id)) {
          subs[prob.id] = {
            problemId: prob.id,
            status: ProblemStatus.ACCEPTED,
            attempts: Math.ceil(Math.random() * 3),
            time: 10 + Math.floor(Math.random() * 90),
            isFirstBlood: false
          };
        } else {
          // Some teams have wrong answers, others haven't attempted
          const hasAttempted = Math.random() > 0.7;
          subs[prob.id] = {
            problemId: prob.id,
            status: hasAttempted ? ProblemStatus.WRONG_ANSWER : ProblemStatus.NOT_ATTEMPTED,
            attempts: hasAttempted ? Math.ceil(Math.random() * 2) : 0,
            time: 0,
            isFirstBlood: false
          };
        }
      });

      return subs;
    };

    const teamNames = [
      'Algorithm Assassins', 'Compile Commanders', 'Debug Demons', 'Exception Handlers',
      'Function Fighters', 'Git Gurus', 'Hash Heroes', 'Iterator Insurgents',
      'JSON Juggernauts', 'Kernel Knights', 'Lambda Legends', 'Memory Masters',
      'Null Ninjas', 'Object Outlaws', 'Pointer Pirates', 'Query Questers',
      'Runtime Raiders', 'Scope Slayers', 'Thread Titans', 'Unicode Unicorns',
      'Variable Vikings', 'Webpack Warriors', 'XML Xperts', 'Yield Yielders',
      'Zero Day Zealots', 'Array Avengers', 'Boolean Barbarians', 'Cache Crusaders',
      'Data Dervishes', 'Enum Enforcers', 'Fiber Forgers', 'Graph Guardians',
      'Heap Hunters', 'Index Invaders', 'Join Jesters', 'Key Keepers',
      'Loop Luminaries', 'Mutex Mavericks', 'Node Nomads', 'Overflow Orchestra'
    ];

    return {
      id: `t${teamNum}`,
      name: teamNames[i] || `Team ${teamNum}`,
      university: '',
      solved,
      penalty,
      rank: teamNum,
      trend: 'same' as const,
      submissions: createSubmissions()
    };
  })
];
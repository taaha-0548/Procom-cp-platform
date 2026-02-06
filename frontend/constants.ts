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
];

const NOW = Date.now();
const TEN_MINUTES = 10 * 60 * 1000;

// Get contest times - in mock mode use current time, otherwise use env variables
const getContestStart = (): number => {
  const useMockMode = import.meta.env.VITE_USE_MOCK_DATA === 'true';
  
  if (useMockMode) {
    console.log('🎭 Mock mode: Using current time as contest start');
    return NOW;
  }
  
  const envStart = import.meta.env.VITE_CONTEST_START;
  console.log('🔍 Environment VITE_CONTEST_START:', envStart);
  if (envStart) {
    return new Date(envStart).getTime();
  }
  return NOW - (5 * 60 * 1000); // Default: Started 5 minutes ago
};

const getContestEnd = (): number => {
  const useMockMode = import.meta.env.VITE_USE_MOCK_DATA === 'true';
  const startTime = getContestStart();
  
  if (useMockMode) {
    console.log('🎭 Mock mode: Setting 10-minute duration');
    return startTime + TEN_MINUTES;
  }
  
  const duration = import.meta.env.VITE_CONTEST_DURATION;
  console.log('⏱️ Environment VITE_CONTEST_DURATION:', duration);
  if (duration) {
    return startTime + (parseInt(duration) * 60 * 1000); // Convert minutes to milliseconds
  }
  return startTime + (4 * 60 * 60 * 1000); // Default: 4 hours duration
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
];
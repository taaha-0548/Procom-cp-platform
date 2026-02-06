export enum ProblemStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  WRONG_ANSWER = 'WRONG_ANSWER',
  TIME_LIMIT = 'TIME_LIMIT',
  NOT_ATTEMPTED = 'NOT_ATTEMPTED'
}

export interface ProblemData {
  id: string;
  label: string; // A, B, C...
  name: string;
}

export interface Submission {
  problemId: string;
  status: ProblemStatus;
  attempts: number;
  time: number; // Minutes since start
  isFirstBlood?: boolean;
}

export interface Team {
  id: string;
  name: string;
  university: string;
  solved: number;
  penalty: number;
  submissions: Record<string, Submission>;
  rank: number;
  trend: 'up' | 'down' | 'same';
}

export interface ContestConfig {
  title: string;
  startTime: number; // Unix timestamp
  endTime: number; // Unix timestamp
  problems: ProblemData[];
}

import { io, Socket } from 'socket.io-client';
import { Team, Submission, ProblemStatus } from './types';

// =========================================================================
// REAL BACKEND API SERVICE
// =========================================================================

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

// ==================== CONTEST TIMING API ====================
export interface ContestTimeResponse {
  startTime: string;
  endTime: string;
  duration: number;
}

export const fetchContestTime = async (): Promise<ContestTimeResponse | null> => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/getContestTime`);
    if (!response.ok) {
      console.error('Failed to fetch contest time:', response.statusText);
      return null;
    }
    const data = await response.json();
    console.log('✅ Fetched contest time from backend:', data);
    return data;
  } catch (error) {
    console.error('❌ Error fetching contest time:', error);
    return null;
  }
};
// ===========================================================


/**
 * Transform server leaderboard format to frontend Team structure
 * 
 * Server format: { rank, teamName, score, penalty, problems: [{status, time, penalty, firstSolve}] }
 * Frontend format: Team { id, name, rank, solved, penalty, submissions, ... }
 */
function transformServerDataToTeams(serverRows: any[]): Team[] {
  return serverRows.map((row, index) => {
    // Create submissions from problems array
    const submissions: Record<string, Submission> = {};

    row.problems?.forEach((problem: any, idx: number) => {
      const problemId = `p${idx + 1}`;

      // Map status string to ProblemStatus enum
      let status = ProblemStatus.NOT_ATTEMPTED;
      if (problem.status === 'Accepted') {
        status = ProblemStatus.ACCEPTED;
      } else if (problem.status === 'Failed') {
        status = ProblemStatus.WRONG_ANSWER;
      } else if (problem.status === 'Pending') {
        status = ProblemStatus.PENDING;
      }

      // Parse time string (e.g., "0:19:05") to minutes
      let timeInMinutes = 0;
      if (problem.time && problem.status === 'Accepted') {
        const timeParts = problem.time.split(':');
        if (timeParts.length === 3) {
          const hours = parseInt(timeParts[0]);
          const minutes = parseInt(timeParts[1]);
          timeInMinutes = hours * 60 + minutes;
        }
      }

      // Parse attempts from penalty field (e.g., "-1", "-2", etc.)
      // For unattempted problems, penalty is empty string
      let attempts = 0;
      if (problem.penalty && typeof problem.penalty === 'string') {
        const penaltyNum = parseInt(problem.penalty.replace('-', ''));
        if (!isNaN(penaltyNum)) {
          attempts = penaltyNum;
        }
      }

      submissions[problemId] = {
        problemId,
        status,
        attempts,
        time: timeInMinutes,
        isFirstBlood: problem.firstSolve === true,
      };
    });

    return {
      id: `team_${row.teamName}_${row.rank}`, // Unique ID based on team name and rank
      name: row.teamName,
      university: '', // Not provided by server, can be enhanced
      solved: parseInt(row.score) || 0,
      penalty: parseInt(row.penalty) || 0,
      submissions,
      rank: parseInt(row.rank) || index + 1,
      trend: 'same' as const, // Default, will be calculated by frontend
    };
  });
}

/**
 * Fetch initial leaderboard data from backend
 */
export async function fetchInitialLeaderboardData(): Promise<Team[]> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/getRanking`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log('Initial leaderboard data fetched:', data);

    // Handle both possible response formats
    const rows = data.rows || data;
    return transformServerDataToTeams(rows);
  } catch (error) {
    console.error('Error fetching initial leaderboard:', error);
    return [];
  }
}

/**
 * Fetch contest times (start and end)
 */
export async function fetchContestTimes(): Promise<{ startTime: string | null; endTime: string | null }> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/getContestTime`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return {
      startTime: data.startTime,
      endTime: data.endTime,
    };
  } catch (error) {
    console.error('Error fetching contest times:', error);
    return { startTime: null, endTime: null };
  }
}

/**
 * Set up Socket.io listener for real-time leaderboard updates
 * Calls callback whenever new data arrives
 */
export function setupRealtimeLeaderboardListener(
  onDataUpdate: (teams: Team[]) => void,
  onError?: (error: Error) => void
): () => void {
  let socket: Socket | null = null;

  try {
    socket = io(BACKEND_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      console.log('✅ Connected to leaderboard server');

      // Join scoreboard room to receive updates
      socket.emit('joinRoom', 'scoreboard');
    });

    socket.on('sendData', (payload: any) => {
      console.log('📊 New leaderboard data received:', payload);

      try {
        // Transform server data to frontend format
        const teams = transformServerDataToTeams(payload.rows || payload);
        onDataUpdate(teams);
      } catch (error) {
        console.error('Error processing leaderboard data:', error);
        onError?.(error as Error);
      }
    });

    socket.on('disconnect', () => {
      console.log('⚠️  Disconnected from leaderboard server');
    });

    socket.on('connect_error', (error: Error) => {
      console.error('Socket connection error:', error);
      onError?.(error);
    });

    // Return cleanup function
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  } catch (error) {
    console.error('Error setting up real-time listener:', error);
    onError?.(error as Error);
    return () => { /* no cleanup needed */ };
  }
}

/**
 * Fetch top 3 teams for a specific batch
 */
export async function fetchTopTeams(batch: string = 'scoreboard'): Promise<Team[]> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/getTopTeams/${batch}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const rows = Array.isArray(data) ? data : [data];
    return transformServerDataToTeams(rows);
  } catch (error) {
    console.error(`Error fetching top teams for batch ${batch}:`, error);
    return [];
  }
}

/**
 * Fetch house rankings (if available)
 */
export async function fetchHouseRankings(): Promise<any> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/getHouseRanking`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching house rankings:', error);
    return null;
  }
}

/**
 * Set contest times (start and end)
 * Admin function to update contest schedule
 * Note: Backend auth is optional - if no key provided, will try without authentication
 */
export async function setContestTimes(startTime: string, endTime: string): Promise<boolean> {
  try {
    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Try to include auth key if available in environment
    // This allows fallback if key is not configured
    const authKey = import.meta.env.VITE_AUTH_KEY;
    if (authKey) {
      headers['key'] = authKey;
    }

    const response = await fetch(`${BACKEND_URL}/api/postContestTime`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        startTime,
        endTime,
      }),
    });

    if (!response.ok) {
      console.warn(`⚠️  Failed to set contest times on backend: HTTP ${response.status}`);
      console.log('ℹ️  Contest times updated locally, but backend may not have been updated');
      // Still return true because frontend state is updated
      return true;
    }

    const data = await response.json();
    console.log('✅ Contest times updated on backend:', data);
    return true;
  } catch (error) {
    console.error('⚠️  Error setting contest times:', error);
    console.log('ℹ️  Contest times updated locally, backend may be unavailable');
    // Return true anyway since frontend state works independently
    return true;
  }
}

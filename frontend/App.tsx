import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { INITIAL_CONFIG, MOCK_TEAMS } from './constants';
import { Team, Submission } from './types';
import ScoreboardTable from './components/ScoreboardTable';
import GlitchText from './components/GlitchText';
import { Server, Volume2 } from 'lucide-react';
import {
  fetchInitialLeaderboardData,
  setupRealtimeLeaderboardListener
} from './api';

// =========================================================================
// CONSTANTS & TYPES
// =========================================================================

type Phase = 'idle' | 'before' | 'during' | 'after';
type AnimationState = 'idle' | 'emergency' | 'glitching';

// Centralized timing constants to ensure sync between audio and visuals
const TIMING = {
  SIMULATION_INTERVAL: 10000,    // Realistic polling (Every 10s)
  EMERGENCY_SOUND_DURATION: 3000,
  EMERGENCY_FADE_DURATION: 400,
  EMERGENCY_TOTAL_DURATION: 3400, // Sound + fade
  EMERGENCY_UPDATE_DELAY: 1200,   // When to swap teams during emergency
  GLITCH_SOUND_DURATION: 2600,
  GLITCH_FADE_DURATION: 400,
  GLITCH_TOTAL_DURATION: 3000,    // Sound + fade
  GLITCH_UPDATE_DELAY: 150,       // When to update teams during glitch
} as const;

// =========================================================================
// UTILITY FUNCTIONS (Outside component to prevent recreation)
// =========================================================================

// Ordinal suffix helper
function getOrdinalSuffix(n: number): string {
  if (n % 100 >= 11 && n % 100 <= 13) return 'th';
  switch (n % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}

// Format milliseconds to HH:MM:SS
function formatHMS(ms: number): string {
  if (ms <= 0) return '00:00:00';
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

// =========================================================================
// AUDIO MANAGEMENT
// =========================================================================

// Global audio reference to prevent multiple instances
let currentAudio: HTMLAudioElement | null = null;

function stopCurrentAudio() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
}

function fadeOutAudio(audio: HTMLAudioElement, fadeDuration: number, onComplete?: () => void) {
  const fadeSteps = 16;
  const step = audio.volume / fadeSteps;
  let i = 0;

  const fade = setInterval(() => {
    if (i++ < fadeSteps) {
      audio.volume = Math.max(0, audio.volume - step);
    } else {
      clearInterval(fade);
      audio.pause();
      if (currentAudio === audio) {
        currentAudio = null;
      }
      onComplete?.();
    }
  }, fadeDuration / fadeSteps);
}

// Play emergency siren for first place change
function playSiren(onComplete?: () => void): void {
  try {
    stopCurrentAudio();
    const audio = new Audio('/emergency-alarm-with-reverb-29431.mp3');
    audio.volume = 0.5;
    currentAudio = audio;

    audio.play().catch(e => console.error("Siren play error:", e));

    setTimeout(() => {
      if (currentAudio === audio) {
        fadeOutAudio(audio, TIMING.EMERGENCY_FADE_DURATION, onComplete);
      }
    }, TIMING.EMERGENCY_SOUND_DURATION);
  } catch (e) {
    console.log("Siren error:", e);
    onComplete?.();
  }
}

// Play radio-waves sound for top 10 changes
function playRadioWaves(onComplete?: () => void): void {
  try {
    stopCurrentAudio();
    const audio = new Audio('/radio-waves-248661.mp3');
    audio.volume = 0.5;
    currentAudio = audio;

    audio.play().catch(e => console.error("Radio-waves play error:", e));

    setTimeout(() => {
      if (currentAudio === audio) {
        fadeOutAudio(audio, TIMING.GLITCH_FADE_DURATION, onComplete);
      }
    }, TIMING.GLITCH_SOUND_DURATION);
  } catch (e) {
    console.log("Radio-waves error:", e);
    onComplete?.();
  }
}

// =========================================================================
// MAIN COMPONENT
// =========================================================================

const App: React.FC = () => {
  // Core state
  const [teams, setTeams] = useState<Team[]>(MOCK_TEAMS);
  const [config, setConfig] = useState(INITIAL_CONFIG);
  const [headlines, setHeadlines] = useState<string[]>([
    "Welcome to PROCOM'26 PhantomVerse!",
    "Contest has started. Good luck to all participants."
  ]);

  // Animation state machine - single source of truth
  const [animationState, setAnimationState] = useState<AnimationState>('idle');
  const animationStateRef = useRef<AnimationState>('idle');

  // Track the team currently being highlighted for dropping
  const [droppingTeamId, setDroppingTeamId] = useState<string | null>(null);

  // Contest phase management
  const [phase, setPhase] = useState<Phase>('idle');
  const [countdownDisplay, setCountdownDisplay] = useState<string>('--:--:--');
  const [countdownLabel, setCountdownLabel] = useState<string>('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const TEAMS_PER_PAGE = 20;
  const totalPages = Math.ceil(teams.length / TEAMS_PER_PAGE);

  // Memoize paginated teams to prevent recalculation
  const paginatedTeams = useMemo(() => {
    return teams.slice(
      (currentPage - 1) * TEAMS_PER_PAGE,
      currentPage * TEAMS_PER_PAGE
    );
  }, [teams, currentPage]);

  // Sound toggle
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);
  const [audioInitialized, setAudioInitialized] = useState<boolean>(false);
  const isSoundEnabledRef = useRef<boolean>(true);

  // Refs for cleanup
  const teamsRef = useRef(MOCK_TEAMS);
  const animationTimeoutsRef = useRef<number[]>([]);
  const cleanupRealtimeRef = useRef<(() => void) | null>(null);

  // Keep refs in sync
  useEffect(() => {
    animationStateRef.current = animationState;

    // Safety Watchdog: If animation gets stuck for > 6 seconds, force reset
    // This handles any edge case where the end callback is dropped
    if (animationState !== 'idle') {
      const safetyId = window.setTimeout(() => {
        console.warn(`⚠️ Animation watchdog triggered! Force resetting ${animationState} to idle.`);
        setAnimationState('idle');
        animationStateRef.current = 'idle';
        setDroppingTeamId(null);
      }, 6000); // 6s is safely longer than longest animation (3.4s)
      return () => window.clearTimeout(safetyId);
    }
  }, [animationState]);

  // Keep isSoundEnabledRef in sync
  useEffect(() => {
    isSoundEnabledRef.current = isSoundEnabled;
    console.log('🔊 Sound state updated:', isSoundEnabled);
  }, [isSoundEnabled]);

  // Fix race condition: Stop audio and reset state when sound is disabled
  useEffect(() => {
    if (!isSoundEnabled) {
      stopCurrentAudio();

      // If glitch animation was playing (which relies on audio callback),
      // we must manually reset state because the audio callback won't fire
      if (animationStateRef.current === 'glitching') {
        setAnimationState('idle');
        animationStateRef.current = 'idle';
      }
    }
  }, [isSoundEnabled]);

  // Mock simulation for testing animations
  const startMockSimulation = useCallback(() => {
    let iteration = 0;

    const simulateUpdate = () => {
      iteration++;
      console.log(`🎬 Mock simulation iteration ${iteration}`);

      const currentTeams = [...teamsRef.current];
      const updatedTeams = currentTeams.map(team => ({ ...team }));

      // Every 3rd iteration: Swap first place (triggers emergency animation)
      if (iteration % 3 === 0) {
        console.log('🚨 Simulating FIRST PLACE CHANGE');
        [updatedTeams[0], updatedTeams[1]] = [updatedTeams[1], updatedTeams[0]];
        updatedTeams[0].solved += 1;
        updatedTeams[0].penalty += 5;
      }
      // Every 2nd iteration (not 3rd): Swap teams 2-4 (triggers glitch animation)
      else if (iteration % 2 === 0) {
        console.log('⚡ Simulating TOP 5 CHANGE');
        [updatedTeams[2], updatedTeams[3]] = [updatedTeams[3], updatedTeams[2]];
        updatedTeams[2].solved += 1;
        updatedTeams[2].penalty += 3;
      }
      // Other iterations: Small changes in middle (silent update)
      else {
        console.log('📊 Simulating SILENT UPDATE');
        const randomIdx = 5 + Math.floor(Math.random() * 5);
        if (updatedTeams[randomIdx]) {
          updatedTeams[randomIdx].solved += 1;
          updatedTeams[randomIdx].penalty += 2;
        }
      }

      // Update ranks
      updatedTeams.sort((a, b) => {
        if (b.solved !== a.solved) return b.solved - a.solved;
        return a.penalty - b.penalty;
      });
      updatedTeams.forEach((team, idx) => {
        team.rank = idx + 1;
      });

      // Trigger update through the same animation logic
      const oldFirst = teamsRef.current[0];
      const newFirst = updatedTeams[0];
      const firstPlaceChanged = oldFirst?.id !== newFirst?.id;

      let top5Changed = false;
      for (let i = 1; i < 5; i++) {
        if (teamsRef.current[i] && updatedTeams[i] && teamsRef.current[i].id !== updatedTeams[i].id) {
          top5Changed = true;
          break;
        }
      }

      teamsRef.current = updatedTeams;

      if (animationStateRef.current === 'idle') {
        if (firstPlaceChanged) {
          triggerEmergencyAnimation(oldFirst, newFirst, updatedTeams);
        } else if (top5Changed) {
          triggerGlitchAnimation(updatedTeams);
        } else {
          triggerSilentUpdate(updatedTeams);
        }
      } else {
        setTeams(updatedTeams);
      }
    };

    // Run simulation every 8 seconds
    const intervalId = setInterval(simulateUpdate, 8000);

    // Store for cleanup
    cleanupRealtimeRef.current = () => clearInterval(intervalId);
  }, []);

  // Initialize teams and fetch real data from backend
  useEffect(() => {
    const initializeApp = async () => {
      const useMockMode = import.meta.env.VITE_USE_MOCK_DATA === 'true';

      if (useMockMode) {
        console.log('🎭 Running in MOCK MODE for testing animations...');
        setTeams(MOCK_TEAMS);
        teamsRef.current = MOCK_TEAMS;

        // Start mock simulation
        startMockSimulation();
        return;
      }

      // Production mode: Initialize with real backend data
      console.log('🚀 Initializing app with real backend data...');
      console.log('⏰ Using current time as contest start with 10-minute duration');

      try {
        // Fetch initial leaderboard data
        const initialTeams = await fetchInitialLeaderboardData();
        if (initialTeams.length > 0) {
          console.log('✅ Initial teams loaded:', initialTeams.length);
          setTeams(initialTeams);
          teamsRef.current = initialTeams;
        } else {
          console.warn('⚠️  No initial data from backend, using mock data');
          setTeams(MOCK_TEAMS);
          teamsRef.current = MOCK_TEAMS;
        }

        // Set up real-time Socket.io listener
        console.log('🔌 Setting up real-time leaderboard listener...');
        const cleanup = setupRealtimeLeaderboardListener(
          (updatedTeams) => {
            console.log('📊 Real-time update received:', updatedTeams.length);

            // Update teamsRef
            teamsRef.current = updatedTeams;

            // Only trigger animation if we're during contest and animation is idle
            if (phase === 'during' && animationStateRef.current === 'idle') {
              const oldFirst = teamsRef.current[0];
              const newFirst = updatedTeams[0];
              const firstPlaceChanged = oldFirst?.id !== newFirst?.id;

              // Check if ranks 2-5 changed
              let top5Changed = false;
              for (let i = 1; i < 5; i++) {
                if (teamsRef.current[i] && updatedTeams[i] && teamsRef.current[i].id !== updatedTeams[i].id) {
                  top5Changed = true;
                  break;
                }
              }

              // Determine which animation to play
              if (firstPlaceChanged) {
                triggerEmergencyAnimation(oldFirst, newFirst, updatedTeams);
              } else if (top5Changed) {
                triggerGlitchAnimation(updatedTeams);
              } else {
                triggerSilentUpdate(updatedTeams);
              }
            } else {
              // Just update teams silently if outside contest or animation running
              setTeams(updatedTeams);
            }
          },
          (error) => {
            console.error('❌ Realtime listener error:', error);
          }
        );

        cleanupRealtimeRef.current = cleanup;
      } catch (error) {
        console.error('Error initializing app:', error);
        // Fallback to mock data
        setTeams(MOCK_TEAMS);
        teamsRef.current = MOCK_TEAMS;
      }
    };

    initializeApp();

    // Cleanup on unmount
    return () => {
      if (cleanupRealtimeRef.current) {
        cleanupRealtimeRef.current();
      }
    };
  }, []);

  // Keep teamsRef in sync
  useEffect(() => {
    teamsRef.current = teams;
  }, [teams]);

  // =========================================================================
  // REALTIME UPDATE ENGINE (replaces simulation - uses Socket.io)
  // =========================================================================

  // Cleanup all animation timeouts on unmount
  useEffect(() => {
    return () => {
      animationTimeoutsRef.current.forEach(clearTimeout);
      animationTimeoutsRef.current = [];
      if (cleanupRealtimeRef.current) {
        cleanupRealtimeRef.current();
      }
    };
  }, []);

  // Helper to schedule timeouts with cleanup tracking
  const scheduleTimeout = useCallback((fn: () => void, delay: number): number => {
    const id = window.setTimeout(() => {
      fn();
      // Remove from tracked timeouts after execution
      animationTimeoutsRef.current = animationTimeoutsRef.current.filter(t => t !== id);
    }, delay);
    animationTimeoutsRef.current.push(id);
    return id;
  }, []);

  // Clear all pending timeouts
  const clearAllTimeouts = useCallback(() => {
    animationTimeoutsRef.current.forEach(id => window.clearTimeout(id));
    animationTimeoutsRef.current = [];
  }, []);

  // =========================================================================
  // CONTEST PHASE MANAGEMENT
  // =========================================================================

  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const startTime = config.startTime;
      const endTime = config.endTime;

      if (now < startTime) {
        setPhase('before');
        setCountdownLabel('Starts in');
        setCountdownDisplay(formatHMS(startTime - now));
      } else if (now >= startTime && now <= endTime) {
        setPhase('during');
        setCountdownLabel('Ends in');
        setCountdownDisplay(formatHMS(endTime - now));
      } else {
        setPhase('after');
        setCountdownLabel('');
        setCountdownDisplay('Contest Ended');
        // Stop all real-time updates when contest ends
        clearAllTimeouts();
        if (cleanupRealtimeRef.current) {
          console.log('🛑 Contest ended - cleaning up real-time listener');
          cleanupRealtimeRef.current();
          cleanupRealtimeRef.current = null;
        }
      }
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [config]);

  // =========================================================================
  // ANIMATION HANDLERS
  // =========================================================================

  // Handle emergency animation (first place change)
  const triggerEmergencyAnimation = useCallback((
    oldFirst: Team,
    newFirst: Team,
    rankedTeams: Team[]
  ) => {
    // Guard: Only one animation at a time
    if (animationStateRef.current !== 'idle') {
      console.log(`Animation blocked: ${animationStateRef.current} already running`);
      return;
    }

    // Set animation state
    setAnimationState('emergency');
    animationStateRef.current = 'emergency';

    // Highlight the dropping team
    setDroppingTeamId(oldFirst.id);

    // Play sound if enabled
    if (isSoundEnabledRef.current) {
      console.log('🚨 Playing emergency siren (sound enabled)');
      playSiren();
    } else {
      console.log('🔇 Siren muted');
    }

    // Update teams after delay (while sound/animation is playing)
    scheduleTimeout(() => {
      setTeams(rankedTeams);
      setDroppingTeamId(null);
    }, TIMING.EMERGENCY_UPDATE_DELAY);

    // End animation after full duration
    scheduleTimeout(() => {
      setAnimationState('idle');
      animationStateRef.current = 'idle';
    }, TIMING.EMERGENCY_TOTAL_DURATION);

  }, [isSoundEnabled, scheduleTimeout]);

  // Handle glitch animation (top 10 change)
  const triggerGlitchAnimation = useCallback((rankedTeams: Team[]) => {
    // Guard: Only one animation at a time
    if (animationStateRef.current !== 'idle') {
      console.log(`Animation blocked: ${animationStateRef.current} already running`);
      return;
    }

    // Set animation state
    setAnimationState('glitching');
    animationStateRef.current = 'glitching';

    // Update teams mid-glitch
    scheduleTimeout(() => {
      setTeams(rankedTeams);
    }, TIMING.GLITCH_UPDATE_DELAY);

    // Handle animation end
    const endAnimation = () => {
      setAnimationState('idle');
      animationStateRef.current = 'idle';
    };

    if (isSoundEnabledRef.current) {
      console.log('⚡ Playing glitch sound (sound enabled)');
      playRadioWaves(endAnimation);
    } else {
      console.log('🔇 Glitch sound muted');
      // No sound: use timer fallback
      scheduleTimeout(endAnimation, TIMING.GLITCH_TOTAL_DURATION);
    }

  }, [isSoundEnabled, scheduleTimeout]);

  // Handle silent update (lower rank changes)
  const triggerSilentUpdate = useCallback((rankedTeams: Team[]) => {
    setTeams(rankedTeams);
  }, []);



  // =========================================================================
  // SIMULATION ENGINE (Removed - Now using real Socket.io updates)
  // =========================================================================

  useEffect(() => {
    // The real-time updates are now handled by Socket.io listener in initialization
    // This effect is no longer needed since we have setupRealtimeLeaderboardListener
    return () => { };
  }, []);

  // =========================================================================
  // RENDER
  // =========================================================================

  // Derive boolean states for components
  const isEmergency = animationState === 'emergency';
  const isGlitching = animationState === 'glitching';

  return (
    <div className={`min-h-screen font-sans text-gray-200 selection:bg-phantom-error selection:text-white pb-20 relative overflow-x-hidden ${isEmergency ? 'overflow-hidden' : ''}`}>

      {/* ====== STABILIZED ILLUSION BACKGROUND ====== */}

      {/* Background is largely handled by body CSS (Red Star Pulse) */}
      <div className="noise-overlay"></div>

      {/* Layer 2: Broken Mesh / Scanline (Optional, subtle loop) */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02] z-0"
        style={{ backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))', backgroundSize: '100% 2px, 3px 100%' }}>
      </div>



      {/* Layer 5: Grid pattern overlay (subtle) */}
      <div
        className="fixed inset-0 -z-10 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(217,70,239,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(217,70,239,0.3) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      ></div>

      {/* Emergency Flash Overlay */}
      {isEmergency && (
        <div className="fixed inset-0 bg-[#ff2a4d] z-50 mix-blend-overlay pointer-events-none opacity-40 animate-pulse"></div>
      )}

      {/* Header Section */}
      <header className="pt-2 pb-2 px-4 md:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-6">

          {/* Logo Area */}
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-8 z-10 w-full lg:w-auto">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <img
                  src="/procom-logo.webp"
                  alt="Procom Logo"
                  className="h-56 w-56 object-contain drop-shadow-2xl"
                  style={{ background: 'none', border: 'none' }}
                />
              </div>
            </div>

            {/* Vertical Separator */}
            <div className="hidden md:block w-[1px] h-12 bg-gray-700/50"></div>

            {/* Title */}
            <div className="flex flex-col">
              <GlitchText
                text="COMPETITIVE PROGRAMMING"
                as="h2"
                className="text-3xl md:text-4xl font-orbitron font-bold tracking-wider italic glow-text"
              />
              <div className="text-3xl md:text-4xl font-orbitron font-bold tracking-wider italic uppercase mt-0 relative inline-block">
                {/* Main Gradient Text */}
                <span className="relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-phantom-neon via-phantom-laser to-rose-500">
                  PhantomVerse
                </span>
                {/* Glitch Layer 1 - Neon (Always On) */}
                <span className="absolute top-0 left-0 -ml-0.5 translate-x-[2px] text-phantom-neon opacity-70 animate-glitch-2 z-0 mix-blend-screen pointer-events-none">
                  PhantomVerse
                </span>
                {/* Glitch Layer 2 - Blood (Always On) */}
                <span className="absolute top-0 left-0 -ml-0.5 -translate-x-[2px] text-phantom-blood opacity-70 animate-glitch-1 z-0 mix-blend-screen pointer-events-none">
                  PhantomVerse
                </span>
              </div>
            </div>
          </div>

          {/* Contest Info & Timer */}
          <div className="flex flex-col items-center lg:items-end z-10">
            <div className="mb-2 flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full animate-pulse ${phase === 'during' ? 'bg-green-500' : phase === 'before' ? 'bg-yellow-500' : 'bg-gray-500'}`}></span>
              <span className={`font-bold font-mono text-sm uppercase tracking-widest ${phase === 'during' ? 'text-green-500' : phase === 'before' ? 'text-yellow-500' : 'text-gray-500'}`}>
                {phase === 'before' ? 'Contest Starts' : phase === 'during' ? 'Contest Live' : 'Contest Ended'}
              </span>
            </div>
            <div className="text-3xl md:text-4xl font-orbitron font-bold text-amber-500 tabular-nums">
              {countdownLabel && <span className="text-sm text-gray-300">{countdownLabel} </span>}
              {countdownDisplay}
            </div>
          </div>
        </div>

        {/* Decorative line */}
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-phantom-blood/50 to-transparent transform -translate-y-1/2 -z-10"></div>
      </header>

      {/* ... (Start line shift compensation) ... actually no need to compensate if using separate chunks but careful with context */}

      {/* Sound Toggle Button */}
      <button
        onClick={() => {
          console.log('🔊 Sound button clicked! Current state:', isSoundEnabled);
          if (!audioInitialized) {
            console.log('🎵 Initializing audio...');
            const dummy = new Audio();
            dummy.volume = 0;
            dummy.play().catch(() => { });
            setAudioInitialized(true);
          }
          setIsSoundEnabled(!isSoundEnabled);
          console.log('🔊 Sound toggled to:', !isSoundEnabled);
        }}
        className="fixed top-6 right-6 z-[100] bg-erevos-deep/80 hover:bg-phantom-error/20 transition-all duration-200 rounded-lg p-3 text-solid-bone border border-phantom-blood hover:border-phantom-error cursor-pointer backdrop-blur-md"
        title={isSoundEnabled ? "Mute" : "Unmute"}
      >
        <Volume2 size={24} className={isSoundEnabled ? "text-cyan-400" : "text-red-500"} />
      </button>

      {/* Main Scoreboard Area */}
      <main className="max-w-[98%] xl:max-w-[96%] mx-auto px-2 md:px-4 z-10 relative mb-24">
        <div className="flex justify-between items-end mb-2 px-2">
          <h3 className="text-xl font-orbitron text-solid-bone flex items-center gap-2 tracking-widest">
            <Server className="text-phantom-error" /> LIVE STANDINGS
          </h3>
          <div className="text-xs font-mono text-ghost-cyan">
            SYNC: <span className="text-phantom-error animate-pulse">STABLE</span>
          </div>
        </div>

        <ScoreboardTable
          teams={paginatedTeams}
          problems={config.problems}
          isEmergency={isEmergency}
          isGlitching={isGlitching}
          droppingTeamId={droppingTeamId}
        />

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-6 py-2 bg-phantom-crimson/40 hover:bg-phantom-crimson/60 disabled:opacity-30 disabled:cursor-not-allowed text-white font-orbitron rounded border border-phantom-blood hover:border-phantom-neon/50 transition-all backdrop-blur-sm"
            >
              Previous
            </button>
            <span className="text-white font-orbitron">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-6 py-2 bg-phantom-crimson/40 hover:bg-phantom-crimson/60 disabled:opacity-30 disabled:cursor-not-allowed text-white font-orbitron rounded border border-phantom-blood hover:border-phantom-neon/50 transition-all backdrop-blur-sm"
            >
              Next
            </button>
          </div>
        )}
      </main>


      {/* Before Contest Modal */}
      {phase === 'before' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
          <div className="mx-4 rounded-2xl bg-phantom-purple/90 shadow-2xl border-4 border-phantom-neon px-8 py-10 text-center">
            <div className="text-4xl md:text-5xl font-orbitron text-white mb-2">
              Preparing for Liftoff...
            </div>
            <div className="text-2xl md:text-3xl font-orbitron text-phantom-neon mb-6">
              Contest starts soon!
            </div>
            <div className="text-4xl font-orbitron font-bold text-phantom-cyan tabular-nums">
              {countdownDisplay}
            </div>
          </div>
        </div>
      )}

      {/* After Contest Modal - Split Reality Podium */}
      {phase === 'after' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
          <div
            className="mx-4 rounded-2xl px-8 py-10 text-center max-w-4xl w-full backdrop-blur-xl"
            style={{
              background: 'linear-gradient(90deg, rgba(74, 5, 11, 0.95) 0%, rgba(0, 0, 0, 0.9) 50%, rgba(0, 50, 50, 0.95) 100%)',
              backgroundColor: '#050000',
              backgroundImage: 'radial-gradient(circle at 0% 50%, rgba(220, 20, 60, 0.6) 0%, rgba(100, 0, 0, 0.4) 40%, transparent 70%), radial-gradient(circle at 100% 50%, rgba(0, 255, 255, 0.5) 0%, rgba(0, 100, 100, 0.4) 40%, transparent 70%), linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.8))',
              border: '1px solid',
              borderImage: 'linear-gradient(90deg, #ff2a4d 0%, #000000 50%, #00ffff 100%) 1',
              boxShadow: '0 0 30px rgba(255, 42, 77, 0.3), 0 0 30px rgba(0, 255, 255, 0.3)'
            }}
          >
            <div
              className="text-4xl md:text-5xl font-orbitron mb-6 tracking-wider text-white"
              style={{
                textShadow: '0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(255, 42, 77, 0.4), 0 0 20px rgba(0, 255, 255, 0.4)'
              }}
            >
              CONTEST ENDED
            </div>

            {/* Top 3 Winners */}
            <div className="mb-8">
              <div
                className="text-xl font-orbitron mb-6"
                style={{
                  color: '#aaaaaa',
                  textShadow: '0 0 10px rgba(255, 255, 255, 0.2)'
                }}
              >
                TOP 2 CHAMPIONS
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {teams.slice(0, 2).map((team, index) => {
                  // Rank #1: Red Reality Champion
                  // Rank #2 & #3: Cyan Ghost Runners-up
                  const isRedChampion = index === 0;
                  const borderColor = isRedChampion ? '#ff2a4d' : '#00ffff';
                  const textColor = isRedChampion ? '#ff2a4d' : '#00ffff';
                  const glowColor = isRedChampion
                    ? '0 0 20px rgba(255, 42, 77, 0.5), 0 0 40px rgba(255, 42, 77, 0.2)'
                    : '0 0 20px rgba(0, 255, 255, 0.5), 0 0 40px rgba(0, 255, 255, 0.2)';
                  const textShadow = isRedChampion
                    ? '0 0 15px rgba(255, 42, 77, 0.8)'
                    : '0 0 15px rgba(0, 255, 255, 0.8)';
                  const podiumSizes = ['text-2xl', 'text-xl', 'text-lg'];

                  return (
                    <div
                      key={team.id}
                      className="relative rounded-lg p-8 backdrop-blur-md transform transition-all duration-300 hover:scale-105 hover:-translate-y-2 overflow-hidden"
                      style={{
                        background: 'linear-gradient(180deg, rgba(20, 20, 20, 0.9) 0%, rgba(10, 10, 10, 0.95) 100%)',
                        boxShadow: `0 20px 40px -10px ${isRedChampion ? 'rgba(255, 42, 77, 0.6)' : 'rgba(0, 255, 255, 0.5)'}, inset 0 -4px 0 0 ${isRedChampion ? '#ff2a4d' : '#00ffff'}`
                      }}
                    >
                      {/* Top spotlight line */}
                      <div
                        className="absolute top-0 left-0 right-0 h-[2px]"
                        style={{
                          background: `linear-gradient(90deg, transparent, ${isRedChampion ? '#ff2a4d' : '#00ffff'}, transparent)`,
                          opacity: 0.8
                        }}
                      />

                      <div
                        className="text-3xl font-orbitron font-bold mb-3"
                        style={{
                          color: textColor,
                          textShadow: textShadow
                        }}
                      >
                        #{team.rank}
                      </div>
                      <div className="text-white font-orbitron text-2xl mb-4">{team.name}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div
              className="text-xl font-orbitron text-white"
              style={{
                textShadow: '0 0 10px rgba(255, 255, 255, 0.6)'
              }}
            >
              Congratulations to all participants!
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default App;
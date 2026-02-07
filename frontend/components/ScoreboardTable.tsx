import React, { memo, useMemo } from 'react';
import { Team, ProblemData } from '../types';
import ProblemCell from './ProblemCell';
import { Trophy, TrendingUp, TrendingDown, Minus, AlertOctagon } from 'lucide-react';
import { motion } from 'framer-motion';

interface ScoreboardTableProps {
  teams: Team[];
  problems: ProblemData[];
  isEmergency?: boolean;
  isGlitching?: boolean;
  droppingTeamId?: string | null;
}

// Optimized class builder
const getRowClasses = (isDropping: boolean, isEmergency: boolean, rank: number) => {
  // Mirror Surface Row: Prominent styling for top 3
  let baseClass = 'group transition-all duration-300 border-b border-white/5 relative';
  
  // Add prominent colors for top 3 positions based on actual rank
  if (rank === 1 && !isDropping && !isEmergency) {
    baseClass += ' bg-gradient-to-r from-yellow-500/20 via-yellow-600/10 to-transparent border-l-4 border-l-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.3)]';
  } else if (rank === 2 && !isDropping && !isEmergency) {
    baseClass += ' bg-gradient-to-r from-gray-300/20 via-gray-400/10 to-transparent border-l-4 border-l-gray-300 shadow-[0_0_15px_rgba(209,213,219,0.25)]';
  } else if (rank === 3 && !isDropping && !isEmergency) {
    baseClass += ' bg-gradient-to-r from-orange-600/20 via-orange-700/10 to-transparent border-l-4 border-l-orange-500 shadow-[0_0_15px_rgba(234,88,12,0.25)]';
  }

  if (isDropping) {
    return `${baseClass} bg-[rgba(255,42,77,0.15)] border-l-4 border-l-[#ff2a4d] shadow-[inset_0_0_20px_rgba(255,42,77,0.05)] z-10`;
  }

  if (isEmergency && rank === 1) {
    return `${baseClass} bg-[rgba(255,42,77,0.15)] border-l-4 border-l-[#ff2a4d] shadow-[inset_0_0_20px_rgba(255,42,77,0.05)] z-10`;
  }

  return baseClass;
};

// Motion Table Row
const TableRow = memo(({ team, index, problems, isEmergency, isGlitching, isDropping }:
  { team: Team; index: number; problems: ProblemData[]; isEmergency?: boolean; isGlitching?: boolean; isDropping: boolean }) => {

  return (
    <motion.tr
      initial={false}
      className={getRowClasses(isDropping, isEmergency || false, team.rank)}
      style={{ position: 'relative' }}
    >
      <td className="p-2 sm:p-3 md:p-4 text-center">
        <div className="flex flex-col items-center justify-center">
          {isEmergency && index === 0 && !isDropping ? (
            <AlertOctagon className="text-phantom-error mb-1 animate-spin" size={16} />
          ) : (
            <>
              {team.rank === 1 && <Trophy className={`mb-1 animate-pulse ${isDropping ? 'text-white' : 'text-yellow-400 drop-shadow-[0_0_15px_rgba(234,179,8,0.8)]'}`} size={18} />}
              {team.rank === 2 && <Trophy className="text-gray-300 mb-1 drop-shadow-[0_0_10px_rgba(209,213,219,0.6)]" size={16} />}
              {team.rank === 3 && <Trophy className="text-orange-500 mb-1 drop-shadow-[0_0_10px_rgba(234,88,12,0.6)]" size={14} />}
            </>
          )}

          <span className={`font-mono font-bold text-sm sm:text-base md:text-lg ${team.rank <= 3 || isEmergency || isDropping ? 'text-solid-bone' : 'text-gray-500'} transition-all`}>
            {team.rank}
          </span>
          {!isEmergency && !isDropping && (
            <>
              {team.trend === 'up' && <TrendingUp className="text-emerald-500 w-2.5 h-2.5 sm:w-3 sm:h-3" />}
              {team.trend === 'down' && <TrendingDown className="text-phantom-error w-2.5 h-2.5 sm:w-3 sm:h-3" />}
              {team.trend === 'same' && <Minus className="text-gray-700 w-2.5 h-2.5 sm:w-3 sm:h-3" />}
            </>
          )}
        </div>
      </td>
      <td className="p-2 sm:p-3 md:p-4 w-36 sm:w-48 md:w-64">
        <div className="flex items-center">
          <h3 className={`font-mono font-bold tracking-wide transition-colors truncate ${
            team.rank === 1 ? 'text-yellow-300 drop-shadow-[0_0_8px_rgba(234,179,8,0.6)] text-base sm:text-xl md:text-2xl lg:text-3xl' :
            team.rank === 2 ? 'text-gray-100 drop-shadow-[0_0_8px_rgba(209,213,219,0.6)] text-base sm:text-xl md:text-2xl lg:text-3xl' :
            team.rank === 3 ? 'text-orange-300 drop-shadow-[0_0_8px_rgba(234,88,12,0.6)] text-base sm:text-xl md:text-2xl lg:text-3xl' :
            'text-white text-sm sm:text-base md:text-lg lg:text-2xl'
          } ${team.rank <= 3 || (isEmergency && team.rank === 1) ? 'chromatic-aberration' : ''} ${isEmergency && team.rank === 1 ? 'text-phantom-error text-base sm:text-xl md:text-2xl lg:text-3xl' : ''}`}>
            {team.name}
          </h3>
        </div>
      </td>
      <td className="p-2 sm:p-3 md:p-4 text-center">
        <span className="font-orbitron font-bold text-base sm:text-lg md:text-xl lg:text-2xl text-ghost-cyan">
          {team.solved}
        </span>
      </td>
      <td className="p-2 sm:p-3 md:p-4 text-center">
        <span className="font-mono text-xs sm:text-sm md:text-base text-gray-500 transition-colors">{team.penalty}</span>
      </td>
      {problems.map(prob => (
        <td key={prob.id} className="p-0.5 sm:p-1">
          <ProblemCell submission={team.submissions[prob.id]} />
        </td>
      ))}
    </motion.tr>
  );
});

TableRow.displayName = 'TableRow';

const ScoreboardTable: React.FC<ScoreboardTableProps> = memo(({ teams, problems, isEmergency, isGlitching, droppingTeamId }) => {

  const containerClasses = useMemo(() => {
    // Mirror Glass Panel: Darker background to stand out against fracture lines
    const baseClasses = 'w-full overflow-x-auto rounded border border-white/10 border-b-2 border-b-[#ff2a4d] bg-[rgba(10,0,0,0.6)] backdrop-blur-[6px] shadow-[0_10px_50px_rgba(255,42,77,0.15)] relative transition-all duration-500';
    const emergencyClasses = isEmergency
      ? 'border-[#ff2a4d] shadow-[0_0_30px_rgba(255,42,77,0.5)] animate-pulse-fast'
      : '';
    const glitchClasses = isGlitching
      ? 'animate-glitch-heavy chromatic-aberration'
      : '';
    return `${baseClasses} ${emergencyClasses} ${glitchClasses}`;
  }, [isEmergency, isGlitching]);

  const containerStyle = useMemo(() => ({
    filter: isGlitching ? 'brightness(1.2) saturate(1.5)' : 'none',
    transition: isGlitching ? 'none' : 'filter 400ms ease-out'
  }), [isGlitching]);

  return (
    <>
      {/* Mobile Scroll Hint */}
      <div className="md:hidden text-center text-xs text-ghost-cyan/70 mb-2 font-mono animate-pulse">
        Swipe for details
      </div>
      
      <div className={containerClasses} style={containerStyle}>
      {isEmergency && (
        <div className="absolute inset-0 bg-phantom-error/10 z-0 pointer-events-none mix-blend-overlay"></div>
      )}

      <table className="w-full border-collapse min-w-[600px] sm:min-w-[700px] md:min-w-[800px] relative z-10">
        <thead>
          <tr className={`border-b border-phantom-error/50 bg-erevos-deep/80 backdrop-blur-md text-left transition-colors duration-500`}>
            <th className={`p-2 sm:p-3 md:p-4 font-orbitron font-bold tracking-wider w-12 sm:w-14 md:w-16 text-center text-solid-bone text-xs sm:text-sm`}>RANK</th>
            <th className="p-2 sm:p-3 md:p-4 font-orbitron text-solid-bone tracking-wider w-36 sm:w-48 md:w-64 uppercase tracking-[0.1em] sm:tracking-[0.15em] md:tracking-[0.2em] text-[10px] sm:text-xs md:text-sm">TEAM</th>
            <th className="p-2 sm:p-3 md:p-4 font-orbitron text-solid-bone tracking-wider text-center w-16 sm:w-20 md:w-24 uppercase tracking-[0.1em] sm:tracking-[0.15em] md:tracking-[0.2em] text-[10px] sm:text-xs md:text-sm">SOLVED</th>
            <th className="p-2 sm:p-3 md:p-4 font-orbitron text-solid-bone tracking-wider text-center w-16 sm:w-20 md:w-24 uppercase tracking-[0.1em] sm:tracking-[0.15em] md:tracking-[0.2em] text-[10px] sm:text-xs md:text-sm">PENALTY</th>
            {problems.map(prob => (
              <th key={prob.id} className="p-0.5 sm:p-1 font-mono text-center w-10 sm:w-11 md:w-12 text-[10px] sm:text-xs md:text-sm" title={prob.name}>
                <span className="text-ghost-cyan font-bold opacity-80">{prob.label}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {teams.map((team, index) => {
            const isDropping = droppingTeamId === team.id;
            return (
              <TableRow
                key={team.id}
                team={team}
                index={index}
                problems={problems}
                isEmergency={isEmergency}
                isGlitching={isGlitching}
                isDropping={isDropping}
              />
            );
          })}
        </tbody>
      </table>
    </div>
    </>
  );
});

ScoreboardTable.displayName = 'ScoreboardTable';

export default ScoreboardTable;
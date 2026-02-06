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
const getRowClasses = (isDropping: boolean, isEmergency: boolean, index: number) => {
  // Mirror Surface Row: Subtle separation with neon crimson glow on hover
  const baseClass = 'group transition-all duration-300 border-b border-white/5 hover:bg-[rgba(255,42,77,0.05)] hover:shadow-[inset_0_0_20px_rgba(255,42,77,0.05)] relative';

  if (isDropping) {
    return `${baseClass} bg-[rgba(255,42,77,0.15)] border-l-3 border-l-[#ff2a4d] shadow-[inset_0_0_20px_rgba(255,42,77,0.05)] z-10`;
  }

  if (isEmergency && index === 0) {
    return `${baseClass} bg-[rgba(255,42,77,0.15)] border-l-3 border-l-[#ff2a4d] shadow-[inset_0_0_20px_rgba(255,42,77,0.05)] z-10`;
  }

  return baseClass;
};

// Motion Table Row
const TableRow = memo(({ team, index, problems, isEmergency, isGlitching, isDropping }:
  { team: Team; index: number; problems: ProblemData[]; isEmergency?: boolean; isGlitching?: boolean; isDropping: boolean }) => {

  return (
    <motion.tr
      initial={false}
      className={getRowClasses(isDropping, isEmergency || false, index)}
      style={{ position: 'relative' }}
    >
      <td className="p-4 text-center">
        <div className="flex flex-col items-center justify-center">
          {isEmergency && index === 0 && !isDropping ? (
            <AlertOctagon className="text-phantom-error mb-1 animate-spin" size={24} />
          ) : (
            <>
              {team.rank === 1 && <Trophy className={`mb-1 animate-pulse ${isDropping ? 'text-white' : 'text-slate-200 drop-shadow-[0_0_10px_rgba(255,255,255,0.6)]'}`} size={20} />}
              {team.rank === 2 && <Trophy className="text-slate-400 mb-1" size={18} />}
              {team.rank === 3 && <Trophy className="text-slate-600 mb-1" size={18} />}
            </>
          )}

          <span className={`font-mono font-bold text-lg ${index < 3 || isEmergency || isDropping ? 'text-solid-bone' : 'text-gray-500'} group-hover:text-solid-bone transition-all`}>
            {team.rank}
          </span>
          {!isEmergency && !isDropping && (
            <>
              {team.trend === 'up' && <TrendingUp size={12} className="text-emerald-500" />}
              {team.trend === 'down' && <TrendingDown size={12} className="text-phantom-error" />}
              {team.trend === 'same' && <Minus size={12} className="text-gray-700" />}
            </>
          )}
        </div>
      </td>
      <td className="p-4 w-64">
        <div className="flex items-center">
          <h3 className={`font-mono font-bold text-2xl tracking-wide transition-colors ${index < 3 || (isEmergency && index === 0) ? 'chromatic-aberration' : ''} ${isEmergency && index === 0 ? 'text-phantom-error text-3xl' : 'text-white'}`}>
            {team.name}
          </h3>
        </div>
      </td>
      <td className="p-4 text-center">
        <span className="font-orbitron font-bold text-2xl text-ghost-cyan">
          {team.solved}
        </span>
      </td>
      <td className="p-4 text-center">
        <span className="font-mono text-gray-500 group-hover:text-solid-bone transition-colors">{team.penalty}</span>
      </td>
      {problems.map(prob => (
        <td key={prob.id} className="p-1">
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
    <div className={containerClasses} style={containerStyle}>
      {isEmergency && (
        <div className="absolute inset-0 bg-phantom-error/10 z-0 pointer-events-none mix-blend-overlay"></div>
      )}

      <table className="w-full border-collapse min-w-[800px] relative z-10">
        <thead>
          <tr className={`border-b border-phantom-error/50 bg-erevos-deep/80 backdrop-blur-md text-left transition-colors duration-500`}>
            <th className={`p-4 font-orbitron font-bold tracking-wider w-16 text-center text-solid-bone`}>RANK</th>
            <th className="p-4 font-orbitron text-solid-bone tracking-wider w-64 uppercase tracking-[0.2em] text-sm">TEAM</th>
            <th className="p-4 font-orbitron text-solid-bone tracking-wider text-center w-24 uppercase tracking-[0.2em] text-sm">SOLVED</th>
            <th className="p-4 font-orbitron text-solid-bone tracking-wider text-center w-24 uppercase tracking-[0.2em] text-sm">PENALTY</th>
            {problems.map(prob => (
              <th key={prob.id} className="p-1 font-mono text-center w-12 text-sm" title={prob.name}>
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
  );
});

ScoreboardTable.displayName = 'ScoreboardTable';

export default ScoreboardTable;
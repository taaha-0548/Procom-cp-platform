import React, { memo } from 'react';
import { Submission, ProblemStatus } from '../types';
import { Check, X, Clock, AlertCircle, Minus } from 'lucide-react';

interface ProblemCellProps {
  submission?: Submission;
}

// Memoize to prevent unnecessary re-renders
const ProblemCell: React.FC<ProblemCellProps> = memo(({ submission }) => {
  if (!submission || submission.status === ProblemStatus.NOT_ATTEMPTED) {
    return (
      <div className="flex justify-center items-center h-full">
      </div>
    );
  }

  const getStyle = () => {
    switch (submission.status) {
      case ProblemStatus.ACCEPTED:
        return submission.isFirstBlood
          ? 'border-2 border-[#10b981] text-white bg-[#10b981] shadow-[0_0_12px_rgba(16,185,129,0.6)]'
          : 'border border-[#34d399] text-[#34d399]';
      case ProblemStatus.WRONG_ANSWER:
        return 'border border-[#ff2a4d] text-[#ff5c75] bg-[rgba(255,42,77,0.1)] shadow-[0_0_4px_rgba(255,42,77,0.15)]';
      case ProblemStatus.PENDING:
        return 'bg-phantom-neon/20 text-phantom-rose border-phantom-neon/40 animate-pulse';
      case ProblemStatus.TIME_LIMIT:
        return 'border border-[#ff2a4d] text-[#ff5c75] bg-[rgba(255,42,77,0.1)] shadow-[0_0_4px_rgba(255,42,77,0.15)]';
      default:
        return 'text-gray-500';
    }
  };

  const getIcon = () => {
    switch (submission.status) {
      case ProblemStatus.ACCEPTED: return <Check className="w-3 h-3 md:w-3.5 md:h-3.5" strokeWidth={3} />;
      case ProblemStatus.WRONG_ANSWER: return <X className="w-3 h-3 md:w-3.5 md:h-3.5" />;
      case ProblemStatus.PENDING: return <Clock className="w-3 h-3 md:w-3.5 md:h-3.5" />;
      case ProblemStatus.TIME_LIMIT: return <AlertCircle className="w-3 h-3 md:w-3.5 md:h-3.5" />;
      default: return <Minus className="w-3 h-3 md:w-3.5 md:h-3.5" />;
    }
  };

  return (
    <div className={`flex flex-col justify-center items-center h-11 w-11 sm:h-12 sm:w-12 md:h-14 md:w-16 rounded border ${getStyle()} transition-all duration-200 mx-auto`}>
      <div className="mb-0.5">{getIcon()}</div>
      {submission.status === ProblemStatus.ACCEPTED && (
        <span className="text-[9px] sm:text-[10px] font-mono leading-none">{submission.time}'</span>
      )}
      {submission.status !== ProblemStatus.ACCEPTED && submission.status !== ProblemStatus.PENDING && submission.attempts > 0 && (
        <span className="text-[9px] sm:text-[10px] font-mono leading-none">-{submission.attempts}</span>
      )}
    </div>
  );
});

ProblemCell.displayName = 'ProblemCell';

export default ProblemCell;
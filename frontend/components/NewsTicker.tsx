import React, { memo, useMemo } from 'react';
import { AlertTriangle } from 'lucide-react';

interface NewsTickerProps {
  headlines: string[];
}

const NewsTicker: React.FC<NewsTickerProps> = memo(({ headlines }) => {
  if (headlines.length === 0) return null;

  // Memoize doubled headlines to avoid re-computing on every render
  const doubledHeadlines = useMemo(() => headlines.concat(headlines), [headlines]);

  return (
    <div className="fixed bottom-0 left-0 w-full bg-phantom-purple/90 border-t-2 border-phantom-neon backdrop-blur-md z-50 overflow-hidden py-2 sm:py-3">
      <div className="flex items-center">
        <div className="bg-phantom-dark px-2 sm:px-3 md:px-4 py-1 ml-1 sm:ml-2 mr-2 sm:mr-3 md:mr-4 rounded border border-phantom-red flex items-center shrink-0 shadow-[0_0_10px_rgba(244,63,94,0.5)] z-20">
          <AlertTriangle className="text-phantom-red mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4" />
          <span className="text-white font-orbitron text-[10px] sm:text-xs font-bold uppercase tracking-wider sm:tracking-widest">System Update</span>
        </div>
        
        <div className="relative flex overflow-x-hidden w-full group">
            <div className="animate-marquee whitespace-nowrap flex space-x-6 sm:space-x-8 md:space-x-12">
              {doubledHeadlines.map((headline, idx) => (
                <span key={idx} className="text-phantom-cyan font-mono text-xs sm:text-sm tracking-wide sm:tracking-wider flex items-center">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-phantom-neon rounded-full mr-2 sm:mr-3"></span>
                  {headline}
                </span>
              ))}
            </div>
             <style>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee 20s linear infinite;
                }
             `}</style>
        </div>
      </div>
    </div>
  );
});

NewsTicker.displayName = 'NewsTicker';

export default NewsTicker;
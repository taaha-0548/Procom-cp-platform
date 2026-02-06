import React from 'react';

interface GlitchTextProps {
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'span' | 'div' | 'p';
  className?: string;
}

const GlitchText: React.FC<GlitchTextProps> = ({ text, as: Component = 'span', className = '' }) => {
  return (
    <Component className={`relative inline-block group ${className}`}>
      <span className="relative z-10">{text}</span>
      <span className="absolute top-0 left-0 -ml-0.5 translate-x-[2px] text-phantom-red opacity-0 group-hover:opacity-70 group-hover:animate-glitch-1 z-0">
        {text}
      </span>
      <span className="absolute top-0 left-0 -ml-0.5 -translate-x-[2px] text-phantom-cyan opacity-0 group-hover:opacity-70 group-hover:animate-glitch-2 z-0">
        {text}
      </span>
    </Component>
  );
};

export default GlitchText;
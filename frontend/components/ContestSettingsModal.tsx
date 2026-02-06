import React, { useState } from 'react';
import { Clock, X } from 'lucide-react';

interface ContestSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (startTime: Date, duration: number) => void;
  currentStart?: Date;
  currentDuration?: number;
}

const ContestSettingsModal: React.FC<ContestSettingsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentStart,
  currentDuration = 120, // Default 2 hours
}) => {
  const [startDate, setStartDate] = useState<string>(
    currentStart ? currentStart.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  );
  const [startTime, setStartTime] = useState<string>(
    currentStart ? currentStart.toTimeString().slice(0, 5) : '10:00'
  );
  const [duration, setDuration] = useState<number>(currentDuration);

  const handleSave = () => {
    // Combine date and time
    const dateTimeString = `${startDate}T${startTime}`;
    const startDateTime = new Date(dateTimeString);
    
    onSave(startDateTime, duration);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gradient-to-b from-[#2c0a0a] to-[#1a0505] border-2 border-phantom-neon rounded-lg shadow-2xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Clock className="text-phantom-neon" size={24} />
            <h2 className="text-2xl font-orbitron font-bold text-white">
              Contest Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Start Date */}
          <div>
            <label className="block text-sm font-orbitron text-phantom-neon mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-[#1f2937] border border-phantom-neon/30 rounded text-white font-mono focus:outline-none focus:border-phantom-neon"
            />
          </div>

          {/* Start Time */}
          <div>
            <label className="block text-sm font-orbitron text-phantom-neon mb-2">
              Start Time
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 bg-[#1f2937] border border-phantom-neon/30 rounded text-white font-mono focus:outline-none focus:border-phantom-neon"
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-orbitron text-phantom-neon mb-2">
              Duration (minutes)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                max="1440"
                value={duration}
                onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 1))}
                className="flex-1 px-3 py-2 bg-[#1f2937] border border-phantom-neon/30 rounded text-white font-mono focus:outline-none focus:border-phantom-neon"
              />
              <span className="text-gray-400 text-sm flex items-center">
                ({Math.floor(duration / 60)}h {duration % 60}m)
              </span>
            </div>
          </div>

          {/* Quick Duration Buttons */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: '30m', value: 30 },
              { label: '1h', value: 60 },
              { label: '2h', value: 120 },
              { label: '3h', value: 180 },
            ].map((btn) => (
              <button
                key={btn.value}
                onClick={() => setDuration(btn.value)}
                className={`px-3 py-1 rounded text-sm font-orbitron transition ${
                  duration === btn.value
                    ? 'bg-phantom-neon text-[#290202] font-bold'
                    : 'bg-phantom-purple/50 hover:bg-phantom-purple text-phantom-neon'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Preview */}
          <div className="bg-[#1f2937] border border-phantom-neon/20 rounded p-3">
            <p className="text-xs text-gray-400 mb-1">Preview:</p>
            <p className="text-white font-mono text-sm">
              Start: {new Date(`${startDate}T${startTime}`).toLocaleString()}
            </p>
            <p className="text-white font-mono text-sm">
              End: {new Date(new Date(`${startDate}T${startTime}`).getTime() + duration * 60 * 1000).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-orbitron rounded border border-gray-500 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-phantom-neon text-[#290202] font-orbitron font-bold rounded border border-phantom-neon hover:bg-phantom-neon/80 transition"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContestSettingsModal;

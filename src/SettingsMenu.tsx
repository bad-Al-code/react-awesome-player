import { ChevronLeft } from 'lucide-react';
import { useState } from 'react';
import { SettingsMenuProps, SettingsMenuType } from './types';

export function SettingsMenu({
  playbackSpeed,
  onSpeedChange,
  availableQualities,
  currentQuality,
  onQualityChange,
  currentQualityLabel,
}: SettingsMenuProps) {
  const [activeMenu, setActiveMenu] = useState<SettingsMenuType>('main');

  const handleSpeedSelect = (speed: number) => {
    onSpeedChange(speed);
    setActiveMenu('main');
  };

  return (
    <div className="absolute right-3 bottom-14 z-20 w-52 overflow-hidden rounded-lg border bg-black/80 text-sm text-white shadow-lg backdrop-blur-lg">
      {activeMenu === 'main' && (
        <div className="flex flex-col">
          <button
            onClick={() => setActiveMenu('quality')}
            className="flex w-full cursor-pointer items-center justify-between px-3 py-2 hover:bg-white/10"
          >
            <span>Quality</span>
            <span className="text-white/70">{currentQualityLabel} &gt;</span>
          </button>

          <button
            onClick={() => setActiveMenu('speed')}
            className="flex w-full cursor-pointer items-center justify-between px-3 py-2 hover:bg-white/10"
          >
            <span>Playback speed</span>
            <span className="text-white/70">
              {playbackSpeed === 1 ? 'Normal' : `${playbackSpeed}x`} &gt;
            </span>
          </button>
        </div>
      )}

      {activeMenu === 'speed' && (
        <div className="flex flex-col">
          <button
            onClick={() => setActiveMenu('main')}
            className="flex cursor-pointer items-center px-3 py-2 hover:bg-white/10"
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Playback speed
          </button>
          {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
            <button
              key={speed}
              onClick={() => handleSpeedSelect(speed)}
              className={`cursor-pointer px-3 py-2 text-left hover:bg-white/10 ${
                playbackSpeed === speed ? 'bg-white/20 font-semibold' : ''
              }`}
            >
              {speed === 1 ? 'Normal' : `${speed}x`}
            </button>
          ))}
        </div>
      )}

      {activeMenu === 'quality' && (
        <div className="flex flex-col">
          <button
            onClick={() => setActiveMenu('main')}
            className="flex cursor-pointer items-center border-b py-2 hover:bg-white/10"
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Quality
          </button>
          <button
            onClick={() => onQualityChange(-1)}
            className={`w-full rounded p-2 text-left hover:bg-white/10 ${
              currentQuality === -1 ? 'bg-white/20 font-semibold' : ''
            }`}
          >
            Auto
          </button>
          {[...availableQualities]
            .sort((a, b) => b.height - a.height)
            .map((level) => (
              <button
                key={level.height}
                onClick={() =>
                  onQualityChange(availableQualities.indexOf(level))
                }
                className={`w-full rounded p-2 text-left hover:bg-white/10 ${
                  currentQuality === availableQualities.indexOf(level)
                    ? 'bg-white/20 font-semibold'
                    : ''
                }`}
              >
                {level.height}p
              </button>
            ))}
        </div>
      )}
    </div>
  );
}

import {
  Maximize,
  Minimize,
  Pause,
  PictureInPicture2,
  Play,
  RectangleHorizontal,
  Repeat,
  Settings,
  SkipBack,
  SkipForward,
  Subtitles,
  Volume1,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Timeline } from './Timeline';
import type { PlayerControlsWithTooltipProps } from './types';

const formatTime = (timeInSeconds: number) => {
  const date = new Date(0);
  date.setSeconds(timeInSeconds);

  const timeString = date.toISOString().slice(11, 19);
  return timeString.startsWith('00:') ? timeString.slice(3) : timeString;
};

export function PlayerControls({
  isPlaying,
  onPlayPause,
  progress,
  buffered,
  duration,
  currentTime,
  onSeek,
  volume,
  onVolumeChange,
  toggleMute,
  isFullScreen,
  toggleFullScreen,
  toggleSettings,
  toggleSubtitles,
  areSubtitlesEnabled,
  toggleTheaterMode,
  toggleMiniPlayer,
  isVisible,
  onNext,
  isAutoplayEnabled,
  toggleAutoplay,
  onPrevious,
  isTooltipVisible,
  tooltipContent,
  tooltipPosition,
  onTimelineHover,
  onTimelineMouseLeave,
}: PlayerControlsWithTooltipProps) {
  const VolumeIcon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <div
      className={`absolute right-0 bottom-0 left-0 z-10 flex flex-col bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 text-white transition-opacity sm:p-3 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      {isTooltipVisible && (
        <div
          className="bg-black/80 text-white absolute -top-8 z-50 -translate-x-1/2 overflow-hidden rounded-md border-gray-600 border px-3 py-1.5 text-sm shadow-md"
          style={{ left: `${tooltipPosition}px` }}
        >
          {tooltipContent}
        </div>
      )}

      <Timeline
        progress={progress}
        buffered={buffered}
        onSeek={onSeek}
        onHover={onTimelineHover}
        onMouseLeave={onTimelineMouseLeave}
      />

      <div className="mt-1 flex items-center justify-between sm:mt-2">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-2 sm:flex sm:gap-3">
            <button
              onClick={onPrevious}
              className="cursor-pointer"
              title="Previous (Shift + P)"
            >
              <SkipBack className="h-5 w-5 fill-white sm:h-6 sm:w-6" />
            </button>
          </div>

          <button
            onClick={onPlayPause}
            className="cursor-pointer"
            title={isPlaying ? 'Pause (k)' : 'Play (k)'}
          >
            {isPlaying ? (
              <Pause className="h-5 w-5 fill-white sm:h-6 sm:w-6" />
            ) : (
              <Play className="h-5 w-5 fill-white sm:h-6 sm:w-6" />
            )}
          </button>

          <div className="hidden items-center gap-2 sm:flex sm:gap-3">
            <button
              onClick={onNext}
              className="cursor-pointer"
              title="Next (Shift + N)"
            >
              <SkipForward className="h-5 w-5 fill-white sm:h-6 sm:w-6" />
            </button>
          </div>

          <div className="group/volume hidden items-center gap-0 hover:gap-2 sm:flex">
            <button
              className="cursor-pointer"
              onClick={toggleMute}
              title={volume > 0 ? 'Mute (m)' : 'Unmute (m)'}
            >
              <VolumeIcon className="h-6 w-6" />
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="h-1 w-0 cursor-pointer appearance-none rounded-full bg-white/80 opacity-0 transition-all duration-300 ease-in-out group-hover/volume:w-20 group-hover/volume:opacity-100 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
            />
          </div>

          <div className="text-xs sm:text-sm">
            <span>{formatTime(currentTime)}</span> /{' '}
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-2 sm:flex sm:gap-3">
            <button
              onClick={toggleAutoplay}
              className="relative cursor-pointer"
              title={isAutoplayEnabled ? 'Autoplay is on' : 'Autoplay is off'}
            >
              <Repeat className="h-5 w-5 sm:h-6 sm:w-6" />
              {!isAutoplayEnabled && (
                <div className="absolute top-1/2 left-0 h-0.5 w-full -rotate-45 rounded-full bg-white" />
              )}
            </button>

            <button
              onClick={toggleSubtitles}
              className="relative cursor-pointer"
              title="Subtitles (c)"
            >
              <Subtitles className="h-5 w-5 sm:h-6 sm:w-6" />
              {areSubtitlesEnabled && (
                <div className="absolute bottom-0 left-1/2 h-0.5 w-4/5 -translate-x-1/2 rounded-full bg-white" />
              )}
            </button>
          </div>

          <button
            onClick={toggleSettings}
            className="cursor-pointer"
            title="Settings"
          >
            <Settings className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>

          <div className="hidden items-center gap-2 md:flex md:gap-3">
            <button
              onClick={toggleMiniPlayer}
              className="cursor-pointer"
              title="Miniplayer (i)"
            >
              <PictureInPicture2 className="h-6 w-6" />
            </button>
            <button
              onClick={toggleTheaterMode}
              className="cursor-pointer"
              title="Theater mode (t)"
            >
              <RectangleHorizontal className="h-6 w-6" />
            </button>
          </div>

          <button
            onClick={toggleFullScreen}
            className="cursor-pointer"
            title={isFullScreen ? 'Exit full screen (f)' : 'Full screen (f)'}
          >
            {isFullScreen ? (
              <Minimize className="h-5 w-5 sm:h-6 sm:w-6" />
            ) : (
              <Maximize className="h-5 w-5 sm:h-6 sm:w-6" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

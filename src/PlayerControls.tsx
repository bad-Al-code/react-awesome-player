import {
  ChevronRight,
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
import { cn, formatTime } from './lib/utils';
import { Timeline } from './Timeline';
import type { PlayerControlsWithTooltipProps } from './types';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

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
  chapters,
  onSeekTo,
  currentChapter,
  onToggleChapters,
}: PlayerControlsWithTooltipProps) {
  const VolumeIcon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <TooltipProvider delayDuration={200}>
      <div
        className={cn(
          'absolute right-0 bottom-0 left-0 z-10 flex flex-col bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 text-white transition-opacity sm:p-3',
          isVisible ? 'opacity-100' : 'opacity-0',
        )}
      >
        {isTooltipVisible && (
          <div
            className="bg-popover text-popover-foreground absolute -top-8 z-50 -translate-x-1/2 overflow-hidden rounded-md border px-3 py-1.5 text-sm shadow-md"
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
          duration={duration}
          onSeekTo={onSeekTo}
          chapters={chapters}
        />

        <div className="mt-1 flex items-center justify-between sm:mt-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-2 sm:flex sm:gap-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={onPrevious} className="cursor-pointer">
                    <SkipBack className="h-5 w-5 fill-white sm:h-6 sm:w-6" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Previous (Shift + P)</TooltipContent>
              </Tooltip>
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={onPlayPause} className="cursor-pointer">
                  {isPlaying ? (
                    <Pause className="h-5 w-5 fill-white sm:h-6 sm:w-6" />
                  ) : (
                    <Play className="h-5 w-5 fill-white sm:h-6 sm:w-6" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                {isPlaying ? 'Pause (k)' : 'Play (k)'}
              </TooltipContent>
            </Tooltip>

            <div className="hidden items-center gap-2 sm:flex sm:gap-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={onNext} className="cursor-pointer">
                    <SkipForward className="h-5 w-5 fill-white sm:h-6 sm:w-6" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Next (Shift + N)</TooltipContent>
              </Tooltip>
            </div>

            <div className="group/volume hidden items-center gap-0 hover:gap-2 sm:flex">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="cursor-pointer" onClick={toggleMute}>
                    <VolumeIcon className="h-6 w-6" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  {volume > 0 ? 'Mute (m)' : 'Unmute (m)'}
                </TooltipContent>
              </Tooltip>

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

            <div className="text-xs sm:text-sm flex gap-0.5 flex-shrink-0">
              <span>{formatTime(currentTime)}</span> /{' '}
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {currentChapter && (
            <div
              onClick={onToggleChapters}
              className="flex items-center flex-1 min-w-0 mx-2 text-white/90 hover:text-white transition-colors text-xs sm:text-sm "
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center min-w-0">
                    <span className="flex-shrink-0"> • </span>
                    <span className="truncate ml-1">{currentChapter}</span>
                    <ChevronRight className="ml-1 h-3 w-3 flex-shrink-0" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>View Chapters</TooltipContent>
              </Tooltip>
            </div>
          )}

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-2 sm:flex sm:gap-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={toggleAutoplay}
                    className="relative cursor-pointer"
                  >
                    <Repeat className="h-5 w-5 sm:h-6 sm:w-6" />
                    {!isAutoplayEnabled && (
                      <div className="absolute top-1/2 left-0 h-0.5 w-full -rotate-45 rounded-full bg-white" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  {isAutoplayEnabled ? 'Autoplay is on' : 'Autoplay is off'}
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={toggleSubtitles}
                    className="relative cursor-pointer"
                  >
                    <Subtitles className="h-5 w-5 sm:h-6 sm:w-6" />
                    {areSubtitlesEnabled && (
                      <div className="absolute bottom-0 left-1/2 h-0.5 w-4/5 -translate-x-1/2 rounded-full bg-white" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent>Subtitles (c)</TooltipContent>
              </Tooltip>
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={toggleSettings} className="cursor-pointer">
                  <Settings className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Settings</TooltipContent>
            </Tooltip>

            <div className="hidden items-center gap-2 md:flex md:gap-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={toggleMiniPlayer} className="cursor-pointer">
                    <PictureInPicture2 className="h-6 w-6" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Miniplayer (i)</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={toggleTheaterMode}
                    className="cursor-pointer"
                  >
                    <RectangleHorizontal className="h-6 w-6" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Theater mode (t)</TooltipContent>
              </Tooltip>
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={toggleFullScreen} className="cursor-pointer">
                  {isFullScreen ? (
                    <Minimize className="h-5 w-5 sm:h-6 sm:w-6" />
                  ) : (
                    <Maximize className="h-5 w-5 sm:h-6 sm:w-6" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                {isFullScreen ? 'Exit full screen (f)' : 'Full screen (f)'}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

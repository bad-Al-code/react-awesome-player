'use client';

import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Play,
} from 'lucide-react';
import React, { useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChaptersSidebar } from './ChapterSidebar';
import { useHls } from './hooks/useHls';
import { usePlayerState } from './hooks/usePlayerState';
import { cn, formatTime } from './lib/utils';
import { PlayerControls } from './PlayerControls';
import { SettingsMenu } from './SettingsMenu';
import { resetPlayerState, usePlayerStore } from './store/playerStore';
import type { VideoPlayerProps } from './types';

function TheaterBackdrop({ onClick }: { onClick: () => void }) {
  return createPortal(
    <div className="fixed inset-0 z-40 bg-black/90" onClick={onClick} />,
    document.body,
  );
}

export function VideoPlayer({
  src,
  title,
  poster,
  subtitles = [],
  playlist = [],
  currentVideoIndex = 0,
  onVideoChange = () => {},
  theaterModeEnabled = false,
  chapters = [],
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  // const hlsRef = useRef<Hls | null>(null);
  const seekIndicatorTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // const [isPlaying, setIsPlaying] = useState(false);
  // const [progress, setProgress] = useState(0);
  // const [buffered, setBuffered] = useState(0);
  // const [duration, setDuration] = useState(0);
  // const [currentTime, setCurrentTime] = useState(0);
  // const [volume, setVolume] = useState(0.9);
  // const [lastVolume, setLastVolume] = useState(0.9);
  // const [isFullScreen, setIsFullScreen] = useState(false);
  // const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  // const [playbackSpeed, setPlaybackSpeed] = useState(1);
  // const [areSubtitlesEnabled, setAreSubtitlesEnabled] = useState(false);
  // const [areControlsVisible, setAreControlsVisible] = useState(false);
  // const [availableQualities, setAvailableQualities] = useState<Level[]>([]);
  // const [currentQuality, setCurrentQuality] = useState<number>(-1);
  // const [isMiniPlayer, setIsMiniPlayer] = useState(false);
  // const [isAutoplayEnabled, setIsAutoplayEnabled] = useState(false);
  // const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  // const [tooltipContent, setTooltipContent] = useState('');
  // const [tooltipPosition, setTooltipPosition] = useState(0);
  // const [hasStarted, setHasStarted] = useState(false);
  // const [isTheaterMode, setIsTheaterMode] = useState(false);
  // const [seekIndicator, setSeekIndicator] = useState<
  //   'forward' | 'backward' | 'none'
  // >('none');
  // const [isBuffering, setIsBuffering] = useState(false);
  // const [areChaptersVisible, setAreChaptersVisible] = useState(false);
  // const [error, setError] = useState<string | null>(null);

  const currentSrc =
    playlist && playlist.length > 0 ? playlist[currentVideoIndex] : src;
  const hlsRef = useHls(currentSrc, videoRef.current);
  const { isAutoplayEnabled } = usePlayerStore();

  useEffect(() => {
    resetPlayerState();
  }, [currentSrc]);

  const handleNext = useCallback(() => {
    const nextIndex = currentVideoIndex + 1;
    if (playlist && nextIndex < playlist.length) {
      onVideoChange(nextIndex);
    }
  }, [currentVideoIndex, playlist, onVideoChange]);

  const handleVideoEnded = useCallback(() => {
    if (isAutoplayEnabled) {
      handleNext();
    }
  }, [isAutoplayEnabled, handleNext]);

  usePlayerState(videoRef.current, handleVideoEnded);

  const handlePrevious = useCallback(() => {
    const prevIndex = currentVideoIndex - 1;
    if (playlist && prevIndex >= 0) {
      onVideoChange(prevIndex);
    }
  }, [currentVideoIndex, playlist, onVideoChange]);

  const handleSeekDoubleTap = (direction: 'forward' | 'backward') => {
    if (!videoRef.current) return;

    const seekAmount = direction === 'forward' ? 10 : -10;
    seekRelative(seekAmount);

    setSeekIndicator(direction);

    if (seekIndicatorTimeoutRef.current) {
      clearTimeout(seekIndicatorTimeoutRef.current);
    }

    seekIndicatorTimeoutRef.current = setTimeout(() => {
      setSeekIndicator('none');
    }, 600);
  };

  const handleClickArea = (direction?: 'forward' | 'backward') => {
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;

      if (direction) {
        handleSeekDoubleTap(direction);
      }
    } else {
      clickTimeoutRef.current = setTimeout(() => {
        clickTimeoutRef.current = null;

        togglePlay();
      }, 250);
    }
  };

  const currentChapter = [...chapters]
    .reverse()
    .find((chapter) => chapter.time <= currentTime);

  const handleSeekTo = useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;

      setAreChaptersVisible(false);
    }
  }, []);

  const toggleChapters = () => {
    setAreChaptersVisible((prev) => !prev);
  };

  const handleTimelineHover = (positionX: number, timeFraction: number) => {
    setTooltipPosition(positionX);
    setTooltipContent(formatTime(timeFraction * duration));
    setIsTooltipVisible(true);
  };

  const handleTimelineMouseLeave = () => {
    setIsTooltipVisible(false);
  };

  const toggleAutoplay = () => {
    setIsAutoplayEnabled(!isAutoplayEnabled);
  };

  const togglePlay = useCallback(() => {
    if (!hasStarted) {
      setHasStarted(true);
    }

    if (videoRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      isPlaying ? videoRef.current.pause() : videoRef.current.play();
    }
  }, [isPlaying, hasStarted]);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current) {
      const timeline = e.currentTarget;
      const rect = timeline.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const seekFraction = clickX / rect.width;
      const seekTime = seekFraction * duration;
      videoRef.current.currentTime = seekTime;
      setProgress(seekFraction * 100);
      setCurrentTime(seekTime);
    }
  };

  const handleVolumeChange = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolume(clampedVolume);
    if (videoRef.current) videoRef.current.volume = clampedVolume;
  }, []);

  const toggleMute = useCallback(() => {
    if (volume > 0) {
      setLastVolume(volume);
      setVolume(0);
      if (videoRef.current) videoRef.current.volume = 0;
    } else {
      setVolume(lastVolume);
      if (videoRef.current) videoRef.current.volume = lastVolume;
    }
  }, [volume, lastVolume]);

  const toggleFullScreen = useCallback(() => {
    const playerContainer = playerContainerRef.current;
    if (!playerContainer) return;
    if (!document.fullscreenElement) {
      playerContainer.requestFullscreen().catch((err) => {
        console.error(
          `Error attempting to enable full-screen mode: ${err.message} (${err.name})`,
        );
      });
    } else {
      document.exitFullscreen();
    }
  }, []);

  const toggleSettings = () => setIsSettingsOpen(!isSettingsOpen);

  const handlePlaybackSpeedChange = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
      setIsSettingsOpen(false);
    }
  };

  const toggleSubtitles = useCallback(() => {
    const video = videoRef.current;
    if (!video || subtitles.length === 0) return;

    const newSubtitleState = !areSubtitlesEnabled;
    for (let i = 0; i < video.textTracks.length; i++) {
      video.textTracks[i].mode =
        newSubtitleState && i === 0 ? 'showing' : 'hidden';
    }
    setAreSubtitlesEnabled(newSubtitleState);
  }, [areSubtitlesEnabled, subtitles.length]);

  const handleToggleTheaterMode = useCallback(() => {
    if (theaterModeEnabled) {
      setIsTheaterMode((prev) => !prev);
    }
  }, [theaterModeEnabled]);

  const toggleMiniPlayer = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    if (!document.pictureInPictureEnabled) {
      console.warn('Picture-in-Picture is not supported in this browser.');
      return;
    }
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsMiniPlayer(false);
      } else {
        await video.requestPictureInPicture();
        setIsMiniPlayer(true);
      }
    } catch (error) {
      console.error('Error toggling Picture-in-Picture mode:', error);
    }
  }, []);

  const seekRelative = useCallback(
    (delta: number) => {
      if (videoRef.current) {
        const newTime = videoRef.current.currentTime + delta;
        videoRef.current.currentTime = Math.max(0, Math.min(duration, newTime));
      }
    },
    [duration],
  );

  const seekToPercentage = useCallback(
    (percentage: number) => {
      if (videoRef.current) {
        videoRef.current.currentTime = duration * (percentage / 100);
      }
    },
    [duration],
  );

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    inactivityTimerRef.current = setTimeout(() => {
      if (isPlaying && !isSettingsOpen) {
        setAreControlsVisible(false);
      }
    }, 5000);
  }, [isPlaying, isSettingsOpen]);

  const handleMouseMove = () => {
    setAreControlsVisible(true);
    resetInactivityTimer();
  };

  const handleMouseLeave = () => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    if (isPlaying && !isSettingsOpen) {
      setAreControlsVisible(false);
    }
  };

  const handleQualityChange = (levelIndex: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelIndex;
      setCurrentQuality(levelIndex);
    }
    setIsSettingsOpen(false);
  };

  const currentQualityLabel =
    currentQuality === -1
      ? `Auto (${
          hlsRef.current?.levels[hlsRef.current?.currentLevel]?.height ?? '...'
        }p)`
      : `${availableQualities[currentQuality]?.height}p`;

  useEffect(() => {
    if (!theaterModeEnabled) return;

    if (isTheaterMode) {
      document.body.classList.add('theater-mode-active');
    } else {
      document.body.classList.remove('theater-mode-active');
    }

    return () => {
      document.body.classList.remove('theater-mode-active');
    };
  }, [isTheaterMode, theaterModeEnabled]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const handleLeavePiP = () => setIsMiniPlayer(false);
    video.addEventListener('leavepictureinpicture', handleLeavePiP);
    return () =>
      video.removeEventListener('leavepictureinpicture', handleLeavePiP);
  }, []);

  useEffect(() => {
    const handleFullScreenChange = () =>
      setIsFullScreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () =>
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
  }, []);

  useEffect(() => {
    if (!isSettingsOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsSettingsOpen(false);
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (
        playerContainerRef.current &&
        !playerContainerRef.current.contains(e.target as Node)
      ) {
        setIsSettingsOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSettingsOpen]);

  useEffect(() => {
    if (isPlaying) {
      resetInactivityTimer();
    } else {
      setAreControlsVisible(true);
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    }
  }, [isPlaying, isSettingsOpen, resetInactivityTimer]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      switch (e.key) {
        case ' ':
        case 'k':
        case 'K':
          e.preventDefault();
          togglePlay();
          break;
        case 'N':
          handleNext();
          break;
        case 'P':
          handlePrevious();
          break;
        case 'm':
        case 'M':
          toggleMute();
          break;
        case 'f':
        case 'F':
          toggleFullScreen();
          break;
        case 'c':
        case 'C':
          toggleSubtitles();
          break;
        case 't':
        case 'T':
          handleToggleTheaterMode();
          break;
        case 'i':
        case 'I':
          toggleMiniPlayer();
          break;
        case 'ArrowRight':
          seekRelative(5);
          break;
        case 'ArrowLeft':
          seekRelative(-5);
          break;
        case 'ArrowUp':
          e.preventDefault();
          handleVolumeChange(volume + 0.05);
          break;
        case 'ArrowDown':
          e.preventDefault();
          handleVolumeChange(volume - 0.05);
          break;
        case '1':
          seekToPercentage(10);
          break;
        case '2':
          seekToPercentage(20);
          break;
        case '3':
          seekToPercentage(30);
          break;
        case '4':
          seekToPercentage(40);
          break;
        case '5':
          seekToPercentage(50);
          break;
        case '6':
          seekToPercentage(60);
          break;
        case '7':
          seekToPercentage(70);
          break;
        case '8':
          seekToPercentage(80);
          break;
        case '9':
          seekToPercentage(90);
          break;
        case '0':
          seekToPercentage(0);
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    handleNext,
    handlePrevious,
    togglePlay,
    toggleMute,
    toggleFullScreen,
    toggleSubtitles,
    handleToggleTheaterMode,
    toggleMiniPlayer,
    seekRelative,
    seekToPercentage,
    volume,
    handleVolumeChange,
  ]);

  return (
    <>
      {isTheaterMode && <TheaterBackdrop onClick={handleToggleTheaterMode} />}

      <div
        ref={playerContainerRef}
        className={cn(
          'group transition-all duration-300 focus:outline-none',
          isTheaterMode
            ? 'fixed top-0 left-0 z-50 w-full'
            : 'relative mx-auto w-full max-w-4xl overflow-hidden rounded-lg',
          !areControlsVisible && isPlaying && 'cursor-none',
        )}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        tabIndex={0}
      >
        <div className="relative aspect-video w-full bg-black overflow-hidden">
          {title && (
            <div
              className={cn(
                'absolute top-0 right-0 left-0 z-20 bg-gradient-to-b from-black/60 to-transparent p-4 transition-opacity duration-300',
                areControlsVisible ? 'opacity-100' : 'opacity-0',
              )}
            >
              <h1 className="truncate text-xl font-bold text-white">{title}</h1>
            </div>
          )}

          <video
            ref={videoRef}
            className={`h-full w-full ${isMiniPlayer ? 'invisible' : ''}`}
            playsInline
            // onClick={hasStarted ? togglePlay : undefined}
            onDoubleClick={toggleFullScreen}
            crossOrigin="anonymous"
            autoPlay={false}
            poster={poster}
            data-testid="video-element"
          >
            {subtitles.map((sub, index) => (
              <track
                key={index}
                label={sub.label}
                kind="subtitles"
                srcLang={sub.lang}
                src={sub.src}
                default={index === 0}
              />
            ))}
          </video>

          <div className="absolute inset-0 z-10 grid grid-cols-2">
            <div
              className="h-full w-full"
              onClick={() => handleClickArea('backward')}
            />
            <div
              className="h-full w-full"
              onClick={() => handleClickArea('forward')}
            />
          </div>

          <div
            className={`pointer-events-none absolute inset-0 flex items-center justify-center 
    transition-all duration-500 ease-out
    ${seekIndicator !== 'none' ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}
  `}
          >
            {seekIndicator === 'backward' && (
              <div className="absolute inset-y-0 left-0 flex w-1/2 items-center justify-start pl-3 sm:pl-6 pointer-events-none">
                <div className="flex flex-col items-center text-white">
                  <div
                    className="flex flex-col items-center justify-center 
            w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 
            rounded-full bg-black/50 seek-glow seek-pop"
                  >
                    <div className="flex">
                      <ChevronLeft className="h-4 w-4 sm:h-6 sm:w-6 md:h-8 md:w-10 arrow-animate" />
                      <ChevronLeft className="h-4 w-4 -ml-1 sm:h-6 sm:w-6 sm:-ml-2 md:h-8 md:w-10 arrow-animate arrow-delay" />
                      <ChevronLeft className="h-4 w-4 -ml-1 sm:h-6 sm:w-6 sm:-ml-2 md:h-8 md:w-10 arrow-animate arrow-delay" />
                    </div>
                    <span className="text-xs sm:text-sm md:text-base font-bold drop-shadow">
                      10s
                    </span>
                  </div>
                </div>
              </div>
            )}

            {seekIndicator === 'forward' && (
              <div className="absolute inset-y-0 right-0 flex w-1/2 items-center justify-end pr-3 sm:pr-6 pointer-events-none">
                <div className="flex flex-col items-center text-white">
                  <div
                    className="flex flex-col items-center justify-center 
            w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 
            rounded-full bg-black/50 seek-glow seek-pop"
                  >
                    <div className="flex">
                      <ChevronRight className="h-4 w-4 sm:h-6 sm:w-6 md:h-8 md:w-10 arrow-animate" />
                      <ChevronRight className="h-4 w-4 -ml-1 sm:h-6 sm:w-6 sm:-ml-2 md:h-8 md:w-10 arrow-animate arrow-delay" />
                      <ChevronRight className="h-4 w-4 -ml-1 sm:h-6 sm:w-6 sm:-ml-2 md:h-8 md:w-10 arrow-animate arrow-delay" />
                    </div>
                    <span className="text-xs sm:text-sm md:text-base font-bold drop-shadow">
                      10s
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {isBuffering && hasStarted && !error && (
            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-muted/70" />
            </div>
          )}

          {error && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-black text-white">
              <AlertTriangle className="h-10 w-10 text-red-500" />
              <p className="font-semibold">Video Error</p>
              <p className="text-sm text-gray-400">{error}</p>
            </div>
          )}

          {!hasStarted && poster && (
            <img
              src={poster}
              alt={title || 'Video poster'}
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}

          {!hasStarted && !error && (
            <div className="absolute inset-0 z-10 flex items-center justify-center">
              <button
                onClick={togglePlay}
                className="cursor-pointer rounded-full bg-accent-foreground/50 p-2 text-white transition-colors duration-300 hover:bg-accent-foreground/60 sm:p-4"
                aria-label="Play video"
                title="Play video"
              >
                <Play className="fill-accent h-6 w-6 pl-0.5 sm:h-10 sm:w-10 sm:pl-1" />
              </button>
            </div>
          )}

          {isMiniPlayer && (
            <div className="absolute inset-0 flex items-center justify-center bg-black text-white">
              <p>This video is playing in Picture-in-Picture mode.</p>
            </div>
          )}

          {isSettingsOpen && (
            <SettingsMenu
              playbackSpeed={playbackSpeed}
              onSpeedChange={handlePlaybackSpeedChange}
              availableQualities={availableQualities}
              currentQuality={currentQuality}
              onQualityChange={handleQualityChange}
              currentQualityLabel={currentQualityLabel}
            />
          )}

          {areChaptersVisible && (
            <ChaptersSidebar
              chapters={chapters}
              currentTime={currentTime}
              onSeekTo={handleSeekTo}
              onClose={toggleChapters}
            />
          )}

          <PlayerControls
            isPlaying={isPlaying}
            onPlayPause={togglePlay}
            progress={progress}
            buffered={buffered}
            duration={duration}
            currentTime={currentTime}
            onSeek={handleSeek}
            volume={volume}
            onVolumeChange={handleVolumeChange}
            toggleMute={toggleMute}
            isFullScreen={isFullScreen}
            toggleFullScreen={toggleFullScreen}
            toggleSettings={toggleSettings}
            toggleSubtitles={toggleSubtitles}
            areSubtitlesEnabled={areSubtitlesEnabled}
            toggleMiniPlayer={toggleMiniPlayer}
            isVisible={areControlsVisible && hasStarted}
            onNext={handleNext}
            onPrevious={handlePrevious}
            toggleAutoplay={toggleAutoplay}
            isAutoplayEnabled={isAutoplayEnabled}
            isTooltipVisible={isTooltipVisible}
            tooltipContent={tooltipContent}
            tooltipPosition={tooltipPosition}
            onTimelineHover={handleTimelineHover}
            onTimelineMouseLeave={handleTimelineMouseLeave}
            toggleTheaterMode={handleToggleTheaterMode}
            isTheaterMode={isTheaterMode}
            chapters={chapters}
            onSeekTo={handleSeekTo}
            currentChapter={currentChapter?.label}
            onToggleChapters={toggleChapters}
            areChaptersVisible={areChaptersVisible}
          />
        </div>
      </div>
    </>
  );
}

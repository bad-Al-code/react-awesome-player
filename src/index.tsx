'use client';

import { cn, formatTime } from '@/lib/utils';
import Hls, { Level } from 'hls.js';
import { Play } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { PlayerControls } from './PlayerControls';
import { SettingsMenu } from './SettingsMenu';
import { VideoPlayerProps } from './types';

function TheaterBackdrop({ onClick }: { onClick: () => void }) {
  return createPortal(
    <div className="fixed inset-0 z-40 bg-black/90" onClick={onClick} />,
    document.body
  );
}

export function VideoPlayer({
  src,
  title,
  subtitles = [],
  playlist = [],
  currentVideoIndex = 0,
  onVideoChange = () => {},
  onToggleTheaterMode = () => {},
  toggleTheaterMode = () => {},
  theaterModeEnabled = false,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.9);
  const [lastVolume, setLastVolume] = useState(0.9);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [areSubtitlesEnabled, setAreSubtitlesEnabled] = useState(false);
  const [areControlsVisible, setAreControlsVisible] = useState(false);
  const [availableQualities, setAvailableQualities] = useState<Level[]>([]);
  const [currentQuality, setCurrentQuality] = useState<number>(-1);
  const [isMiniPlayer, setIsMiniPlayer] = useState(false);
  const [isAutoplayEnabled, setIsAutoplayEnabled] = useState(false);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [tooltipContent, setTooltipContent] = useState('');
  const [tooltipPosition, setTooltipPosition] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);

  const currentSrc =
    playlist && playlist.length > 0 ? playlist[currentVideoIndex] : src;

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !currentSrc) return;

    setHasStarted(false);
    setIsPlaying(false);
    setProgress(0);
    setBuffered(0);
    setCurrentTime(0);
    setDuration(0);

    if (hlsRef.current) {
      hlsRef.current.destroy();
    }

    if (Hls.isSupported()) {
      const hls = new Hls();
      hlsRef.current = hls;
      hls.loadSource(currentSrc);
      hls.attachMedia(videoElement);
      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        setAvailableQualities([...data.levels]);

        // videoElement.play();
      });
    } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
      videoElement.src = currentSrc;
      videoElement.addEventListener('loadedmetadata', () => {
        // videoElement.play();
      });
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [currentSrc]);

  const handleNext = useCallback(() => {
    const nextIndex = currentVideoIndex + 1;
    if (playlist && nextIndex < playlist.length) {
      onVideoChange(nextIndex);
    }
  }, [currentVideoIndex, playlist, onVideoChange]);

  const handlePrevious = useCallback(() => {
    const prevIndex = currentVideoIndex - 1;
    if (playlist && prevIndex >= 0) {
      onVideoChange(prevIndex);
    }
  }, [currentVideoIndex, playlist, onVideoChange]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const handleEnded = () => {
      setIsPlaying(false);
      if (isAutoplayEnabled) {
        handleNext();
      }
    };
    const handleTimeUpdate = () => {
      if (video.duration) {
        setProgress((video.currentTime / video.duration) * 100);
        setCurrentTime(video.currentTime);
      }
    };
    const handleProgress = () => {
      if (video.buffered.length > 0 && video.duration) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        setBuffered((bufferedEnd / video.duration) * 100);
      }
    };
    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('progress', handleProgress);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('play', () => setIsPlaying(true));
    video.addEventListener('pause', () => setIsPlaying(false));
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('progress', handleProgress);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('play', () => setIsPlaying(true));
      video.removeEventListener('pause', () => setIsPlaying(false));
    };
  }, [isAutoplayEnabled, handleNext]);

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

  const handleVolumeChange = (newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolume(clampedVolume);
    if (videoRef.current) videoRef.current.volume = clampedVolume;
  };

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

  const toggleFullScreen = () => {
    const playerContainer = playerContainerRef.current;
    if (!playerContainer) return;
    if (!document.fullscreenElement) {
      playerContainer.requestFullscreen().catch((err) => {
        console.error(
          `Error attempting to enable full-screen mode: ${err.message} (${err.name})`
        );
      });
    } else {
      document.exitFullscreen();
    }
  };

  const toggleSettings = () => setIsSettingsOpen(!isSettingsOpen);

  const handlePlaybackSpeedChange = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
      setIsSettingsOpen(false);
    }
  };

  const toggleSubtitles = () => {
    const video = videoRef.current;
    if (!video || subtitles.length === 0) return;

    const newSubtitleState = !areSubtitlesEnabled;
    for (let i = 0; i < video.textTracks.length; i++) {
      video.textTracks[i].mode =
        newSubtitleState && i === 0 ? 'showing' : 'hidden';
    }
    setAreSubtitlesEnabled(newSubtitleState);
  };

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
    [duration]
  );

  const seekToPercentage = useCallback(
    (percentage: number) => {
      if (videoRef.current) {
        videoRef.current.currentTime = duration * (percentage / 100);
      }
    },
    [duration]
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
    toggleTheaterMode,
    toggleMiniPlayer,
    seekRelative,
    seekToPercentage,
    volume,
    handleVolumeChange,
    handleToggleTheaterMode,
  ]);

  return (
    <>
      {isTheaterMode && <TheaterBackdrop onClick={toggleTheaterMode} />}

      <div
        ref={playerContainerRef}
        className={cn(
          'group transition-all duration-300 focus:outline-none',
          isTheaterMode
            ? 'fixed top-0 left-0 z-50 w-full'
            : 'relative mx-auto w-full max-w-4xl overflow-hidden rounded-lg',
          !areControlsVisible && isPlaying && 'cursor-none'
        )}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        tabIndex={0}
      >
        <div className="relative aspect-video w-full bg-black">
          {title && (
            <div
              className={cn(
                'absolute top-0 right-0 left-0 z-20 bg-gradient-to-b from-black/60 to-transparent p-4 transition-opacity duration-300',
                areControlsVisible ? 'opacity-100' : 'opacity-0'
              )}
            >
              <h1 className="truncate text-xl font-bold text-white">{title}</h1>
            </div>
          )}

          <video
            ref={videoRef}
            className={`h-full w-full ${isMiniPlayer ? 'invisible' : ''}`}
            playsInline
            onClick={hasStarted ? togglePlay : undefined}
            onDoubleClick={toggleFullScreen}
            crossOrigin="anonymous"
            autoPlay={false}
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

          {!hasStarted && (
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={togglePlay}
                className="cursor-pointer rounded-full bg-white/5 p-2 text-white transition-colors duration-300 hover:bg-white/20 sm:p-4"
                aria-label="Play video"
                title="Play video"
              >
                <Play className="fill-foreground h-6 w-6 pl-0.5 sm:h-10 sm:w-10 sm:pl-1.5" />
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
          />
        </div>
      </div>
    </>
  );
}

export function TestVideoPlayer() {
  const lessonTitle = 'What is Data Science?';
  const singleVideoSrc = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';
  const videoSubtitles = [
    {
      lang: 'en',
      label: 'English',
      src: 'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-HD.en.vtt',
    },
  ];

  const [isTheaterMode1, setIsTheaterMode1] = useState(false);
  const toggleTheaterMode1 = () => setIsTheaterMode1(!isTheaterMode1);

  const samplePlaylist = [
    'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
    'https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8',
  ];

  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isTheaterMode2, setIsTheaterMode2] = useState(false);
  const [isPageInTheaterMode2, setIsPageInTheaterMode2] = useState(false);

  const handleVideoChange = (newIndex: number) => {
    setCurrentVideoIndex(newIndex);
  };
  const togglePageTheaterMode2 = () => setIsPageInTheaterMode2((prev) => !prev);

  return (
    <>
      {isTheaterMode1 && (
        <div
          className="fixed inset-0 z-40 bg-black/90"
          onClick={toggleTheaterMode1}
        />
      )}
      {isTheaterMode2 && (
        <div
          className="fixed inset-0 z-40 bg-black/90"
          onClick={togglePageTheaterMode2}
        />
      )}

      <main className="container mx-auto">
        <h1 className="mb-4 text-4xl font-bold">Video Player Test Page</h1>
        <p className="text-gray-600">
          This page demonstrates the VideoPlayer component in different
          scenarios.
        </p>

        <div className="my-12">
          <h2 className="mb-4 border-b pb-2 text-2xl font-semibold">
            Scenario 1: Single Video with Subtitles
          </h2>
          <div className="mt-4">
            <VideoPlayer
              src={singleVideoSrc}
              title={lessonTitle}
              subtitles={videoSubtitles}
              isTheaterMode={isTheaterMode1}
              // onToggleTheaterMode={toggleTheaterMode1}
              theaterModeEnabled={true}
            />
          </div>
          <div
            className={`transition-all duration-300 ${isTheaterMode1 ? 'mt-[56.25vw]' : 'mt-4'}`}
          >
            <h3 className="text-xl font-bold">About This Video</h3>
            <p>
              This content is pushed down when theatre mode is active for the
              player above.
            </p>
          </div>
        </div>

        <div className="my-12">
          <h2 className="mb-4 border-b pb-2 text-2xl font-semibold">
            Scenario 2: Playlist Functionality
          </h2>
          <div className="mt-4">
            <VideoPlayer
              playlist={samplePlaylist}
              currentVideoIndex={currentVideoIndex}
              onVideoChange={handleVideoChange}
              isTheaterMode={isTheaterMode2}
              onToggleTheaterMode={togglePageTheaterMode2}
            />
          </div>
          <div
            className={`transition-all duration-300 ${isTheaterMode2 ? 'mt-[56.25vw]' : 'mt-4'}`}
          >
            <h3 className="text-xl font-bold">About This Playlist</h3>
            <p>
              This content is pushed down independently when the playlist player
              enters theatre mode.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}

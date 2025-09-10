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
import { useCumulativeSeek } from './hooks/useCumulativeSeek';
import { useHls } from './hooks/useHls';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { usePlayerState } from './hooks/usePlayerState';
import { usePlayerUI } from './hooks/usePlayerUI';
import { cn } from './lib/utils';
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

  const state = usePlayerStore();
  const actions = usePlayerStore.getState();

  const currentSrc =
    playlist?.length > 0
      ? typeof playlist[currentVideoIndex] === 'string'
        ? (playlist[currentVideoIndex] as string)
        : (playlist[currentVideoIndex] as { src: string }).src
      : src;

  const hlsRef = useHls(currentSrc, videoRef.current);
  const {
    handleMouseMove,
    handleMouseLeave,
    handleTimelineHover,
    handleTimelineMouseLeave,
  } = usePlayerUI();
  const {
    handleSeekForward,
    handleSeekBackward,
    seekIndicator,
    cumulativeSeek,
  } = useCumulativeSeek(videoRef, state.duration);

  useEffect(() => {
    resetPlayerState();
  }, [currentSrc]);

  const handleNext = useCallback(() => {
    if (playlist && currentVideoIndex < playlist.length - 1) {
      onVideoChange(currentVideoIndex + 1);
    }
  }, [currentVideoIndex, playlist, onVideoChange]);

  const handlePrevious = useCallback(() => {
    if (playlist && currentVideoIndex > 0) {
      onVideoChange(currentVideoIndex - 1);
    }
  }, [currentVideoIndex, playlist, onVideoChange]);

  const handleVideoEnded = useCallback(() => {
    if (state.isAutoplayEnabled) handleNext();
  }, [state.isAutoplayEnabled, handleNext]);

  usePlayerState(videoRef.current, handleVideoEnded);

  const toggleFullScreen = useCallback(() => {
    const playerContainer = playerContainerRef.current;
    if (!playerContainer) return;

    if (!document.fullscreenElement) {
      playerContainer
        .requestFullscreen()
        .catch((err) =>
          console.error(`Error enabling full-screen: ${err.message}`),
        );
    } else {
      document.exitFullscreen();
    }
  }, []);

  const toggleSubtitles = useCallback(() => {
    const video = videoRef.current;
    if (!video || subtitles.length === 0) return;

    const newSubtitleState = !state.areSubtitlesEnabled;

    for (let i = 0; i < video.textTracks.length; i++) {
      video.textTracks[i].mode =
        newSubtitleState && i === 0 ? 'showing' : 'hidden';
    }

    actions.setAreSubtitlesEnabled(newSubtitleState);
  }, [state.areSubtitlesEnabled, subtitles.length, actions]);

  const handleToggleTheaterMode = useCallback(() => {
    if (theaterModeEnabled) {
      actions.setIsTheaterMode(!state.isTheaterMode);
    }
  }, [theaterModeEnabled, state.isTheaterMode, actions]);

  const toggleMiniPlayer = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !document.pictureInPictureEnabled) return;

    try {
      if (document.pictureInPictureElement)
        await document.exitPictureInPicture();
      else await video.requestPictureInPicture();
    } catch (error) {
      console.error('Error toggling PiP mode:', error);
    }
  }, []);

  const seekToPercentage = useCallback(
    (percentage: number) => {
      if (videoRef.current) {
        videoRef.current.currentTime = state.duration * (percentage / 100);
      }
    },
    [state.duration],
  );

  useKeyboardShortcuts({
    togglePlay: actions.togglePlay,
    handleNext,
    handlePrevious,
    toggleMute: actions.toggleMute,
    toggleFullScreen,
    toggleSubtitles,
    toggleTheaterMode: handleToggleTheaterMode,
    toggleMiniPlayer,
    seekForward: handleSeekForward,
    seekBackward: handleSeekBackward,
    increaseVolume: () => actions.setVolume(state.volume + 0.05),
    decreaseVolume: () => actions.setVolume(state.volume - 0.05),
    seekToPercentage,
  });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const handleEnterPiP = () => actions.setIsMiniPlayer(true);
    const handleLeavePiP = () => actions.setIsMiniPlayer(false);

    video.addEventListener('enterpictureinpicture', handleEnterPiP);
    video.addEventListener('leavepictureinpicture', handleLeavePiP);

    return () => {
      video.removeEventListener('enterpictureinpicture', handleEnterPiP);
      video.removeEventListener('leavepictureinpicture', handleLeavePiP);
    };
  }, [actions]);

  useEffect(() => {
    const handleFullScreenChange = () =>
      actions.setIsFullScreen(!!document.fullscreenElement);

    document.addEventListener('fullscreenchange', handleFullScreenChange);

    return () =>
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
  }, [actions]);

  const currentChapter = [...chapters]
    .reverse()
    .find((chapter) => chapter.time <= state.currentTime);

  const handleSeekTo = useCallback(
    (time: number) => {
      if (videoRef.current) {
        videoRef.current.currentTime = time;
        actions.toggleChapters();
      }
    },
    [actions],
  );

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current) {
      const timeline = e.currentTarget;
      const rect = timeline.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const seekFraction = clickX / rect.width;

      videoRef.current.currentTime = seekFraction * state.duration;
    }
  };

  const toggleSettings = () => {
    actions.setIsSettingsOpen(!state.isSettingsOpen);
  };

  const hlsInstance = hlsRef.current;
  const currentQualityLabel =
    state.currentQuality === -1
      ? `Auto (${hlsInstance?.levels[hlsInstance?.currentLevel]?.height ?? '...'}p)`
      : `${state.availableQualities[state.currentQuality]?.height}p`;

  return (
    <>
      {state.isTheaterMode && (
        <TheaterBackdrop onClick={handleToggleTheaterMode} />
      )}
      <div
        ref={playerContainerRef}
        className={cn(
          'group transition-all duration-300 focus:outline-none',
          state.isTheaterMode
            ? 'fixed top-0 left-0 z-50 w-full'
            : 'relative mx-auto w-full max-w-4xl overflow-hidden rounded-lg',
          !state.areControlsVisible && state.isPlaying && 'cursor-none',
        )}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        tabIndex={0}
      >
        <div className="relative aspect-video w-full overflow-hidden bg-black">
          {title && (
            <div
              className={cn(
                'absolute top-0 right-0 left-0 z-20 bg-gradient-to-b from-black/60 to-transparent p-4 transition-opacity duration-300',
                state.areControlsVisible ? 'opacity-100' : 'opacity-0',
              )}
            >
              <h1 className="truncate text-xl font-bold text-white">{title}</h1>
            </div>
          )}

          <video
            ref={videoRef}
            className={`h-full w-full ${state.isMiniPlayer ? 'invisible' : ''}`}
            playsInline
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
              onDoubleClick={handleSeekBackward}
              onClick={actions.togglePlay}
            />

            <div
              className="h-full w-full"
              onDoubleClick={handleSeekForward}
              onClick={actions.togglePlay}
            />
          </div>

          <div
            className={`pointer-events-none absolute inset-0 flex items-center justify-center transition-all duration-500 ease-out ${
              seekIndicator !== 'none'
                ? 'opacity-100 scale-100'
                : 'opacity-0 scale-90'
            }`}
          >
            {seekIndicator === 'backward' && (
              <div className="flex flex-col items-center text-white">
                <div className="flex">
                  <ChevronLeft className="h-8 w-8" />
                  <ChevronLeft className="h-8 w-8 -ml-4" />
                  <ChevronLeft className="h-8 w-8 -ml-4" />
                </div>

                <span className="text-lg font-semibold">
                  {Math.abs(cumulativeSeek)}s
                </span>
              </div>
            )}

            {seekIndicator === 'forward' && (
              <div className="flex flex-col items-center text-white">
                <div className="flex">
                  <ChevronRight className="h-8 w-8" />
                  <ChevronRight className="h-8 w-8 -ml-4" />
                  <ChevronRight className="h-8 w-8 -ml-4" />
                </div>

                <span className="text-lg font-semibold">{cumulativeSeek}s</span>
              </div>
            )}
          </div>

          {state.isBuffering && state.hasStarted && !state.error && (
            <div
              role="status"
              className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
            >
              <Loader2 className="h-12 w-12 animate-spin text-white/70" />
            </div>
          )}

          {state.error && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-black text-white">
              <AlertTriangle className="h-10 w-10 text-red-500" />

              <p className="font-semibold">Video Error</p>

              <p className="text-sm text-gray-400">{state.error}</p>
            </div>
          )}

          {!state.hasStarted && poster && (
            <img
              src={poster}
              alt={title || 'Video poster'}
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}

          {!state.hasStarted && !state.error && (
            <div className="absolute inset-0 z-10 flex items-center justify-center">
              <button
                onClick={actions.togglePlay}
                className="cursor-pointer rounded-full bg-black/50 p-4 text-white transition-colors duration-300 hover:bg-black/70"
                aria-label="Play video"
                title="Play video"
              >
                <Play className="h-12 w-12 fill-white pl-1" />
              </button>
            </div>
          )}

          {state.isMiniPlayer && (
            <div className="absolute inset-0 flex items-center justify-center bg-black text-white">
              <p>This video is playing in Picture-in-Picture mode.</p>
            </div>
          )}

          {state.isSettingsOpen && (
            <SettingsMenu
              playbackSpeed={state.playbackSpeed}
              onSpeedChange={actions.setPlaybackSpeed}
              availableQualities={state.availableQualities}
              currentQuality={state.currentQuality}
              onQualityChange={actions.setCurrentQuality}
              currentQualityLabel={currentQualityLabel}
            />
          )}

          {state.areChaptersVisible && (
            <ChaptersSidebar
              chapters={chapters}
              currentTime={state.currentTime}
              onSeekTo={handleSeekTo}
              onClose={actions.toggleChapters}
            />
          )}

          <PlayerControls
            {...state}
            isVisible={state.areControlsVisible && state.hasStarted}
            onPlayPause={actions.togglePlay}
            onSeek={handleSeek}
            onVolumeChange={actions.setVolume}
            toggleMute={actions.toggleMute}
            toggleFullScreen={toggleFullScreen}
            toggleSettings={toggleSettings}
            toggleSubtitles={toggleSubtitles}
            toggleMiniPlayer={toggleMiniPlayer}
            onNext={handleNext}
            onPrevious={handlePrevious}
            toggleAutoplay={actions.toggleAutoplay}
            onTimelineHover={handleTimelineHover}
            onTimelineMouseLeave={handleTimelineMouseLeave}
            toggleTheaterMode={handleToggleTheaterMode}
            onSeekTo={handleSeekTo}
            currentChapter={currentChapter?.label}
            onToggleChapters={actions.toggleChapters}
          />
        </div>
      </div>
    </>
  );
}

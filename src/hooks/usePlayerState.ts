import { useEffect } from 'react';

export const usePlayerState = (
  videoElement: HTMLVideoElement | null,
  onEnded: () => void,
  actions: {
    setIsPlaying: (isPlaying: boolean) => void;
    setProgress: (progress: number) => void;
    setBuffered: (buffered: number) => void;
    setDuration: (duration: number) => void;
    setCurrentTime: (time: number) => void;
    setIsBuffering: (isBuffering: boolean) => void;
  },
) => {
  const {
    setIsPlaying,
    setProgress,
    setBuffered,
    setDuration,
    setCurrentTime,
    setIsBuffering,
  } = actions;

  useEffect(() => {
    const video = videoElement;
    if (!video) return;

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

    const handleWaiting = () => setIsBuffering(true);
    const handlePlaying = () => setIsBuffering(false);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('progress', handleProgress);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', onEnded);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('progress', handleProgress);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', onEnded);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
    };
  }, [
    videoElement,
    onEnded,
    setIsPlaying,
    setProgress,
    setBuffered,
    setDuration,
    setCurrentTime,
    setIsBuffering,
  ]);
};

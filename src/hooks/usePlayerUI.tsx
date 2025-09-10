import { useCallback, useEffect, useRef } from 'react';
import { formatTime } from '../lib/utils';

export const usePlayerUI = (
  state: { isPlaying: boolean; isSettingsOpen: boolean; duration: number },
  actions: {
    setAreControlsVisible: (isVisible: boolean) => void;
    setIsTooltipVisible: (isVisible: boolean) => void;
    setTooltipContent: (content: string) => void;
    setTooltipPosition: (position: number) => void;
  },
) => {
  const { isPlaying, isSettingsOpen, duration } = state;
  const {
    setAreControlsVisible,
    setIsTooltipVisible,
    setTooltipContent,
    setTooltipPosition,
  } = actions;

  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    inactivityTimerRef.current = setTimeout(() => {
      if (isPlaying && !isSettingsOpen) {
        setAreControlsVisible(false);
      }
    }, 3000);
  }, [isPlaying, isSettingsOpen, setAreControlsVisible]);

  useEffect(() => {
    if (isPlaying) {
      resetInactivityTimer();
    } else {
      setAreControlsVisible(true);

      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    }
  }, [isPlaying, isSettingsOpen, resetInactivityTimer, setAreControlsVisible]);

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

  const handleTimelineHover = (positionX: number, timeFraction: number) => {
    setTooltipPosition(positionX);
    setTooltipContent(formatTime(timeFraction * duration));
    setIsTooltipVisible(true);
  };

  const handleTimelineMouseLeave = () => {
    setIsTooltipVisible(false);
  };

  return {
    handleMouseMove,
    handleMouseLeave,
    handleTimelineHover,
    handleTimelineMouseLeave,
  };
};

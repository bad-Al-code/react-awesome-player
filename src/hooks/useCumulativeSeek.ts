import { useCallback, useRef, useState } from 'react';

export function useCumulativeSeek(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  duration: number,
) {
  const [cumulativeSeek, setCumulativeSeek] = useState(0);
  const seekResetTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const seekIndicatorTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [seekIndicator, setSeekIndicator] = useState<
    'forward' | 'backward' | 'none'
  >('none');

  const seekRelative = useCallback(
    (delta: number) => {
      if (videoRef.current) {
        const newTime = videoRef.current.currentTime + delta;
        videoRef.current.currentTime = Math.max(0, Math.min(duration, newTime));
      }
    },
    [duration, videoRef],
  );

  const handleCumulativeSeek = useCallback(
    (direction: 'forward' | 'backward') => {
      const seekAmount = direction === 'forward' ? 10 : -10;
      const newCumulativeSeek = cumulativeSeek + seekAmount;
      setCumulativeSeek(newCumulativeSeek);
      setSeekIndicator(direction);

      if (seekResetTimeoutRef.current)
        clearTimeout(seekResetTimeoutRef.current);
      if (seekIndicatorTimeoutRef.current)
        clearTimeout(seekIndicatorTimeoutRef.current);

      seekResetTimeoutRef.current = setTimeout(() => {
        seekRelative(newCumulativeSeek);
        setCumulativeSeek(0);
        seekIndicatorTimeoutRef.current = setTimeout(
          () => setSeekIndicator('none'),
          400,
        );
      }, 800);
    },
    [cumulativeSeek, seekRelative],
  );

  const handleSeekForward = () => handleCumulativeSeek('forward');
  const handleSeekBackward = () => handleCumulativeSeek('backward');

  return {
    handleSeekForward,
    handleSeekBackward,
    seekIndicator,
    cumulativeSeek,
  };
}

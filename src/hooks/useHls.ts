import Hls from 'hls.js';
import { useEffect, useRef } from 'react';
import { usePlayerStore } from '../store/playerStore';

export const useHls = (
  src: string | undefined,
  videoElement: HTMLVideoElement | null,
) => {
  const { setAvailableQualities, setIsBuffering, setError } = usePlayerStore(
    (state) => ({
      setAvailableQualities: state.setAvailableQualities,
      setIsBuffering: state.setIsBuffering,
      setError: state.setError,
    }),
  );

  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    if (!videoElement || !src) return;

    setIsBuffering(true);

    if (hlsRef.current) {
      hlsRef.current.destroy();
    }

    let hls: Hls;
    if (Hls.isSupported()) {
      hls = new Hls();
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(videoElement);

      hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
        setAvailableQualities([...data.levels]);
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setError('This video could not be loaded.');

              hls.destroy();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              setError('An error occurred while playing the video.');

              hls.recoverMediaError();
              break;
            default:
              setError('An unexpected error occurred.');

              hls.destroy();
              break;
          }
        }
      });
    } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
      videoElement.src = src;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src, videoElement, setAvailableQualities, setIsBuffering, setError]);

  return hlsRef;
};

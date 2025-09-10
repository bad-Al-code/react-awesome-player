import { useEffect } from 'react';

interface ShortcutActions {
  togglePlay: () => void;
  handleNext: () => void;
  handlePrevious: () => void;
  toggleMute: () => void;
  toggleFullScreen: () => void;
  toggleSubtitles: () => void;
  toggleTheaterMode: () => void;
  toggleMiniPlayer: () => void;
  seekForward: () => void;
  seekBackward: () => void;
  increaseVolume: () => void;
  decreaseVolume: () => void;
  seekToPercentage: (percentage: number) => void;
}

export const useKeyboardShortcuts = (actions: ShortcutActions) => {
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
          actions.togglePlay();
          break;
        case 'N':
          actions.handleNext();
          break;
        case 'P':
          actions.handlePrevious();
          break;
        case 'm':
        case 'M':
          actions.toggleMute();
          break;
        case 'f':
        case 'F':
          actions.toggleFullScreen();
          break;
        case 'c':
        case 'C':
          actions.toggleSubtitles();
          break;
        case 't':
        case 'T':
          actions.toggleTheaterMode();
          break;
        case 'i':
        case 'I':
          actions.toggleMiniPlayer();
          break;
        case 'l':
        case 'L':
        case 'ArrowRight':
          actions.seekForward();
          break;
        case 'j':
        case 'J':
        case 'ArrowLeft':
          actions.seekBackward();
          break;
        case 'ArrowUp':
          e.preventDefault();
          actions.increaseVolume();
          break;
        case 'ArrowDown':
          e.preventDefault();
          actions.decreaseVolume();
          break;

        case '1':
          actions.seekToPercentage(10);
          break;
        case '2':
          actions.seekToPercentage(20);
          break;
        case '3':
          actions.seekToPercentage(30);
          break;
        case '4':
          actions.seekToPercentage(40);
          break;
        case '5':
          actions.seekToPercentage(50);
          break;
        case '6':
          actions.seekToPercentage(60);
          break;
        case '7':
          actions.seekToPercentage(70);
          break;
        case '8':
          actions.seekToPercentage(80);
          break;
        case '9':
          actions.seekToPercentage(90);
          break;
        case '0':
          actions.seekToPercentage(0);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [actions]);
};

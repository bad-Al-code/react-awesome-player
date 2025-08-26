import { X } from 'lucide-react';
import { formatTime } from './lib/utils';

interface ChaptersSidebarProps {
  chapters: { time: number; label: string; thumbnail?: string }[];
  currentTime: number;
  onSeekTo: (time: number) => void;
  onClose: () => void;
}

export function ChaptersSidebar({
  chapters,
  currentTime,
  onSeekTo,
  onClose,
}: ChaptersSidebarProps) {
  const activeChapter = [...chapters]
    .reverse()
    .find((chapter) => chapter.time <= currentTime);

  return (
    <div className="absolute top-0 right-0 bottom-0 z-30 flex h-full w-80 flex-col bg-black/70 text-white backdrop-blur-md ">
      <div className="flex items-center justify-between border-b border-foreground/20 p-4">
        <h2 className="text-lg font-bold">Chapters</h2>
        <button
          onClick={onClose}
          className="rounded-full p-1 hover:bg-white/10"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {chapters.map((chapter) => (
          <button
            key={chapter.time}
            onClick={() => onSeekTo(chapter.time)}
            className={`flex w-full items-center gap-4 p-4 text-left hover:bg-white/10 ${
              activeChapter?.time === chapter.time
                ? 'bg-white/20 hover:bg-white/20'
                : ''
            }`}
          >
            {chapter.thumbnail && (
              <img
                src={chapter.thumbnail}
                alt={chapter.label}
                className="h-10 w-16 rounded-md object-cover"
              />
            )}
            <div>
              <p className="font-semibold">{chapter.label}</p>
              <span className="text-xs text-blue-400">
                {formatTime(chapter.time)}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

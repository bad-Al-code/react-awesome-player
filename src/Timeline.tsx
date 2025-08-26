import { TimelineProps } from './types';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

export function Timeline({
  progress,
  buffered,
  onSeek,
  onHover,
  onMouseLeave,
  onSeekTo,
  duration,
  chapters = [],
}: TimelineProps) {
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const timeline = e.currentTarget;
    const rect = timeline.getBoundingClientRect();
    const hoverX = e.clientX - rect.left;
    const hoverFraction = hoverX / rect.width;

    onHover(hoverX, hoverFraction);
  };

  return (
    <div
      onClick={onSeek}
      onMouseMove={handleMouseMove}
      onMouseLeave={onMouseLeave}
      className="group/timeline relative h-2.5 w-full cursor-pointer"
    >
      <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-white/20" />
      <div
        className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/30"
        style={{ width: `${buffered}%` }}
      />
      <div
        className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-white"
        style={{ width: `${progress}%` }}
      />
      <div
        className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white transition-transform group-hover/timeline:scale-100"
        style={{ left: `${progress}%` }}
      />

      {duration > 0 &&
        chapters.map((chapter) => (
          <Tooltip key={chapter.time}>
            <TooltipTrigger asChild>
              <div
                className="absolute top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full bg-white/70 hover:bg-white"
                style={{
                  left: `${(chapter.time / duration) * 100}%`,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSeekTo(chapter.time);
                }}
                data-testid="timeline-marker"
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>{chapter.label}</p>
            </TooltipContent>
          </Tooltip>
        ))}
    </div>
  );
}

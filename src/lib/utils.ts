import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatTime = (timeInSeconds: number) => {
  const date = new Date(0);
  date.setSeconds(timeInSeconds);
  const timeString = date.toISOString().substr(11, 8);
  return timeString.startsWith('00:') ? timeString.substr(3) : timeString;
};

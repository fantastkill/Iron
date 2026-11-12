import { today } from '../data/seed';
export function daysAgo(days, anchor = today()) {
  const date = new Date(`${anchor}T12:00:00`);
  date.setDate(date.getDate() - days);
  return date.toLocaleDateString('en-CA');
}
export const displayDate = (date) => new Date(`${date}T12:00:00`).toLocaleDateString('pt-BR');

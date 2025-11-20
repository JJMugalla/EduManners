const quotes = [
  "Discipline is the bridge between goals and accomplishment.",
  "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
  "Respect for ourselves guides our morals, respect for others guides our manners."
];

export const getWeeklyQuote = () => {
  // Logic to pick a quote based on the current week number
  const weekNumber = Math.floor(Date.now() / (1000 * 60 * 60 * 24 * 7));
  return quotes[weekNumber % quotes.length];
};
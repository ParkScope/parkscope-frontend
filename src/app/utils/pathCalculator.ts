export const calculatePath = (start: { x: number; y: number }, end: { x: number; y: number }): { x: number; y: number }[] => {
  const path = [];
  const steps = 20;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = start.x + (end.x - start.x) * t;
    const y = start.y + (end.y - start.y) * t + Math.sin(t * Math.PI) * 20;
    path.push({ x, y });
  }

  return path;
};
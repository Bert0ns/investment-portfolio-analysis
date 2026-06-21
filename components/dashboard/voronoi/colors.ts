const getSectorColorIndex = (sector: string, length: number) => {
  let hash = 0;
  for (let i = 0; i < sector.length; i++) {
    hash = sector.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % length;
};

// Cyberpunk/Neon Color palette based on sectors
export const getVoronoiColor = (sector: string, isTail?: boolean) => {
  if (isTail) return 'rgba(128, 128, 128, 0.1)';

  // A sober but neon palette
  const colors = [
    'rgba(56, 189, 248, 0.2)', // Light Blue
    'rgba(167, 139, 250, 0.2)', // Purple
    'rgba(251, 146, 60, 0.2)', // Orange
    'rgba(52, 211, 153, 0.2)', // Emerald
    'rgba(244, 114, 182, 0.2)', // Pink
    'rgba(250, 204, 21, 0.2)', // Yellow
  ];

  return colors[getSectorColorIndex(sector, colors.length)];
};

export const getVoronoiBorderColor = (sector: string, isTail?: boolean) => {
  if (isTail) return 'rgba(128, 128, 128, 0.3)';

  const colors = [
    'rgb(56, 189, 248)',
    'rgb(167, 139, 250)',
    'rgb(251, 146, 60)',
    'rgb(52, 211, 153)',
    'rgb(244, 114, 182)',
    'rgb(250, 204, 21)',
  ];
  return colors[getSectorColorIndex(sector, colors.length)];
};

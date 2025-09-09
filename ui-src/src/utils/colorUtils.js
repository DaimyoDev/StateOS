// Color generation utilities

/**
 * Generates a random color from a predefined palette of visually appealing colors
 * @returns {string} A hex color string
 */
export const generateRandomColor = () => {
  const colors = [
    "#FF6B6B",
    "#4ECDC4", 
    "#45B7D1",
    "#96CEB4",
    "#FECA57",
    "#FF9FF3",
    "#54A0FF",
    "#5F27CD",
    "#00D2D3",
    "#FF9F43",
    "#10AC84",
    "#EE5A24",
    "#0984E3",
    "#6C5CE7",
    "#A29BFE",
    "#FD79A8",
    "#FDCB6E",
    "#E17055",
    "#74B9FF",
    "#81ECEC",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

/**
 * Generates a random hex color
 * @returns {string} A hex color string
 */
export const generateRandomHexColor = () => {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
};

/**
 * Lightens or darkens a hex color by a percentage
 * @param {string} color - Hex color string
 * @param {number} amount - Amount to lighten (positive) or darken (negative) as percentage
 * @returns {string} Modified hex color
 */
export const adjustBrightness = (color, amount) => {
  const usePound = color[0] === '#';
  const col = usePound ? color.slice(1) : color;
  
  const num = parseInt(col, 16);
  let r = (num >> 16) + amount;
  let g = (num >> 8 & 0x00FF) + amount;
  let b = (num & 0x0000FF) + amount;
  
  r = r > 255 ? 255 : r < 0 ? 0 : r;
  g = g > 255 ? 255 : g < 0 ? 0 : g;
  b = b > 255 ? 255 : b < 0 ? 0 : b;
  
  return (usePound ? '#' : '') + (r << 16 | g << 8 | b).toString(16).padStart(6, '0');
};
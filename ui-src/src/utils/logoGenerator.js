import { getSymbolForIdeology, getRandomPattern } from "../data/logoSymbols";
import { LETTERS } from "../data/pixelLetterData";
import {
  generateNuancedColor,
  hexToHSL,
  hslToHex,
} from "../utils/generalUtils";

/**
 * Finds a high-contrast color for a given background color.
 * It does this by shifting the hue to the opposite side of the color wheel.
 * @param {string} backgroundColorHex - The hex color of the background.
 * @returns {string} A high-contrast hex color for the symbol.
 */
const getHighContrastColor = (backgroundColorHex) => {
  const bgHsl = hexToHSL(backgroundColorHex);
  if (!bgHsl) return "#FFFFFF"; // Fallback to white

  // Shift hue by 180 degrees (complementary color)
  const symbolHue = (bgHsl.h + 180) % 360;

  // Ensure high saturation and lightness for visibility
  const symbolSaturation = Math.max(70, bgHsl.s);
  const symbolLightness = Math.max(80, 100 - bgHsl.l / 2);

  return hslToHex({ h: symbolHue, s: symbolSaturation, l: symbolLightness });
};

/**
 * Generates a procedural pixel art logo for a political party.
 * @param {object} options - The options for logo generation.
 * @param {string} options.primaryColor - The primary color from the party's ideology.
 * @param {string} options.ideologyId - The ID of the party's main ideology.
 * @param {string} [options.level='national'] - The administrative level ('national', 'state', 'county').
 * @param {string} [options.regionInitial] - The initial of the region (e.g., 'CA').
 * @returns {string} A data URL representing the generated PNG image.
 */
export const generatePartyLogo = ({
  primaryColor = "#808080",
  ideologyId = "default",
  level = "national",
  regionInitial = "",
  text = "",
}) => {
  const canvasSize = 128; // New higher resolution
  const pixelSize = 8; // Each matrix point is now an 8x8 block

  const canvas = document.createElement("canvas");
  canvas.width = canvasSize;
  canvas.height = canvasSize;
  const ctx = canvas.getContext("2d");

  // --- 1. Define a multi-color palette ---
  const backgroundColor = generateNuancedColor(primaryColor, 40, 30);
  const patternColor = generateNuancedColor(backgroundColor, 15, 10);

  // Create a more diverse color palette based on the primary color
  const palette = {
    1: getHighContrastColor(backgroundColor), // Primary Symbol Color
    2: generateNuancedColor(primaryColor, 20, 30, 60), // Secondary color with hue shift
    3: generateNuancedColor(primaryColor, -20, 20, -60), // Accent color
  };

  // --- 2. Draw Background ---
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvasSize, canvasSize);

  // --- 3. Draw Background Pattern ---
  // This can also be updated to use the new color palette
  const patternMatrix = getRandomPattern();
  if (patternMatrix) {
    ctx.fillStyle = patternColor;
    for (let y = 0; y < patternMatrix.length; y++) {
      for (let x = 0; x < patternMatrix[y].length; x++) {
        if (patternMatrix[y][x] === 1) {
          ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
        }
      }
    }
  }

  // --- 4. Draw Multi-color Main Symbol ---
  const symbolMatrix = getSymbolForIdeology(ideologyId);
  for (let y = 0; y < symbolMatrix.length; y++) {
    for (let x = 0; x < symbolMatrix[y].length; x++) {
      const colorIndex = symbolMatrix[y][x];
      if (colorIndex in palette) {
        ctx.fillStyle = palette[colorIndex];
        ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
      }
    }
  }

  if (text) {
    const letterMatrix = LETTERS[text.toUpperCase()];
    if (letterMatrix) {
      const textColor = getHighContrastColor(backgroundColor);
      ctx.fillStyle = textColor;

      // These values may need to be adjusted to properly center the text
      const textX = (canvasSize - letterMatrix[0].length * pixelSize) / 2;
      const textY = (canvasSize - letterMatrix.length * pixelSize) / 2;

      for (let y = 0; y < letterMatrix.length; y++) {
        for (let x = 0; x < letterMatrix[y].length; x++) {
          if (letterMatrix[y][x] === 1) {
            ctx.fillRect(
              textX + x * pixelSize,
              textY + y * pixelSize,
              pixelSize,
              pixelSize
            );
          }
        }
      }
    }
  }

  const highContrastStrokeColor = palette["1"];

  // --- 5. Add Hierarchical Variation ---
  if (level === "state" && regionInitial) {
    ctx.font = "bold 10px sans-serif";
    ctx.fillStyle = backgroundColor;
    // -- FIX: Use the new high-contrast color for the stroke --
    ctx.strokeStyle = highContrastStrokeColor;
    ctx.lineWidth = 2.5;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.strokeText(regionInitial, canvasSize / 2, canvasSize / 2 + 1);
    ctx.fillText(regionInitial, canvasSize / 2, canvasSize / 2 + 1);
  } else if (level === "county") {
    // -- FIX: Use the new high-contrast color for the border --
    ctx.strokeStyle = highContrastStrokeColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, canvasSize - 2, canvasSize - 2);
  }

  return canvas.toDataURL("image/png");
};

import { FONT_DATA } from "../data/fontData"; // We will create this file next

/**
 * Modifies a matrix to apply a shield shape by "masking" outside areas.
 * @param {Array<Array<number>>} matrix - The matrix to modify.
 * @param {number} backgroundColorIndex - The index in the palette for the background.
 */

/**
 * Draws text with a high-contrast outline and proper letter spacing (kerning).
 * @param {Array<Array<number>>} matrix - The matrix to modify.
 * @param {string} text - The string to draw.
 * @param {number} fillColorIndex - The color index for the main text fill.
 * @param {number} outlineColorIndex - The color index for the text outline.
 * @param {{x: number, y: number}} position - The top-left starting corner.
 * @param {number} size - A scaling factor for the font (e.g., 2 = double size).
 */
export function drawText(
  matrix,
  text,
  fillColorIndex,
  outlineColorIndex,
  position,
  size = 1
) {
  const textToDraw = text.toUpperCase();
  const charWidth = FONT_DATA.meta.width;
  const kerning = 1 * size; // Add 1 pixel of spacing between letters, scaled by size
  let currentX = position.x;

  for (let i = 0; i < textToDraw.length; i++) {
    const charMatrix = FONT_DATA[textToDraw[i]];
    if (charMatrix) {
      // Draw outline first by drawing the character at 4 offset positions
      const offsets = [
        [-size, 0],
        [size, 0],
        [0, -size],
        [0, size],
      ]; // Left, Right, Up, Down
      for (const offset of offsets) {
        drawCharacter(
          matrix,
          charMatrix,
          outlineColorIndex,
          { x: currentX + offset[0], y: position.y + offset[1] },
          size
        );
      }
      // Draw the main fill color on top
      drawCharacter(
        matrix,
        charMatrix,
        fillColorIndex,
        { x: currentX, y: position.y },
        size
      );

      currentX += charWidth * size + kerning; // Advance cursor for next letter
    }
  }
}

// Helper function for the new drawText
function drawCharacter(matrix, charMatrix, colorIndex, position, size) {
  const charHeight = FONT_DATA.meta.height;
  const charWidth = FONT_DATA.meta.width;

  for (let y = 0; y < charHeight; y++) {
    for (let x = 0; x < charWidth; x++) {
      if (charMatrix[y][x] === 1) {
        for (let sy = 0; sy < size; sy++) {
          for (let sx = 0; sx < size; sx++) {
            const targetX = position.x + x * size + sx;
            const targetY = position.y + y * size + sy;
            if (matrix[targetY] && matrix[targetY][targetX] !== undefined) {
              matrix[targetY][targetX] = colorIndex;
            }
          }
        }
      }
    }
  }
}

export function drawShieldOutline(matrix, backgroundColorIndex) {
  const height = matrix.length;
  const width = matrix[0].length;
  const centerX = width / 2;
  const sharpTipY = height * 0.85;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let inShape = false;
      // Simple rectangle for the top half
      if (y < height / 2) {
        inShape = true;
      } else {
        // Pointed bottom half
        const progress = (y - height / 2) / (sharpTipY - height / 2);
        const halfWidthAtY = (width / 2) * (1 - progress);
        if (Math.abs(x - centerX) < halfWidthAtY) {
          inShape = true;
        }
      }
      if (!inShape) {
        matrix[y][x] = backgroundColorIndex;
      }
    }
  }
}

/**
 * Overwrites a matrix to create a horizontal tricolor flag.
 * @param {Array<Array<number>>} matrix - The matrix to modify.
 * @param {number[]} colorIndices - An array of 3 color indices to use.
 */
export function drawHorizontalTricolor(matrix, colorIndices) {
  const height = matrix.length;
  const sectionHeight = Math.floor(height / 3);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < matrix[y].length; x++) {
      if (y < sectionHeight) {
        matrix[y][x] = colorIndices[0];
      } else if (y < sectionHeight * 2) {
        matrix[y][x] = colorIndices[1];
      } else {
        matrix[y][x] = colorIndices[2];
      }
    }
  }
}

/**
 * Modifies a matrix to apply a circular mask.
 * @param {Array<Array<number>>} matrix - The matrix to modify.
 * @param {number} backgroundColorIndex - The index for the outside area.
 */
export function drawCircleMask(matrix, backgroundColorIndex) {
  const height = matrix.length;
  const width = matrix[0].length;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = width / 2;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const distance = Math.sqrt(
        Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
      );
      if (distance > radius) {
        matrix[y][x] = backgroundColorIndex;
      }
    }
  }
}

/**
 * Modifies a matrix to apply a diamond (rhombus) mask.
 * @param {Array<Array<number>>} matrix - The matrix to modify.
 * @param {number} backgroundColorIndex - The index for the outside area.
 */
export function drawDiamondMask(matrix, backgroundColorIndex) {
  const height = matrix.length;
  const width = matrix[0].length;
  const centerX = width / 2;
  const centerY = height / 2;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Manhattan distance from center, normalized
      const distance =
        Math.abs(x - centerX) / centerX + Math.abs(y - centerY) / centerY;
      if (distance > 1) {
        matrix[y][x] = backgroundColorIndex;
      }
    }
  }
}

/**
 * Draws a symbol matrix onto a target matrix at a specific position.
 * @param {Array<Array<number>>} targetMatrix - The main 128x128 matrix.
 * @param {Array<Array<number>>} symbolMatrix - The smaller symbol (e.g., 32x32).
 * @param {{x: number, y: number}} position - Top-left coordinates to start drawing.
 * @param {Object.<number, number>} paletteMap - Maps symbol color indices to final palette indices.
 */
export function drawSymbolOnMatrix(
  targetMatrix,
  symbolMatrix,
  position,
  newSize,
  paletteMap
) {
  const sourceHeight = symbolMatrix.length;
  if (sourceHeight === 0) return;
  const sourceWidth = symbolMatrix[0].length;

  // Loop through the target destination area (newSize x newSize)
  for (let targetY = 0; targetY < newSize; targetY++) {
    for (let targetX = 0; targetX < newSize; targetX++) {
      // Calculate the corresponding pixel in the source matrix
      const sourceX = Math.floor(targetX * (sourceWidth / newSize));
      const sourceY = Math.floor(targetY * (sourceHeight / newSize));

      const symbolColorIndex = symbolMatrix[sourceY][sourceX];

      if (paletteMap[symbolColorIndex] !== undefined) {
        const finalX = position.x + targetX;
        const finalY = position.y + targetY;

        if (
          targetMatrix[finalY] &&
          targetMatrix[finalY][finalX] !== undefined
        ) {
          const finalColorIndex = paletteMap[symbolColorIndex];
          targetMatrix[finalY][finalX] = finalColorIndex;
        }
      }
    }
  }
}

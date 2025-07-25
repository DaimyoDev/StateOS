// src/lib/proceduralMatrices.js

// --- Individual Pattern Generators ---
// These now all correctly accept and use the 'colorCount' parameter.

function generateConcentricCircles(width, height, colorCount) {
  const matrix = Array.from({ length: height }, () => Array(width).fill(0));
  const centerX = width / 2;
  const centerY = height / 2;
  const ringSize = 4 + Math.random() * 8; // Randomize ring thickness

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const distance = Math.sqrt(
        Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
      );
      // Use thematic colors, skipping the neutrals [0,1,2]
      const colorIndex =
        3 + (Math.floor(distance / ringSize) % (colorCount - 3));
      matrix[y][x] = colorIndex;
    }
  }
  return matrix;
}

function generateDiagonalStripes(width, height, colorCount) {
  const matrix = Array.from({ length: height }, () => Array(width).fill(0));
  const stripeWidth = 10 + Math.random() * 10; // Randomize stripe thickness
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const colorIndex =
        3 + (Math.floor((x + y) / stripeWidth) % (colorCount - 3));
      matrix[y][x] = colorIndex;
    }
  }
  return matrix;
}

function generateVerticalBars(width, height, colorCount) {
  const matrix = Array.from({ length: height }, () => Array(width).fill(0));
  const barWidth = 10 + Math.random() * 10;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const colorIndex = 3 + (Math.floor(x / barWidth) % (colorCount - 3));
      matrix[y][x] = colorIndex;
    }
  }
  return matrix;
}

/**
 * Generates a matrix divided into four quarters using random thematic colors.
 */
function generateQuartered(width, height, colorCount) {
  const matrix = Array.from({ length: height }, () => Array(width).fill(0));
  const midX = width / 2;
  const midY = height / 2;

  // FIX: Randomly select four distinct thematic colors from the available palette range.
  const availableColors = Array.from(
    { length: colorCount - 3 },
    (_, i) => i + 3
  );
  const colors = [];
  for (let i = 0; i < 4; i++) {
    const randomIndex = Math.floor(Math.random() * availableColors.length);
    colors.push(availableColors.splice(randomIndex, 1)[0]);
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (x < midX && y < midY) matrix[y][x] = colors[0];
      else if (x >= midX && y < midY) matrix[y][x] = colors[1];
      else if (x < midX && y >= midY) matrix[y][x] = colors[2];
      else matrix[y][x] = colors[3];
    }
  }
  return matrix;
}

function generateCheckerboard(width, height, colorCount) {
  const matrix = Array.from({ length: height }, () => Array(width).fill(0));
  const checkSize = 16;
  // Use the dark neutral and a random thematic color
  const color1 = 1;
  const color2 = 3 + Math.floor(Math.random() * (colorCount - 3));
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const checkX = Math.floor(x / checkSize);
      const checkY = Math.floor(y / checkSize);
      matrix[y][x] = (checkX + checkY) % 2 === 0 ? color1 : color2;
    }
  }
  return matrix;
}

/**
 * Generates a solid color fill using a random thematic color.
 */
function generateSolidFill(width, height, colorCount) {
  // FIX: Use the full range of thematic colors based on colorCount.
  const colorIndex = 3 + Math.floor(Math.random() * (colorCount - 3));
  return Array.from({ length: height }, () => Array(width).fill(colorIndex));
}

/**
 * Generates a horizontal bicolor flag using thematic colors.
 */
function generateBicolorFlag(width, height, colorCount) {
  const matrix = Array.from({ length: height }, () => Array(width).fill(0));
  const midY = Math.floor(height / 2);

  // FIX: Use the full range of thematic colors for the main stripe.
  const color1 = 3 + Math.floor(Math.random() * (colorCount - 3));
  const color2 = 0; // Use the light neutral for high contrast

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      matrix[y][x] = y < midY ? color1 : color2;
    }
  }
  return matrix;
}

/**
 * Generates a horizontal tricolor flag using thematic colors.
 */
function generateTricolorFlag(width, height) {
  const matrix = Array.from({ length: height }, () => Array(width).fill(0));
  const sectionHeight = Math.floor(height / 3);

  // FIX: Select colors more dynamically from the available palette.
  const analogousColors = Array.from({ length: 5 }, (_, i) => i + 3); // Indices 3-7
  const contrastColors = Array.from({ length: 4 }, (_, i) => i + 8); // Indices 8-11

  const c1 =
    analogousColors[Math.floor(Math.random() * analogousColors.length)];
  const c2 = 0; // Light neutral
  const c3 = contrastColors[Math.floor(Math.random() * contrastColors.length)];
  const colors = [c1, c2, c3];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (y < sectionHeight) matrix[y][x] = colors[0];
      else if (y < sectionHeight * 2) matrix[y][x] = colors[1];
      else matrix[y][x] = colors[2];
    }
  }
  return matrix;
}

// --- Main Thematic Generator Function ---
export function generateProceduralMatrix(width, height, ideologyId) {
  const colorCount = 12;

  // 1. Define categories for ideologies
  const ideologyTypes = {
    conservative: "orderly",
    reactionary: "orderly",
    monarchist: "orderly",
    technocratic: "orderly",
    religious_conservative: "orderly",
    liberal: "dynamic",
    progressive: "dynamic",
    centrist: "dynamic",
    social_democrat: "dynamic",
    pragmatist: "dynamic",
    green: "organic",
    agrarian: "organic",
    socialist: "revolutionary",
    communist: "revolutionary",
    nationalist: "revolutionary",
    populist: "revolutionary",
    anarchist: "chaotic",
    libertarian: "chaotic",
    transhumanist: "dynamic",
  };

  // 2. Map pattern types to our generator functions
  const patternTypes = {
    orderly: [generateCheckerboard, generateVerticalBars, generateQuartered],
    dynamic: [generateDiagonalStripes, generateSolidFill, generateTricolorFlag],
    organic: [generateConcentricCircles, generateSolidFill],
    revolutionary: [
      generateTricolorFlag,
      generateBicolorFlag,
      generateDiagonalStripes,
    ],
    chaotic: [generateDiagonalStripes, generateConcentricCircles],
    default: [
      generateSolidFill,
      generateDiagonalStripes,
      generateConcentricCircles,
      generateBicolorFlag,
    ],
  };

  // 3. Select the appropriate list of generators
  const type = ideologyTypes[ideologyId] || "default";
  const generators = patternTypes[type];

  // 4. Pick a random generator from the thematic list and call it
  const randomGenerator =
    generators[Math.floor(Math.random() * generators.length)];
  return randomGenerator(width, height, colorCount);
}

// src/lib/logoGenerator.js

import { generateProceduralMatrix } from "../lib/proceduralMatrices";
import { generateIdeologicalPalette } from "../utils/generalUtils";
import { SYMBOLS } from "../data/symbols/symbols";
import {
  drawShieldOutline,
  drawCircleMask,
  drawDiamondMask,
  drawSymbolOnMatrix,
  drawText,
} from "../lib/shapeDrawer";
import { FONT_DATA } from "../data/fontData";

const getSymbolForIdeology = (ideologyId) => {
  const symbols = SYMBOLS[ideologyId] || SYMBOLS.default;
  if (!symbols || symbols.length === 0) return null;
  return symbols[Math.floor(Math.random() * symbols.length)];
};

function wrapText(text, maxChars) {
  const lines = [];
  let currentLine = "";
  for (let i = 0; i < text.length; i++) {
    currentLine += text[i];
    if (currentLine.length >= maxChars) {
      lines.push(currentLine);
      currentLine = "";
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

export const generatePartyLogo = ({
  primaryColor = "#808080",
  ideologyId = "default",
  partyName = "New Party",
}) => {
  const matrixSize = 128;
  const canvasSize = 256;
  const pixelSize = canvasSize / matrixSize;
  const canvas = document.createElement("canvas");
  canvas.width = canvasSize;
  canvas.height = canvasSize;
  const ctx = canvas.getContext("2d");

  const finalPalette = generateIdeologicalPalette(primaryColor, 12);
  let matrix = generateProceduralMatrix(matrixSize, matrixSize, ideologyId);
  const symbolMatrix = getSymbolForIdeology(ideologyId);

  // --- Layout Engine ---
  if (symbolMatrix) {
    const layouts = ["center-symbol", "top-text", "initials-and-symbol"];
    const layout = layouts[Math.floor(Math.random() * layouts.length)];
    const lightColor = 0;
    const darkColor = 1;

    switch (layout) {
      case "top-text": {
        const symbolSize = 72;
        const position = {
          x: Math.floor((matrixSize - symbolSize) / 2),
          y: 48,
        };
        const paletteMap = { 1: 4, 2: 1, 3: 8, 4: 0 };
        drawSymbolOnMatrix(
          matrix,
          symbolMatrix,
          position,
          symbolSize,
          paletteMap
        );
        const words = partyName.split(" ") || [];
        const stopWords = ["THE", "A", "AN", "OF"];
        let wordToDraw = words[0] || "";
        if (stopWords.includes(wordToDraw.toUpperCase()) && words.length > 1) {
          wordToDraw = words[1];
        }
        wordToDraw = wordToDraw.slice(0, 10);
        const lines = wrapText(wordToDraw, 5);
        const textSize = lines.length > 1 ? 2 : 3;
        const textBlockHeight =
          lines.length * (FONT_DATA.meta.height * textSize);
        let startY = Math.floor((48 - textBlockHeight) / 2);
        lines.forEach((line) => {
          const textWidth = line.length * (FONT_DATA.meta.width + 1) * textSize;
          const startX = Math.floor((matrixSize - textWidth) / 2);
          drawText(
            matrix,
            line,
            lightColor,
            darkColor,
            { x: startX, y: startY },
            textSize
          );
          startY += FONT_DATA.meta.height * textSize;
        });
        break;
      }
      case "initials-and-symbol": {
        const symbolSize = 72;
        const position = {
          x: 12,
          y: Math.floor((matrixSize - symbolSize) / 2),
        };
        const paletteMap = { 1: 4, 2: 1, 3: 8, 4: 0 };
        drawSymbolOnMatrix(
          matrix,
          symbolMatrix,
          position,
          symbolSize,
          paletteMap
        );
        const initials = (partyName.split(" ").map((word) => word[0]) || [])
          .join("")
          .slice(0, 3);
        const textSize = initials.length > 2 ? 3 : 4;
        const textHeight = FONT_DATA.meta.height * textSize;
        const textWidth =
          initials.length * (FONT_DATA.meta.width + 1) * textSize;
        const rightAreaX = 64;
        const rightAreaWidth = 64;
        const startX =
          rightAreaX + Math.floor((rightAreaWidth - textWidth) / 2);
        drawText(
          matrix,
          initials,
          lightColor,
          darkColor,
          { x: startX, y: Math.floor((matrixSize - textHeight) / 2) },
          textSize
        );
        break;
      }
      case "center-symbol":
      default: {
        const symbolSize = 96;
        const position = {
          x: Math.floor((matrixSize - symbolSize) / 2),
          y: Math.floor((matrixSize - symbolSize) / 2),
        };
        const paletteMap = { 1: 4, 2: 1, 3: 8, 4: 0 };
        drawSymbolOnMatrix(
          matrix,
          symbolMatrix,
          position,
          symbolSize,
          paletteMap
        );
        break;
      }
    }
  }

  // --- Shape & Background Engine ---
  const shapeOptions = [
    drawShieldOutline,
    drawCircleMask,
    drawDiamondMask,
    null,
  ];
  const randomShape =
    shapeOptions[Math.floor(Math.random() * shapeOptions.length)];
  const isSolidEmblem = Math.random() < 0.5; // 50% chance for a solid background emblem

  if (randomShape) {
    if (isSolidEmblem) {
      const backgroundMatrix = Array.from({ length: matrixSize }, () =>
        Array(matrixSize).fill(0)
      );
      randomShape(matrix, -1);
      for (let y = 0; y < matrixSize; y++) {
        for (let x = 0; x < matrixSize; x++) {
          if (matrix[y][x] !== -1) {
            backgroundMatrix[y][x] = matrix[y][x];
          }
        }
      }
      matrix = backgroundMatrix;
    } else {
      randomShape(matrix, -1); // Use -1 as the transparent key
    }
  }

  // --- Final Render Loop ---
  for (let y = 0; y < matrix.length; y++) {
    for (let x = 0; x < matrix[y].length; x++) {
      const colorIndex = matrix[y][x];
      if (colorIndex !== -1 && finalPalette[colorIndex]) {
        // Check for -1 transparency
        ctx.fillStyle = finalPalette[colorIndex];
        ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
      }
    }
  }
  return canvas.toDataURL("image/png");
};

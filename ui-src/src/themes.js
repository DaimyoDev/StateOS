// ui-src/src/themes.js

const fontInter = "'Inter', sans-serif";
const fontMontserrat = "'Montserrat', sans-serif";
const fontMerriweather = "Merriweather, sans-serif";
const fontRobotoMono = "'Roboto Mono', monospace";

function hexToRgbString(hex) {
  hex = hex.replace(/^#/, "");
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `${r}, ${g}, ${b}`;
}

export const themes = {
  modernKyoto: {
    name: "Modern Kyoto",
    colors: {
      "--primary-bg": "#FBF6F0",
      "--secondary-bg": "#F2EAE0",
      "--ui-panel-bg": "#FFFFFF",

      "--button-bg": "#5A6A8C",
      "--button-hover-bg": "#435273",
      "--button-active-bg": "#303D59",
      "--button-text": "#FFFFFF",

      "--primary-text": "#333333",
      "--secondary-text": "#767676",
      "--accent-color": "#E6A3AD",
      "--accent-text": "#FFFFFF",
      "--rgb-accent-color": "230, 163, 173",

      "--highlight-bg": "rgba(230, 163, 173, 0.15)",
      "--border-color": "#D8CFC4",
      "--accent-border-color": "#E6A3AD",

      "--error-text": "#D9534F",
      "--success-text": "#5CB85C",
      "--disabled-bg": "#E0E0E0",
      "--disabled-text": "#A0A0A0",

      "--button-action-bg": "#E6A3AD",
      "--button-action-hover-bg": "#D98794",
      "--button-action-text": "#FFFFFF",

      "--button-delete-bg": "#767676",
      "--button-delete-hover-bg": "#5E5E5E",
      "--button-delete-text": "#FFFFFF",

      "--input-bg": "#F2EAE0",
      "--input-text": "#333333",
      "--input-placeholder-text": "#A0A0A0",
      "--progress-track-bg": "#D8CFC4",

      "--map-background-color": "#F0F4F8",
      "--map-region-default-fill": "#B0C4DE",
      "--map-region-border": "#FFFFFF",
      "--map-region-hover-fill": "rgba(230, 163, 173, 0.4)",

      "--scrollbar-track": "#F2EAE0",
      "--scrollbar-thumb": "#D8CFC4",
      "--scrollbar-thumb-hover": "#C5B8AB",
    },
    fonts: {
      "--font-main": fontInter, // Inter for readability
      "--font-heading": fontMontserrat,
    },
    styles: {
      "--panel-shadow": "0 1px 4px rgba(0,0,0,0.07)", // Very subtle, clean shadow
      "--button-shadow": "0 1px 2px rgba(0,0,0,0.05)",
      "--element-radius": "5px", // Softly rounded
      "--border-width": "1px",
      "--focus-ring-color": "#5A6A8C", // Indigo focus
      "--progress-value-color": "#5A6A8C", // Indigo progress
      "--checkbox-accent-color": "#E6A3AD", // Pink checkbox
      "--input-focus-shadow-color": "rgba(230, 163, 173, 0.3)",
      "--transition-speed": "0.15s ease-in-out",
    },
  },
  coastalSurge: {
    name: "Coastal Surge",
    colors: {
      // Backgrounds: Light and airy, using the pale sky blue
      "--primary-bg": "#F4F8FA",
      "--secondary-bg": "#BFD7EA", // Pale Sky Blue for sidebars, accents, or input BGs
      "--ui-panel-bg": "#FFFFFF", // Panels pure white for content

      // Buttons: Using the Deep Ocean Blue for a strong, trustworthy feel
      "--button-bg": "#0B3954", // Deep Ocean Blue
      "--button-hover-bg": "#082B40", // Darker shade
      "--button-active-bg": "#051E2D", // Even darker
      "--button-text": "#FEFFFE", // White text

      // Text: Dark text for readability on light backgrounds
      "--primary-text": "#0B3954", // Deep Ocean Blue for primary text (high contrast on white/pale blue)
      "--secondary-text": "#084A70", // A slightly lighter, more saturated blue for secondary

      // Accent: The Coral Red is a strong, attention-grabbing choice
      "--accent-color": "#FF6663", // Coral Red/Pink
      "--accent-text": "#FFFFFF", // White text on coral
      "--rgb-accent-color": "255, 102, 99",

      // Highlight and Borders
      "--highlight-bg": "rgba(255, 102, 99, 0.1)", // Faint coral highlight
      "--border-color": "#A5C4D7", // Desaturated Pale Sky Blue (derived from BFD7EA)
      "--accent-border-color": "#FF6663", // Coral for focus

      // Functional Colors
      "--error-text": "#D93025", // A strong, standard error red
      "--success-text": "#1E8E3E", // A clear, positive green
      "--disabled-bg": "#D3E0EA", // Muted Pale Sky Blue
      "--disabled-text": "#7F9CB0", // Greyer Sky Blue

      // Specific Button Types
      "--button-action-bg": "#FF6663", // Coral for primary "go" actions
      "--button-action-hover-bg": "#FF4D4A", // Brighter/deeper coral
      "--button-action-text": "#FFFFFF",

      "--button-delete-bg": "#0B3954", // Deep Ocean Blue (same as standard button for a serious delete)
      "--button-delete-hover-bg": "#082B40",
      "--button-delete-text": "#FEFFFE",

      "--input-bg": "#FEFFFE", // White inputs
      "--input-text": "#0B3954",
      "--input-placeholder-text": "#7F9CB0", // Muted Sky Blue
      "--progress-track-bg": "#BFD7EA", // Pale Sky Blue track

      // Secondary Accent (Lime Green) - for specific UI elements if needed (e.g., positive notifications, specific icons)
      "--secondary-accent-color": "#E0FF4F",
      "--secondary-accent-text": "#0B3954", // Dark text on lime

      // Map Colors
      "--map-background-color": "#BFD7EA", // Pale Sky Blue map area
      "--map-region-default-fill": "#87A5B8", // Muted version of the pale sky blue
      "--map-region-border": "#FEFFFE", // White border
      "--map-region-hover-fill": "rgba(255, 102, 99, 0.4)", // Coral hover

      "--scrollbar-track": "#BFD7EA",
      "--scrollbar-thumb": "#A5C4D7",
      "--scrollbar-thumb-hover": "#87A5B8",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMontserrat,
    },
    styles: {
      "--panel-shadow": "0 3px 7px rgba(11, 57, 84, 0.1)", // Soft shadow with a hint of ocean blue
      "--button-shadow": "0 2px 4px rgba(11, 57, 84, 0.15)",
      "--item-hover-shadow": "0 2px 6px rgba(11, 57, 84, 0.12)",
      "--input-focus-shadow-color": "rgba(255, 102, 99, 0.3)", // Coral glow
      "--element-radius": "6px",
      "--border-width": "1px",
      "--focus-ring-color": "#FF6663", // Coral focus ring
      "--progress-value-color": "#0B3954", // Deep Ocean Blue progress bar
      "--checkbox-accent-color": "#FF6663", // Coral for checkboxes
      "--transition-speed": "0.15s ease-in-out",
    },
  },
  midnightDepths: {
    // Theme 1: D7263D, 02182B, 0197F6, 448FA3, 68C5DB
    name: "Midnight Depths",
    colors: {
      "--primary-bg": "#02182B", // Deep Dark Blue
      "--secondary-bg": "#011220", // Even darker variant
      "--ui-panel-bg": "#0A2036", // Slightly lighter panel

      "--button-bg": "#448FA3", // Muted Teal/Blue
      "--button-hover-bg": "#5A9FB5",
      "--button-active-bg": "#3A7F91",
      "--button-text": "#FFFFFF",

      "--primary-text": "#E0E8EF", // Light grey/blue text
      "--secondary-text": "#A0B0C0", // Softer grey/blue
      "--accent-color": "#0197F6", // Bright Blue
      "--accent-text": "#FFFFFF",
      "--rgb-accent-color": hexToRgbString("#0197F6"), // "1, 151, 246"

      "--highlight-bg": "rgba(1, 151, 246, 0.2)",
      "--border-color": "#1E3A57", // Darker border
      "--accent-border-color": "#0197F6",

      "--error-text": "#D7263D", // Provided Red
      "--disabled-bg": "#0E2438",
      "--disabled-text": "#4A5C6D",

      "--success-text": "#38C172",

      "--button-action-bg": "#0197F6", // Accent Blue for primary actions
      "--button-action-hover-bg": "#0073C4",
      "--button-action-text": "#FFFFFF",

      "--button-delete-bg": "#B72030", // Darker version of D7263D or a standard red
      "--button-delete-hover-bg": "#9F1C2A",
      "--button-delete-text": "#FFFFFF",

      "--input-bg": "#011220",
      "--input-text": "#E0E8EF",
      "--input-placeholder-text": "#50687C",
      "--progress-track-bg": "#0E2438",

      "--map-background-color": "#011220",
      "--map-region-default-fill": "#0A2036",
      "--map-region-border": "#FFFFFF",
      "--map-region-hover-fill": "#68C5DB", // Lighter sky blue for hover
    },
    fonts: {
      "--font-main": fontRobotoMono,
      "--font-heading": fontMontserrat,
    },
    styles: {
      "--panel-shadow": "0 6px 18px rgba(0, 0, 0, 0.5)",
      "--button-shadow":
        "0 1px 2px rgba(0, 0, 0, 0.25), 0 2px 4px rgba(0,0,0,0.15)",
      "--item-hover-shadow": "0 2px 5px rgba(0, 0, 0, 0.35)",
      "--input-focus-shadow-color": "rgba(1, 151, 246, 0.35)",
      "--element-radius": "5px",
      "--border-width": "1px",
      "--focus-ring-color": "#0197F6",
      "--progress-value-color": "#448FA3",
      "--checkbox-accent-color": "#0197F6",
      "--transition-speed": "0.15s ease-in-out",
    },
  },
  admiralsDesk: {
    name: "Admiral's Desk",
    colors: {
      "--primary-bg": "#F5F5F0",
      "--secondary-bg": "#FFFFFF",
      // MODIFIED
      "--ui-panel-bg": "#FFFFFF",
      "--button-bg": "#324376",
      "--button-hover-bg": "#4A5B8E",
      "--button-active-bg": "#2A3A64",
      "--button-text": "#FFFFFF",
      "--primary-text": "#1A233D",
      "--secondary-text": "#586BA4",
      "--accent-color": "#F76C5E",
      "--accent-text": "#FFFFFF",
      "--rgb-accent-color": hexToRgbString("#F76C5E"),
      "--highlight-bg": "rgba(247, 108, 94, 0.15)",
      "--border-color": "#D1D5DB", // Changed to a more neutral grey
      "--accent-border-color": "#F76C5E",
      "--error-text": "#D94030",
      "--success-text": "#2E7D32",
      "--disabled-bg": "#E5E7EB",
      "--disabled-text": "#9CA3AF",
      "--button-action-bg": "#F68E5F",
      "--button-action-hover-bg": "#E67E4F",
      "--button-action-text": "#FFFFFF",
      "--button-delete-bg": "#586BA4",
      "--button-delete-hover-bg": "#4A5B8E",
      "--button-delete-text": "#FFFFFF",
      "--input-bg": "#FFFFFF",
      "--input-text": "#1A233D",
      "--input-placeholder-text": "#9CA3AF", // Changed to a more neutral grey
      "--progress-track-bg": "#E5E7EB",
      "--map-background-color": "#FFFFFF",
      "--map-region-default-fill": "#586BA4",
      "--map-region-border": "#324376",
      "--map-region-hover-fill": "#F68E5F",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMerriweather,
    },
    styles: {
      "--panel-shadow": "0 4px 12px rgba(50, 67, 118, 0.12)",
      "--button-shadow": "0 1px 3px rgba(50, 67, 118, 0.15)",
      "--item-hover-shadow": "0 2px 6px rgba(50, 67, 118, 0.1)",
      "--input-focus-shadow-color": "rgba(247, 108, 94, 0.3)",
      "--element-radius": "4px",
      "--border-width": "1px",
      "--focus-ring-color": "#F76C5E",
      "--progress-value-color": "#324376",
      "--checkbox-accent-color": "#F76C5E",
      "--transition-speed": "0.15s ease-in-out",
    },
  },
  manilaDusk: {
    name: "Manila Dusk",
    colors: {
      "--primary-bg": "#242A58", // Deep twilight indigo
      "--secondary-bg": "#1A1F45", // Darker indigo
      "--ui-panel-bg": "#3A406A", // Lighter indigo panel
      "--button-bg": "#6A709F", // Muted dusky blue
      "--button-hover-bg": "#7A80AF",
      "--button-active-bg": "#5A608F",
      "--button-text": "#F0F2FF",
      "--primary-text": "#F0F2FF", // Warm off-white
      "--secondary-text": "#D0D4F0", // Lighter lavender-grey
      "--accent-color": "#FF7F50", // Vibrant Coral/Mango Orange
      "--accent-text": "#FFFFFF",
      "--rgb-accent-color": hexToRgbString("#FF7F50"),
      "--highlight-bg": "rgba(255, 127, 80, 0.15)",
      "--border-color": "#4A508A",
      "--accent-border-color": "#FF7F50",
      "--error-text": "#FF6B6B",
      "--success-text": "#48BB78",
      "--disabled-bg": "#3A406A",
      "--disabled-text": "#8A90BF",
      "--button-action-bg": "#FF7F50", // Mango orange for primary actions
      "--button-action-hover-bg": "#FF9F70",
      "--button-action-text": "#FFFFFF",
      "--button-delete-bg": "#C75B5B", // A fitting red
      "--button-delete-hover-bg": "#B04A4A",
      "--button-delete-text": "#F0F2FF",
      "--input-bg": "#1A1F45",
      "--input-text": "#F0F2FF",
      "--input-placeholder-text": "#9AA0CF",
      "--progress-track-bg": "#3A406A",
      "--map-background-color": "#1A1F45",
      "--map-region-default-fill": "#3A406A",
      "--map-region-border": "#242A58",
      "--map-region-hover-fill": "#FF7F50",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMontserrat,
    },
    styles: {
      "--panel-shadow": "0 5px 15px rgba(0,0,0,0.4)",
      "--button-shadow": "0 2px 4px rgba(0,0,0,0.25)",
      "--element-radius": "8px", // Softer, more organic radius
      "--border-width": "1px",
      "--focus-ring-color": "#FF7F50",
      "--progress-value-color": "#6A709F",
      "--checkbox-accent-color": "#FF7F50",
      "--input-focus-shadow-color": "rgba(255, 127, 80, 0.4)",
      "--transition-speed": "0.15s ease",
    },
  },
  yukonMidnight: {
    name: "Yukon Midnight",
    colors: {
      "--primary-bg": "#0B1120", // Very dark midnight blue
      "--secondary-bg": "#050810", // Near black
      "--ui-panel-bg": "#1A2238", // Lighter, cold blue-grey
      "--button-bg": "#4A5568", // Slate grey, like mountain rock
      "--button-hover-bg": "#5A6578",
      "--button-active-bg": "#3A4558",
      "--button-text": "#F7FAFC",
      "--primary-text": "#F7FAFC", // Crisp "snow" white
      "--secondary-text": "#E2E8F0", // Off-white
      // MODIFIED
      "--accent-color": "#2EFE9A", // Deeper, but still vibrant Auroral Green
      "--accent-text": "#0B1120", // Dark text on the bright accent
      // MODIFIED
      "--rgb-accent-color": hexToRgbString("#2EFE9A"),
      // MODIFIED
      "--highlight-bg": "rgba(46, 254, 154, 0.1)",
      "--border-color": "#2D3748",
      // MODIFIED
      "--accent-border-color": "#2EFE9A",
      "--error-text": "#FC8181", // A lighter red for dark bg
      "--success-text": "#68D391",
      "--disabled-bg": "#1A2238",
      "--disabled-text": "#718096",
      // MODIFIED
      "--button-action-bg": "#2EFE9A",
      "--button-action-hover-bg": "#3AFFAA",
      "--button-action-text": "#0B1120",
      "--button-delete-bg": "#C53030", // A strong, clear red
      "--button-delete-hover-bg": "#E53E3E",
      "--button-delete-text": "#F7FAFC",
      "--input-bg": "#050810",
      "--input-text": "#F7FAFC",
      "--input-placeholder-text": "#A0AEC0",
      "--progress-track-bg": "#1A2238",
      "--map-background-color": "#050810",
      "--map-region-default-fill": "#1A2238",
      "--map-region-border": "#0B1120",
      // MODIFIED
      "--map-region-hover-fill": "#2EFE9A",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMontserrat,
    },
    styles: {
      // MODIFIED
      "--panel-shadow": "0 0 12px rgba(46, 254, 154, 0.15)", // Auroral glow
      "--button-shadow": "0 1px 3px rgba(0,0,0,0.3)",
      "--element-radius": "4px", // Crisp, clean corners
      "--border-width": "1px",
      // MODIFIED
      "--focus-ring-color": "#2EFE9A",
      "--progress-value-color": "#4A5568",
      // MODIFIED
      "--checkbox-accent-color": "#2EFE9A",
      // MODIFIED
      "--input-focus-shadow-color": "rgba(46, 254, 154, 0.3)",
      "--transition-speed": "0.15s ease-in-out",
    },
  },
  berlinSchool: {
    name: "Berlin School",
    colors: {
      "--primary-bg": "#212529", // Dark, cold concrete grey
      "--secondary-bg": "#1A1D20", // Deeper grey
      "--ui-panel-bg": "#343A40", // Lighter concrete panel
      "--button-bg": "#495057", // Mid-tone grey
      "--button-hover-bg": "#6C757D",
      "--button-active-bg": "#343A40",
      "--button-text": "#F8F9FA",
      "--primary-text": "#F8F9FA", // Sharp off-white
      "--secondary-text": "#DEE2E6", // Lighter grey
      "--accent-color": "#F59E0B", // Vibrant amber/tangerine
      "--accent-text": "#1A1D20",
      "--rgb-accent-color": hexToRgbString("#F59E0B"),
      "--highlight-bg": "rgba(245, 158, 11, 0.15)",
      "--border-color": "#495057",
      "--accent-border-color": "#F59E0B",
      "--error-text": "#EF4444",
      "--success-text": "#84CC16",
      "--disabled-bg": "#343A40",
      "--disabled-text": "#6C757D",
      "--button-action-bg": "#F59E0B", // Amber for primary actions
      "--button-action-hover-bg": "#FBBF24",
      "--button-action-text": "#1A1D20",
      "--button-delete-bg": "#B91C1C", // A strong red for contrast
      "--button-delete-hover-bg": "#DC2626",
      "--button-delete-text": "#F8F9FA",
      "--input-bg": "#1A1D20",
      "--input-text": "#F8F9FA",
      "--input-placeholder-text": "#ADB5BD",
      "--progress-track-bg": "#343A40",
      "--map-background-color": "#1A1D20",
      "--map-region-default-fill": "#343A40",
      "--map-region-border": "#212529",
      "--map-region-hover-fill": "#F59E0B",
    },
    fonts: {
      "--font-main": fontRobotoMono,
      "--font-heading": fontMontserrat,
    },
    styles: {
      "--panel-shadow": "0 2px 8px rgba(0,0,0,0.3)",
      "--button-shadow": "none",
      "--element-radius": "2px", // Very sharp, industrial corners
      "--border-width": "1px",
      "--focus-ring-color": "#F59E0B",
      "--progress-value-color": "#6C757D",
      "--checkbox-accent-color": "#F59E0B",
      "--input-focus-shadow-color": "rgba(245, 158, 11, 0.4)",
      "--transition-speed": "0.1s linear",
    },
  },
  palawanDepths: {
    name: "Palawan Depths",
    colors: {
      "--primary-bg": "#0D2B36", // Deep dark teal/aqua
      "--secondary-bg": "#071D25", // Darker water
      "--ui-panel-bg": "#1E3D48", // Lighter water panel
      "--button-bg": "#2A5A6A", // Muted deep teal
      "--button-hover-bg": "#3A6A7A",
      "--button-active-bg": "#1A4A5A",
      "--button-text": "#F0EAD6", // Sandy off-white
      "--primary-text": "#F0EAD6", // Sandy off-white
      "--secondary-text": "#D4CBB8", // Muted sand
      "--accent-color": "#FF6B6B", // Vibrant Coral Pink
      "--accent-text": "#FFFFFF",
      "--rgb-accent-color": hexToRgbString("#FF6B6B"),
      "--highlight-bg": "rgba(255, 107, 107, 0.15)",
      "--border-color": "#3A6A7A",
      "--accent-border-color": "#FF6B6B",
      "--error-text": "#F88A8A",
      "--success-text": "#8AF8A8",
      "--disabled-bg": "#1E3D48",
      "--disabled-text": "#5A7A8A",
      "--button-action-bg": "#FF6B6B", // Coral pink for primary actions
      "--button-action-hover-bg": "#FF8B8B",
      "--button-action-text": "#FFFFFF",
      "--button-delete-bg": "#8A3A3A", // Deep sea red
      "--button-delete-hover-bg": "#9A4A4A",
      "--button-delete-text": "#F0EAD6",
      "--input-bg": "#071D25",
      "--input-text": "#F0EAD6",
      "--input-placeholder-text": "#8A9AA0",
      "--progress-track-bg": "#1E3D48",
      "--map-background-color": "#071D25",
      "--map-region-default-fill": "#1E3D48",
      "--map-region-border": "#0D2B36",
      "--map-region-hover-fill": "#FF6B6B",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMontserrat,
    },
    styles: {
      "--panel-shadow": "0 5px 15px rgba(0,0,0,0.4)",
      "--button-shadow": "0 2px 4px rgba(0,0,0,0.25)",
      "--element-radius": "8px", // Softer, organic, water-like radius
      "--border-width": "1px",
      "--focus-ring-color": "#FF6B6B",
      "--progress-value-color": "#2A5A6A",
      "--checkbox-accent-color": "#FF6B6B",
      "--input-focus-shadow-color": "rgba(255, 107, 107, 0.4)",
      "--transition-speed": "0.18s ease",
    },
  },
  hanseongNight: {
    name: "Hanseong Night",
    colors: {
      // MODIFIED
      "--primary-bg": "#1E1B4B", // New deep, royal indigo background
      // MODIFIED
      "--secondary-bg": "#14113B", // Darker indigo
      "--ui-panel-bg": "#151335ff", // Kept the rich lacquered wood/burgundy for panels
      "--button-bg": "#8A3A5A", // Kept the muted rosewood for buttons
      "--button-hover-bg": "#9A4A6A",
      "--button-active-bg": "#7A2A4A",
      "--button-text": "#F3F4F6",
      "--primary-text": "#F3F4F6",
      "--secondary-text": "#E5E7EB",
      "--accent-color": "#2563EB", // Kept the vibrant royal blue accent
      "--accent-text": "#FFFFFF",
      "--rgb-accent-color": hexToRgbString("#2563EB"),
      "--highlight-bg": "rgba(37, 99, 235, 0.15)",
      "--border-color": "#8A3A5A",
      "--accent-border-color": "#2563EB",
      "--error-text": "#F87171",
      "--success-text": "#86EFAC",
      "--disabled-bg": "#334155",
      "--disabled-text": "#A38A9F",
      "--button-action-bg": "#2563EB",
      "--button-action-hover-bg": "#3B82F6",
      "--button-action-text": "#FFFFFF",
      "--button-delete-bg": "#8A3A5A",
      "--button-delete-hover-bg": "#7A2A4A",
      "--button-delete-text": "#F3F4F6",
      "--input-bg": "#14113B",
      "--input-text": "#F3F4F6",
      "--input-placeholder-text": "#D1C2D8",
      "--progress-track-bg": "#334155",
      "--map-background-color": "#14113B",
      "--map-region-default-fill": "#334155",
      "--map-region-border": "#1E1B4B",
      "--map-region-hover-fill": "#2563EB",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMerriweather,
    },
    styles: {
      "--panel-shadow": "0 5px 15px rgba(0,0,0,0.4)",
      "--button-shadow": "0 1px 3px rgba(0,0,0,0.3)",
      "--element-radius": "5px",
      "--border-width": "1px",
      "--focus-ring-color": "#2563EB",
      "--progress-value-color": "#8A3A5A",
      "--checkbox-accent-color": "#2563EB",
      "--input-focus-shadow-color": "rgba(37, 99, 235, 0.35)",
      "--transition-speed": "0.15s ease",
    },
  },
  hollywoodArtDeco: {
    name: "Hollywood Art Deco",
    colors: {
      "--primary-bg": "#0F172A", // Deep, plush velvet blue
      "--secondary-bg": "#0A101F", // Even deeper blue
      "--ui-panel-bg": "#1E293B", // Lighter slate blue panel
      "--button-bg": "#475569", // Muted grey-blue button
      "--button-hover-bg": "#64748B",
      "--button-active-bg": "#334155",
      "--button-text": "#F8FAFC",
      "--primary-text": "#F8FAFC", // Bright, clean off-white
      "--secondary-text": "#E2E8F0", // Lighter grey
      "--accent-color": "#FBBF24", // Brilliant "marquee gold"
      "--accent-text": "#1E293B", // Dark blue text on gold
      "--rgb-accent-color": hexToRgbString("#FBBF24"),
      "--highlight-bg": "rgba(251, 191, 36, 0.15)",
      "--border-color": "#334155",
      "--accent-border-color": "#FBBF24",
      "--error-text": "#F43F5E", // A cinematic red/pink
      "--success-text": "#34D399", // A contrasting mint green
      "--disabled-bg": "#1E293B",
      "--disabled-text": "#64748B",
      "--button-action-bg": "#FBBF24", // Gold for primary actions
      "--button-action-hover-bg": "#FACC15",
      "--button-action-text": "#1E293B",
      "--button-delete-bg": "#BE123C", // Deep crimson
      "--button-delete-hover-bg": "#E11D48",
      "--button-delete-text": "#F8FAFC",
      "--input-bg": "#0A101F",
      "--input-text": "#F8FAFC",
      "--input-placeholder-text": "#94A3B8",
      "--progress-track-bg": "#1E293B",
      "--map-background-color": "#0A101F",
      "--map-region-default-fill": "#1E293B",
      "--map-region-border": "#0F172A",
      "--map-region-hover-fill": "#FBBF24",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMontserrat,
    },
    styles: {
      "--panel-shadow": "0 4px 14px rgba(0,0,0,0.35)",
      "--button-shadow": "0 2px 4px rgba(0,0,0,0.2)",
      "--element-radius": "3px", // Sharp Art Deco corners
      "--border-width": "1px",
      "--focus-ring-color": "#FBBF24",
      "--progress-value-color": "#475569",
      "--checkbox-accent-color": "#FBBF24",
      "--input-focus-shadow-color": "rgba(251, 191, 36, 0.35)",
      "--transition-speed": "0.15s ease-out",
    },
  },
  marrakeshSouk: {
    name: "Marrakesh Souk",
    colors: {
      "--primary-bg": "#6A381F", // Warm, deep terracotta/burnt sienna
      "--secondary-bg": "#5A280F", // Darker earth tone
      "--ui-panel-bg": "#422417ff", // Lighter, richer terracotta panel
      "--button-bg": "#A25A3F", // Muted clay color
      "--button-hover-bg": "#B26A4F",
      "--button-active-bg": "#924A2F",
      "--button-text": "#F3EFE9",
      "--primary-text": "#F3EFE9", // Crisp, creamy off-white
      "--secondary-text": "#E3DED9",
      "--accent-color": "#0891B2", // Striking turquoise/deep cyan
      "--accent-text": "#FFFFFF",
      "--rgb-accent-color": hexToRgbString("#0891B2"),
      "--highlight-bg": "rgba(8, 145, 178, 0.15)",
      "--border-color": "#A25A3F",
      "--accent-border-color": "#0891B2",
      "--error-text": "#F47272",
      "--success-text": "#A3E635",
      "--disabled-bg": "#8A4A2F",
      "--disabled-text": "#C2B5AF",
      "--button-action-bg": "#0891B2", // Turquoise for primary actions
      "--button-action-hover-bg": "#06B6D4",
      "--button-action-text": "#FFFFFF",
      "--button-delete-bg": "#A25A3F",
      "--button-delete-hover-bg": "#924A2F",
      "--button-delete-text": "#F3EFE9",
      "--input-bg": "#5A280F",
      "--input-text": "#F3EFE9",
      "--input-placeholder-text": "#C2B5AF",
      "--progress-track-bg": "#8A4A2F",
      "--map-background-color": "#5A280F",
      "--map-region-default-fill": "#8A4A2F",
      "--map-region-border": "#6A381F",
      "--map-region-hover-fill": "#0891B2",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMontserrat,
    },
    styles: {
      "--panel-shadow": "0 5px 15px rgba(0,0,0,0.4)",
      "--button-shadow": "0 1px 3px rgba(0,0,0,0.3)",
      "--element-radius": "5px",
      "--border-width": "1px",
      "--focus-ring-color": "#0891B2",
      "--progress-value-color": "#A25A3F",
      "--checkbox-accent-color": "#0891B2",
      "--input-focus-shadow-color": "rgba(8, 145, 178, 0.35)",
      "--transition-speed": "0.15s ease",
    },
  },
  outbackSunset: {
    name: "Outback Sunset",
    colors: {
      "--primary-bg": "#4E2A2A", // Deep, dusty red-brown
      "--secondary-bg": "#3E1A1A", // Darker earth
      "--ui-panel-bg": "#6E3A3A", // Lighter, reddish earth panel
      "--button-bg": "#8E5A5A", // Muted clay button
      "--button-hover-bg": "#9E6A6A",
      "--button-active-bg": "#7E4A4A",
      "--button-text": "#FFF7E8",
      "--primary-text": "#FFF7E8", // Warm, sandy off-white
      "--secondary-text": "#FFEEC8",
      "--accent-color": "#FF5733", // Vibrant, fiery orange
      "--accent-text": "#FFFFFF",
      "--rgb-accent-color": hexToRgbString("#FF5733"),
      "--highlight-bg": "rgba(255, 87, 51, 0.15)",
      "--border-color": "#8E5A5A",
      "--accent-border-color": "#FF5733",
      "--error-text": "#F87171",
      "--success-text": "#A3E635",
      "--disabled-bg": "#6E3A3A",
      "--disabled-text": "#B49A9A",
      "--button-action-bg": "#FF5733",
      "--button-action-hover-bg": "#FF6743",
      "--button-action-text": "#FFFFFF",
      "--button-delete-bg": "#8E5A5A",
      "--button-delete-hover-bg": "#7E4A4A",
      "--button-delete-text": "#FFF7E8",
      "--input-bg": "#3E1A1A",
      "--input-text": "#FFF7E8",
      "--input-placeholder-text": "#D4BABA",
      "--progress-track-bg": "#6E3A3A",
      "--map-background-color": "#3E1A1A",
      "--map-region-default-fill": "#6E3A3A",
      "--map-region-border": "#4E2A2A",
      "--map-region-hover-fill": "#FF5733",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMontserrat,
    },
    styles: {
      "--panel-shadow": "0 5px 15px rgba(0,0,0,0.4)",
      "--button-shadow": "0 2px 4px rgba(0,0,0,0.25)",
      "--element-radius": "6px",
      "--border-width": "1px",
      "--focus-ring-color": "#FF5733",
      "--progress-value-color": "#8E5A5A",
      "--checkbox-accent-color": "#FF5733",
      "--input-focus-shadow-color": "rgba(255, 87, 51, 0.35)",
      "--transition-speed": "0.15s ease",
    },
  },
  amberCoast: {
    name: "Amber Coast",
    colors: {
      "--primary-bg": "#422006", // Very dark, warm brown
      "--secondary-bg": "#2A1404", // Deeper brown
      "--ui-panel-bg": "#854D0E", // Rich golden-brown panel
      "--button-bg": "#A16207", // Lighter amber color
      "--button-hover-bg": "#B45309",
      "--button-active-bg": "#854D0E",
      "--button-text": "#FEFCE8",
      "--primary-text": "#FEFCE8", // Creamy off-white
      "--secondary-text": "#FFFBEB",
      "--accent-color": "#F97316", // Vibrant, glowing amber-orange
      "--accent-text": "#FFFFFF",
      "--rgb-accent-color": hexToRgbString("#F97316"),
      "--highlight-bg": "rgba(249, 115, 22, 0.15)",
      "--border-color": "#A16207",
      "--accent-border-color": "#F97316",
      "--error-text": "#F87171",
      "--success-text": "#A3E635",
      "--disabled-bg": "#854D0E",
      "--disabled-text": "#D4B59F",
      "--button-action-bg": "#F97316",
      "--button-action-hover-bg": "#FB923C",
      "--button-action-text": "#FFFFFF",
      "--button-delete-bg": "#A16207",
      "--button-delete-hover-bg": "#854D0E",
      "--button-delete-text": "#FEFCE8",
      "--input-bg": "#2A1404",
      "--input-text": "#FEFCE8",
      "--input-placeholder-text": "#D4B59F",
      "--progress-track-bg": "#854D0E",
      "--map-background-color": "#2A1404",
      "--map-region-default-fill": "#854D0E",
      "--map-region-border": "#422006",
      "--map-region-hover-fill": "#F97316",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMerriweather,
    },
    styles: {
      "--panel-shadow": "0 5px 15px rgba(0,0,0,0.4)",
      "--button-shadow": "0 1px 3px rgba(0,0,0,0.3)",
      "--element-radius": "5px",
      "--border-width": "1px",
      "--focus-ring-color": "#F97316",
      "--progress-value-color": "#A16207",
      "--checkbox-accent-color": "#F97316",
      "--input-focus-shadow-color": "rgba(249, 115, 22, 0.35)",
      "--transition-speed": "0.15s ease",
    },
  },
  stockholmDesign: {
    name: "Stockholm Design",
    colors: {
      "--primary-bg": "#F9FAFB", // Crisp, cool off-white
      "--secondary-bg": "#F3F4F6", // Slightly darker grey
      "--ui-panel-bg": "#FFFFFF",
      "--button-bg": "#4B5563", // Muted, dark grey-blue
      "--button-hover-bg": "#374151",
      "--button-active-bg": "#1F2937",
      "--button-text": "#FFFFFF",
      "--primary-text": "#1F2937", // Soft, dark charcoal
      "--secondary-text": "#4B5563",
      "--accent-color": "#60A5FA", // Calming, dusty blue
      "--accent-text": "#FFFFFF",
      "--rgb-accent-color": hexToRgbString("#60A5FA"),
      "--highlight-bg": "rgba(96, 165, 250, 0.15)",
      "--border-color": "#D1D5DB",
      "--accent-border-color": "#60A5FA",
      "--error-text": "#EF4444",
      "--success-text": "#22C55E",
      "--disabled-bg": "#E5E7EB",
      "--disabled-text": "#9CA3AF",
      "--button-action-bg": "#60A5FA",
      "--button-action-hover-bg": "#3B82F6",
      "--button-action-text": "#FFFFFF",
      "--button-delete-bg": "#6B7280",
      "--button-delete-hover-bg": "#4B5563",
      "--button-delete-text": "#FFFFFF",
      "--input-bg": "#FFFFFF",
      "--input-text": "#1F2937",
      "--input-placeholder-text": "#9CA3AF",
      "--progress-track-bg": "#E5E7EB",
      "--map-background-color": "#F3F4F6",
      "--map-region-default-fill": "#D1D5DB",
      "--map-region-border": "#FFFFFF",
      "--map-region-hover-fill": "#60A5FA",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontInter,
    },
    styles: {
      "--panel-shadow": "0 1px 3px rgba(0,0,0,0.05)",
      "--button-shadow": "none",
      "--element-radius": "4px", // Minimal rounding
      "--border-width": "1px",
      "--focus-ring-color": "#60A5FA",
      "--progress-value-color": "#4B5563",
      "--checkbox-accent-color": "#60A5FA",
      "--input-focus-shadow-color": "rgba(96, 165, 250, 0.4)",
      "--transition-speed": "0.15s ease",
    },
  },
  carnivalRhythm: {
    name: "Carnival Rhythm",
    colors: {
      "--primary-bg": "#1E1B4B", // Deep night-sky indigo
      "--secondary-bg": "#14113B", // Deeper indigo
      "--ui-panel-bg": "#312E7B", // Saturated purple-blue panel
      "--button-bg": "#D946EF", // Electric fuchsia
      "--button-hover-bg": "#E879F9",
      "--button-active-bg": "#C936DF",
      "--button-text": "#FFFFFF",
      "--primary-text": "#F0F2FF",
      "--secondary-text": "#D0D4F0",
      "--accent-color": "#BEF264", // Electric lime green
      "--accent-text": "#1E1B4B",
      "--rgb-accent-color": hexToRgbString("#BEF264"),
      "--highlight-bg": "rgba(190, 242, 100, 0.15)",
      "--border-color": "#4A478B",
      "--accent-border-color": "#BEF264",
      "--error-text": "#F472B6", // Hot pink for errors
      "--success-text": "#86EFAC",
      "--disabled-bg": "#312E7B",
      "--disabled-text": "#8A87BB",
      "--button-action-bg": "#BEF264",
      "--button-action-hover-bg": "#CCF974",
      "--button-action-text": "#1E1B4B",
      "--button-delete-bg": "#D946EF", // Fuchsia for delete
      "--button-delete-hover-bg": "#C936DF",
      "--button-delete-text": "#FFFFFF",
      "--input-bg": "#14113B",
      "--input-text": "#F0F2FF",
      "--input-placeholder-text": "#8A87BB",
      "--progress-track-bg": "#312E7B",
      "--map-background-color": "#14113B",
      "--map-region-default-fill": "#312E7B",
      "--map-region-border": "#1E1B4B",
      "--map-region-hover-fill": "#BEF264",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMontserrat,
    },
    styles: {
      "--panel-shadow": "0 5px 15px rgba(0,0,0,0.5)",
      "--button-shadow": "0 2px 4px rgba(0,0,0,0.3)",
      "--element-radius": "8px", // Playful, rounded corners
      "--border-width": "1px",
      "--focus-ring-color": "#BEF264",
      "--progress-value-color": "#D946EF",
      "--checkbox-accent-color": "#BEF264",
      "--input-focus-shadow-color": "rgba(190, 242, 100, 0.4)",
      "--transition-speed": "0.15s ease-out",
    },
  },
  patagonianTwilight: {
    name: "Patagonian Twilight",
    colors: {
      "--primary-bg": "#36454F", // Deep, steely blue-grey
      "--secondary-bg": "#26353F", // Darker slate
      "--ui-panel-bg": "#46555F", // Lighter slate panel
      "--button-bg": "#63727C", // Muted stone grey
      "--button-hover-bg": "#73828C",
      "--button-active-bg": "#53626C",
      "--button-text": "#FFFFFF",
      "--primary-text": "#FFFFFF", // Crisp, icy white
      "--secondary-text": "#E0E5E8",
      "--accent-color": "#22D3EE", // Piercing glacial cyan
      "--accent-text": "#164E63", // Dark cyan text
      "--rgb-accent-color": hexToRgbString("#22D3EE"),
      "--highlight-bg": "rgba(34, 211, 238, 0.1)",
      "--border-color": "#63727C",
      "--accent-border-color": "#22D3EE",
      "--error-text": "#FCA5A5",
      "--success-text": "#A7F3D0",
      "--disabled-bg": "#46555F",
      "--disabled-text": "#83929C",
      "--button-action-bg": "#22D3EE",
      "--button-action-hover-bg": "#32E3FE",
      "--button-action-text": "#164E63",
      "--button-delete-bg": "#63727C",
      "--button-delete-hover-bg": "#53626C",
      "--button-delete-text": "#FFFFFF",
      "--input-bg": "#26353F",
      "--input-text": "#FFFFFF",
      "--input-placeholder-text": "#A0AEC0",
      "--progress-track-bg": "#46555F",
      "--map-background-color": "#26353F",
      "--map-region-default-fill": "#46555F",
      "--map-region-border": "#36454F",
      "--map-region-hover-fill": "#22D3EE",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMontserrat,
    },
    styles: {
      "--panel-shadow": "0 4px 12px rgba(0,0,0,0.3)",
      "--button-shadow": "0 1px 2px rgba(0,0,0,0.2)",
      "--element-radius": "3px", // Sharp, jagged corners
      "--border-width": "1px",
      "--focus-ring-color": "#22D3EE",
      "--progress-value-color": "#63727C",
      "--checkbox-accent-color": "#22D3EE",
      "--input-focus-shadow-color": "rgba(34, 211, 238, 0.35)",
      "--transition-speed": "0.15s ease",
    },
  },
  volcanicForge: {
    name: "The Volcanic Forge",
    colors: {
      "--primary-bg": "#1C1917", // Near-black volcanic rock
      "--secondary-bg": "#0C0A09", // Deeper black
      "--ui-panel-bg": "#292524", // Lighter charcoal rock
      "--button-bg": "#44403C", // Cooled rock grey
      "--button-hover-bg": "#57534E",
      "--button-active-bg": "#292524",
      "--button-text": "#F5F5F4",
      "--primary-text": "#F5F5F4", // White-hot ash
      "--secondary-text": "#D6D3D1",
      "--accent-color": "#F97316", // Molten red-orange lava
      "--accent-text": "#FFFFFF",
      "--rgb-accent-color": hexToRgbString("#F97316"),
      "--highlight-bg": "rgba(249, 115, 22, 0.15)",
      "--border-color": "#57534E",
      "--accent-border-color": "#F97316",
      "--error-text": "#F87171",
      "--success-text": "#A3E635",
      "--disabled-bg": "#292524",
      "--disabled-text": "#78716C",
      "--button-action-bg": "#F97316",
      "--button-action-hover-bg": "#FB923C",
      "--button-action-text": "#FFFFFF",
      "--button-delete-bg": "#44403C",
      "--button-delete-hover-bg": "#57534E",
      "--button-delete-text": "#F5F5F4",
      "--input-bg": "#0C0A09",
      "--input-text": "#F5F5F4",
      "--input-placeholder-text": "#A8A29E",
      "--progress-track-bg": "#292524",
      "--map-background-color": "#0C0A09",
      "--map-region-default-fill": "#292524",
      "--map-region-border": "#1C1917",
      "--map-region-hover-fill": "#F97316",
    },
    fonts: {
      "--font-main": fontRobotoMono,
      "--font-heading": fontMontserrat,
    },
    styles: {
      "--panel-shadow": "0 0 15px rgba(249, 115, 22, 0.2)", // Lava glow
      "--button-shadow": "0 1px 3px rgba(0,0,0,0.4)",
      "--element-radius": "3px", // Sharp, rock-like edges
      "--border-width": "1px",
      "--focus-ring-color": "#F97316",
      "--progress-value-color": "#44403C",
      "--checkbox-accent-color": "#F97316",
      "--input-focus-shadow-color": "rgba(249, 115, 22, 0.35)",
      "--transition-speed": "0.15s ease",
    },
  },
  starshipBridge: {
    name: "Starship Bridge",
    colors: {
      "--primary-bg": "#1F2937", // Dark, cool-toned metallic charcoal
      "--secondary-bg": "#111827", // Deeper space-black
      "--ui-panel-bg": "#374151", // Lighter console grey
      "--button-bg": "#4B5563", // Standard button grey
      "--button-hover-bg": "#6B7280",
      "--button-active-bg": "#374151",
      "--button-text": "#F9FAFB",
      "--primary-text": "#F9FAFB", // Crisp, legible white
      "--secondary-text": "#E5E7EB",
      "--accent-color": "#22D3EE", // Calm, holographic cyan
      "--accent-text": "#111827", // Dark text on the light accent
      "--rgb-accent-color": hexToRgbString("#22D3EE"),
      "--highlight-bg": "rgba(34, 211, 238, 0.1)",
      "--border-color": "#4B5563",
      "--accent-border-color": "#22D3EE",
      "--error-text": "#FCA5A5", // A "red alert" that isn't too harsh
      "--success-text": "#A7F3D0", // A calm "all clear" green
      "--disabled-bg": "#374151",
      "--disabled-text": "#9CA3AF",
      "--button-action-bg": "#22D3EE",
      "--button-action-hover-bg": "#32E3FE",
      "--button-action-text": "#111827",
      "--button-delete-bg": "#6B7280",
      "--button-delete-hover-bg": "#4B5563",
      "--button-delete-text": "#F9FAFB",
      "--input-bg": "#111827",
      "--input-text": "#F9FAFB",
      "--input-placeholder-text": "#9CA3AF",
      "--progress-track-bg": "#374151",
      "--map-background-color": "#111827",
      "--map-region-default-fill": "#374151",
      "--map-region-border": "#1F2937",
      "--map-region-hover-fill": "#22D3EE",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontInter,
    },
    styles: {
      "--panel-shadow": "0 2px 8px rgba(0,0,0,0.3)",
      "--button-shadow": "none",
      "--element-radius": "4px",
      "--border-width": "1px",
      "--focus-ring-color": "#22D3EE",
      "--progress-value-color": "#4B5563",
      "--checkbox-accent-color": "#22D3EE",
      "--input-focus-shadow-color": "rgba(34, 211, 238, 0.35)",
      "--transition-speed": "0.15s linear",
    },
  },
  whiskeyLounge: {
    name: "The Whiskey Lounge",
    colors: {
      "--primary-bg": "#3F2A1D", // Rich, dark mahogany wood
      "--secondary-bg": "#2A1A0D", // Darker espresso
      "--ui-panel-bg": "#5A3A2D", // Lighter wood panel
      "--button-bg": "#8A6A5D", // Muted leather color
      "--button-hover-bg": "#9A7A6D",
      "--button-active-bg": "#7A5A4D",
      "--button-text": "#FFF7ED",
      "--primary-text": "#FFF7ED", // Warm, soft off-white
      "--secondary-text": "#FFEEC7",
      "--accent-color": "#F59E0B", // Deep, warm amber
      "--accent-text": "#3F2A1D",
      "--rgb-accent-color": hexToRgbString("#F59E0B"),
      "--highlight-bg": "rgba(245, 158, 11, 0.15)",
      "--border-color": "#8A6A5D",
      "--accent-border-color": "#F59E0B",
      "--error-text": "#F87171",
      "--success-text": "#BEF264",
      "--disabled-bg": "#5A3A2D",
      "--disabled-text": "#A89A8F",
      "--button-action-bg": "#F59E0B",
      "--button-action-hover-bg": "#FBBF24",
      "--button-action-text": "#3F2A1D",
      "--button-delete-bg": "#8A6A5D",
      "--button-delete-hover-bg": "#7A5A4D",
      "--button-delete-text": "#FFF7ED",
      "--input-bg": "#2A1A0D",
      "--input-text": "#FFF7ED",
      "--input-placeholder-text": "#A89A8F",
      "--progress-track-bg": "#5A3A2D",
      "--map-background-color": "#2A1A0D",
      "--map-region-default-fill": "#5A3A2D",
      "--map-region-border": "#3F2A1D",
      "--map-region-hover-fill": "#F59E0B",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMerriweather,
    },
    styles: {
      "--panel-shadow": "0 5px 15px rgba(0,0,0,0.5)",
      "--button-shadow": "0 1px 3px rgba(0,0,0,0.3)",
      "--element-radius": "5px",
      "--border-width": "1px",
      "--focus-ring-color": "#F59E0B",
      "--progress-value-color": "#8A6A5D",
      "--checkbox-accent-color": "#F59E0B",
      "--input-focus-shadow-color": "rgba(245, 158, 11, 0.4)",
      "--transition-speed": "0.15s ease",
    },
  },
  masqueradeBall: {
    name: "The Masquerade Ball",
    colors: {
      "--primary-bg": "#1E1B4B", // Deep midnight indigo/velvet black
      "--secondary-bg": "#14113B", // Darker indigo
      "--ui-panel-bg": "#312E7B", // Saturated purple-blue panel
      "--button-bg": "#D4AF37", // Old gold
      "--button-hover-bg": "#E4BF47",
      "--button-active-bg": "#C09A27",
      "--button-text": "#1E1B4B",
      "--primary-text": "#F0F2FF", // Soft off-white
      "--secondary-text": "#D0D4F0",
      "--accent-color": "#9333EA", // Rich, royal amethyst purple
      "--accent-text": "#FFFFFF",
      "--rgb-accent-color": hexToRgbString("#9333EA"),
      "--highlight-bg": "rgba(147, 51, 234, 0.15)",
      "--border-color": "#4A478B",
      "--accent-border-color": "#9333EA",
      "--error-text": "#F472B6", // A dramatic pink for errors
      "--success-text": "#86EFAC",
      "--disabled-bg": "#312E7B",
      "--disabled-text": "#8A87BB",
      "--button-action-bg": "#9333EA",
      "--button-action-hover-bg": "#A855F7",
      "--button-action-text": "#FFFFFF",
      "--button-delete-bg": "#D4AF37", // Gold for the secondary action
      "--button-delete-hover-bg": "#C09A27",
      "--button-delete-text": "#1E1B4B",
      "--input-bg": "#14113B",
      "--input-text": "#F0F2FF",
      "--input-placeholder-text": "#8A87BB",
      "--progress-track-bg": "#312E7B",
      "--map-background-color": "#14113B",
      "--map-region-default-fill": "#312E7B",
      "--map-region-border": "#1E1B4B",
      "--map-region-hover-fill": "#9333EA",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMerriweather,
    },
    styles: {
      "--panel-shadow": "0 5px 15px rgba(0,0,0,0.5)",
      "--button-shadow": "0 2px 4px rgba(0,0,0,0.3)",
      "--element-radius": "6px",
      "--border-width": "1px",
      "--focus-ring-color": "#9333EA",
      "--progress-value-color": "#D4AF37",
      "--checkbox-accent-color": "#9333EA",
      "--input-focus-shadow-color": "rgba(147, 51, 234, 0.4)",
      "--transition-speed": "0.15s ease-out",
    },
  },
  paris_chic: {
    name: "Parisian Chic",
    colors: {
      "--primary-bg": "#F5F3F0", // Soft, warm off-white (like fine paper)
      "--secondary-bg": "#EAE7E1", // Slightly deeper, refined beige
      "--ui-panel-bg": "#FFFFFF", // Crisp white panels for clean lines

      "--button-bg": "#4A4E5A", // Charcoal grey (classic, versatile)
      "--button-hover-bg": "#6B707B",
      "--button-active-bg": "#333640",
      "--button-text": "#FFFFFF",

      "--primary-text": "#2C2F33", // Deep charcoal for sophisticated readability
      "--secondary-text": "#7A7F85", // Medium grey for secondary details
      "--accent-color": "#C4476D", // Muted Rose Pink (a touch of Parisian romance)
      "--accent-text": "#FFFFFF",
      "--rgb-accent-color": hexToRgbString("#C4476D"),

      "--highlight-bg": "rgba(196, 71, 109, 0.1)", // Subtle pink highlight
      "--border-color": "#D7D2CB", // Light, warm grey for subtle borders
      "--accent-border-color": "#C4476D",

      "--error-text": "#D32F2F", // Classic red for errors
      "--success-text": "#388E3C",
      "--disabled-bg": "#E0E0E0",
      "--disabled-text": "#A0A0A0",

      "--button-action-bg": "#C4476D", // Rose Pink for primary actions
      "--button-action-hover-bg": "#B03A5F",
      "--button-action-text": "#FFFFFF",

      "--button-delete-bg": "#4A4E5A", // Consistent with standard button for clean look
      "--button-delete-hover-bg": "#333640",
      "--button-delete-text": "#FFFFFF",

      "--input-bg": "#F9F8F6", // Very light, elegant input fields
      "--input-text": "#2C2F33",
      "--input-placeholder-text": "#9B9FA5",
      "--progress-track-bg": "#D7D2CB",

      "--map-background-color": "#F0F0EE",
      "--map-region-default-fill": "#BCC0C4", // Soft, cool grey
      "--map-region-border": "#FFFFFF",
      "--map-region-hover-fill": "rgba(196, 71, 109, 0.3)", // Pink hover
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMerriweather, // A serif for headings adds classic touch
    },
    styles: {
      "--panel-shadow": "0 2px 8px rgba(0,0,0,0.08)", // Soft, subtle shadow
      "--button-shadow": "0 1px 3px rgba(0,0,0,0.05)",
      "--element-radius": "4px", // Gently rounded, not too sharp
      "--border-width": "1px",
      "--focus-ring-color": "#C4476D",
      "--progress-value-color": "#4A4E5A",
      "--checkbox-accent-color": "#C4476D",
      "--input-focus-shadow-color": "rgba(196, 71, 109, 0.25)",
      "--transition-speed": "0.15s ease-in-out",
    },
  },
  loire_valley_dusk: {
    name: "Loire Valley Dusk",
    colors: {
      "--primary-bg": "#2C283F", // Deep plum/grape purple (like twilight over vineyards)
      "--secondary-bg": "#1F1C30", // Even darker, muted purple
      "--ui-panel-bg": "#3F3A5A", // Rich, muted lavender panel

      "--button-bg": "#7A5A7E", // Dusky rose/mauve
      "--button-hover-bg": "#8F6B93",
      "--button-active-bg": "#6A4A6D",
      "--button-text": "#F5F3F0",

      "--primary-text": "#F5F3F0", // Creamy off-white (castle stone at dusk)
      "--secondary-text": "#D8D4DC", // Lighter grey-purple
      "--accent-color": "#A0B56A", // Muted Sage Green (vineyard leaves)
      "--accent-text": "#2C283F",
      "--rgb-accent-color": hexToRgbString("#A0B56A"),

      "--highlight-bg": "rgba(160, 181, 106, 0.15)", // Soft green highlight
      "--border-color": "#5A567A", // Muted purple-grey border
      "--accent-border-color": "#A0B56A",

      "--error-text": "#E06B6B", // Softer red for errors
      "--success-text": "#7CC47C",
      "--disabled-bg": "#3F3A5A",
      "--disabled-text": "#8A87A0",

      "--button-action-bg": "#A0B56A", // Sage Green for primary actions
      "--button-action-hover-bg": "#B0C57A",
      "--button-action-text": "#2C283F",

      "--button-delete-bg": "#7A5A7E",
      "--button-delete-hover-bg": "#6A4A6D",
      "--button-delete-text": "#F5F3F0",

      "--input-bg": "#1F1C30",
      "--input-text": "#F5F3F0",
      "--input-placeholder-text": "#9B9FA5",
      "--progress-track-bg": "#3F3A5A",

      "--map-background-color": "#1F1C30",
      "--map-region-default-fill": "#3F3A5A",
      "--map-region-border": "#2C283F",
      "--map-region-hover-fill": "#A0B56A",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMerriweather,
    },
    styles: {
      "--panel-shadow": "0 5px 15px rgba(0,0,0,0.3)",
      "--button-shadow": "0 1px 3px rgba(0,0,0,0.2)",
      "--element-radius": "6px", // Slightly more pronounced rounding
      "--border-width": "1px",
      "--focus-ring-color": "#A0B56A",
      "--progress-value-color": "#7A5A7E",
      "--checkbox-accent-color": "#A0B56A",
      "--input-focus-shadow-color": "rgba(160, 181, 106, 0.3)",
      "--transition-speed": "0.18s ease",
    },
  },
  palatial_nightbloom: {
    name: "Palatial Nightbloom",
    colors: {
      "--primary-bg": "#1C1D3A", // Deep, dark indigo/sapphire blue (night sky)
      "--secondary-bg": "#10112A", // Even darker, rich blue
      "--ui-panel-bg": "#2B2D50", // Rich, slightly lighter indigo panel

      "--button-bg": "#8B4513", // Rich, deep brown (traditional wood)
      "--button-hover-bg": "#A35C2B",
      "--button-active-bg": "#73360B",
      "--button-text": "#F0EAD6", // Creamy off-white

      "--primary-text": "#F0EAD6", // Creamy off-white (illuminated details)
      "--secondary-text": "#D4CBB8", // Muted lighter cream
      "--accent-color": "#FF6F61", // Vibrant coral/vermillion (traditional red accents, lanterns)
      "--accent-text": "#1C1D3A", // Dark text on bright accent
      "--rgb-accent-color": hexToRgbString("#FF6F61"),

      "--highlight-bg": "rgba(255, 111, 97, 0.15)", // Soft coral highlight
      "--border-color": "#5A5C80", // Muted blue-grey border
      "--accent-border-color": "#FF6F61",

      "--error-text": "#F472B6", // A vivid pink for errors
      "--success-text": "#86EFAC", // Fresh green
      "--disabled-bg": "#2B2D50",
      "--disabled-text": "#7A7B9B",

      "--button-action-bg": "#FF6F61", // Coral for primary actions
      "--button-action-hover-bg": "#FF8F83",
      "--button-action-text": "#1C1D3A", // Dark text

      "--button-delete-bg": "#8B4513", // Consistent with standard button for elegance
      "--button-delete-hover-bg": "#73360B",
      "--button-delete-text": "#F0EAD6",

      "--input-bg": "#10112A", // Dark input fields
      "--input-text": "#F0EAD6",
      "--input-placeholder-text": "#A0A1C0",
      "--progress-track-bg": "#2B2D50",

      "--map-background-color": "#10112A",
      "--map-region-default-fill": "#2B2D50",
      "--map-region-border": "#1C1D3A",
      "--map-region-hover-fill": "#FF6F61",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMerriweather, // A sophisticated serif for a historical feel
    },
    styles: {
      "--panel-shadow": "0 6px 18px rgba(0,0,0,0.4)", // Deep shadow
      "--button-shadow": "0 2px 5px rgba(0,0,0,0.25)",
      "--element-radius": "5px", // Classic, refined rounding
      "--border-width": "1px",
      "--focus-ring-color": "#FF6F61",
      "--progress-value-color": "#8B4513",
      "--checkbox-accent-color": "#FF6F61",
      "--input-focus-shadow-color": "rgba(255, 111, 97, 0.35)",
      "--transition-speed": "0.18s ease",
    },
  },
  cherry_blossom_dawn: {
    name: "Cherry Blossom Dawn",
    colors: {
      "--primary-bg": "#FCEFF2", // Very pale pink/cream
      "--secondary-bg": "#F5E0E4", // Soft dusty pink
      "--ui-panel-bg": "#FFFFFF",
      "--button-bg": "#6B4C5F", // Muted plum/burgundy
      "--button-hover-bg": "#7E5E72",
      "--button-active-bg": "#5A3C4F",
      "--button-text": "#FFFFFF",
      "--primary-text": "#3A2E33", // Dark soft charcoal
      "--secondary-text": "#7A6B72",
      "--accent-color": "#E6A3AD", // Muted Sakura Pink
      "--accent-text": "#3A2E33", // Dark text on pink
      "--rgb-accent-color": "230, 163, 173",
      "--highlight-bg": "rgba(230, 163, 173, 0.15)",
      "--border-color": "#D8CFC4",
      "--accent-border-color": "#E6A3AD",
      "--error-text": "#D9534F",
      "--success-text": "#5CB85C",
      "--disabled-bg": "#E0E0E0",
      "--disabled-text": "#A0A0A0",
      "--button-action-bg": "#E6A3AD",
      "--button-action-hover-bg": "#D98794",
      "--button-action-text": "#3A2E33", // Dark text for readability
      "--button-delete-bg": "#6B4C5F",
      "--button-delete-hover-bg": "#5A3C4F",
      "--button-delete-text": "#FFFFFF",
      "--input-bg": "#FBF5F7",
      "--input-text": "#3A2E33",
      "--input-placeholder-text": "#A0A0A0",
      "--progress-track-bg": "#D8CFC4",
      "--map-background-color": "#F0F4F8",
      "--map-region-default-fill": "#B0C4DE",
      "--map-region-border": "#FFFFFF",
      "--map-region-hover-fill": "rgba(230, 163, 173, 0.4)",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMontserrat,
    },
    styles: {
      "--panel-shadow": "0 1px 4px rgba(0,0,0,0.07)",
      "--button-shadow": "0 1px 2px rgba(0,0,0,0.05)",
      "--element-radius": "5px",
      "--border-width": "1px",
      "--focus-ring-color": "#6B4C5F",
      "--progress-value-color": "#6B4C5F",
      "--checkbox-accent-color": "#E6A3AD",
      "--input-focus-shadow-color": "rgba(230, 163, 173, 0.3)",
      "--transition-speed": "0.15s ease-in-out",
    },
  },
  silicon_prairie: {
    name: "Silicon Prairie",
    colors: {
      "--primary-bg": "#EDF2F7", // Very light cool grey/off-white
      "--secondary-bg": "#DAE2EA", // Muted light blue-grey
      "--ui-panel-bg": "#FFFFFF",
      "--button-bg": "#3A5C8A", // Deep muted blue
      "--button-hover-bg": "#4A6E9B",
      "--button-active-bg": "#2A4B7D",
      "--button-text": "#FFFFFF",
      "--primary-text": "#1F2937", // Dark charcoal
      "--secondary-text": "#4B5563",
      "--accent-color": "#10B981", // Modern, vibrant teal-green
      "--accent-text": "#FFFFFF",
      "--rgb-accent-color": hexToRgbString("#10B981"),
      "--highlight-bg": "rgba(16, 185, 129, 0.15)",
      "--border-color": "#C4D4E3",
      "--accent-border-color": "#10B981",
      "--error-text": "#EF4444",
      "--success-text": "#22C55E",
      "--disabled-bg": "#E5E7EB",
      "--disabled-text": "#9CA3AF",
      "--button-action-bg": "#10B981",
      "--button-action-hover-bg": "#059669",
      "--button-action-text": "#FFFFFF",
      "--button-delete-bg": "#EF4444",
      "--button-delete-hover-bg": "#DC2626",
      "--button-delete-text": "#FFFFFF",
      "--input-bg": "#FFFFFF",
      "--input-text": "#1F2937",
      "--input-placeholder-text": "#9CA3AF",
      "--progress-track-bg": "#DAE2EA",
      "--map-background-color": "#DAE2EA",
      "--map-region-default-fill": "#AABAC9",
      "--map-region-border": "#FFFFFF",
      "--map-region-hover-fill": "rgba(16, 185, 129, 0.4)",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMontserrat,
    },
    styles: {
      "--panel-shadow": "0 2px 8px rgba(0,0,0,0.1)",
      "--button-shadow": "0 1px 3px rgba(0,0,0,0.08)",
      "--element-radius": "6px",
      "--border-width": "1px",
      "--focus-ring-color": "#10B981",
      "--progress-value-color": "#3A5C8A",
      "--checkbox-accent-color": "#10B981",
      "--input-focus-shadow-color": "rgba(16, 185, 129, 0.3)",
      "--transition-speed": "0.15s ease-in-out",
    },
  },
  bavarian_alps: {
    name: "Bavarian Alps",
    colors: {
      "--primary-bg": "#F5F8F7", // Light grey-green (mountain mist)
      "--secondary-bg": "#E0E8E6", // Muted light green-grey
      "--ui-panel-bg": "#FFFFFF",
      "--button-bg": "#3A5C4A", // Deep forest green
      "--button-hover-bg": "#4A715A",
      "--button-active-bg": "#2A4B3A",
      "--button-text": "#FFFFFF",
      "--primary-text": "#2C3D3A", // Dark charcoal green
      "--secondary-text": "#6B7C72",
      "--accent-color": "#A84C4C", // Rustic red (traditional attire, accents)
      "--accent-text": "#FFFFFF",
      "--rgb-accent-color": hexToRgbString("#A84C4C"),
      "--highlight-bg": "rgba(168, 76, 76, 0.15)",
      "--border-color": "#C4D1CF",
      "--accent-border-color": "#A84C4C",
      "--error-text": "#D9534F",
      "--success-text": "#5CB85C",
      "--disabled-bg": "#EAEFF0",
      "--disabled-text": "#AABCC1",
      "--button-action-bg": "#A84C4C",
      "--button-action-hover-bg": "#B85C5C",
      "--button-action-text": "#FFFFFF",
      "--button-delete-bg": "#3A5C4A",
      "--button-delete-hover-bg": "#2A4B3A",
      "--button-delete-text": "#FFFFFF",
      "--input-bg": "#FDFDFD",
      "--input-text": "#2C3D3A",
      "--input-placeholder-text": "#AABCC1",
      "--progress-track-bg": "#E0E8E6",
      "--map-background-color": "#E0E8E6",
      "--map-region-default-fill": "#AABCC1",
      "--map-region-border": "#FFFFFF",
      "--map-region-hover-fill": "rgba(168, 76, 76, 0.4)",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMontserrat,
    },
    styles: {
      "--panel-shadow": "0 2px 6px rgba(0,0,0,0.06)",
      "--button-shadow": "0 1px 3px rgba(0,0,0,0.04)",
      "--element-radius": "5px",
      "--border-width": "1px",
      "--focus-ring-color": "#A84C4C",
      "--progress-value-color": "#3A5C4A",
      "--checkbox-accent-color": "#A84C4C",
      "--input-focus-shadow-color": "rgba(168, 76, 76, 0.25)",
      "--transition-speed": "0.15s ease-in-out",
    },
  },
  manila_sunrise: {
    name: "Manila Sunrise",
    colors: {
      "--primary-bg": "#FFFBEB", // Very light, warm yellow-cream (dawn light)
      "--secondary-bg": "#FFF5D6", // Slightly deeper warm yellow
      "--ui-panel-bg": "#FFFFFF",
      "--button-bg": "#D47B00", // Deep golden orange (mango, sun)
      "--button-hover-bg": "#E68D11",
      "--button-active-bg": "#B06A00",
      "--button-text": "#FFFFFF",
      "--primary-text": "#4A3B2E", // Dark warm brown
      "--secondary-text": "#8A7B6E",
      "--accent-color": "#E04F4F", // Vibrant coral red (bougainvillea, flags)
      "--accent-text": "#FFFFFF",
      "--rgb-accent-color": hexToRgbString("#E04F4F"),
      "--highlight-bg": "rgba(224, 79, 79, 0.15)",
      "--border-color": "#D4C7BB",
      "--accent-border-color": "#E04F4F",
      "--error-text": "#D9534F",
      "--success-text": "#5CB85C",
      "--disabled-bg": "#E0E0E0",
      "--disabled-text": "#A0A0A0",
      "--button-action-bg": "#E04F4F",
      "--button-action-hover-bg": "#D03F3F",
      "--button-action-text": "#FFFFFF",
      "--button-delete-bg": "#D47B00",
      "--button-delete-hover-bg": "#B06A00",
      "--button-delete-text": "#FFFFFF",
      "--input-bg": "#FFFBEB",
      "--input-text": "#4A3B2E",
      "--input-placeholder-text": "#A0A0A0",
      "--progress-track-bg": "#FFF5D6",
      "--map-background-color": "#FFF5D6",
      "--map-region-default-fill": "#D4C7BB",
      "--map-region-border": "#FFFFFF",
      "--map-region-hover-fill": "rgba(224, 79, 79, 0.4)",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMontserrat,
    },
    styles: {
      "--panel-shadow": "0 1px 4px rgba(0,0,0,0.07)",
      "--button-shadow": "0 1px 2px rgba(0,0,0,0.05)",
      "--element-radius": "8px",
      "--border-width": "1px",
      "--focus-ring-color": "#E04F4F",
      "--progress-value-color": "#D47B00",
      "--checkbox-accent-color": "#E04F4F",
      "--input-focus-shadow-color": "rgba(224, 79, 79, 0.3)",
      "--transition-speed": "0.15s ease-in-out",
    },
  },
  palace_lanterns: {
    name: "Palace Lanterns",
    colors: {
      "--primary-bg": "#2C1A3A", // Deep, rich plum/aubergine
      "--secondary-bg": "#1F112B", // Darker, muted purple
      "--ui-panel-bg": "#3F2A5A", // Lighter, opulent purple panel
      "--button-bg": "#8A5C6D", // Muted rosewood/berry
      "--button-hover-bg": "#9B6D7E",
      "--button-active-bg": "#7A4B5C",
      "--button-text": "#F0F2FF",
      "--primary-text": "#F0F2FF", // Soft, warm off-white
      "--secondary-text": "#D0D4F0",
      "--accent-color": "#FFC107", // Bright gold/amber (lantern glow)
      "--accent-text": "#2C1A3A", // Dark text on bright accent
      "--rgb-accent-color": hexToRgbString("#FFC107"),
      "--highlight-bg": "rgba(255, 193, 7, 0.15)",
      "--border-color": "#4A3A6A",
      "--accent-border-color": "#FFC107",
      "--error-text": "#F472B6",
      "--success-text": "#86EFAC",
      "--disabled-bg": "#3F2A5A",
      "--disabled-text": "#8A87BB",
      "--button-action-bg": "#FFC107",
      "--button-action-hover-bg": "#FFDA4A",
      "--button-action-text": "#2C1A3A",
      "--button-delete-bg": "#8A5C6D",
      "--button-delete-hover-bg": "#7A4B5C",
      "--button-delete-text": "#F0F2FF",
      "--input-bg": "#1F112B",
      "--input-text": "#F0F2FF",
      "--input-placeholder-text": "#9AA0CF",
      "--progress-track-bg": "#3F2A5A",
      "--map-background-color": "#1F112B",
      "--map-region-default-fill": "#3F2A5A",
      "--map-region-border": "#2C1A3A",
      "--map-region-hover-fill": "#FFC107",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMerriweather,
    },
    styles: {
      "--panel-shadow": "0 5px 15px rgba(0,0,0,0.4)",
      "--button-shadow": "0 2px 4px rgba(0,0,0,0.25)",
      "--element-radius": "6px",
      "--border-width": "1px",
      "--focus-ring-color": "#FFC107",
      "--progress-value-color": "#8A5C6D",
      "--checkbox-accent-color": "#FFC107",
      "--input-focus-shadow-color": "rgba(255, 193, 7, 0.35)",
      "--transition-speed": "0.15s ease",
    },
  },
  maple_winter: {
    name: "Maple Winter",
    colors: {
      "--primary-bg": "#F8F8FA", // Very light cool white/snow
      "--secondary-bg": "#EAEFF3", // Light icy blue-grey
      "--ui-panel-bg": "#FFFFFF",
      "--button-bg": "#5A6A8C", // Muted slate blue
      "--button-hover-bg": "#6E7A9B",
      "--button-active-bg": "#4A5B7D",
      "--button-text": "#FFFFFF",
      "--primary-text": "#2D3748", // Dark deep blue-grey
      "--secondary-text": "#718096",
      "--accent-color": "#E53E3E", // Strong maple leaf red
      "--accent-text": "#FFFFFF",
      "--rgb-accent-color": hexToRgbString("#E53E3E"),
      "--highlight-bg": "rgba(229, 62, 62, 0.15)",
      "--border-color": "#D1D9E0",
      "--accent-border-color": "#E53E3E",
      "--error-text": "#F56565",
      "--success-text": "#48BB78",
      "--disabled-bg": "#E0E0E0",
      "--disabled-text": "#A0A0A0",
      "--button-action-bg": "#E53E3E",
      "--button-action-hover-bg": "#C53030",
      "--button-action-text": "#FFFFFF",
      "--button-delete-bg": "#5A6A8C",
      "--button-delete-hover-bg": "#4A5B7D",
      "--button-delete-text": "#FFFFFF",
      "--input-bg": "#FFFFFF",
      "--input-text": "#2D3748",
      "--input-placeholder-text": "#A0A0A0",
      "--progress-track-bg": "#EAEFF3",
      "--map-background-color": "#EAEFF3",
      "--map-region-default-fill": "#B0C4DE",
      "--map-region-border": "#FFFFFF",
      "--map-region-hover-fill": "rgba(229, 62, 62, 0.4)",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMontserrat,
    },
    styles: {
      "--panel-shadow": "0 1px 4px rgba(0,0,0,0.07)",
      "--button-shadow": "0 1px 2px rgba(0,0,0,0.05)",
      "--element-radius": "4px",
      "--border-width": "1px",
      "--focus-ring-color": "#E53E3E",
      "--progress-value-color": "#5A6A8C",
      "--checkbox-accent-color": "#E53E3E",
      "--input-focus-shadow-color": "rgba(229, 62, 62, 0.3)",
      "--transition-speed": "0.15s ease-in-out",
    },
  },
  red_earth_ocean: {
    name: "Red Earth & Ocean",
    colors: {
      "--primary-bg": "#FBF5EF", // Light warm off-white (sandy light)
      "--secondary-bg": "#F2E8D8", // Muted light clay
      "--ui-panel-bg": "#FFFFFF",
      "--button-bg": "#7A3A2D", // Deep terracotta/burnt sienna
      "--button-hover-bg": "#9A4A3D",
      "--button-active-bg": "#6A2A1C",
      "--button-text": "#FFFFFF",
      "--primary-text": "#3A2E2C", // Dark earthy brown
      "--secondary-text": "#7A6B6A",
      "--accent-color": "#3B82F6", // Bright, clear ocean blue
      "--accent-text": "#FFFFFF",
      "--rgb-accent-color": hexToRgbString("#3B82F6"),
      "--highlight-bg": "rgba(59, 130, 246, 0.15)",
      "--border-color": "#D1C3B8",
      "--accent-border-color": "#3B82F6",
      "--error-text": "#EF4444",
      "--success-text": "#22C55E",
      "--disabled-bg": "#E0E0E0",
      "--disabled-text": "#A0A0A0",
      "--button-action-bg": "#3B82F6",
      "--button-action-hover-bg": "#2563EB",
      "--button-action-text": "#FFFFFF",
      "--button-delete-bg": "#7A3A2D",
      "--button-delete-hover-bg": "#6A2A1C",
      "--button-delete-text": "#FFFFFF",
      "--input-bg": "#FBF5EF",
      "--input-text": "#3A2E2C",
      "--input-placeholder-text": "#A0A0A0",
      "--progress-track-bg": "#F2E8D8",
      "--map-background-color": "#F2E8D8",
      "--map-region-default-fill": "#B0A59A",
      "--map-region-border": "#FFFFFF",
      "--map-region-hover-fill": "rgba(59, 130, 246, 0.4)",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMontserrat,
    },
    styles: {
      "--panel-shadow": "0 1px 4px rgba(0,0,0,0.07)",
      "--button-shadow": "0 1px 2px rgba(0,0,0,0.05)",
      "--element-radius": "6px",
      "--border-width": "1px",
      "--focus-ring-color": "#3B82F6",
      "--progress-value-color": "#7A3A2D",
      "--checkbox-accent-color": "#3B82F6",
      "--input-focus-shadow-color": "rgba(59, 130, 246, 0.3)",
      "--transition-speed": "0.15s ease-in-out",
    },
  },
  cote_d_azur_glamour: {
    name: "Côte d'Azur Glamour",
    colors: {
      "--primary-bg": "#F8F8F8", // Crisp white
      "--secondary-bg": "#EFF5F9", // Very pale sky blue
      "--ui-panel-bg": "#FFFFFF",
      "--button-bg": "#0D47A1", // Deep azure blue
      "--button-hover-bg": "#1976D2",
      "--button-active-bg": "#083375",
      "--button-text": "#FFFFFF",
      "--primary-text": "#212121", // Dark almost-black charcoal
      "--secondary-text": "#616161",
      "--accent-color": "#FF7043", // Vibrant coral orange
      "--accent-text": "#FFFFFF",
      "--rgb-accent-color": hexToRgbString("#FF7043"),
      "--highlight-bg": "rgba(255, 112, 67, 0.15)",
      "--border-color": "#D1D5DB",
      "--accent-border-color": "#FF7043",
      "--error-text": "#E53935",
      "--success-text": "#4CAF50",
      "--disabled-bg": "#E0E0E0",
      "--disabled-text": "#A0A0A0",
      "--button-action-bg": "#FF7043",
      "--button-action-hover-bg": "#FF8A65",
      "--button-action-text": "#FFFFFF",
      "--button-delete-bg": "#0D47A1",
      "--button-delete-hover-bg": "#083375",
      "--button-delete-text": "#FFFFFF",
      "--input-bg": "#FFFFFF",
      "--input-text": "#212121",
      "--input-placeholder-text": "#A0A0A0",
      "--progress-track-bg": "#EFF5F9",
      "--map-background-color": "#EFF5F9",
      "--map-region-default-fill": "#B0D0E0",
      "--map-region-border": "#FFFFFF",
      "--map-region-hover-fill": "rgba(255, 112, 67, 0.4)",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMontserrat,
    },
    styles: {
      "--panel-shadow": "0 2px 8px rgba(0,0,0,0.08)",
      "--button-shadow": "0 1px 3px rgba(0,0,0,0.06)",
      "--element-radius": "8px",
      "--border-width": "1px",
      "--focus-ring-color": "#FF7043",
      "--progress-value-color": "#0D47A1",
      "--checkbox-accent-color": "#FF7043",
      "--input-focus-shadow-color": "rgba(255, 112, 67, 0.3)",
      "--transition-speed": "0.15s ease-in-out",
    },
  },
  london_fog_brass: {
    name: "London Fog & Brass",
    colors: {
      "--primary-bg": "#F8F8F8", // Very light cool grey (fog)
      "--secondary-bg": "#EAEAEB", // Muted light grey
      "--ui-panel-bg": "#FFFFFF",
      "--button-bg": "#4A5260", // Deep slate grey
      "--button-hover-bg": "#5A6472",
      "--button-active-bg": "#3A4550",
      "--button-text": "#FFFFFF",
      "--primary-text": "#2C2C30", // Dark almost-black grey
      "--secondary-text": "#7A7A80",
      "--accent-color": "#D4AF37", // Muted brassy gold
      "--accent-text": "#2C2C30", // Dark text on gold
      "--rgb-accent-color": hexToRgbString("#D4AF37"),
      "--highlight-bg": "rgba(212, 175, 55, 0.15)",
      "--border-color": "#D1D1D3",
      "--accent-border-color": "#D4AF37",
      "--error-text": "#D9534F",
      "--success-text": "#5CB85C",
      "--disabled-bg": "#E0E0E0",
      "--disabled-text": "#A0A0A0",
      "--button-action-bg": "#D4AF37",
      "--button-action-hover-bg": "#B89A27",
      "--button-action-text": "#2C2C30",
      "--button-delete-bg": "#4A5260",
      "--button-delete-hover-bg": "#3A4550",
      "--button-delete-text": "#FFFFFF",
      "--input-bg": "#FFFFFF",
      "--input-text": "#2C2C30",
      "--input-placeholder-text": "#A0A0A0",
      "--progress-track-bg": "#EAEAEB",
      "--map-background-color": "#EAEAEB",
      "--map-region-default-fill": "#BCC0C4",
      "--map-region-border": "#FFFFFF",
      "--map-region-hover-fill": "rgba(212, 175, 55, 0.4)",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMerriweather,
    },
    styles: {
      "--panel-shadow": "0 1px 4px rgba(0,0,0,0.07)",
      "--button-shadow": "0 1px 2px rgba(0,0,0,0.05)",
      "--element-radius": "4px",
      "--border-width": "1px",
      "--focus-ring-color": "#D4AF37",
      "--progress-value-color": "#4A5260",
      "--checkbox-accent-color": "#D4AF37",
      "--input-focus-shadow-color": "rgba(212, 175, 55, 0.3)",
      "--transition-speed": "0.15s ease-in-out",
    },
  },
  tuscan_sun: {
    name: "Tuscan Sun",
    colors: {
      "--primary-bg": "#FBF5EC", // Warm off-white (sun-baked plaster)
      "--secondary-bg": "#F2E8D2", // Muted light terracotta/clay
      "--ui-panel-bg": "#FFFFFF",
      "--button-bg": "#8B4513", // Deep terracotta brown
      "--button-hover-bg": "#A35A2C",
      "--button-active-bg": "#70360B",
      "--button-text": "#FFFFFF",
      "--primary-text": "#3A2E2C", // Dark warm brown
      "--secondary-text": "#7A6B6A",
      "--accent-color": "#D4AF37", // Warm golden yellow (sun, olives)
      "--accent-text": "#3A2E2C", // Dark text on gold
      "--rgb-accent-color": hexToRgbString("#D4AF37"),
      "--highlight-bg": "rgba(212, 175, 55, 0.15)",
      "--border-color": "#D1C3B8",
      "--accent-border-color": "#D4AF37",
      "--error-text": "#D9534F",
      "--success-text": "#5CB85C",
      "--disabled-bg": "#E0E0E0",
      "--disabled-text": "#A0A0A0",
      "--button-action-bg": "#D4AF37",
      "--button-action-hover-bg": "#B89A27",
      "--button-action-text": "#3A2E2C",
      "--button-delete-bg": "#8B4513",
      "--button-delete-hover-bg": "#70360B",
      "--button-delete-text": "#FFFFFF",
      "--input-bg": "#FBF5EC",
      "--input-text": "#3A2E2C",
      "--input-placeholder-text": "#A0A0A0",
      "--progress-track-bg": "#F2E8D2",
      "--map-background-color": "#F2E8D2",
      "--map-region-default-fill": "#B0A59A",
      "--map-region-border": "#FFFFFF",
      "--map-region-hover-fill": "rgba(212, 175, 55, 0.4)",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMerriweather,
    },
    styles: {
      "--panel-shadow": "0 1px 4px rgba(0,0,0,0.07)",
      "--button-shadow": "0 1px 2px rgba(0,0,0,0.05)",
      "--element-radius": "6px",
      "--border-width": "1px",
      "--focus-ring-color": "#D4AF37",
      "--progress-value-color": "#8B4513",
      "--checkbox-accent-color": "#D4AF37",
      "--input-focus-shadow-color": "rgba(212, 175, 55, 0.3)",
      "--transition-speed": "0.15s ease-in-out",
    },
  },
  alhambra_sunset: {
    name: "Alhambra Sunset",
    colors: {
      "--primary-bg": "#2A1A1A", // Very deep, dark red-brown (nightfall over stone)
      "--secondary-bg": "#1C0D0D", // Near-black deep red
      "--ui-panel-bg": "#3A2A2A", // Richer dark red-brown panel
      "--button-bg": "#8B2A2A", // Deep, rich crimson
      "--button-hover-bg": "#A33B3B",
      "--button-active-bg": "#701F1F",
      "--button-text": "#F5EFEB",
      "--primary-text": "#F5EFEB", // Warm off-white (illuminated details)
      "--secondary-text": "#D4C7C7",
      "--accent-color": "#FF8C42", // Vibrant burnt orange/gold (sunset glow)
      "--accent-text": "#2A1A1A", // Dark text on orange
      "--rgb-accent-color": hexToRgbString("#FF8C42"),
      "--highlight-bg": "rgba(255, 140, 66, 0.15)",
      "--border-color": "#5A4A4A",
      "--accent-border-color": "#FF8C42",
      "--error-text": "#F472B6",
      "--success-text": "#86EFAC",
      "--disabled-bg": "#3A2A2A",
      "--disabled-text": "#8A7A7A",
      "--button-action-bg": "#FF8C42",
      "--button-action-hover-bg": "#FF7A30",
      "--button-action-text": "#2A1A1A",
      "--button-delete-bg": "#8B2A2A",
      "--button-delete-hover-bg": "#701F1F",
      "--button-delete-text": "#F5EFEB",
      "--input-bg": "#1C0D0D",
      "--input-text": "#F5EFEB",
      "--input-placeholder-text": "#A09090",
      "--progress-track-bg": "#3A2A2A",
      "--map-background-color": "#1C0D0D",
      "--map-region-default-fill": "#3A2A2A",
      "--map-region-border": "#2A1A1A",
      "--map-region-hover-fill": "#FF8C42",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMerriweather,
    },
    styles: {
      "--panel-shadow": "0 5px 15px rgba(0,0,0,0.4)",
      "--button-shadow": "0 2px 4px rgba(0,0,0,0.25)",
      "--element-radius": "5px",
      "--border-width": "1px",
      "--focus-ring-color": "#FF8C42",
      "--progress-value-color": "#8B2A2A",
      "--checkbox-accent-color": "#FF8C42",
      "--input-focus-shadow-color": "rgba(255, 140, 66, 0.35)",
      "--transition-speed": "0.15s ease",
    },
  },
  baltic_coast_sunset: {
    name: "Baltic Coast Sunset",
    colors: {
      "--primary-bg": "#2A1A3A", // Deep, dark blue-purple (twilight sky)
      "--secondary-bg": "#1D112B", // Even darker purple
      "--ui-panel-bg": "#3A2A5A", // Lighter, richer blue-purple panel
      "--button-bg": "#8A3A5C", // Muted berry/magenta
      "--button-hover-bg": "#A34A70",
      "--button-active-bg": "#702B4A",
      "--button-text": "#F0F2FF",
      "--primary-text": "#F0F2FF", // Soft, warm off-white
      "--secondary-text": "#D0D4F0",
      "--accent-color": "#FF7F50", // Vibrant coral orange (sunset glow)
      "--accent-text": "#FFFFFF",
      "--rgb-accent-color": hexToRgbString("#FF7F50"),
      "--highlight-bg": "rgba(255, 127, 80, 0.15)",
      "--border-color": "#4A3A6A",
      "--accent-border-color": "#FF7F50",
      "--error-text": "#F472B6",
      "--success-text": "#86EFAC",
      "--disabled-bg": "#3A2A5A",
      "--disabled-text": "#8A87BB",
      "--button-action-bg": "#FF7F50",
      "--button-action-hover-bg": "#FF9F70",
      "--button-action-text": "#FFFFFF",
      "--button-delete-bg": "#8A3A5C",
      "--button-delete-hover-bg": "#702B4A",
      "--button-delete-text": "#F0F2FF",
      "--input-bg": "#1D112B",
      "--input-text": "#F0F2FF",
      "--input-placeholder-text": "#9AA0CF",
      "--progress-track-bg": "#3A2A5A",
      "--map-background-color": "#1D112B",
      "--map-region-default-fill": "#3A2A5A",
      "--map-region-border": "#2A1A3A",
      "--map-region-hover-fill": "#FF7F50",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMontserrat,
    },
    styles: {
      "--panel-shadow": "0 5px 15px rgba(0,0,0,0.4)",
      "--button-shadow": "0 2px 4px rgba(0,0,0,0.25)",
      "--element-radius": "6px",
      "--border-width": "1px",
      "--focus-ring-color": "#FF7F50",
      "--progress-value-color": "#8A3A5C",
      "--checkbox-accent-color": "#FF7F50",
      "--input-focus-shadow-color": "rgba(255, 127, 80, 0.35)",
      "--transition-speed": "0.15s ease",
    },
  },
  nordic_midnight_sun: {
    name: "Nordic Midnight Sun",
    colors: {
      "--primary-bg": "#F5F8FA", // Very light, crisp cool off-white
      "--secondary-bg": "#EAEFF3", // Pale, subtle blue-grey
      "--ui-panel-bg": "#FFFFFF",
      "--button-bg": "#4A6E7D", // Muted deep teal-blue
      "--button-hover-bg": "#5A8191",
      "--button-active-bg": "#3A5C6B",
      "--button-text": "#FFFFFF",
      "--primary-text": "#2C3D45", // Dark, cool almost-black
      "--secondary-text": "#6E828A",
      "--accent-color": "#FFD700", // Soft, warm gold (midnight sun glow)
      "--accent-text": "#2C3D45", // Dark text on gold
      "--rgb-accent-color": hexToRgbString("#FFD700"),
      "--highlight-bg": "rgba(255, 215, 0, 0.1)",
      "--border-color": "#C4D1CF",
      "--accent-border-color": "#FFD700",
      "--error-text": "#D9534F",
      "--success-text": "#5CB85C",
      "--disabled-bg": "#EAEFF0",
      "--disabled-text": "#AABCC1",
      "--button-action-bg": "#FFD700",
      "--button-action-hover-bg": "#FFEB3B",
      "--button-action-text": "#2C3D45",
      "--button-delete-bg": "#4A6E7D",
      "--button-delete-hover-bg": "#3A5C6B",
      "--button-delete-text": "#FFFFFF",
      "--input-bg": "#FFFFFF",
      "--input-text": "#2C3D45",
      "--input-placeholder-text": "#AABCC1",
      "--progress-track-bg": "#EAEFF0",
      "--map-background-color": "#EAEFF0",
      "--map-region-default-fill": "#B0C4DE",
      "--map-region-border": "#FFFFFF",
      "--map-region-hover-fill": "rgba(255, 215, 0, 0.3)",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMontserrat,
    },
    styles: {
      "--panel-shadow": "0 1px 3px rgba(0,0,0,0.05)",
      "--button-shadow": "none",
      "--element-radius": "3px",
      "--border-width": "1px",
      "--focus-ring-color": "#FFD700",
      "--progress-value-color": "#4A6E7D",
      "--checkbox-accent-color": "#FFD700",
      "--input-focus-shadow-color": "rgba(255, 215, 0, 0.25)",
      "--transition-speed": "0.15s linear",
    },
  },
  carnival_energy: {
    name: "Carnival Energy",
    colors: {
      "--primary-bg": "#1A1B4B", // Deep, rich violet-blue (night sky over carnival)
      "--secondary-bg": "#11123B", // Even darker indigo
      "--ui-panel-bg": "#2A2B60", // Vibrant purple-blue panel
      "--button-bg": "#FF6B6B", // Bold, bright coral red
      "--button-hover-bg": "#FF8B8B",
      "--button-active-bg": "#E04F4F",
      "--button-text": "#FFFFFF",
      "--primary-text": "#F0F2FF", // Soft off-white
      "--secondary-text": "#D0D4F0",
      "--accent-color": "#FFD700", // Bright gold/yellow (feathers, sun)
      "--accent-text": "#1A1B4B", // Dark text on gold
      "--rgb-accent-color": hexToRgbString("#FFD700"),
      "--highlight-bg": "rgba(255, 215, 0, 0.15)",
      "--border-color": "#4A4B7B",
      "--accent-border-color": "#FFD700",
      "--error-text": "#F472B6",
      "--success-text": "#86EFAC",
      "--disabled-bg": "#2A2B60",
      "--disabled-text": "#8A87BB",
      "--button-action-bg": "#FFD700",
      "--button-action-hover-bg": "#FFEB3B",
      "--button-action-text": "#1A1B4B",
      "--button-delete-bg": "#FF6B6B",
      "--button-delete-hover-bg": "#E04F4F",
      "--button-delete-text": "#FFFFFF",
      "--input-bg": "#11123B",
      "--input-text": "#F0F2FF",
      "--input-placeholder-text": "#9AA0CF",
      "--progress-track-bg": "#2A2B60",
      "--map-background-color": "#11123B",
      "--map-region-default-fill": "#2A2B60",
      "--map-region-border": "#1A1B4B",
      "--map-region-hover-fill": "#FFD700",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMontserrat,
    },
    styles: {
      "--panel-shadow": "0 5px 15px rgba(0,0,0,0.5)",
      "--button-shadow": "0 2px 4px rgba(0,0,0,0.3)",
      "--element-radius": "10px",
      "--border-width": "1px",
      "--focus-ring-color": "#FFD700",
      "--progress-value-color": "#FF6B6B",
      "--checkbox-accent-color": "#FFD700",
      "--input-focus-shadow-color": "rgba(255, 215, 0, 0.35)",
      "--transition-speed": "0.15s ease-out",
    },
  },
  tango_night: {
    name: "Tango Night",
    colors: {
      "--primary-bg": "#1A1010", // Very deep, dark red-black (intense atmosphere)
      "--secondary-bg": "#0D0808", // Near-black
      "--ui-panel-bg": "#2A1A1A", // Dark, rich mahogany-red panel
      "--button-bg": "#5A3A3A", // Muted deep red-brown
      "--button-hover-bg": "#7A4A4A",
      "--button-active-bg": "#4A2A2A",
      "--button-text": "#F5F0EB",
      "--primary-text": "#F5F0EB", // Warm off-white
      "--secondary-text": "#D4C7C7",
      "--accent-color": "#C41E3A", // Passionate, bold tango red
      "--accent-text": "#FFFFFF",
      "--rgb-accent-color": hexToRgbString("#C41E3A"),
      "--highlight-bg": "rgba(196, 30, 58, 0.15)",
      "--border-color": "#4A3A3A",
      "--accent-border-color": "#C41E3A",
      "--error-text": "#F56565",
      "--success-text": "#48BB78",
      "--disabled-bg": "#2A1A1A",
      "--disabled-text": "#7A6B6B",
      "--button-action-bg": "#C41E3A",
      "--button-action-hover-bg": "#A31A30",
      "--button-action-text": "#FFFFFF",
      "--button-delete-bg": "#5A3A3A",
      "--button-delete-hover-bg": "#4A2A2A",
      "--button-delete-text": "#F5F0EB",
      "--input-bg": "#0D0808",
      "--input-text": "#F5F0EB",
      "--input-placeholder-text": "#A09090",
      "--progress-track-bg": "#2A1A1A",
      "--map-background-color": "#0D0808",
      "--map-region-default-fill": "#2A1A1A",
      "--map-region-border": "#1A1010",
      "--map-region-hover-fill": "#C41E3A",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMerriweather,
    },
    styles: {
      "--panel-shadow": "0 6px 18px rgba(0,0,0,0.6)",
      "--button-shadow": "0 2px 5px rgba(0,0,0,0.4)",
      "--element-radius": "3px",
      "--border-width": "1px",
      "--focus-ring-color": "#C41E3A",
      "--progress-value-color": "#5A3A3A",
      "--checkbox-accent-color": "#C41E3A",
      "--input-focus-shadow-color": "rgba(196, 30, 58, 0.4)",
      "--transition-speed": "0.15s ease",
    },
  },
  spice_market_sunset: {
    name: "Spice Market Sunset",
    colors: {
      "--primary-bg": "#6A3A2A", // Deep, warm terracotta/burnt orange
      "--secondary-bg": "#4A2A1A", // Darker, rich brown
      "--ui-panel-bg": "#8A4A3A", // Lighter, vibrant orange-brown panel
      "--button-bg": "#B05C3C", // Muted rust orange
      "--button-hover-bg": "#C46D4B",
      "--button-active-bg": "#9A4A2B",
      "--button-text": "#F0EAD6",
      "--primary-text": "#F0EAD6", // Creamy off-white
      "--secondary-text": "#D4CBB8",
      "--accent-color": "#FFC107", // Bright, glowing saffron yellow
      "--accent-text": "#4A2A1A", // Dark text on yellow
      "--rgb-accent-color": hexToRgbString("#FFC107"),
      "--highlight-bg": "rgba(255, 193, 7, 0.15)",
      "--border-color": "#7A4A3A",
      "--accent-border-color": "#FFC107",
      "--error-text": "#F472B6",
      "--success-text": "#86EFAC",
      "--disabled-bg": "#8A4A3A",
      "--disabled-text": "#A89A8F",
      "--button-action-bg": "#FFC107",
      "--button-action-hover-bg": "#FFDA4A",
      "--button-action-text": "#4A2A1A",
      "--button-delete-bg": "#B05C3C",
      "--button-delete-hover-bg": "#9A4A2B",
      "--button-delete-text": "#F0EAD6",
      "--input-bg": "#4A2A1A",
      "--input-text": "#F0EAD6",
      "--input-placeholder-text": "#A89A8F",
      "--progress-track-bg": "#8A4A3A",
      "--map-background-color": "#4A2A1A",
      "--map-region-default-fill": "#8A4A3A",
      "--map-region-border": "#6A3A2A",
      "--map-region-hover-fill": "#FFC107",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMontserrat,
    },
    styles: {
      "--panel-shadow": "0 5px 15px rgba(0,0,0,0.4)",
      "--button-shadow": "0 2px 4px rgba(0,0,0,0.25)",
      "--element-radius": "6px",
      "--border-width": "1px",
      "--focus-ring-color": "#FFC107",
      "--progress-value-color": "#B05C3C",
      "--checkbox-accent-color": "#FFC107",
      "--input-focus-shadow-color": "rgba(255, 193, 7, 0.35)",
      "--transition-speed": "0.15s ease",
    },
  },
  galactic_horizon: {
    name: "Galactic Horizon",
    colors: {
      "--primary-bg": "#0D1321", // Deep space navy
      "--secondary-bg": "#070B13", // Near-black void
      "--ui-panel-bg": "#1A223B", // Muted dark blue-grey console
      "--button-bg": "#4A5568", // Dark metallic grey
      "--button-hover-bg": "#5A6578",
      "--button-active-bg": "#3A4558",
      "--button-text": "#F7FAFC",
      "--primary-text": "#F7FAFC", // Bright starlight white
      "--secondary-text": "#E2E8F0",
      "--accent-color": "#6366F1", // Vibrant cosmic blue
      "--accent-text": "#FFFFFF",
      "--rgb-accent-color": hexToRgbString("#6366F1"),
      "--highlight-bg": "rgba(99, 102, 241, 0.15)",
      "--border-color": "#2D3748",
      "--accent-border-color": "#6366F1",
      "--error-text": "#EF4444",
      "--success-text": "#34D399",
      "--disabled-bg": "#1A223B",
      "--disabled-text": "#718096",
      "--button-action-bg": "#6366F1",
      "--button-action-hover-bg": "#4F46E5",
      "--button-action-text": "#FFFFFF",
      "--button-delete-bg": "#EF4444",
      "--button-delete-hover-bg": "#DC2626",
      "--button-delete-text": "#FFFFFF",
      "--input-bg": "#070B13",
      "--input-text": "#F7FAFC",
      "--input-placeholder-text": "#94A3B8",
      "--progress-track-bg": "#1A223B",
      "--map-background-color": "#070B13",
      "--map-region-default-fill": "#1A223B",
      "--map-region-border": "#0D1321",
      "--map-region-hover-fill": "#6366F1",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMontserrat,
    },
    styles: {
      "--panel-shadow": "0 8px 25px rgba(0,0,0,0.5)",
      "--button-shadow": "0 2px 7px rgba(0,0,0,0.3)",
      "--element-radius": "4px",
      "--border-width": "1px",
      "--focus-ring-color": "#6366F1",
      "--progress-value-color": "#4A5568",
      "--checkbox-accent-color": "#6366F1",
      "--input-focus-shadow-color": "rgba(99, 102, 241, 0.4)",
      "--transition-speed": "0.1s linear",
    },
  },
  vintage_arcade: {
    name: "Vintage Arcade",
    colors: {
      "--primary-bg": "#1A1A1A", // Deep charcoal (arcade cabinet)
      "--secondary-bg": "#0D0D0D", // Near-black
      "--ui-panel-bg": "#2A2A2A", // Dark grey panel
      "--button-bg": "#5A5A5A", // Medium grey (joystick base)
      "--button-hover-bg": "#7A7A7A",
      "--button-active-bg": "#4A4A4A",
      "--button-text": "#F0F0F0",
      "--primary-text": "#F0F0F0", // Crisp white
      "--secondary-text": "#B0B0B0",
      "--accent-color": "#FF00FF", // Electric Magenta (neon light, game graphics)
      "--accent-text": "#1A1A1A", // Dark text on bright accent
      "--rgb-accent-color": hexToRgbString("#FF00FF"),
      "--highlight-bg": "rgba(255, 0, 255, 0.15)",
      "--border-color": "#4A4A4A",
      "--accent-border-color": "#FF00FF",
      "--error-text": "#FF6B6B",
      "--success-text": "#4ADE80",
      "--disabled-bg": "#2A2A2A",
      "--disabled-text": "#7A7A7A",
      "--button-action-bg": "#00FFFF", // Cyan (another classic arcade color)
      "--button-action-hover-bg": "#33FFFF",
      "--button-action-text": "#1A1A1A",
      "--button-delete-bg": "#FF0000", // Bright red (game over!)
      "--button-delete-hover-bg": "#FF3333",
      "--button-delete-text": "#FFFFFF",
      "--input-bg": "#0D0D0D",
      "--input-text": "#F0F0F0",
      "--input-placeholder-text": "#8A8A8A",
      "--progress-track-bg": "#2A2A2A",
      "--map-background-color": "#0D0D0D",
      "--map-region-default-fill": "#2A2A2A",
      "--map-region-border": "#1A1A1A",
      "--map-region-hover-fill": "#00FFFF",
    },
    fonts: {
      "--font-main": fontRobotoMono, // Monospace for pixel feel
      "--font-heading": fontMontserrat,
    },
    styles: {
      "--panel-shadow": "0 5px 15px rgba(0,0,0,0.5)",
      "--button-shadow": "0 2px 6px rgba(0,0,0,0.25)",
      "--element-radius": "2px", // Sharp, pixelated corners
      "--border-width": "1px",
      "--focus-ring-color": "#FF00FF",
      "--progress-value-color": "#00FFFF",
      "--checkbox-accent-color": "#FF00FF",
      "--input-focus-shadow-color": "rgba(255, 0, 255, 0.35)",
      "--transition-speed": "0.1s linear",
    },
  },
  botanical_garden: {
    name: "Botanical Garden",
    colors: {
      "--primary-bg": "#F8FBF8", // Very light, fresh green-white
      "--secondary-bg": "#EBF2EB", // Pale, soft green
      "--ui-panel-bg": "#FFFFFF",
      "--button-bg": "#4CAF50", // Classic forest green
      "--button-hover-bg": "#66BB6A",
      "--button-active-bg": "#388E3C",
      "--button-text": "#FFFFFF",
      "--primary-text": "#2E3D2E", // Dark earthy green
      "--secondary-text": "#6A7B6A",
      "--accent-color": "#EC407A", // Vibrant fuchsia/deep rose (flower bloom)
      "--accent-text": "#FFFFFF",
      "--rgb-accent-color": hexToRgbString("#EC407A"),
      "--highlight-bg": "rgba(236, 64, 122, 0.15)",
      "--border-color": "#D1DCD1",
      "--accent-border-color": "#EC407A",
      "--error-text": "#D32F2F",
      "--success-text": "#66BB6A",
      "--disabled-bg": "#E0E0E0",
      "--disabled-text": "#A0A0A0",
      "--button-action-bg": "#EC407A",
      "--button-action-hover-bg": "#D81B60",
      "--button-action-text": "#FFFFFF",
      "--button-delete-bg": "#4CAF50",
      "--button-delete-hover-bg": "#388E3C",
      "--button-delete-text": "#FFFFFF",
      "--input-bg": "#FFFFFF",
      "--input-text": "#2E3D2E",
      "--input-placeholder-text": "#A0A0A0",
      "--progress-track-bg": "#EBF2EB",
      "--map-background-color": "#EBF2EB",
      "--map-region-default-fill": "#B0C4B0",
      "--map-region-border": "#FFFFFF",
      "--map-region-hover-fill": "rgba(236, 64, 122, 0.4)",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMerriweather,
    },
    styles: {
      "--panel-shadow": "0 1px 4px rgba(0,0,0,0.05)",
      "--button-shadow": "0 1px 2px rgba(0,0,0,0.03)",
      "--element-radius": "8px",
      "--border-width": "1px",
      "--focus-ring-color": "#EC407A",
      "--progress-value-color": "#4CAF50",
      "--checkbox-accent-color": "#EC407A",
      "--input-focus-shadow-color": "rgba(236, 64, 122, 0.3)",
      "--transition-speed": "0.15s ease-in-out",
    },
  },
  scottish_highlands: {
    name: "Scottish Highlands",
    colors: {
      "--primary-bg": "#EAEAE6", // Misty grey-green
      "--secondary-bg": "#DCDCD3", // Muted stone grey
      "--ui-panel-bg": "#FFFFFF",
      "--button-bg": "#4A5A5C", // Deep muted teal (loch water)
      "--button-hover-bg": "#5A6E70",
      "--button-active-bg": "#3A4A4C",
      "--button-text": "#FFFFFF",
      "--primary-text": "#2C3A3A", // Dark charcoal green
      "--secondary-text": "#6A7A7A",
      "--accent-color": "#8A4A7A", // Muted heather purple
      "--accent-text": "#FFFFFF",
      "--rgb-accent-color": hexToRgbString("#8A4A7A"),
      "--highlight-bg": "rgba(138, 74, 122, 0.15)",
      "--border-color": "#C4C4BB",
      "--accent-border-color": "#8A4A7A",
      "--error-text": "#D9534F",
      "--success-text": "#5CB85C",
      "--disabled-bg": "#E0E0E0",
      "--disabled-text": "#A0A0A0",
      "--button-action-bg": "#8A4A7A",
      "--button-action-hover-bg": "#7A3A6A",
      "--button-action-text": "#FFFFFF",
      "--button-delete-bg": "#4A5A5C",
      "--button-delete-hover-bg": "#3A4A4C",
      "--button-delete-text": "#FFFFFF",
      "--input-bg": "#F5F5F0",
      "--input-text": "#2C3A3A",
      "--input-placeholder-text": "#A0A0A0",
      "--progress-track-bg": "#DCDCD3",
      "--map-background-color": "#DCDCD3",
      "--map-region-default-fill": "#A0A09A",
      "--map-region-border": "#FFFFFF",
      "--map-region-hover-fill": "rgba(138, 74, 122, 0.4)",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMerriweather,
    },
    styles: {
      "--panel-shadow": "0 1px 4px rgba(0,0,0,0.07)",
      "--button-shadow": "0 1px 2px rgba(0,0,0,0.05)",
      "--element-radius": "5px",
      "--border-width": "1px",
      "--focus-ring-color": "#8A4A7A",
      "--progress-value-color": "#4A5A5C",
      "--checkbox-accent-color": "#8A4A7A",
      "--input-focus-shadow-color": "rgba(138, 74, 122, 0.3)",
      "--transition-speed": "0.15s ease-in-out",
    },
  },
  royal_jubilee: {
    name: "Royal Jubilee",
    colors: {
      "--primary-bg": "#F0F4F8", // Pale, cool blue-grey (cloudless sky)
      "--secondary-bg": "#E2E8F0", // Slightly deeper light grey-blue
      "--ui-panel-bg": "#FFFFFF",
      "--button-bg": "#1A2E6B", // Deep royal blue
      "--button-hover-bg": "#2A4080",
      "--button-active-bg": "#101F4F",
      "--button-text": "#FFFFFF",
      "--primary-text": "#2C3A4A", // Dark navy
      "--secondary-text": "#6A7A8A",
      "--accent-color": "#FFD700", // Bright, opulent gold
      "--accent-text": "#1A2E6B", // Dark text on gold
      "--rgb-accent-color": hexToRgbString("#FFD700"),
      "--highlight-bg": "rgba(255, 215, 0, 0.15)",
      "--border-color": "#C4D4E3",
      "--accent-border-color": "#FFD700",
      "--error-text": "#D9534F",
      "--success-text": "#5CB85C",
      "--disabled-bg": "#E0E0E0",
      "--disabled-text": "#A0A0A0",
      "--button-action-bg": "#FFD700",
      "--button-action-hover-bg": "#E0C000",
      "--button-action-text": "#1A2E6B",
      "--button-delete-bg": "#1A2E6B",
      "--button-delete-hover-bg": "#101F4F",
      "--button-delete-text": "#FFFFFF",
      "--input-bg": "#FFFFFF",
      "--input-text": "#2C3A4A",
      "--input-placeholder-text": "#A0A0A0",
      "--progress-track-bg": "#E2E8F0",
      "--map-background-color": "#E2E8F0",
      "--map-region-default-fill": "#B0C4DE",
      "--map-region-border": "#FFFFFF",
      "--map-region-hover-fill": "rgba(255, 215, 0, 0.4)",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMerriweather,
    },
    styles: {
      "--panel-shadow": "0 2px 8px rgba(0,0,0,0.08)",
      "--button-shadow": "0 1px 3px rgba(0,0,0,0.06)",
      "--element-radius": "6px",
      "--border-width": "1px",
      "--focus-ring-color": "#FFD700",
      "--progress-value-color": "#1A2E6B",
      "--checkbox-accent-color": "#FFD700",
      "--input-focus-shadow-color": "rgba(255, 215, 0, 0.3)",
      "--transition-speed": "0.15s ease-in-out",
    },
  },
  tudor_rose: {
    name: "Tudor Rose",
    colors: {
      "--primary-bg": "#F5F0EB", // Creamy off-white (plaster, parchment)
      "--secondary-bg": "#EAE4D9", // Muted light beige
      "--ui-panel-bg": "#FFFFFF",
      "--button-bg": "#7A2A2A", // Deep crimson red (Tudor rose)
      "--button-hover-bg": "#9A3A3A",
      "--button-active-bg": "#6A1A1A",
      "--button-text": "#FFFFFF",
      "--primary-text": "#3A2A2A", // Dark, rich brown
      "--secondary-text": "#7A6A6A",
      "--accent-color": "#4A7A4A", // Muted forest green (leaves, livery)
      "--accent-text": "#FFFFFF",
      "--rgb-accent-color": hexToRgbString("#4A7A4A"),
      "--highlight-bg": "rgba(74, 122, 74, 0.15)",
      "--border-color": "#D1C3B8",
      "--accent-border-color": "#4A7A4A",
      "--error-text": "#D9534F",
      "--success-text": "#5CB85C",
      "--disabled-bg": "#E0E0E0",
      "--disabled-text": "#A0A0A0",
      "--button-action-bg": "#7A2A2A",
      "--button-action-hover-bg": "#6A1A1A",
      "--button-action-text": "#FFFFFF",
      "--button-delete-bg": "#4A7A4A",
      "--button-delete-hover-bg": "#3A6A3A",
      "--button-delete-text": "#FFFFFF",
      "--input-bg": "#F5F0EB",
      "--input-text": "#3A2A2A",
      "--input-placeholder-text": "#A0A0A0",
      "--progress-track-bg": "#EAE4D9",
      "--map-background-color": "#EAE4D9",
      "--map-region-default-fill": "#B0A59A",
      "--map-region-border": "#FFFFFF",
      "--map-region-hover-fill": "rgba(74, 122, 74, 0.4)",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMerriweather,
    },
    styles: {
      "--panel-shadow": "0 1px 4px rgba(0,0,0,0.07)",
      "--button-shadow": "0 1px 2px rgba(0,0,0,0.05)",
      "--element-radius": "5px",
      "--border-width": "1px",
      "--focus-ring-color": "#7A2A2A",
      "--progress-value-color": "#4A7A4A",
      "--checkbox-accent-color": "#7A2A2A",
      "--input-focus-shadow-color": "rgba(74, 122, 74, 0.3)",
      "--transition-speed": "0.15s ease-in-out",
    },
  },
  pub_alehouse: {
    name: "Pub & Alehouse",
    colors: {
      "--primary-bg": "#2A1D1A", // Very dark, rich brown (mahogany wood)
      "--secondary-bg": "#1A100D", // Even darker espresso
      "--ui-panel-bg": "#3A2A2A", // Muted dark red-brown (leather)
      "--button-bg": "#7A5A4A", // Muted amber-brown (ale foam)
      "--button-hover-bg": "#8A6A5A",
      "--button-active-bg": "#6A4A3A",
      "--button-text": "#F5F0EB",
      "--primary-text": "#F5F0EB", // Warm off-white (candlelight)
      "--secondary-text": "#D4C7C7",
      "--accent-color": "#D4AF37", // Warm golden amber (whiskey, firelight)
      "--accent-text": "#2A1D1A", // Dark text on amber
      "--rgb-accent-color": hexToRgbString("#D4AF37"),
      "--highlight-bg": "rgba(212, 175, 55, 0.15)",
      "--border-color": "#4A3A3A",
      "--accent-border-color": "#D4AF37",
      "--error-text": "#D9534F",
      "--success-text": "#5CB85C",
      "--disabled-bg": "#3A2A2A",
      "--disabled-text": "#A0A0A0",
      "--button-action-bg": "#D4AF37",
      "--button-action-hover-bg": "#B89A27",
      "--button-action-text": "#2A1D1A",
      "--button-delete-bg": "#7A5A4A",
      "--button-delete-hover-bg": "#6A4A3A",
      "--button-delete-text": "#F5F0EB",
      "--input-bg": "#1A100D",
      "--input-text": "#F5F0EB",
      "--input-placeholder-text": "#A0A0A0",
      "--progress-track-bg": "#3A2A2A",
      "--map-background-color": "#1A100D",
      "--map-region-default-fill": "#3A2A2A",
      "--map-region-border": "#2A1D1A",
      "--map-region-hover-fill": "rgba(212, 175, 55, 0.4)",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMerriweather,
    },
    styles: {
      "--panel-shadow": "0 5px 15px rgba(0,0,0,0.5)",
      "--button-shadow": "0 2px 5px rgba(0,0,0,0.25)",
      "--element-radius": "5px",
      "--border-width": "1px",
      "--focus-ring-color": "#D4AF37",
      "--progress-value-color": "#7A5A4A",
      "--checkbox-accent-color": "#D4AF37",
      "--input-focus-shadow-color": "rgba(212, 175, 55, 0.3)",
      "--transition-speed": "0.15s ease-in-out",
    },
  },
  celtic_twilight: {
    name: "Celtic Twilight",
    colors: {
      "--primary-bg": "#2A3A4A", // Deep, dark forest blue-green
      "--secondary-bg": "#1A2A3A", // Even darker, muted blue
      "--ui-panel-bg": "#3A4A5A", // Lighter slate blue panel
      "--button-bg": "#5A7A7A", // Muted dark teal
      "--button-hover-bg": "#6E8A8A",
      "--button-active-bg": "#4A6A6A",
      "--button-text": "#F5F5F0",
      "--primary-text": "#F5F5F0", // Pale moonlight white
      "--secondary-text": "#D4D4D0",
      "--accent-color": "#9A4A7A", // Ethereal deep violet/magenta
      "--accent-text": "#F5F5F0", // Light text on accent
      "--rgb-accent-color": hexToRgbString("#9A4A7A"),
      "--highlight-bg": "rgba(154, 74, 122, 0.15)",
      "--border-color": "#4A5A6A",
      "--accent-border-color": "#9A4A7A",
      "--error-text": "#D9534F",
      "--success-text": "#5CB85C",
      "--disabled-bg": "#3A4A5A",
      "--disabled-text": "#A0A0A0",
      "--button-action-bg": "#9A4A7A",
      "--button-action-hover-bg": "#8A3A6A",
      "--button-action-text": "#F5F5F0",
      "--button-delete-bg": "#5A7A7A",
      "--button-delete-hover-bg": "#4A6A6A",
      "--button-delete-text": "#F5F5F0",
      "--input-bg": "#1A2A3A",
      "--input-text": "#F5F5F0",
      "--input-placeholder-text": "#A0A0A0",
      "--progress-track-bg": "#3A4A5A",
      "--map-background-color": "#1A2A3A",
      "--map-region-default-fill": "#3A4A5A",
      "--map-region-border": "#2A3A4A",
      "--map-region-hover-fill": "rgba(154, 74, 122, 0.4)",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMerriweather,
    },
    styles: {
      "--panel-shadow": "0 5px 15px rgba(0,0,0,0.4)",
      "--button-shadow": "0 2px 5px rgba(0,0,0,0.25)",
      "--element-radius": "6px",
      "--border-width": "1px",
      "--focus-ring-color": "#9A4A7A",
      "--progress-value-color": "#5A7A7A",
      "--checkbox-accent-color": "#9A4A7A",
      "--input-focus-shadow-color": "rgba(154, 74, 122, 0.35)",
      "--transition-speed": "0.15s ease-in-out",
    },
  },
  university_quad: {
    name: "University Quad",
    colors: {
      "--primary-bg": "#F8F8F0", // Warm off-white (aged parchment, stone)
      "--secondary-bg": "#EAEAD0", // Muted light beige/stone grey
      "--ui-panel-bg": "#FFFFFF",
      "--button-bg": "#3A4A7A", // Deep collegiate blue
      "--button-hover-bg": "#4A5A8A",
      "--button-active-bg": "#2A3A6A",
      "--button-text": "#FFFFFF",
      "--primary-text": "#2C2C3A", // Dark academic blue-grey
      "--secondary-text": "#6A6A7A",
      "--accent-color": "#D4AF37", // Classic gold (medals, crests)
      "--accent-text": "#2C2C3A", // Dark text on gold
      "--rgb-accent-color": hexToRgbString("#D4AF37"),
      "--highlight-bg": "rgba(212, 175, 55, 0.15)",
      "--border-color": "#D1D1B0",
      "--accent-border-color": "#D4AF37",
      "--error-text": "#D9534F",
      "--success-text": "#5CB85C",
      "--disabled-bg": "#E0E0E0",
      "--disabled-text": "#A0A0A0",
      "--button-action-bg": "#D4AF37",
      "--button-action-hover-bg": "#B89A27",
      "--button-action-text": "#2C2C3A",
      "--button-delete-bg": "#3A4A7A",
      "--button-delete-hover-bg": "#2A3A6A",
      "--button-delete-text": "#FFFFFF",
      "--input-bg": "#F8F8F0",
      "--input-text": "#2C2C3A",
      "--input-placeholder-text": "#A0A0A0",
      "--progress-track-bg": "#EAEAD0",
      "--map-background-color": "#EAEAD0",
      "--map-region-default-fill": "#B0B0A0",
      "--map-region-border": "#FFFFFF",
      "--map-region-hover-fill": "rgba(212, 175, 55, 0.4)",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMerriweather,
    },
    styles: {
      "--panel-shadow": "0 1px 4px rgba(0,0,0,0.07)",
      "--button-shadow": "0 1px 2px rgba(0,0,0,0.05)",
      "--element-radius": "4px",
      "--border-width": "1px",
      "--focus-ring-color": "#D4AF37",
      "--progress-value-color": "#3A4A7A",
      "--checkbox-accent-color": "#D4AF37",
      "--input-focus-shadow-color": "rgba(212, 175, 55, 0.3)",
      "--transition-speed": "0.15s ease-in-out",
    },
  },
  seoul_city_glow: {
    name: "Seoul City Glow",
    colors: {
      "--primary-bg": "#1C243B", // Deep slate blue (city at dusk)
      "--secondary-bg": "#12182D", // Darker navy
      "--ui-panel-bg": "#2B354C", // Muted mid-tone blue-grey panel
      "--button-bg": "#5A6A8C", // Muted indigo/slate blue
      "--button-hover-bg": "#6B7BA0",
      "--button-active-bg": "#4A5B7D",
      "--button-text": "#FFFFFF",
      "--primary-text": "#E0E8F0", // Light cool grey (reflected light)
      "--secondary-text": "#A0B0C0",
      "--accent-color": "#4FD1C5", // Bright, cool electric aqua (digital glow, modern tech)
      "--accent-text": "#1C243B", // Dark text on bright accent
      "--rgb-accent-color": hexToRgbString("#4FD1C5"),
      "--highlight-bg": "rgba(79, 209, 197, 0.15)",
      "--border-color": "#3B455C",
      "--accent-border-color": "#4FD1C5",
      "--error-text": "#F472B6", // Pop of warm pink for contrast
      "--success-text": "#86EFAC",
      "--disabled-bg": "#2B354C",
      "--disabled-text": "#7A8595",
      "--button-action-bg": "#4FD1C5",
      "--button-action-hover-bg": "#3FC0B2",
      "--button-action-text": "#1C243B",
      "--button-delete-bg": "#8A3B4B", // A contrasting, deep berry red
      "--button-delete-hover-bg": "#7A2B3B",
      "--button-delete-text": "#FFFFFF",
      "--input-bg": "#12182D",
      "--input-text": "#E0E8F0",
      "--input-placeholder-text": "#94A3B8",
      "--progress-track-bg": "#2B354C",
      "--map-background-color": "#12182D",
      "--map-region-default-fill": "#2B354C",
      "--map-region-border": "#1C243B",
      "--map-region-hover-fill": "#4FD1C5",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMontserrat,
    },
    styles: {
      "--panel-shadow": "0 6px 20px rgba(0,0,0,0.45)",
      "--button-shadow": "0 2px 8px rgba(0,0,0,0.25)",
      "--element-radius": "5px",
      "--border-width": "1px",
      "--focus-ring-color": "#4FD1C5",
      "--progress-value-color": "#5A6A8C",
      "--checkbox-accent-color": "#4FD1C5",
      "--input-focus-shadow-color": "rgba(79, 209, 197, 0.4)",
      "--transition-speed": "0.15s ease-in-out",
    },
  },
  kimchi_kick: {
    name: "Kimchi Kick",
    colors: {
      "--primary-bg": "#FCF7F5", // Very pale, warm off-white (like fresh rice)
      "--secondary-bg": "#F2EBE8", // Soft, warm beige
      "--ui-panel-bg": "#FFFFFF",
      "--button-bg": "#D9534F", // Vibrant red (gochugaru)
      "--button-hover-bg": "#C04541",
      "--button-active-bg": "#A83B38",
      "--button-text": "#FFFFFF",
      "--primary-text": "#3A2E2C", // Dark charcoal brown
      "--secondary-text": "#7A6B6A",
      "--accent-color": "#5CB85C", // Fresh green (napa cabbage, spring onion)
      "--accent-text": "#FFFFFF",
      "--rgb-accent-color": hexToRgbString("#5CB85C"),
      "--highlight-bg": "rgba(92, 184, 92, 0.15)",
      "--border-color": "#D1C7C0",
      "--accent-border-color": "#D9534F",
      "--error-text": "#E04F4F", // Slightly stronger red for errors
      "--success-text": "#4A9A4A",
      "--disabled-bg": "#E0E0E0",
      "--disabled-text": "#A0A0A0",
      "--button-action-bg": "#D9534F", // Primary action in spicy red
      "--button-action-hover-bg": "#C04541",
      "--button-action-text": "#FFFFFF",
      "--button-delete-bg": "#3A2E2C", // Dark, grounding delete button
      "--button-delete-hover-bg": "#2A1F1C",
      "--button-delete-text": "#FFFFFF",
      "--input-bg": "#FCF7F5",
      "--input-text": "#3A2E2C",
      "--input-placeholder-text": "#A0A0A0",
      "--progress-track-bg": "#F2EBE8",
      "--map-background-color": "#F2EBE8",
      "--map-region-default-fill": "#B0A59A",
      "--map-region-border": "#FFFFFF",
      "--map-region-hover-fill": "rgba(217, 83, 79, 0.4)",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMontserrat,
    },
    styles: {
      "--panel-shadow": "0 2px 8px rgba(0,0,0,0.08)",
      "--button-shadow": "0 1px 3px rgba(0,0,0,0.06)",
      "--element-radius": "6px",
      "--border-width": "1px",
      "--focus-ring-color": "#D9534F",
      "--progress-value-color": "#5CB85C",
      "--checkbox-accent-color": "#D9534F",
      "--input-focus-shadow-color": "rgba(217, 83, 79, 0.3)",
      "--transition-speed": "0.15s ease-in-out",
    },
  },
  hanbok_festival: {
    name: "Hanbok Festival",
    colors: {
      "--primary-bg": "#F8F0F5", // Pale, soft rose (silk fabric)
      "--secondary-bg": "#EFE0EB", // Muted light purple-pink
      "--ui-panel-bg": "#FFFFFF",
      "--button-bg": "#8B2A6B", // Deep fuchsia/berry (bold hanbok color)
      "--button-hover-bg": "#A33B83",
      "--button-active-bg": "#701A5B",
      "--button-text": "#FFFFFF",
      "--primary-text": "#3A2C3A", // Dark warm grey-purple
      "--secondary-text": "#7A6A7A",
      "--accent-color": "#3B82F6", // Bright sky blue (hanbok accents, clear day)
      "--accent-text": "#FFFFFF",
      "--rgb-accent-color": hexToRgbString("#3B82F6"),
      "--highlight-bg": "rgba(59, 130, 246, 0.15)",
      "--border-color": "#D1C3D1",
      "--accent-border-color": "#3B82F6",
      "--error-text": "#D9534F",
      "--success-text": "#5CB85C",
      "--disabled-bg": "#E0E0E0",
      "--disabled-text": "#A0A0A0",
      "--button-action-bg": "#FFC107", // Bright gold (ornaments, embroidery)
      "--button-action-hover-bg": "#E0A300",
      "--button-action-text": "#3A2C3A",
      "--button-delete-bg": "#8B2A6B",
      "--button-delete-hover-bg": "#701A5B",
      "--button-delete-text": "#FFFFFF",
      "--input-bg": "#F8F0F5",
      "--input-text": "#3A2C3A",
      "--input-placeholder-text": "#A0A0A0",
      "--progress-track-bg": "#EFE0EB",
      "--map-background-color": "#EFE0EB",
      "--map-region-default-fill": "#B0A0B0",
      "--map-region-border": "#FFFFFF",
      "--map-region-hover-fill": "rgba(59, 130, 246, 0.4)",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMerriweather,
    },
    styles: {
      "--panel-shadow": "0 1px 4px rgba(0,0,0,0.07)",
      "--button-shadow": "0 1px 2px rgba(0,0,0,0.05)",
      "--element-radius": "8px",
      "--border-width": "1px",
      "--focus-ring-color": "#3B82F6",
      "--progress-value-color": "#8B2A6B",
      "--checkbox-accent-color": "#3B82F6",
      "--input-focus-shadow-color": "rgba(59, 130, 246, 0.3)",
      "--transition-speed": "0.15s ease-in-out",
    },
  },
  jeju_volcanic_coast: {
    name: "Jeju Volcanic Coast",
    colors: {
      "--primary-bg": "#1F2228", // Dark volcanic rock grey
      "--secondary-bg": "#121418", // Near-black lava flow
      "--ui-panel-bg": "#2F353D", // Lighter charcoal rock panel
      "--button-bg": "#5A6578", // Muted slate grey
      "--button-hover-bg": "#6E7A8E",
      "--button-active-bg": "#4A525E",
      "--button-text": "#F7FAFC",
      "--primary-text": "#F7FAFC", // White foam on waves
      "--secondary-text": "#E2E8F0",
      "--accent-color": "#22D3EE", // Bright, clear ocean cyan
      "--accent-text": "#1F2228", // Dark text on bright accent
      "--rgb-accent-color": hexToRgbString("#22D3EE"),
      "--highlight-bg": "rgba(34, 211, 238, 0.15)",
      "--border-color": "#3D4552",
      "--accent-border-color": "#22D3EE",
      "--error-text": "#FCA5A5", // A lighter red for dark bg
      "--success-text": "#A7F3D0",
      "--disabled-bg": "#2F353D",
      "--disabled-text": "#718096",
      "--button-action-bg": "#22D3EE",
      "--button-action-hover-bg": "#32E3FE",
      "--button-action-text": "#1F2228",
      "--button-delete-bg": "#C53030", // Strong, clear red
      "--button-delete-hover-bg": "#E53E3E",
      "--button-delete-text": "#F7FAFC",
      "--input-bg": "#121418",
      "--input-text": "#F7FAFC",
      "--input-placeholder-text": "#94A3B8",
      "--progress-track-bg": "#2F353D",
      "--map-background-color": "#121418",
      "--map-region-default-fill": "#2F353D",
      "--map-region-border": "#1F2228",
      "--map-region-hover-fill": "#22D3EE",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMontserrat,
    },
    styles: {
      "--panel-shadow": "0 8px 25px rgba(0,0,0,0.45)",
      "--button-shadow": "0 2px 8px rgba(0,0,0,0.25)",
      "--element-radius": "4px",
      "--border-width": "1px",
      "--focus-ring-color": "#22D3EE",
      "--progress-value-color": "#5A6578",
      "--checkbox-accent-color": "#22D3EE",
      "--input-focus-shadow-color": "rgba(34, 211, 238, 0.4)",
      "--transition-speed": "0.15s ease-in-out",
    },
  },
  dancheong_splendor: {
    name: "Dancheong Splendor",
    colors: {
      "--primary-bg": "#1A1A1A", // Deep black (wood base)
      "--secondary-bg": "#0D0D0D", // Even darker black
      "--ui-panel-bg": "#2A2A2A", // Dark grey panel
      "--button-bg": "#007BFF", // Bright blue (common Dancheong color)
      "--button-hover-bg": "#0056B3",
      "--button-active-bg": "#004080",
      "--button-text": "#FFFFFF",
      "--primary-text": "#F0F0F0", // White highlights
      "--secondary-text": "#B0B0B0",
      "--accent-color": "#FFC107", // Bright gold (detail work)
      "--accent-text": "#1A1A1A", // Dark text on gold
      "--rgb-accent-color": hexToRgbString("#FFC107"),
      "--highlight-bg": "rgba(255, 193, 7, 0.15)",
      "--border-color": "#3A3A3A",
      "--accent-border-color": "#FFC107",
      "--error-text": "#DC3545",
      "--success-text": "#28A745",
      "--disabled-bg": "#2A2A2A",
      "--disabled-text": "#7A7A7A",
      "--button-action-bg": "#FFC107",
      "--button-action-hover-bg": "#E0A300",
      "--button-action-text": "#1A1A1A",
      "--button-delete-bg": "#DC3545",
      "--button-delete-hover-bg": "#C82333",
      "--button-delete-text": "#FFFFFF",
      "--input-bg": "#0D0D0D",
      "--input-text": "#F0F0F0",
      "--input-placeholder-text": "#8A8A8A",
      "--progress-track-bg": "#2A2A2A",
      "--map-background-color": "#0D0D0D",
      "--map-region-default-fill": "#2A2A2A",
      "--map-region-border": "#1A1A1A",
      "--map-region-hover-fill": "#007BFF",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMontserrat,
    },
    styles: {
      "--panel-shadow": "0 5px 15px rgba(0,0,0,0.5)",
      "--button-shadow": "0 2px 4px rgba(0,0,0,0.25)",
      "--element-radius": "3px",
      "--border-width": "1px",
      "--focus-ring-color": "#FFC107",
      "--progress-value-color": "#007BFF",
      "--checkbox-accent-color": "#FFC107",
      "--input-focus-shadow-color": "rgba(255, 193, 7, 0.35)",
      "--transition-speed": "0.15s ease",
    },
  },
  jade_dynasty: {
    name: "Jade Dynasty",
    colors: {
      "--primary-bg": "#F8FBF8", // Very light, serene green-white
      "--secondary-bg": "#EBF2EB", // Pale, soft jade green
      "--ui-panel-bg": "#FFFFFF",
      "--button-bg": "#4A7A6A", // Muted deep jade green
      "--button-hover-bg": "#5A8A7A",
      "--button-active-bg": "#3A6A5A",
      "--button-text": "#FFFFFF",
      "--primary-text": "#2C3A3A", // Dark, sophisticated charcoal green
      "--secondary-text": "#6A7A7A",
      "--accent-color": "#B89D6B", // Soft antique gold/brass
      "--accent-text": "#2C3A3A", // Dark text on accent
      "--rgb-accent-color": hexToRgbString("#B89D6B"),
      "--highlight-bg": "rgba(184, 157, 107, 0.15)",
      "--border-color": "#D1DCD1",
      "--accent-border-color": "#B89D6B",
      "--error-text": "#D9534F",
      "--success-text": "#5CB85C",
      "--disabled-bg": "#E0E0E0",
      "--disabled-text": "#A0A0A0",
      "--button-action-bg": "#4A7A6A", // Primary action in jade
      "--button-action-hover-bg": "#3A6A5A",
      "--button-action-text": "#FFFFFF",
      "--button-delete-bg": "#7A5A4A", // A grounding earth tone for delete
      "--button-delete-hover-bg": "#6A4A3A",
      "--button-delete-text": "#FFFFFF",
      "--input-bg": "#F8FBF8",
      "--input-text": "#2C3A3A",
      "--input-placeholder-text": "#A0A0A0",
      "--progress-track-bg": "#EBF2EB",
      "--map-background-color": "#EBF2EB",
      "--map-region-default-fill": "#B0C4B0",
      "--map-region-border": "#FFFFFF",
      "--map-region-hover-fill": "rgba(184, 157, 107, 0.4)",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMerriweather,
    },
    styles: {
      "--panel-shadow": "0 1px 4px rgba(0,0,0,0.07)",
      "--button-shadow": "0 1px 2px rgba(0,0,0,0.05)",
      "--element-radius": "5px",
      "--border-width": "1px",
      "--focus-ring-color": "#B89D6B",
      "--progress-value-color": "#4A7A6A",
      "--checkbox-accent-color": "#B89D6B",
      "--input-focus-shadow-color": "rgba(184, 157, 107, 0.3)",
      "--transition-speed": "0.15s ease-in-out",
    },
  },
  bukhansan_summit: {
    name: "Bukhansan Summit",
    colors: {
      "--primary-bg": "#F0F5F8", // Light sky blue-grey (clear mountain sky)
      "--secondary-bg": "#E0E5E8", // Muted light grey (granite)
      "--ui-panel-bg": "#FFFFFF",
      "--button-bg": "#4A5A6A", // Muted slate blue-grey (mountain rock)
      "--button-hover-bg": "#5A6A7A",
      "--button-active-bg": "#3A4A5A",
      "--button-text": "#FFFFFF",
      "--primary-text": "#2C3A4A", // Dark charcoal grey
      "--secondary-text": "#6A7A8A",
      "--accent-color": "#2ECC71", // Vibrant forest green (pine trees)
      "--accent-text": "#FFFFFF",
      "--rgb-accent-color": hexToRgbString("#2ECC71"),
      "--highlight-bg": "rgba(46, 204, 113, 0.15)",
      "--border-color": "#D1D5DB",
      "--accent-border-color": "#2ECC71",
      "--error-text": "#D9534F",
      "--success-text": "#4A9A4A",
      "--disabled-bg": "#E0E0E0",
      "--disabled-text": "#A0A0A0",
      "--button-action-bg": "#2ECC71",
      "--button-action-hover-bg": "#22B060",
      "--button-action-text": "#FFFFFF",
      "--button-delete-bg": "#4A5A6A",
      "--button-delete-hover-bg": "#3A4A5A",
      "--button-delete-text": "#FFFFFF",
      "--input-bg": "#FFFFFF",
      "--input-text": "#2C3A4A",
      "--input-placeholder-text": "#A0A0A0",
      "--progress-track-bg": "#E0E5E8",
      "--map-background-color": "#E0E5E8",
      "--map-region-default-fill": "#B0C4D1",
      "--map-region-border": "#FFFFFF",
      "--map-region-hover-fill": "rgba(46, 204, 113, 0.4)",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMontserrat,
    },
    styles: {
      "--panel-shadow": "0 1px 4px rgba(0,0,0,0.07)",
      "--button-shadow": "0 1px 2px rgba(0,0,0,0.05)",
      "--element-radius": "4px",
      "--border-width": "1px",
      "--focus-ring-color": "#2ECC71",
      "--progress-value-color": "#4A5A6A",
      "--checkbox-accent-color": "#2ECC71",
      "--input-focus-shadow-color": "rgba(46, 204, 113, 0.3)",
      "--transition-speed": "0.15s ease-in-out",
    },
  },
  chuseok_harvest: {
    name: "Chuseok Harvest",
    colors: {
      "--primary-bg": "#FFF8EC", // Warm, pale yellow (ripe grains, moonlight)
      "--secondary-bg": "#FFEED6", // Muted golden beige
      "--ui-panel-bg": "#FFFFFF",
      "--button-bg": "#A06A3A", // Rich, deep harvest brown
      "--button-hover-bg": "#B87A4A",
      "--button-active-bg": "#8A5A2A",
      "--button-text": "#FFFFFF",
      "--primary-text": "#3A2A1E", // Dark earthy brown
      "--secondary-text": "#7A6A5A",
      "--accent-color": "#FF8C42", // Vibrant burnt orange (autumn leaves, persimmons)
      "--accent-text": "#FFFFFF",
      "--rgb-accent-color": hexToRgbString("#FF8C42"),
      "--highlight-bg": "rgba(255, 140, 66, 0.15)",
      "--border-color": "#D1C3B8",
      "--accent-border-color": "#FF8C42",
      "--error-text": "#D9534F",
      "--success-text": "#5CB85C",
      "--disabled-bg": "#E0E0E0",
      "--disabled-text": "#A0A0A0",
      "--button-action-bg": "#FF8C42",
      "--button-action-hover-bg": "#FF7A30",
      "--button-action-text": "#FFFFFF",
      "--button-delete-bg": "#A06A3A",
      "--button-delete-hover-bg": "#8A5A2A",
      "--button-delete-text": "#FFFFFF",
      "--input-bg": "#FFF8EC",
      "--input-text": "#3A2A1E",
      "--input-placeholder-text": "#A0A0A0",
      "--progress-track-bg": "#FFEED6",
      "--map-background-color": "#FFEED6",
      "--map-region-default-fill": "#B0A59A",
      "--map-region-border": "#FFFFFF",
      "--map-region-hover-fill": "rgba(255, 140, 66, 0.4)",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMerriweather,
    },
    styles: {
      "--panel-shadow": "0 1px 4px rgba(0,0,0,0.07)",
      "--button-shadow": "0 1px 2px rgba(0,0,0,0.05)",
      "--element-radius": "6px",
      "--border-width": "1px",
      "--focus-ring-color": "#FF8C42",
      "--progress-value-color": "#A06A3A",
      "--checkbox-accent-color": "#FF8C42",
      "--input-focus-shadow-color": "rgba(255, 140, 66, 0.3)",
      "--transition-speed": "0.15s ease-in-out",
    },
  },
  rhine_valley_night: {
    name: "Rhine Valley Night",
    colors: {
      "--primary-bg": "#1C243B", // Deep, cool dark blue
      "--secondary-bg": "#12182D", // Near-black navy
      "--ui-panel-bg": "#2B354C", // Muted dark blue-grey panel
      "--button-bg": "#5A6A8C", // Muted slate blue
      "--button-hover-bg": "#6B7BA0",
      "--button-active-bg": "#4A5B7D",
      "--button-text": "#F0F5F8",
      "--primary-text": "#F0F5F8", // Pale moonlight
      "--secondary-text": "#A0B0C0",
      "--accent-color": "#7B6F9A", // Muted, deep lavender (twilight sky, distant lights)
      "--accent-text": "#F0F5F8", // Light text on accent
      "--rgb-accent-color": hexToRgbString("#7B6F9A"),
      "--highlight-bg": "rgba(123, 111, 154, 0.15)",
      "--border-color": "#3B455C",
      "--accent-border-color": "#7B6F9A",
      "--error-text": "#D9534F",
      "--success-text": "#5CB85C",
      "--disabled-bg": "#2B354C",
      "--disabled-text": "#7A8595",
      "--button-action-bg": "#7B6F9A",
      "--button-action-hover-bg": "#6A5E8A",
      "--button-action-text": "#F0F5F8",
      "--button-delete-bg": "#8A3B4B", // Deep berry red for delete
      "--button-delete-hover-bg": "#7A2B3B",
      "--button-delete-text": "#F0F5F8",
      "--input-bg": "#12182D",
      "--input-text": "#F0F5F8",
      "--input-placeholder-text": "#94A3B8",
      "--progress-track-bg": "#2B354C",
      "--map-background-color": "#12182D",
      "--map-region-default-fill": "#2B354C",
      "--map-region-border": "#1C243B",
      "--map-region-hover-fill": "#7B6F9A",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMerriweather,
    },
    styles: {
      "--panel-shadow": "0 6px 20px rgba(0,0,0,0.45)",
      "--button-shadow": "0 2px 8px rgba(0,0,0,0.25)",
      "--element-radius": "5px",
      "--border-width": "1px",
      "--focus-ring-color": "#7B6F9A",
      "--progress-value-color": "#5A6A8C",
      "--checkbox-accent-color": "#7B6F9A",
      "--input-focus-shadow-color": "rgba(123, 111, 154, 0.4)",
      "--transition-speed": "0.15s ease-in-out",
    },
  },
  monsoon_night: {
    name: "Monsoon Night",
    colors: {
      "--primary-bg": "#1A1010", // Very deep red-black (monsoon clouds)
      "--secondary-bg": "#0D0808", // Near-black, heavier atmosphere
      "--ui-panel-bg": "#2A1A1A", // Dark, rich crimson panel
      "--button-bg": "#8A3A3A", // Muted deep red
      "--button-hover-bg": "#A34A4A",
      "--button-active-bg": "#702A2A",
      "--button-text": "#F5F0EB",
      "--primary-text": "#F5F0EB", // Warm off-white (distant lights)
      "--secondary-text": "#D4C7C7",
      "--accent-color": "#FFD700", // Bright, glowing gold (festive lights)
      "--accent-text": "#2A1A1A", // Dark text on gold
      "--rgb-accent-color": hexToRgbString("#FFD700"),
      "--highlight-bg": "rgba(255, 215, 0, 0.15)",
      "--border-color": "#4A3A3A",
      "--accent-border-color": "#FFD700",
      "--error-text": "#F472B6", // A vibrant pink for contrast
      "--success-text": "#86EFAC",
      "--disabled-bg": "#2A1A1A",
      "--disabled-text": "#7A6B6B",
      "--button-action-bg": "#FFD700",
      "--button-action-hover-bg": "#E0A300",
      "--button-action-text": "#2A1A1A",
      "--button-delete-bg": "#A34A4A",
      "--button-delete-hover-bg": "#8A3A3A",
      "--button-delete-text": "#F5F0EB",
      "--input-bg": "#0D0808",
      "--input-text": "#F5F0EB",
      "--input-placeholder-text": "#A09090",
      "--progress-track-bg": "#2A1A1A",
      "--map-background-color": "#0D0808",
      "--map-region-default-fill": "#2A1A1A",
      "--map-region-border": "#1A1010",
      "--map-region-hover-fill": "#FFD700",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMontserrat,
    },
    styles: {
      "--panel-shadow": "0 6px 18px rgba(0,0,0,0.5)",
      "--button-shadow": "0 2px 5px rgba(0,0,0,0.25)",
      "--element-radius": "6px",
      "--border-width": "1px",
      "--focus-ring-color": "#FFD700",
      "--progress-value-color": "#8A3A3A",
      "--checkbox-accent-color": "#FFD700",
      "--input-focus-shadow-color": "rgba(255, 215, 0, 0.35)",
      "--transition-speed": "0.15s ease",
    },
  },
  paris_metro_noir: {
    name: "Paris Metro Noir",
    colors: {
      "--primary-bg": "#1A1A1A", // Deep black (metro tunnels)
      "--secondary-bg": "#0D0D0D", // Near-black (shadows)
      "--ui-panel-bg": "#2A2A2A", // Dark charcoal panel
      "--button-bg": "#3A4A4A", // Muted dark green-grey (metalwork)
      "--button-hover-bg": "#4A5A5A",
      "--button-active-bg": "#2A3A3A",
      "--button-text": "#F0F0F0",
      "--primary-text": "#F0F0F0", // Clean white
      "--secondary-text": "#B0B0B0",
      "--accent-color": "#D4AF37", // Muted brassy gold (art deco accents)
      "--accent-text": "#1A1A1A", // Dark text on gold
      "--rgb-accent-color": hexToRgbString("#D4AF37"),
      "--highlight-bg": "rgba(212, 175, 55, 0.15)",
      "--border-color": "#3A3A3A",
      "--accent-border-color": "#D4AF37",
      "--error-text": "#D9534F",
      "--success-text": "#5CB85C",
      "--disabled-bg": "#2A2A2A",
      "--disabled-text": "#7A7A7A",
      "--button-action-bg": "#D4AF37",
      "--button-action-hover-bg": "#B89A27",
      "--button-action-text": "#1A1A1A",
      "--button-delete-bg": "#D9534F",
      "--button-delete-hover-bg": "#B0403C",
      "--button-delete-text": "#FFFFFF",
      "--input-bg": "#0D0D0D",
      "--input-text": "#F0F0F0",
      "--input-placeholder-text": "#8A8A8A",
      "--progress-track-bg": "#2A2A2A",
      "--map-background-color": "#0D0D0D",
      "--map-region-default-fill": "#2A2A2A",
      "--map-region-border": "#1A1A1A",
      "--map-region-hover-fill": "rgba(212, 175, 55, 0.4)",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMontserrat,
    },
    styles: {
      "--panel-shadow": "0 5px 15px rgba(0,0,0,0.5)",
      "--button-shadow": "0 2px 4px rgba(0,0,0,0.25)",
      "--element-radius": "4px",
      "--border-width": "1px",
      "--focus-ring-color": "#D4AF37",
      "--progress-value-color": "#3A4A4A",
      "--checkbox-accent-color": "#D4AF37",
      "--input-focus-shadow-color": "rgba(212, 175, 55, 0.35)",
      "--transition-speed": "0.15s ease",
    },
  },
  westminster_night: {
    name: "Westminster Night",
    colors: {
      "--primary-bg": "#1E293B", // Dark slate blue (parliament stone at night)
      "--secondary-bg": "#111827", // Deeper dark blue
      "--ui-panel-bg": "#2A354A", // Muted dark blue-grey panel
      "--button-bg": "#4A5568", // Muted dark blue-grey
      "--button-hover-bg": "#5A6578",
      "--button-active-bg": "#3A4558",
      "--button-text": "#F7FAFC",
      "--primary-text": "#F7FAFC", // Crisp white (illuminated details)
      "--secondary-text": "#E2E8F0",
      "--accent-color": "#D4AF37", // Muted gold (traditional lighting)
      "--accent-text": "#1E293B", // Dark text on gold
      "--rgb-accent-color": hexToRgbString("#D4AF37"),
      "--highlight-bg": "rgba(212, 175, 55, 0.15)",
      "--border-color": "#3D485C",
      "--accent-border-color": "#D4AF37",
      "--error-text": "#FCA5A5",
      "--success-text": "#A7F3D0",
      "--disabled-bg": "#2A354A",
      "--disabled-text": "#718096",
      "--button-action-bg": "#D4AF37",
      "--button-action-hover-bg": "#B89A27",
      "--button-action-text": "#1E293B",
      "--button-delete-bg": "#C53030", // Strong red for emphasis
      "--button-delete-hover-bg": "#E53E3E",
      "--button-delete-text": "#F7FAFC",
      "--input-bg": "#111827",
      "--input-text": "#F7FAFC",
      "--input-placeholder-text": "#94A3B8",
      "--progress-track-bg": "#2A354A",
      "--map-background-color": "#111827",
      "--map-region-default-fill": "#2A354A",
      "--map-region-border": "#1E293B",
      "--map-region-hover-fill": "#D4AF37",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMerriweather,
    },
    styles: {
      "--panel-shadow": "0 6px 18px rgba(0,0,0,0.5)",
      "--button-shadow": "0 2px 5px rgba(0,0,0,0.25)",
      "--element-radius": "4px",
      "--border-width": "1px",
      "--focus-ring-color": "#D4AF37",
      "--progress-value-color": "#4A5568",
      "--checkbox-accent-color": "#D4AF37",
      "--input-focus-shadow-color": "rgba(212, 175, 55, 0.35)",
      "--transition-speed": "0.15s ease",
    },
  },
  iberian_nights: {
    name: "Iberian Nights",
    colors: {
      "--primary-bg": "#1A101A", // Very deep, dark violet-black
      "--secondary-bg": "#0D080D", // Near-black
      "--ui-panel-bg": "#2A1A2A", // Dark, rich plum panel
      "--button-bg": "#7A3A6A", // Muted magenta-purple
      "--button-hover-bg": "#9A4A8A",
      "--button-active-bg": "#6A2A5A",
      "--button-text": "#F5F0F5",
      "--primary-text": "#F5F0F5", // Pale moonlight
      "--secondary-text": "#D4C7D4",
      "--accent-color": "#FF6B6B", // Vibrant, passionate red (flamenco, fire)
      "--accent-text": "#FFFFFF",
      "--rgb-accent-color": hexToRgbString("#FF6B6B"),
      "--highlight-bg": "rgba(255, 107, 107, 0.15)",
      "--border-color": "#4A3A4A",
      "--accent-border-color": "#FF6B6B",
      "--error-text": "#F472B6",
      "--success-text": "#86EFAC",
      "--disabled-bg": "#2A1A2A",
      "--disabled-text": "#7A6B7A",
      "--button-action-bg": "#FF6B6B",
      "--button-action-hover-bg": "#FF8B8B",
      "--button-action-text": "#FFFFFF",
      "--button-delete-bg": "#7A3A6A",
      "--button-delete-hover-bg": "#6A2A5A",
      "--button-delete-text": "#F5F0F5",
      "--input-bg": "#0D080D",
      "--input-text": "#F5F0F5",
      "--input-placeholder-text": "#A090A0",
      "--progress-track-bg": "#2A1A2A",
      "--map-background-color": "#0D080D",
      "--map-region-default-fill": "#2A1A2A",
      "--map-region-border": "#1A101A",
      "--map-region-hover-fill": "#FF6B6B",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMerriweather,
    },
    styles: {
      "--panel-shadow": "0 6px 18px rgba(0,0,0,0.5)",
      "--button-shadow": "0 2px 5px rgba(0,0,0,0.25)",
      "--element-radius": "5px",
      "--border-width": "1px",
      "--focus-ring-color": "#FF6B6B",
      "--progress-value-color": "#7A3A6A",
      "--checkbox-accent-color": "#FF6B6B",
      "--input-focus-shadow-color": "rgba(255, 107, 107, 0.35)",
      "--transition-speed": "0.15s ease",
    },
  },
  amazonian_twilight: {
    name: "Amazonian Twilight",
    colors: {
      "--primary-bg": "#1A2A1A", // Very deep dark forest green
      "--secondary-bg": "#0D1A0D", // Near-black forest floor
      "--ui-panel-bg": "#2A3A2A", // Muted dark green panel
      "--button-bg": "#5A7A5A", // Muted deep green
      "--button-hover-bg": "#6A8A6A",
      "--button-active-bg": "#4A6A4A",
      "--button-text": "#F5F5F0",
      "--primary-text": "#F5F5F0", // Pale, misty light
      "--secondary-text": "#D4D4D0",
      "--accent-color": "#FF7F50", // Vibrant coral orange (tropical flowers, birds)
      "--accent-text": "#1A2A1A", // Dark text on accent
      "--rgb-accent-color": hexToRgbString("#FF7F50"),
      "--highlight-bg": "rgba(255, 127, 80, 0.15)",
      "--border-color": "#3A4A3A",
      "--accent-border-color": "#FF7F50",
      "--error-text": "#F472B6",
      "--success-text": "#86EFAC",
      "--disabled-bg": "#2A3A2A",
      "--disabled-text": "#7A7A7A",
      "--button-action-bg": "#FF7F50",
      "--button-action-hover-bg": "#FF9F70",
      "--button-action-text": "#1A2A1A",
      "--button-delete-bg": "#5A7A5A",
      "--button-delete-hover-bg": "#4A6A4A",
      "--button-delete-text": "#F5F5F0",
      "--input-bg": "#0D1A0D",
      "--input-text": "#F5F5F0",
      "--input-placeholder-text": "#A0A0A0",
      "--progress-track-bg": "#2A3A2A",
      "--map-background-color": "#0D1A0D",
      "--map-region-default-fill": "#2A3A2A",
      "--map-region-border": "#1A2A1A",
      "--map-region-hover-fill": "#FF7F50",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMontserrat,
    },
    styles: {
      "--panel-shadow": "0 6px 18px rgba(0,0,0,0.5)",
      "--button-shadow": "0 2px 5px rgba(0,0,0,0.25)",
      "--element-radius": "6px",
      "--border-width": "1px",
      "--focus-ring-color": "#FF7F50",
      "--progress-value-color": "#5A7A5A",
      "--checkbox-accent-color": "#FF7F50",
      "--input-focus-shadow-color": "rgba(255, 127, 80, 0.35)",
      "--transition-speed": "0.15s ease",
    },
  },
  capitol_night: {
    name: "Capitol Night",
    colors: {
      "--primary-bg": "#1C243B", // Deep, dark blue-grey (night sky over Capitol)
      "--secondary-bg": "#12182D", // Near-black navy
      "--ui-panel-bg": "#2B354C", // Muted dark blue-grey (stone) panel
      "--button-bg": "#4A5568", // Muted dark blue-grey
      "--button-hover-bg": "#5A6578",
      "--button-active-bg": "#3A4558",
      "--button-text": "#F7FAFC",
      "--primary-text": "#F7FAFC", // Crisp white (Capitol dome)
      "--secondary-text": "#E2E8F0",
      "--accent-color": "#FFD700", // Bright gold (illuminated details)
      "--accent-text": "#1C243B", // Dark text on accent
      "--rgb-accent-color": hexToRgbString("#FFD700"),
      "--highlight-bg": "rgba(255, 215, 0, 0.15)",
      "--border-color": "#3D485C",
      "--accent-border-color": "#FFD700",
      "--error-text": "#EF4444",
      "--success-text": "#34D399",
      "--disabled-bg": "#2B354C",
      "--disabled-text": "#718096",
      "--button-action-bg": "#FFD700",
      "--button-action-hover-bg": "#E0A300",
      "--button-action-text": "#1C243B",
      "--button-delete-bg": "#C53030", // Strong red for contrast
      "--button-delete-hover-bg": "#E53E3E",
      "--button-delete-text": "#F7FAFC",
      "--input-bg": "#12182D",
      "--input-text": "#F7FAFC",
      "--input-placeholder-text": "#94A3B8",
      "--progress-track-bg": "#2B354C",
      "--map-background-color": "#12182D",
      "--map-region-default-fill": "#2B354C",
      "--map-region-border": "#1C243B",
      "--map-region-hover-fill": "#FFD700",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMerriweather,
    },
    styles: {
      "--panel-shadow": "0 8px 25px rgba(0,0,0,0.5)",
      "--button-shadow": "0 2px 8px rgba(0,0,0,0.3)",
      "--element-radius": "4px",
      "--border-width": "1px",
      "--focus-ring-color": "#FFD700",
      "--progress-value-color": "#4A5568",
      "--checkbox-accent-color": "#FFD700",
      "--input-focus-shadow-color": "rgba(255, 215, 0, 0.4)",
      "--transition-speed": "0.15s ease-in-out",
    },
  },
  bohemian_garnet: {
    name: "Bohemian Garnet",
    colors: {
      "--primary-bg": "#2A1A1A", // Deep, dark red-brown (aged stone)
      "--secondary-bg": "#1C0D0D", // Near-black, very deep red
      "--ui-panel-bg": "#3A2A2A", // Richer dark red-brown panel
      "--button-bg": "#8B2A2A", // Deep crimson red (garnet)
      "--button-hover-bg": "#A33B3B",
      "--button-active-bg": "#701F1F",
      "--button-text": "#F5EFEB",
      "--primary-text": "#F5EFEB", // Warm off-white (illumination)
      "--secondary-text": "#D4C7C7",
      "--accent-color": "#FFD700", // Bright, pure gold (historical ornamentation)
      "--accent-text": "#2A1A1A", // Dark text on bright accent
      "--rgb-accent-color": hexToRgbString("#FFD700"),
      "--highlight-bg": "rgba(255, 215, 0, 0.15)",
      "--border-color": "#4A3A3A",
      "--accent-border-color": "#FFD700",
      "--error-text": "#F472B6", // A contrasting vivid pink
      "--success-text": "#86EFAC",
      "--disabled-bg": "#2A1A1A",
      "--disabled-text": "#7A6B6B",
      "--button-action-bg": "#FFD700", // Gold for primary actions
      "--button-action-hover-bg": "#E0A300",
      "--button-action-text": "#2A1A1A",
      "--button-delete-bg": "#8B2A2A",
      "--button-delete-hover-bg": "#701F1F",
      "--button-delete-text": "#F5EFEB",
      "--input-bg": "#1C0D0D",
      "--input-text": "#F5EFEB",
      "--input-placeholder-text": "#A09090",
      "--progress-track-bg": "#3A2A2A",
      "--map-background-color": "#1C0D0D",
      "--map-region-default-fill": "#3A2A2A",
      "--map-region-border": "#2A1A1A",
      "--map-region-hover-fill": "#FFD700",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMerriweather,
    },
    styles: {
      "--panel-shadow": "0 6px 18px rgba(0,0,0,0.5)",
      "--button-shadow": "0 2px 5px rgba(0,0,0,0.25)",
      "--element-radius": "5px",
      "--border-width": "1px",
      "--focus-ring-color": "#FFD700",
      "--progress-value-color": "#8B2A2A",
      "--checkbox-accent-color": "#FFD700",
      "--input-focus-shadow-color": "rgba(255, 215, 0, 0.35)",
      "--transition-speed": "0.15s ease",
    },
  },
  danube_nights: {
    name: "Danube Nights",
    colors: {
      "--primary-bg": "#1A1E3A", // Deep royal blue (river at night)
      "--secondary-bg": "#10132B", // Darker navy
      "--ui-panel-bg": "#2B3050", // Muted dark blue panel
      "--button-bg": "#5A6A8A", // Muted slate blue
      "--button-hover-bg": "#6B7BB0",
      "--button-active-bg": "#4A5B7A",
      "--button-text": "#F0F5F8",
      "--primary-text": "#F0F5F8", // Pale, cool white (reflected lights)
      "--secondary-text": "#D0D5E0",
      "--accent-color": "#FFD700", // Bright gold/amber (bridge lights, chandeliers)
      "--accent-text": "#1A1E3A", // Dark text on bright accent
      "--rgb-accent-color": hexToRgbString("#FFD700"),
      "--highlight-bg": "rgba(255, 215, 0, 0.15)",
      "--border-color": "#3B4060",
      "--accent-border-color": "#FFD700",
      "--error-text": "#D9534F",
      "--success-text": "#5CB85C",
      "--disabled-bg": "#2B3050",
      "--disabled-text": "#7A8595",
      "--button-action-bg": "#FFD700",
      "--button-action-hover-bg": "#E0A300",
      "--button-action-text": "#1A1E3A",
      "--button-delete-bg": "#A33B4B", // A deeper, contrasting red
      "--button-delete-hover-bg": "#8A2A3A",
      "--button-delete-text": "#F0F5F8",
      "--input-bg": "#10132B",
      "--input-text": "#F0F5F8",
      "--input-placeholder-text": "#94A3B8",
      "--progress-track-bg": "#2B3050",
      "--map-background-color": "#10132B",
      "--map-region-default-fill": "#2B3050",
      "--map-region-border": "#1A1E3A",
      "--map-region-hover-fill": "#FFD700",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMontserrat,
    },
    styles: {
      "--panel-shadow": "0 6px 18px rgba(0,0,0,0.45)",
      "--button-shadow": "0 2px 8px rgba(0,0,0,0.25)",
      "--element-radius": "5px",
      "--border-width": "1px",
      "--focus-ring-color": "#FFD700",
      "--progress-value-color": "#5A6A8A",
      "--checkbox-accent-color": "#FFD700",
      "--input-focus-shadow-color": "rgba(255, 215, 0, 0.4)",
      "--transition-speed": "0.15s ease-in-out",
    },
  },
  carpathian_mystique: {
    name: "Carpathian Mystique",
    colors: {
      "--primary-bg": "#1C241C", // Very deep, dark forest green
      "--secondary-bg": "#101810", // Near-black, deep forest floor
      "--ui-panel-bg": "#2B352B", // Muted dark green panel
      "--button-bg": "#5A6A5A", // Muted deep olive green
      "--button-hover-bg": "#6B7B6B",
      "--button-active-bg": "#4A5B4A",
      "--button-text": "#F5F5F0",
      "--primary-text": "#F5F5F0", // Pale, misty light (fog over mountains)
      "--secondary-text": "#D0D0CB",
      "--accent-color": "#D44C4C", // Rich, rustic red (berries, subtle folk art)
      "--accent-text": "#FFFFFF",
      "--rgb-accent-color": hexToRgbString("#D44C4C"),
      "--highlight-bg": "rgba(212, 76, 76, 0.15)",
      "--border-color": "#3B453B",
      "--accent-border-color": "#D44C4C",
      "--error-text": "#D9534F",
      "--success-text": "#5CB85C",
      "--disabled-bg": "#2B352B",
      "--disabled-text": "#7A857A",
      "--button-action-bg": "#D44C4C",
      "--button-action-hover-bg": "#B03B3B",
      "--button-action-text": "#FFFFFF",
      "--button-delete-bg": "#5A6A5A",
      "--button-delete-hover-bg": "#4A5B4A",
      "--button-delete-text": "#F5F5F0",
      "--input-bg": "#101810",
      "--input-text": "#F5F5F0",
      "--input-placeholder-text": "#94A394",
      "--progress-track-bg": "#2B352B",
      "--map-background-color": "#101810",
      "--map-region-default-fill": "#2B352B",
      "--map-region-border": "#1C241C",
      "--map-region-hover-fill": "#D44C4C",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMerriweather,
    },
    styles: {
      "--panel-shadow": "0 6px 18px rgba(0,0,0,0.5)",
      "--button-shadow": "0 2px 8px rgba(0,0,0,0.25)",
      "--element-radius": "6px",
      "--border-width": "1px",
      "--focus-ring-color": "#D44C4C",
      "--progress-value-color": "#5A6A5A",
      "--checkbox-accent-color": "#D44C4C",
      "--input-focus-shadow-color": "rgba(212, 76, 76, 0.4)",
      "--transition-speed": "0.15s ease",
    },
  },
  balkan_rose: {
    name: "Balkan Rose",
    colors: {
      "--primary-bg": "#2A1A2A", // Deep, dark violet (twilight over rose fields)
      "--secondary-bg": "#1D111D", // Near-black, deeper violet
      "--ui-panel-bg": "#3A2A3A", // Muted dark purple panel
      "--button-bg": "#7A3A6A", // Muted plum/mulberry
      "--button-hover-bg": "#9A4A8A",
      "--button-active-bg": "#6A2A5A",
      "--button-text": "#F5F0F5",
      "--primary-text": "#F5F0F5", // Pale, soft white
      "--secondary-text": "#D4C7D4",
      "--accent-color": "#EC407A", // Vibrant deep rose/fuchsia
      "--accent-text": "#FFFFFF",
      "--rgb-accent-color": hexToRgbString("#EC407A"),
      "--highlight-bg": "rgba(236, 64, 122, 0.15)",
      "--border-color": "#4A3A4A",
      "--accent-border-color": "#EC407A",
      "--error-text": "#D9534F",
      "--success-text": "#5CB85C",
      "--disabled-bg": "#3A2A3A",
      "--disabled-text": "#A0A0A0",
      "--button-action-bg": "#EC407A",
      "--button-action-hover-bg": "#D81B60",
      "--button-action-text": "#FFFFFF",
      "--button-delete-bg": "#7A3A6A",
      "--button-delete-hover-bg": "#6A2A5A",
      "--button-delete-text": "#F5F0F5",
      "--input-bg": "#1D111D",
      "--input-text": "#F5F0F5",
      "--input-placeholder-text": "#94A394",
      "--progress-track-bg": "#3A2A3A",
      "--map-background-color": "#1D111D",
      "--map-region-default-fill": "#3A2A3A",
      "--map-region-border": "#2A1A2A",
      "--map-region-hover-fill": "#EC407A",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMerriweather,
    },
    styles: {
      "--panel-shadow": "0 6px 18px rgba(0,0,0,0.5)",
      "--button-shadow": "0 2px 8px rgba(0,0,0,0.25)",
      "--element-radius": "6px",
      "--border-width": "1px",
      "--focus-ring-color": "#EC407A",
      "--progress-value-color": "#7A3A6A",
      "--checkbox-accent-color": "#EC407A",
      "--input-focus-shadow-color": "rgba(236, 64, 122, 0.4)",
      "--transition-speed": "0.15s ease",
    },
  },
  aegean_depths: {
    name: "Aegean Depths",
    colors: {
      "--primary-bg": "#0D1A2A", // Deep, dark blue (Aegean Sea at night)
      "--secondary-bg": "#07101A", // Near-black, deepest blue
      "--ui-panel-bg": "#1A2A3A", // Muted dark blue-grey panel
      "--button-bg": "#3A5A6A", // Muted dark teal (seaweed, shadows)
      "--button-hover-bg": "#4A6A7A",
      "--button-active-bg": "#2A4A5A",
      "--button-text": "#F0F5F8",
      "--primary-text": "#F0F5F8", // Pale moonlight on water
      "--secondary-text": "#D0D5E0",
      "--accent-color": "#FFC107", // Warm, glowing gold (ancient treasures, stars)
      "--accent-text": "#FFFFFF",
      "--rgb-accent-color": hexToRgbString("#FFC107"),
      "--highlight-bg": "rgba(255, 193, 7, 0.15)",
      "--border-color": "#2A3A4A",
      "--accent-border-color": "#FFC107",
      "--error-text": "#D9534F",
      "--success-text": "#5CB85C",
      "--disabled-bg": "#1A2A3A",
      "--disabled-text": "#7A8595",
      "--button-action-bg": "#FFC107",
      "--button-action-hover-bg": "#E0A300",
      "--button-action-text": "#FFFFFF",
      "--button-delete-bg": "#3A5A6A",
      "--button-delete-hover-bg": "#2A4A5A",
      "--button-delete-text": "#F0F5F8",
      "--input-bg": "#07101A",
      "--input-text": "#F0F5F8",
      "--input-placeholder-text": "#94A3B8",
      "--progress-track-bg": "#1A2A3A",
      "--map-background-color": "#07101A",
      "--map-region-default-fill": "#1A2A3A",
      "--map-region-border": "#0D1A2A",
      "--map-region-hover-fill": "#FFC107",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMerriweather,
    },
    styles: {
      "--panel-shadow": "0 6px 18px rgba(0,0,0,0.5)",
      "--button-shadow": "0 2px 8px rgba(0,0,0,0.25)",
      "--element-radius": "5px",
      "--border-width": "1px",
      "--focus-ring-color": "#FFC107",
      "--progress-value-color": "#3A5A6A",
      "--checkbox-accent-color": "#FFC107",
      "--input-focus-shadow-color": "rgba(255, 193, 7, 0.4)",
      "--transition-speed": "0.15s ease",
    },
  },
  adriatic_twilight: {
    name: "Adriatic Twilight",
    colors: {
      "--primary-bg": "#2A2A3A", // Deep, muted indigo (twilight sky)
      "--secondary-bg": "#1D1D2B", // Darker blue-purple
      "--ui-panel-bg": "#3A3A5A", // Richer dark blue-purple panel
      "--button-bg": "#7A5A6A", // Muted terracotta/burnt rose
      "--button-hover-bg": "#8A6A7A",
      "--button-active-bg": "#6A4A5A",
      "--button-text": "#F0F2FF",
      "--primary-text": "#F0F2FF", // Soft, warm off-white (limestone)
      "--secondary-text": "#D0D4F0",
      "--accent-color": "#FF6B6B", // Vibrant coral red (flowers, sunset)
      "--accent-text": "#FFFFFF",
      "--rgb-accent-color": hexToRgbString("#FF6B6B"),
      "--highlight-bg": "rgba(255, 107, 107, 0.15)",
      "--border-color": "#4A4A6A",
      "--accent-border-color": "#FF6B6B",
      "--error-text": "#F472B6",
      "--success-text": "#86EFAC",
      "--disabled-bg": "#3A3A5A",
      "--disabled-text": "#8A87BB",
      "--button-action-bg": "#FF6B6B",
      "--button-action-hover-bg": "#FF8B8B",
      "--button-action-text": "#FFFFFF",
      "--button-delete-bg": "#7A5A6A",
      "--button-delete-hover-bg": "#6A4A5A",
      "--button-delete-text": "#F0F2FF",
      "--input-bg": "#1D1D2B",
      "--input-text": "#F0F2FF",
      "--input-placeholder-text": "#9AA0CF",
      "--progress-track-bg": "#3A3A5A",
      "--map-background-color": "#1D1D2B",
      "--map-region-default-fill": "#3A3A5A",
      "--map-region-border": "#2A2A3A",
      "--map-region-hover-fill": "#FF6B6B",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMontserrat,
    },
    styles: {
      "--panel-shadow": "0 5px 15px rgba(0,0,0,0.4)",
      "--button-shadow": "0 2px 4px rgba(0,0,0,0.25)",
      "--element-radius": "8px",
      "--border-width": "1px",
      "--focus-ring-color": "#FF6B6B",
      "--progress-value-color": "#7A5A6A",
      "--checkbox-accent-color": "#FF6B6B",
      "--input-focus-shadow-color": "rgba(255, 107, 107, 0.35)",
      "--transition-speed": "0.15s ease",
    },
  },
  medieval_castle_walls: {
    name: "Medieval Castle Walls",
    colors: {
      "--primary-bg": "#1A1A1A", // Deep, dark grey (castle stone)
      "--secondary-bg": "#0D0D0D", // Near-black (deep shadows)
      "--ui-panel-bg": "#2A2A2A", // Dark charcoal panel
      "--button-bg": "#4A4A4A", // Muted steel grey
      "--button-hover-bg": "#5A5A5A",
      "--button-active-bg": "#3A3A3A",
      "--button-text": "#F0F0F0",
      "--primary-text": "#F0F0F0", // Pale, stark white
      "--secondary-text": "#B0B0B0",
      "--accent-color": "#8B2A2A", // Deep, rich crimson (banners, stained glass)
      "--accent-text": "#FFFFFF",
      "--rgb-accent-color": hexToRgbString("#8B2A2A"),
      "--highlight-bg": "rgba(139, 42, 42, 0.15)",
      "--border-color": "#3A3A3A",
      "--accent-border-color": "#8B2A2A",
      "--error-text": "#D9534F",
      "--success-text": "#5CB85C",
      "--disabled-bg": "#2A2A2A",
      "--disabled-text": "#7A7A7A",
      "--button-action-bg": "#8B2A2A",
      "--button-action-hover-bg": "#701F1F",
      "--button-action-text": "#FFFFFF",
      "--button-delete-bg": "#4A4A4A",
      "--button-delete-hover-bg": "#3A3A3A",
      "--button-delete-text": "#F0F0F0",
      "--input-bg": "#0D0D0D",
      "--input-text": "#F0F0F0",
      "--input-placeholder-text": "#8A8A8A",
      "--progress-track-bg": "#2A2A2A",
      "--map-background-color": "#0D0D0D",
      "--map-region-default-fill": "#2A2A2A",
      "--map-region-border": "#1A1A1A",
      "--map-region-hover-fill": "rgba(139, 42, 42, 0.4)",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMerriweather,
    },
    styles: {
      "--panel-shadow": "0 5px 15px rgba(0,0,0,0.5)",
      "--button-shadow": "0 2px 4px rgba(0,0,0,0.25)",
      "--element-radius": "3px",
      "--border-width": "1px",
      "--focus-ring-color": "#8B2A2A",
      "--progress-value-color": "#4A4A4A",
      "--checkbox-accent-color": "#8B2A2A",
      "--input-focus-shadow-color": "rgba(139, 42, 42, 0.35)",
      "--transition-speed": "0.15s ease",
    },
  },
  tatra_peaks: {
    name: "Tatra Peaks",
    colors: {
      "--primary-bg": "#1A222A", // Deep, dark slate blue (mountain shadows)
      "--secondary-bg": "#10161F", // Near-black, colder blue
      "--ui-panel-bg": "#2A343A", // Muted dark grey-blue panel
      "--button-bg": "#4F6470", // Medium cool grey (rock)
      "--button-hover-bg": "#5F7280",
      "--button-active-bg": "#3F5160",
      "--button-text": "#F0F5F8",
      "--primary-text": "#F0F5F8", // Crisp white (snow caps)
      "--secondary-text": "#D4DFE8",
      "--accent-color": "#4FD1C5", // Bright, cool electric aqua (glacial lakes, clear sky)
      "--accent-text": "#1A222A", // Dark text on bright accent
      "--rgb-accent-color": hexToRgbString("#4FD1C5"),
      "--highlight-bg": "rgba(79, 209, 197, 0.15)",
      "--border-color": "#3B4550",
      "--accent-border-color": "#4FD1C5",
      "--error-text": "#D9534F",
      "--success-text": "#5CB85C",
      "--disabled-bg": "#2A343A",
      "--disabled-text": "#718096",
      "--button-action-bg": "#4FD1C5",
      "--button-action-hover-bg": "#3FC0B2",
      "--button-action-text": "#1A222A",
      "--button-delete-bg": "#C53030", // Strong red for emphasis
      "--button-delete-hover-bg": "#E53E3E",
      "--button-delete-text": "#F0F5F8",
      "--input-bg": "#10161F",
      "--input-text": "#F0F5F8",
      "--input-placeholder-text": "#94A3B8",
      "--progress-track-bg": "#2A343A",
      "--map-background-color": "#10161F",
      "--map-region-default-fill": "#2A343A",
      "--map-region-border": "#1A222A",
      "--map-region-hover-fill": "#4FD1C5",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMontserrat,
    },
    styles: {
      "--panel-shadow": "0 8px 25px rgba(0,0,0,0.45)",
      "--button-shadow": "0 2px 8px rgba(0,0,0,0.25)",
      "--element-radius": "4px",
      "--border-width": "1px",
      "--focus-ring-color": "#4FD1C5",
      "--progress-value-color": "#4F6470",
      "--checkbox-accent-color": "#4FD1C5",
      "--input-focus-shadow-color": "rgba(79, 209, 197, 0.4)",
      "--transition-speed": "0.15s ease-in-out",
    },
  },
  black_sea_grain: {
    name: "Black Sea Grain",
    colors: {
      "--primary-bg": "#1A1A10", // Very deep, dark earthy brown (black soil)
      "--secondary-bg": "#0D0D08", // Near-black
      "--ui-panel-bg": "#2A2A1A", // Dark olive-brown panel
      "--button-bg": "#3A4A5A", // Muted deep blue (Black Sea)
      "--button-hover-bg": "#4A5A6A",
      "--button-active-bg": "#2A3A4A",
      "--button-text": "#F5F5EB",
      "--primary-text": "#F5F5EB", // Pale wheat yellow (grain)
      "--secondary-text": "#D4D4C7",
      "--accent-color": "#FFD700", // Bright gold (ripe grain fields)
      "--accent-text": "#1A1A10", // Dark text on bright accent
      "--rgb-accent-color": hexToRgbString("#FFD700"),
      "--highlight-bg": "rgba(255, 215, 0, 0.15)",
      "--border-color": "#3A3A2A",
      "--accent-border-color": "#FFD700",
      "--error-text": "#D9534F",
      "--success-text": "#5CB85C",
      "--disabled-bg": "#2A2A1A",
      "--disabled-text": "#7A7A6A",
      "--button-action-bg": "#FFD700",
      "--button-action-hover-bg": "#E0A300",
      "--button-action-text": "#1A1A10",
      "--button-delete-bg": "#3A4A5A",
      "--button-delete-hover-bg": "#2A3A4A",
      "--button-delete-text": "#F5F5EB",
      "--input-bg": "#0D0D08",
      "--input-text": "#F5F5EB",
      "--input-placeholder-text": "#A0A090",
      "--progress-track-bg": "#2A2A1A",
      "--map-background-color": "#0D0D08",
      "--map-region-default-fill": "#2A2A1A",
      "--map-region-border": "#1A1A10",
      "--map-region-hover-fill": "#FFD700",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMontserrat,
    },
    styles: {
      "--panel-shadow": "0 6px 18px rgba(0,0,0,0.5)",
      "--button-shadow": "0 2px 8px rgba(0,0,0,0.25)",
      "--element-radius": "6px",
      "--border-width": "1px",
      "--focus-ring-color": "#FFD700",
      "--progress-value-color": "#3A4A5A",
      "--checkbox-accent-color": "#FFD700",
      "--input-focus-shadow-color": "rgba(255, 215, 0, 0.4)",
      "--transition-speed": "0.15s ease",
    },
  },
  black_forest_night: {
    name: "Black Forest Night",
    colors: {
      "--primary-bg": "#1A241A", // Very deep, dark forest green
      "--secondary-bg": "#0F160F", // Near-black, deepest forest shade
      "--ui-panel-bg": "#2A352A", // Muted dark green panel
      "--button-bg": "#5A7A5A", // Muted deep forest green
      "--button-hover-bg": "#6B8A6B",
      "--button-active-bg": "#4A6A4A",
      "--button-text": "#F5F5F0",
      "--primary-text": "#F5F5F0", // Pale, misty light (moon through trees)
      "--secondary-text": "#D0D0CB",
      "--accent-color": "#B06A4A", // Rustic amber/wood tone (cuckoo clocks, forest cabins)
      "--accent-text": "#FFFFFF",
      "--rgb-accent-color": hexToRgbString("#B06A4A"),
      "--highlight-bg": "rgba(176, 106, 74, 0.15)",
      "--border-color": "#3B453B",
      "--accent-border-color": "#B06A4A",
      "--error-text": "#D9534F",
      "--success-text": "#5CB85C",
      "--disabled-bg": "#2A352A",
      "--disabled-text": "#7A857A",
      "--button-action-bg": "#B06A4A",
      "--button-action-hover-bg": "#A05A3A",
      "--button-action-text": "#FFFFFF",
      "--button-delete-bg": "#5A7A5A",
      "--button-delete-hover-bg": "#4A6A4A",
      "--button-delete-text": "#F5F5F0",
      "--input-bg": "#0F160F",
      "--input-text": "#F5F5F0",
      "--input-placeholder-text": "#94A394",
      "--progress-track-bg": "#2A352A",
      "--map-background-color": "#0F160F",
      "--map-region-default-fill": "#2A352A",
      "--map-region-border": "#1A241A",
      "--map-region-hover-fill": "#B06A4A",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMerriweather,
    },
    styles: {
      "--panel-shadow": "0 6px 18px rgba(0,0,0,0.5)",
      "--button-shadow": "0 2px 8px rgba(0,0,0,0.25)",
      "--element-radius": "6px",
      "--border-width": "1px",
      "--focus-ring-color": "#B06A4A",
      "--progress-value-color": "#5A7A5A",
      "--checkbox-accent-color": "#B06A4A",
      "--input-focus-shadow-color": "rgba(176, 106, 74, 0.4)",
      "--transition-speed": "0.15s ease",
    },
  },
  munich_beer_garden: {
    name: "Munich Beer Garden",
    colors: {
      "--primary-bg": "#F5F0EB", // Warm off-white (tablecloths, light wood)
      "--secondary-bg": "#EAE4D9", // Muted light beige/stone
      "--ui-panel-bg": "#FFFFFF",
      "--button-bg": "#7A5A4A", // Rich, dark wood brown
      "--button-hover-bg": "#9A6A5A",
      "--button-active-bg": "#6A4A3A",
      "--button-text": "#FFFFFF",
      "--primary-text": "#3A2A1E", // Dark charcoal brown
      "--secondary-text": "#7A6A6A",
      "--accent-color": "#D4AF37", // Warm golden amber (beer, sunlight)
      "--accent-text": "#3A2A1E", // Dark text on amber
      "--rgb-accent-color": hexToRgbString("#D4AF37"),
      "--highlight-bg": "rgba(212, 175, 55, 0.15)",
      "--border-color": "#D1C3B8",
      "--accent-border-color": "#D4AF37",
      "--error-text": "#D9534F",
      "--success-text": "#5CB85C",
      "--disabled-bg": "#E0E0E0",
      "--disabled-text": "#A0A0A0",
      "--button-action-bg": "#D4AF37",
      "--button-action-hover-bg": "#B89A27",
      "--button-action-text": "#3A2A1E",
      "--button-delete-bg": "#7A5A4A",
      "--button-delete-hover-bg": "#6A4A3A",
      "--button-delete-text": "#FFFFFF",
      "--input-bg": "#F5F0EB",
      "--input-text": "#3A2A1E",
      "--input-placeholder-text": "#A0A0A0",
      "--progress-track-bg": "#EAE4D9",
      "--map-background-color": "#EAE4D9",
      "--map-region-default-fill": "#B0A59A",
      "--map-region-border": "#FFFFFF",
      "--map-region-hover-fill": "rgba(212, 175, 55, 0.4)",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMontserrat,
    },
    styles: {
      "--panel-shadow": "0 1px 4px rgba(0,0,0,0.07)",
      "--button-shadow": "0 1px 2px rgba(0,0,0,0.05)",
      "--element-radius": "6px",
      "--border-width": "1px",
      "--focus-ring-color": "#D4AF37",
      "--progress-value-color": "#7A5A4A",
      "--checkbox-accent-color": "#D4AF37",
      "--input-focus-shadow-color": "rgba(212, 175, 55, 0.3)",
      "--transition-speed": "0.15s ease-in-out",
    },
  },
  bauhaus_harmony: {
    name: "Bauhaus Harmony",
    colors: {
      "--primary-bg": "#F0F0F0", // Light cool grey (concrete, canvas)
      "--secondary-bg": "#E0E0E0", // Muted mid-grey
      "--ui-panel-bg": "#FFFFFF",
      "--button-bg": "#2A2A2A", // Dark charcoal (structure)
      "--button-hover-bg": "#3A3A3A",
      "--button-active-bg": "#1A1A1A",
      "--button-text": "#FFFFFF",
      "--primary-text": "#1A1A1A", // Stark black (ink, lines)
      "--secondary-text": "#6A6A6A",
      "--accent-color": "#FF0000", // Bold Red (primary color accent)
      "--accent-text": "#FFFFFF",
      "--rgb-accent-color": hexToRgbString("#FF0000"),
      "--highlight-bg": "rgba(255, 0, 0, 0.15)",
      "--border-color": "#B0B0B0",
      "--accent-border-color": "#FF0000",
      "--error-text": "#D9534F",
      "--success-text": "#5CB85C",
      "--disabled-bg": "#D0D0D0",
      "--disabled-text": "#A0A0A0",
      "--button-action-bg": "#0000FF", // Bold Blue (primary color accent)
      "--button-action-hover-bg": "#0000CC",
      "--button-action-text": "#FFFFFF",
      "--button-delete-bg": "#FF0000",
      "--button-delete-hover-bg": "#CC0000",
      "--button-delete-text": "#FFFFFF",
      "--input-bg": "#FFFFFF",
      "--input-text": "#1A1A1A",
      "--input-placeholder-text": "#A0A0A0",
      "--progress-track-bg": "#E0E0E0",
      "--map-background-color": "#E0E0E0",
      "--map-region-default-fill": "#B0B0B0",
      "--map-region-border": "#FFFFFF",
      "--map-region-hover-fill": "rgba(255, 0, 0, 0.4)",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontRobotoMono, // Geometric, modern feel
    },
    styles: {
      "--panel-shadow": "0 1px 3px rgba(0,0,0,0.08)",
      "--button-shadow": "0 1px 2px rgba(0,0,0,0.05)",
      "--element-radius": "2px", // Sharp, minimalist corners
      "--border-width": "1px",
      "--focus-ring-color": "#FF0000",
      "--progress-value-color": "#2A2A2A",
      "--checkbox-accent-color": "#FF0000",
      "--input-focus-shadow-color": "rgba(255, 0, 0, 0.25)",
      "--transition-speed": "0.1s linear",
    },
  },
  autobahn_speed: {
    name: "Autobahn Speed",
    colors: {
      "--primary-bg": "#1A1A1A", // Deep black (asphalt)
      "--secondary-bg": "#0D0D0D", // Near-black, darker road
      "--ui-panel-bg": "#2A2A2A", // Dark metallic grey panel
      "--button-bg": "#4A4A4A", // Medium metallic grey (car body)
      "--button-hover-bg": "#5A5A5A",
      "--button-active-bg": "#3A3A3A",
      "--button-text": "#F0F0F0",
      "--primary-text": "#F0F0F0", // Bright white (headlights, digital displays)
      "--secondary-text": "#B0B0B0",
      "--accent-color": "#00BFFF", // Deep Sky Blue (futuristic interface glow, speed lines)
      "--accent-text": "#FFFFFF",
      "--rgb-accent-color": hexToRgbString("#00BFFF"),
      "--highlight-bg": "rgba(0, 191, 255, 0.15)",
      "--border-color": "#3A3A3A",
      "--accent-border-color": "#00BFFF",
      "--error-text": "#FF4500", // Fiery orange-red (warning lights)
      "--success-text": "#32CD32",
      "--disabled-bg": "#2A2A2A",
      "--disabled-text": "#7A7A7A",
      "--button-action-bg": "#00BFFF",
      "--button-action-hover-bg": "#00A2E0",
      "--button-action-text": "#FFFFFF",
      "--button-delete-bg": "#FF4500",
      "--button-delete-hover-bg": "#E03C00",
      "--button-delete-text": "#FFFFFF",
      "--input-bg": "#0D0D0D",
      "--input-text": "#F0F0F0",
      "--input-placeholder-text": "#8A8A8A",
      "--progress-track-bg": "#2A2A2A",
      "--map-background-color": "#0D0D0D",
      "--map-region-default-fill": "#2A2A2A",
      "--map-region-border": "#1A1A1A",
      "--map-region-hover-fill": "rgba(0, 191, 255, 0.4)",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMontserrat, // Bold, futuristic for headings
    },
    styles: {
      "--panel-shadow": "0 8px 25px rgba(0,0,0,0.7)",
      "--button-shadow": "0 2px 7px rgba(0,0,0,0.4)",
      "--element-radius": "3px", // Sharp, aerodynamic corners
      "--border-width": "1px",
      "--focus-ring-color": "#00BFFF",
      "--progress-value-color": "#4A4A4A",
      "--checkbox-accent-color": "#00BFFF",
      "--input-focus-shadow-color": "rgba(0, 191, 255, 0.4)",
      "--transition-speed": "0.08s linear", // Very fast transitions
    },
  },
  oktoberfest_bier_tent: {
    name: "Oktoberfest Bier Tent",
    colors: {
      "--primary-bg": "#FFFBEB", // Warm cream (tent canvas)
      "--secondary-bg": "#FFF5D6", // Slightly deeper warm yellow
      "--ui-panel-bg": "#FFFFFF",
      "--button-bg": "#A34A3A", // Muted rust red (traditional clothing)
      "--button-hover-bg": "#B85C4A",
      "--button-active-bg": "#8A3A2A",
      "--button-text": "#FFFFFF",
      "--primary-text": "#3A2A1E", // Dark warm brown
      "--secondary-text": "#7A6A5A",
      "--accent-color": "#FFC107", // Bright, frothy beer gold
      "--accent-text": "#3A2A1E", // Dark text on accent
      "--rgb-accent-color": hexToRgbString("#FFC107"),
      "--highlight-bg": "rgba(255, 193, 7, 0.15)",
      "--border-color": "#D1C3B8",
      "--accent-border-color": "#FFC107",
      "--error-text": "#D9534F",
      "--success-text": "#5CB85C",
      "--disabled-bg": "#E0E0E0",
      "--disabled-text": "#A0A0A0",
      "--button-action-bg": "#FFC107",
      "--button-action-hover-bg": "#E0A300",
      "--button-action-text": "#3A2A1E",
      "--button-delete-bg": "#A34A3A",
      "--button-delete-hover-bg": "#8A3A2A",
      "--button-delete-text": "#FFFFFF",
      "--input-bg": "#FFFBEB",
      "--input-text": "#3A2A1E",
      "--input-placeholder-text": "#A0A0A0",
      "--progress-track-bg": "#FFF5D6",
      "--map-background-color": "#FFF5D6",
      "--map-region-default-fill": "#B0A59A",
      "--map-region-border": "#FFFFFF",
      "--map-region-hover-fill": "rgba(255, 193, 7, 0.4)",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMontserrat,
    },
    styles: {
      "--panel-shadow": "0 1px 4px rgba(0,0,0,0.07)",
      "--button-shadow": "0 1px 2px rgba(0,0,0,0.05)",
      "--element-radius": "8px", // Rounder, softer for a festive feel
      "--border-width": "1px",
      "--focus-ring-color": "#FFC107",
      "--progress-value-color": "#A34A3A",
      "--checkbox-accent-color": "#FFC107",
      "--input-focus-shadow-color": "rgba(255, 193, 7, 0.3)",
      "--transition-speed": "0.15s ease-in-out",
    },
  },
  santoriniBreeze: {
    name: "Santorini Breeze",
    colors: {
      "--primary-bg": "#F8FAFF", // Crisp, airy off-white
      "--secondary-bg": "#EBF3FA", // Very light sky blue
      "--ui-panel-bg": "#FFFFFF",
      "--button-bg": "#005A9C", // Deep Aegean Blue
      "--button-hover-bg": "#004C88",
      "--button-active-bg": "#003A72",
      "--button-text": "#FFFFFF",
      "--primary-text": "#2C3E50", // Dark charcoal blue
      "--secondary-text": "#5A6E80",
      "--accent-color": "#E91E63", // Bougainvillea Pink
      "--accent-text": "#FFFFFF",
      "--rgb-accent-color": hexToRgbString("#E91E63"),
      "--highlight-bg": "rgba(233, 30, 99, 0.1)",
      "--border-color": "#DDE5EC", // Light blue-grey border
      "--accent-border-color": "#005A9C",
      "--error-text": "#D32F2F",
      "--success-text": "#388E3C",
      "--disabled-bg": "#E0E0E0",
      "--disabled-text": "#A0A0A0",
      "--button-action-bg": "#E91E63",
      "--button-action-hover-bg": "#C2185B",
      "--button-action-text": "#FFFFFF",
      "--button-delete-bg": "#795548", // Earthy tone for contrast
      "--button-delete-hover-bg": "#5D4037",
      "--button-delete-text": "#FFFFFF",
      "--input-bg": "#FFFFFF",
      "--input-text": "#2C3E50",
      "--input-placeholder-text": "#A0AEC0",
      "--progress-track-bg": "#EBF3FA",
      "--map-background-color": "#EBF3FA",
      "--map-region-default-fill": "#B0C4DE",
      "--map-region-border": "#FFFFFF",
      "--map-region-hover-fill": "rgba(0, 90, 156, 0.4)",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMerriweather,
    },
    styles: {
      "--panel-shadow": "0 2px 6px rgba(0,0,0,0.06)",
      "--button-shadow": "0 1px 2px rgba(0,0,0,0.04)",
      "--element-radius": "6px",
      "--border-width": "1px",
      "--focus-ring-color": "#005A9C",
      "--progress-value-color": "#005A9C",
      "--checkbox-accent-color": "#E91E63",
      "--input-focus-shadow-color": "rgba(0, 90, 156, 0.25)",
      "--transition-speed": "0.15s ease-in-out",
    },
  },
  rajasthanPalace: {
    name: "Rajasthan Palace",
    colors: {
      "--primary-bg": "#1A237E", // Deep Indigo
      "--secondary-bg": "#10165E", // Darker Indigo
      "--ui-panel-bg": "#283593", // Lighter indigo panel
      "--button-bg": "#C2185B", // Rich Magenta
      "--button-hover-bg": "#D81B60",
      "--button-active-bg": "#AD1457",
      "--button-text": "#FFF8E1",
      "--primary-text": "#FFF8E1", // Soft sandy off-white
      "--secondary-text": "#F0EAD6",
      "--accent-color": "#FF9800", // Saffron/Marigold Orange
      "--accent-text": "#1A237E",
      "--rgb-accent-color": hexToRgbString("#FF9800"),
      "--highlight-bg": "rgba(255, 152, 0, 0.15)",
      "--border-color": "#3949AB",
      "--accent-border-color": "#FF9800",
      "--error-text": "#F48FB1",
      "--success-text": "#81C784",
      "--disabled-bg": "#283593",
      "--disabled-text": "#7986CB",
      "--button-action-bg": "#FF9800",
      "--button-action-hover-bg": "#FFA726",
      "--button-action-text": "#1A237E",
      "--button-delete-bg": "#C2185B",
      "--button-delete-hover-bg": "#AD1457",
      "--button-delete-text": "#FFF8E1",
      "--input-bg": "#10165E",
      "--input-text": "#FFF8E1",
      "--input-placeholder-text": "#9FA8DA",
      "--progress-track-bg": "#283593",
      "--map-background-color": "#10165E",
      "--map-region-default-fill": "#283593",
      "--map-region-border": "#1A237E",
      "--map-region-hover-fill": "#FF9800",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMerriweather,
    },
    styles: {
      "--panel-shadow": "0 5px 15px rgba(0,0,0,0.4)",
      "--button-shadow": "0 2px 4px rgba(0,0,0,0.25)",
      "--element-radius": "6px",
      "--border-width": "1px",
      "--focus-ring-color": "#FF9800",
      "--progress-value-color": "#C2185B",
      "--checkbox-accent-color": "#FF9800",
      "--input-focus-shadow-color": "rgba(255, 152, 0, 0.4)",
      "--transition-speed": "0.15s ease",
    },
  },
  delftPorcelain: {
    name: "Delft Porcelain",
    colors: {
      "--primary-bg": "#FDFDFF", // Porcelain off-white
      "--secondary-bg": "#EDF2F7", // Very light grey-blue
      "--ui-panel-bg": "#FFFFFF",
      "--button-bg": "#003366", // Classic Delft Blue
      "--button-hover-bg": "#004488",
      "--button-active-bg": "#002244",
      "--button-text": "#FFFFFF",
      "--primary-text": "#003366", // Delft Blue text
      "--secondary-text": "#5A728C",
      "--accent-color": "#FF6600", // Oranje
      "--accent-text": "#FFFFFF",
      "--rgb-accent-color": hexToRgbString("#FF6600"),
      "--highlight-bg": "rgba(255, 102, 0, 0.1)",
      "--border-color": "#DAE4ED",
      "--accent-border-color": "#003366",
      "--error-text": "#CC0000",
      "--success-text": "#006400",
      "--disabled-bg": "#E0E0E0",
      "--disabled-text": "#A0A0A0",
      "--button-action-bg": "#FF6600",
      "--button-action-hover-bg": "#EE5500",
      "--button-action-text": "#FFFFFF",
      "--button-delete-bg": "#003366",
      "--button-delete-hover-bg": "#002244",
      "--button-delete-text": "#FFFFFF",
      "--input-bg": "#FFFFFF",
      "--input-text": "#003366",
      "--input-placeholder-text": "#A0AEC0",
      "--progress-track-bg": "#EDF2F7",
      "--map-background-color": "#EDF2F7",
      "--map-region-default-fill": "#B0C4DE",
      "--map-region-border": "#FFFFFF",
      "--map-region-hover-fill": "rgba(255, 102, 0, 0.4)",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontInter,
    },
    styles: {
      "--panel-shadow": "0 1px 3px rgba(0,0,0,0.05)",
      "--button-shadow": "none",
      "--element-radius": "4px",
      "--border-width": "1px",
      "--focus-ring-color": "#FF6600",
      "--progress-value-color": "#003366",
      "--checkbox-accent-color": "#FF6600",
      "--input-focus-shadow-color": "rgba(255, 102, 0, 0.25)",
      "--transition-speed": "0.15s ease-in-out",
    },
  },
  rivieraMaya: {
    name: "Riviera Maya",
    colors: {
      "--primary-bg": "#F9F5F0", // Sandy off-white
      "--secondary-bg": "#E8D6C9", // Light warm clay
      "--ui-panel-bg": "#FFFFFF",
      "--button-bg": "#00B8A9", // Turquoise/Cenote Blue
      "--button-hover-bg": "#00A296",
      "--button-active-bg": "#008C7F",
      "--button-text": "#FFFFFF",
      "--primary-text": "#4D4038", // Deep coffee brown
      "--secondary-text": "#7E7068",
      "--accent-color": "#F64C72", // Vibrant hibiscus pink
      "--accent-text": "#FFFFFF",
      "--rgb-accent-color": hexToRgbString("#F64C72"),
      "--highlight-bg": "rgba(246, 76, 114, 0.15)",
      "--border-color": "#D4CBBF",
      "--accent-border-color": "#F64C72",
      "--error-text": "#D93025",
      "--success-text": "#1E8E3E",
      "--disabled-bg": "#E0E0E0",
      "--disabled-text": "#A0A0A0",
      "--button-action-bg": "#F64C72",
      "--button-action-hover-bg": "#F03058",
      "--button-action-text": "#FFFFFF",
      "--button-delete-bg": "#00B8A9",
      "--button-delete-hover-bg": "#008C7F",
      "--button-delete-text": "#FFFFFF",
      "--input-bg": "#FFFFFF",
      "--input-text": "#4D4038",
      "--input-placeholder-text": "#B0A59E",
      "--progress-track-bg": "#E8D6C9",
      "--map-background-color": "#E8D6C9",
      "--map-region-default-fill": "#C3B5A9",
      "--map-region-border": "#FFFFFF",
      "--map-region-hover-fill": "rgba(0, 184, 169, 0.4)",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMontserrat,
    },
    styles: {
      "--panel-shadow": "0 2px 8px rgba(0,0,0,0.1)",
      "--button-shadow": "0 1px 3px rgba(0,0,0,0.08)",
      "--element-radius": "8px",
      "--border-width": "1px",
      "--focus-ring-color": "#00B8A9",
      "--progress-value-color": "#00B8A9",
      "--checkbox-accent-color": "#F64C72",
      "--input-focus-shadow-color": "rgba(0, 184, 169, 0.3)",
      "--transition-speed": "0.15s ease-in-out",
    },
  },
  aotearoaGreen: {
    name: "Aotearoa Green",
    colors: {
      "--primary-bg": "#1A2A1A", // Deep forest green
      "--secondary-bg": "#0F1A0F", // Near-black green
      "--ui-panel-bg": "#2A4A3A", // Richer, lighter green panel
      "--button-bg": "#4A5C54", // Muted stone/slate grey
      "--button-hover-bg": "#5A6E64",
      "--button-active-bg": "#3A4B44",
      "--button-text": "#E0EAE6",
      "--primary-text": "#E0EAE6", // Pale, misty grey-green
      "--secondary-text": "#B8C6C0",
      "--accent-color": "#50C878", // Vibrant Koru/Fern Green
      "--accent-text": "#0F1A0F",
      "--rgb-accent-color": hexToRgbString("#50C878"),
      "--highlight-bg": "rgba(80, 200, 120, 0.15)",
      "--border-color": "#3A5C4A",
      "--accent-border-color": "#50C878",
      "--error-text": "#F87171", // Lighter red for dark theme
      "--success-text": "#86EFAC",
      "--disabled-bg": "#2A4A3A",
      "--disabled-text": "#6A8A7A",
      "--button-action-bg": "#50C878",
      "--button-action-hover-bg": "#60D888",
      "--button-action-text": "#0F1A0F",
      "--button-delete-bg": "#8B4513", // Muted brown (Pounamu/Kauri)
      "--button-delete-hover-bg": "#7A3503",
      "--button-delete-text": "#E0EAE6",
      "--input-bg": "#0F1A0F",
      "--input-text": "#E0EAE6",
      "--input-placeholder-text": "#7A8C82",
      "--progress-track-bg": "#2A4A3A",
      "--map-background-color": "#0F1A0F",
      "--map-region-default-fill": "#2A4A3A",
      "--map-region-border": "#1A2A1A",
      "--map-region-hover-fill": "#50C878",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMontserrat,
    },
    styles: {
      "--panel-shadow": "0 5px 15px rgba(0,0,0,0.4)",
      "--button-shadow": "0 2px 4px rgba(0,0,0,0.25)",
      "--element-radius": "5px",
      "--border-width": "1px",
      "--focus-ring-color": "#50C878",
      "--progress-value-color": "#4A5C54",
      "--checkbox-accent-color": "#50C878",
      "--input-focus-shadow-color": "rgba(80, 200, 120, 0.35)",
      "--transition-speed": "0.15s ease",
    },
  },
  amberVistula: {
    name: "Amber Vistula",
    colors: {
      "--primary-bg": "#F5F5F5", // Neutral, stony off-white
      "--secondary-bg": "#EAEAEA", // Light grey
      "--ui-panel-bg": "#FFFFFF",
      "--button-bg": "#DC143C", // Strong crimson red (flag)
      "--button-hover-bg": "#C01030",
      "--button-active-bg": "#A00A20",
      "--button-text": "#FFFFFF",
      "--primary-text": "#333333", // Deep charcoal
      "--secondary-text": "#666666",
      "--accent-color": "#FFBF00", // Rich Baltic amber
      "--accent-text": "#333333",
      "--rgb-accent-color": hexToRgbString("#FFBF00"),
      "--highlight-bg": "rgba(255, 191, 0, 0.15)",
      "--border-color": "#DCDCDC",
      "--accent-border-color": "#FFBF00",
      "--error-text": "#D9534F",
      "--success-text": "#5CB85C",
      "--disabled-bg": "#E0E0E0",
      "--disabled-text": "#A0A0A0",
      "--button-action-bg": "#FFBF00",
      "--button-action-hover-bg": "#E6AC00",
      "--button-action-text": "#333333",
      "--button-delete-bg": "#DC143C",
      "--button-delete-hover-bg": "#A00A20",
      "--button-delete-text": "#FFFFFF",
      "--input-bg": "#FFFFFF",
      "--input-text": "#333333",
      "--input-placeholder-text": "#999999",
      "--progress-track-bg": "#EAEAEA",
      "--map-background-color": "#EAEAEA",
      "--map-region-default-fill": "#C0C0C0",
      "--map-region-border": "#FFFFFF",
      "--map-region-hover-fill": "rgba(255, 191, 0, 0.4)",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMerriweather,
    },
    styles: {
      "--panel-shadow": "0 1px 4px rgba(0,0,0,0.07)",
      "--button-shadow": "0 1px 2px rgba(0,0,0,0.05)",
      "--element-radius": "4px",
      "--border-width": "1px",
      "--focus-ring-color": "#FFBF00",
      "--progress-value-color": "#DC143C",
      "--checkbox-accent-color": "#FFBF00",
      "--input-focus-shadow-color": "rgba(255, 191, 0, 0.3)",
      "--transition-speed": "0.15s ease-in-out",
    },
  },
  emeraldIsle: {
    name: "Emerald Isle",
    colors: {
      "--primary-bg": "#F5F5F0", // Soft, wool-like off-white
      "--secondary-bg": "#EAEAE6", // Misty grey
      "--ui-panel-bg": "#FFFFFF",
      "--button-bg": "#2F4F4F", // Dark Slate Grey (like ancient stones)
      "--button-hover-bg": "#3F5F5F",
      "--button-active-bg": "#1F3F3F",
      "--button-text": "#FFFFFF",
      "--primary-text": "#2F4F4F", // Dark Slate Grey
      "--secondary-text": "#6B7B7B",
      "--accent-color": "#008000", // A deep, vibrant Kelly Green
      "--accent-text": "#FFFFFF",
      "--rgb-accent-color": hexToRgbString("#008000"),
      "--highlight-bg": "rgba(0, 128, 0, 0.1)",
      "--border-color": "#D1D1CB",
      "--accent-border-color": "#008000",
      "--error-text": "#C04040",
      "--success-text": "#2E8B57",
      "--disabled-bg": "#E0E0E0",
      "--disabled-text": "#A0A0A0",
      "--button-action-bg": "#FF8C00", // A pop of orange
      "--button-action-hover-bg": "#E07C00",
      "--button-action-text": "#FFFFFF",
      "--button-delete-bg": "#2F4F4F",
      "--button-delete-hover-bg": "#1F3F3F",
      "--button-delete-text": "#FFFFFF",
      "--input-bg": "#FDFDFB",
      "--input-text": "#2F4F4F",
      "--input-placeholder-text": "#A0A0A0",
      "--progress-track-bg": "#EAEAE6",
      "--map-background-color": "#EAEAE6",
      "--map-region-default-fill": "#AABBAA", // Muted green
      "--map-region-border": "#FFFFFF",
      "--map-region-hover-fill": "rgba(0, 128, 0, 0.4)",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMerriweather,
    },
    styles: {
      "--panel-shadow": "0 1px 4px rgba(0,0,0,0.07)",
      "--button-shadow": "0 1px 2px rgba(0,0,0,0.05)",
      "--element-radius": "5px",
      "--border-width": "1px",
      "--focus-ring-color": "#FF8C00",
      "--progress-value-color": "#008000",
      "--checkbox-accent-color": "#FF8C00",
      "--input-focus-shadow-color": "rgba(0, 128, 0, 0.25)",
      "--transition-speed": "0.15s ease-in-out",
    },
  },
  azulejoMorning: {
    name: "Azulejo Morning",
    colors: {
      "--primary-bg": "#FFFFFF", // Clean, bright white
      "--secondary-bg": "#FDF5E6", // Light, sunny sand color
      "--ui-panel-bg": "#FFFFFF",
      "--button-bg": "#004A99", // Rich, traditional blue
      "--button-hover-bg": "#005AAD",
      "--button-active-bg": "#003A80",
      "--button-text": "#FFFFFF",
      "--primary-text": "#004A99", // Blue text
      "--secondary-text": "#5A7A9C",
      "--accent-color": "#FFD700", // Warm, golden yellow
      "--accent-text": "#333333",
      "--rgb-accent-color": hexToRgbString("#FFD700"),
      "--highlight-bg": "rgba(255, 215, 0, 0.15)",
      "--border-color": "#E0E8F0",
      "--accent-border-color": "#FFD700",
      "--error-text": "#D9534F",
      "--success-text": "#5CB85C",
      "--disabled-bg": "#E0E0E0",
      "--disabled-text": "#A0A0A0",
      "--button-action-bg": "#FFD700",
      "--button-action-hover-bg": "#E6C200",
      "--button-action-text": "#333333",
      "--button-delete-bg": "#004A99",
      "--button-delete-hover-bg": "#003A80",
      "--button-delete-text": "#FFFFFF",
      "--input-bg": "#FDF5E6",
      "--input-text": "#004A99",
      "--input-placeholder-text": "#B0A090",
      "--progress-track-bg": "#E0E8F0",
      "--map-background-color": "#FDF5E6",
      "--map-region-default-fill": "#B0D4E6",
      "--map-region-border": "#FFFFFF",
      "--map-region-hover-fill": "rgba(255, 215, 0, 0.4)",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMontserrat,
    },
    styles: {
      "--panel-shadow": "0 2px 5px rgba(0,0,0,0.08)",
      "--button-shadow": "0 1px 2px rgba(0,0,0,0.06)",
      "--element-radius": "3px", // Sharp tile-like corners
      "--border-width": "1px",
      "--focus-ring-color": "#004A99",
      "--progress-value-color": "#004A99",
      "--checkbox-accent-color": "#FFD700",
      "--input-focus-shadow-color": "rgba(255, 215, 0, 0.3)",
      "--transition-speed": "0.15s ease-in-out",
    },
  },
  baliVolcano: {
    name: "Bali Volcano",
    colors: {
      "--primary-bg": "#222222", // Dark volcanic charcoal
      "--secondary-bg": "#111111", // Deeper black
      "--ui-panel-bg": "#333333", // Lighter charcoal panel
      "--button-bg": "#006400", // Deep jungle green
      "--button-hover-bg": "#007800",
      "--button-active-bg": "#005000",
      "--button-text": "#F0F0F0",
      "--primary-text": "#E0E0E0", // Light, warm grey
      "--secondary-text": "#A0A0A0",
      "--accent-color": "#FF4500", // Fiery, molten orange
      "--accent-text": "#FFFFFF",
      "--rgb-accent-color": hexToRgbString("#FF4500"),
      "--highlight-bg": "rgba(255, 69, 0, 0.15)",
      "--border-color": "#444444",
      "--accent-border-color": "#FF4500",
      "--error-text": "#F08080",
      "--success-text": "#90EE90",
      "--disabled-bg": "#333333",
      "--disabled-text": "#777777",
      "--button-action-bg": "#FF4500",
      "--button-action-hover-bg": "#E03C00",
      "--button-action-text": "#FFFFFF",
      "--button-delete-bg": "#006400",
      "--button-delete-hover-bg": "#005000",
      "--button-delete-text": "#F0F0F0",
      "--input-bg": "#111111",
      "--input-text": "#E0E0E0",
      "--input-placeholder-text": "#888888",
      "--progress-track-bg": "#333333",
      "--map-background-color": "#111111",
      "--map-region-default-fill": "#333333",
      "--map-region-border": "#222222",
      "--map-region-hover-fill": "#FF4500",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMontserrat,
    },
    styles: {
      "--panel-shadow": "0 5px 15px rgba(0,0,0,0.5)",
      "--button-shadow": "0 2px 5px rgba(0,0,0,0.3)",
      "--element-radius": "6px",
      "--border-width": "1px",
      "--focus-ring-color": "#FF4500",
      "--progress-value-color": "#006400",
      "--checkbox-accent-color": "#FF4500",
      "--input-focus-shadow-color": "rgba(255, 69, 0, 0.35)",
      "--transition-speed": "0.15s ease",
    },
  },
  swissPrecision: {
    name: "Swiss Precision",
    colors: {
      "--primary-bg": "#FFFFFF", // Crisp white
      "--secondary-bg": "#F1F3F5", // Very light, cool grey
      "--ui-panel-bg": "#FFFFFF",
      "--button-bg": "#212529", // Dark, neutral charcoal
      "--button-hover-bg": "#343A40",
      "--button-active-bg": "#101214",
      "--button-text": "#FFFFFF",
      "--primary-text": "#212529",
      "--secondary-text": "#6C757D",
      "--accent-color": "#D52B1E", // Strong, clear red (Swiss flag)
      "--accent-text": "#FFFFFF",
      "--rgb-accent-color": hexToRgbString("#D52B1E"),
      "--highlight-bg": "rgba(213, 43, 30, 0.1)",
      "--border-color": "#DEE2E6",
      "--accent-border-color": "#D52B1E",
      "--error-text": "#D52B1E",
      "--success-text": "#28A745",
      "--disabled-bg": "#E9ECEF",
      "--disabled-text": "#ADB5BD",
      "--button-action-bg": "#D52B1E",
      "--button-action-hover-bg": "#B02418",
      "--button-action-text": "#FFFFFF",
      "--button-delete-bg": "#212529",
      "--button-delete-hover-bg": "#101214",
      "--button-delete-text": "#FFFFFF",
      "--input-bg": "#F8F9FA",
      "--input-text": "#212529",
      "--input-placeholder-text": "#ADB5BD",
      "--progress-track-bg": "#E9ECEF",
      "--map-background-color": "#F1F3F5",
      "--map-region-default-fill": "#CED4DA",
      "--map-region-border": "#FFFFFF",
      "--map-region-hover-fill": "rgba(213, 43, 30, 0.4)",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontInter,
    },
    styles: {
      "--panel-shadow": "0 1px 2px rgba(0,0,0,0.05)",
      "--button-shadow": "none",
      "--element-radius": "3px", // Sharp, precise corners
      "--border-width": "1px",
      "--focus-ring-color": "#D52B1E",
      "--progress-value-color": "#212529",
      "--checkbox-accent-color": "#D52B1E",
      "--input-focus-shadow-color": "rgba(213, 43, 30, 0.25)",
      "--transition-speed": "0.1s linear",
    },
  },
  finnishWintertide: {
    name: "Finnish Wintertide",
    colors: {
      "--primary-bg": "#0B1B34", // Very dark, cool blue
      "--secondary-bg": "#050F1F", // Near-black blue
      "--ui-panel-bg": "#1A2B48", // Lighter blue-grey panel
      "--button-bg": "#3A506B", // Muted, dark grey-blue
      "--button-hover-bg": "#4A607C",
      "--button-active-bg": "#2A405A",
      "--button-text": "#F0F8FF",
      "--primary-text": "#F0F8FF", // Crisp, cold off-white (AliceBlue)
      "--secondary-text": "#C0D8F0",
      "--accent-color": "#67E8F9", // Bright, icy cyan
      "--accent-text": "#0B1B34",
      "--rgb-accent-color": hexToRgbString("#67E8F9"),
      "--highlight-bg": "rgba(103, 232, 249, 0.1)",
      "--border-color": "#2A405A",
      "--accent-border-color": "#67E8F9",
      "--error-text": "#FCA5A5",
      "--success-text": "#A7F3D0",
      "--disabled-bg": "#1A2B48",
      "--disabled-text": "#5A708C",
      "--button-action-bg": "#67E8F9",
      "--button-action-hover-bg": "#77F8FF",
      "--button-action-text": "#0B1B34",
      "--button-delete-bg": "#3A506B",
      "--button-delete-hover-bg": "#2A405A",
      "--button-delete-text": "#F0F8FF",
      "--input-bg": "#050F1F",
      "--input-text": "#F0F8FF",
      "--input-placeholder-text": "#809BC0",
      "--progress-track-bg": "#1A2B48",
      "--map-background-color": "#050F1F",
      "--map-region-default-fill": "#1A2B48",
      "--map-region-border": "#0B1B34",
      "--map-region-hover-fill": "#67E8F9",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMontserrat,
    },
    styles: {
      "--panel-shadow": "0 0 10px rgba(103, 232, 249, 0.1)",
      "--button-shadow": "none",
      "--element-radius": "3px", // Sharp, icy corners
      "--border-width": "1px",
      "--focus-ring-color": "#67E8F9",
      "--progress-value-color": "#3A506B",
      "--checkbox-accent-color": "#67E8F9",
      "--input-focus-shadow-color": "rgba(103, 232, 249, 0.3)",
      "--transition-speed": "0.15s ease",
    },
  },
  cafeDeColombia: {
    name: "Cafe De Colombia",
    colors: {
      "--primary-bg": "#FAF3E3", // Warm, creamy off-white
      "--secondary-bg": "#E3D5B8", // Light, unbleached burlap
      "--ui-panel-bg": "#FFFFFF",
      "--button-bg": "#00693E", // Lush, deep green
      "--button-hover-bg": "#007A4A",
      "--button-active-bg": "#005830",
      "--button-text": "#FFFFFF",
      "--primary-text": "#4A2C2A", // Rich, dark coffee brown
      "--secondary-text": "#7A5C5A",
      "--accent-color": "#FFD60A", // Bright, sunny yellow
      "--accent-text": "#4A2C2A",
      "--rgb-accent-color": hexToRgbString("#FFD60A"),
      "--highlight-bg": "rgba(255, 214, 10, 0.15)",
      "--border-color": "#D1C3B0",
      "--accent-border-color": "#FFD60A",
      "--error-text": "#D9534F",
      "--success-text": "#5CB85C",
      "--disabled-bg": "#E0E0E0",
      "--disabled-text": "#A0A0A0",
      "--button-action-bg": "#FFD60A",
      "--button-action-hover-bg": "#EBC600",
      "--button-action-text": "#4A2C2A",
      "--button-delete-bg": "#00693E",
      "--button-delete-hover-bg": "#005830",
      "--button-delete-text": "#FFFFFF",
      "--input-bg": "#FAF3E3",
      "--input-text": "#4A2C2A",
      "--input-placeholder-text": "#B0A090",
      "--progress-track-bg": "#E3D5B8",
      "--map-background-color": "#E3D5B8",
      "--map-region-default-fill": "#C8BBA0",
      "--map-region-border": "#FFFFFF",
      "--map-region-hover-fill": "rgba(255, 214, 10, 0.4)",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMerriweather,
    },
    styles: {
      "--panel-shadow": "0 2px 6px rgba(0,0,0,0.1)",
      "--button-shadow": "0 1px 3px rgba(0,0,0,0.08)",
      "--element-radius": "7px",
      "--border-width": "1px",
      "--focus-ring-color": "#00693E",
      "--progress-value-color": "#00693E",
      "--checkbox-accent-color": "#FFD60A",
      "--input-focus-shadow-color": "rgba(255, 214, 10, 0.3)",
      "--transition-speed": "0.15s ease-in-out",
    },
  },
  siameseRoyalty: {
    name: "Siamese Royalty",
    colors: {
      "--primary-bg": "#8B0000", // Deep, rich red
      "--secondary-bg": "#5C0000", // Darker red-brown
      "--ui-panel-bg": "#A42A2A", // Lighter, opulent red panel
      "--button-bg": "#008080", // Emerald/Teal Green
      "--button-hover-bg": "#009A9A",
      "--button-active-bg": "#006A6A",
      "--button-text": "#FFF8DC",
      "--primary-text": "#FFF8DC", // Creamy off-white (Cornsilk)
      "--secondary-text": "#F5EAD5",
      "--accent-color": "#FFD700", // Bright, shining gold
      "--accent-text": "#5C0000", // Dark red text on gold
      "--rgb-accent-color": hexToRgbString("#FFD700"),
      "--highlight-bg": "rgba(255, 215, 0, 0.15)",
      "--border-color": "#A42A2A",
      "--accent-border-color": "#FFD700",
      "--error-text": "#FFA0A0",
      "--success-text": "#A0FFA0",
      "--disabled-bg": "#A42A2A",
      "--disabled-text": "#D4B0B0",
      "--button-action-bg": "#FFD700",
      "--button-action-hover-bg": "#E6C200",
      "--button-action-text": "#5C0000",
      "--button-delete-bg": "#008080",
      "--button-delete-hover-bg": "#006A6A",
      "--button-delete-text": "#FFF8DC",
      "--input-bg": "#5C0000",
      "--input-text": "#FFF8DC",
      "--input-placeholder-text": "#D4B0B0",
      "--progress-track-bg": "#A42A2A",
      "--map-background-color": "#5C0000",
      "--map-region-default-fill": "#A42A2A",
      "--map-region-border": "#8B0000",
      "--map-region-hover-fill": "#FFD700",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMerriweather,
    },
    styles: {
      "--panel-shadow": "0 6px 18px rgba(0,0,0,0.5)",
      "--button-shadow": "0 2px 4px rgba(0,0,0,0.3)",
      "--element-radius": "5px",
      "--border-width": "1px",
      "--focus-ring-color": "#FFD700",
      "--progress-value-color": "#008080",
      "--checkbox-accent-color": "#FFD700",
      "--input-focus-shadow-color": "rgba(255, 215, 0, 0.4)",
      "--transition-speed": "0.15s ease",
    },
  },
  fjordlandSaga: {
    name: "Fjordland Saga",
    colors: {
      "--primary-bg": "#1A2B2F", // Deep fjord blue/green
      "--secondary-bg": "#0E1A1D", // Near-black water
      "--ui-panel-bg": "#2C3E43", // Lighter, misty panel
      "--button-bg": "#6B7E85", // Steely grey
      "--button-hover-bg": "#7C8E95",
      "--button-active-bg": "#5B6E75",
      "--button-text": "#EAEFF1",
      "--primary-text": "#EAEFF1", // Pale, misty white
      "--secondary-text": "#C8D1D5",
      "--accent-color": "#6DE3FF", // Bright, icy blue
      "--accent-text": "#1A2B2F",
      "--rgb-accent-color": hexToRgbString("#6DE3FF"),
      "--highlight-bg": "rgba(109, 227, 255, 0.1)",
      "--border-color": "#4A5E63",
      "--accent-border-color": "#6DE3FF",
      "--error-text": "#FF8A8A",
      "--success-text": "#8AFF8A",
      "--disabled-bg": "#2C3E43",
      "--disabled-text": "#7C8E95",
      "--button-action-bg": "#6DE3FF",
      "--button-action-hover-bg": "#8DF3FF",
      "--button-action-text": "#1A2B2F",
      "--button-delete-bg": "#A52A2A", // Muted red like longship paint
      "--button-delete-hover-bg": "#8B1A1A",
      "--button-delete-text": "#EAEFF1",
      "--input-bg": "#0E1A1D",
      "--input-text": "#EAEFF1",
      "--input-placeholder-text": "#8C9EA5",
      "--progress-track-bg": "#2C3E43",
      "--map-background-color": "#0E1A1D",
      "--map-region-default-fill": "#2C3E43",
      "--map-region-border": "#1A2B2F",
      "--map-region-hover-fill": "#6DE3FF",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMontserrat,
    },
    styles: {
      "--panel-shadow": "0 4px 12px rgba(0,0,0,0.4)",
      "--button-shadow": "0 1px 3px rgba(0,0,0,0.2)",
      "--element-radius": "3px", // Sharp, carved edges
      "--border-width": "1px",
      "--focus-ring-color": "#6DE3FF",
      "--progress-value-color": "#6B7E85",
      "--checkbox-accent-color": "#6DE3FF",
      "--input-focus-shadow-color": "rgba(109, 227, 255, 0.35)",
      "--transition-speed": "0.15s ease",
    },
  },
  andeanTapestry: {
    name: "Andean Tapestry",
    colors: {
      "--primary-bg": "#F5F5DC", // Natural, unbleached wool (Beige)
      "--secondary-bg": "#E3BBA6", // Light terracotta/clay
      "--ui-panel-bg": "#FFFFFF",
      "--button-bg": "#5D4037", // Dark, earthy brown
      "--button-hover-bg": "#6D5047",
      "--button-active-bg": "#4D3027",
      "--button-text": "#FFFFFF",
      "--primary-text": "#5D4037",
      "--secondary-text": "#8D6E63",
      "--accent-color": "#C70039", // Vibrant cochineal red
      "--accent-text": "#FFFFFF",
      "--rgb-accent-color": hexToRgbString("#C70039"),
      "--highlight-bg": "rgba(199, 0, 57, 0.1)",
      "--border-color": "#D7CCC8",
      "--accent-border-color": "#C70039",
      "--error-text": "#C70039",
      "--success-text": "#2E7D32",
      "--disabled-bg": "#E0E0E0",
      "--disabled-text": "#A0A0A0",
      "--button-action-bg": "#FFC300", // Bright Incan gold/yellow
      "--button-action-hover-bg": "#E6B000",
      "--button-action-text": "#5D4037",
      "--button-delete-bg": "#5D4037",
      "--button-delete-hover-bg": "#4D3027",
      "--button-delete-text": "#FFFFFF",
      "--input-bg": "#F8F0E8",
      "--input-text": "#5D4037",
      "--input-placeholder-text": "#A1887F",
      "--progress-track-bg": "#E3BBA6",
      "--map-background-color": "#E3BBA6",
      "--map-region-default-fill": "#BCAAA4",
      "--map-region-border": "#FFFFFF",
      "--map-region-hover-fill": "rgba(255, 195, 0, 0.4)",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMontserrat,
    },
    styles: {
      "--panel-shadow": "0 2px 6px rgba(0,0,0,0.1)",
      "--button-shadow": "0 1px 2px rgba(0,0,0,0.08)",
      "--element-radius": "7px",
      "--border-width": "1px",
      "--focus-ring-color": "#C70039",
      "--progress-value-color": "#C70039",
      "--checkbox-accent-color": "#FFC300",
      "--input-focus-shadow-color": "rgba(255, 195, 0, 0.3)",
      "--transition-speed": "0.15s ease-in-out",
    },
  },
  brugesNocturne: {
    name: "Bruges Nocturne",
    colors: {
      "--primary-bg": "#3D2B1F", // Rich, dark chocolate brown
      "--secondary-bg": "#2A1D15", // Deeper espresso brown
      "--ui-panel-bg": "#4A3B2F", // Lighter wood/leather panel
      "--button-bg": "#4A4A4A", // Muted dark stone grey
      "--button-hover-bg": "#5A5A5A",
      "--button-active-bg": "#3A3A3A",
      "--button-text": "#FFF5E1",
      "--primary-text": "#FFF5E1", // Creamy off-white
      "--secondary-text": "#E0D5C1",
      "--accent-color": "#DAA520", // Warm, antique gold
      "--accent-text": "#3D2B1F",
      "--rgb-accent-color": hexToRgbString("#DAA520"),
      "--highlight-bg": "rgba(218, 165, 32, 0.15)",
      "--border-color": "#5A4B3F",
      "--accent-border-color": "#DAA520",
      "--error-text": "#F08080",
      "--success-text": "#98FB98",
      "--disabled-bg": "#4A3B2F",
      "--disabled-text": "#8A7B6F",
      "--button-action-bg": "#DAA520",
      "--button-action-hover-bg": "#C49510",
      "--button-action-text": "#3D2B1F",
      "--button-delete-bg": "#8B0000", // Deep Burgundy
      "--button-delete-hover-bg": "#7A0000",
      "--button-delete-text": "#FFF5E1",
      "--input-bg": "#2A1D15",
      "--input-text": "#FFF5E1",
      "--input-placeholder-text": "#A09080",
      "--progress-track-bg": "#4A3B2F",
      "--map-background-color": "#2A1D15",
      "--map-region-default-fill": "#4A3B2F",
      "--map-region-border": "#3D2B1F",
      "--map-region-hover-fill": "#DAA520",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMerriweather,
    },
    styles: {
      "--panel-shadow": "0 4px 14px rgba(0,0,0,0.45)",
      "--button-shadow": "0 1px 3px rgba(0,0,0,0.25)",
      "--element-radius": "4px",
      "--border-width": "1px",
      "--focus-ring-color": "#DAA520",
      "--progress-value-color": "#DAA520",
      "--checkbox-accent-color": "#DAA520",
      "--input-focus-shadow-color": "rgba(218, 165, 32, 0.35)",
      "--transition-speed": "0.15s ease",
    },
  },
  supergroveGlow: {
    name: "Supergrove Glow",
    colors: {
      "--primary-bg": "#101727", // Deep twilight blue
      "--secondary-bg": "#000000", // Pure black
      "--ui-panel-bg": "#1E293B", // Muted console blue
      "--button-bg": "#334155", // Dark neutral grey
      "--button-hover-bg": "#475569",
      "--button-active-bg": "#1E293B",
      "--button-text": "#F8F9FA",
      "--primary-text": "#F8F9FA", // Clean, digital white
      "--secondary-text": "#E2E8F0",
      "--accent-color": "#9333EA", // Vibrant bio-luminescent purple
      "--accent-text": "#FFFFFF",
      "--rgb-accent-color": hexToRgbString("#9333EA"),
      "--highlight-bg": "rgba(147, 51, 234, 0.15)",
      "--border-color": "#334155",
      "--accent-border-color": "#9333EA",
      "--error-text": "#F472B6", // Neon Pink
      "--success-text": "#A7F3D0",
      "--disabled-bg": "#1E293B",
      "--disabled-text": "#64748B",
      "--button-action-bg": "#34D399", // Glowing futuristic green
      "--button-action-hover-bg": "#45E3A9",
      "--button-action-text": "#101727",
      "--button-delete-bg": "#9333EA",
      "--button-delete-hover-bg": "#8A2BE2",
      "--button-delete-text": "#FFFFFF",
      "--input-bg": "#000000",
      "--input-text": "#F8F9FA",
      "--input-placeholder-text": "#94A3B8",
      "--progress-track-bg": "#1E293B",
      "--map-background-color": "#000000",
      "--map-region-default-fill": "#1E293B",
      "--map-region-border": "#101727",
      "--map-region-hover-fill": "#34D399",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontInter,
    },
    styles: {
      "--panel-shadow": "0 0 15px rgba(147, 51, 234, 0.2)", // Purple glow
      "--button-shadow": "0 1px 3px rgba(0,0,0,0.3)",
      "--element-radius": "4px",
      "--border-width": "1px",
      "--focus-ring-color": "#34D399",
      "--progress-value-color": "#34D399",
      "--checkbox-accent-color": "#9333EA",
      "--input-focus-shadow-color": "rgba(52, 211, 153, 0.35)",
      "--transition-speed": "0.15s linear",
    },
  },
  vienneseWaltz: {
    name: "Viennese Waltz",
    colors: {
      "--primary-bg": "#FCFBF4", // Soft, creamy off-white
      "--secondary-bg": "#F0F0ED", // Light, warm grey
      "--ui-panel-bg": "#FFFFFF",
      "--button-bg": "#70826C", // Muted sage green
      "--button-hover-bg": "#80927C",
      "--button-active-bg": "#60725C",
      "--button-text": "#FFFFFF",
      "--primary-text": "#363636", // Sophisticated dark charcoal
      "--secondary-text": "#707070",
      "--accent-color": "#C4A647", // Imperial, non-metallic gold
      "--accent-text": "#FFFFFF",
      "--rgb-accent-color": hexToRgbString("#C4A647"),
      "--highlight-bg": "rgba(196, 166, 71, 0.15)",
      "--border-color": "#DCDCDA",
      "--accent-border-color": "#C4A647",
      "--error-text": "#B22222", // Firebrick Red
      "--success-text": "#2E8B57",
      "--disabled-bg": "#E0E0E0",
      "--disabled-text": "#A0A0A0",
      "--button-action-bg": "#C4A647",
      "--button-action-hover-bg": "#B49637",
      "--button-action-text": "#FFFFFF",
      "--button-delete-bg": "#70826C",
      "--button-delete-hover-bg": "#60725C",
      "--button-delete-text": "#FFFFFF",
      "--input-bg": "#FFFFFF",
      "--input-text": "#363636",
      "--input-placeholder-text": "#A9A9A9",
      "--progress-track-bg": "#F0F0ED",
      "--map-background-color": "#F0F0ED",
      "--map-region-default-fill": "#C8C8C0",
      "--map-region-border": "#FFFFFF",
      "--map-region-hover-fill": "rgba(196, 166, 71, 0.4)",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMerriweather,
    },
    styles: {
      "--panel-shadow": "0 1px 5px rgba(0,0,0,0.08)",
      "--button-shadow": "0 1px 2px rgba(0,0,0,0.05)",
      "--element-radius": "4px",
      "--border-width": "1px",
      "--focus-ring-color": "#70826C",
      "--progress-value-color": "#70826C",
      "--checkbox-accent-color": "#C4A647",
      "--input-focus-shadow-color": "rgba(196, 166, 71, 0.25)",
      "--transition-speed": "0.2s ease-in-out",
    },
  },
  hyggeComfort: {
    name: "Hygge Comfort",
    colors: {
      "--primary-bg": "#F8F7F4", // Soft, warm off-white
      "--secondary-bg": "#EAE9E5", // Light, warm grey
      "--ui-panel-bg": "#FFFFFF",
      "--button-bg": "#3D4043", // Soft, dark charcoal
      "--button-hover-bg": "#4D5053",
      "--button-active-bg": "#2D3033",
      "--button-text": "#FFFFFF",
      "--primary-text": "#3D4043",
      "--secondary-text": "#7D8083",
      "--accent-color": "#B07D62", // Muted terracotta/leather
      "--accent-text": "#FFFFFF",
      "--rgb-accent-color": hexToRgbString("#B07D62"),
      "--highlight-bg": "rgba(176, 125, 98, 0.15)",
      "--border-color": "#DCDAD5",
      "--accent-border-color": "#B07D62",
      "--error-text": "#D9534F",
      "--success-text": "#5CB85C",
      "--disabled-bg": "#E0E0E0",
      "--disabled-text": "#A0A0A0",
      "--button-action-bg": "#B07D62",
      "--button-action-hover-bg": "#A06D52",
      "--button-action-text": "#FFFFFF",
      "--button-delete-bg": "#3D4043",
      "--button-delete-hover-bg": "#2D3033",
      "--button-delete-text": "#FFFFFF",
      "--input-bg": "#FDFCF9",
      "--input-text": "#3D4043",
      "--input-placeholder-text": "#A9A9A9",
      "--progress-track-bg": "#EAE9E5",
      "--map-background-color": "#EAE9E5",
      "--map-region-default-fill": "#C8C7C3",
      "--map-region-border": "#FFFFFF",
      "--map-region-hover-fill": "rgba(176, 125, 98, 0.4)",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontInter,
    },
    styles: {
      "--panel-shadow": "0 1px 3px rgba(0,0,0,0.05)",
      "--button-shadow": "0 1px 1px rgba(0,0,0,0.04)",
      "--element-radius": "6px",
      "--border-width": "1px",
      "--focus-ring-color": "#B07D62",
      "--progress-value-color": "#3D4043",
      "--checkbox-accent-color": "#B07D62",
      "--input-focus-shadow-color": "rgba(176, 125, 98, 0.3)",
      "--transition-speed": "0.15s ease-in-out",
    },
  },
  atacamaCopper: {
    name: "Atacama Copper",
    colors: {
      "--primary-bg": "#222831", // Deep mountainous grey
      "--secondary-bg": "#1A1D24", // Near-black
      "--ui-panel-bg": "#394867", // Deep glacial blue panel
      "--button-bg": "#5F6F8E", // Muted stone blue
      "--button-hover-bg": "#6F7F9E",
      "--button-active-bg": "#4F5F7E",
      "--button-text": "#EAEAEA",
      "--primary-text": "#EAEAEA", // Stark, high-contrast off-white
      "--secondary-text": "#C0C0C0",
      "--accent-color": "#D9793D", // Vibrant, metallic copper-orange
      "--accent-text": "#222831",
      "--rgb-accent-color": hexToRgbString("#D9793D"),
      "--highlight-bg": "rgba(217, 121, 61, 0.15)",
      "--border-color": "#394867",
      "--accent-border-color": "#D9793D",
      "--error-text": "#FF7F7F",
      "--success-text": "#7FFF7F",
      "--disabled-bg": "#394867",
      "--disabled-text": "#808A9E",
      "--button-action-bg": "#D9793D",
      "--button-action-hover-bg": "#C9692D",
      "--button-action-text": "#222831",
      "--button-delete-bg": "#5F6F8E",
      "--button-delete-hover-bg": "#4F5F7E",
      "--button-delete-text": "#EAEAEA",
      "--input-bg": "#1A1D24",
      "--input-text": "#EAEAEA",
      "--input-placeholder-text": "#8A8D91",
      "--progress-track-bg": "#394867",
      "--map-background-color": "#1A1D24",
      "--map-region-default-fill": "#394867",
      "--map-region-border": "#222831",
      "--map-region-hover-fill": "#D9793D",
    },
    fonts: {
      "--font-main": fontRobotoMono,
      "--font-heading": fontMontserrat,
    },
    styles: {
      "--panel-shadow": "0 5px 15px rgba(0,0,0,0.4)",
      "--button-shadow": "0 1px 2px rgba(0,0,0,0.2)",
      "--element-radius": "2px",
      "--border-width": "1px",
      "--focus-ring-color": "#D9793D",
      "--progress-value-color": "#5F6F8E",
      "--checkbox-accent-color": "#D9793D",
      "--input-focus-shadow-color": "rgba(217, 121, 61, 0.35)",
      "--transition-speed": "0.15s ease",
    },
  },
  straitsColonial: {
    name: "Straits Colonial",
    colors: {
      "--primary-bg": "#FAF5E9", // Light, creamy white
      "--secondary-bg": "#E3D5B8", // Light rattan/bamboo color
      "--ui-panel-bg": "#FFFFFF",
      "--button-bg": "#5D4037", // Dark, teak wood brown
      "--button-hover-bg": "#6D5047",
      "--button-active-bg": "#4D3027",
      "--button-text": "#FFFFFF",
      "--primary-text": "#5D4037",
      "--secondary-text": "#8D6E63",
      "--accent-color": "#006A4E", // Deep, tropical leaf green
      "--accent-text": "#FFFFFF",
      "--rgb-accent-color": hexToRgbString("#006A4E"),
      "--highlight-bg": "rgba(0, 106, 78, 0.1)",
      "--border-color": "#D7CCC8",
      "--accent-border-color": "#006A4E",
      "--error-text": "#C62828",
      "--success-text": "#2E7D32",
      "--disabled-bg": "#E0E0E0",
      "--disabled-text": "#A0A0A0",
      "--button-action-bg": "#D21404", // Vibrant hibiscus red
      "--button-action-hover-bg": "#B01000",
      "--button-action-text": "#FFFFFF",
      "--button-delete-bg": "#5D4037",
      "--button-delete-hover-bg": "#4D3027",
      "--button-delete-text": "#FFFFFF",
      "--input-bg": "#FFFFFF",
      "--input-text": "#5D4037",
      "--input-placeholder-text": "#A1887F",
      "--progress-track-bg": "#E3D5B8",
      "--map-background-color": "#E3D5B8",
      "--map-region-default-fill": "#BCAAA4",
      "--map-region-border": "#FFFFFF",
      "--map-region-hover-fill": "rgba(0, 106, 78, 0.4)",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMerriweather,
    },
    styles: {
      "--panel-shadow": "0 2px 8px rgba(0,0,0,0.1)",
      "--button-shadow": "0 1px 3px rgba(0,0,0,0.07)",
      "--element-radius": "5px",
      "--border-width": "1px",
      "--focus-ring-color": "#D21404",
      "--progress-value-color": "#006A4E",
      "--checkbox-accent-color": "#D21404",
      "--input-focus-shadow-color": "rgba(0, 106, 78, 0.25)",
      "--transition-speed": "0.15s ease-in-out",
    },
  },
  auroraVolcanic: {
    name: "Aurora Volcanic",
    colors: {
      "--primary-bg": "#121212", // Black volcanic rock
      "--secondary-bg": "#000000", // Deeper black
      "--ui-panel-bg": "#1E1E1E", // Dark grey panel
      "--button-bg": "#455A64", // Dark, glacial blue-grey
      "--button-hover-bg": "#556A74",
      "--button-active-bg": "#354A54",
      "--button-text": "#F0FFFF",
      "--primary-text": "#F0FFFF", // Icy white (Azure)
      "--secondary-text": "#C0D0D0",
      "--accent-color": "#39FF14", // Sharp, vibrant aurora green (Neon Green)
      "--accent-text": "#121212",
      "--rgb-accent-color": hexToRgbString("#39FF14"),
      "--highlight-bg": "rgba(57, 255, 20, 0.1)",
      "--border-color": "#333333",
      "--accent-border-color": "#39FF14",
      "--error-text": "#FF4D4D",
      "--success-text": "#7FFF7F",
      "--disabled-bg": "#1E1E1E",
      "--disabled-text": "#666666",
      "--button-action-bg": "#39FF14",
      "--button-action-hover-bg": "#59FF34",
      "--button-action-text": "#121212",
      "--button-delete-bg": "#B22222", // Firebrick red
      "--button-delete-hover-bg": "#9A1010",
      "--button-delete-text": "#F0FFFF",
      "--input-bg": "#000000",
      "--input-text": "#F0FFFF",
      "--input-placeholder-text": "#888888",
      "--progress-track-bg": "#1E1E1E",
      "--map-background-color": "#000000",
      "--map-region-default-fill": "#1E1E1E",
      "--map-region-border": "#121212",
      "--map-region-hover-fill": "#39FF14",
    },
    fonts: {
      "--font-main": fontRobotoMono,
      "--font-heading": fontRobotoMono,
    },
    styles: {
      "--panel-shadow": "0 0 12px rgba(57, 255, 20, 0.2)", // Green glow
      "--button-shadow": "0 2px 4px rgba(0,0,0,0.4)",
      "--element-radius": "2px",
      "--border-width": "1px",
      "--focus-ring-color": "#39FF14",
      "--progress-value-color": "#455A64",
      "--checkbox-accent-color": "#39FF14",
      "--input-focus-shadow-color": "rgba(57, 255, 20, 0.3)",
      "--transition-speed": "0.1s linear",
    },
  },
  puraVidaJungle: {
    name: "Pura Vida Jungle",
    colors: {
      "--primary-bg": "#F9F7F0", // Light, sandy off-white
      "--secondary-bg": "#E3F2E1", // Light, misty green
      "--ui-panel-bg": "#FFFFFF",
      "--button-bg": "#006994", // Pacific Blue
      "--button-hover-bg": "#007AA4",
      "--button-active-bg": "#005984",
      "--button-text": "#FFFFFF",
      "--primary-text": "#1E4D2B", // Deep jungle green
      "--secondary-text": "#4E7D5B",
      "--accent-color": "#F22C2C", // Vibrant toucan-red
      "--accent-text": "#FFFFFF",
      "--rgb-accent-color": hexToRgbString("#F22C2C"),
      "--highlight-bg": "rgba(242, 44, 44, 0.1)",
      "--border-color": "#D1E0CF",
      "--accent-border-color": "#F22C2C",
      "--error-text": "#C9302C",
      "--success-text": "#2E7D32",
      "--disabled-bg": "#E0E0E0",
      "--disabled-text": "#A0A0A0",
      "--button-action-bg": "#F22C2C",
      "--button-action-hover-bg": "#E01C1C",
      "--button-action-text": "#FFFFFF",
      "--button-delete-bg": "#006994",
      "--button-delete-hover-bg": "#005984",
      "--button-delete-text": "#FFFFFF",
      "--input-bg": "#FBFCFA",
      "--input-text": "#1E4D2B",
      "--input-placeholder-text": "#9CB09A",
      "--progress-track-bg": "#E3F2E1",
      "--map-background-color": "#E3F2E1",
      "--map-region-default-fill": "#B0D0AE",
      "--map-region-border": "#FFFFFF",
      "--map-region-hover-fill": "rgba(0, 105, 148, 0.4)",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMontserrat,
    },
    styles: {
      "--panel-shadow": "0 2px 7px rgba(0,0,0,0.1)",
      "--button-shadow": "0 1px 3px rgba(0,0,0,0.07)",
      "--element-radius": "8px", // Organic, rounded corners
      "--border-width": "1px",
      "--focus-ring-color": "#006994",
      "--progress-value-color": "#F22C2C",
      "--checkbox-accent-color": "#F22C2C",
      "--input-focus-shadow-color": "rgba(0, 105, 148, 0.25)",
      "--transition-speed": "0.15s ease-in-out",
    },
  },
  rioCarnival: {
    name: "Rio Carnival",
    colors: {
      "--primary-bg": "#1E1B4B", // Deep night purple
      "--secondary-bg": "#14113B", // Deeper purple
      "--ui-panel-bg": "#312E7B", // Saturated purple-blue panel
      "--button-bg": "#F472B6", // Hot Pink
      "--button-hover-bg": "#F682C6",
      "--button-active-bg": "#F262A6",
      "--button-text": "#1E1B4B",
      "--primary-text": "#F0F2FF",
      "--secondary-text": "#D0D4F0",
      "--accent-color": "#BEF264", // Electric Lime
      "--accent-text": "#1E1B4B",
      "--rgb-accent-color": hexToRgbString("#BEF264"),
      "--highlight-bg": "rgba(190, 242, 100, 0.15)",
      "--border-color": "#4A478B",
      "--accent-border-color": "#BEF264",
      "--error-text": "#F472B6",
      "--success-text": "#86EFAC",
      "--disabled-bg": "#312E7B",
      "--disabled-text": "#8A87BB",
      "--button-action-bg": "#00BFFF", // Electric Blue
      "--button-action-hover-bg": "#20CFFF",
      "--button-action-text": "#1E1B4B",
      "--button-delete-bg": "#F472B6", // Hot Pink for delete
      "--button-delete-hover-bg": "#F262A6",
      "--button-delete-text": "#1E1B4B",
      "--input-bg": "#14113B",
      "--input-text": "#F0F2FF",
      "--input-placeholder-text": "#8A87BB",
      "--progress-track-bg": "#312E7B",
      "--map-background-color": "#14113B",
      "--map-region-default-fill": "#312E7B",
      "--map-region-border": "#1E1B4B",
      "--map-region-hover-fill": "#BEF264",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMontserrat,
    },
    styles: {
      "--panel-shadow": "0 5px 15px rgba(0,0,0,0.5)",
      "--button-shadow": "0 2px 4px rgba(0,0,0,0.3)",
      "--element-radius": "10px", // Festive, rounded corners
      "--border-width": "1px",
      "--focus-ring-color": "#BEF264",
      "--progress-value-color": "#00BFFF",
      "--checkbox-accent-color": "#BEF264",
      "--input-focus-shadow-color": "rgba(190, 242, 100, 0.4)",
      "--transition-speed": "0.15s ease-out",
    },
  },
  pampasGaucho: {
    name: "Pampas Gaucho",
    colors: {
      "--primary-bg": "#F8F8F8", // Vast, open sky off-white
      "--secondary-bg": "#EAE5D9", // Dry grass beige
      "--ui-panel-bg": "#FFFFFF",
      "--button-bg": "#8B4513", // Rich saddle leather
      "--button-hover-bg": "#9A5523",
      "--button-active-bg": "#7A3503",
      "--button-text": "#FFFFFF",
      "--primary-text": "#4A3B32", // Dark, earthy brown
      "--secondary-text": "#7A6B62",
      "--accent-color": "#87CEEB", // Pale sky blue (Argentinian flag)
      "--accent-text": "#4A3B32",
      "--rgb-accent-color": hexToRgbString("#87CEEB"),
      "--highlight-bg": "rgba(135, 206, 235, 0.2)",
      "--border-color": "#D1CFC7",
      "--accent-border-color": "#87CEEB",
      "--error-text": "#D9534F",
      "--success-text": "#5CB85C",
      "--disabled-bg": "#E0E0E0",
      "--disabled-text": "#A0A0A0",
      "--button-action-bg": "#C0C0C0", // Silver (bombilla, knife)
      "--button-action-hover-bg": "#D0D0D0",
      "--button-action-text": "#4A3B32",
      "--button-delete-bg": "#8B4513",
      "--button-delete-hover-bg": "#7A3503",
      "--button-delete-text": "#FFFFFF",
      "--input-bg": "#FDFDFC",
      "--input-text": "#4A3B32",
      "--input-placeholder-text": "#A9A9A9",
      "--progress-track-bg": "#EAE5D9",
      "--map-background-color": "#EAE5D9",
      "--map-region-default-fill": "#B0C4DE",
      "--map-region-border": "#FFFFFF",
      "--map-region-hover-fill": "rgba(135, 206, 235, 0.4)",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMerriweather,
    },
    styles: {
      "--panel-shadow": "0 1px 4px rgba(0,0,0,0.07)",
      "--button-shadow": "0 1px 2px rgba(0,0,0,0.05)",
      "--element-radius": "5px",
      "--border-width": "1px",
      "--focus-ring-color": "#8B4513",
      "--progress-value-color": "#8B4513",
      "--checkbox-accent-color": "#87CEEB",
      "--input-focus-shadow-color": "rgba(135, 206, 235, 0.3)",
      "--transition-speed": "0.15s ease-in-out",
    },
  },
  lakeBled: {
    name: "Lake Bled",
    colors: {
      "--primary-bg": "#FCFFF5", // Very light cream
      "--secondary-bg": "#E3F2E1", // Muted light green
      "--ui-panel-bg": "#FFFFFF",
      "--button-bg": "#2F4F2F", // Deep forest green
      "--button-hover-bg": "#3F5F3F",
      "--button-active-bg": "#1F3F1F",
      "--button-text": "#FFFFFF",
      "--primary-text": "#2F4F2F", // Dark forest green
      "--secondary-text": "#5F7F5F",
      "--accent-color": "#00A99D", // Emerald/Turquoise lake water
      "--accent-text": "#FFFFFF",
      "--rgb-accent-color": hexToRgbString("#00A99D"),
      "--highlight-bg": "rgba(0, 169, 157, 0.1)",
      "--border-color": "#D1E0CF",
      "--accent-border-color": "#00A99D",
      "--error-text": "#D9534F",
      "--success-text": "#5CB85C",
      "--disabled-bg": "#E0E0E0",
      "--disabled-text": "#A0A0A0",
      "--button-action-bg": "#00A99D",
      "--button-action-hover-bg": "#00998D",
      "--button-action-text": "#FFFFFF",
      "--button-delete-bg": "#A0522D", // Muted wood brown
      "--button-delete-hover-bg": "#8B4513",
      "--button-delete-text": "#FFFFFF",
      "--input-bg": "#FBFCFA",
      "--input-text": "#2F4F2F",
      "--input-placeholder-text": "#A9B9A9",
      "--progress-track-bg": "#E3F2E1",
      "--map-background-color": "#E3F2E1",
      "--map-region-default-fill": "#B0D0AE",
      "--map-region-border": "#FFFFFF",
      "--map-region-hover-fill": "rgba(0, 169, 157, 0.4)",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMontserrat,
    },
    styles: {
      "--panel-shadow": "0 1px 4px rgba(0,0,0,0.06)",
      "--button-shadow": "0 1px 2px rgba(0,0,0,0.04)",
      "--element-radius": "7px",
      "--border-width": "1px",
      "--focus-ring-color": "#2F4F2F",
      "--progress-value-color": "#2F4F2F",
      "--checkbox-accent-color": "#00A99D",
      "--input-focus-shadow-color": "rgba(0, 169, 157, 0.25)",
      "--transition-speed": "0.15s ease-in-out",
    },
  },
  grandDuchy: {
    name: "Grand Duchy",
    colors: {
      "--primary-bg": "#2C3539", // Dark slate grey
      "--secondary-bg": "#1C2529", // Deeper slate
      "--ui-panel-bg": "#3C4549", // Lighter grey panel
      "--button-bg": "#344E41", // Deep forest green
      "--button-hover-bg": "#445E51",
      "--button-active-bg": "#243E31",
      "--button-text": "#EAEAEA",
      "--primary-text": "#EAEAEA",
      "--secondary-text": "#C0C0C0",
      "--accent-color": "#D4AF37", // Refined gold
      "--accent-text": "#2C3539",
      "--rgb-accent-color": hexToRgbString("#D4AF37"),
      "--highlight-bg": "rgba(212, 175, 55, 0.1)",
      "--border-color": "#4C5559",
      "--accent-border-color": "#D4AF37",
      "--error-text": "#E57373",
      "--success-text": "#81C784",
      "--disabled-bg": "#3C4549",
      "--disabled-text": "#8C9599",
      "--button-action-bg": "#D4AF37",
      "--button-action-hover-bg": "#C49F27",
      "--button-action-text": "#2C3539",
      "--button-delete-bg": "#8B0000", // Burgundy
      "--button-delete-hover-bg": "#7A0000",
      "--button-delete-text": "#EAEAEA",
      "--input-bg": "#1C2529",
      "--input-text": "#EAEAEA",
      "--input-placeholder-text": "#8C9599",
      "--progress-track-bg": "#3C4549",
      "--map-background-color": "#1C2529",
      "--map-region-default-fill": "#3C4549",
      "--map-region-border": "#2C3539",
      "--map-region-hover-fill": "#D4AF37",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMerriweather,
    },
    styles: {
      "--panel-shadow": "0 3px 10px rgba(0,0,0,0.4)",
      "--button-shadow": "0 1px 2px rgba(0,0,0,0.2)",
      "--element-radius": "4px",
      "--border-width": "1px",
      "--focus-ring-color": "#D4AF37",
      "--progress-value-color": "#344E41",
      "--checkbox-accent-color": "#D4AF37",
      "--input-focus-shadow-color": "rgba(212, 175, 55, 0.3)",
      "--transition-speed": "0.15s ease",
    },
  },
  vallettaKnights: {
    name: "Valletta Knights",
    colors: {
      "--primary-bg": "#F0EAD6", // Honey-toned limestone
      "--secondary-bg": "#E3DACE", // Lighter limestone
      "--ui-panel-bg": "#FFFFFF",
      "--button-bg": "#00008B", // Deep sea blue
      "--button-hover-bg": "#00009C",
      "--button-active-bg": "#00007A",
      "--button-text": "#FFFFFF",
      "--primary-text": "#3A3B3C", // Dark, grounded grey
      "--secondary-text": "#6A6B6C",
      "--accent-color": "#DC143C", // Crimson (Maltese cross)
      "--accent-text": "#FFFFFF",
      "--rgb-accent-color": hexToRgbString("#DC143C"),
      "--highlight-bg": "rgba(220, 20, 60, 0.1)",
      "--border-color": "#D1C3B8",
      "--accent-border-color": "#DC143C",
      "--error-text": "#C21807",
      "--success-text": "#2E8B57",
      "--disabled-bg": "#E0E0E0",
      "--disabled-text": "#A0A0A0",
      "--button-action-bg": "#DC143C",
      "--button-action-hover-bg": "#C01030",
      "--button-action-text": "#FFFFFF",
      "--button-delete-bg": "#00008B",
      "--button-delete-hover-bg": "#00007A",
      "--button-delete-text": "#FFFFFF",
      "--input-bg": "#FCF6E9",
      "--input-text": "#3A3B3C",
      "--input-placeholder-text": "#A0A0A0",
      "--progress-track-bg": "#E3DACE",
      "--map-background-color": "#E3DACE",
      "--map-region-default-fill": "#B0C4DE",
      "--map-region-border": "#FFFFFF",
      "--map-region-hover-fill": "rgba(220, 20, 60, 0.4)",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMerriweather,
    },
    styles: {
      "--panel-shadow": "0 2px 6px rgba(0,0,0,0.1)",
      "--button-shadow": "0 1px 3px rgba(0,0,0,0.08)",
      "--element-radius": "4px",
      "--border-width": "1px",
      "--focus-ring-color": "#00008B",
      "--progress-value-color": "#00008B",
      "--checkbox-accent-color": "#DC143C",
      "--input-focus-shadow-color": "rgba(220, 20, 60, 0.25)",
      "--transition-speed": "0.15s ease-in-out",
    },
  },
  istanbulBazaar: {
    name: "Istanbul Bazaar",
    colors: {
      "--primary-bg": "#3E2723", // Dark, warm brown
      "--secondary-bg": "#2A1A13", // Darker espresso
      "--ui-panel-bg": "#4E342E", // Richer, lighter brown panel
      "--button-bg": "#8D6E63", // Muted stone color
      "--button-hover-bg": "#9D7E73",
      "--button-active-bg": "#7D5E53",
      "--button-text": "#FFF3E0",
      "--primary-text": "#FFF3E0", // Warm, creamy off-white
      "--secondary-text": "#E0D3C0",
      "--accent-color": "#00B2A9", // Turkish tile turquoise
      "--accent-text": "#FFFFFF",
      "--rgb-accent-color": hexToRgbString("#00B2A9"),
      "--highlight-bg": "rgba(0, 178, 169, 0.15)",
      "--border-color": "#6D4C41",
      "--accent-border-color": "#00B2A9",
      "--error-text": "#EF9A9A",
      "--success-text": "#A5D6A7",
      "--disabled-bg": "#4E342E",
      "--disabled-text": "#A1887F",
      "--button-action-bg": "#FF8C00", // Lantern orange
      "--button-action-hover-bg": "#FF9C20",
      "--button-action-text": "#3E2723",
      "--button-delete-bg": "#BF360C", // Deep spicy red
      "--button-delete-hover-bg": "#AF2600",
      "--button-delete-text": "#FFF3E0",
      "--input-bg": "#2A1A13",
      "--input-text": "#FFF3E0",
      "--input-placeholder-text": "#BCAAA4",
      "--progress-track-bg": "#4E342E",
      "--map-background-color": "#2A1A13",
      "--map-region-default-fill": "#4E342E",
      "--map-region-border": "#3E2723",
      "--map-region-hover-fill": "#00B2A9",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMerriweather,
    },
    styles: {
      "--panel-shadow": "0 5px 15px rgba(0,0,0,0.45)",
      "--button-shadow": "0 2px 4px rgba(0,0,0,0.25)",
      "--element-radius": "6px",
      "--border-width": "1px",
      "--focus-ring-color": "#FF8C00",
      "--progress-value-color": "#00B2A9",
      "--checkbox-accent-color": "#FF8C00",
      "--input-focus-shadow-color": "rgba(0, 178, 169, 0.35)",
      "--transition-speed": "0.15s ease",
    },
  },
  haLongBay: {
    name: "Ha Long Bay",
    colors: {
      "--primary-bg": "#1E3A3A", // Deep, dark jade green
      "--secondary-bg": "#102A2A", // Darker jade
      "--ui-panel-bg": "#2E4A4A", // Lighter, misty jade panel
      "--button-bg": "#4A4A4A", // Charcoal rock
      "--button-hover-bg": "#5A5A5A",
      "--button-active-bg": "#3A3A3A",
      "--button-text": "#E0EAE6",
      "--primary-text": "#E0EAE6", // Misty off-white
      "--secondary-text": "#B8C6C0",
      "--accent-color": "#FFD700", // Gold/sun accent
      "--accent-text": "#1E3A3A",
      "--rgb-accent-color": hexToRgbString("#FFD700"),
      "--highlight-bg": "rgba(255, 215, 0, 0.1)",
      "--border-color": "#3E5A5A",
      "--accent-border-color": "#FFD700",
      "--error-text": "#F87171",
      "--success-text": "#86EFAC",
      "--disabled-bg": "#2E4A4A",
      "--disabled-text": "#7A8A8A",
      "--button-action-bg": "#FFD700",
      "--button-action-hover-bg": "#E6C200",
      "--button-action-text": "#1E3A3A",
      "--button-delete-bg": "#4A4A4A",
      "--button-delete-hover-bg": "#3A3A3A",
      "--button-delete-text": "#E0EAE6",
      "--input-bg": "#102A2A",
      "--input-text": "#E0EAE6",
      "--input-placeholder-text": "#7A8C82",
      "--progress-track-bg": "#2E4A4A",
      "--map-background-color": "#102A2A",
      "--map-region-default-fill": "#2E4A4A",
      "--map-region-border": "#1E3A3A",
      "--map-region-hover-fill": "#FFD700",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMontserrat,
    },
    styles: {
      "--panel-shadow": "0 4px 14px rgba(0,0,0,0.4)",
      "--button-shadow": "0 1px 3px rgba(0,0,0,0.2)",
      "--element-radius": "6px",
      "--border-width": "1px",
      "--focus-ring-color": "#FFD700",
      "--progress-value-color": "#4A4A4A",
      "--checkbox-accent-color": "#FFD700",
      "--input-focus-shadow-color": "rgba(255, 215, 0, 0.3)",
      "--transition-speed": "0.15s ease",
    },
  },
  cyberPunkNoir: {
    name: "CyberPunk Noir",
    colors: {
      "--primary-bg": "#0D0221", // Near-black purple
      "--secondary-bg": "#000000",
      "--ui-panel-bg": "#1D1231", // Dark purple panel
      "--button-bg": "#334155", // Cold metal grey
      "--button-hover-bg": "#475569",
      "--button-active-bg": "#1E293B",
      "--button-text": "#F0FFFF",
      "--primary-text": "#F0FFFF", // Azure, for digital text
      "--secondary-text": "#A0B0B0",
      "--accent-color": "#FF00FF", // Neon Magenta
      "--accent-text": "#FFFFFF",
      "--rgb-accent-color": hexToRgbString("#FF00FF"),
      "--highlight-bg": "rgba(255, 0, 255, 0.15)",
      "--border-color": "#333344",
      "--accent-border-color": "#FF00FF",
      "--error-text": "#FFFF00", // Warning Yellow
      "--success-text": "#00FF00", // Bright Lime Green
      "--disabled-bg": "#1D1231",
      "--disabled-text": "#6A627A",
      "--button-action-bg": "#00FFFF", // Electric Cyan
      "--button-action-hover-bg": "#20FFFF",
      "--button-action-text": "#0D0221",
      "--button-delete-bg": "#FF00FF",
      "--button-delete-hover-bg": "#E000E0",
      "--button-delete-text": "#FFFFFF",
      "--input-bg": "#000000",
      "--input-text": "#F0FFFF",
      "--input-placeholder-text": "#8A829A",
      "--progress-track-bg": "#1D1231",
      "--map-background-color": "#000000",
      "--map-region-default-fill": "#1D1231",
      "--map-region-border": "#0D0221",
      "--map-region-hover-fill": "#00FFFF",
    },
    fonts: {
      "--font-main": fontRobotoMono,
      "--font-heading": fontMontserrat,
    },
    styles: {
      "--panel-shadow": "0 0 10px rgba(0, 255, 255, 0.25)", // Cyan glow
      "--button-shadow": "0 1px 3px rgba(0,0,0,0.5)",
      "--element-radius": "2px", // Sharp, digital corners
      "--border-width": "1px",
      "--focus-ring-color": "#FF00FF",
      "--progress-value-color": "#00FFFF",
      "--checkbox-accent-color": "#FF00FF",
      "--input-focus-shadow-color": "rgba(255, 0, 255, 0.4)",
      "--transition-speed": "0.1s linear",
    },
  },
  anatoliaSunrise: {
    name: "Anatolian Sunrise",
    colors: {
      "--primary-bg": "#FFF8E1", // Pale, warm cream like sunrise clouds
      "--secondary-bg": "#FFECB3", // Soft, warm yellow
      "--ui-panel-bg": "#FFFFFF",
      "--button-bg": "#D32F2F", // Deep, rich red of Turkish carpets
      "--button-hover-bg": "#E53935",
      "--button-active-bg": "#C62828",
      "--button-text": "#FFFFFF",
      "--primary-text": "#4E342E", // Dark, earthy brown
      "--secondary-text": "#795548",
      "--accent-color": "#FFA000", // Vibrant sunrise orange
      "--accent-text": "#4E342E",
      "--rgb-accent-color": hexToRgbString("#FFA000"),
      "--highlight-bg": "rgba(255, 160, 0, 0.15)",
      "--border-color": "#FFE082",
      "--accent-border-color": "#FFA000",
      "--error-text": "#D32F2F",
      "--success-text": "#388E3C",
      "--disabled-bg": "#E0E0E0",
      "--disabled-text": "#A0A0A0",
      "--button-action-bg": "#FFA000",
      "--button-action-hover-bg": "#FFB300",
      "--button-action-text": "#4E342E",
      "--button-delete-bg": "#D32F2F",
      "--button-delete-hover-bg": "#C62828",
      "--button-delete-text": "#FFFFFF",
      "--input-bg": "#FFFDE7",
      "--input-text": "#4E342E",
      "--input-placeholder-text": "#A1887F",
      "--progress-track-bg": "#FFECB3",
      "--map-background-color": "#FFECB3",
      "--map-region-default-fill": "#FFD54F",
      "--map-region-border": "#FFFFFF",
      "--map-region-hover-fill": "rgba(255, 160, 0, 0.4)",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMerriweather,
    },
    styles: {
      "--panel-shadow": "0 2px 8px rgba(0,0,0,0.08)",
      "--button-shadow": "0 1px 3px rgba(0,0,0,0.06)",
      "--element-radius": "8px",
      "--border-width": "1px",
      "--focus-ring-color": "#FFA000",
      "--progress-value-color": "#D32F2F",
      "--checkbox-accent-color": "#FFA000",
      "--input-focus-shadow-color": "rgba(255, 160, 0, 0.3)",
      "--transition-speed": "0.15s ease-in-out",
    },
  },
  savannaGold: {
    name: "Savanna Gold",
    colors: {
      "--primary-bg": "#FDF6E3", // Pale, warm cream (dry grass)
      "--secondary-bg": "#F5EAD5", // Muted light sand
      "--ui-panel-bg": "#FFFFFF",
      "--button-bg": "#5D4037", // Dark, earthy brown (acacia wood)
      "--button-hover-bg": "#6D4C41",
      "--button-active-bg": "#4E342E",
      "--button-text": "#FFFFFF",
      "--primary-text": "#5D4037",
      "--secondary-text": "#8D6E63",
      "--accent-color": "#E65100", // Fiery sunset orange
      "--accent-text": "#FFFFFF",
      "--rgb-accent-color": hexToRgbString("#E65100"),
      "--highlight-bg": "rgba(230, 81, 0, 0.1)",
      "--border-color": "#D7CCC8",
      "--accent-border-color": "#E65100",
      "--error-text": "#BF360C",
      "--success-text": "#2E7D32",
      "--disabled-bg": "#E0E0E0",
      "--disabled-text": "#A0A0A0",
      "--button-action-bg": "#E65100",
      "--button-action-hover-bg": "#F57C00",
      "--button-action-text": "#FFFFFF",
      "--button-delete-bg": "#5D4037",
      "--button-delete-hover-bg": "#4E342E",
      "--button-delete-text": "#FFFFFF",
      "--input-bg": "#FEFBF3",
      "--input-text": "#5D4037",
      "--input-placeholder-text": "#A1887F",
      "--progress-track-bg": "#F5EAD5",
      "--map-background-color": "#F5EAD5",
      "--map-region-default-fill": "#BCAAA4",
      "--map-region-border": "#FFFFFF",
      "--map-region-hover-fill": "rgba(230, 81, 0, 0.4)",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMontserrat,
    },
    styles: {
      "--panel-shadow": "0 1px 4px rgba(0,0,0,0.07)",
      "--button-shadow": "0 1px 2px rgba(0,0,0,0.05)",
      "--element-radius": "5px",
      "--border-width": "1px",
      "--focus-ring-color": "#E65100",
      "--progress-value-color": "#5D4037",
      "--checkbox-accent-color": "#E65100",
      "--input-focus-shadow-color": "rgba(230, 81, 0, 0.25)",
      "--transition-speed": "0.15s ease-in-out",
    },
  },
  imperialForbiddenCity: {
    name: "Imperial Forbidden City",
    colors: {
      "--primary-bg": "#210B0B", // Black lacquered wood
      "--secondary-bg": "#110000", // Deeper black
      "--ui-panel-bg": "#8B0000", // Imperial red panel
      "--button-bg": "#4A3B32", // Dark wood tone
      "--button-hover-bg": "#5A4B42",
      "--button-active-bg": "#3A2B22",
      "--button-text": "#F0EAD6",
      "--primary-text": "#F0EAD6", // Creamy off-white
      "--secondary-text": "#D4CBB8",
      "--accent-color": "#FFD700", // Imperial gold
      "--accent-text": "#210B0B",
      "--rgb-accent-color": hexToRgbString("#FFD700"),
      "--highlight-bg": "rgba(255, 215, 0, 0.15)",
      "--border-color": "#A52A2A", // Brownish red
      "--accent-border-color": "#FFD700",
      "--error-text": "#F87171",
      "--success-text": "#86EFAC",
      "--disabled-bg": "#8B0000",
      "--disabled-text": "#D4B0B0",
      "--button-action-bg": "#FFD700",
      "--button-action-hover-bg": "#E6C200",
      "--button-action-text": "#210B0B",
      "--button-delete-bg": "#4A3B32",
      "--button-delete-hover-bg": "#3A2B22",
      "--button-delete-text": "#F0EAD6",
      "--input-bg": "#110000",
      "--input-text": "#F0EAD6",
      "--input-placeholder-text": "#A1887F",
      "--progress-track-bg": "#8B0000",
      "--map-background-color": "#110000",
      "--map-region-default-fill": "#8B0000",
      "--map-region-border": "#210B0B",
      "--map-region-hover-fill": "rgba(255, 215, 0, 0.4)",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMerriweather,
    },
    styles: {
      "--panel-shadow": "0 6px 18px rgba(0,0,0,0.6)",
      "--button-shadow": "0 2px 5px rgba(0,0,0,0.35)",
      "--element-radius": "4px",
      "--border-width": "1px",
      "--focus-ring-color": "#FFD700",
      "--progress-value-color": "#FFD700",
      "--checkbox-accent-color": "#FFD700",
      "--input-focus-shadow-color": "rgba(255, 215, 0, 0.4)",
      "--transition-speed": "0.15s ease",
    },
  },
  casablancaMint: {
    name: "Casablanca Mint",
    colors: {
      "--primary-bg": "#FFFFFF", // Crisp white buildings
      "--secondary-bg": "#F0F8FF", // Very pale sky blue
      "--ui-panel-bg": "#FFFFFF",
      "--button-bg": "#005A9C", // Deep Atlantic blue
      "--button-hover-bg": "#004C88",
      "--button-active-bg": "#003A72",
      "--button-text": "#FFFFFF",
      "--primary-text": "#2C3E50", // Dark charcoal blue
      "--secondary-text": "#5A6E80",
      "--accent-color": "#3EB489", // Vibrant mint green
      "--accent-text": "#FFFFFF",
      "--rgb-accent-color": hexToRgbString("#3EB489"),
      "--highlight-bg": "rgba(62, 180, 137, 0.15)",
      "--border-color": "#DDE5EC",
      "--accent-border-color": "#3EB489",
      "--error-text": "#D32F2F",
      "--success-text": "#388E3C",
      "--disabled-bg": "#E0E0E0",
      "--disabled-text": "#A0A0A0",
      "--button-action-bg": "#DAA520", // Warm gold accent
      "--button-action-hover-bg": "#C49510",
      "--button-action-text": "#FFFFFF",
      "--button-delete-bg": "#005A9C",
      "--button-delete-hover-bg": "#003A72",
      "--button-delete-text": "#FFFFFF",
      "--input-bg": "#F8FAFF",
      "--input-text": "#2C3E50",
      "--input-placeholder-text": "#A0AEC0",
      "--progress-track-bg": "#F0F8FF",
      "--map-background-color": "#F0F8FF",
      "--map-region-default-fill": "#B0C4DE",
      "--map-region-border": "#FFFFFF",
      "--map-region-hover-fill": "rgba(62, 180, 137, 0.4)",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMontserrat,
    },
    styles: {
      "--panel-shadow": "0 2px 6px rgba(0,0,0,0.06)",
      "--button-shadow": "0 1px 2px rgba(0,0,0,0.04)",
      "--element-radius": "6px",
      "--border-width": "1px",
      "--focus-ring-color": "#3EB489",
      "--progress-value-color": "#005A9C",
      "--checkbox-accent-color": "#3EB489",
      "--input-focus-shadow-color": "rgba(62, 180, 137, 0.25)",
      "--transition-speed": "0.15s ease-in-out",
    },
  },
  swedishArchipelago: {
    name: "Swedish Archipelago",
    colors: {
      "--primary-bg": "#F8F8F8", // Bright summer sky
      "--secondary-bg": "#EAEAEA", // Grey granite rocks
      "--ui-panel-bg": "#FFFFFF",
      "--button-bg": "#005B9A", // Deep Baltic sea blue
      "--button-hover-bg": "#006BB0",
      "--button-active-bg": "#004B8A",
      "--button-text": "#FFFFFF",
      "--primary-text": "#333333", // Dark charcoal
      "--secondary-text": "#666666",
      "--accent-color": "#C0292B", // Falu red of summer cottages
      "--accent-text": "#FFFFFF",
      "--rgb-accent-color": hexToRgbString("#C0292B"),
      "--highlight-bg": "rgba(192, 41, 43, 0.1)",
      "--border-color": "#DCDCDC",
      "--accent-border-color": "#C0292B",
      "--error-text": "#D9534F",
      "--success-text": "#5CB85C",
      "--disabled-bg": "#E0E0E0",
      "--disabled-text": "#A0A0A0",
      "--button-action-bg": "#C0292B",
      "--button-action-hover-bg": "#B0191B",
      "--button-action-text": "#FFFFFF",
      "--button-delete-bg": "#005B9A",
      "--button-delete-hover-bg": "#004B8A",
      "--button-delete-text": "#FFFFFF",
      "--input-bg": "#FDFDFD",
      "--input-text": "#333333",
      "--input-placeholder-text": "#A9A9A9",
      "--progress-track-bg": "#EAEAEA",
      "--map-background-color": "#EAEAEA",
      "--map-region-default-fill": "#B0C4DE",
      "--map-region-border": "#FFFFFF",
      "--map-region-hover-fill": "rgba(192, 41, 43, 0.4)",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontInter,
    },
    styles: {
      "--panel-shadow": "0 1px 3px rgba(0,0,0,0.05)",
      "--button-shadow": "none",
      "--element-radius": "4px",
      "--border-width": "1px",
      "--focus-ring-color": "#005B9A",
      "--progress-value-color": "#005B9A",
      "--checkbox-accent-color": "#C0292B",
      "--input-focus-shadow-color": "rgba(192, 41, 43, 0.25)",
      "--transition-speed": "0.15s ease-in-out",
    },
  },
  romanForum: {
    name: "Roman Forum",
    colors: {
      "--primary-bg": "#F5F5F5", // Off-white marble
      "--secondary-bg": "#E0E0E0", // Worn stone grey
      "--ui-panel-bg": "#FFFFFF",
      "--button-bg": "#4A2C2A", // Dark, aged wood/earth
      "--button-hover-bg": "#5A3C3A",
      "--button-active-bg": "#3A1C1A",
      "--button-text": "#FFFFFF",
      "--primary-text": "#333333", // Dark Charcoal
      "--secondary-text": "#6E6E6E",
      "--accent-color": "#6A0DAD", // Imperial Tyrian Purple
      "--accent-text": "#FFFFFF",
      "--rgb-accent-color": hexToRgbString("#6A0DAD"),
      "--highlight-bg": "rgba(106, 13, 173, 0.1)",
      "--border-color": "#C0C0C0", // Light grey
      "--accent-border-color": "#6A0DAD",
      "--error-text": "#B71C1C", // Deep Roman Red
      "--success-text": "#1B5E20",
      "--disabled-bg": "#D1D1D1",
      "--disabled-text": "#A1A1A1",
      "--button-action-bg": "#B71C1C", // Roman Red
      "--button-action-hover-bg": "#A70C0C",
      "--button-action-text": "#FFFFFF",
      "--button-delete-bg": "#4A2C2A",
      "--button-delete-hover-bg": "#3A1C1A",
      "--button-delete-text": "#FFFFFF",
      "--input-bg": "#FFFFFF",
      "--input-text": "#333333",
      "--input-placeholder-text": "#A9A9A9",
      "--progress-track-bg": "#E0E0E0",
      "--map-background-color": "#E0E0E0",
      "--map-region-default-fill": "#B0B0B0",
      "--map-region-border": "#FFFFFF",
      "--map-region-hover-fill": "rgba(106, 13, 173, 0.4)",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMerriweather,
    },
    styles: {
      "--panel-shadow": "0 2px 5px rgba(0,0,0,0.1)",
      "--button-shadow": "0 1px 2px rgba(0,0,0,0.08)",
      "--element-radius": "3px", // Chiseled, sharp corners
      "--border-width": "1px",
      "--focus-ring-color": "#6A0DAD",
      "--progress-value-color": "#6A0DAD",
      "--checkbox-accent-color": "#B71C1C",
      "--input-focus-shadow-color": "rgba(106, 13, 173, 0.25)",
      "--transition-speed": "0.15s ease-in-out",
    },
  },
  gangesMonsoon: {
    name: "Ganges Monsoon",
    colors: {
      "--primary-bg": "#E0E8E8", // Misty, light grey-blue
      "--secondary-bg": "#C8D0D0", // Wet stone grey
      "--ui-panel-bg": "#F5F5F5",
      "--button-bg": "#5D4037", // Wet earth brown
      "--button-hover-bg": "#6D4C41",
      "--button-active-bg": "#4E342E",
      "--button-text": "#FFFFFF",
      "--primary-text": "#37474F", // Dark Slate Grey
      "--secondary-text": "#607D8B",
      "--accent-color": "#FFC107", // Marigold Orange
      "--accent-text": "#37474F",
      "--rgb-accent-color": hexToRgbString("#FFC107"),
      "--highlight-bg": "rgba(255, 193, 7, 0.15)",
      "--border-color": "#B0BEC5",
      "--accent-border-color": "#FFC107",
      "--error-text": "#D32F2F",
      "--success-text": "#2E7D32",
      "--disabled-bg": "#CFD8DC",
      "--disabled-text": "#90A4AE",
      "--button-action-bg": "#FFC107",
      "--button-action-hover-bg": "#FFB300",
      "--button-action-text": "#37474F",
      "--button-delete-bg": "#5D4037",
      "--button-delete-hover-bg": "#4E342E",
      "--button-delete-text": "#FFFFFF",
      "--input-bg": "#ECEFF1",
      "--input-text": "#37474F",
      "--input-placeholder-text": "#90A4AE",
      "--progress-track-bg": "#C8D0D0",
      "--map-background-color": "#C8D0D0",
      "--map-region-default-fill": "#90A4AE",
      "--map-region-border": "#F5F5F5",
      "--map-region-hover-fill": "rgba(255, 193, 7, 0.4)",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMerriweather,
    },
    styles: {
      "--panel-shadow": "0 1px 4px rgba(0,0,0,0.07)",
      "--button-shadow": "0 1px 2px rgba(0,0,0,0.05)",
      "--element-radius": "6px", // Softer, water-like radius
      "--border-width": "1px",
      "--focus-ring-color": "#5D4037",
      "--progress-value-color": "#5D4037",
      "--checkbox-accent-color": "#FFC107",
      "--input-focus-shadow-color": "rgba(255, 193, 7, 0.3)",
      "--transition-speed": "0.15s ease-in-out",
    },
  },
  chichenItza: {
    name: "Chichen Itza",
    colors: {
      "--primary-bg": "#263238", // Dark stone grey
      "--secondary-bg": "#1A2226", // Deeper shadow
      "--ui-panel-bg": "#37474F", // Lighter stone panel
      "--button-bg": "#004D40", // Deep jungle green
      "--button-hover-bg": "#005D50",
      "--button-active-bg": "#003D30",
      "--button-text": "#E0E0E0",
      "--primary-text": "#E0E0E0", // Light grey, like moonlight on stone
      "--secondary-text": "#B0BEC5",
      "--accent-color": "#00ACC1", // Cenote/Jade Blue-Green
      "--accent-text": "#FFFFFF",
      "--rgb-accent-color": hexToRgbString("#00ACC1"),
      "--highlight-bg": "rgba(0, 172, 193, 0.1)",
      "--border-color": "#455A64",
      "--accent-border-color": "#00ACC1",
      "--error-text": "#EF9A9A",
      "--success-text": "#A5D6A7",
      "--disabled-bg": "#37474F",
      "--disabled-text": "#78909C",
      "--button-action-bg": "#00ACC1",
      "--button-action-hover-bg": "#00BCD4",
      "--button-action-text": "#FFFFFF",
      "--button-delete-bg": "#004D40",
      "--button-delete-hover-bg": "#003D30",
      "--button-delete-text": "#E0E0E0",
      "--input-bg": "#1A2226",
      "--input-text": "#E0E0E0",
      "--input-placeholder-text": "#78909C",
      "--progress-track-bg": "#37474F",
      "--map-background-color": "#1A2226",
      "--map-region-default-fill": "#37474F",
      "--map-region-border": "#263238",
      "--map-region-hover-fill": "#00ACC1",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMontserrat,
    },
    styles: {
      "--panel-shadow": "0 4px 12px rgba(0,0,0,0.4)",
      "--button-shadow": "0 1px 3px rgba(0,0,0,0.2)",
      "--element-radius": "3px",
      "--border-width": "1px",
      "--focus-ring-color": "#00ACC1",
      "--progress-value-color": "#004D40",
      "--checkbox-accent-color": "#00ACC1",
      "--input-focus-shadow-color": "rgba(0, 172, 193, 0.35)",
      "--transition-speed": "0.15s ease",
    },
  },
  windmillFields: {
    name: "Windmill Fields",
    colors: {
      "--primary-bg": "#F0F8FF", // Pale, cloudy sky blue
      "--secondary-bg": "#E6F0F8", // Slightly darker cloud
      "--ui-panel-bg": "#FFFFFF",
      "--button-bg": "#8B4513", // Windmill wood brown
      "--button-hover-bg": "#9A5523",
      "--button-active-bg": "#7A3503",
      "--button-text": "#FFFFFF",
      "--primary-text": "#3A2B1B", // Dark earthy brown
      "--secondary-text": "#6A5B4B",
      "--accent-color": "#D52B1E", // Vibrant Tulip Red
      "--accent-text": "#FFFFFF",
      "--rgb-accent-color": hexToRgbString("#D52B1E"),
      "--highlight-bg": "rgba(213, 43, 30, 0.1)",
      "--border-color": "#D0D8E0",
      "--accent-border-color": "#D52B1E",
      "--error-text": "#D52B1E",
      "--success-text": "#2E7D32", // Polder Green
      "--disabled-bg": "#E0E0E0",
      "--disabled-text": "#A0A0A0",
      "--button-action-bg": "#2E7D32", // Polder Green
      "--button-action-hover-bg": "#1E6D22",
      "--button-action-text": "#FFFFFF",
      "--button-delete-bg": "#8B4513",
      "--button-delete-hover-bg": "#7A3503",
      "--button-delete-text": "#FFFFFF",
      "--input-bg": "#F8FAFC",
      "--input-text": "#3A2B1B",
      "--input-placeholder-text": "#A19890",
      "--progress-track-bg": "#E6F0F8",
      "--map-background-color": "#E6F0F8",
      "--map-region-default-fill": "#B0C4DE",
      "--map-region-border": "#FFFFFF",
      "--map-region-hover-fill": "rgba(213, 43, 30, 0.4)",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMontserrat,
    },
    styles: {
      "--panel-shadow": "0 1px 4px rgba(0,0,0,0.07)",
      "--button-shadow": "0 1px 2px rgba(0,0,0,0.05)",
      "--element-radius": "5px",
      "--border-width": "1px",
      "--focus-ring-color": "#8B4513",
      "--progress-value-color": "#8B4513",
      "--checkbox-accent-color": "#D52B1E",
      "--input-focus-shadow-color": "rgba(213, 43, 30, 0.25)",
      "--transition-speed": "0.15s ease-in-out",
    },
  },
  maoriHeartland: {
    name: "Maori Heartland",
    colors: {
      "--primary-bg": "#F5F0E8", // Pale flax/paper color
      "--secondary-bg": "#EAE0D0", // Muted earth tone
      "--ui-panel-bg": "#FFFFFF",
      "--button-bg": "#222222", // Black (charcoal carving)
      "--button-hover-bg": "#333333",
      "--button-active-bg": "#111111",
      "--button-text": "#FFFFFF",
      "--primary-text": "#222222",
      "--secondary-text": "#555555",
      "--accent-color": "#9B2C2C", // Kōkōwai (Red Ochre)
      "--accent-text": "#FFFFFF",
      "--rgb-accent-color": hexToRgbString("#9B2C2C"),
      "--highlight-bg": "rgba(155, 44, 44, 0.1)",
      "--border-color": "#D1C7B8",
      "--accent-border-color": "#9B2C2C",
      "--error-text": "#C53030",
      "--success-text": "#2F855A", // Pounamu (Greenstone)
      "--disabled-bg": "#E0E0E0",
      "--disabled-text": "#A0A0A0",
      "--button-action-bg": "#9B2C2C",
      "--button-action-hover-bg": "#8A1C1C",
      "--button-action-text": "#FFFFFF",
      "--button-delete-bg": "#222222",
      "--button-delete-hover-bg": "#111111",
      "--button-delete-text": "#FFFFFF",
      "--input-bg": "#FDFBF5",
      "--input-text": "#222222",
      "--input-placeholder-text": "#A0A0A0",
      "--progress-track-bg": "#EAE0D0",
      "--map-background-color": "#EAE0D0",
      "--map-region-default-fill": "#B0A59A",
      "--map-region-border": "#FFFFFF",
      "--map-region-hover-fill": "rgba(155, 44, 44, 0.4)",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMontserrat,
    },
    styles: {
      "--panel-shadow": "0 2px 6px rgba(0,0,0,0.08)",
      "--button-shadow": "0 1px 3px rgba(0,0,0,0.06)",
      "--element-radius": "4px",
      "--border-width": "1px",
      "--focus-ring-color": "#9B2C2C",
      "--progress-value-color": "#2F855A",
      "--checkbox-accent-color": "#9B2C2C",
      "--input-focus-shadow-color": "rgba(155, 44, 44, 0.25)",
      "--transition-speed": "0.15s ease-in-out",
    },
  },
};

export const defaultTheme = "manilaDusk";

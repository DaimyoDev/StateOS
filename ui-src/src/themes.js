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

//const darkenColor = (hex, percent) => {
//hex = hex.replace(/^#/, "");
//let r = parseInt(hex.substring(0, 2), 16);
//let g = parseInt(hex.substring(2, 4), 16);
//let b = parseInt(hex.substring(4, 6), 16);

//r = Math.max(0, Math.floor(r * (1 - percent / 100)));
//g = Math.max(0, Math.floor(g * (1 - percent / 100)));
//b = Math.max(0, Math.floor(b * (1 - percent / 100)));

//return `#${r.toString(16).padStart(2, "0")}${g
//.toString(16)
//.padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
//};

//const lightenColor = (hex, percent) => {
//hex = hex.replace(/^#/, "");
//let r = parseInt(hex.substring(0, 2), 16);
//let g = parseInt(hex.substring(2, 4), 16);
//let b = parseInt(hex.substring(4, 6), 16);

//r = Math.min(255, Math.floor(r * (1 + percent / 100)));
//g = Math.min(255, Math.floor(g * (1 + percent / 100)));
//b = Math.min(255, Math.floor(b * (1 + percent / 100)));

//return `#${r.toString(16).padStart(2, "0")}${g
//.toString(16)
//.padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
//};

export const themes = {
  modernKyoto: {
    name: "Modern Kyoto",
    colors: {
      "--primary-bg": "#FBF6F0", // Very Light Cream/Warm Off-White (Washi paper)
      "--secondary-bg": "#F2EAE0", // Slightly darker, textured cream
      "--ui-panel-bg": "#FFFFFF", // Clean white panels

      "--button-bg": "#5A6A8C", // Muted Indigo/Slate Blue
      "--button-hover-bg": "#435273",
      "--button-active-bg": "#303D59",
      "--button-text": "#FFFFFF",

      "--primary-text": "#333333", // Dark Charcoal Grey (Sumi ink)
      "--secondary-text": "#767676", // Medium Grey
      "--accent-color": "#E6A3AD", // Muted Sakura Pink
      "--accent-text": "#FFFFFF", // White on pink
      "--rgb-accent-color": "230, 163, 173",

      "--highlight-bg": "rgba(230, 163, 173, 0.15)", // Faint pink highlight
      "--border-color": "#D8CFC4", // Light Bamboo/Wood tone border
      "--accent-border-color": "#E6A3AD", // Pink for focus

      "--error-text": "#D9534F",
      "--success-text": "#5CB85C",
      "--disabled-bg": "#E0E0E0",
      "--disabled-text": "#A0A0A0",

      "--button-action-bg": "#E6A3AD", // Sakura Pink for primary actions
      "--button-action-hover-bg": "#D98794",
      "--button-action-text": "#FFFFFF",

      "--button-delete-bg": "#767676", // Medium Grey for delete
      "--button-delete-hover-bg": "#5E5E5E",
      "--button-delete-text": "#FFFFFF",

      "--input-bg": "#F2EAE0", // Light cream inputs
      "--input-text": "#333333",
      "--input-placeholder-text": "#A0A0A0",
      "--progress-track-bg": "#D8CFC4",

      "--map-background-color": "#F0F4F8", // Light cool grey for map contrast
      "--map-region-default-fill": "#B0C4DE", // Light steel blue
      "--map-region-border": "#FFFFFF",
      "--map-region-hover-fill": "rgba(230, 163, 173, 0.4)", // Pink hover
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
};

export const defaultTheme = "manilaDusk";

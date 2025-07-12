// ui-src/src/themes.js

const fontInter = "'Inter', sans-serif";
const fontMontserrat = "'Montserrat', sans-serif";
const fontMerriweather = "'Merriweather', sans-serif";
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
  executiveDark: {
    name: "Executive Dark",
    colors: {
      "--primary-bg": "#161B22", // Very Dark, almost black desaturated blue (GitHub Dark Dimmed inspired)
      "--secondary-bg": "#0D1117", // Even darker for side panels or less emphasis areas
      "--ui-panel-bg": "#1C2128", // Main content panels, slightly lighter than primary

      "--button-bg": "#238636", // A deep, trustworthy Green (like GitHub's primary button)
      "--button-hover-bg": "#2EA043",
      "--button-active-bg": "#237334",
      "--button-text": "#FFFFFF",

      "--primary-text": "#C9D1D9",
      "--secondary-text": "#8B949E",
      "--accent-color": "#58A6FF",
      "--accent-text": "#FFFFFF",
      "--rgb-accent-color": "88, 166, 255",

      "--highlight-bg": "rgba(88, 166, 255, 0.2)", // Semi-transparent accent for list item hover/selection
      "--border-color": "#30363D", // Subtle border (GitHub Dark Dimmed borders)
      "--accent-border-color": "#58A6FF", // Accent color for focused inputs

      "--error-text": "#F85149", // GitHub-esque red for errors
      "--disabled-bg": "#21262D",
      "--disabled-text": "#484F58",

      "--success-text": "#3FB950",

      // Specific button types
      "--button-action-bg": "#3182CE", // Accent blue for primary actions
      "--button-action-hover-bg": "#1d3557", // Darker blue
      "--button-action-text": "#FFFFFF",

      "--button-delete-bg": "#DA3633", // A clear, but not overly harsh, red
      "--button-delete-hover-bg": "#B02A27",
      "--button-delete-text": "#FFFFFF",

      "--input-bg": "#0D1117", // Darkest background for inputs for contrast
      "--input-text": "#C9D1D9",
      "--input-placeholder-text": "#6E7681",
      "--progress-track-bg": "#21262D",

      "--map-background-color": "#0D1117", // Deepest background for the map area
      "--map-region-default-fill": "#2D3748", // Dark Slate Blue for unselected regions
      "--map-region-border": "#000000", // Primary BG for subtle borders
      "--map-region-hover-fill": "#58A6FF",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMontserrat, // Montserrat for distinct headings
    },
    styles: {
      "--panel-shadow": "0 6px 18px rgba(0, 0, 0, 0.4)", // Slightly deeper shadow
      "--button-shadow":
        "0 1px 2px rgba(0, 0, 0, 0.2), 0 2px 4px rgba(0,0,0,0.1)", // More subtle depth
      "--item-hover-shadow": "0 2px 5px rgba(0, 0, 0, 0.3)",
      "--input-focus-shadow-color": "rgba(88, 166, 255, 0.35)", // Accent blue glow
      "--element-radius": "6px",
      "--border-width": "1px",
      "--focus-ring-color": "#58A6FF",
      "--progress-value-color": "#238636", // Using the green button color for progress
      "--checkbox-accent-color": "#58A6FF",
      "--transition-speed": "0.15s ease-in-out",
    },
  },
  obsidianEmber: {
    name: "Obsidian Ember",
    colors: {
      "--primary-bg": "#121212",
      "--secondary-bg": "#1e1e1e",
      "--ui-panel-bg": "#282828",
      "--button-bg": "#333333", // General/Nav buttons
      "--button-hover-bg": "#404040",
      "--button-active-bg": "#616161", // Can be same as hover or slightly different
      "--button-text": "#ffffff", // For general/nav buttons

      "--primary-text": "#ffffff",
      "--secondary-text": "#fbe9e7", // Very light orange/off-white
      "--accent-color": "#ff4500", // Deep Red-Orange
      "--rgb-accent-color": "255, 69, 0",
      "--accent-text": "#ffffff", // Text on accent elements

      "--highlight-bg": "#404040", // For selected list items etc.
      "--border-color": "#424242",
      "--accent-border-color": "#ff4500", // For focused inputs etc.

      "--error-text": "#FF5252", // Brighter red for error text on dark bg
      "--disabled-bg": "#252525", // Slightly different from input/button
      "--disabled-text": "#757575",

      "--success-text": "#66BB6A",

      "--button-action-bg": "#ff4500",
      "--button-action-hover-bg": "#e63900",
      "--button-action-text": "#ffffff",

      "--button-delete-bg": "#502113", // Dark, desaturated red for delete buttons
      "--button-delete-hover-bg": "#732F1C", // Slightly lighter/more intense on hover
      "--button-delete-text": "#fbe9e7", // Light text for delete buttons

      "--input-bg": "#333333",
      "--input-text": "#ffffff",
      "--input-placeholder-text": "#9e9e9e",
      "--progress-track-bg": "#333333",

      "--map-background-color": "#1e1e1e", // Secondary bg for map area
      "--map-region-default-fill": "#383838", // A distinct dark grey for regions
      "--map-region-border": "#121212", // Primary bg for borders
      "--map-region-hover-fill": "rgba(255, 69, 0, 0.3)",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMontserrat,
    },
    styles: {
      "--panel-shadow": "0 5px 15px rgba(0, 0, 0, 0.35)",
      "--button-shadow": "0 2px 5px rgba(0, 0, 0, 0.25)",
      "--item-hover-shadow": "0 3px 8px rgba(0, 0, 0, 0.3)",
      "--input-focus-shadow-color": "rgba(255, 69, 0, 0.4)",
      "--element-radius": "4px", // Was 6px, adjusted to 4px for consistency with other new themes
      "--border-width": "1px",
      "--focus-ring-color": "#ff4500",
      "--progress-value-color": "#ff4500",
      "--checkbox-accent-color": "#ff4500",
      "--transition-speed": "0.15s ease-in-out",
    },
  },
  whitehallPaper: {
    name: "Whitehall Paper",
    colors: {
      "--primary-bg": "#F9FAFB", // Very light grey, almost white (Tailwind Gray 50)
      "--secondary-bg": "#F3F4F6", // Slightly darker off-white (Tailwind Gray 100)
      "--ui-panel-bg": "#FFFFFF", // Clean white panels

      "--button-bg": "#4B5563", // Medium-Dark Grey (Tailwind Gray 600)
      "--button-hover-bg": "#374151", // Darker Grey (Tailwind Gray 700)
      "--button-active-bg": "#1F2937", // Very Dark Grey (Tailwind Gray 800)
      "--button-text": "#FFFFFF",

      "--primary-text": "#111827", // Near Black for strong contrast (Tailwind Gray 900)
      "--secondary-text": "#374151", // Dark Grey (Tailwind Gray 700)
      "--accent-color": "#A72626", // Deep, traditional Red (like a seal or binding)
      "--accent-text": "#FFFFFF", // White text on accent
      "--rgb-accent-color": "167, 38, 38",

      "--highlight-bg": "#E5E7EB", // Light grey for selection (Tailwind Gray 200)
      "--border-color": "#D1D5DB", // Medium Grey Border (Tailwind Gray 300)
      "--accent-border-color": "#A72626", // Accent color for focused inputs

      "--error-text": "#DC2626", // Standard Red
      "--disabled-bg": "#E5E7EB",
      "--disabled-text": "#9CA3AF",

      "--success-text": "#2E7D32",

      "--button-action-bg": "#A72626", // Deep Red for primary actions
      "--button-action-hover-bg": "#7F1D1D", // Darker Red
      "--button-action-text": "#FFFFFF",

      "--button-delete-bg": "#6B7280", // Muted grey for delete
      "--button-delete-hover-bg": "#4B5563", // Darker muted
      "--button-delete-text": "#FFFFFF",

      "--input-bg": "#F3F4F6", // Light grey inputs
      "--input-text": "#111827",
      "--input-placeholder-text": "#6B7280",
      "--progress-track-bg": "#E5E7EB",

      "--map-background-color": "#F3F4F6", // Light grey background for map area
      "--map-region-default-fill": "#111827", // Slightly darker grey for regions
      "--map-region-border": "#6B7280", // White borders for crisp separation
      "--map-region-hover-fill": "#7F1D1D",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMerriweather, // Or a classic serif pixel font if you had one
    },
    styles: {
      "--panel-shadow": "0 2px 8px rgba(0, 0, 0, 0.08)", // Very subtle shadow for light theme
      "--button-shadow":
        "0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0,0,0,0.04)", // Minimal button shadow
      "--item-hover-shadow": "0 2px 4px rgba(0, 0, 0, 0.05)",
      "--input-focus-shadow-color": "rgba(167, 38, 38, 0.3)", // Accent red glow
      "--element-radius": "4px",
      "--border-width": "1px",
      "--focus-ring-color": "#A72626",
      "--progress-value-color": "#A72626",
      "--checkbox-accent-color": "#A72626",
      "--transition-speed": "0.15s ease-in-out",
    },
  },
  capitolDawn: {
    name: "Capitol Dawn",
    colors: {
      "--primary-bg": "#FFFBEB", // Warm Cream (Tailwind Yellow 50)
      "--secondary-bg": "#FEF3C7", // Light Yellow/Gold (Tailwind Yellow 100)
      "--ui-panel-bg": "#FFFDE7", // Very Light Cream panels

      "--button-bg": "#1E3A8A", // Deep Indigo/Presidential Blue (Tailwind Indigo 800)
      "--button-hover-bg": "#1E40AF", // (Tailwind Indigo 700)
      "--button-active-bg": "#1D4ED8", // (Tailwind Indigo 600)
      "--button-text": "#DBEAFE", // Light blueish white

      "--primary-text": "#37301F", // Dark Brown/Bronze for text
      "--secondary-text": "#785D3A", // Lighter Brown/Bronze
      "--accent-color": "#D97706", // Warm Gold/Amber (Tailwind Amber 600)
      "--accent-text": "#FFFFFF", // White text on gold
      "--rgb-accent-color": "217, 119, 6",

      "--highlight-bg": "rgba(217, 119, 6, 0.15)", // Semi-transparent gold
      "--border-color": "#FDE68A", // Soft Yellow Border (Tailwind Yellow 200)
      "--accent-border-color": "#D97706", // Gold for focused inputs

      "--error-text": "#B91C1C", // Deep Red
      "--disabled-bg": "#FEF3C7",
      "--disabled-text": "#B08D57",

      "--success-text": "#166534",

      "--button-action-bg": "#D97706", // Gold for primary actions
      "--button-action-hover-bg": "#B45309", // Darker Gold
      "--button-action-text": "#FFFFFF",

      "--button-delete-bg": "#785D3A", // Muted brown for delete
      "--button-delete-hover-bg": "#5C4B33", // Darker
      "--button-delete-text": "#FFFBEB",

      "--input-bg": "#FEF3C7",
      "--input-text": "#37301F",
      "--input-placeholder-text": "#B08D57",
      "--progress-track-bg": "#FEF3C7",

      "--map-background-color": "#FEF3C7", // Light Yellow/Gold for map area
      "--map-region-default-fill": "#1E3A8A", // Softer yellow for regions (Tailwind Yellow 300)
      "--map-region-border": "#FFFBEB", // Cream border
      "--map-region-hover-fill": "#D97706",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMerriweather, // Could even be a more traditional serif here if you had one
    },
    styles: {
      "--panel-shadow": "0 3px 10px rgba(120, 93, 58, 0.15)", // Soft brownish shadow
      "--button-shadow": "0 2px 4px rgba(30, 58, 138, 0.2)", // Subtle blue shadow for buttons
      "--item-hover-shadow": "0 2px 6px rgba(120, 93, 58, 0.1)",
      "--input-focus-shadow-color": "rgba(217, 119, 6, 0.4)", // Gold glow
      "--element-radius": "5px",
      "--border-width": "1px",
      "--focus-ring-color": "#D97706",
      "--progress-value-color": "#1E3A8A", // Blue progress on cream track
      "--checkbox-accent-color": "#D97706",
      "--transition-speed": "0.2s ease-in-out", // Slightly softer transitions
    },
  },
  midnightDispatch: {
    name: "Midnight Dispatch",
    colors: {
      "--primary-bg": "#0B0B0D", // Almost Black
      "--secondary-bg": "#101014", // Very Dark Grey
      "--ui-panel-bg": "#0D0D10", // Panels almost blend with primary

      "--button-bg": "#2A2A30", // Dark Neutral Grey buttons
      "--button-hover-bg": "#383840",
      "--button-active-bg": "#1E1E24",
      "--button-text": "#C0C0C8", // Light Grey text

      "--primary-text": "#E1E1E6", // Off-white, high contrast
      "--secondary-text": "#7D7D8A", // Muted grey
      "--accent-color": "#00FFFF", // Electric Cyan/Aqua
      "--accent-text": "#0B0B0D", // Black text on bright cyan for max contrast
      "--rgb-accent-color": "0, 255, 255",

      "--highlight-bg": "rgba(0, 255, 255, 0.15)", // Faint cyan glow
      "--border-color": "#2A2A30", // Very subtle borders, if any
      "--accent-border-color": "#00FFFF", // Cyan for focus

      "--error-text": "#FF4136", // Bright, clear Red
      "--disabled-bg": "#101014",
      "--disabled-text": "#4A4A52",

      "--success-text": "#4FFF8B",

      "--button-action-bg": "#00FFFF", // Electric Cyan for primary actions
      "--button-action-hover-bg": "#00E0E0", // Slightly less intense cyan
      "--button-action-text": "#0B0B0D", // Black text

      "--button-delete-bg": "#521414", // Very dark, almost black-red
      "--button-delete-hover-bg": "#701A1A",
      "--button-delete-text": "#E1E1E6",

      "--input-bg": "#101014",
      "--input-text": "#E1E1E6",
      "--input-placeholder-text": "#7D7D8A",
      "--progress-track-bg": "#101014",

      "--map-background-color": "#08080A", // Even darker for map, almost pure black
      "--map-region-default-fill": "#1C1C22", // Very dark grey-blue for regions
      "--map-region-border": "#000000", // Black borders for stark contrast
      "--map-region-hover-fill": "rgba(0, 255, 255, 0.2)",
    },
    fonts: {
      "--font-main": fontInter, // Could use Roboto Mono here for a more terminal feel
      "--font-heading": fontRobotoMono, // Or a sharp weight of Inter
    },
    styles: {
      "--panel-shadow": "0 0 15px rgba(0, 255, 255, 0.15)", // Diffused cyan glow instead of black shadow
      "--button-shadow": "0 0 5px rgba(0, 255, 255, 0.1)", // Subtle glow for buttons
      "--item-hover-shadow": "0 0 8px rgba(0, 255, 255, 0.2)",
      "--input-focus-shadow-color": "rgba(0, 255, 255, 0.5)", // Strong cyan glow
      "--element-radius": "2px", // Very sharp edges
      "--border-width": "1px", // Borders might be very subtle or same as bg
      "--focus-ring-color": "#00FFFF",
      "--progress-value-color": "#00FFFF",
      "--checkbox-accent-color": "#00FFFF",
      "--transition-speed": "0.1s ease-out", // Fast, snappy transitions
    },
  },
  councilChamberGreen: {
    name: "Council Chamber Green",
    colors: {
      "--primary-bg": "#F5F5F0", // Warm Off-White, like aged paper
      "--secondary-bg": "#EAEAE0", // Slightly darker, natural tone
      "--ui-panel-bg": "#FFFFFF", // White for clarity on panels

      "--button-bg": "#004D40", // Deep Teal/Forest Green (like classic desk leather)
      "--button-hover-bg": "#00695C",
      "--button-active-bg": "#00362D",
      "--button-text": "#E0F2F1", // Light teal/white

      "--primary-text": "#263238", // Very Dark Blue-Grey (like ink)
      "--secondary-text": "#546E7A", // Lighter Blue-Grey
      "--accent-color": "#8D6E63", // Warm, muted Brown (like polished wood or leather binding)
      "--accent-text": "#FFFFFF", // White text on brown
      "--rgb-accent-color": "141, 110, 99",

      "--highlight-bg": "rgba(141, 110, 99, 0.15)", // Faint brown highlight
      "--border-color": "#B0BEC5", // Soft Grey border
      "--accent-border-color": "#8D6E63", // Brown for focus

      "--error-text": "#B71C1C", // Deep, traditional Red
      "--disabled-bg": "#EAEAE0",
      "--disabled-text": "#78909C",

      "--success-text": "#004D40",

      "--button-action-bg": "#8D6E63", // Brown for primary actions
      "--button-action-hover-bg": "#6D4C41", // Darker Brown
      "--button-action-text": "#FFFFFF",

      "--button-delete-bg": "#757575", // Neutral Grey for delete
      "--button-delete-hover-bg": "#616161",
      "--button-delete-text": "#FFFFFF",

      "--input-bg": "#EAEAE0",
      "--input-text": "#263238",
      "--input-placeholder-text": "#78909C",
      "--progress-track-bg": "#EAEAE0",

      "--map-background-color": "#EAEAE0", // Matches secondary bg
      "--map-region-default-fill": "#00362D", // Desaturated green/grey
      "--map-region-border": "#FFFFFF", // White border
      "--map-region-hover-fill": "#8D6E63",
    },
    fonts: {
      "--font-main": fontInter, // Or a classic, readable Serif if you have one
      "--font-heading": fontMerriweather, // Montserrat has a sturdy, trustworthy feel
    },
    styles: {
      "--panel-shadow": "0 2px 5px rgba(0, 0, 0, 0.1)", // Very subtle, natural shadow
      "--button-shadow": "0 1px 2px rgba(0, 0, 0, 0.1)",
      "--item-hover-shadow": "0 1px 3px rgba(0, 0, 0, 0.08)",
      "--input-focus-shadow-color": "rgba(141, 110, 99, 0.4)", // Brown glow
      "--element-radius": "3px", // Slightly rounded, classic feel
      "--border-width": "1px",
      "--focus-ring-color": "#8D6E63",
      "--progress-value-color": "#004D40", // Green progress bar
      "--checkbox-accent-color": "#8D6E63",
      "--transition-speed": "0.18s ease-in-out",
    },
  },
  peoplesPlatform: {
    name: "People's Platform",
    colors: {
      "--primary-bg": "#EFF6FF", // Very Light Sky Blue (Tailwind Blue 50)
      "--secondary-bg": "#DBEAFE", // Light Blue (Tailwind Blue 100)
      "--ui-panel-bg": "#FFFFFF", // White panels for clarity

      "--button-bg": "#2563EB", // Strong, positive Blue (Tailwind Blue 600)
      "--button-hover-bg": "#1D4ED8", // (Tailwind Blue 700)
      "--button-active-bg": "#1E3A8A", // (Tailwind Blue 800)
      "--button-text": "#FFFFFF",

      "--primary-text": "#1F2937", // Dark Grey/Near Black (Tailwind Gray 800)
      "--secondary-text": "#4B5563", // Medium Grey (Tailwind Gray 600)
      "--accent-color": "#F59E0B", // Optimistic Yellow/Amber (Tailwind Amber 500)
      "--accent-text": "#422006", // Dark brown/black text on yellow accent for readability
      "--rgb-accent-color": "245, 158, 11",

      "--highlight-bg": "rgba(245, 158, 11, 0.15)", // Faint yellow highlight
      "--border-color": "#93C5FD", // Soft Blue Border (Tailwind Blue 300)
      "--accent-border-color": "#F59E0B", // Yellow for focus

      "--error-text": "#DC2626", // Strong Red
      "--disabled-bg": "#DBEAFE",
      "--disabled-text": "#60A5FA", // Lighter blue for disabled text

      "--success-text": "#15803D",

      "--button-action-bg": "#F59E0B", // Yellow for primary actions
      "--button-action-hover-bg": "#D97706", // Darker Yellow
      "--button-action-text": "#422006",

      "--button-delete-bg": "#EF4444", // Clear Red for delete
      "--button-delete-hover-bg": "#DC2626",
      "--button-delete-text": "#FFFFFF",

      "--input-bg": "#DBEAFE",
      "--input-text": "#1F2937",
      "--input-placeholder-text": "#60A5FA",
      "--progress-track-bg": "#DBEAFE",

      "--map-background-color": "#DBEAFE", // Light blue, matches secondary
      "--map-region-default-fill": "#1E3A8A", // Slightly darker blue for regions
      "--map-region-border": "#EFF6FF", // Primary bg for borders
      "--map-region-hover-fill": "#F59E0B",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMontserrat,
    },
    styles: {
      "--panel-shadow": "0 3px 8px rgba(0, 0, 0, 0.07)", // Soft, inviting shadow
      "--button-shadow": "0 2px 4px rgba(0, 0, 0, 0.05)",
      "--item-hover-shadow": "0 2px 5px rgba(0, 0, 0, 0.06)",
      "--input-focus-shadow-color": "rgba(245, 158, 11, 0.4)", // Yellow glow
      "--element-radius": "8px", // More rounded, friendly corners
      "--border-width": "1px",
      "--focus-ring-color": "#F59E0B",
      "--progress-value-color": "#2563EB", // Blue progress bar
      "--checkbox-accent-color": "#F59E0B",
      "--transition-speed": "0.15s ease-in-out",
    },
  },
  modernMinimalistLight: {
    name: "Modern Minimalist", // Or "Clean Slate"
    colors: {
      "--primary-bg": "#FFFFFF", // Pure White
      "--secondary-bg": "#F7F7F8", // Very Light Off-White/Gray
      "--ui-panel-bg": "#FFFFFF", // White panels

      "--button-bg": "#007AFF", // A clear, modern Blue (Apple-like)
      "--button-hover-bg": "#0056b3",
      "--button-active-bg": "#004085",
      "--button-text": "#FFFFFF",

      "--primary-text": "#222222", // Very Dark Grey (near black) for high contrast
      "--secondary-text": "#555555", // Medium Grey
      "--accent-color": "#007AFF", // Same as button blue for a clean accent
      "--accent-text": "#FFFFFF",
      "--rgb-accent-color": "0, 122, 255",

      "--highlight-bg": "rgba(0, 122, 255, 0.1)", // Faint blue highlight
      "--border-color": "#E1E1E1", // Light, subtle border
      "--accent-border-color": "#007AFF", // Blue for focus

      "--error-text": "#D32F2F", // Clear Red
      "--disabled-bg": "#F0F0F0",
      "--disabled-text": "#A0A0A0",

      "--success-text": "#2E7D32",

      "--button-action-bg": "#007AFF", // Blue for primary actions
      "--button-action-hover-bg": "#0056b3",
      "--button-action-text": "#FFFFFF",

      "--button-delete-bg": "#D32F2F", // Red for delete
      "--button-delete-hover-bg": "#B71C1C",
      "--button-delete-text": "#FFFFFF",

      "--input-bg": "#F7F7F8", // Very light grey for inputs
      "--input-text": "#222222",
      "--input-placeholder-text": "#A0A0A0",
      "--progress-track-bg": "#E1E1E1",

      "--map-background-color": "#F0F2F5", // A slightly cooler off-white for map area
      "--map-region-default-fill": "#D9E2EC", // Light desaturated blue/grey
      "--map-region-border": "#FFFFFF", // White borders
      "--map-region-hover-fill": "rgba(0, 122, 255, 0.3)",
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontInter,
    },
    styles: {
      "--panel-shadow": "0 1px 3px rgba(0, 0, 0, 0.06)", // Very minimal shadow
      "--button-shadow": "0 1px 2px rgba(0, 0, 0, 0.05)",
      "--item-hover-shadow": "0 1px 3px rgba(0, 0, 0, 0.08)",
      "--input-focus-shadow-color": "rgba(0, 122, 255, 0.25)", // Blue glow
      "--element-radius": "4px", // Sharp, slightly rounded corners
      "--border-width": "1px",
      "--focus-ring-color": "#007AFF",
      "--progress-value-color": "#007AFF", // Blue progress bar
      "--checkbox-accent-color": "#007AFF",
      "--transition-speed": "0.1s ease-in-out", // Quick transitions
    },
  },

  campaignTrailblazer: {
    name: "Campaign Trailblazer",
    colors: {
      "--primary-bg": "#F8F9FA", // Very Light Grey (Bootstrap's light gray)
      "--secondary-bg": "#F8F9FA", // White for cards, sidebars
      "--ui-panel-bg": "#FFFFFF", // White panels for content

      // Bold and energetic Teal/Cyan for primary interactions
      "--button-bg": "#17A2B8", // Info Blue/Teal (Bootstrap Info)
      "--button-hover-bg": "#138496", // Darker Teal
      "--button-active-bg": "#117A8B", // Even Darker Teal
      "--button-text": "#FFFFFF",

      "--primary-text": "#212529", // Standard Dark text (Bootstrap default)
      "--secondary-text": "#495057", // Medium Dark Grey
      // Vibrant Accent - let's try a bold, warm Orange/Yellow
      "--accent-color": "#FFC107", // Warning Yellow/Amber (Bootstrap Warning)
      "--accent-text": "#212529", // Dark text on this yellow for readability
      "--rgb-accent-color": "255, 193, 7", // For RGBA usage

      "--highlight-bg": "rgba(23, 162, 184, 0.1)", // Faint Teal highlight (from button-bg)
      "--border-color": "#DEE2E6", // Standard light border (Bootstrap default)
      "--accent-border-color": "#FFC107", // Yellow accent for focus

      "--error-text": "#DC3545", // Standard Red (Bootstrap Danger)
      "--disabled-bg": "#E9ECEF", // Light grey for disabled
      "--disabled-text": "#6C757D", // Muted text for disabled

      "--success-text": "#28A745",

      // Action buttons will use the main button color or a distinct one
      "--button-action-bg": "#17A2B8", // Teal for primary actions
      "--button-action-hover-bg": "#138496",
      "--button-action-text": "#FFFFFF",

      "--button-delete-bg": "#DC3545", // Red for delete
      "--button-delete-hover-bg": "#C82333",
      "--button-delete-text": "#FFFFFF",

      "--input-bg": "#FFFFFF", // White inputs
      "--input-text": "#495057",
      "--input-placeholder-text": "#6C757D",
      "--progress-track-bg": "#E9ECEF",

      "--map-background-color": "#E9ECEF", // Light grey for map area
      "--map-region-default-fill": "#6C757D", // Medium grey for regions
      "--map-region-border": "#F8F9FA", // Primary bg for borders
      "--map-region-hover-fill": "rgba(23, 162, 184, 0.4)", // Teal hover for map
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMontserrat, // Montserrat for bold, clear headings
    },
    styles: {
      "--panel-shadow": "0 4px 12px rgba(0, 0, 0, 0.1)", // Clear, modern shadow
      "--button-shadow": "0 2px 4px rgba(0, 0, 0, 0.07)", // Subtle shadow on buttons
      "--item-hover-shadow": "0 3px 8px rgba(0, 0, 0, 0.12)",
      "--input-focus-shadow-color": "rgba(23, 162, 184, 0.35)", // Teal glow for inputs
      "--element-radius": "6px", // Slightly rounded, modern feel
      "--border-width": "1px",
      "--focus-ring-color": "#17A2B8", // Teal focus ring
      "--progress-value-color": "#17A2B8", // Teal progress bar
      "--checkbox-accent-color": "#17A2B8", // Teal for checkboxes
      "--transition-speed": "0.15s ease-in-out",
    },
  },
  retroSpice: {
    // Renamed to reflect expansion
    name: "Retro Spice",
    colors: {
      // Backgrounds - Using your darkest for a deep, rich feel
      "--primary-bg": "#3C1518",
      "--secondary-bg": "#69140E",
      "--ui-panel-bg": "#2F1113",

      // Buttons - Using your mid to lighter tones
      "--button-bg": "#D58936", // CaramelOrangeBrown - Primary clickable elements
      "--button-hover-bg": "#A44200", // RustOrangeBrown - Hover
      "--button-active-bg": "#69140E", // DarkRedBrown - Active (Ensure contrast with button text)
      "--button-text": "#FFFBF0", // LightCreamBg - For good contrast on caramel/rust buttons

      // Text - Main text needs to be very light against dark backgrounds
      "--primary-text": "#FFFBF0", // LightCreamBg - For primary text on dark backgrounds
      "--secondary-text": "#D58936", // CaramelOrangeBrown - For less important text, ensure contrast with its BG

      // Accent - Your vibrant yellow is the natural choice
      "--accent-color": "#FFF94F", // VibrantYellow
      "--accent-text": "#3C1518", // DarkestBrown - Text on yellow accent elements
      "--rgb-accent-color": "255, 249, 79", // RGB for VibrantYellow

      "--highlight-bg": "rgba(255, 249, 79, 0.1)", // Very faint yellow highlight for hovers/selections
      "--border-color": "#A44200", // RustOrangeBrown - For borders on panels or inputs
      "--accent-border-color": "#FFF94F", // Yellow for focused input borders

      "--error-text": "#FF6B6B", // A brighter, clearer red for errors on dark backgrounds
      "--success-text": "#66BB6A", // A clear green for success messages
      "--disabled-bg": "#2F1113", // Similar to secondary-bg but could be more muted
      "--disabled-text": "#7D6A5C", // Brownish Gray for disabled text

      // Specific Button Types
      "--button-action-bg": "#FFF94F", // VibrantYellow for main "go" actions
      "--button-action-hover-bg": "#E0DA40", // MutedYellowText (darker yellow)
      "--button-action-text": "#3C1518", // DarkestBrown text

      "--button-delete-bg": "#A44200", // RustOrangeBrown for delete
      "--button-delete-hover-bg": "#69140E", // DarkRedBrown
      "--button-delete-text": "#FFFBF0", // LightCream text

      "--input-bg": "#2F1113", // Dark background for inputs
      "--input-text": "#FFF94F", // Yellow text in inputs
      "--input-placeholder-text": "#A44200", // Rust for placeholder
      "--progress-track-bg": "#69140E", // DarkRedBrown track

      // Map Colors
      "--map-background-color": "#3C1518", // Darkest for map area
      "--map-region-default-fill": "#A44200", // Rust for regions
      "--map-region-border": "#69140E", // Dark reddish-brown border
      "--map-region-hover-fill": "rgba(255, 249, 79, 0.3)", // Semi-transparent yellow hover
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMontserrat,
    },
    styles: {
      "--panel-shadow": "0 3px 8px rgba(0, 0, 0, 0.6)", // Stronger shadow for dark theme depth
      "--button-shadow": "0 1px 2px rgba(0, 0, 0, 0.5)",
      "--item-hover-shadow": "0 2px 5px rgba(0, 0, 0, 0.55)",
      "--input-focus-shadow-color": "rgba(255, 249, 79, 0.3)", // Yellow glow
      "--element-radius": "4px",
      "--border-width": "1px",
      "--focus-ring-color": "#FFF94F",
      "--progress-value-color": "#D58936", // Caramel for progress bar value
      "--checkbox-accent-color": "#FFF94F",
      "--transition-speed": "0.18s ease-in-out",
    },
  },
  coastalMorning: {
    name: "Coastal Morning",
    colors: {
      // Backgrounds - Light and airy
      "--primary-bg": "#E9F1F7", // Very light cool blue (main background)
      "--secondary-bg": "#FFFFFF", // Pure white for sidebars or distinct sections
      "--ui-panel-bg": "#E7DFC6", // Light cream for content panels, cards - offers warmth

      // Buttons - Using the strong blue as the primary interactive color
      "--button-bg": "#2274A5", // Strong Blue
      "--button-hover-bg": "#1B5E8A", // Darker shade of the Strong Blue
      "--button-active-bg": "#154B6E", // Even darker
      "--button-text": "#FFFFFF", // White text on blue buttons

      // Text - Dark text for readability on light backgrounds
      "--primary-text": "#131B23", // Very Dark Blue/Black for main text
      "--secondary-text": "#816C61", // Muted Brown for less emphasized text

      // Accent - The Muted Brown can act as a sophisticated accent, or use the Strong Blue as primary accent
      // Let's use Strong Blue as the main interactive/accent and Muted Brown for secondary elements/text
      "--accent-color": "#2274A5", // Strong Blue as the primary accent
      "--accent-text": "#FFFFFF", // White text on the blue accent
      "--rgb-accent-color": "34, 116, 165", // RGB for #2274A5

      "--highlight-bg": "rgba(34, 116, 165, 0.1)", // Faint blue highlight for hovers/selections
      "--border-color": "#D0C9B8", // A slightly darker cream/beige for borders on panels (derived from E7DFC6)
      "--accent-border-color": "#2274A5", // Blue for focused input borders

      "--error-text": "#D32F2F", // Standard clear Red
      "--success-text": "#388E3C", // Standard clear Green
      "--disabled-bg": "#E0E0E0", // Light neutral grey for disabled
      "--disabled-text": "#A0A0A0", // Medium grey for disabled text

      // Specific Button Types
      "--button-action-bg": "#2274A5", // Strong Blue for primary "go" actions
      "--button-action-hover-bg": "#1B5E8A",
      "--button-action-text": "#FFFFFF",

      "--button-delete-bg": "#C62828", // A slightly desaturated Red for delete
      "--button-delete-hover-bg": "#B71C1C",
      "--button-delete-text": "#FFFFFF",

      "--input-bg": "#FFFFFF", // White background for inputs (on cream panels)
      "--input-text": "#131B23", // Dark text in inputs
      "--input-placeholder-text": "#816C61", // Muted Brown for placeholder
      "--progress-track-bg": "#D0C9B8", // Creamy border color for track

      // Map Colors
      "--map-background-color": "#E9F1F7", // Light cool blue for map area
      "--map-region-default-fill": "#B0C4DE", // Light Steel Blue for regions
      "--map-region-border": "#FFFFFF", // White border for crispness
      "--map-region-hover-fill": "rgba(34, 116, 165, 0.4)", // Semi-transparent strong blue hover
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMontserrat,
    },
    styles: {
      "--panel-shadow": "0 2px 6px rgba(0, 0, 0, 0.08)", // Softer, more diffused shadow for light theme
      "--button-shadow": "0 1px 3px rgba(0, 0, 0, 0.1)", // Subtle button shadow
      "--item-hover-shadow": "0 2px 5px rgba(0, 0, 0, 0.1)",
      "--input-focus-shadow-color": "rgba(34, 116, 165, 0.25)", // Blue glow
      "--element-radius": "6px", // Modern rounded corners
      "--border-width": "1px",
      "--focus-ring-color": "#2274A5", // Blue focus ring
      "--progress-value-color": "#2274A5", // Blue progress bar
      "--checkbox-accent-color": "#2274A5", // Blue for checkboxes
      "--transition-speed": "0.15s ease-in-out",
    },
  },
  heritageArchive: {
    name: "Heritage Archive",
    colors: {
      // Backgrounds: Using the cream as the main light background for readability.
      "--primary-bg": "#E7D7C1", // Light Cream (parchment-like main background)
      "--secondary-bg": "#F3EDE2", // Even Lighter Cream (for sidebars, subtle variations)
      "--ui-panel-bg": "#FFFFFF", // Clean White for panels if a brighter contrast is desired,
      // OR use a slightly textured version of the cream:
      // "--ui-panel-bg": "#EFE5D6", // Slightly textured cream

      // Buttons: Using the reds and browns for a classic, authoritative feel.
      "--button-bg": "#735751", // Medium-Dark Brown
      "--button-hover-bg": "#A78A7F", // Dusty Brownish-Grey (lighter for hover)
      "--button-active-bg": "#5C453F", // Darker shade of the Medium-Dark Brown
      "--button-text": "#E7D7C1", // Light Cream text on brown buttons

      // Text: Darkest red/brown for primary text on light backgrounds.
      "--primary-text": "#8C1C13", // Deep Dark Rich Red (for headings and important text)
      "--secondary-text": "#735751", // Medium-Dark Brown (for body text, good on cream)

      // Accent: The Muted Earthy Red or the Dusty Brownish Grey. Let's try the red.
      "--accent-color": "#BF4342", // Muted Earthy Red
      "--accent-text": "#FFFFFF", // White text on this red accent
      "--rgb-accent-color": "191, 67, 66", // RGB for #BF4342

      "--highlight-bg": "rgba(191, 67, 66, 0.1)", // Faint red highlight
      "--border-color": "#A78A7F", // Dusty Brownish-Grey for borders
      "--accent-border-color": "#BF4342", // Muted Red for focused input borders

      "--error-text": "#C62828", // A deep but clear red for errors
      "--success-text": "#2E7D32", // A deep, respectable green
      "--disabled-bg": "#D0C9B8", // A desaturated version of the cream for disabled
      "--disabled-text": "#A78A7F", // Dusty Brownish-Grey for disabled text

      // Specific Button Types
      "--button-action-bg": "#8C1C13", // Deep Dark Rich Red for primary "go" actions
      "--button-action-hover-bg": "#6E160F", // Darker shade
      "--button-action-text": "#E7D7C1", // Light Cream text

      "--button-delete-bg": "#BF4342", // Muted Earthy Red for delete
      "--button-delete-hover-bg": "#A83A39", // Slightly darker
      "--button-delete-text": "#FFFFFF",

      "--input-bg": "#F3EDE2", // Lighter Cream for inputs (on the primary cream BG)
      "--input-text": "#735751", // Medium-Dark Brown text in inputs
      "--input-placeholder-text": "#A78A7F", // Dusty Brownish-Grey for placeholder
      "--progress-track-bg": "#D0C9B8", // Desaturated cream for track

      // Map Colors
      "--map-background-color": "#E7D7C1", // Parchment background for map area
      "--map-region-default-fill": "#A78A7F", // Dusty Brownish-Grey for regions
      "--map-region-border": "#735751", // Medium-Dark Brown border
      "--map-region-hover-fill": "rgba(191, 67, 66, 0.4)", // Semi-transparent muted red hover
    },
    fonts: {
      "--font-main": fontInter, // Inter for readability
      "--font-heading": fontMerriweather, // Montserrat can give a slightly classic but clean feel
      // Could consider a serif font here for a more "archival" feel if desired.
    },
    styles: {
      "--panel-shadow": "0 2px 5px rgba(115, 87, 81, 0.2)", // Softer, brownish shadow
      "--button-shadow": "0 1px 2px rgba(115, 87, 81, 0.15)",
      "--item-hover-shadow": "0 2px 4px rgba(115, 87, 81, 0.2)",
      "--input-focus-shadow-color": "rgba(191, 67, 66, 0.25)", // Muted Red glow
      "--element-radius": "3px", // Slightly sharper, more traditional corners
      "--border-width": "1px",
      "--focus-ring-color": "#BF4342", // Muted Red focus ring
      "--progress-value-color": "#8C1C13", // Deep Dark Red for progress bar
      "--checkbox-accent-color": "#BF4342", // Muted Red for checkboxes
      "--transition-speed": "0.18s ease-in-out", // Slightly more deliberate transitions
    },
  },
  colonialDawn: {
    name: "Colonial Dawn",
    colors: {
      "--primary-bg": "#F0F2F5", // Light, slightly cool off-white (like federal stone)
      "--secondary-bg": "#FFFFFF", // White for contrast elements
      "--ui-panel-bg": "#F8F9FA", // Panels are clean and light

      "--button-bg": "#003366", // Classic Navy Blue
      "--button-hover-bg": "#002244", // Darker Navy
      "--button-active-bg": "#001122", // Very Dark Navy
      "--button-text": "#FFFFFF",

      "--primary-text": "#212529", // Standard Dark for readability
      "--secondary-text": "#4A5568", // Slate Grey
      "--accent-color": "#B31B1B", // Heritage Red (not too bright, more of a deep cranberry)
      "--accent-text": "#FFFFFF",
      "--rgb-accent-color": "179, 27, 27",

      "--highlight-bg": "rgba(179, 27, 27, 0.1)", // Faint red highlight
      "--border-color": "#CBD5E0", // Light Grey-Blue border
      "--accent-border-color": "#B31B1B", // Red for focus

      "--error-text": "#C53030",
      "--success-text": "#2F855A", // A traditional dark green
      "--disabled-bg": "#E2E8F0",
      "--disabled-text": "#A0AEC0",

      "--button-action-bg": "#B31B1B", // Heritage Red for primary actions
      "--button-action-hover-bg": "#901616",
      "--button-action-text": "#FFFFFF",

      "--button-delete-bg": "#718096", // Muted Slate for delete
      "--button-delete-hover-bg": "#4A5568",
      "--button-delete-text": "#FFFFFF",

      "--input-bg": "#FFFFFF",
      "--input-text": "#212529",
      "--input-placeholder-text": "#A0AEC0",
      "--progress-track-bg": "#CBD5E0",

      "--map-background-color": "#E2E8F0", // Light blue-grey map area
      "--map-region-default-fill": "#A0AEC0", // State colors could be a lighter blue/grey
      "--map-region-border": "#FFFFFF",
      "--map-region-hover-fill": "rgba(179, 27, 27, 0.3)", // Red hover
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMerriweather,
    },
    styles: {
      "--panel-shadow": "0 2px 5px rgba(0, 0, 0, 0.08)",
      "--button-shadow": "0 1px 2px rgba(0, 0, 0, 0.06)",
      "--element-radius": "4px", // Classic, slightly rounded
      "--border-width": "1px",
      "--focus-ring-color": "#003366", // Navy focus
      "--progress-value-color": "#003366",
      "--checkbox-accent-color": "#B31B1B", // Red checkbox
      "--transition-speed": "0.15s ease-in-out",
    },
  },
  midnightCapital: {
    name: "Midnight Capital",
    colors: {
      "--primary-bg": "#0A192F", // Very Dark Navy (almost black)
      "--secondary-bg": "#172A45", // Dark Desaturated Blue
      "--ui-panel-bg": "#1F3A5F", // Slightly Lighter Navy/Indigo for panels

      "--button-bg": "#FFBF00", // Gold/Brass for buttons (stands out on dark blue)
      "--button-hover-bg": "#FFD700", // Brighter Gold
      "--button-active-bg": "#D4A017", // Darker Gold
      "--button-text": "#0A192F", // Dark Navy text on Gold buttons

      "--primary-text": "#CCD6F6", // Light Steel Blue/Off-White text
      "--secondary-text": "#8892B0", // Lighter Slate/Lavender Grey
      "--accent-color": "#CC3333", // A strong, but not overly bright, Red
      "--accent-text": "#FFFFFF",
      "--rgb-accent-color": "204, 51, 51",

      "--highlight-bg": "rgba(204, 51, 51, 0.15)", // Faint red highlight
      "--border-color": "#303C55", // Darker border
      "--accent-border-color": "#CC3333", // Red for focus

      "--error-text": "#FF6B6B",
      "--success-text": "#63B3ED", // A lighter, hopeful blue for success
      "--disabled-bg": "#172A45",
      "--disabled-text": "#4A5568",

      "--button-action-bg": "#CC3333", // Red for primary actions
      "--button-action-hover-bg": "#B32D2D",
      "--button-action-text": "#FFFFFF",

      "--button-delete-bg": "#8892B0", // Muted Slate for delete
      "--button-delete-hover-bg": "#626F86",
      "--button-delete-text": "#0A192F",

      "--input-bg": "#172A45",
      "--input-text": "#CCD6F6",
      "--input-placeholder-text": "#8892B0",
      "--progress-track-bg": "#303C55",

      "--map-background-color": "#0A192F",
      "--map-region-default-fill": "#303C55", // Darker regions
      "--map-region-border": "#172A45",
      "--map-region-hover-fill": "rgba(255, 191, 0, 0.4)", // Gold hover
    },
    fonts: {
      "--font-main": fontInter, // Inter for readability
      "--font-heading": fontMontserrat,
    },
    styles: {
      /* ... similar to executiveDark but with gold/red accents for focus/shadow colors ... */
      "--panel-shadow": "0 4px 10px rgba(0,0,0,0.4)",
      "--button-shadow": "0 2px 3px rgba(0,0,0,0.3)",
      "--element-radius": "4px",
      "--focus-ring-color": "#FFBF00", // Gold focus
      "--progress-value-color": "#FFBF00", // Gold progress
      "--checkbox-accent-color": "#CC3333", // Red checkbox
      "--input-focus-shadow-color": "rgba(255, 191, 0, 0.3)",
      "--transition-speed": "0.15s ease-in-out",
    },
  },
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
  neoTokyoNight: {
    name: "Neo Tokyo Night",
    colors: {
      "--primary-bg": "#1A1A24", // Very Dark Indigo/Purple
      "--secondary-bg": "#242432", // Slightly lighter dark indigo
      "--ui-panel-bg": "#13131A", // Almost black panels, for contrast with neon

      "--button-bg": "#FF4081", // Vibrant Magenta/Hot Pink (Neon Accent)
      "--button-hover-bg": "#F50057",
      "--button-active-bg": "#C51162",
      "--button-text": "#FFFFFF",

      "--primary-text": "#E0E0FF", // Light Lavender/Off-White
      "--secondary-text": "#A0A0CC", // Muted Lavender Grey
      "--accent-color": "#00E5FF", // Bright Cyan (another Neon Accent)
      "--accent-text": "#13131A", // Dark text on Cyan
      "--rgb-accent-color": "0, 229, 255",

      "--highlight-bg": "rgba(0, 229, 255, 0.15)", // Faint Cyan highlight
      "--border-color": "#303040", // Dark border
      "--accent-border-color": "#00E5FF", // Cyan focus

      "--error-text": "#FF5252",
      "--success-text": "#00E676", // Bright Neon Green
      "--disabled-bg": "#242432",
      "--disabled-text": "#505064",

      "--button-action-bg": "#00E5FF", // Cyan for primary actions
      "--button-action-hover-bg": "#00B8D4",
      "--button-action-text": "#13131A",

      "--button-delete-bg": "#7C4DFF", // Deep Purple for delete (complements neons)
      "--button-delete-hover-bg": "#651FFF",
      "--button-delete-text": "#FFFFFF",

      "--input-bg": "#242432",
      "--input-text": "#E0E0FF",
      "--input-placeholder-text": "#A0A0CC",
      "--progress-track-bg": "#303040",

      "--map-background-color": "#13131A", // Darkest for map
      "--map-region-default-fill": "#303040", // Dark regions
      "--map-region-border": "#1A1A24",
      "--map-region-hover-fill": "rgba(255, 64, 129, 0.4)", // Magenta hover
    },
    fonts: {
      "--font-main": fontInter, // Inter for readability
      "--font-heading": fontRobotoMono,
    },
    styles: {
      /* ... Sharp radius (2-3px), neon glows for shadows on focus ... */
      "--panel-shadow": "0 0 10px rgba(0, 229, 255, 0.2)", // Cyan glow shadow
      "--button-shadow": "0 0 8px rgba(255, 64, 129, 0.25)", // Magenta glow for buttons
      "--element-radius": "3px",
      "--focus-ring-color": "#00E5FF",
      "--progress-value-color": "#FF4081", // Magenta progress
      "--checkbox-accent-color": "#00E5FF",
      "--input-focus-shadow-color": "rgba(0, 229, 255, 0.4)",
      "--transition-speed": "0.1s linear",
    },
  },
  bauhausOrder: {
    name: "Bauhaus Order",
    colors: {
      "--primary-bg": "#F5F5F5", // Clean, light grey (concrete/modern)
      "--secondary-bg": "#FFFFFF", // White for panels and clean lines
      "--ui-panel-bg": "#FFFFFF",

      "--button-bg": "#262626", // Black or very dark charcoal for standard buttons
      "--button-hover-bg": "#404040",
      "--button-active-bg": "#0D0D0D",
      "--button-text": "#FFFFFF",

      "--primary-text": "#1A1A1A", // Near-black for strong readability
      "--secondary-text": "#595959", // Medium Grey
      "--accent-color": "#FFCC00", // Gold/Yellow (from flag)
      "--accent-text": "#1A1A1A", // Black text on gold
      "--rgb-accent-color": "255, 204, 0",

      "--highlight-bg": "rgba(255, 204, 0, 0.15)", // Faint gold highlight
      "--border-color": "#D9D9D9", // Light grey border
      "--accent-border-color": "#FFCC00", // Gold for focus

      "--error-text": "#DD2C00", // Strong, clear Red (from flag)
      "--success-text": "#006400", // Forest Green
      "--disabled-bg": "#E0E0E0",
      "--disabled-text": "#A0A0A0",

      "--button-action-bg": "#DD2C00", // Red for primary actions
      "--button-action-hover-bg": "#B22400",
      "--button-action-text": "#FFFFFF",

      "--button-delete-bg": "#757575", // Muted Grey for delete
      "--button-delete-hover-bg": "#505050",
      "--button-delete-text": "#FFFFFF",

      "--input-bg": "#FFFFFF",
      "--input-text": "#1A1A1A",
      "--input-placeholder-text": "#A0A0A0",
      "--progress-track-bg": "#E0E0E0",

      "--map-background-color": "#E0E5E8", // Cool light grey
      "--map-region-default-fill": "#B0BEC5", // Slate grey regions
      "--map-region-border": "#FFFFFF",
      "--map-region-hover-fill": "rgba(255, 204, 0, 0.4)", // Gold hover
    },
    fonts: {
      "--font-main": fontInter, // Inter for readability
      "--font-heading": fontMontserrat,
    },
    styles: {
      "--panel-shadow": "0 1px 3px rgba(0,0,0,0.1)", // Minimal, clean shadow
      "--button-shadow": "none", // Often flat in Bauhaus-inspired design
      "--item-hover-shadow": "0 1px 2px rgba(0,0,0,0.05)",
      "--input-focus-shadow-color": "rgba(255, 204, 0, 0.3)", // Gold glow
      "--element-radius": "2px", // Sharp corners
      "--border-width": "1px",
      "--focus-ring-color": "#FFCC00",
      "--progress-value-color": "#262626", // Black progress
      "--checkbox-accent-color": "#FFCC00",
      "--transition-speed": "0.1s linear",
    },
  },
  berlinNight: {
    name: "Berlin Night",
    colors: {
      "--primary-bg": "#1C1C1E", // Very Dark Grey, almost black
      "--secondary-bg": "#2A2A2E", // Darker Grey
      "--ui-panel-bg": "#121212", // Deep Black for panels

      "--button-bg": "#FFCC00", // Gold buttons stand out
      "--button-hover-bg": "#FFD633",
      "--button-active-bg": "#E5B800",
      "--button-text": "#121212", // Black text on gold

      "--primary-text": "#E0E0E0", // Light Grey/Off-White
      "--secondary-text": "#A0A0A0", // Muted Light Grey
      "--accent-color": "#DD2C00", // Flag Red as the primary accent
      "--accent-text": "#FFFFFF",
      "--rgb-accent-color": "221, 44, 0",

      "--highlight-bg": "rgba(221, 44, 0, 0.15)", // Faint red highlight
      "--border-color": "#424242", // Dark grey border
      "--accent-border-color": "#DD2C00", // Red for focus

      "--error-text": "#FF6B6B", // Brighter Red for visibility
      "--success-text": "#69F0AE", // A modern, slightly desaturated Green
      "--disabled-bg": "#2A2A2E",
      "--disabled-text": "#505050",

      "--button-action-bg": "#DD2C00", // Red action buttons
      "--button-action-hover-bg": "#B22400",
      "--button-action-text": "#FFFFFF",

      "--button-delete-bg": "#505050", // Dark grey delete
      "--button-delete-hover-bg": "#404040",
      "--button-delete-text": "#E0E0E0",

      "--input-bg": "#121212",
      "--input-text": "#E0E0E0",
      "--input-placeholder-text": "#757575",
      "--progress-track-bg": "#2A2A2E",

      "--map-background-color": "#121212",
      "--map-region-default-fill": "#424242", // Dark grey regions
      "--map-region-border": "#000000",
      "--map-region-hover-fill": "rgba(255, 204, 0, 0.4)", // Gold hover
    },
    fonts: {
      "--font-main": fontInter, // Inter for readability
      "--font-heading": fontMontserrat,
    },
    styles: {
      /* ... Sharp radius, focus rings in gold/red, panel shadows could be glows ... */
      "--panel-shadow": "0 0 12px rgba(255, 204, 0, 0.2)", // Goldish glow
      "--button-shadow": "0 1px 3px rgba(0,0,0,0.4)",
      "--element-radius": "3px",
      "--focus-ring-color": "#FFCC00",
      "--progress-value-color": "#FFCC00", // Gold progress
      "--checkbox-accent-color": "#DD2C00", // Red checkbox
      "--input-focus-shadow-color": "rgba(255, 204, 0, 0.35)",
      "--transition-speed": "0.12s ease-out",
    },
  },
  northernMaple: {
    name: "Northern Maple",
    colors: {
      "--primary-bg": "#FFFFFF", // Clean White
      "--secondary-bg": "#F0F4F8", // Very Light Cool Grey/Blue
      "--ui-panel-bg": "#FFFFFF",

      "--button-bg": "#CF102D", // Maple Leaf Red (Canadian Flag Red)
      "--button-hover-bg": "#A60C24",
      "--button-active-bg": "#8A0A1F",
      "--button-text": "#FFFFFF",

      "--primary-text": "#2C3E50", // Dark Slate Blue/Charcoal
      "--secondary-text": "#52606D", // Muted Grey-Blue
      "--accent-color": "#0066CC", // A clear, hopeful Blue (alternative to more red)
      "--accent-text": "#FFFFFF",
      "--rgb-accent-color": "0, 102, 204",

      "--highlight-bg": "rgba(0, 102, 204, 0.1)", // Faint blue highlight
      "--border-color": "#D1D9E0", // Light Grey-Blue border
      "--accent-border-color": "#0066CC", // Blue for focus

      "--error-text": "#E53E3E",
      "--success-text": "#2F855A", // Forest Green
      "--disabled-bg": "#E0E5EA",
      "--disabled-text": "#8492A6",

      "--button-action-bg": "#CF102D", // Red for primary actions
      "--button-action-hover-bg": "#A60C24",
      "--button-action-text": "#FFFFFF",

      "--button-delete-bg": "#718096", // Muted Slate Grey for delete
      "--button-delete-hover-bg": "#52606D",
      "--button-delete-text": "#FFFFFF",

      "--input-bg": "#F0F4F8",
      "--input-text": "#2C3E50",
      "--input-placeholder-text": "#8492A6",
      "--progress-track-bg": "#D1D9E0",

      "--map-background-color": "#E0EAF0", // Light icy blue
      "--map-region-default-fill": "#8492A6", // Province colors
      "--map-region-border": "#FFFFFF",
      "--map-region-hover-fill": "rgba(207, 16, 45, 0.3)", // Red hover
    },
    fonts: {
      "--font-main": fontInter, // Inter for readability
      "--font-heading": fontMontserrat,
    },
    styles: {
      /* ... Clean, slightly rounded (5px), subtle shadows ... */
      "--panel-shadow": "0 2px 6px rgba(0,0,0,0.07)",
      "--button-shadow": "0 1px 3px rgba(0,0,0,0.05)",
      "--element-radius": "5px",
      "--focus-ring-color": "#0066CC",
      "--progress-value-color": "#CF102D", // Red progress
      "--checkbox-accent-color": "#0066CC", // Blue checkbox
      "--input-focus-shadow-color": "rgba(0, 102, 204, 0.25)",
      "--transition-speed": "0.15s ease-in-out",
    },
  },
  auroraNight: {
    name: "Aurora Night",
    colors: {
      "--primary-bg": "#0D1F2D", // Deep Night Blue
      "--secondary-bg": "#1A3A59", // Darker Ocean Blue
      "--ui-panel-bg": "#102A43", // Panel color

      "--button-bg": "#00BFFF", // Deep Sky Blue / Bright Icy Blue (Aurora accent)
      "--button-hover-bg": "#009ACD",
      "--button-active-bg": "#007BA7",
      "--button-text": "#0D1F2D", // Dark text on bright buttons

      "--primary-text": "#E0F2FE", // Very Light Icy Blue/Off-White
      "--secondary-text": "#B0C4DE", // Light Steel Blue
      "--accent-color": "#FF4500", // Contrasting Warm Orange/Red (like a setting sun or distant fire)
      "--accent-text": "#FFFFFF",
      "--rgb-accent-color": "255, 69, 0",

      "--highlight-bg": "rgba(0, 191, 255, 0.1)", // Faint sky blue highlight
      "--border-color": "#35506A", // Dark blue border
      "--accent-border-color": "#FF4500", // Orange focus

      "--error-text": "#FF6B6B",
      "--success-text": "#38C172", // A vibrant, clear green
      "--disabled-bg": "#1A3A59",
      "--disabled-text": "#52606D",

      "--button-action-bg": "#FF4500", // Orange action buttons
      "--button-action-hover-bg": "#E03D00",
      "--button-action-text": "#FFFFFF",

      "--button-delete-bg": "#52606D", // Muted slate for delete
      "--button-delete-hover-bg": "#35506A",
      "--button-delete-text": "#E0F2FE",

      "--input-bg": "#102A43",
      "--input-text": "#E0F2FE",
      "--input-placeholder-text": "#8492A6",
      "--progress-track-bg": "#35506A",

      "--map-background-color": "#0D1F2D",
      "--map-region-default-fill": "#35506A", // Darker regions
      "--map-region-border": "#1A3A59",
      "--map-region-hover-fill": "rgba(0, 191, 255, 0.3)", // Icy blue hover
    },
    fonts: {
      "--font-main": fontInter, // Inter for readability
      "--font-heading": fontMontserrat,
    },
    styles: {
      /* ... Element radius 5px, focus/shadows with icy blue or orange ... */
      "--panel-shadow": "0 0 15px rgba(0, 191, 255, 0.15)", // Icy glow
      "--button-shadow": "0 2px 4px rgba(0,0,0,0.3)",
      "--element-radius": "5px",
      "--focus-ring-color": "#00BFFF",
      "--progress-value-color": "#00BFFF", // Icy blue progress
      "--checkbox-accent-color": "#FF4500", // Orange checkbox
      "--input-focus-shadow-color": "rgba(0, 191, 255, 0.3)",
      "--transition-speed": "0.15s ease-in-out",
    },
  },
  emeraldDepths: {
    name: "Emerald Depths",
    colors: {
      "--primary-bg": "#064E3B", // Very Dark Emerald/Forest Green
      "--secondary-bg": "#052E16", // Even Darker Green (almost black-green)
      "--ui-panel-bg": "#047857", // Rich, Dark Teal/Emerald for panels

      "--button-bg": "#34D399", // Bright Mint/Aqua Green for buttons
      "--button-hover-bg": "#6EE7B7", // Lighter Mint
      "--button-active-bg": "#10B981", // Stronger Mint
      "--button-text": "#064E3B", // Dark Green text on light mint buttons

      "--primary-text": "#ECFDF5", // Very Light Mint/Off-White text
      "--secondary-text": "#A7F3D0", // Lighter Mint for secondary text
      // Accent: A contrasting gold or a bright, almost electric lime.
      "--accent-color": "#FACC15", // Bright Yellow/Gold
      "--accent-text": "#064E3B", // Dark green text on gold
      "--rgb-accent-color": "250, 204, 21",

      "--highlight-bg": "rgba(250, 204, 21, 0.15)", // Faint gold highlight
      "--border-color": "#047857", // Panel color as border, or slightly darker
      "--accent-border-color": "#FACC15", // Gold for focus

      "--error-text": "#F87171", // Brighter Red for visibility
      "--success-text": "#34D399", // Button Mint as success color
      "--disabled-bg": "#052E16",
      "--disabled-text": "#065F46",

      "--button-action-bg": "#FACC15", // Gold for primary actions
      "--button-action-hover-bg": "#EAB308",
      "--button-action-text": "#064E3B",

      "--button-delete-bg": "#7F1D1D", // Deep Red (can be reused from other themes)
      "--button-delete-hover-bg": "#991B1B",
      "--button-delete-text": "#ECFDF5",

      "--input-bg": "#052E16", // Darkest Green for inputs
      "--input-text": "#ECFDF5",
      "--input-placeholder-text": "#065F46",
      "--progress-track-bg": "#047857",

      "--map-background-color": "#052E16", // Darkest green for map
      "--map-region-default-fill": "#065F46", // Darker, desaturated green regions
      "--map-region-border": "#047857",
      "--map-region-hover-fill": "rgba(250, 204, 21, 0.4)", // Gold hover
    },
    fonts: {
      "--font-main": fontInter, // Inter for readability
      "--font-heading": fontMontserrat,
    },
    styles: {
      /* ... Sharp radius, focus rings in gold/lime, panel shadows can be glows ... */
      "--panel-shadow": "0 0 12px rgba(250, 204, 21, 0.2)", // Goldish glow for panels
      "--button-shadow": "0 2px 4px rgba(0,0,0,0.3)", // Standard dark theme button shadow
      "--element-radius": "4px",
      "--focus-ring-color": "#FACC15",
      "--progress-value-color": "#34D399", // Mint progress
      "--checkbox-accent-color": "#FACC15", // Gold checkbox
      "--input-focus-shadow-color": "rgba(250, 204, 21, 0.35)",
      "--transition-speed": "0.15s ease-in-out",
    },
  },
  twilightBloom: {
    name: "Twilight Bloom",
    colors: {
      "--primary-bg": "#2B1B3D", // Deep Dark Purple/Indigo
      "--secondary-bg": "#1E122B", // Even Darker Purple
      "--ui-panel-bg": "#3A2A4F", // Rich, slightly lighter dark purple for panels

      "--button-bg": "#9333EA", // Vibrant Orchid/Magenta Purple
      "--button-hover-bg": "#A855F7", // Lighter Orchid
      "--button-active-bg": "#7E22CE", // Darker Orchid
      "--button-text": "#FFFFFF",

      "--primary-text": "#E9D5FF", // Light Lavender text
      "--secondary-text": "#C084FC", // Lighter Orchid for secondary text
      // Accent: A contrasting cool color like Teal or Cyan, or a bright Pink
      "--accent-color": "#2DD4BF", // Bright Teal/Aqua
      "--accent-text": "#1E122B", // Dark purple text on teal
      "--rgb-accent-color": "45, 212, 191",

      "--highlight-bg": "rgba(45, 212, 191, 0.15)", // Faint teal highlight
      "--border-color": "#581C87", // Dark purple border
      "--accent-border-color": "#2DD4BF", // Teal for focus

      "--error-text": "#F43F5E", // Pinkish Red
      "--success-text": "#34D399", // Mint Green
      "--disabled-bg": "#1E122B",
      "--disabled-text": "#7E22CE", // Muted Orchid

      "--button-action-bg": "#9333EA", // Orchid for primary actions
      "--button-action-hover-bg": "#A855F7",
      "--button-action-text": "#FFFFFF",

      "--button-delete-bg": "#701A75", // Deep Fuchsia/Dark Magenta
      "--button-delete-hover-bg": "#86198F",
      "--button-delete-text": "#E9D5FF",

      "--input-bg": "#1E122B",
      "--input-text": "#E9D5FF",
      "--input-placeholder-text": "#A78BFA", // Lighter purple placeholder
      "--progress-track-bg": "#3A2A4F",

      "--map-background-color": "#1E122B",
      "--map-region-default-fill": "#581C87", // Deep purple regions
      "--map-region-border": "#2B1B3D",
      "--map-region-hover-fill": "rgba(45, 212, 191, 0.3)", // Teal hover
    },
    fonts: {
      "--font-main": fontInter, // Inter for readability
      "--font-heading": fontMontserrat,
    },
    styles: {
      /* ... Modern radius (6-8px), shadows with purple/teal glows ... */
      "--panel-shadow": "0 0 15px rgba(45, 212, 191, 0.15)", // Teal glow
      "--button-shadow": "0 2px 5px rgba(0,0,0,0.3)",
      "--element-radius": "6px",
      "--focus-ring-color": "#2DD4BF",
      "--progress-value-color": "#9333EA", // Orchid progress
      "--checkbox-accent-color": "#2DD4BF", // Teal checkbox
      "--input-focus-shadow-color": "rgba(45, 212, 191, 0.35)",
      "--transition-speed": "0.15s ease-in-out",
    },
  },
  midnightGarden: {
    name: "Midnight Garden",
    colors: {
      "--primary-bg": "#443443", // A derived dark desaturated purple (darker than 54414E)
      "--secondary-bg": "#54414E", // Dark Desaturated Plum as secondary
      "--ui-panel-bg": "#3A2D39", // Slightly darker/more desaturated plum for panels

      "--button-bg": "#A790A5", // Dusty Lavender for buttons (stands out on dark)
      "--button-hover-bg": "#B7C8B5", // Muted Sage for hover (interesting contrast)
      "--button-active-bg": "#875C74", // Muted Plum for active
      "--button-text": "#F0FDF4", // Light Minty text

      "--primary-text": "#E7D7C1", // Light Cream for primary text
      "--secondary-text": "#B7C8B5", // Muted Sage for secondary text

      "--accent-color": "#C5EBC3", // Light Mint Green as the main accent
      "--accent-text": "#3A2D39", // Dark Plum text on mint accent
      "--rgb-accent-color": "197, 235, 195",

      "--highlight-bg": "rgba(197, 235, 195, 0.1)", // Faint mint highlight
      "--border-color": "#735751", // Medium-Dark Brown border on panels
      "--accent-border-color": "#C5EBC3", // Mint for focus

      "--error-text": "#FF8A80", // Softer, but visible red on dark
      "--success-text": "#B9F6CA", // Soft, visible green
      "--disabled-bg": "#54414E",
      "--disabled-text": "#A790A5", // Dusty Lavender for disabled text

      // Specific Button Types
      "--button-action-bg": "#C5EBC3", // Light Mint for primary actions
      "--button-action-hover-bg": "#D4F0D2", // Lighter mint
      "--button-action-text": "#3A2D39", // Dark Plum text

      "--button-delete-bg": "#875C74", // Muted Plum for delete
      "--button-delete-hover-bg": "#735751", // Darker brown/plum
      "--button-delete-text": "#E7D7C1", // Light Cream text

      "--input-bg": "#3A2D39", // Panel color for inputs
      "--input-text": "#E7D7C1", // Light Cream text
      "--input-placeholder-text": "#A790A5", // Dusty Lavender
      "--progress-track-bg": "#54414E", // Dark Plum track

      // Map Colors
      "--map-background-color": "#2B1B3D", // Deepest Dark Purple
      "--map-region-default-fill": "#735751", // Medium-Dark Brown for regions
      "--map-region-border": "#54414E", // Dark Plum border
      "--map-region-hover-fill": "rgba(197, 235, 195, 0.3)", // Mint hover
    },
    fonts: {
      "--font-main": fontInter, // Inter for readability
      "--font-heading": fontMontserrat,
    },
    styles: {
      "--panel-shadow": "0 3px 10px rgba(0, 0, 0, 0.4)", // Standard dark theme shadow
      "--button-shadow": "0 1px 3px rgba(0, 0, 0, 0.3)",
      "--item-hover-shadow": "0 2px 6px rgba(0, 0, 0, 0.35)",
      "--input-focus-shadow-color": "rgba(197, 235, 195, 0.3)", // Mint glow
      "--element-radius": "4px",
      "--border-width": "1px",
      "--focus-ring-color": "#C5EBC3",
      "--progress-value-color": "#A790A5", // Dusty Lavender for progress bar
      "--checkbox-accent-color": "#C5EBC3",
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
  nightdriveNeon: {
    name: "Nightdrive Neon",
    colors: {
      // Backgrounds - Very dark
      "--primary-bg": "#050505", // Pure Black/Very Dark Grey
      "--secondary-bg": "#101012", // Slightly off-black for depth
      "--ui-panel-bg": "#18181A", // Dark charcoal panels

      // Buttons - Using one of the neons or a metallic grey
      "--button-bg": "#31AFD4", // Bright Cyan for standard buttons
      "--button-hover-bg": "#52C4E5", // Lighter Cyan
      "--button-active-bg": "#2A9CB8", // Darker Cyan
      "--button-text": "#050505", // Black text on Cyan for high contrast

      // Text - Light text for readability on dark
      "--primary-text": "#EAEAEA", // Very Light Grey/Off-White
      "--secondary-text": "#A0A0A5", // Muted Light Grey

      // Accent - The Saturated Blue is a great primary neon
      "--accent-color": "#004FFF", // Bright Saturated Blue
      "--accent-text": "#FFFFFF", // White text on this blue
      "--rgb-accent-color": "0, 79, 255",

      "--highlight-bg": "rgba(0, 79, 255, 0.15)", // Faint blue glow
      "--border-color": "#28282A", // Dark, subtle border
      "--accent-border-color": "#004FFF", // Blue for focus

      // Functional Colors
      "--error-text": "#FF4D6A", // A neon-compatible red/pink
      "--success-text": "#4FFF8B", // A neon green
      "--disabled-bg": "#18181A", // Panel color
      "--disabled-text": "#505055", // Dark muted grey

      // Specific Button Types
      "--button-action-bg": "#004FFF", // Bright Blue for primary actions
      "--button-action-hover-bg": "#336FFF",
      "--button-action-text": "#FFFFFF",

      "--button-delete-bg": "#902D41", // Deep Muted Burgundy (from palette)
      "--button-delete-hover-bg": "#702433",
      "--button-delete-text": "#EAEAEA",

      "--input-bg": "#101012", // Dark secondary BG for inputs
      "--input-text": "#EAEAEA",
      "--input-placeholder-text": "#707075",
      "--progress-track-bg": "#28282A", // Dark border color for track

      // Secondary Accent (Magenta) - use sparingly for high impact
      "--secondary-accent-color": "#FF007F",
      "--secondary-accent-text": "#FFFFFF",

      // Map Colors
      "--map-background-color": "#050505", // Black map area
      "--map-region-default-fill": "#1F1F22", // Very dark grey regions
      "--map-region-border": "#31AFD4", // Cyan borders for a TRON-like feel
      "--map-region-hover-fill": "rgba(0, 79, 255, 0.4)", // Blue hover
    },
    fonts: { "--font-main": fontInter, "--font-heading": fontRobotoMono },
    styles: {
      "--panel-shadow": "0 0 10px rgba(0, 79, 255, 0.2)", // Blue neon glow for panels
      "--button-shadow": "0 0 8px rgba(49, 175, 212, 0.3)", // Cyan glow for buttons
      "--item-hover-shadow": "0 0 6px rgba(49, 175, 212, 0.2)",
      "--input-focus-shadow-color": "rgba(0, 79, 255, 0.5)", // Strong Blue glow
      "--element-radius": "3px", // Sharp, techy corners
      "--border-width": "1px", // Can be very subtle or use neon colors
      "--focus-ring-color": "#004FFF",
      "--progress-value-color": "#31AFD4", // Cyan progress bar
      "--checkbox-accent-color": "#004FFF", // Blue checkbox
      "--transition-speed": "0.1s linear", // Fast, digital transitions
    },
  },
  scholarsGrove: {
    name: "Scholar's Grove",
    colors: {
      // Backgrounds: Using the lighter, desaturated greens for a soft, natural feel
      "--primary-bg": "#F5F7F4", // A very light, almost white-green (derived from C5C9A4)
      "--secondary-bg": "#EAF0E9", // Slightly darker version for depth
      "--ui-panel-bg": "#FFFFFF", // White panels for readability

      // Buttons: Using the darker teals
      "--button-bg": "#476A6F", // Muted Teal / Deep Blue-Green
      "--button-hover-bg": "#3A5A5F", // Darker shade
      "--button-active-bg": "#2D4A4F", // Even darker
      "--button-text": "#FFFFFF",

      // Text: Darkest teal for primary, medium teal for secondary
      "--primary-text": "#2D4A4F", // Darker shade of #476A6F for good contrast
      "--secondary-text": "#519E8A", // Medium Teal

      // Accent: The soft peach/rose
      "--accent-color": "#ECBEB4", // Soft Muted Peach/Rose
      "--accent-text": "#476A6F", // Dark Teal text on peach
      "--rgb-accent-color": "236, 190, 180",

      "--highlight-bg": "rgba(236, 190, 180, 0.2)", // Faint peach highlight
      "--border-color": "#C5C9A4", // Pale Olive/Khaki for borders
      "--accent-border-color": "#ECBEB4", // Peach for focus

      // Functional Colors
      "--error-text": "#BF360C", // A deep, earthy orange-red for errors
      "--success-text": "#2E7D32", // A natural, deep green
      "--disabled-bg": "#EAF0E9",
      "--disabled-text": "#7EB09B", // Soft Sage for disabled text

      // Specific Button Types
      "--button-action-bg": "#519E8A", // Medium Teal for primary actions
      "--button-action-hover-bg": "#408E7A",
      "--button-action-text": "#FFFFFF",

      "--button-delete-bg": "#A78A7F", // Using the dusty brown from your other palette for a muted delete
      "--button-delete-hover-bg": "#8F736A",
      "--button-delete-text": "#FFFFFF",

      "--input-bg": "#FFFFFF",
      "--input-text": "#476A6F",
      "--input-placeholder-text": "#7EB09B", // Soft Sage for placeholder
      "--progress-track-bg": "#EAF0E9", // Secondary BG for track

      // Map Colors
      "--map-background-color": "#EAF0E9", // Light secondary green
      "--map-region-default-fill": "#7EB09B", // Soft Sage for regions
      "--map-region-border": "#FFFFFF",
      "--map-region-hover-fill": "rgba(236, 190, 180, 0.4)", // Peach hover
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMerriweather,
    },
    styles: {
      "--panel-shadow": "0 2px 6px rgba(71, 106, 111, 0.1)", // Soft, desaturated shadow
      "--button-shadow": "0 1px 3px rgba(71, 106, 111, 0.15)",
      "--item-hover-shadow": "0 2px 5px rgba(71, 106, 111, 0.12)",
      "--input-focus-shadow-color": "rgba(236, 190, 180, 0.35)", // Peach glow
      "--element-radius": "5px", // Softly rounded
      "--border-width": "1px",
      "--focus-ring-color": "#ECBEB4", // Peach focus ring
      "--progress-value-color": "#476A6F", // Dark Teal progress bar
      "--checkbox-accent-color": "#ECBEB4", // Peach for checkboxes
      "--transition-speed": "0.16s ease-in-out",
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
  forestCanopy: {
    // Theme 2: 243010, 87A330, A1C349, CAD593, 2A3C24
    name: "Forest Canopy",
    colors: {
      "--primary-bg": "#243010", // Dark Olive Green
      "--secondary-bg": "#1A210B", // Darker variant
      "--ui-panel-bg": "#2A3C24", // Slightly desaturated, darker green

      "--button-bg": "#87A330", // Moss Green
      "--button-hover-bg": "#97B340",
      "--button-active-bg": "#779320",
      "--button-text": "#FFFFFF",

      "--primary-text": "#E8EAE3", // Light, slightly warm text
      "--secondary-text": "#B0B8A7", // Muted green-grey
      "--accent-color": "#A1C349", // Brighter Lime Green
      "--accent-text": "#1A210B", // Dark text for this accent
      "--rgb-accent-color": hexToRgbString("#A1C349"), // "161, 195, 73"

      "--highlight-bg": "rgba(161, 195, 73, 0.25)",
      "--border-color": "#3A4D2E",
      "--accent-border-color": "#A1C349",

      "--error-text": "#D84035", // Generic red, as none suitable in palette
      "--disabled-bg": "#303D20",
      "--disabled-text": "#606A50",

      "--success-text": "#A1C349",

      "--button-action-bg": "#A1C349",
      "--button-action-hover-bg": "#8FB339",
      "--button-action-text": "#1A210B",

      "--button-delete-bg": "#B84A39",
      "--button-delete-hover-bg": "#A04030",
      "--button-delete-text": "#FFFFFF",

      "--input-bg": "#1A210B",
      "--input-text": "#E8EAE3",
      "--input-placeholder-text": "#707A60",
      "--progress-track-bg": "#303D20",

      "--map-background-color": "#1A210B",
      "--map-region-default-fill": "#2A3C24",
      "--map-region-border": "#97B340",
      "--map-region-hover-fill": "#CAD593", // Lightest green for hover
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMerriweather,
    },
    styles: {
      "--panel-shadow": "0 5px 15px rgba(0, 0, 0, 0.4)",
      "--button-shadow":
        "0 1px 2px rgba(0, 0, 0, 0.2), 0 2px 3px rgba(0,0,0,0.1)",
      "--item-hover-shadow": "0 2px 4px rgba(0, 0, 0, 0.3)",
      "--input-focus-shadow-color": "rgba(161, 195, 73, 0.3)",
      "--element-radius": "8px", // Slightly more rounded for a natural feel
      "--border-width": "1px",
      "--focus-ring-color": "#A1C349",
      "--progress-value-color": "#87A330",
      "--checkbox-accent-color": "#A1C349",
      "--transition-speed": "0.18s ease-in-out",
    },
  },
  mistyMountains: {
    // Theme 3: 2E6171, 556F7A, 798086, B79FAD, D4AFCD
    name: "Misty Mountains",
    colors: {
      "--primary-bg": "#2E6171", // Deep Teal/Blue
      "--secondary-bg": "#20434F", // Darker variant
      "--ui-panel-bg": "#556F7A", // Muted Slate Blue

      "--button-bg": "#B79FAD", // Muted Lavender/Rose
      "--button-hover-bg": "#C7AFBD",
      "--button-active-bg": "#A78FA3",
      "--button-text": "#2E3A40", // Darker text for contrast

      "--primary-text": "#EBF1F3", // Off-white, cool
      "--secondary-text": "#A7B8BF", // Lighter grey-blue
      "--accent-color": "#D4AFCD", // Light Pink/Lavender
      "--accent-text": "#2E3A40", // Dark text for this accent
      "--rgb-accent-color": hexToRgbString("#D4AFCD"), // "212, 175, 205"

      "--highlight-bg": "rgba(212, 175, 205, 0.25)",
      "--border-color": "#405560",
      "--accent-border-color": "#D4AFCD",

      "--error-text": "#E55C5C", // A soft red
      "--disabled-bg": "#485860",
      "--disabled-text": "#798086", // Provided grey

      "--success-text": "#81C784",

      "--button-action-bg": "#B79FAD", // Using the main button color as it's distinctive
      "--button-action-hover-bg": "#A78FA3",
      "--button-action-text": "#2E3A40",

      "--button-delete-bg": "#C96464",
      "--button-delete-hover-bg": "#B05050",
      "--button-delete-text": "#FFFFFF",

      "--input-bg": "#20434F",
      "--input-text": "#EBF1F3",
      "--input-placeholder-text": "#798086",
      "--progress-track-bg": "#485860",

      "--map-background-color": "#20434F",
      "--map-region-default-fill": "#556F7A",
      "--map-region-border": "#B79FAD",
      "--map-region-hover-fill": "#D4AFCD",
    },
    fonts: {
      "--font-main": fontMerriweather,
      "--font-heading": fontMontserrat,
    },
    styles: {
      "--panel-shadow": "0 6px 16px rgba(0, 0, 0, 0.35)",
      "--button-shadow": "0 1px 2px rgba(0, 0, 0, 0.15)",
      "--item-hover-shadow": "0 2px 5px rgba(0, 0, 0, 0.25)",
      "--input-focus-shadow-color": "rgba(212, 175, 205, 0.3)",
      "--element-radius": "4px",
      "--border-width": "1px",
      "--focus-ring-color": "#D4AFCD",
      "--progress-value-color": "#B79FAD",
      "--checkbox-accent-color": "#D4AFCD",
      "--transition-speed": "0.16s ease-out",
    },
  },
  twilightHush: {
    // Theme 5: BEBBBB, 444054, 2F243A, FAC9B8, DB8A74
    name: "Twilight Hush",
    colors: {
      "--primary-bg": "#2F243A", // Deep Purple/Brown
      "--secondary-bg": "#201A28", // Darker variant
      "--ui-panel-bg": "#444054", // Muted Purple/Grey

      "--button-bg": "#DB8A74", // Muted Coral/Terracotta
      "--button-hover-bg": "#EBAA9A",
      "--button-active-bg": "#C97A64",
      "--button-text": "#2F243A", // Dark text for this button

      "--primary-text": "#BEBBBB", // Light Grey (provided)
      "--secondary-text": "#A09DA9", // Softer Grey
      "--accent-color": "#FAC9B8", // Light Peach/Pink
      "--accent-text": "#2F243A", // Dark text on accent
      "--rgb-accent-color": hexToRgbString("#FAC9B8"), // "250, 201, 184"

      "--highlight-bg": "rgba(250, 201, 184, 0.2)",
      "--border-color": "#5A556A",
      "--accent-border-color": "#FAC9B8",

      "--error-text": "#E57373", // Softer red
      "--disabled-bg": "#504C60",
      "--disabled-text": "#7E7A8A",

      "--success-text": "#B9F6CA",

      "--button-action-bg": "#DB8A74", // Using button color as action
      "--button-action-hover-bg": "#C97A64",
      "--button-action-text": "#2F243A",

      "--button-delete-bg": "#C75B5B",
      "--button-delete-hover-bg": "#B04A4A",
      "--button-delete-text": "#FFFFFF",

      "--input-bg": "#201A28",
      "--input-text": "#BEBBBB",
      "--input-placeholder-text": "#706A7A",
      "--progress-track-bg": "#504C60",

      "--map-background-color": "#201A28",
      "--map-region-default-fill": "#444054",
      "--map-region-border": "#2F243A",
      "--map-region-hover-fill": "#FAC9B8",
    },
    fonts: {
      "--font-main": fontMerriweather,
      "--font-heading": fontInter,
    },
    styles: {
      "--panel-shadow": "0 5px 15px rgba(0, 0, 0, 0.45)",
      "--button-shadow": "0 1px 2px rgba(0,0,0,0.2), 0 2px 3px rgba(0,0,0,0.1)",
      "--item-hover-shadow": "0 2px 4px rgba(0, 0, 0, 0.3)",
      "--input-focus-shadow-color": "rgba(250, 201, 184, 0.35)",
      "--element-radius": "7px",
      "--border-width": "1px",
      "--focus-ring-color": "#FAC9B8",
      "--progress-value-color": "#DB8A74",
      "--checkbox-accent-color": "#FAC9B8",
      "--transition-speed": "0.17s ease-in-out",
    },
  },
  emberGlowLight: {
    // Theme 7: FCBA04, A50104, 590004, 250001, F3F3F3
    name: "Ember Glow Light", // Light theme with fiery accents
    colors: {
      "--primary-bg": "#F3F3F3", // Very light grey
      "--secondary-bg": "#FFFFFF", // White
      "--ui-panel-bg": "#FAFAFA", // Slightly off-white

      "--button-bg": "#FCBA04", // Bright Yellow/Orange (Amber)
      "--button-hover-bg": "#FFCA28",
      "--button-active-bg": "#F0AD00",
      "--button-text": "#250001", // Darkest color for text

      "--primary-text": "#250001", // Darkest color for main text
      "--secondary-text": "#590004", // Dark red for secondary text
      "--accent-color": "#A50104", // Deep Red
      "--accent-text": "#FFFFFF",
      "--rgb-accent-color": hexToRgbString("#A50104"), // "165, 1, 4"

      "--highlight-bg": "rgba(165, 1, 4, 0.15)",
      "--border-color": "#D0D0D0", // Light grey border
      "--accent-border-color": "#A50104",

      "--error-text": "#A50104", // Using the accent red for errors
      "--disabled-bg": "#E0E0E0",
      "--disabled-text": "#A0A0A0",

      "--success-text": "#2E7D32",

      "--button-action-bg": "#A50104",
      "--button-action-hover-bg": "#C70005",
      "--button-action-text": "#FFFFFF",

      "--button-delete-bg": "#C70005", // slightly brighter red for delete action
      "--button-delete-hover-bg": "#950103",
      "--button-delete-text": "#FFFFFF",

      "--input-bg": "#FFFFFF",
      "--input-text": "#250001",
      "--input-placeholder-text": "#707070",
      "--progress-track-bg": "#E0E0E0",

      "--map-background-color": "#FFFFFF",
      "--map-region-default-fill": "#EAEAEA", // Light grey fill
      "--map-region-border": "#250001",
      "--map-region-hover-fill": "#FCBA04", // Yellow for hover
    },
    fonts: {
      "--font-main": fontRobotoMono,
      "--font-heading": fontMontserrat,
    },
    styles: {
      "--panel-shadow": "0 4px 12px rgba(37, 0, 1, 0.1)", // Shadow from dark text
      "--button-shadow":
        "0 1px 2px rgba(37, 0, 1, 0.08), 0 2px 3px rgba(37,0,1,0.06)",
      "--item-hover-shadow": "0 2px 5px rgba(37, 0, 1, 0.1)",
      "--input-focus-shadow-color": "rgba(165, 1, 4, 0.3)",
      "--element-radius": "5px",
      "--border-width": "1px",
      "--focus-ring-color": "#A50104",
      "--progress-value-color": "#FCBA04",
      "--checkbox-accent-color": "#A50104",
      "--transition-speed": "0.16s ease-in-out",
    },
  },
  starryNightfall: {
    // Theme 8: 151E3F, 030027, F2F3D9, DC9E82, C16E70
    name: "Starry Nightfall", // Dark blue theme with warm accents
    colors: {
      "--primary-bg": "#030027", // Very Dark Indigo/Purple
      "--secondary-bg": "#01001A", // Almost Black
      "--ui-panel-bg": "#151E3F", // Dark Navy Blue

      "--button-bg": "#C16E70", // Muted Rose/Coral
      "--button-hover-bg": "#D17E80",
      "--button-active-bg": "#B15E60",
      "--button-text": "#F2F3D9", // Light Creamy Text

      "--primary-text": "#F2F3D9", // Light Creamy (provided)
      "--secondary-text": "#B8B9A9", // Muted Creamy
      "--accent-color": "#DC9E82", // Peachy/Terracotta
      "--accent-text": "#030027", // Dark text on this accent
      "--rgb-accent-color": hexToRgbString("#DC9E82"), // "220, 158, 130"

      "--highlight-bg": "rgba(220, 158, 130, 0.2)",
      "--border-color": "#2A345A",
      "--accent-border-color": "#DC9E82",

      "--error-text": "#E57373", // Softer red
      "--disabled-bg": "#1F2A4F",
      "--disabled-text": "#505A7F",

      "--success-text": "#48BB78",

      "--button-action-bg": "#DC9E82",
      "--button-action-hover-bg": "#CBAE72",
      "--button-action-text": "#030027",

      "--button-delete-bg": "#B05050",
      "--button-delete-hover-bg": "#984040",
      "--button-delete-text": "#F2F3D9",

      "--input-bg": "#01001A",
      "--input-text": "#F2F3D9",
      "--input-placeholder-text": "#606A8F",
      "--progress-track-bg": "#1F2A4F",

      "--map-background-color": "#01001A",
      "--map-region-default-fill": "#151E3F",
      "--map-region-border": "#030027",
      "--map-region-hover-fill": "#C16E70",
    },
    fonts: {
      "--font-main": fontMerriweather,
      "--font-heading": fontMontserrat,
    },
    styles: {
      "--panel-shadow": "0 6px 18px rgba(0, 0, 0, 0.5)",
      "--button-shadow":
        "0 1px 2px rgba(0,0,0,0.25), 0 2px 4px rgba(0,0,0,0.15)",
      "--item-hover-shadow": "0 2px 5px rgba(0, 0, 0, 0.35)",
      "--input-focus-shadow-color": "rgba(220, 158, 130, 0.35)",
      "--element-radius": "6px",
      "--border-width": "1px",
      "--focus-ring-color": "#DC9E82",
      "--progress-value-color": "#C16E70",
      "--checkbox-accent-color": "#DC9E82",
      "--transition-speed": "0.15s ease-in-out",
    },
  },
  goldenTeal: {
    // Theme 9: 2D3047, 93B7BE, E0CA3C, A799B7, 048A81
    name: "Golden Teal", // Dark theme with teal and gold accents
    colors: {
      "--primary-bg": "#2D3047", // Dark Slate Blue/Purple
      "--secondary-bg": "#1E2030", // Darker variant
      "--ui-panel-bg": "#3A3D5A", // Slightly lighter panel

      "--button-bg": "#048A81", // Deep Teal
      "--button-hover-bg": "#05A097",
      "--button-active-bg": "#03706A",
      "--button-text": "#FFFFFF",

      "--primary-text": "#E5E7F0", // Light grey-blue text
      "--secondary-text": "#93B7BE", // Provided light blue-grey
      "--accent-color": "#E0CA3C", // Golden Yellow
      "--accent-text": "#2D3047", // Dark text for this accent
      "--rgb-accent-color": hexToRgbString("#E0CA3C"), // "224, 202, 60"

      "--highlight-bg": "rgba(224, 202, 60, 0.2)",
      "--border-color": "#4A4D6A",
      "--accent-border-color": "#E0CA3C",

      "--error-text": "#D95C5C", // A suitable red
      "--disabled-bg": "#404360",
      "--disabled-text": "#70738A",

      "--success-text": "#5CB85C",

      "--button-action-bg": "#E0CA3C", // Gold for primary actions
      "--button-action-hover-bg": "#F0DA4C",
      "--button-action-text": "#2D3047",

      "--button-delete-bg": "#A799B7", // Using the Lavender as a 'softer' delete/cancel
      "--button-delete-hover-bg": "#9789A7",
      "--button-delete-text": "#FFFFFF",

      "--input-bg": "#1E2030",
      "--input-text": "#E5E7F0",
      "--input-placeholder-text": "#70738A",
      "--progress-track-bg": "#404360",

      "--map-background-color": "#1E2030",
      "--map-region-default-fill": "#3A3D5A",
      "--map-region-border": "#2D3047",
      "--map-region-hover-fill": "#93B7BE", // Light blue-grey for hover
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMontserrat,
    },
    styles: {
      "--panel-shadow": "0 5px 16px rgba(0, 0, 0, 0.45)",
      "--button-shadow": "0 1px 2px rgba(0,0,0,0.2), 0 2px 3px rgba(0,0,0,0.1)",
      "--item-hover-shadow": "0 2px 5px rgba(0, 0, 0, 0.3)",
      "--input-focus-shadow-color": "rgba(224, 202, 60, 0.35)",
      "--element-radius": "5px",
      "--border-width": "1px",
      "--focus-ring-color": "#E0CA3C",
      "--progress-value-color": "#048A81",
      "--checkbox-accent-color": "#E0CA3C",
      "--transition-speed": "0.16s ease-in-out",
    },
  },
  amethystNight: {
    // Theme 11: FAE8EB, F6CACA, E4C2C6, CD9FCC, 0A014F
    name: "Amethyst Night", // Dark theme with pink/purple accents
    colors: {
      "--primary-bg": "#0A014F", // Very Deep Indigo/Purple
      "--secondary-bg": "#050030", // Almost Black
      "--ui-panel-bg": "#1A105F", // Slightly lighter purple panel

      "--button-bg": "#CD9FCC", // Lavender/Orchid
      "--button-hover-bg": "#DBAFCC", // Lighter hover
      "--button-active-bg": "#BD8FBC", // Darker active
      "--button-text": "#0A014F", // Dark purple text for contrast

      "--primary-text": "#FAE8EB", // Pale Pink (provided)
      "--secondary-text": "#E4C2C6", // Muted Pink (provided)
      "--accent-color": "#F6CACA", // Light Rosy Pink
      "--accent-text": "#0A014F", // Dark purple text for contrast
      "--rgb-accent-color": hexToRgbString("#F6CACA"), // "246, 202, 202"

      "--highlight-bg": "rgba(246, 202, 202, 0.2)",
      "--border-color": "#3A207F", // Dark purple border
      "--accent-border-color": "#F6CACA",

      "--error-text": "#E57373", // A soft red that fits the palette
      "--disabled-bg": "#2A186F",
      "--disabled-text": "#60508F",

      "--success-text": "#B9F6CA",

      "--button-action-bg": "#CD9FCC", // Lavender for action
      "--button-action-hover-bg": "#BD8FBC",
      "--button-action-text": "#0A014F",

      "--button-delete-bg": "#C75B5B", // Standard delete red
      "--button-delete-hover-bg": "#B04A4A",
      "--button-delete-text": "#FFFFFF",

      "--input-bg": "#050030",
      "--input-text": "#FAE8EB",
      "--input-placeholder-text": "#70609F",
      "--progress-track-bg": "#2A186F",

      "--map-background-color": "#050030",
      "--map-region-default-fill": "#1A105F",
      "--map-region-border": "#0A014F",
      "--map-region-hover-fill": "#E4C2C6", // Muted pink for hover
    },
    fonts: {
      "--font-main": fontInter,
      "--font-heading": fontMerriweather,
    },
    styles: {
      "--panel-shadow": "0 6px 18px rgba(0, 0, 0, 0.5)",
      "--button-shadow":
        "0 1px 3px rgba(0,0,0,0.25), 0 2px 4px rgba(0,0,0,0.15)",
      "--item-hover-shadow": "0 2px 6px rgba(0, 0, 0, 0.35)",
      "--input-focus-shadow-color": "rgba(246, 202, 202, 0.35)",
      "--element-radius": "8px", // Softer, more rounded
      "--border-width": "1px",
      "--focus-ring-color": "#F6CACA",
      "--progress-value-color": "#CD9FCC",
      "--checkbox-accent-color": "#CD9FCC",
      "--transition-speed": "0.18s ease-in-out",
    },
  },
  citrusSteelLight: {
    // Theme 12: FF6700, EBEBEB, C0C0C0, 3A6EA5, 004E98
    name: "Citrus Steel Light", // Light grey theme with orange and blue accents
    colors: {
      "--primary-bg": "#EBEBEB", // Light Grey
      "--secondary-bg": "#FFFFFF", // White
      "--ui-panel-bg": "#F5F5F5", // Slightly off-white

      "--button-bg": "#3A6EA5", // Steel Blue
      "--button-hover-bg": "#4A7EB5",
      "--button-active-bg": "#2A5E95",
      "--button-text": "#FFFFFF",

      "--primary-text": "#202020", // Very Dark Grey / Soft Black
      "--secondary-text": "#505050", // Medium Grey
      "--accent-color": "#FF6700", // Bright Orange
      "--accent-text": "#FFFFFF",
      "--rgb-accent-color": hexToRgbString("#FF6700"), // "255, 103, 0"

      "--highlight-bg": "rgba(255, 103, 0, 0.15)",
      "--border-color": "#C0C0C0", // Provided Silver/Grey
      "--accent-border-color": "#FF6700",

      "--error-text": "#D32F2F", // Standard Material Design Red
      "--disabled-bg": "#D0D0D0",
      "--disabled-text": "#909090",

      "--success-text": "#1E8E3E",

      "--button-action-bg": "#004E98", // Deep Blue for primary actions
      "--button-action-hover-bg": "#003E78",
      "--button-action-text": "#FFFFFF",

      "--button-delete-bg": "#E53935", // A clearer red
      "--button-delete-hover-bg": "#C62828",
      "--button-delete-text": "#FFFFFF",

      "--input-bg": "#FFFFFF",
      "--input-text": "#202020",
      "--input-placeholder-text": "#808080",
      "--progress-track-bg": "#D0D0D0",

      "--map-background-color": "#FFFFFF",
      "--map-region-default-fill": "#C0C0C0", // Silver for regions
      "--map-region-border": "#FF6700",
      "--map-region-hover-fill": "#FF6700", // Orange hover
    },
    fonts: {
      "--font-main": fontRobotoMono,
      "--font-heading": fontMontserrat,
    },
    styles: {
      "--panel-shadow": "0 3px 10px rgba(0, 0, 0, 0.1)",
      "--button-shadow":
        "0 1px 2px rgba(0,0,0,0.1), 0 2px 3px rgba(0,0,0,0.08)",
      "--item-hover-shadow": "0 2px 4px rgba(0, 0, 0, 0.1)",
      "--input-focus-shadow-color": "rgba(255, 103, 0, 0.3)",
      "--element-radius": "4px", // More modern, sharper
      "--border-width": "1px",
      "--focus-ring-color": "#FF6700",
      "--progress-value-color": "#3A6EA5",
      "--checkbox-accent-color": "#FF6700",
      "--transition-speed": "0.15s ease-in-out",
    },
  },
  monochromeWhisper: {
    // Theme 13: 000500, 362417, 92817A, F1DABF, FFFBFF
    name: "Monochrome Whisper", // Light, almost monochrome theme with subtle warmth
    colors: {
      "--primary-bg": "#FFFBFF", // Almost White (Off-white)
      "--secondary-bg": "#F7F3F7", // Slightly darker off-white
      "--ui-panel-bg": "#FDF7FD", // Panel background

      "--button-bg": "#92817A", // Muted Brownish Grey
      "--button-hover-bg": "#A2918A",
      "--button-active-bg": "#82716A",
      "--button-text": "#FFFBFF",

      "--primary-text": "#362417", // Dark Brown (almost black)
      "--secondary-text": "#604D40", // Softer Brown
      "--accent-color": "#604D40", // Pale Beige/Cream
      "--accent-text": "#362417", // Dark brown text on accent
      "--rgb-accent-color": hexToRgbString("#362417"), // "241, 218, 191"

      "--highlight-bg": "rgba(241, 218, 191, 0.4)", // More opaque for subtle highlight
      "--border-color": "#D8CBC4", // Light brownish grey border
      "--accent-border-color": "#E0C8B0", // Slightly darker beige for accent border

      "--error-text": "#B75D5D", // Muted red
      "--disabled-bg": "#E8E0DA",
      "--disabled-text": "#A09085",

      "--success-text": "#506A50",

      "--button-action-bg": "#92817A", // Using main button color
      "--button-action-hover-bg": "#82716A",
      "--button-action-text": "#FFFBFF",

      "--button-delete-bg": "#A05050", // Muted delete red
      "--button-delete-hover-bg": "#8A4040",
      "--button-delete-text": "#FFFBFF",

      "--input-bg": "#F7F3F7",
      "--input-text": "#362417",
      "--input-placeholder-text": "#B0A095",
      "--progress-track-bg": "#E8E0DA",

      "--map-background-color": "#F7F3F7",
      "--map-region-default-fill": "#E0D0C8", // Light brownish fill
      "--map-region-border": "#000500", // Using the very dark green as a subtle border on light bg
      "--map-region-hover-fill": "#F1DABF",
    },
    fonts: {
      "--font-main": fontMerriweather,
      "--font-heading": fontInter,
    },
    styles: {
      "--panel-shadow": "0 2px 8px rgba(54, 36, 23, 0.08)", // Shadow from primary text color
      "--button-shadow": "0 1px 1px rgba(54, 36, 23, 0.1)",
      "--item-hover-shadow": "0 1px 3px rgba(54, 36, 23, 0.1)",
      "--input-focus-shadow-color": "rgba(241, 218, 191, 0.6)",
      "--element-radius": "2px", // Very sharp
      "--border-width": "1px",
      "--focus-ring-color": "#92817A", // Button color for focus ring for visibility
      "--progress-value-color": "#92817A",
      "--checkbox-accent-color": "#92817A",
      "--transition-speed": "0.1s ease-out",
    },
  },
  vintageRosewood: {
    // Theme 14: EDD4B2, D0A98F, 4D243D, CAC2B5, ECDCC9
    name: "Vintage Rosewood", // Warm, light theme with a deep purple accent
    colors: {
      "--primary-bg": "#ECDCC9", // Light Beige/Cream
      "--secondary-bg": "#F6F0E9", // Lighter, almost white
      "--ui-panel-bg": "#EDD4B2", // Warmer Beige (provided)

      "--button-bg": "#D0A98F", // Muted Rose/Tan
      "--button-hover-bg": "#E0B99F",
      "--button-active-bg": "#C0997F",
      "--button-text": "#4D243D", // Deep Purple text

      "--primary-text": "#4D243D", // Deep Purple (provided)
      "--secondary-text": "#7A506A", // Muted Purple
      "--accent-color": "#4D243D", // Using the deep purple as accent too
      "--accent-text": "#FFFFFF",
      "--rgb-accent-color": hexToRgbString("#4D243D"), // "77, 36, 61"

      "--highlight-bg": "rgba(77, 36, 61, 0.15)",
      "--border-color": "#CAC2B5", // Provided Greyish Beige
      "--accent-border-color": "#4D243D",

      "--error-text": "#C94C4C", // A vintage-y red
      "--disabled-bg": "#D8D2C9",
      "--disabled-text": "#A0988F",

      "--success-text": "#2E7D32",

      "--button-action-bg": "#4D243D",
      "--button-action-hover-bg": "#60304D",
      "--button-action-text": "#FFFFFF",

      "--button-delete-bg": "#B56060",
      "--button-delete-hover-bg": "#A05050",
      "--button-delete-text": "#FFFFFF",

      "--input-bg": "#F6F0E9",
      "--input-text": "#4D243D",
      "--input-placeholder-text": "#A8988E",
      "--progress-track-bg": "#D8D2C9",

      "--map-background-color": "#F6F0E9",
      "--map-region-default-fill": "#CAC2B5",
      "--map-region-border": "#4D243D",
      "--map-region-hover-fill": "#D0A98F", // Rose/Tan for hover
    },
    fonts: {
      "--font-main": fontMerriweather,
      "--font-heading": fontMontserrat,
    },
    styles: {
      "--panel-shadow": "0 4px 12px rgba(77, 36, 61, 0.12)",
      "--button-shadow": "0 1px 2px rgba(77, 36, 61, 0.1)",
      "--item-hover-shadow": "0 2px 5px rgba(77, 36, 61, 0.1)",
      "--input-focus-shadow-color": "rgba(77, 36, 61, 0.3)",
      "--element-radius": "5px",
      "--border-width": "1px",
      "--focus-ring-color": "#4D243D",
      "--progress-value-color": "#D0A98F",
      "--checkbox-accent-color": "#4D243D",
      "--transition-speed": "0.16s ease-in-out",
    },
  },
};

export const defaultTheme = "executiveDark";

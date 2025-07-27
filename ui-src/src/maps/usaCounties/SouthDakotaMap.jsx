import React from "react";
import "../JapanMap.css";

const COUNTY_DATA = {
  Meade: { gameId: "USA_SD_093", name: "Meade" },
  Union: { gameId: "USA_SD_127", name: "Union" },
  Jackson: { gameId: "USA_SD_071", name: "Jackson" },
  Haakon: { gameId: "USA_SD_055", name: "Haakon" },
  Tripp: { gameId: "USA_SD_123", name: "Tripp" },
  Dewey: { gameId: "USA_SD_041", name: "Dewey" },
  "Bon Homme": { gameId: "USA_SD_009", name: "Bon Homme" },
  Stanley: { gameId: "USA_SD_119", name: "Stanley" },
  Turner: { gameId: "USA_SD_125", name: "Turner" },
  Mellette: { gameId: "USA_SD_095", name: "Mellette" },
  "Fall River": { gameId: "USA_SD_047", name: "Fall River" },
  Jones: { gameId: "USA_SD_075", name: "Jones" },
  Ziebach: { gameId: "USA_SD_137", name: "Ziebach" },
  Jerauld: { gameId: "USA_SD_073", name: "Jerauld" },
  Sanborn: { gameId: "USA_SD_111", name: "Sanborn" },
  Pennington: { gameId: "USA_SD_103", name: "Pennington" },
  "Charles Mix": { gameId: "USA_SD_023", name: "Charles Mix" },
  Davison: { gameId: "USA_SD_035", name: "Davison" },
  Bennett: { gameId: "USA_SD_007", name: "Bennett" },
  Lyman: { gameId: "USA_SD_085", name: "Lyman" },
  McCook: { gameId: "USA_SD_087", name: "McCook" },
  Minnehaha: { gameId: "USA_SD_099", name: "Minnehaha" },
  Hanson: { gameId: "USA_SD_057", name: "Hanson" },
  Beadle: { gameId: "USA_SD_005", name: "Beadle" },
  Deuel: { gameId: "USA_SD_039", name: "Deuel" },
  Moody: { gameId: "USA_SD_101", name: "Moody" },
  Perkins: { gameId: "USA_SD_105", name: "Perkins" },
  Hutchinson: { gameId: "USA_SD_067", name: "Hutchinson" },
  Lawrence: { gameId: "USA_SD_081", name: "Lawrence" },
  Brule: { gameId: "USA_SD_015", name: "Brule" },
  Hyde: { gameId: "USA_SD_069", name: "Hyde" },
  Lincoln: { gameId: "USA_SD_083", name: "Lincoln" },
  Yankton: { gameId: "USA_SD_135", name: "Yankton" },
  Clay: { gameId: "USA_SD_027", name: "Clay" },
  Brown: { gameId: "USA_SD_013", name: "Brown" },
  Brookings: { gameId: "USA_SD_011", name: "Brookings" },
  Edmunds: { gameId: "USA_SD_045", name: "Edmunds" },
  Spink: { gameId: "USA_SD_115", name: "Spink" },
  Custer: { gameId: "USA_SD_033", name: "Custer" },
  Lake: { gameId: "USA_SD_079", name: "Lake" },
  Sully: { gameId: "USA_SD_121", name: "Sully" },
  McPherson: { gameId: "USA_SD_089", name: "McPherson" },
  Douglas: { gameId: "USA_SD_043", name: "Douglas" },
  Miner: { gameId: "USA_SD_101", name: "Miner" },
  Campbell: { gameId: "USA_SD_021", name: "Campbell" },
  Hand: { gameId: "USA_SD_059", name: "Hand" },
  Roberts: { gameId: "USA_SD_109", name: "Roberts" },
  Corson: { gameId: "USA_SD_031", name: "Corson" },
  Walworth: { gameId: "USA_SD_129", name: "Walworth" },
  Hamlin: { gameId: "USA_SD_057", name: "Hamlin" },
  Marshall: { gameId: "USA_SD_091", name: "Marshall" },
  Grant: { gameId: "USA_SD_051", name: "Grant" },
  Day: { gameId: "USA_SD_037", name: "Day" },
  Buffalo: { gameId: "USA_SD_017", name: "Buffalo" },
  Gregory: { gameId: "USA_SD_053", name: "Gregory" },
  Potter: { gameId: "USA_SD_107", name: "Potter" },
  Harding: { gameId: "USA_SD_063", name: "Harding" },
};

const countyPathData = {
  Meade:
    "M 60.78 194.59 73.09 194.96 122.38 196.74 122.82 184.41 123.33 184.43 124.62 143.82 125.04 134.58 157.74 135.69 170.07 135.87 180.38 136.22 222.05 137.27 221.42 166.37 220.5 212.52 220.43 212.62 216.67 213.57 214.88 216.46 209.66 221.61 208.8 223.11 204.61 221.68 204.09 223.82 200.9 224.18 197.58 221.74 197.64 220.5 191.22 221.95 189.25 224.96 189.57 230.79 188.16 232.94 185.04 235.02 184.92 237.84 182.93 242.19 182.12 245.13 182.99 246.84 183.06 251.86 179.66 255.26 178.35 259.21 179.76 259.75 179.55 264.69 158.92 264.15 123.82 263.08 70.05 261.2 70.62 244.66 58.16 244.26 58.66 231.68 59.16 231.69 60.78 194.59 Z",
  Union:
    "M 760.37 410.4 797.15 408.8 796.59 411.59 793.58 413.63 791.51 413.85 791.6 417.45 793.72 419.5 790.94 424.21 793.15 426.72 792.28 428.79 789.1 431.89 790.72 436.67 788.52 440.69 788.71 443.89 785.35 445.05 784.5 449.74 781.77 452.31 780.26 455.35 780.4 458.63 781.6 460.69 781.5 462.86 783.76 463.95 791.19 470.27 791.25 471.56 793.63 473.74 793.65 475.81 795.02 477.31 796.21 480.99 795.91 483.59 798.27 484.16 798.17 488.72 799 491.64 798.92 495 796.18 494.74 793.48 490.93 789.97 489.64 785.25 492.13 782.82 490.94 781.3 485.52 779.02 483.55 776.1 482.03 773.24 477.84 773.53 475.37 775.42 471.31 771.08 469.53 767.32 470.4 763.24 469.1 762.62 464.57 761.36 433.11 760.37 410.4 Z",
  Jackson:
    "M 203.79 328.03 206.06 326.87 208.17 329.13 212.75 329.89 216.28 327.19 217.08 286.36 218.3 286.38 254.04 286.98 292.97 287.51 315.61 287.73 315.39 309.71 313.09 308.47 310.96 310.29 309.14 309.19 307.29 312.65 305.32 311.19 303.33 312.84 300.69 313.71 298.37 316.04 297.74 374.1 269.21 373.76 242.5 373.36 205.78 372.51 206.01 360.1 203.11 360.06 203.79 328.03 Z",
  Haakon:
    "M 220.43 212.62 220.5 212.52 222.76 210.98 226.45 209.49 228.23 210.05 231.96 208.91 232.74 209.69 237.76 211.15 241.05 208.64 243.03 209.4 246.88 206.66 249.84 203.36 253.2 204.62 253.83 203.3 256.91 202.66 258.81 204.31 263.5 203.79 268.62 205.31 272.54 202.61 275.28 198.06 277.46 195.38 280.9 194.61 282.34 192.83 284.05 193.26 286.49 190.34 289.55 188 290.46 189.5 292.95 188.27 294.5 188.94 297.73 186.95 299.62 187.92 306.4 183.91 307.82 180.86 309.14 180.18 309.03 188.35 307.26 188.34 306.7 237.89 305.51 237.88 305.26 262.89 317.59 262.95 317.39 287.74 315.61 287.73 292.97 287.51 254.04 286.98 218.3 286.38 218.64 267.74 219.32 236.49 219.96 236.49 220.43 212.62 Z",
  Tripp:
    "M 401.62 328.21 402.29 330.57 403.92 332.54 405.28 329.43 407.92 329.33 410.43 330.73 411.81 329.72 413.18 331.84 414.6 330.97 417.28 331.42 422.34 330.49 424.17 329.01 427.89 331.85 430.23 330.37 433.3 331.98 436.6 330.29 437.56 333.33 439.88 333.07 439.39 331.25 442.38 331.6 451.01 327.42 450.01 324.75 452.42 323.23 453.54 327.28 455.52 325.16 457.02 321.47 458.58 322.88 457.59 325.22 460.55 324.76 459.96 321.11 462.43 321.49 462.75 324.82 464.53 323.82 464.83 358.47 474.1 358.4 474.24 366.43 474.83 430.07 434.52 430.36 405.15 430.39 405.08 411.82 403.51 411.84 403.41 374.43 403.37 362 401.65 361.91 401.62 328.21 Z",
  Dewey:
    "M 276.6 76.12 313.85 76.53 363.67 76.83 390.14 76.83 391.19 80.91 394.67 85.45 396.96 89.85 396.14 93.64 393.53 96.97 392.68 98.99 393.62 102.71 397.59 107.11 398.39 109.15 398.28 112.37 396.9 116.09 396.5 121.72 395.31 124.66 391.8 130.24 391.96 133.84 392.71 135.96 396.25 139.66 396.37 141.8 392.78 142.2 387.97 140.28 385.07 140.72 381.81 145.86 382.63 155.36 383.74 159.06 384.93 162.3 383.94 164.9 382.32 166.82 376.57 170.66 372.76 175.06 371.01 177.82 369.6 178.56 362.92 177.35 359.6 174.13 356.1 169.64 353.47 168.89 351.22 171.84 350.69 174.66 351.86 177.09 345.75 176.89 344.13 177.98 342.25 177.45 340.31 175.25 334.51 177.16 332.5 175.17 331.54 177.16 327.66 179.31 325.53 179.77 324.32 182.48 320.75 183.57 317.42 181.26 314.59 181.48 309.14 180.18 309.55 144.89 301.21 144.88 272.54 144.51 272.63 138.13 274.09 138.14 274.44 110.25 274.81 88.51 276.35 88.53 276.6 76.12 Z",
  "Bon Homme":
    "M 626.96 402.94 660.55 401.78 672.92 401.51 673.95 426.18 674.61 446.81 669.28 448.27 665.69 447.67 660 447.51 652.48 445.17 649.36 446.55 648.15 452.52 646.5 455.19 641.87 459.51 638.98 459.55 636.61 460.56 632.96 460.53 630.31 459.38 629.96 458.2 622.85 452.66 620.25 450.18 620.11 449.06 623.23 445.88 624.2 444.1 624.22 436.26 625.93 430.08 623.83 426.91 624.78 421.75 623.88 414.58 624.46 410.96 625.51 410.02 625.69 405.23 626.96 402.94 Z",
  Stanley:
    "M 309.14 180.18 314.59 181.48 317.42 181.26 320.75 183.57 324.32 182.48 325.53 179.77 327.66 179.31 331.54 177.16 332.5 175.17 334.51 177.16 340.31 175.25 342.25 177.45 344.13 177.98 345.75 176.89 351.86 177.09 355.16 179.4 355.65 180.47 360.76 181.94 362.41 186.25 362.43 188.96 361.26 194.19 359.45 198.44 359.11 201.84 359.67 203.87 361.61 206.31 364.46 207.77 370.18 208.35 371.25 209.1 372.16 211.76 370.71 213.71 368.49 214.58 366.19 217.04 365.67 219.5 366.37 222.22 370.23 223.78 376.51 221.55 383.4 222.01 385.57 224.47 387.71 236.54 389.08 237.73 401.35 240.82 405.5 241.23 408.2 240.94 416.45 243.23 421.05 246.37 426.83 248.92 429.29 249.46 433.34 249.25 435.16 250.32 436.34 252.66 434.9 254.99 431.97 257.79 431.63 259.35 410.48 259.49 387.51 259.53 387.52 263.23 344.92 263.21 317.59 262.95 305.26 262.89 305.51 237.88 306.7 237.89 307.26 188.34 309.03 188.35 309.14 180.18 Z",
  Turner:
    "M 695.92 353.42 724.19 352.39 745.46 351.49 747.98 410.91 723.24 411.97 722.76 399.58 697.82 400.57 695.92 353.42 Z",
};

const countyOrderFromSVG = [
  "Meade",
  "Union",
  "Jackson",
  "Haakon",
  "Tripp",
  "Dewey",
  "Bon Homme",
  "Stanley",
  "Turner",
  "Mellette",
  "Fall River",
  "Jones",
  "Ziebach",
  "Jerauld",
  "Sanborn",
  "Pennington",
  "Charles Mix",
  "Davison",
  "Bennett",
  "Lyman",
  "McCook",
  "Minnehaha",
  "Hanson",
  "Beadle",
  "Deuel",
  "Moody",
  "Perkins",
  "Hutchinson",
  "Lawrence",
  "Brule",
  "Hyde",
  "Lincoln",
  "Yankton",
  "Clay",
  "Brown",
  "Brookings",
  "Edmunds",
  "Spink",
  "Custer",
  "Lake",
  "Sully",
  "McPherson",
  "Douglas",
  "Miner",
  "Campbell",
  "Hand",
  "Roberts",
  "Corson",
  "Walworth",
  "Hamlin",
  "Marshall",
  "Grant",
  "Day",
  "Buffalo",
  "Gregory",
  "Potter",
  "Harding",
];

function SouthDakotaMap({ onSelectCounty, selectedCountyGameId }) {
  const handleCountyClick = (svgId) => {
    const county = COUNTY_DATA[svgId];
    if (county && onSelectCounty) {
      onSelectCounty(county.gameId, county.name);
    } else {
      console.warn(`No game data found for SVG ID: ${svgId}`);
    }
  };

  const renderCountyPath = (svgId) => {
    const countyInfo = COUNTY_DATA[svgId];
    if (!countyInfo) {
      console.warn(`No data found for county: ${svgId}`);
      return null;
    }

    const pathD = countyPathData[svgId];

    if (!pathD) {
      console.warn(`Path data (d attribute) missing for ${svgId}`);
      return null;
    }

    return (
      <path
        key={svgId}
        id={svgId}
        title={countyInfo.name}
        className={`prefecture-path ${
          selectedCountyGameId === countyInfo.gameId ? "selected" : ""
        }`}
        onClick={() => handleCountyClick(svgId)}
        d={pathD}
      />
    );
  };

  return (
    <svg
      version="1.2"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 810 506"
      className="interactive-japan-map"
      preserveAspectRatio="xMidYMid meet"
    >
      <g id="south-dakota-counties-group">
        {countyOrderFromSVG.map((svgId) => renderCountyPath(svgId))}
      </g>
    </svg>
  );
}

export default SouthDakotaMap;

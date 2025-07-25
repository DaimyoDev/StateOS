import React from "react";
import "../JapanMap.css";

const COUNTY_DATA = {
  Carroll: { gameId: "USA_MO_033", name: "Carroll" },
  "New Madrid": { gameId: "USA_MO_143", name: "New Madrid" },
  Holt: { gameId: "USA_MO_087", name: "Holt" },
  Lincoln: { gameId: "USA_MO_113", name: "Lincoln" },
  Boone: { gameId: "USA_MO_019", name: "Boone" },
  Jefferson: { gameId: "USA_MO_099", name: "Jefferson" },
  Stoddard: { gameId: "USA_MO_207", name: "Stoddard" },
  "St. Louis": { gameId: "USA_MO_189", name: "St. Louis" },
  Saline: { gameId: "USA_MO_195", name: "Saline" },
  "Cape Girardeau": { gameId: "USA_MO_031", name: "Cape Girardeau" },
  Putnam: { gameId: "USA_MO_171", name: "Putnam" },
  Dunklin: { gameId: "USA_MO_069", name: "Dunklin" },
  "St. Charles": { gameId: "USA_MO_183", name: "St. Charles" },
  Camden: { gameId: "USA_MO_029", name: "Camden" },
  Shelby: { gameId: "USA_MO_205", name: "Shelby" },
  Jackson: { gameId: "USA_MO_095", name: "Jackson" },
  Schuyler: { gameId: "USA_MO_197", name: "Schuyler" },
  Cass: { gameId: "USA_MO_037", name: "Cass" },
  "Ste. Genevieve": { gameId: "USA_MO_186", name: "Ste. Genevieve" },
  Phelps: { gameId: "USA_MO_161", name: "Phelps" },
  Laclede: { gameId: "USA_MO_105", name: "Laclede" },
  Platte: { gameId: "USA_MO_165", name: "Platte" },
  "St. Francois": { gameId: "USA_MO_187", name: "St. Francois" },
  Audrain: { gameId: "USA_MO_007", name: "Audrain" },
  Gasconade: { gameId: "USA_MO_073", name: "Gasconade" },
  Lafayette: { gameId: "USA_MO_107", name: "Lafayette" },
  Barton: { gameId: "USA_MO_011", name: "Barton" },
  Macon: { gameId: "USA_MO_121", name: "Macon" },
  Christian: { gameId: "USA_MO_043", name: "Christian" },
  Osage: { gameId: "USA_MO_151", name: "Osage" },
  Pettis: { gameId: "USA_MO_159", name: "Pettis" },
  Livingston: { gameId: "USA_MO_117", name: "Livingston" },
  Callaway: { gameId: "USA_MO_027", name: "Callaway" },
  Vernon: { gameId: "USA_MO_217", name: "Vernon" },
  Chariton: { gameId: "USA_MO_041", name: "Chariton" },
  "St. Louis City": { gameId: "USA_MO_510", name: "St. Louis City" },
  Perry: { gameId: "USA_MO_157", name: "Perry" },
  Bollinger: { gameId: "USA_MO_017", name: "Bollinger" },
  Butler: { gameId: "USA_MO_023", name: "Butler" },
  Ripley: { gameId: "USA_MO_181", name: "Ripley" },
  Carter: { gameId: "USA_MO_035", name: "Carter" },
  Wayne: { gameId: "USA_MO_223", name: "Wayne" },
  Madison: { gameId: "USA_MO_123", name: "Madison" },
  Iron: { gameId: "USA_MO_093", name: "Iron" },
  Reynolds: { gameId: "USA_MO_179", name: "Reynolds" },
  Shannon: { gameId: "USA_MO_203", name: "Shannon" },
  Oregon: { gameId: "USA_MO_149", name: "Oregon" },
  Howell: { gameId: "USA_MO_091", name: "Howell" },
  Ozark: { gameId: "USA_MO_153", name: "Ozark" },
  Douglas: { gameId: "USA_MO_067", name: "Douglas" },
  Wright: { gameId: "USA_MO_229", name: "Wright" },
  Texas: { gameId: "USA_MO_215", name: "Texas" },
  Dent: { gameId: "USA_MO_065", name: "Dent" },
  Crawford: { gameId: "USA_MO_055", name: "Crawford" },
  Washington: { gameId: "USA_MO_221", name: "Washington" },
  Franklin: { gameId: "USA_MO_071", name: "Franklin" },
  Maries: { gameId: "USA_MO_125", name: "Maries" },
  Pulaski: { gameId: "USA_MO_169", name: "Pulaski" },
  Webster: { gameId: "USA_MO_225", name: "Webster" },
  Greene: { gameId: "USA_MO_077", name: "Greene" },
  Taney: { gameId: "USA_MO_213", name: "Taney" },
  Stone: { gameId: "USA_MO_209", name: "Stone" },
  Barry: { gameId: "USA_MO_009", name: "Barry" },
  McDonald: { gameId: "USA_MO_119", name: "McDonald" },
  Newton: { gameId: "USA_MO_145", name: "Newton" },
  Jasper: { gameId: "USA_MO_097", name: "Jasper" },
  "St. Clair": { gameId: "USA_MO_185", name: "St. Clair" },
  Cedar: { gameId: "USA_MO_039", name: "Cedar" },
  Dade: { gameId: "USA_MO_057", name: "Dade" },
  Lawrence: { gameId: "USA_MO_109", name: "Lawrence" },
  Polk: { gameId: "USA_MO_167", name: "Polk" },
  Dallas: { gameId: "USA_MO_059", name: "Dallas" },
  Hickory: { gameId: "USA_MO_085", name: "Hickory" },
  Miller: { gameId: "USA_MO_131", name: "Miller" },
  Cole: { gameId: "USA_MO_051", name: "Cole" },
  Moniteau: { gameId: "USA_MO_135", name: "Moniteau" },
  Morgan: { gameId: "USA_MO_141", name: "Morgan" },
  Benton: { gameId: "USA_MO_015", name: "Benton" },
  Henry: { gameId: "USA_MO_083", name: "Henry" },
  Bates: { gameId: "USA_MO_013", name: "Bates" },
  Johnson: { gameId: "USA_MO_101", name: "Johnson" },
  Cooper: { gameId: "USA_MO_053", name: "Cooper" },
  Montgomery: { gameId: "USA_MO_139", name: "Montgomery" },
  Warren: { gameId: "USA_MO_219", name: "Warren" },
  Pike: { gameId: "USA_MO_163", name: "Pike" },
  Ralls: { gameId: "USA_MO_173", name: "Ralls" },
  Monroe: { gameId: "USA_MO_137", name: "Monroe" },
  Marion: { gameId: "USA_MO_127", name: "Marion" },
  Lewis: { gameId: "USA_MO_111", name: "Lewis" },
  Clark: { gameId: "USA_MO_045", name: "Clark" },
  Scotland: { gameId: "USA_MO_199", name: "Scotland" },
  Knox: { gameId: "USA_MO_103", name: "Knox" },
  Adair: { gameId: "USA_MO_001", name: "Adair" },
  Randolph: { gameId: "USA_MO_175", name: "Randolph" },
  Howard: { gameId: "USA_MO_089", name: "Howard" },
  Ray: { gameId: "USA_MO_177", name: "Ray" },
  Linn: { gameId: "USA_MO_115", name: "Linn" },
  Sullivan: { gameId: "USA_MO_211", name: "Sullivan" },
  Mercer: { gameId: "USA_MO_129", name: "Mercer" },
  Grundy: { gameId: "USA_MO_079", name: "Grundy" },
  Daviess: { gameId: "USA_MO_061", name: "Daviess" },
  DeKalb: { gameId: "USA_MO_063", name: "DeKalb" },
  Clinton: { gameId: "USA_MO_049", name: "Clinton" },
  Buchanan: { gameId: "USA_MO_021", name: "Buchanan" },
  Andrew: { gameId: "USA_MO_003", name: "Andrew" },
  Atchison: { gameId: "USA_MO_005", name: "Atchison" },
  Nodaway: { gameId: "USA_MO_147", name: "Nodaway" },
  Worth: { gameId: "USA_MO_227", name: "Worth" },
  Gentry: { gameId: "USA_MO_075", name: "Gentry" },
  Harrison: { gameId: "USA_MO_081", name: "Harrison" },
};

const countyPathData = {
  Carroll:
    "M 233.39 169.02 233.67 155.76 245.64 155.87 260.14 155.73 290.42 155.76 291.69 162.53 292.05 166.97 290.41 169.71 291.7 173.75 290.5 175.81 293.84 179.85 296.15 177.56 297.14 180.99 296.03 183.2 298.72 184.23 303.51 183.25 304.78 185.49 308.81 186.1 309.37 190.45 310.69 191.34 308.23 192.24 305.06 190.77 303.62 188.03 300.65 187.17 299.31 188.49 300.53 191.56 300.29 194.01 296.74 199.23 292.68 198.21 290.06 202.2 283.59 202.44 282.19 205.86 283.92 209.18 283.38 211.54 279.22 214.05 275.2 214.99 273.64 212.7 275.13 209.93 273.83 208.74 270.24 208.58 267.81 204.91 266.36 204.83 264.84 205.99 264.06 209.07 264.99 214.58 263.51 216.23 258.29 216.51 256.03 215.83 253.48 212.69 245.71 211.4 244.33 213.28 241.98 213.95 239.75 217.2 232.8 217.52 233.39 169.02 Z",
  "New Madrid":
    "M 695.06 608 711.07 607.87 726.8 607.41 726.09 590.37 726.4 590.18 725.29 572.02 726.91 571.93 737.42 571.29 742.2 569.97 747.95 569.75 748.07 573.07 750.31 575.31 752.6 575.23 755.17 579.66 757.45 581.73 757.52 585.04 759.74 586.03 759.83 588.19 763.26 590.61 764.53 594.71 766.71 594.63 768.01 599.01 770.28 600.05 770.38 602.33 772.69 603.3 772.74 605.25 768.1 606.5 766.93 607.96 766.19 612.9 762.35 625.95 758.12 631.85 755.24 632.47 752.97 629.77 755.91 622.75 756.23 620.47 755.15 616.87 753.67 615.1 748.36 613.84 745.3 614.54 743.61 616.57 743.14 619.16 744.59 622.47 749.87 631.24 746.9 636.23 747.3 638.49 751.55 645.46 750.52 649.32 747.36 651.22 747.24 647.68 742.37 644.3 741.21 641.16 738.87 640.1 735.37 641.8 730.68 641.86 728.38 639.62 724.66 638.07 722.28 639.48 721.55 644.4 703.95 644.9 695.72 644.74 694.96 641.81 695.91 633.83 695.26 623.56 696 620.77 694.62 612.31 695.06 608 Z",
  Holt: "M 24.83 50.89 68.61 52.73 81.37 53.24 81.06 55.9 82.03 61.66 80.85 63.21 82.64 72.37 84.13 73.31 84.81 75.55 83.86 81.2 82.02 83.03 87.59 86.15 88.13 93.74 89.7 102.11 87.68 104.39 89.04 106.33 88.97 108.96 85.98 108.94 84.79 112.86 83.61 113.74 78.44 114.18 73 112.12 71.57 110.92 71.29 107.82 69.42 106.99 67.08 107.98 64.03 106.63 64.67 102.69 62.49 101.06 60.01 100.9 56.77 97.06 53.01 94.66 51.32 90.19 48.04 87.79 43.76 87.82 40.22 85.98 39.38 82.81 40.84 80.51 40.83 77.88 43 74.94 42.41 72.59 38.68 70.64 38.16 67.51 33.59 63.8 32.98 60.92 34.6 56.81 31.94 53.41 28.34 53.05 24.83 50.89 Z",
  Lincoln:
    "M 529.8 227.81 538.69 227.81 538.8 214.34 560.52 214.42 572.96 214.11 593.59 213.88 595.08 221.14 595.3 224.39 598.16 230.03 598.65 234.52 595.19 239.37 595.34 240.93 599.48 249.25 599.84 253.78 601.42 258.01 598.06 258.08 594.21 261.89 591.69 258.93 590.64 260.28 587.76 260.07 584.67 261.87 583.17 267.27 577.56 265.55 569.41 265.99 566.44 264.92 566.38 268.34 548.14 268.35 548.13 259.31 538.69 259.41 538.67 250.3 529.62 250.28 529.8 227.81 Z",
  Boone:
    "M 390.63 212.18 404.37 212.52 429.33 213.45 428.73 240.27 426.21 240.24 425.7 245.14 426.35 246.22 425.6 251.33 423.68 258.71 423.19 270.77 424.39 273.69 423.78 276.36 425.92 278.51 422.4 283.32 422.81 284.91 419.89 288.96 419.14 291.94 416.27 293.72 415.8 304.62 410.82 304.14 407.08 301.07 399.36 299.1 398.93 297.19 401.1 295.2 399.06 291.38 394.92 290.01 393.17 286.17 395.4 283.67 396.73 280.7 396.15 278.34 392.27 277.83 388.93 274.86 387.51 271.51 384.99 269.4 385.41 265.2 382.53 262.07 375.41 254.65 373.98 253.27 374.95 249.69 382.22 232.94 390.63 212.18 Z",
  Jefferson:
    "M 594.1 329.6 594.75 327.13 598.93 328.8 601.07 332.63 603.97 330.85 603.14 327.5 606.36 326.43 608.81 328.59 611.43 323.9 632.86 323.56 633.77 325.51 631.8 327.05 633.43 330.82 635.62 331.18 640.08 329.91 642.27 331.39 640.97 333.26 640.96 337.97 641.81 340.56 638.75 347.96 638.41 356.23 639.3 362.37 640.92 367.23 644.84 372.07 648.69 373.68 650.64 375.59 653.44 380.08 652.38 383.15 650.03 383.89 648.7 386.06 644.35 385.43 634.02 393.6 613.94 399.96 610.34 397.97 609.21 394.42 610.15 389.63 606.87 388.94 602.28 387.45 601.79 385.05 589.58 369.79 590.4 362.76 594.1 337.35 594.1 329.6 Z",
  Stoddard:
    "M 657.12 564.23 659.14 562.06 661.35 562.03 661.32 557.62 667.92 550.89 670.17 550.86 670.16 545.67 674.72 545.59 688.87 545.4 688.79 543.16 693.28 543.1 692.94 531.97 704.31 531.82 716.71 531.49 714.24 537.41 718.52 546.14 722.86 552.59 723.64 557.88 727.21 561.45 726.47 565.82 727.39 567.72 726.15 569.72 726.91 571.93 725.29 572.02 726.4 590.18 726.09 590.37 726.8 607.41 711.07 607.87 695.06 608 671.72 608.4 672.85 606.58 671.84 604.51 670.18 594.33 668.31 590.62 664.71 586.17 664.99 582.05 662.69 580.51 661.63 577.82 662.58 576.2 659.98 573.23 657.95 572.22 658.42 567.93 657.12 564.23 Z",
  "St. Louis":
    "M 594.07 303.22 596.6 302.34 598.13 299.92 600.35 299.08 600.87 296.53 602.53 295.53 606.91 295.18 609.32 296.39 617.04 295.5 618.07 293.67 618.06 288.45 622.04 286 623.56 283.64 624.6 279.41 627.33 274.93 629.21 273.41 635.36 274.44 637.74 273.48 639.25 271.33 640.63 265.05 642.53 263.69 645.1 264.15 650.32 269.47 657.66 274 659.18 274.45 662.08 272.74 665.89 273.78 667.04 276.13 666.43 277.32 661.36 281.32 659.02 283.12 654.89 288 651.34 289.81 645.58 299.61 643.57 309.05 646.5 313.84 649.47 315.87 651.32 318.36 650.64 320.13 647.5 334.25 641.81 340.56 640.96 337.97 640.97 333.26 642.27 331.39 640.08 329.91 635.62 331.18 633.43 330.82 631.8 327.05 633.77 325.51 632.86 323.56 611.43 323.9 608.81 328.59 606.36 326.43 603.14 327.5 603.97 330.85 601.07 332.63 598.93 328.8 594.75 327.13 594.1 329.6 594.22 312.8 594.07 303.22 Z",
  Saline:
    "M 263.5 258.26 266.36 204.83 267.81 204.91 270.24 208.58 273.83 208.74 275.13 209.93 273.64 212.7 275.2 214.99 279.22 214.05 283.38 211.54 283.92 209.18 282.19 205.86 283.59 202.44 290.06 202.2 292.68 198.21 296.74 199.23 300.29 194.01 300.53 191.56 299.31 188.49 300.65 187.17 303.62 188.03 305.06 190.77 308.23 192.24 310.69 191.34 313.55 193.18 314.39 198.72 317.71 201.47 320.2 202.18 325.77 201.85 327.79 202.31 327.86 206.81 329.22 208.8 333 211.37 332.5 214.69 334.09 216.11 339.56 213.97 340.85 215.55 339.43 219.52 334.21 224.69 333.9 228 332.1 230.07 329.8 230.82 329.65 234.24 333.67 235.47 333.85 237.21 330.6 240.19 316.98 254.16 316.67 260.94 310.05 260.4 285.59 259.5 263.5 258.26 Z",
  "Cape Girardeau":
    "M 702.96 459.56 708.36 459.31 713.12 460.58 717.29 460.16 718.28 458.77 721.19 459.01 726.09 461.09 726.8 459 730.12 459.01 731.61 460.37 734.29 459.74 737.59 462.63 740.23 461.88 741.73 463.33 744.37 463.37 745.16 468.03 748.33 474.29 751 478.41 753.54 480.84 755.71 484.32 757.28 488.81 756.79 495.09 755.89 496.91 749.22 499.12 746.81 502.34 746.14 506.23 749.91 511.31 747.71 512.53 738.4 513.38 733.94 514.63 733.99 516.88 730.42 516.99 730.5 518.84 726.07 520.15 723.92 522.43 724.09 526.85 721.96 529.12 717.47 529.25 716.71 531.49 704.31 531.82 703.89 517.65 704.33 517.63 704.06 503.64 703.24 475.26 702.96 459.56 Z",
  Putnam:
    "M 280.49 8.29 293.75 8.35 308.29 8.15 330.91 7.54 357.35 7.36 358.78 8.67 357.78 12.31 361.01 11.85 358.47 16.04 360.52 17.38 361.63 21.72 358.48 24.98 359.74 32.83 362.38 34.8 360.61 37.2 360.81 44.96 340.77 45.01 340.83 38.42 327.63 38.53 314.13 38.19 281.06 38.45 281.19 24.88 280.28 24.76 280.49 8.29 Z",
  Dunklin:
    "M 663.67 628.89 664.25 622.84 666.72 621.78 667.97 617.83 668 614 669.86 612.49 671.72 608.4 695.06 608 694.62 612.31 696 620.77 695.26 623.56 695.91 633.83 694.96 641.81 695.72 644.74 696.32 668.2 696.95 681.71 697.52 704.25 645.6 706 650.48 697.94 650.89 694.91 652.39 691.88 654.92 690.13 655.71 687.65 661.14 685.16 663.24 682.43 662.7 680.64 664.46 676.69 666.43 676.31 668.38 673.45 673.98 669.93 676.85 665.89 677.22 664.03 681.05 662.91 683.37 658.16 681.08 655.31 681.5 651.27 682.87 649.58 683 646.09 680.97 643.29 677.36 642.87 674.18 641.48 674.2 637.98 673.19 633.98 670.99 631.5 671.48 628.85 663.67 628.89 Z",
  "St. Charles":
    "M 566.38 268.34 566.44 264.92 569.41 265.99 577.56 265.55 583.17 267.27 584.67 261.87 587.76 260.07 590.64 260.28 591.69 258.93 594.21 261.89 598.06 258.08 601.42 258.01 601.44 259.06 606.14 264.88 611.18 267.77 615.86 266.76 620.14 262.43 622.5 258.83 624.16 253.77 626.67 252.35 631.99 253.03 634.79 254.05 643.69 258.62 650.77 259.18 654.06 260.93 657.17 263.87 660.94 265.5 667.39 269.46 667.94 271.26 667.04 276.13 665.89 273.78 662.08 272.74 659.18 274.45 657.66 274 650.32 269.47 645.1 264.15 642.53 263.69 640.63 265.05 639.25 271.33 637.74 273.48 635.36 274.44 629.21 273.41 627.33 274.93 624.6 279.41 623.56 283.64 622.04 286 618.06 288.45 618.07 293.67 617.04 295.5 609.32 296.39 606.91 295.18 602.53 295.53 600.87 296.53 600.35 299.08 598.13 299.92 596.6 302.34 594.07 303.22 591.91 305.43 589.26 310.14 584.56 311.61 580.21 315.25 572.28 319.59 568.53 319.01 566.5 317.73 566.2 285.24 566.38 268.34 Z",
  Camden:
    "M 312.79 362.49 315.33 361.18 320.47 365.84 321.43 368.71 319.4 372.37 321.33 374.31 324.55 372.54 326.86 367.87 330.3 369.13 329.97 370.52 326.55 372.62 350.46 373.88 351.5 370.39 354.46 369.01 358.74 368.95 361.19 370.36 365.46 370.34 365.3 376.66 369.72 376.8 369.64 381.51 371.72 388.2 373.93 388.23 373.86 392.7 376.02 394.92 378.29 394.97 380.46 397.24 380.41 399.47 393.66 399.64 393.33 424.38 388.46 428.02 388.04 429.74 382.16 429.18 380.7 431.75 378.5 431.71 376.39 433.33 374.43 432.35 373.67 429.8 370.22 427.25 368.46 423.71 367.8 419.28 339.34 418.72 313.08 417.53 314.1 393.13 314.96 374.32 312.17 374.18 312.79 362.49 Z",
  Shelby:
    "M 407.28 104.67 420.27 104.33 436.68 104.85 446.68 104.97 459.89 105.07 459.46 149.32 437.2 149.17 419.53 148.86 419.36 157.85 406.05 157.7 406.8 129.15 407.28 104.67 Z",
  Jackson:
    "M 131.59 229.94 132.96 230.5 138.52 227.43 140.81 225.01 143.73 224.49 146.3 225.37 148.96 229.27 151.48 227.74 156.15 222.64 155.44 218.45 157.74 218.28 159 221.85 160.76 222.91 163.89 220.36 165.77 217.66 166.83 214.23 169.74 211.86 173.83 212.08 178.84 216.63 183.5 215.68 183.86 217.12 181.79 220.23 188.55 222.64 191.47 226.57 189.74 261.1 188.93 273.94 168.8 273.27 142.37 271.62 130.57 270.6 131.59 229.94 Z",
  Schuyler:
    "M 357.35 7.36 399.71 6.2 399.68 24.56 399.88 44.5 360.81 44.96 360.61 37.2 362.38 34.8 359.74 32.83 358.48 24.98 361.63 21.72 360.52 17.38 358.47 16.04 361.01 11.85 357.78 12.31 358.78 8.67 357.35 7.36 Z",
  Cass: "M 130.57 270.6 142.37 271.62 168.8 273.27 188.93 273.94 187.22 301 188.77 301.08 188.15 314.33 194.78 314.65 194.1 330.12 194.3 333.01 191.73 331.65 186.26 331.84 181.28 333.03 174.94 331.11 166.49 330.7 164.77 328.76 128.69 327.04 129.31 305.22 130.57 270.6 Z",
  DeKalb:
    "M 135.14 88.53 167.48 89.24 180.52 90.17 182.32 90.26 181.32 127.77 181.18 134.35 167.9 133.84 134.45 133.15 134.65 122.04 135.14 88.53 Z",
  Butler:
    "M 605.61 564.65 645.56 563.88 657.12 564.23 658.42 567.93 657.95 572.22 659.98 573.23 662.58 576.2 661.63 577.82 662.69 580.51 664.99 582.05 664.71 586.17 668.31 590.62 670.18 594.33 671.84 604.51 672.85 606.58 671.72 608.4 669.86 612.49 668 614 667.97 617.83 666.72 621.78 664.25 622.84 663.67 628.89 619.47 629.75 619.36 615.49 617.12 615.44 616.95 602.17 612.5 602.23 612.21 582.16 607.9 582.17 607.86 571.28 605.59 571.27 605.61 564.65 Z",
  Perry:
    "M 668.09 454.01 672.37 449.36 679.22 437.24 685.21 426.04 692.44 417.69 696.87 418.38 703.62 412.72 709.39 416.52 709.72 419.59 716.58 421.31 721.2 425.78 725.3 428.23 726.49 430.28 725.69 434.4 727.99 436.47 731.89 435.71 734.48 438.2 736.18 441.15 743.24 443.19 744.97 445.11 744.49 451.9 749.47 458.22 747.66 461.14 744.91 460.56 744.37 463.37 741.73 463.33 740.23 461.88 737.59 462.63 734.29 459.74 731.61 460.37 730.12 459.01 726.8 459 726.09 461.09 721.19 459.01 718.28 458.77 717.29 460.16 713.12 460.58 708.36 459.31 702.96 459.56 668.26 460.76 668.09 454.01 Z",
  Callaway:
    "M 428.73 240.27 444.68 240.52 485.46 240.67 485.03 258.96 484.4 295 479.27 294.51 474.21 294.71 470.95 297.9 464.41 298.46 457.84 301.24 454.96 305.82 448.98 311.51 444.43 312.97 441.21 315.55 434.13 317.64 429.04 317.02 421.98 313.99 418.43 311.19 418 307.67 415.8 304.62 416.27 293.72 419.14 291.94 419.89 288.96 422.81 284.91 422.4 283.32 425.92 278.51 423.78 276.36 424.39 273.69 423.19 270.77 423.68 258.71 425.6 251.33 426.35 246.22 425.7 245.14 426.21 240.24 428.73 240.27 Z",
  Vernon:
    "M 127.09 390.81 172.15 393.15 171.64 396.67 184.9 392.27 190.87 396.29 194.14 395.71 192.89 416.41 191.61 437.83 192.15 438.61 191.27 456.29 165.74 454.73 125.25 452.87 125.65 434.64 126.62 408.47 127.09 390.81 Z",
  Chariton:
    "M 291.85 142.34 307.38 142.28 313.64 142.02 326.76 142.76 340.11 143.19 360 143.54 359.64 156.95 359.11 156.93 357.74 201.03 347.9 197.65 340.85 215.55 339.56 213.97 334.09 216.11 332.5 214.69 333 211.37 329.22 208.8 327.86 206.81 327.79 202.31 325.77 201.85 320.2 202.18 317.71 201.47 314.39 198.72 313.55 193.18 310.69 191.34 309.37 190.45 308.81 186.1 304.78 185.49 303.51 183.25 298.72 184.23 296.03 183.2 297.14 180.99 296.15 177.56 293.84 179.85 290.5 175.81 291.7 173.75 290.41 169.71 292.05 166.97 291.69 162.53 290.42 155.76 292.35 154.69 289.84 150.28 290.46 144.3 291.85 142.34 Z",
  Pettis:
    "M 261.1 317.28 261.47 303.73 263.82 264.93 263.37 260.46 263.5 258.26 285.59 259.5 310.05 260.4 316.67 260.94 315.32 296.84 314.29 321.74 300.86 321.03 287.52 320.72 287.32 325.16 260.82 323.96 261.1 317.28 Z",
  Livingston:
    "M 234 102.58 281.03 101.91 280.31 142.2 291.85 142.34 290.46 144.3 289.84 150.28 292.35 154.69 290.42 155.76 260.14 155.73 245.64 155.87 233.67 155.76 233.97 129.29 234 102.58 Z",
  Audrain:
    "M 404.87 197.04 429.69 198 452.63 198.28 475.09 197.98 475.05 200.22 486.22 200.16 508.31 200.76 512.1 227.63 485.85 227.1 485.46 240.67 444.68 240.52 428.73 240.27 429.33 213.45 404.37 212.52 404.87 197.04 Z",
  Gasconade:
    "M 485.28 358.35 485.18 344.79 485.21 294.93 491.55 298.17 496.63 298.92 501.71 296.1 503.78 293.28 507.08 294.32 511.74 293.73 517.67 295.26 518.08 315.12 518.37 337.87 518.82 351.43 518.8 370.02 498.57 370.07 498.78 378.97 487.18 378.95 485.45 378.94 485.28 358.35 Z",
  Lafayette:
    "M 191.47 226.57 196.48 228.07 201.09 225.05 199.81 221.52 200.63 219.38 206.78 217.36 208.5 220.77 205.98 223 205.28 225.39 208.56 226.85 210.82 224.67 212.09 220.77 216 220.71 218.92 217.77 223.11 216.09 225.68 216.41 229.22 218.39 232.8 217.52 239.75 217.2 241.98 213.95 244.33 213.28 245.71 211.4 253.48 212.69 256.03 215.83 258.29 216.51 263.51 216.23 264.99 214.58 264.06 209.07 264.84 205.99 266.36 204.83 263.5 258.26 263.37 260.46 223.13 258.49 222.88 262.95 189.74 261.1 191.47 226.57 Z",
  Barton:
    "M 125.25 452.87 165.74 454.73 191.27 456.29 190.9 465.16 189.49 500.61 143.93 498.38 124.26 497.06 124.89 473.04 125.25 452.87 Z",
  Macon:
    "M 341.54 91.67 360.52 91.58 381.21 91.79 400.53 91.75 400.6 104.56 407.28 104.67 406.8 129.15 406.05 157.7 405.87 157.7 359.64 156.95 360 143.54 340.11 143.19 340.37 129.71 341.54 91.67 Z",
  Christian:
    "M 246.72 539.78 288.9 540.87 313.2 541.81 333.06 542.44 333 544.67 332.09 584.58 283.61 583.1 278.98 582.99 279.78 556.25 246.39 555.4 246.72 539.78 Z",
  Osage:
    "M 419.09 351.58 419.23 346.19 426.41 344.06 428.6 341.47 427.42 338.66 424.47 336.96 422.1 331.53 424.17 330.3 428.42 332.91 432.53 331.72 437.15 331.51 440.55 329.27 441.3 326.37 439.3 322.7 439.2 318.44 441.21 315.55 444.43 312.97 448.98 311.51 454.96 305.82 457.84 301.24 464.41 298.46 470.95 297.9 474.21 294.71 479.27 294.51 484.4 295 485.21 294.93 485.18 344.79 485.28 358.35 471.73 358.43 469.55 357.94 458.99 357.78 456.48 358.37 442.42 358.69 418.97 358.2 419.09 351.58 Z",
};

const countyOrderFromSVG = [
  "Carroll",
  "New Madrid",
  "Holt",
  "Lincoln",
  "Boone",
  "Jefferson",
  "Stoddard",
  "St. Louis",
  "Saline",
  "Cape Girardeau",
  "Putnam",
  "Dunklin",
  "St. Charles",
  "Camden",
  "Shelby",
  "Jackson",
  "Schuyler",
  "Cass",
  "Ste. Genevieve",
  "Phelps",
  "Laclede",
  "Platte",
  "St. Francois",
  "Audrain",
  "Gasconade",
  "Lafayette",
  "Barton",
  "Macon",
  "Christian",
  "Osage",
  "Pettis",
  "Livingston",
  "Callaway",
  "Vernon",
  "Chariton",
  "Saline",
  "St. Louis City",
  "New Madrid",
  "Cape Girardeau",
  "Dunklin",
  "St. Charles",
  "Jefferson",
  "Stoddard",
  "Ste. Genevieve",
  "Perry",
  "Bollinger",
  "Butler",
  "Ripley",
  "Carter",
  "Wayne",
  "Madison",
  "Iron",
  "Reynolds",
  "Shannon",
  "Oregon",
  "Howell",
  "Ozark",
  "Douglas",
  "Wright",
  "Texas",
  "Dent",
  "Crawford",
  "Washington",
  "Franklin",
  "Maries",
  "Pulaski",
  "Laclede",
  "Webster",
  "Greene",
  "Christian",
  "Taney",
  "Stone",
  "Barry",
  "McDonald",
  "Newton",
  "Jasper",
  "Barton",
  "Vernon",
  "St. Clair",
  "Cedar",
  "Dade",
  "Lawrence",
  "Polk",
  "Dallas",
  "Hickory",
  "Camden",
  "Miller",
  "Cole",
  "Moniteau",
  "Morgan",
  "Benton",
  "Henry",
  "Bates",
  "Cass",
  "Johnson",
  "Pettis",
  "Cooper",
  "Boone",
  "Callaway",
  "Audrain",
  "Montgomery",
  "Warren",
  "Lincoln",
  "Pike",
  "Ralls",
  "Monroe",
  "Shelby",
  "Marion",
  "Lewis",
  "Clark",
  "Scotland",
  "Knox",
  "Adair",
  "Macon",
  "Randolph",
  "Howard",
  "Saline",
  "Lafayette",
  "Jackson",
  "Ray",
  "Carroll",
  "Chariton",
  "Linn",
  "Sullivan",
  "Putnam",
  "Schuyler",
  "Mercer",
  "Grundy",
  "Livingston",
  "Daviess",
  "DeKalb",
  "Clinton",
  "Buchanan",
  "Andrew",
  "Holt",
  "Atchison",
  "Nodaway",
  "Worth",
  "Gentry",
  "Harrison",
];

function MissouriMap({ onSelectCounty, selectedCountyGameId }) {
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
      console.warn(`No entry in COUNTY_DATA for SVG ID: ${svgId}`);
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
      viewBox="0 0 810 717"
      className="interactive-japan-map"
      preserveAspectRatio="xMidYMid meet"
    >
      <g id="missouri-counties-group">
        {countyOrderFromSVG.map((svgId) => renderCountyPath(svgId))}
      </g>
    </svg>
  );
}

export default MissouriMap;

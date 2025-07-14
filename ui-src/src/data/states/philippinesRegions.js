export const philippinesRegions = [
  { id: "PHL_NCR", name: "National Capital Region (NCR)" },
  { id: "PHL_CAR", name: "Cordillera Administrative Region (CAR)" },
  { id: "PHL_R01", name: "Region I (Ilocos Region)" },
  { id: "PHL_R02", name: "Region II (Cagayan Valley)" },
  { id: "PHL_R03", name: "Region III (Central Luzon)" },
  { id: "PHL_R04A", name: "Region IV-A (CALABARZON)" },
  { id: "PHL_R04B", name: "Region IV-B (MIMAROPA)" }, // Officially Southwestern Tagalog Region
  { id: "PHL_R05", name: "Region V (Bicol Region)" },
  { id: "PHL_R06", name: "Region VI (Western Visayas)" },
  { id: "PHL_R07", name: "Region VII (Central Visayas)" },
  { id: "PHL_R08", name: "Region VIII (Eastern Visayas)" },
  { id: "PHL_R09", name: "Region IX (Zamboanga Peninsula)" },
  { id: "PHL_R10", name: "Region X (Northern Mindanao)" },
  { id: "PHL_R11", name: "Region XI (Davao Region)" },
  { id: "PHL_R12", name: "Region XII (SOCCSKSARGEN)" },
  { id: "PHL_R13", name: "Region XIII (Caraga)" },
  {
    id: "PHL_BARMM",
    name: "Bangsamoro Autonomous Region in Muslim Mindanao (BARMM)",
  },
];

export const philippinesProvinces = [
  { id: "PHL_PROV_ABR", name: "Abra", adminRegionId: "PHL_CAR" },
  { id: "PHL_PROV_APA", name: "Apayao", adminRegionId: "PHL_CAR" },
  { id: "PHL_PROV_BEN", name: "Benguet", adminRegionId: "PHL_CAR" },
  { id: "PHL_PROV_IFU", name: "Ifugao", adminRegionId: "PHL_CAR" },
  { id: "PHL_PROV_KAL", name: "Kalinga", adminRegionId: "PHL_CAR" },
  { id: "PHL_PROV_MOU", name: "Mountain Province", adminRegionId: "PHL_CAR" },

  // Region I (Ilocos Region)
  { id: "PHL_PROV_ILN", name: "Ilocos Norte", adminRegionId: "PHL_R01" },
  { id: "PHL_PROV_ILS", name: "Ilocos Sur", adminRegionId: "PHL_R01" },
  { id: "PHL_PROV_LUN", name: "La Union", adminRegionId: "PHL_R01" },
  { id: "PHL_PROV_PAN", name: "Pangasinan", adminRegionId: "PHL_R01" },

  // Region II (Cagayan Valley)
  { id: "PHL_PROV_BTN", name: "Batanes", adminRegionId: "PHL_R02" }, // Note: Batanes, not Bataan for Region II
  { id: "PHL_PROV_CAG", name: "Cagayan", adminRegionId: "PHL_R02" },
  { id: "PHL_PROV_ISA", name: "Isabela", adminRegionId: "PHL_R02" },
  { id: "PHL_PROV_NUV", name: "Nueva Vizcaya", adminRegionId: "PHL_R02" },
  { id: "PHL_PROV_QUI", name: "Quirino", adminRegionId: "PHL_R02" },

  // Region III (Central Luzon)
  { id: "PHL_PROV_AUR", name: "Aurora", adminRegionId: "PHL_R03" },
  { id: "PHL_PROV_BAN", name: "Bataan", adminRegionId: "PHL_R03" },
  { id: "PHL_PROV_BUL", name: "Bulacan", adminRegionId: "PHL_R03" },
  { id: "PHL_PROV_NUE", name: "Nueva Ecija", adminRegionId: "PHL_R03" },
  { id: "PHL_PROV_PAM", name: "Pampanga", adminRegionId: "PHL_R03" },
  { id: "PHL_PROV_TAR", name: "Tarlac", adminRegionId: "PHL_R03" },
  { id: "PHL_PROV_ZMB", name: "Zambales", adminRegionId: "PHL_R03" },

  // Region IV-A (CALABARZON)
  { id: "PHL_PROV_BTG", name: "Batangas", adminRegionId: "PHL_R04A" },
  { id: "PHL_PROV_CAV", name: "Cavite", adminRegionId: "PHL_R04A" },
  { id: "PHL_PROV_LAG", name: "Laguna", adminRegionId: "PHL_R04A" },
  { id: "PHL_PROV_QUE", name: "Quezon", adminRegionId: "PHL_R04A" },
  { id: "PHL_PROV_RIZ", name: "Rizal", adminRegionId: "PHL_R04A" },

  // Region IV-B (MIMAROPA / Southwestern Tagalog Region)
  { id: "PHL_PROV_MAD", name: "Marinduque", adminRegionId: "PHL_R04B" },
  { id: "PHL_PROV_MDC", name: "Occidental Mindoro", adminRegionId: "PHL_R04B" },
  { id: "PHL_PROV_MDR", name: "Oriental Mindoro", adminRegionId: "PHL_R04B" },
  { id: "PHL_PROV_PLW", name: "Palawan", adminRegionId: "PHL_R04B" },
  { id: "PHL_PROV_ROM", name: "Romblon", adminRegionId: "PHL_R04B" },

  // Region V (Bicol Region)
  { id: "PHL_PROV_ALB", name: "Albay", adminRegionId: "PHL_R05" },
  { id: "PHL_PROV_CAN", name: "Camarines Norte", adminRegionId: "PHL_R05" },
  { id: "PHL_PROV_CAS", name: "Camarines Sur", adminRegionId: "PHL_R05" },
  { id: "PHL_PROV_CAT", name: "Catanduanes", adminRegionId: "PHL_R05" },
  { id: "PHL_PROV_MAS", name: "Masbate", adminRegionId: "PHL_R05" },
  { id: "PHL_PROV_SOR", name: "Sorsogon", adminRegionId: "PHL_R05" },

  // Visayas
  // Region VI (Western Visayas)
  { id: "PHL_PROV_AKL", name: "Aklan", adminRegionId: "PHL_R06" },
  { id: "PHL_PROV_ANT", name: "Antique", adminRegionId: "PHL_R06" },
  { id: "PHL_PROV_CAP", name: "Capiz", adminRegionId: "PHL_R06" },
  { id: "PHL_PROV_GUI", name: "Guimaras", adminRegionId: "PHL_R06" },
  { id: "PHL_PROV_ILO", name: "Iloilo", adminRegionId: "PHL_R06" }, // Province of Iloilo
  { id: "PHL_PROV_NEC", name: "Negros Occidental", adminRegionId: "PHL_R06" },

  // Region VII (Central Visayas)
  { id: "PHL_PROV_BOH", name: "Bohol", adminRegionId: "PHL_R07" },
  { id: "PHL_PROV_CEB", name: "Cebu", adminRegionId: "PHL_R07" }, // Province of Cebu
  { id: "PHL_PROV_NER", name: "Negros Oriental", adminRegionId: "PHL_R07" },
  { id: "PHL_PROV_SIQ", name: "Siquijor", adminRegionId: "PHL_R07" },

  // Region VIII (Eastern Visayas)
  { id: "PHL_PROV_BIL", name: "Biliran", adminRegionId: "PHL_R08" },
  { id: "PHL_PROV_EAS", name: "Eastern Samar", adminRegionId: "PHL_R08" },
  { id: "PHL_PROV_LEY", name: "Leyte", adminRegionId: "PHL_R08" }, // Province of Leyte
  { id: "PHL_PROV_NSA", name: "Northern Samar", adminRegionId: "PHL_R08" },
  {
    id: "PHL_PROV_SAM",
    name: "Samar (Western Samar)",
    adminRegionId: "PHL_R08",
  },
  { id: "PHL_PROV_SLE", name: "Southern Leyte", adminRegionId: "PHL_R08" },

  // Mindanao
  // Region IX (Zamboanga Peninsula)
  { id: "PHL_PROV_ZAN", name: "Zamboanga del Norte", adminRegionId: "PHL_R09" },
  { id: "PHL_PROV_ZAS", name: "Zamboanga del Sur", adminRegionId: "PHL_R09" },
  { id: "PHL_PROV_ZSI", name: "Zamboanga Sibugay", adminRegionId: "PHL_R09" },

  // Region X (Northern Mindanao)
  { id: "PHL_PROV_BUK", name: "Bukidnon", adminRegionId: "PHL_R10" },
  { id: "PHL_PROV_CAM", name: "Camiguin", adminRegionId: "PHL_R10" },
  { id: "PHL_PROV_LDN", name: "Lanao del Norte", adminRegionId: "PHL_R10" },
  { id: "PHL_PROV_MSC", name: "Misamis Occidental", adminRegionId: "PHL_R10" },
  { id: "PHL_PROV_MSR", name: "Misamis Oriental", adminRegionId: "PHL_R10" },

  // Region XI (Davao Region)
  { id: "PHL_PROV_DVO", name: "Davao de Oro", adminRegionId: "PHL_R11" }, // Formerly Compostela Valley
  { id: "PHL_PROV_DVN", name: "Davao del Norte", adminRegionId: "PHL_R11" },
  { id: "PHL_PROV_DVS", name: "Davao del Sur", adminRegionId: "PHL_R11" },
  { id: "PHL_PROV_DVO", name: "Davao Occidental", adminRegionId: "PHL_R11" }, // Corrected Davao Occidental (new province) ID PHL_PROV_DVO -> PHL_PROV_DVC
  { id: "PHL_PROV_DVC", name: "Davao Occidental", adminRegionId: "PHL_R11" }, // Using DVC for Davao Occidental
  { id: "PHL_PROV_DVR", name: "Davao Oriental", adminRegionId: "PHL_R11" },

  // Region XII (SOCCSKSARGEN)
  {
    id: "PHL_PROV_COT",
    name: "Cotabato (North Cotabato)",
    adminRegionId: "PHL_R12",
  },
  { id: "PHL_PROV_SAR", name: "Sarangani", adminRegionId: "PHL_R12" },
  { id: "PHL_PROV_SCO", name: "South Cotabato", adminRegionId: "PHL_R12" },
  { id: "PHL_PROV_SKU", name: "Sultan Kudarat", adminRegionId: "PHL_R12" },

  // Region XIII (Caraga)
  { id: "PHL_PROV_AGN", name: "Agusan del Norte", adminRegionId: "PHL_R13" },
  { id: "PHL_PROV_AGS", name: "Agusan del Sur", adminRegionId: "PHL_R13" },
  { id: "PHL_PROV_DIN", name: "Dinagat Islands", adminRegionId: "PHL_R13" },
  { id: "PHL_PROV_SUN", name: "Surigao del Norte", adminRegionId: "PHL_R13" },
  { id: "PHL_PROV_SUS", name: "Surigao del Sur", adminRegionId: "PHL_R13" },

  // BARMM (Bangsamoro Autonomous Region in Muslim Mindanao)
  { id: "PHL_PROV_BAS", name: "Basilan", adminRegionId: "PHL_BARMM" }, // Excluding Isabela City
  { id: "PHL_PROV_LDS", name: "Lanao del Sur", adminRegionId: "PHL_BARMM" },
  {
    id: "PHL_PROV_MAGN",
    name: "Maguindanao del Norte",
    adminRegionId: "PHL_BARMM",
  }, // Maguindanao was split
  {
    id: "PHL_PROV_MAGS",
    name: "Maguindanao del Sur",
    adminRegionId: "PHL_BARMM",
  },
  { id: "PHL_PROV_SLU", name: "Sulu", adminRegionId: "PHL_BARMM" },
  { id: "PHL_PROV_TAW", name: "Tawi-Tawi", adminRegionId: "PHL_BARMM" },
];

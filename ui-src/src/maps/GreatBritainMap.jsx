import { React, useMemo, useState } from "react";
import "./JapanMap.css";
import useGameStore from "../store";
import { parseColor } from "../utils/core";

const REGION_DATA = {
  ABD: {
    gameId: "GB_ABD",
    name: "Aberdeenshire",
    populationWeight: 118,
  },
  ABE: {
    gameId: "GB_ABE",
    name: "Aberdeen",
    populationWeight: 103,
  },
  AGB: {
    gameId: "GB_AGB",
    name: "Argyll and Bute",
    populationWeight: 39,
  },
  AGY: {
    gameId: "GB_AGY",
    name: "Anglesey",
    populationWeight: 31,
  },
  ANS: {
    gameId: "GB_ANS",
    name: "Angus",
    populationWeight: 52,
  },
  ANT: {
    gameId: "GB_ANT",
    name: "Antrim",
    populationWeight: 24,
  },
  ARD: {
    gameId: "GB_ARD",
    name: "Ards",
    populationWeight: 35,
  },
  ARM: {
    gameId: "GB_ARM",
    name: "Armagh",
    populationWeight: 27,
  },
  BAS: {
    gameId: "GB_BAS",
    name: "Bath and North East Somerset",
    populationWeight: 87,
  },
  BBD: {
    gameId: "GB_BBD",
    name: "Blackburn with Darwen",
    populationWeight: 68,
  },
  BDF: {
    gameId: "GB_BDF",
    name: "Bedford",
    populationWeight: 79,
  },
  BDG: {
    gameId: "GB_BDG",
    name: "Barking and Dagenham",
    populationWeight: 98,
  },
  BEN: {
    gameId: "GB_BEN",
    name: "Brent",
    populationWeight: 151,
  },
  BEX: {
    gameId: "GB_BEX",
    name: "Bexley",
    populationWeight: 112,
  },
  BFS: {
    gameId: "GB_BFS",
    name: "Belfast",
    populationWeight: 153,
  },
  BGE: {
    gameId: "GB_BGE",
    name: "Bridgend",
    populationWeight: 65,
  },
  BGW: {
    gameId: "GB_BGW",
    name: "Blaenau Gwent",
    populationWeight: 31,
  },
  BIR: {
    gameId: "GB_BIR",
    name: "Birmingham",
    populationWeight: 519,
  },
  BKM: {
    gameId: "GB_BKM",
    name: "Buckinghamshire",
    populationWeight: 245,
  },
  BLA: {
    gameId: "GB_BLA",
    name: "Ballymena",
    populationWeight: 29,
  },
  BLY: {
    gameId: "GB_BLY",
    name: "Ballymoney",
    populationWeight: 14,
  },
  BMH: {
    gameId: "GB_BMH",
    name: "Bournemouth",
    populationWeight: 89,
  },
  BNB: {
    gameId: "GB_BNB",
    name: "Banbridge",
    populationWeight: 22,
  },
  BNE: {
    gameId: "GB_BNE",
    name: "Barnet",
    populationWeight: 184,
  },
  BNH: {
    gameId: "GB_BNH",
    name: "Brighton and Hove",
    populationWeight: 132,
  },
  BNS: {
    gameId: "GB_BNS",
    name: "Barnsley",
    populationWeight: 111,
  },
  BOL: {
    gameId: "GB_BOL",
    name: "Bolton",
    populationWeight: 131,
  },
  BPL: {
    gameId: "GB_BPL",
    name: "Blackpool",
    populationWeight: 64,
  },
  BRC: {
    gameId: "GB_BRC",
    name: "Bracknell Forest",
    populationWeight: 56,
  },
  BRD: {
    gameId: "GB_BRD",
    name: "Bradford",
    populationWeight: 249,
  },
  BRY: {
    gameId: "GB_BRY",
    name: "Bromley",
    populationWeight: 151,
  },
  BST: {
    gameId: "GB_BST",
    name: "Bristol",
    populationWeight: 211,
  },
  BUR: {
    gameId: "GB_BUR",
    name: "Bury",
    populationWeight: 87,
  },
  CAM: {
    gameId: "GB_CAM",
    name: "Cambridgeshire",
    populationWeight: 300,
  },
  CAY: {
    gameId: "GB_CAY",
    name: "Caerphilly",
    populationWeight: 82,
  },
  CBF: {
    gameId: "GB_CBF",
    name: "Central Bedfordshire",
    populationWeight: 133,
  },
  CGN: {
    gameId: "GB_CGN",
    name: "Ceredigion",
    populationWeight: 33,
  },
  CGV: {
    gameId: "GB_CGV",
    name: "Craigavon",
    populationWeight: 44,
  },
  CHE: {
    gameId: "GB_CHE",
    name: "Cheshire East",
    populationWeight: 176,
  },
  CHW: {
    gameId: "GB_CHW",
    name: "Cheshire West and Chester",
    populationWeight: 156,
  },
  CKF: {
    gameId: "GB_CKF",
    name: "Carrickfergus",
    populationWeight: 19,
  },
  CKT: {
    gameId: "GB_CKT",
    name: "Mid Ulster",
    populationWeight: 67,
  },
  CLD: {
    gameId: "GB_CLD",
    name: "Calderdale",
    populationWeight: 96,
  },
  CLK: {
    gameId: "GB_CLK",
    name: "Clackmannanshire",
    populationWeight: 23,
  },
  CLR: {
    gameId: "GB_CLR",
    name: "Coleraine",
    populationWeight: 26,
  },
  CMA: {
    gameId: "GB_CMA",
    name: "Cumbria",
    populationWeight: 228,
  },
  CMD: {
    gameId: "GB_CMD",
    name: "Camden",
    populationWeight: 120,
  },
  CMN: {
    gameId: "GB_CMN",
    name: "Carmarthenshire",
    populationWeight: 85,
  },
  CON: {
    gameId: "GB_CON",
    name: "Cornwall",
    populationWeight: 259,
  },
  COV: {
    gameId: "GB_COV",
    name: "Coventry",
    populationWeight: 157,
  },
  CRF: {
    gameId: "GB_CRF",
    name: "Cardiff",
    populationWeight: 165,
  },
  CRY: {
    gameId: "GB_CRY",
    name: "Croydon",
    populationWeight: 184,
  },
  CSR: {
    gameId: "GB_CSR",
    name: "Castlereagh",
    populationWeight: 31,
  },
  CWY: {
    gameId: "GB_CWY",
    name: "Conwy",
    populationWeight: 53,
  },
  DAL: {
    gameId: "GB_DAL",
    name: "Darlington",
    populationWeight: 49,
  },
  DBY: {
    gameId: "GB_DBY",
    name: "Derbyshire",
    populationWeight: 367,
  },
  DEN: {
    gameId: "GB_DEN",
    name: "Denbighshire",
    populationWeight: 44,
  },
  DER: {
    gameId: "GB_DER",
    name: "Derby",
    populationWeight: 118,
  },
  DEV: {
    gameId: "GB_DEV",
    name: "Devon",
    populationWeight: 366,
  },
  DGN: {
    gameId: "GB_DGN",
    name: "Dungannon",
    populationWeight: 27,
  },
  DGY: {
    gameId: "GB_DGY",
    name: "Dumfries and Galloway",
    populationWeight: 68,
  },
  DNC: {
    gameId: "GB_DNC",
    name: "Doncaster",
    populationWeight: 143,
  },
  DND: {
    gameId: "GB_DND",
    name: "Dundee",
    populationWeight: 67,
  },
  DOR: {
    gameId: "GB_DOR",
    name: "Dorset",
    populationWeight: 172,
  },
  DOW: {
    gameId: "GB_DOW",
    name: "Down",
    populationWeight: 32,
  },
  DRY: {
    gameId: "GB_DRY",
    name: "Derry",
    populationWeight: 49,
  },
  DUD: {
    gameId: "GB_DUD",
    name: "Dudley",
    populationWeight: 146,
  },
  DUR: {
    gameId: "GB_DUR",
    name: "Durham",
    populationWeight: 240,
  },
  EAL: {
    gameId: "GB_EAL",
    name: "Ealing",
    populationWeight: 168,
  },
  EAY: {
    gameId: "GB_EAY",
    name: "East Ayrshire",
    populationWeight: 55,
  },
  EDH: {
    gameId: "GB_EDH",
    name: "Edinburgh",
    populationWeight: 238,
  },
  EDU: {
    gameId: "GB_EDU",
    name: "East Dunbartonshire",
    populationWeight: 49,
  },
  ELN: {
    gameId: "GB_ELN",
    name: "East Lothian",
    populationWeight: 48,
  },
  ELS: {
    gameId: "GB_ELS",
    name: "Eilean Siar",
    populationWeight: 12,
  },
  ENF: {
    gameId: "GB_ENF",
    name: "Enfield",
    populationWeight: 152,
  },
  ERW: {
    gameId: "GB_ERW",
    name: "East Renfrewshire",
    populationWeight: 43,
  },
  ERY: {
    gameId: "GB_ERY",
    name: "East Riding of Yorkshire",
    populationWeight: 154,
  },
  ESS: {
    gameId: "GB_ESS",
    name: "Essex",
    populationWeight: 673,
  },
  ESX: {
    gameId: "GB_ESX",
    name: "East Sussex",
    populationWeight: 252,
  },
  FAL: {
    gameId: "GB_FAL",
    name: "Falkirk",
    populationWeight: 72,
  },
  FER: {
    gameId: "GB_FER",
    name: "Fermanagh",
    populationWeight: 28,
  },
  FIF: {
    gameId: "GB_FIF",
    name: "Fife",
    populationWeight: 168,
  },
  FLN: {
    gameId: "GB_FLN",
    name: "Flintshire",
    populationWeight: 71,
  },
  GAT: {
    gameId: "GB_GAT",
    name: "Gateshead",
    populationWeight: 91,
  },
  GLG: {
    gameId: "GB_GLG",
    name: "Glasgow",
    populationWeight: 286,
  },
  GLS: {
    gameId: "GB_GLS",
    name: "Gloucestershire",
    populationWeight: 286,
  },
  GRE: {
    gameId: "GB_GRE",
    name: "Greenwich",
    populationWeight: 132,
  },
  GWN: {
    gameId: "GB_GWN",
    name: "Gwynedd",
    populationWeight: 56,
  },
  HAL: {
    gameId: "GB_HAL",
    name: "Halton",
    populationWeight: 59,
  },
  HAM: {
    gameId: "GB_HAM",
    name: "Hampshire",
    populationWeight: 624,
  },
  HAV: {
    gameId: "GB_HAV",
    name: "Havering",
    populationWeight: 118,
  },
  HCK: {
    gameId: "GB_HCK",
    name: "Hackney",
    populationWeight: 127,
  },
  HEF: {
    gameId: "GB_HEF",
    name: "Herefordshire",
    populationWeight: 87,
  },
  HIL: {
    gameId: "GB_HIL",
    name: "Hillingdon",
    populationWeight: 140,
  },
  HLD: {
    gameId: "GB_HLD",
    name: "Highland",
    populationWeight: 106,
  },
  HMF: {
    gameId: "GB_HMF",
    name: "Hammersmith and Fulham",
    populationWeight: 83,
  },
  HNS: {
    gameId: "GB_HNS",
    name: "Hounslow",
    populationWeight: 126,
  },
  HPL: {
    gameId: "GB_HPL",
    name: "Hartlepool",
    populationWeight: 42,
  },
  HRT: {
    gameId: "GB_HRT",
    name: "Hertfordshire",
    populationWeight: 529,
  },
  HRW: {
    gameId: "GB_HRW",
    name: "Harrow",
    populationWeight: 115,
  },
  HRY: {
    gameId: "GB_HRY",
    name: "Haringey",
    populationWeight: 124,
  },
  IOS: {
    gameId: "GB_IOS",
    name: "Isles of Scilly",
    populationWeight: 1,
  },
  IOW: {
    gameId: "GB_IOW",
    name: "Isle of Wight",
    populationWeight: 64,
  },
  ISL: {
    gameId: "GB_ISL",
    name: "Islington",
    populationWeight: 108,
  },
  IVC: {
    gameId: "GB_IVC",
    name: "Inverclyde",
    populationWeight: 35,
  },
  KEC: {
    gameId: "GB_KEC",
    name: "Kensington and Chelsea",
    populationWeight: 71,
  },
  KEN: {
    gameId: "GB_KEN",
    name: "Kent",
    populationWeight: 715,
  },
  KHL: {
    gameId: "GB_KHL",
    name: "Kingston upon Hull",
    populationWeight: 118,
  },
  KIR: {
    gameId: "GB_KIR",
    name: "Kirklees",
    populationWeight: 199,
  },
  KTT: {
    gameId: "GB_KTT",
    name: "Kingston upon Thames",
    populationWeight: 81,
  },
  KWL: {
    gameId: "GB_KWL",
    name: "Knowsley",
    populationWeight: 68,
  },
  LAN: {
    gameId: "GB_LAN",
    name: "Lancashire",
    populationWeight: 554,
  },
  LBH: {
    gameId: "GB_LBH",
    name: "Lambeth",
    populationWeight: 149,
  },
  LCE: {
    gameId: "GB_LCE",
    name: "Leicester",
    populationWeight: 161,
  },
  LDS: {
    gameId: "GB_LDS",
    name: "Leeds",
    populationWeight: 366,
  },
  LEC: {
    gameId: "GB_LEC",
    name: "Leicestershire",
    populationWeight: 321,
  },
  LEW: {
    gameId: "GB_LEW",
    name: "Lewisham",
    populationWeight: 139,
  },
  LIN: {
    gameId: "GB_LIN",
    name: "Lincolnshire",
    populationWeight: 342,
  },
  LIV: {
    gameId: "GB_LIV",
    name: "Liverpool",
    populationWeight: 226,
  },
  LMV: {
    gameId: "GB_LMV",
    name: "Limavady",
    populationWeight: 15,
  },
  LND: {
    gameId: "GB_LND",
    name: "City",
    populationWeight: 4,
  },
  LRN: {
    gameId: "GB_LRN",
    name: "Larne",
    populationWeight: 15,
  },
  LSB: {
    gameId: "GB_LSB",
    name: "Lisburn",
    populationWeight: 52,
  },
  LUT: {
    gameId: "GB_LUT",
    name: "Luton",
    populationWeight: 99,
  },
  MAN: {
    gameId: "GB_MAN",
    name: "Manchester",
    populationWeight: 255,
  },
  MDB: {
    gameId: "GB_MDB",
    name: "Middlesbrough",
    populationWeight: 64,
  },
  MDW: {
    gameId: "GB_MDW",
    name: "Medway",
    populationWeight: 127,
  },
  MFT: {
    gameId: "GB_MFT",
    name: "Magherafelt",
    populationWeight: 21,
  },
  MIK: {
    gameId: "GB_MIK",
    name: "Milton Keynes",
    populationWeight: 126,
  },
  MLN: {
    gameId: "GB_MLN",
    name: "Midlothian",
    populationWeight: 42,
  },
  MON: {
    gameId: "GB_MON",
    name: "Monmouthshire",
    populationWeight: 43,
  },
  MRT: {
    gameId: "GB_MRT",
    name: "Merton",
    populationWeight: 94,
  },
  MRY: {
    gameId: "GB_MRY",
    name: "Moray",
    populationWeight: 43,
  },
  MTY: {
    gameId: "GB_MTY",
    name: "Merthyr Tydfil",
    populationWeight: 27,
  },
  MYL: {
    gameId: "GB_MYL",
    name: "Moyle",
    populationWeight: 8,
  },
  NAY: {
    gameId: "GB_NAY",
    name: "North Ayshire",
    populationWeight: 61,
  },
  NBL: {
    gameId: "GB_NBL",
    name: "Northumberland",
    populationWeight: 145,
  },
  NDN: {
    gameId: "GB_NDN",
    name: "North Down",
    populationWeight: 36,
  },
  NEL: {
    gameId: "GB_NEL",
    name: "North East Lincolnshire",
    populationWeight: 72,
  },
  NET: {
    gameId: "GB_NET",
    name: "Newcastle upon Tyne",
    populationWeight: 137,
  },
  NFK: {
    gameId: "GB_NFK",
    name: "Norfolk",
    populationWeight: 412,
  },
  NGM: {
    gameId: "GB_NGM",
    name: "Nottingham",
    populationWeight: 149,
  },
  NLK: {
    gameId: "GB_NLK",
    name: "North Lanarkshire",
    populationWeight: 154,
  },
  NLN: {
    gameId: "GB_NLN",
    name: "North Lincolnshire",
    populationWeight: 78,
  },
  NSM: {
    gameId: "GB_NSM",
    name: "North Somerset",
    populationWeight: 98,
  },
  NTA: {
    gameId: "GB_NTA",
    name: "Newtownabbey",
    populationWeight: 38,
  },
  NTH: {
    gameId: "GB_NTH",
    name: "Northamptonshire",
    populationWeight: 337,
  },
  NTL: {
    gameId: "GB_NTL",
    name: "Neath Port Talbot",
    populationWeight: 64,
  },
  NTT: {
    gameId: "GB_NTT",
    name: "Nottinghamshire",
    populationWeight: 378,
  },
  NTY: {
    gameId: "GB_NTY",
    name: "North Tyneside",
    populationWeight: 95,
  },
  NWM: {
    gameId: "GB_NWM",
    name: "Newham",
    populationWeight: 161,
  },
  NWP: {
    gameId: "GB_NWP",
    name: "Newport",
    populationWeight: 69,
  },
  NYK: {
    gameId: "GB_NYK",
    name: "North Yorkshire",
    populationWeight: 278,
  },
  NYM: {
    gameId: "GB_NYM",
    name: "Newry and Mourne",
    populationWeight: 46,
  },
  OLD: {
    gameId: "GB_OLD",
    name: "Oldham",
    populationWeight: 108,
  },
  OMH: {
    gameId: "GB_OMH",
    name: "Omagh",
    populationWeight: 23,
  },
  ORK: {
    gameId: "GB_ORK",
    name: "Orkney",
    populationWeight: 10,
  },
  OXF: {
    gameId: "GB_OXF",
    name: "Oxfordshire",
    populationWeight: 314,
  },
  PEM: {
    gameId: "GB_PEM",
    name: "Pembrokeshire",
    populationWeight: 57,
  },
  PKN: {
    gameId: "GB_PKN",
    name: "Perthshire and Kinross",
    populationWeight: 68,
  },
  PLY: {
    gameId: "GB_PLY",
    name: "Plymouth",
    populationWeight: 120,
  },
  POL: {
    gameId: "GB_POL",
    name: "Poole",
    populationWeight: 69,
  },
  POR: {
    gameId: "GB_POR",
    name: "Portsmouth",
    populationWeight: 97,
  },
  POW: {
    gameId: "GB_POW",
    name: "Powys",
    populationWeight: 60,
  },
  PTE: {
    gameId: "GB_PTE",
    name: "Peterborough",
    populationWeight: 93,
  },
  RCC: {
    gameId: "GB_RCC",
    name: "Redcar and Cleveland",
    populationWeight: 62,
  },
  RCH: {
    gameId: "GB_RCH",
    name: "Rochdale",
    populationWeight: 101,
  },
  RCT: {
    gameId: "GB_RCT",
    name: "Rhondda, Cynon, Taff",
    populationWeight: 109,
  },
  RDB: {
    gameId: "GB_RDB",
    name: "Redbridge",
    populationWeight: 140,
  },
  RDG: {
    gameId: "GB_RDG",
    name: "Reading",
    populationWeight: 74,
  },
  RFW: {
    gameId: "GB_RFW",
    name: "Renfrewshire",
    populationWeight: 81,
  },
  RIC: {
    gameId: "GB_RIC",
    name: "Richmond upon Thames",
    populationWeight: 89,
  },
  ROT: {
    gameId: "GB_ROT",
    name: "Rotherham",
    populationWeight: 120,
  },
  RUT: {
    gameId: "GB_RUT",
    name: "Rutland",
    populationWeight: 18,
  },
  SAW: {
    gameId: "GB_SAW",
    name: "Sandwell",
    populationWeight: 149,
  },
  SAY: {
    gameId: "GB_SAY",
    name: "South Ayrshire",
    populationWeight: 51,
  },
  SCB: {
    gameId: "GB_SCB",
    name: "Scottish Borders",
    populationWeight: 52,
  },
  SFK: {
    gameId: "GB_SFK",
    name: "Suffolk",
    populationWeight: 343,
  },
  SFT: {
    gameId: "GB_SFT",
    name: "Sefton",
    populationWeight: 126,
  },
  SGC: {
    gameId: "GB_SGC",
    name: "South Gloucestershire",
    populationWeight: 131,
  },
  SHF: {
    gameId: "GB_SHF",
    name: "Sheffield",
    populationWeight: 265,
  },
  SHN: {
    gameId: "GB_SHN",
    name: "Merseyside",
    populationWeight: 638,
  },
  SHR: {
    gameId: "GB_SHR",
    name: "Shropshire",
    populationWeight: 147,
  },
  SKP: {
    gameId: "GB_SKP",
    name: "Stockport",
    populationWeight: 134,
  },
  SLF: {
    gameId: "GB_SLF",
    name: "Salford",
    populationWeight: 119,
  },
  SLG: {
    gameId: "GB_SLG",
    name: "Slough",
    populationWeight: 69,
  },
  SLK: {
    gameId: "GB_SLK",
    name: "South Lanarkshire",
    populationWeight: 146,
  },
  SND: {
    gameId: "GB_SND",
    name: "Sunderland",
    populationWeight: 126,
  },
  SOL: {
    gameId: "GB_SOL",
    name: "Solihull",
    populationWeight: 99,
  },
  SOM: {
    gameId: "GB_SOM",
    name: "Somerset",
    populationWeight: 256,
  },
  SOS: {
    gameId: "GB_SOS",
    name: "Southend-on-Sea",
    populationWeight: 83,
  },
  SRY: {
    gameId: "GB_SRY",
    name: "Surrey",
    populationWeight: 546,
  },
  STB: {
    gameId: "GB_STB",
    name: "Strabane",
    populationWeight: 18,
  },
  STE: {
    gameId: "GB_STE",
    name: "Stoke-on-Trent",
    populationWeight: 117,
  },
  STG: {
    gameId: "GB_STG",
    name: "Stirling",
    populationWeight: 43,
  },
  STH: {
    gameId: "GB_STH",
    name: "Southampton",
    populationWeight: 115,
  },
  STN: {
    gameId: "GB_STN",
    name: "Sutton",
    populationWeight: 95,
  },
  STS: {
    gameId: "GB_STS",
    name: "Staffordshire",
    populationWeight: 398,
  },
  STT: {
    gameId: "GB_STT",
    name: "Stockton-on-Tees",
    populationWeight: 90,
  },
  STY: {
    gameId: "GB_STY",
    name: "South Tyneside",
    populationWeight: 68,
  },
  SWA: {
    gameId: "GB_SWA",
    name: "Swansea",
    populationWeight: 111,
  },
  SWD: {
    gameId: "GB_SWD",
    name: "Swindon",
    populationWeight: 102,
  },
  SWK: {
    gameId: "GB_SWK",
    name: "Southwark",
    populationWeight: 146,
  },
  TAM: {
    gameId: "GB_TAM",
    name: "Tameside",
    populationWeight: 103,
  },
  TFW: {
    gameId: "GB_TFW",
    name: "Telford and Wrekin",
    populationWeight: 82,
  },
  THR: {
    gameId: "GB_THR",
    name: "Thurrock",
    populationWeight: 80,
  },
  TOB: {
    gameId: "GB_TOB",
    name: "Torbay",
    populationWeight: 62,
  },
  TOF: {
    gameId: "GB_TOF",
    name: "Torfaen",
    populationWeight: 42,
  },
  TRF: {
    gameId: "GB_TRF",
    name: "Trafford",
    populationWeight: 107,
  },
  TWH: {
    gameId: "GB_TWH",
    name: "Tower Hamlets",
    populationWeight: 143,
  },
  VGL: {
    gameId: "GB_VGL",
    name: "Vale of Glamorgan",
    populationWeight: 60,
  },
  WAR: {
    gameId: "GB_WAR",
    name: "Warwickshire",
    populationWeight: 266,
  },
  WBK: {
    gameId: "GB_WBK",
    name: "West Berkshire",
    populationWeight: 72,
  },
  WDU: {
    gameId: "GB_WDU",
    name: "West Dunbartonshire",
    populationWeight: 40,
  },
  WFT: {
    gameId: "GB_WFT",
    name: "Waltham Forest",
    populationWeight: 128,
  },
  WGN: {
    gameId: "GB_WGN",
    name: "Wigan",
    populationWeight: 150,
  },
  WIL: {
    gameId: "GB_WIL",
    name: "Wiltshire",
    populationWeight: 228,
  },
  WKF: {
    gameId: "GB_WKF",
    name: "Wakefield",
    populationWeight: 159,
  },
  WLL: {
    gameId: "GB_WLL",
    name: "Walsall",
    populationWeight: 131,
  },
  WLN: {
    gameId: "GB_WLN",
    name: "West Lothian",
    populationWeight: 83,
  },
  WLV: {
    gameId: "GB_WLV",
    name: "Wolverhampton",
    populationWeight: 119,
  },
  WND: {
    gameId: "GB_WND",
    name: "Wandsworth",
    populationWeight: 151,
  },
  WNM: {
    gameId: "GB_WNM",
    name: "Royal Borough of Windsor and Maidenhead",
    populationWeight: 69,
  },
  WOK: {
    gameId: "GB_WOK",
    name: "Wokingham",
    populationWeight: 78,
  },
  WOR: {
    gameId: "GB_WOR",
    name: "Worcestershire",
    populationWeight: 274,
  },
  WRL: {
    gameId: "GB_WRL",
    name: "Halton",
    populationWeight: 59,
  },
  WRT: {
    gameId: "GB_WRT",
    name: "Warrington",
    populationWeight: 96,
  },
  WRX: {
    gameId: "GB_WRX",
    name: "Wrexham",
    populationWeight: 61,
  },
  WSM: {
    gameId: "GB_WSM",
    name: "Westminster",
    populationWeight: 115,
  },
  WSX: {
    gameId: "GB_WSX",
    name: "West Sussex",
    populationWeight: 390,
  },
  YOR: {
    gameId: "GB_YOR",
    name: "York",
    populationWeight: 96,
  },
  ZET: {
    gameId: "GB_ZET",
    name: "Shetland Islands",
    populationWeight: 10,
  },
};

function GreatBritainMap({
  onSelectRegion,
  selectedRegionGameId,
  heatmapData,
  viewType,
}) {
  const [hoveredRegionId, setHoveredRegionId] = useState(null);
  const currentTheme = useGameStore(
    (state) => state.availableThemes[state.activeThemeName]
  );

  // --- FIX: Access the dedicated mapStyles object from the theme ---
  const mapTheme = currentTheme.colors || {};

  // --- FIX: Define map colors based on the mapStyles variables ---
  const landColor = mapTheme["--map-region-default-fill"] || "#cccccc";
  const borderColor = mapTheme["--map-region-border"] || "#ffffff";
  const hoverColor = mapTheme["--map-region-hover-fill"] || "#FFD700";
  const selectedColor = mapTheme["--accent-color"] || "yellow";

  // The heat map will now gradient from the land color to the hover color
  const actionColor = mapTheme["--button-action-bg"] || "#e74c3c";
  const heatMapStartColor = parseColor(landColor);
  const heatMapEndColor = parseColor(actionColor);

  const handleRegionClick = (svgId) => {
    if (onSelectRegion) {
      const region = REGION_DATA[svgId];
      if (region) {
        onSelectRegion(region.gameId, region.name);
      }
    }
  };

  const { min, max } = useMemo(() => {
    if (!heatmapData || viewType === "party_popularity")
      return { min: 0, max: 1 };
    const values = heatmapData
      .map((d) => d.value)
      .filter((v) => typeof v === "number");
    if (values.length === 0) return { min: 0, max: 1 };
    return { min: Math.min(...values), max: Math.max(...values) };
  }, [heatmapData, viewType]);

  const getRegionStyle = (svgId) => {
    const regionInfo = REGION_DATA[svgId];
    if (!regionInfo) return {};

    const style = {
      stroke: borderColor, // Use theme border color
      strokeWidth: "1px",
      fill: landColor, // Use theme land color as the default
      cursor: onSelectRegion ? "pointer" : "default",
      transition: "fill 0.2s ease-in-out, stroke 0.2s ease-in-out",
    };

    const isSelected =
      onSelectRegion && selectedRegionGameId === regionInfo.gameId;

    if (hoveredRegionId === regionInfo.gameId) {
      style.fill = hoverColor; // Use theme hover color
    } else if (isSelected) {
      style.fill = selectedColor;
    } else {
      const data = heatmapData?.find((d) => d.id === regionInfo.gameId);
      if (data) {
        if (viewType === "party_popularity") {
          style.fill = data.color || landColor;
        } else if (typeof data.value === "number") {
          const ratio = max > min ? (data.value - min) / (max - min) : 0;
          const r = Math.round(
            heatMapStartColor.r +
              (heatMapEndColor.r - heatMapStartColor.r) * ratio
          );
          const g = Math.round(
            heatMapStartColor.g +
              (heatMapEndColor.g - heatMapStartColor.g) * ratio
          );
          const b = Math.round(
            heatMapStartColor.b +
              (heatMapEndColor.b - heatMapStartColor.b) * ratio
          );
          style.fill = `rgb(${r}, ${g}, ${b})`;
        }
      }
    }

    if (onSelectRegion && selectedRegionGameId === regionInfo.gameId) {
      style.stroke = selectedColor; // Use theme selection color
      style.strokeWidth = "3px";
    }

    return style;
  };

  const regionPathData = {
    DRY: "M431.8 567.2l0.3-0.5 0.1-0.7-0.3-2.1 0.2-0.6 0.3-0.1 0.1-0.1-0.2-0.7 1.3-2.1 0.5-0.5 0.6-0.5 2.9-0.4 0.4-0.5 0.4-0.5 0.4-0.6 0.9-0.3-0.4 1.5 0.7 0.1 2.1-0.7 0.9 0.1 1.3 0.7-0.1 0.1-1.1 1.3 1 1.1 1 2.8 0.8-0.3 1.3 0.3-0.5 1.6 0.2 1.9 0.5 1.3 1.4 1.1 0.4 1.9 0.5 0.6-0.3 1 0 2.4 1.4 1.9-1.7 0.1-1.1 0.7-1.8-0.7-0.3-0.8-2.2-2.2-1.6 0.5-0.5-0.2 0.5-0.7-0.6-0.7 0-1.5-3.2-0.3-0.1-0.6 0.9-1.3-0.1-0.3-2.6-0.7-1.3 0.6-1.3-0.2-0.9-1.6-1-0.5-0.1-0.1z",
    STB: "M418.1 594.8l-0.1-1.6-0.5-0.1-0.7 0.5-0.8 0.4-0.7-0.3-1.5-1.3-0.7-0.4-0.3 0.1-0.8 0.6-0.4-0.1-0.3-0.4-0.5-1-0.4-0.2-0.8-0.3-0.8-0.5-0.4-0.8 0.4-1.2-0.3-0.2-0.8-0.6 2.4-1.2 1.6-1.6 0.6 0 1.3 1.2 1.6 0.8 1.6-0.1 1.6-0.9 1.6-1.7 0.9-0.5 1.6 0.5 1.4-0.4 0.8 0.4 0.5 0.1 0.6-0.3 0-0.2-0.2-0.2-0.2-0.7 0.1-2 0.3-1.1 3.4-4.2 0.8-1.5 0.5-1.7 0-0.9-0.2-2 0.1-1 0.4-0.5 0.9-0.4 0.1-0.1 0.1 0.1 1 0.5 0.9 1.6 1.3 0.2 1.3-0.6 2.6 0.7 0.1 0.3-0.9 1.3 0.1 0.6 3.2 0.3 0 1.5 0.6 0.7-0.5 0.7 0.5 0.2 1.6-0.5 2.2 2.2 0.3 0.8 1.8 0.7 1.1-0.7 1.7-0.1 0.9-0.8 1.2 0.2 1.1-0.4 1.2 1-0.1 1.1 0.9 1 0.1 0.6-0.2 0.6-1.3 0.6-1.2 0-0.9-0.6-1.2-0.2-1.1 0.7-2.8 0.7-1.3 0.9-4.4-0.3-1.7 0.7-1.3 1.2-0.6-0.4-1.2 0.2-1.1 1.8-2.8 1.4-1.1 2-1.2 1-0.1 1-1.1 0.1-0.8-0.7-1.3 0.2-1.6 0.9-0.1-0.5-0.6 0.1-2.5 1.4-1.9-0.1-1.9 2-0.7-0.3z",
    FER: "M418.1 594.8l0.7 0.3 1.1 1.8 1.5-0.1 1.9 1.5 2.3-0.3 0.7 1 0 0.5-1.3 0.3-0.8 3 0.4 0.8-0.3 1 0.8 2.2 0 2.2 0.5 0.1 0.6 1 1.3 0.8 2-1.4 1.2-0.2 0.9-0.9 2.6 0.5 0.3 1 1.3 1.2-0.4 1.5 0.3 1 0.8 0.5 1.3-0.2 0.5 0.4 1.1 2.8 1 0.5 2-1.2 0 0.1-0.1 0.1-0.1 0.3 0.1 0.5 0.2 0.4 0.1 0.2-0.3 0.8-0.1-0.1-0.2 0.4-0.4-0.1-0.2 0 0.1 0.9 1.6 0.8-0.3 1.1 1.7 1.4-0.7 0.9 0.3 1.3-1 0.7-2.6 0.7-0.5 0.4-0.4 0.4-0.3 0.5-0.2 0.8 0.2 0.3 0.4 0.4 0.1 0.4-0.9 0.5 0.2 0.8-0.2 0.8-0.3 0.7-0.4 0.5-0.7 0.3-0.1-0.3 0-0.7 0-0.9 0.1-0.8 0.1-0.5-0.2-0.2-1.4 0.8-0.3 0.4 0 0.6 1 2.2-0.2 0-0.5 0.1-2.3-0.8-0.7 0.2-0.2-0.1-0.1-0.3-0.3-0.7-0.4-0.1-0.5 0-0.2-0.1 0.6-0.7-1.2-0.1-1.9 1.6-1 0.2-5-1.2-0.6-0.4-0.1-0.7-0.1-0.7-0.4-0.5-3.3-2.6-0.9-0.1-2.8 0.2-2.5-0.4-0.9-0.5-0.7-1.3-0.1-3.5-0.3-1.3-0.7-0.5-1.9-0.3-0.3-0.2-0.5-0.1-0.8-0.9-0.6-1.2-1-2.5-1.3 0-1.2-0.6-1.1-1.2-2-2.8-1.1-1.3-0.5-0.6-0.1-0.7-0.1-0.6-0.6-0.6 0.2-0.1 0.9-0.5 2.5-0.7 1.1-0.7 0.6-0.5 0.2-0.3 0.6-1.2 1-1.4 0.9-1.1 3.6 0.8 1.8 0.1 1.8-0.7 4.7-4.5 1.9-0.7z",
    DGN: "M442.4 616.5l0-0.1-2 1.2-1-0.5-1.1-2.8-0.5-0.4-1.3 0.2-0.8-0.5-0.3-1 0.4-1.5-1.3-1.2-0.3-1 0.9-0.6 1.6 0.1 2.2-1 0.8 0.3 0.8-0.3 0.6-0.9 2.2-0.9 1 0.1 0.4-0.4 0.7 0.5 0.6-0.2 0.4-0.4 0.6-1.4 2.5-0.8 0.3-0.2 0.2-1.1 1.2-0.2 1.4-1.3 0.2-0.8-0.4-0.8 0.7-1.5 3.1 1 1.2-0.5 0.7 0.2 1.4-0.7 1.2 0.7 1.5 0.3 1.3-0.7 1.1 1.7 0.5 0.3 0.9-1 1.8 0.3 0.5-0.8 2.3 0.9-0.1 0 0.9 0.4 1.8 0.9 0.2-0.1-0.7 0.9-1.4 1.3-0.5 0.4 0.8 1.2 0.1 1.1 0.4 1.3-0.5 0.4-1.2 0-1 0.7-2.1-1.1-0.8 1-1.1 0.5-0.1 0.6 0.2 0.5-0.4 0.6-0.3 1.4-0.3 0.2-3.7-0.7-0.6 0.9 0.3 1.1-0.1 0.6-1.3 1.7 0.1 1.4-0.6 0.7-0.9 0.3-0.2 0.1-0.1 0.2-0.5-1.3-0.3-0.3-0.5-0.1-0.4-0.2-0.4-1.3-0.4-0.6-2.9-2.4-1.6-0.8-1.4 0.1-1.4 1.3-2.3 3.7-1.5 1.1-0.4 0-0.8-0.1-0.2 0.1z",
    ARM: "M467.8 629.5l-0.7-0.8-1-0.9-0.5-0.3-0.6 0-0.5 0.3-0.3 0.5-0.4 0.4-0.6-0.1-1-0.6-1-0.9-0.9-1-0.8-1.3-0.2-0.8-0.2-0.8-0.2-0.7-0.4-0.5-1.7-0.8 0.8-0.5 0.4-0.8-0.1-1.1-0.5-1.5 0.1-0.2 0.2-0.1 0.9-0.3 0.6-0.7-0.1-1.4 1.3-1.7 0.1-0.6-0.3-1.1 0.6-0.9 3.7 0.7 0.3-0.2 0.3-1.4 0.4-0.6-0.2-0.5 0.1-0.6 1.1-0.5 0.8-1 2.1 1.1 1-0.7 1.2 0 0.5-0.4 2.1 3.6 1.2 0.2 0 1.7 1.1 1.4 1.3 0.1 1.3-1.4 0.1 1.2 0.7 1 0.1 1 0.6 1.1-0.2 3.8 0.9 1.3-0.7 0.8-1.2-0.7-0.8 0.5-1.3 0.1-0.9 1-1 0.2-0.4 1.5-0.5 0.1-0.4 0.6-1.2-0.7-1.3 0.6-0.5 0.8-1.3-0.1-1.6 1.6-0.4 0.9 0.2 0.8-0.2 0.3z",
    NYM: "M467.8 629.5l0.2-0.3-0.2-0.8 0.4-0.9 1.6-1.6 1.3 0.1 0.5-0.8 1.3-0.6 1.2 0.7 0.4-0.6 0.5-0.1 0.4-1.5 1-0.2 0.9-1 1.3-0.1 0.8-0.5 1.2 0.7 0.7-0.8 0.7 0.9 1-0.1 0.9 0.4 1-0.3 4.2 1.6 1.1-0.4 0.7 0.5 1.8 0.2 2-0.8 1.3 0.4-1.5 1.1 0.7 0.2 0.3 2.3 1.1 2.5 0.3 0.1 1-1.3 1 0 0.8-0.6 1.9 1.2 1.6-0.5 0.8 0 0.4 0 0 0.3-0.1 1.6-0.3 1.6-0.4 1.6-0.5 1.3-0.8 1.1-2 1-1.5 1.5-1.9 1.5-0.7 0.3-1.8 0.2-0.7-0.1-0.9-0.7 0-0.4 1-0.5 0.4-0.1-3.6-1.3-0.6-0.1-0.6-1.4-1.2-0.5-1.4-0.1-1-0.4-0.3 0.5-0.7-0.5-0.7 0-0.7 0.4-0.6 0.1-0.5-0.4-0.4-0.5-0.4-0.1-0.6 1.1-0.1 0.5 0.1 0.6 0 0.7-0.2 0.6-0.3 0.3-1.1 0.2-1.2 0.4-0.3 0-0.3-0.2-0.3-0.3-0.2-0.4 0-0.1-1.3 0-4 1.5-0.4 0-0.7-0.3-0.3 0.1-0.3 0.2-0.2 0.4-0.3 0.4-0.2 0.2-0.7-0.4-1.3-1.5-0.7-0.6 0.7-1.9 0.1-0.9-0.5-0.9 1.1-1.4 0.4-1.4-0.3-1.5-0.3-0.4z",
    FLN: "M634.7 701.9l0.8 0.4 1.8 0.4 0.4 0.1 3 2.5 1.6 1.7 0.2 0.3 0.2 0.5 0.1 0.7 0 0.3-0.2 0.3-1.7 1.1-0.2 0.2 0 0.2 0 0.2-1.7 0.5-2.8 2.5-2.4 2-0.9 1.1-1-1.7-1.1-2.2-0.7-1.7-0.4-0.7-1-0.3-0.9 0-0.9 0-0.9-0.4-1.3-1.5-1.3-2.3-0.7-1.1-0.3-0.9 0-1.2 0.3-1.2 0-0.9-0.4-0.9-1.2-0.5-0.3-0.5 0.3-2.8 0.5-0.9-0.1 0 0.2-0.5 0.1 0 1.4-0.1 1.8 0.9 1 0.8 0.4 0.8 0.5 0.6 6 3.9 0.7 0.8 0.6 1 0.4 0.4 0.1-0.3 0-1.6z",
    CHW: "M640.7 710.8l0-0.2 0-0.2 0.2-0.2 1.7-1.1 0.2-0.3 0-0.3-0.1-0.7-0.2-0.5-0.2-0.3-1.6-1.7-3-2.5-0.4-0.1-1.8-0.4-0.8-0.4 0-1.3-0.5-0.9 1.3-1.5 2 1 2.4-0.3 1.3 0.6 0.5-0.3 0.3-0.7 0.1-0.2 0.8 0.7 1.3 0.6 1.5-0.1 0-0.1 0.1-0.4 0.1-0.3 0.4-0.2 0.4 0 0.7 0.3 0.3 0.1 0.8 0 0.7-0.2 1.9 0.6 1.8-0.4 3.2 0.2 2.7-1.4 0.7 0 1.1-0.6 1.1-0.8 1.5 3.7 2.6 2 0.5 2-1.1 2-0.8 2-1.7-0.5-0.3 1.4 0.2 1.7-2.8 1.6-3 1.5-1.9 1.3-0.7 3.3 1.1 0.9 1.2 0.7 0 1.3-0.2 2-4.9 1.5-1.9-1.2-1.8-0.2-0.3-0.2-0.2-0.2-0.4-0.8-1.1-1.3-0.3-0.5-0.1-0.4 0.1-0.3-0.1-0.3-0.3-1.3-0.3-1.1-1.2-2.8-0.3-0.3-2.3-2.5-0.2-0.4 0-0.1z",
    WRX: "M632.9 716.9l0.9-1.1 2.4-2 2.8-2.5 1.7-0.5 0 0.1 0.2 0.4 2.3 2.5 0.3 0.3 1.2 2.8 0.3 1.1 0.3 1.3 0.1 0.3-0.1 0.3 0.1 0.4 0.3 0.5 1.1 1.3 0.4 0.8 0.2 0.2 0.3 0.2 1.8 0.2 1.9 1.2 0.1 0.6 0.3 0.8 0.1 0.2 0.1 0.3-0.1 1.3 0 0.3-0.2 0.3-0.3 0.1-0.6 0.2-0.5 0.2-0.9 0.7-0.4 0.1-0.5-0.1-0.2-0.1-2.5-2.6-0.3-0.2-0.5-0.1-0.6 0-1.9 0.5-0.4 0.1-0.3-0.1-0.2-0.1-0.2-0.2-0.8-0.9-0.2-0.2-0.6-0.1-0.8 0.1-0.5 0.2-2.4 1.8-0.2 0.1-0.2 0.1-0.2 0.1-0.6 0.4-0.3 0.3-0.2 0.5-0.4 0.8-0.3 0.3-0.3 0.2-0.5 0.2-0.2 0.3-0.1 0.3 0.1 0.7 0.1 0.3 0.2 0.4 0 0.3 0 0.3-0.3 0.4-0.6 0.6-0.2 0.2-0.3 0.5-0.1 0.2 0 0.5 0 0.4 0.6 1.7-2.4 0.3-2.4 1.1-0.9-0.2-0.3-0.3 0.1-1-1.1-1.7-0.5-0.5-3.4-1.8-0.2-0.5 0.1-0.9-0.2-0.2-0.5 0.2 0.8-1.7 1.4-1.9 1.5-1.5 1.3-0.1 2.2-0.1 1.7-0.2 2.4-1 2.5-1-0.7-1-0.9-0.7-0.6-0.9 0-1.9 0.5-2.9 0.4-0.6z",
    SHR: "M651.4 724.7l4.9-1.5 1.6 0.7 0.5 1.8 1-0.2 1.4 0.7 0.7-1.1 1.6 0.6 1.4-0.2 0.8-0.7 0.4-1 2.1-0.9 0.3 0.1 0.3 0.6 0.1 1-0.3 0.9-0.3 0.5-0.9 0-1.1 1.1-1.1 1.8-0.4 1.2 0.1 0.9 0.7 1.4 2.5-1.3 0.7 0-0.6 3.6-1.1 1.1 0.2 0.2-1 0.3-2.6 1.5-2.9 1-2.5 1.3-2.7 0.7-0.8 1.3 1.1 1.6 3 2.7 3.2 3.2 2.2 2.2 1.1 0.8 0.6 0 0.5-1.1 0.8-1.6 0.8-1.9 1.9-4.9 0.7-1.4 0.9 1.1 0.1 0.9-0.3 1.6 0.2 1.1 0.6 0.5 2.3 0.3 0.6 0.6 0.1 0.8-0.1 0.6 0.2 1.1-0.5 1.8-1.4 0.7-1.7-0.4-0.4 0.8 0.1 0.6 1.9 1 0.8 1.2-0.7 1.1 0.7 1.1-0.1 1.2-1.4 1-0.7 1.6 0 0.7 0.7 1.6-0.1 0.8-0.9 1-1.6-0.3-0.5 0.9 1.1 2.6 0.3 0.4-3.3 0.1-0.3 0.3-0.1 0.7-0.5 0.5-2.8 0.5-0.2 0.5 0.3 1-0.3 0.8-0.9 0-1.5-1-1 0.7-0.4 1.7-2 0.3-0.5-0.3-0.1-0.8-0.3-0.4-1.1-0.6-0.6-0.3-0.6 0.5-0.4 1.8-1 0.2-2.3-1.6 0.8-1.3-0.2-0.8-2.3-0.1-0.3-1-0.7-1.1-1.7-0.8-1.5 1.2-1.5-0.4-0.1 0.5 0.5 0.9-1 0.4-0.8 0.9-1.1 0.3-5.3-0.4-0.4-0.3-1.2-1.4-1.7-1.2-1.2-1.1-1.6-1.1-0.1-0.2-0.2-0.2-0.1-0.2-0.1-0.4-0.1-0.4-0.1-0.6 0-0.3 0-0.3 0.1-0.3 0.5-0.9 0.3-0.4 0.2-0.1 2.2-0.9 1.2-0.8 0.5-0.2 3.6-0.3 0.3-0.2 0.5-1 1.2-1.1 0.3-0.5 0.3-0.3 0-0.3-0.1-0.3-0.1-0.3-1.2-1.4-0.2-0.1-0.3 0.1-0.2 0.1-0.9 0.9-1.3 0.7-0.2 0.2-0.1 0.2-0.3 0.5-0.1 0.2-0.2 0.2-0.3 0.1-0.3 0.1-0.5-0.1-0.2-0.1 0-0.2 0.2-0.5 0.1-0.2 0-0.3-0.1-0.3-0.1-0.2-0.4-0.7-0.1-0.5-0.1-0.4 0-0.4 0.1-0.3 0.1-0.3 0.2-0.1 1.3-0.8 0.4-0.4 0.3-0.4 0.1-0.3 0.1-0.3 0.1-1.1 0.1-0.4 0.1-0.3 0.2-0.2 0.9-0.5 0.2-0.2 0.1-0.4 0.2-0.7-0.1-1 0.1-0.5 0.1-0.3 0.3-0.7 0.2-0.7 0.1-0.3 0.2-0.2 0.2-0.1 0.3 0 0.9-0.1 0.3-0.2 0.3-0.3 0.3-0.6 0-0.2 0-0.2-0.8-0.4-0.3-0.2-0.2-0.3-0.5-0.9-0.3-0.2-1.1-0.4-1.3-0.1-0.3-0.2-0.2-0.3-0.3-0.6-0.2-0.2-0.2 0-1.4-0.2-0.8-0.3-0.5-0.6-0.6-1.7 0-0.4 0-0.5 0.1-0.2 0.3-0.5 0.2-0.2 0.6-0.6 0.3-0.4 0-0.3 0-0.3-0.2-0.4-0.1-0.3-0.1-0.7 0.1-0.3 0.2-0.3 0.5-0.2 0.3-0.2 0.3-0.3 0.4-0.8 0.2-0.5 0.3-0.3 0.6-0.4 0.2-0.1 0.2-0.1 0.2-0.1 2.4-1.8 0.5-0.2 0.8-0.1 0.6 0.1 0.2 0.2 0.8 0.9 0.2 0.2 0.2 0.1 0.3 0.1 0.4-0.1 1.9-0.5 0.6 0 0.5 0.1 0.3 0.2 2.5 2.6 0.2 0.1 0.5 0.1 0.4-0.1 0.9-0.7 0.5-0.2 0.6-0.2 0.3-0.1 0.2-0.3 0-0.3 0.1-1.3-0.1-0.3-0.1-0.2-0.3-0.8-0.1-0.6z",
    POW: "M620.4 732.4l0.5-0.2 0.2 0.2-0.1 0.9 0.2 0.5 3.4 1.8 0.5 0.5 1.1 1.7-0.1 1 0.3 0.3 0.9 0.2 2.4-1.1 2.4-0.3 0.5 0.6 0.8 0.3 1.4 0.2 0.2 0 0.2 0.2 0.3 0.6 0.2 0.3 0.3 0.2 1.3 0.1 1.1 0.4 0.3 0.2 0.5 0.9 0.2 0.3 0.3 0.2 0.8 0.4 0 0.2 0 0.2-0.3 0.6-0.3 0.3-0.3 0.2-0.9 0.1-0.3 0-0.2 0.1-0.2 0.2-0.1 0.3-0.2 0.7-0.3 0.7-0.1 0.3-0.1 0.5 0.1 1-0.2 0.7-0.1 0.4-0.2 0.2-0.9 0.5-0.2 0.2-0.1 0.3-0.1 0.4-0.1 1.1-0.1 0.3-0.1 0.3-0.3 0.4-0.4 0.4-1.3 0.8-0.2 0.1-0.1 0.3-0.1 0.3 0 0.4 0.1 0.4 0.1 0.5 0.4 0.7 0.1 0.2 0.1 0.3 0 0.3-0.1 0.2-0.2 0.5 0 0.2 0.2 0.1 0.5 0.1 0.3-0.1 0.3-0.1 0.2-0.2 0.1-0.2 0.3-0.5 0.1-0.2 0.2-0.2 1.3-0.7 0.9-0.9 0.2-0.1 0.3-0.1 0.2 0.1 1.2 1.4 0.1 0.3 0.1 0.3 0 0.3-0.3 0.3-0.3 0.5-1.2 1.1-0.5 1-0.3 0.2-3.6 0.3-0.5 0.2-1.2 0.8-2.2 0.9-0.2 0.1-0.3 0.4-0.5 0.9-0.1 0.3 0 0.3 0 0.3 0.1 0.6 0.1 0.4 0.1 0.4 0.1 0.2 0.2 0.2 0.1 0.2 1.6 1.1 1.2 1.1 1.7 1.2 1.2 1.4 0.4 0.3 5.3 0.4 0.1 0.7-0.1 0.3-0.3 0.4-1 0.7-0.3 0.3-0.3 0.5-0.1 0.5 0 0.2 0.1 0.8 0.2 0.3 0.2 0.3 1.2 0.3 0.2 0.2 0.1 0.2 0 0.2-0.3 0.3-0.3 0.2-1.6 0-0.4 0.2-0.2 0.2-0.1 0.1-0.4 0.5-0.1 0.2-0.2 0.2-0.6 0.3-0.2 0.2-0.2 0.2-0.1 0.3-0.2 0.9-0.3 0.4-1.9 2.8 0 0.3 0 0.4 0.4 0.5 0.3 0.1 0.3 0 0.2-0.1 0.2 0.1 0.1 0.2-0.1 0.4-0.2 0.3-0.2 0.2-1.2 0.5-0.5 0.2-0.1 0.2 0.1 0.3 0.3 0.5 0.7 0.4 0 0.1 0 0.2-0.2 0.1-0.2 0.3-0.1 0.2-0.2 0.7-0.3 1.3 0 0.2 0.1 0.2 0.3 0.1 0.4 0.4 0.9 0.9 0.1 0.3 0.1 0.4 0 0.6 0 0.4 0 0.6 0.1 0.4 1.4 2.5-0.5 1.2 0.1 1.1-0.2 1.2 1.3 3.9-1.4 1.4-0.1 1.1-1 1.8-1.3 0.3-0.9 0.8-1 0.3-0.2 0.1-2.1 0.1-3.2-0.5-0.8 0.6-0.1 0.6 0.2 0.5-2.1 0.2-0.6 0.1-0.5-1.3-1.3-0.4-0.9-1.3-0.5 0.2-0.2 0.8-0.3 0.1-0.4-0.2-0.8-0.4-0.6 0-0.3 0.4-0.1 1.6-0.3 0.4-2.2 0.7 0.2 0.5-0.1 0.3-1.1-0.3-0.5 0.9-1.2 0.8-0.4-0.8-2.6-1.3-2.2 0.9-1.3-0.4-0.5 0.9-1.4 0.2-1.7-2 1.5-2.5 0.7-2.2 1.5-1.4 0.4-1.3-0.2-1.6 0.3-2.2 0.4-0.3 0.5-0.3 0.2-0.6-0.5-1.8 0.1-1.3 1-1.8 1.4-1.4 0.1-0.8-0.8-1-0.1-1.1-0.3-0.5-2-0.8-0.2-0.3 0.5-1.4-0.1-0.5-1.7-0.5-0.6-0.2 0.4-1.5-0.3-2.6 0.5-1.9 0-2.6 0.4-0.4-0.3-0.4 0.2-0.8 1.4-0.8 0.2-0.4-0.7-1 0-0.9-0.7-1 0-0.6 1.3-1.2 1.9-0.4 0.5-0.6-0.8-1.2-1-0.1-0.2-1.4-1.2-2.9-1.9-1.3 0.2-1.6 0.9-0.7 0.6-2.4-1-0.2-1 1.1-2.1 0.4-1-1.7 0.2-2.2-0.5-1.2-1.3-0.6-2.8 0.2 0.7-1.1 1.7-0.7 1.8-1.7 0.5-2.2-0.3-1 1.7-2.7 1.6 0.4 1.7-0.6 1.3 0.1 1.5-1 3.1-0.5 1.4-2.7-0.4-2.5-0.8-1.7 0.5-2.1 0.4-0.5 2.4-1.1 1.7-0.1 0.6-0.8 0.3-1.4 1.6 0.4 2.2-0.8z",
    HEF: "M640.7 773l1.1-0.3 0.8-0.9 1-0.4-0.5-0.9 0.1-0.5 1.5 0.4 1.5-1.2 1.7 0.8 0.7 1.1 0.3 1 2.3 0.1 0.2 0.8-0.8 1.3 2.3 1.6 1-0.2 0.4-1.8 0.6-0.5 0.6 0.3-0.1 0.7 0.5 2.4 0.8 1.1 0 0.8-0.2 1.1 0.6 0.8 1.2 0 1.4 0 1.1-0.1 0.7-0.6 0.5-0.6 0.6-0.5 0.7 0 1.2 0.5-0.3 0.7-0.3 1 0.2 0.5 0.8 0.5 1.1 0.3 0.5 1.1-0.2 2 0 1.7 0.2 1.1 0.6 0.9 0.8 0.3 0.7 0.4 0.5 1.1 0.1 1 0 1.3-0.1 1.8 0 1.9-0.1 1.1-0.8 0.1-1.1 1.4-0.9 0.4-0.8-0.4-0.6-1.4-0.9-0.5-0.5 1.7 0.2 0.8-0.5 0.9-0.1 1.3 0.9 0.7 0.3 1.4 1 1.1 0.1 0.9-0.1 0.5-1.7 1.1-1.7 0.2-0.6 1.6-1.5-0.2-1.3 0.5-0.3 0.8-0.6-0.2-1 0.7-0.5-1.2-0.3 0-0.3 0.5-0.2 1.9-0.1 0-0.5 0.3-0.8-0.6-0.9-0.8-0.3-0.2-0.4 0-0.8 0-0.3-0.1-0.2-0.1-0.2-0.3-0.2-0.4-0.1-0.2-0.6-0.8-0.1-0.2-0.5-0.6-4.6-4.2-0.5 0.1-0.5 0.2-1.4 1-0.5 0.3-0.3 0-0.5 0-0.4-0.2-1-0.9-0.3-0.3-0.2-0.4 0-0.5-0.1-0.3-0.1-0.2-0.1-0.1-1.4-1.2-1-1.5 0-0.1-1.4-2.5-0.1-0.4 0-0.6 0-0.4 0-0.6-0.1-0.4-0.1-0.3-0.9-0.9-0.4-0.4-0.3-0.1-0.1-0.2 0-0.2 0.3-1.3 0.2-0.7 0.1-0.2 0.2-0.3 0.2-0.1 0-0.2 0-0.1-0.7-0.4-0.3-0.5-0.1-0.3 0.1-0.2 0.5-0.2 1.2-0.5 0.2-0.2 0.2-0.3 0.1-0.4-0.1-0.2-0.2-0.1-0.2 0.1-0.3 0-0.3-0.1-0.4-0.5 0-0.4 0-0.3 1.9-2.8 0.3-0.4 0.2-0.9 0.1-0.3 0.2-0.2 0.2-0.2 0.6-0.3 0.2-0.2 0.1-0.2 0.4-0.5 0.1-0.1 0.2-0.2 0.4-0.2 1.6 0 0.3-0.2 0.3-0.3 0-0.2-0.1-0.2-0.2-0.2-1.2-0.3-0.2-0.3-0.2-0.3-0.1-0.8 0-0.2 0.1-0.5 0.3-0.5 0.3-0.3 1-0.7 0.3-0.4 0.1-0.3-0.1-0.7z",
    MON: "M631.3 813.4l1-0.3 0.9-0.8 1.3-0.3 1-1.8 0.1-1.1 1.4-1.4-1.3-3.9 0.2-1.2-0.1-1.1 0.5-1.2 0 0.1 1 1.5 1.4 1.2 0.1 0.1 0.1 0.2 0.1 0.3 0 0.5 0.2 0.4 0.3 0.3 1 0.9 0.4 0.2 0.5 0 0.3 0 0.5-0.3 1.4-1 0.5-0.2 0.5-0.1 4.6 4.2 0.5 0.6 0.1 0.2 0.6 0.8 0.1 0.2 0.2 0.4 0.2 0.3 0.2 0.1 0.3 0.1 0.8 0 0.4 0 0.3 0.2 0.9 0.8 0.8 0.6 0.5-0.3 0.1 0-0.3 1.1-1 1.6-0.2 0.6-0.1 0.4 0 0.6 0.2 0.5 0.3 0.7 0 0.4-0.2 0.6-0.1 0.3-0.3 0.4-0.1 0.4 0.1 0.3 0.4 1.1 0.4 1.3 0.1 0.4 0.1 0.4 0 0.2-0.2 0.3-0.7 0.3-0.1 0.2 0 0.2 0.2 0.4 0.3 0.5 0 0.7 0.3 1.6-1.3 1.5-0.9 0.8-2.2 0.5-1.8 1.2-1.6-0.7-1-0.9 0.3-0.8 1.4-1.2 0.9-0.8 0.4-0.7-0.5-1-0.7-0.4-0.9 0-2.9 1.8-1.2 0-0.4-0.1-0.7-0.2-0.7 0.2-0.5-1.1-0.2-2 0-2 0-1.1-0.7-1-0.7 0-0.8-0.4-0.5-0.9 0-1.8-0.7-1.5-1.6-0.8-1.1 0-1.1 0-0.6-0.5-0.7-0.8z",
    GLS: "M655.1 812.6l0.1 0 0.2-1.9 0.3-0.5 0.3 0 0.5 1.2 1-0.7 0.6 0.2 0.3-0.8 1.3-0.5 1.5 0.2 0.6-1.6 1.7-0.2 1.7-1.1 0.1-0.5-0.1-0.9-1-1.1-0.3-1.4-0.9-0.7 0.1-1.3 0.5-0.9-0.2-0.8 0.5-1.7 0.9 0.5 0.6 1.4 0.8 0.4 0.9-0.4 1.1-1.4 0.8-0.1 0.5-0.1 1.1 1.7 0.5 1.5 2.6 0.8 0.8-0.1 1.3-2 1.5 0.2 0.7-0.6-0.8-0.9 0.3-2 0.3-0.5 2.3-0.1-1.3 2.7 0.6 0.8 1.1-0.9 1.6 0 2 0.6 2.8-2 1.3-0.3 1.1 0.2 0.7-0.3 1.2 0.2 1.6 1.6 0.6 0 0.3-0.9-0.1-1.2-1-1.4-0.7-0.4 0-0.3 1-0.8 1.3 0.3 1.7-2.3 1-0.5 0.9 1.3 1 0.3 0.4 1.5 1.6 2.6 0.8 0.3 1.7-0.3 0.4 0.3-1.1 2-0.8 0.9 0 0.4-0.2 1.9 1.8 1 0.3 0.5-0.1 0.6-1.5 1.6 0.4 1.2-1 0.9-0.8 2.1-0.2 4.4-1.4 1.6 0.8 1 0.6 2.3 0.2 2.1 1.3 1.3 0.2 0.5-0.3 0.5-1.6-0.4-0.8-0.2-1.1 1.4-1.2 0.3-0.4 0.1-0.9-0.2-0.8-2.6-0.5-0.2-0.3 0.4-0.2 1.7-0.8 1-1.5-1.3-1.1 0.1 0.1 0.8 0.8 1.2-0.2 0.4-1-0.8-2.1-0.9-0.4 0.2 0 1.5-0.9 0.5-0.9-0.9-3.3-1.4-2 3.3-2.3 2.4-2-0.7-2.2 1.4-1.5 0.2-0.7-0.9 0-0.6 0.6-1.2-0.6-0.8-1 0 0.3 1.3-2-0.2-1 1.1-0.6 0-0.3-0.7 0.3-1.1 0.1-1.2-0.2-0.1-3-1-1.6 0.7-0.4-1.5-2.1-1-0.2 0 1.7-1.8 1.6-2.2 0.8-0.5 2-0.7 0.8-0.7 0.4-0.9-0.2-0.8-0.6-0.7-0.2 1.4-0.9 0.8-1.1 0.3-0.9 0.1-0.9 0.4-0.6 0.8-0.6 1-0.7 0.9-2.7 1.9-0.5 0.5-0.4 0.7-3.1 3.7-0.3-1.6 0-0.7-0.3-0.5-0.2-0.4 0-0.2 0.1-0.2 0.7-0.3 0.2-0.3 0-0.2-0.1-0.4-0.1-0.4-0.4-1.3-0.4-1.1-0.1-0.3 0.1-0.4 0.3-0.4 0.1-0.3 0.2-0.6 0-0.4-0.3-0.7-0.2-0.5 0-0.6 0.1-0.4 0.2-0.6 1-1.6 0.3-1.1-0.1 0z",
    SCB: "M684.4 496.2l-2.1 0.8-0.2 0.2-0.3 0.3-0.1 0.6-0.2 1.3-0.1 0.4-0.2 0.4-1.2 1.3-0.2 0.2-0.7 0.3-0.3 0.2-0.5 0.6-0.4 0.3-0.2 0.2-0.2 0.4-0.2 0.6-0.3 0.6-2.5 3.9-0.4 0.4-0.4 0.2-0.7 0.1-1.9 0.1-0.5 0.1-0.3 0.2-0.2 0.2 0 0.5 0 0.3 0.1 0.3 0.1 0.3 0.2 0.2 0.7 0.4 0.2 0.2 0.1 0.3 0 0.3 0.1 0.3 0.2 0.2 0.5 0.6 0.1 0.2 0.1 0.3 0.1 0.3 0.1 0.6 0.8 2.1 0.8 1.4 0.6 1 0.4 1 0.1 0.2 0 0.3 0 0.1 0 0.1 0 0.3 0 0.2 0.1 0.3 1.1 1.6 0.2 0.2 0.1 0.2 0 0.3 0 0.3 0 0.4-0.2 0.4-0.5 0.6-0.6 0.7-1 0.7-0.5 0.2-1.3 0.3-0.7 0.5-0.4 0.6-1.4 0.6-0.3 0.3-0.3 0.6-0.2 0.4-0.2 0.8-0.3 0.4-0.3 0.4-1 0.6-0.4 0.1-0.3-0.1-0.1-0.3-0.5-0.3-0.2-0.1-0.7-0.2-1.2 0.3-0.5 0.2-4.1 3.8-2.6 3.2-0.6 0.5-0.2 0.2-0.1 0.4 0 0.6 0.1 0.3 0.1 0.3 0.1 0.2 0 0.2 0 0.3-0.1 0.6-0.2 0.4-0.3 0.3-0.6 0.2-0.8 0.7-1.1 1.8-0.6 0.9-1 1-1.3 0.9-2 1-0.9 0.2-0.6 0.5-1.3 2 0-0.1-0.5-2-1.1-0.8-0.3-0.7 0.3-3.9 0.9-1.3 0-1-0.2-0.5-1.4-0.1-0.3-0.4 0.3-0.9 1.2-0.7-0.3-0.8-0.5-0.5-1.6-0.2-1-0.6-1.2 0.5-1.2 1.1-0.7-0.8-1.1 0.4-0.5-0.6 0.1-1-0.6-1.2-1.9-1.9 0-1.3-0.3-0.5-1.2-0.4-1.6 0.6-0.9-1.1-1.2-0.8-2.4 1.5-1.2 1.1-0.9-0.1-0.2-0.6 0.2-0.9 0.1-2 0.9-1.4 2-1.4 0-0.6-0.6-0.2-1.7-0.1-1.3-0.7-0.9 1.8-0.4 0.4-3.1 0-1.5 0.6-2.7-0.5-1.6-2.3 1-3.4 0.1-1.1 1.2-1.9-0.1-2.2 0.2-0.9-0.2-0.6-0.6-0.5-0.1-1-1.1-1.8 0.5-0.7 1.8-0.3 0.4-1.1-0.1-0.6-0.5-0.4 0.1-0.9 4-4.9-0.3-0.5-1 0-0.7-0.4 0.1-1.3-1.1-2.3 0-0.7 0.9-0.9 0.2-1.4 0.6-0.8 1.2-0.9 0.4-0.2 0.9 0.2 0.4 0.5 1.1 1.5 1.8 0 0.3 1.1 1 0.6 1.9-0.3 2.1-2.1 0.9 1.8 0.1 1.2 0.9 2.3 0 1.4 1.1 0.8 1.3-0.5 0.1-0.6-0.2-0.9 1-1.3 6.1-5.3 0.4 0.1 0.4 0.7-0.3 1.6 1.2 0.4 1-0.5 1.4-2.1 1.1-0.4 0.6-0.3 1.8-1.4 2.1 0.8 3.8-1.6 0.7 0.4 0 0.8 2.1 0.5 0.8-0.4 0.6-1 0.9 0.2 0.6-1.2 1.6-0.2 0.5 0.6 0.7-0.9 2.2-0.1 0.8-0.9 0.6 0.2 0.1-0.4-0.3-0.8-1.6-0.8 2.7-3.1 0.6-1.1 0.2-0.6 0.5 0.4 2 1.1 7.5 1.5 0.4 0.2 0.3 0.7 0.1 0.8 0.1 0.6 0.3 0.2 1 0.5 1 1 2.6 5.3z",
    NBL: "M653.4 547.1l1.1-1.8 0.8-0.7 0.6-0.2 0.3-0.3 0.2-0.4 0.1-0.6 0-0.3 0-0.2-0.1-0.2-0.1-0.3-0.1-0.3 0-0.6 0.1-0.4 0.2-0.2 0.6-0.5 2.6-3.2 4.1-3.8 0.5-0.2 1.2-0.3 0.7 0.2 0.2 0.1 0.5 0.3 0.1 0.3 0.3 0.1 0.4-0.1 1-0.6 0.3-0.4 0.3-0.4 0.2-0.8 0.2-0.4 0.3-0.6 0.3-0.3 1.4-0.6 0.4-0.6 0.7-0.5 1.3-0.3 0.5-0.2 1-0.7 0.6-0.7 0.5-0.6 0.2-0.4 0-0.4 0-0.3 0-0.3-0.1-0.2-0.2-0.2-1.1-1.6-0.1-0.3 0-0.2 0-0.3 0-0.1 0-0.1 0-0.3-0.1-0.2-0.4-1-0.6-1-0.8-1.4-0.8-2.1-0.1-0.6-0.1-0.3-0.1-0.3-0.1-0.2-0.5-0.6-0.2-0.2-0.1-0.3 0-0.3-0.1-0.3-0.2-0.2-0.7-0.4-0.2-0.2-0.1-0.3-0.1-0.3 0-0.3 0-0.5 0.2-0.2 0.3-0.2 0.5-0.1 1.9-0.1 0.7-0.1 0.4-0.2 0.4-0.4 2.5-3.9 0.3-0.6 0.2-0.6 0.2-0.4 0.2-0.2 0.4-0.3 0.5-0.6 0.3-0.2 0.7-0.3 0.2-0.2 1.2-1.3 0.2-0.4 0.1-0.4 0.2-1.3 0.1-0.6 0.3-0.3 0.2-0.2 2.1-0.8 0.7 1.2 6.1 8 0.7 2 0.5 1 1 0.7 0.3 0.6 0.2 0.6 0.2 0.3 0.4-0.2 0.3-0.4 0.2-0.4 0.2-0.2 0.5 0.1 0.6 0.3 0.6 0.7 0.4 1.2-0.9 0 0 0.5 0.5 0.4 1.7-0.5 1 0.1 3.2 2.3 0 0.6-0.3 0.5 0.1 0.7 0.3 0.6 0.5 0.5-0.6 0.5 0 0.6 0.4 0.3 0.9 0.8 0 0.6-0.4 0.7 0.2 0.4 0.5 0.3 0.3 0.3 0.2 1 0.2 5.6-0.1 0.8-0.2 1.3 0 0.5-0.1 0.7 0.3 1.8 1.2 2.1 0.1 1.4 0 0.4-0.1 0.4-0.2 0.4-0.2 0.3-0.2 0.6 0.1 0.6 0.2 0.5 0.1 0.5 0.3 1 0.6 0.9 1 1.2-0.3 1.1 0.2 0.5 0.5 0.4 0.3 0.8-0.2 0.9-0.3 0.7-0.2 0.7 0.2 0.8 0.8 1.3 0.2 0.6 0.2 1.7 0.4 1.8 0.2 0.5 0.1 0.1 0.6 0.3 0.2 0.2 0.1 0.2 0.1 0.5-0.6 0.2-1.2 1.5-0.9 0.1-2.2-0.3-1.2-0.8-3-0.6-1.8-0.3-0.4 0.5-0.1 0.8 0.9 0.6 0 0.6-0.8 0.7-1.5 0.4-1 2.1-0.7 0.4-0.1 1.1-1.2 0.5-0.3 0.4-1 3.5-1.4 0.8 0.1 0.6 1.3 0.7 0 0.8-1.2 1.6-0.9 2.1-1.8 1.2-0.5-0.1-0.3-0.8-3.4-1.6-4.1 2.8-2.3-0.5 0.1 0.6-0.2 0.6-0.9 0.6-0.4 0.9-0.7-0.2-0.8 0.5-0.5 1.4-0.4 0.3-2.9-1.1-1.5 0.7-2.7-2.2-1.7-3-0.6 0.2-0.9 1-3.2 2.2-1.6-0.2-1.4-1.2-0.3-1.1 0.3-0.8-0.1-1-1-1.2-0.3-0.8 1.1-0.8 0.5-1.9 0.8-0.5-0.7-1.2-0.4-1.7-1.2-0.7 1.1-1.6 0-1.6 0.4-0.5 3.6-2.2-0.6-1.6 0.2-0.6-0.2-0.5 0.5-0.6-1-0.6-1.9 0.5-0.4-0.7-1.5-1.1-0.5-1.7-2-0.7-0.6-0.9-1.1-3.5-0.4-0.4z",
    CMA: "M645.7 553.6l1.3-2 0.6-0.5 0.9-0.2 2-1 1.3-0.9 1-1 0.6-0.9 0.4 0.4 1.1 3.5 0.6 0.9 2 0.7 0.5 1.7 1.5 1.1 0.4 0.7 1.9-0.5 1 0.6-0.5 0.6 0.2 0.5-0.2 0.6 0.6 1.6-3.6 2.2-0.4 0.5 0 1.6-1.1 1.6 1.2 0.7 0.4 1.7 0.7 1.2-0.8 0.5-0.5 1.9-1.1 0.8 0.3 0.8 1 1.2 0.1 1-0.3 0.8 0.3 1.1 1.4 1.2 1.6 0.2 3.2-2.2 0.9-1 0.6-0.2 1.7 3 2.7 2.2-1 4.6-1.3 2.9 0.5 0.7 2.5 1.4 0.5 0.6 0 0.6-0.3 0.8-0.9 1 0.4 2 0.5 1.3 3.6 2.8 0.8 1.7 1.4 0.3 0.2 3.4 0.4 1-0.3 1.4-0.6-0.3-1.2 1.1-2.4-0.1-1.5 1-0.8 1.4 0.5 1.8 0 1-3 2.6 0.3 0.7 1.4 1 0.3 0.7 0 2.3-0.3 0.9 0.5 1.2-0.1 1.4-0.3 0.4-0.9 0.2-1.1-0.8-1.4 0.7-0.9 1.1-2.2-0.2-0.4-0.6-3.5 2.4-2.1 1-2.4-0.3-1.4 2-0.2 1-0.4 0.3-1.8-0.5-1.1-1.5-2.8-0.6-0.9 1.4-1.1 0.4-0.1 0.1-0.7-1.4-0.1-0.8 1-0.4 1-1 0.8-1.4-0.1-1.5-0.3 0-0.2 1.2-0.6 0.9-1.4 1.2-1.7 0.9-0.9 0.7-0.3 0.8-0.4 1.2-0.9 0.6-2.1 0.1-0.6-0.5-0.7-1.2-0.2-1.2 0.4-0.9-0.4-0.9-0.4-0.8-0.5-0.3-0.6 0.3 0.2 1.1-0.2 1.1-0.2 1.1-0.2 0.9-0.2 0.6-1.4 1.8-0.8 1.7-0.5 0.8-1.2 0.7-0.1 0.9 0.1 1.1 0 0.9-1.7-2.4-0.4-0.4-0.8 0-0.6-0.2-0.6-0.3-0.4-0.6 0.1-1.2 0.3-1.4-0.1-1.2-0.7-0.6 0-0.5 1.6-0.5 0.4-2.3-0.1-2.8 0-1.6-0.7 0.5-0.4 0.8-0.4 2 0.4 1.6-0.7 0.3-1.1-0.1-0.7 0.2-1 0.4-1-1-1.7-3-1.4-1.8-0.6-1.1-0.3-1.2 0.1-0.7 0.2-0.6 0.1-0.7-0.3-1.2-0.1-0.8-0.1-0.2-1.2-0.5-1.6-3.4-1.1-1-4.4-6.2-0.7-0.4-0.3-0.3-0.5-1.1-0.4-0.6 0.3-0.6 0.5-0.6 0.2-0.2 1-2.8 1.3-6.3 1.5-3.6 0.7-2.1 0.3-0.7 0.4-0.3 1-0.4 0.5-0.4 0.6-0.8 0.8-1.3 0.4-1.5-0.5-1.4 1.6-4.8 0.9-2.2 1.1-1.4 0.9-0.2 0.5 0.5 0.5 0.6 0.8 0.3 0.5-0.1 1.9-1.1-0.6-0.4-2.3-1.2 1.2-1.4 0.7-0.5 3-0.9 0.5 0.2 0.4 0.3 0.3 0.3 0.3 0.3 1.8 0.6 0.9 0.1 3.9-1.2 0.8-0.6-3.2 0 0-0.6 0.9-0.1 0.7-0.5 0.7-0.3 0.9 0.4 0-0.6-1.1-0.6-0.2 0.1 0.2-1.5 0.6-1.3 0.1-0.3 0-2.2 0.2-0.4 0.3-0.1 0.3 0.1 1.7 0.9 0.4 0.1 0.7-0.2 0.3-0.2 0.2-0.2 0.7-1.8 0.3-0.3 1.5-0.7 0.3-0.3 0.4-0.4 0.2-0.3 1-1.5z",
    DGY: "M615.2 529l2.7 0.5 1.5-0.6 3.1 0 0.4-0.4 0.9-1.8 1.3 0.7 1.7 0.1 0.6 0.2 0 0.6-2 1.4-0.9 1.4-0.1 2-0.2 0.9 0.2 0.6 0.9 0.1 1.2-1.1 2.4-1.5 1.2 0.8 0.9 1.1 1.6-0.6 1.2 0.4 0.3 0.5 0 1.3 1.9 1.9 0.6 1.2-0.1 1 0.5 0.6 1.1-0.4 0.7 0.8 1.2-1.1 1.2-0.5 1 0.6 1.6 0.2 0.5 0.5 0.3 0.8-1.2 0.7-0.3 0.9 0.3 0.4 1.4 0.1 0.2 0.5 0 1-0.9 1.3-0.3 3.9 0.3 0.7 1.1 0.8 0.5 2 0 0.1-1 1.5-0.2 0.3-0.4 0.4-0.3 0.3-1.5 0.7-0.3 0.3-0.7 1.8-0.2 0.2-0.3 0.2-0.7 0.2-0.4-0.1-1.7-0.9-0.3-0.1-0.3 0.1-0.2 0.4 0 2.2-0.1 0.3-0.6 1.3-0.2 1.5-4 1.1-14.9-1.1-0.8-0.3-0.7-0.4-0.7-0.2-0.7 0.3 0.2 0.1 0 0.1 0.1 0.4-0.8 0.3-0.7-0.2-1.4-1.3-0.6 2.3 0.4 0.9 0.2 1.6 0.1 1.7-0.1 1.3-0.5 1.4-0.8 0.4-4.3-0.4-1.3 0.2-1 1.7-3.3-0.5 0.1 0.4 0.1 0 0.1 0.2-0.4 0.3-0.3-0.1-0.3-0.3-0.3-0.5 0.6-1 0.2 0.1 0.2 0.4-0.1-0.6 0-0.3-0.2-0.2-0.6 0.9-0.7 0.7 0.2 0.8 0.1 0.3-0.3 0.1-0.6 0.5 1.6 1.7-0.5 0.3-2.4 1.1-3.7 2.9-2.2 0.3-1.5-0.2 0-0.6-0.2 0-0.1-0.1-0.2-0.1-0.1-0.2 0.1-0.2 0.2-0.3 0-0.1-0.1-0.8 0.2-1.1-0.1-0.8-0.7-0.3 0-0.4-0.7 0.6-0.5 1.2-0.2 1.4 0.5 1.2-1.8 0.4-2.4-1.6-1.7-2.8 0.4-3.2-0.7 0.4-1.1 1.5-0.8 0.4-0.7-0.1-3.5-1.7-0.5-0.5-0.4-0.5-0.5-1.2-0.2-0.9-0.3-0.6-0.8-0.2-0.2 0.4-0.4 0.8-0.3 1-0.2 0.9 0.5 1.9 0.3 1.2 0.3 0.6 0.8 0 0.7 0.2 0.6 0.4 0.5 0.8 0.2 1-0.4 0.9-0.3 1 0.7 1.2-0.6 1.2 0.2 1.7 0.2 1.5-0.3 0.7-0.3 0.2-0.2 0.3-0.3 0.4-0.5 0.2-1.1-0.2-1-0.4-1.1-0.9-0.5-0.2-1.7 0-0.4-0.3-2.7-4.2-1.5-1.5-5.6-3.5-2.1-0.6-1-0.6-0.8-2.3-1-0.5-1.8 0.1-1.1 0.5-1.1 0.8-0.9 1-0.8 1.1-0.4 0.7-0.2 0.5 0 0.4 0 0.6 0.1 0.7 0.2 0.9 0.4 0.8 0.4 0.4 0.4 0.9 0.5 1.9 0.7 1.9 1.4 1.2 0 0.7-0.2 1.5-0.1 0.7 0.1 0.4 0.6 1.3-1-0.2-2-1.1-1-0.3-0.5-0.6-0.2-1.2 0-1.4 0.5-0.7-0.3-0.5-0.2-0.6 0-0.5 0.2-0.6-0.9-0.1-0.4-0.2-0.3-0.3-0.2-0.7-0.2-1.1-0.3-1.1-0.4-0.5-1-0.4-4.4-5.4-1.4-2.5-0.8-2.9-0.3-3.2 0.2-3 0.3-1.4 0.6-0.7 1 0.1 0.5-0.1 0.3-0.3 0.2-0.9 0.4 0.4 0.5 0.9 0.2 0.5 0.7 1.1 0.3 0.8 0.2 0.9 0.1 0.9-0.1 1.9 0.2 0.8 0.6 0.9 0.8 0.7 0.9 0.1 0.8-0.8 0.1-0.3 0.2-0.3 0-0.6-1.7-3.4-0.2-0.7-0.1-0.7 2.1-1.2 1.3 0.1 1.6 0.7 0.5-0.1 1.2-1.2 0.3-1.2 0.5-0.6 3.3-0.6 1.2 0.7 0.5-0.5 3 0 3.3-1 0.5-0.6 0.1-0.7-0.1-0.6-1.2-0.7-0.3-1.8 0.2-1 1.7-1.7 2.8-1.5 0.6-0.2 2.3 0.8 1-0.5 0.4-0.3 0.4-1.2 0.6 0 0.3 2.8 0.6-0.1 0.7-0.8 0.1-1.7 0.8-0.7 0.3-2.9 1.2-2 0.2-1.8 1.2-1 1.2-2.7 0.6-0.1 1.9 0.4 0.3-0.1 0.3-0.9 2 0.2 0.7 0.5 1 1.6 0.8 0.4 1-1.3 0-1.4 1.3-2.5-0.6-2 0.2-2 1.1-1.6 3.2-1.6 0.2-0.3-0.5-1.3 0.5-0.3 0.7-0.3 0.3-0.1 0.9 0.7 3.7-0.1 2.5 0.7 2.6 3.1 1.3 3.1 1.6 0.7 0 2.6 0.3 0.9 1.4 0.9 1.4 1.6 1.2-0.2 0.1-1.6 0.3-0.6 1.7-0.9 0-1.6 0.3-1.2-0.1-1.6 3.1-2.2z",
    LMV: "M450.8 577.7l-1.4-1.9 0-2.4 0.3-1-0.5-0.6-0.4-1.9-1.4-1.1-0.5-1.3-0.2-1.9 0.5-1.6-1.3-0.3-0.8 0.3-1-2.8-1-1.1 1.1-1.3 0.1-0.1 0.7 0.4 1.6 0.2 1.6-0.2 0.6-0.4 1-1.3 0.7-0.5 0-1.1 0.3-1.5 0.6-1.3 0.5-0.6 0.6-0.8 0.3-3.7 0.2-1.2 0.8 0 2 1.4 0.9 0.3 2.2-0.1-0.1 0.8-0.1 0.8-0.4 0.7 0 0.8-0.6 1 1.9 1.9 0.7 2.6-0.2 2.5 0.1 2.6 0.3 0.7 1.1 0.7-1.1 1-0.3 0.8 0.7 1 0.6 3.7 0.6 0.8-0.4 1.1 0 1.9-1.6 1.5-3.7-0.4 0.1 1.7-1.3 1.2-1.2-1-1.1 0.4-1.2-0.2-0.9 0.8z",
    CLR: "M461.5 569.9l-0.6-3.7-0.7-1 0.3-0.8 1.1-1-1.1-0.7-0.3-0.7-0.1-2.6 0.2-2.5-0.7-2.6-1.9-1.9 0.6-1 0-0.8 0.4-0.7 0.1-0.8 0.1-0.8 3.9-0.2 5.3-2.5 3.3-0.2 0.8-0.6 0.3-0.6 0.3 0.4 0.4 0.7 0 1.1 0.4 0.8-0.1 2 0.5 1.3-0.1 0.5-1.2 0-1.4 1-0.3 2.7-0.4 0.7-1.2 1 0.9 1.3 0.5 1.7 0 0.9-0.4 0.7 0.5 2.1 1.4 1.5-0.1 1.4 0.3 0.5 1.3 0.7-0.8 0.3-0.3 1-0.7 0.3-1.3 0.3-2.6-1.1-0.7 0.9-1.8 0.6-0.7-0.8-1.3-0.2-1.6 1.5-0.5-0.1z",
    MYL: "M474 550.5l-0.5-1.3 0.1-2-0.4-0.8 0-1.1-0.4-0.7-0.3-0.4 0.4-0.4 0.9-0.8 1-0.6 1-0.1 1.7 1 1.1 0.4 1.8-1.2 1.2 0.3 4.5 2.6 0.8 0.2 1-0.2 1.8-0.7 0.9-0.2 1.9 0.3 0.9 0.5 0.4 0.6 0.4 0.2 1.7 2 0.5 0.8-0.2 4.6-0.3 1.4-0.7 1.7 0.4 0.8 0.9 0.1 0.8-0.1 0.7 0.1 0.7 0.3 0.3 0.3-0.1 0.1-1.3 1.7-0.9 0.1-0.4 0.9-2.9 2.8-1.1 0.4-0.7-0.3-1-1.3-0.4-1.6-1.1-0.5-0.1-0.6-1.6-2.7 0-1.1-0.3-0.6 0.4-0.8-0.1-1.8-4.5 1.4-1-0.4-0.8-1.6-0.7-0.8-0.8 0-1.4 1-0.6-0.9 0.1-0.5-1.1 0.4-0.9-0.9-1.7 0z m13.1-13.4l2.4 0.4 0.5 0.3 0.1 0.8-0.3 1.1-0.5 0.9-0.3 0.5 0.1-0.6 0-0.4 0-0.3 0.2-0.4-1.1-0.9-1.1-0.1-1.2 0.1-1.1-0.2 0.6-0.5 0.5-0.3 0.5-0.3 0.7-0.1z",
    LRN: "M493.4 563.7l2.9-2.8 0.4-0.9 0.9-0.1 1.3-1.7 0.1-0.1 0.3 0.2 0.3 0.8-0.1 1.5-0.8 3 0.1 0.6 1.3 0.2 1.3 0.7 1.1 1 1 1.4 0.2 0.6 0.3 1.3 0.3 0.6 0.3 0.3 0.7 0.7 0.4 0.4 0.4 0.6 0.4 0.9 0.3 1 0.2 1.1 0.5 2.3 1.2 0.7 1.3 0.6 1.2 1.7 0.2 0-0.8-1.8-3-3.2 0.8-1.4 1.4 0.4 1.4 1.3 0.9 1.4 0.6 2.5-0.1 1.9-2.4 0.5-0.6 0.9-0.7-1.6-1-0.3-0.5 0.3-1-0.3-3.1 0.6-0.7-0.7-1 0.5-1.1-0.3-0.5 0.4-0.7-0.4-0.7 0.2-0.8-1.2 0-0.9-0.7-1.2 0.1-0.4 2.8-0.2 0.6-0.4 0.1-0.6-0.9-1.8-1.1 0-0.5 0.3-1.4-0.6-0.5-3.1 0.6-1.1 0.1-2-0.5-1.1-1.5-1.3-0.9-1.5-0.7-0.4z",
    CKF: "M503.3 581.5l3.1-0.6 1 0.3 0.5-0.3 1 0.3 0.7 1.6 0.6-0.9 2.4-0.5-0.1 0.4-0.6 1.8-1.1 1.2-1.4 0.7-2.8 0.8-1.2 0.7-1.3 1.1-0.3 0.4-0.2-0.4 0.1-0.6-0.5-1-0.7-0.4 0.7-2.5-0.5-0.5-0.1-0.9 0.7-0.7z",
    NTA: "M497.8 579.1l0 0.9 0.8 1.2 0.7-0.2 0.7 0.4 0.5-0.4 1.1 0.3 1-0.5 0.7 0.7-0.7 0.7 0.1 0.9 0.5 0.5-0.7 2.5 0.7 0.4 0.5 1-0.1 0.6 0.2 0.4-0.6 0.8-1.1 2.1-1.2-1-1.1 1-0.9-1.3-1.8 0-1.1-0.2-0.3-0.5 0-1.9 0.5-0.8 0.1-0.8-0.8-0.9-0.4-1.8 0.8-0.5 0.1-1.6-1.8-1.5 3.6-0.5z",
    BFS: "M497.1 590.1l1.8 0 0.9 1.3 1.1-1 1.2 1-0.6 1.1 0.6 0.4 0.2 0.7 0 0.7 0.2 0.4 0.6 0.1 0.3-0.4 0.3-0.5 0.5-0.5 0-0.1 2.9 0.7-0.4 1.7-1 0-1 0.7-1.6 0.2-0.6 0.7-2 1-0.3 0.6-0.4 0.4-0.2 0.7-0.5-0.1-0.4-1.7-2.1-1.5 0-1-0.5-1.2-1.1-1.2 1-0.5-0.8-1.6 0.2-0.3 1-0.1 0.7-0.7z",
    NDN: "M507.1 594l-2.9-0.7 1-1.6 0.5-0.5 1.6-0.8 1.6-1.3 1-0.4 0.8 0.3 0.7 0.5 1 0.1 5.7-0.9 0.2 0.3 0.2 0.3-0.3 0.3-0.3 0.2 0 1-1.3 0.7-0.5 1.2-1.6 1-2.3 0-1.4-0.8-1.3 1-1.6-0.3-0.8 0.4z",
    ARD: "M509.5 593.9l1.3-1 1.4 0.8 2.3 0 1.6-1 0.5-1.2 1.3-0.7 0-1 0.3-0.2 0.3-0.3 0.4 0.8 0.4 0.3 0.5 0.1 0.2 0.5 0 0.7 0.1 0.8 0.8 2.9 0.5 1.1 0.8 0.5 0.3 0.6 0.3 3.2 0.2 1.1 1.5 2.3 0.3 0.3-0.3 0.7 0 0.5 0.2 0.3 0 0.4-0.3 0.5-0.9 1.4-0.3 1 0.3 1.3-0.1 1.4-0.5 0.6-0.6 0.5-0.2 0.7 0.6 0.8-0.7 0.4-0.5 1.2-0.7 0.1-0.5-0.6-0.5-1.1-0.5-1.6-0.5-0.3-0.5-0.7-0.3-0.9-0.1-0.9 0.3-0.9 1.1-1.4 0.2-1.2-0.2-2.6-0.5-1.8-0.8-1.4-3.2-3.1-1.3-0.7-1.4-0.1 0 0.5 0.3 0.8-0.1 0.8-0.4 0.7-0.5 0.5 0.7 0 0.5 0.4 0.4 0.4 0.4 0.2 1.7 0.2 0.6 0.4-0.8 0.3-1 0.2-0.3 0.4 1.4 0.8-0.2 1 0 0.9 0.3 0.7-0.4 0.4-3.3 0.9-0.7-0.3-0.3-0.8-2.5-0.4-1.3-2.1-0.2-2.7 1.7-1.7-0.3-1 0.9-1.4 0.9-0.6 0.1-0.3-0.4-0.5 0.2-1.8z",
    DOW: "M504.4 628.6l-0.4 0-0.8 0-1.6 0.5-1.9-1.2-0.8 0.6-1 0-1 1.3-0.3-0.1-1.1-2.5-0.3-2.3-0.7-0.2 1.5-1.1 0.1-1.2 0.3-0.1 2.2 1.4 1.1-0.3-0.4-1.1 0.5-0.8-0.1-0.9 0.8-0.2 0.1-0.3-0.9-2.4-0.2-1.6 1.5-1.8 0-0.3-0.5-1 0.8-0.9-0.5-1.6 0.2-0.5 1.3-1.4-0.2-1.3 0.7-0.4 0.2-0.7 0.8-0.2 0.5-1.1 1.6-1 0.7 0 1.3 2.1 2.5 0.4 0.3 0.8 0.7 0.3 3.3-0.9 0.4-0.4 0.6 0.2-0.1 0.4 0 0.2-0.3 0.5 0.4 0.5-1.3 4.2-0.4 0.8-1.7 1.3-0.5 0.9 1.9-0.7 2.1-1.3 2-0.6 1.4 1.5 0.4 3.1-0.5 2.3-1.3 1.8-1.5 1.6-0.2 0.1-0.6-0.2-0.2 0.1-0.3 1.7-0.3 0.2-0.4 0.2-0.4-0.1-0.2-0.6-0.5-0.6-2.7-0.3-2 0.2-2.1 0.8-0.9 0.2-0.9 0.3-0.3 1 0.1 2.7z",
    CLK: "M603.7 473.9l-1.7-1.7-1-1.2-0.6-0.5-1 0 0 0.5-0.4-0.1-0.5-0.9-0.2-0.9 0.3-1 0.7-1.3 0.6-2.1 0.1-0.9 3.1-2 0.5 0.4 0.7 1.5 0.5 0.3 2.7 0.2 0.5-0.8 1.2 0.3 0.8-0.4 2.4 1 0.3 0.4-0.4 0.4-3.8 1.8 0.3 1.8 0.3 0.5-0.8 0.6 0.2 0.5 0.6 0.3 0 0.4-2.9 0.9-1.1-0.1-0.4 1.1-0.8 0.8-0.2 0.2z",
    STG: "M600 463.8l-0.1 0.9-0.6 2.1-0.7 1.3-0.3 1 0.2 0.9 0.5 0.9 0.4 0.1 2.8 2 0.4 0.7 0.4 0.2 1 1.8-1.3-0.1-2.7 0.7-4.5 0.5-3.1 1.2-1.1 0.9-0.3-1.1-3 0-1.3 1.4-0.8 0.3-0.3 0.1-0.4-0.4 0.1-1-0.1-0.6-0.8 0.2-0.3 0.9-0.5 0.4-1.1-0.8-2.3 0-1.4-0.4-0.5 0.7 1 2.4 0.1 1.6-0.4 0.8-1.3 0.2-2.7-1.7-0.3 0.1-1.2 0.3-0.8-0.3-1.1-1.9-1.3-0.4-0.6-1.2 0.1-0.9 1.9-1.1 0.1-0.3-0.9-0.7-2.5-0.8-1-0.8-1.3-0.1-1.3-0.4-1 0-0.6-0.8-1-3.1-1.6-4-0.7-2.2-0.1-2.2 0-0.2 0-0.1-0.1-1.7 0.2-0.8 0.1 0.1 0.2-1.2 0.6-0.6 0.2-0.3-0.5-0.7-0.1-0.6 0-0.3 1-1.7-2.6-0.5-0.7-0.1-0.3 0.1-2.5 0.7-0.2-0.4 0.1-0.3 0.3-0.8 0-0.3 0-0.3-2.7-1.7-0.2-0.6 1.3-1.9 0.1-0.6 0.2-0.7 1.5-1.6 2.1-0.9 0.2-1.1 0-0.3 1-0.6 1.6 0.1 1.3-1 1.8-1.7 1.6-0.7 1.7-0.1 0.4-0.4 0-0.7 0.4-0.4 0.6 0 0.8 0.7 0.6-0.1 3.7-1.2 1.8-1.3 1.4 0.7 1.5 3.9 0.3 0.5 2.3-0.9 2.8-1.5 1-0.3 0.4 0.1 1.1 0.8 1.3 2.9-1.5 0.4-1 0.9-1.8-0.4 0 5.6-0.3 0.6-0.4 0.4-1.1 0-0.2 0.5-0.3 0.1 0.3 0.1 0 1.3 0.6 0.7-0.2 1.6 2.3 2.4 2.4 0.6 1 1.2 0.8 0.4 0.3 0 0.3-0.9 0.3-0.1 0.8 1.1 2.3 0.3 1.6 1.6 2.6 1.4 1.3 1.7 1.7-0.4 0.2 0.2 0.1 1.7 0.4 0.4 0.1-0.1z",
    FAL: "M591.3 478.9l1.1-0.9 3.1-1.2 4.5-0.5 2.7-0.7 1.3 0.1 0.6 1.1 0.3 0.6 0.4 0.1 0.9-0.1 0.3 0 0.3 0.4 0.3 0.6 0.3 0.5 0.5 0.2 2.7-0.6 1 0 3.4 1-0.3 0.5-1.3 1.1-1.3 0-0.6-0.6-0.9 0.2-1.7 2.2-1.4 0.9-0.1 1-2.4 0.9-2.6 2.4-1.6 0.6-0.3-0.9-2-0.9-1.7-1.3 1.3-1.4 0.2-0.3-0.2-0.3-2.7-0.1-0.5-0.9-0.1-1.3-1.8-0.1 0.3-1.2-0.2-0.6-1.6 0.2-0.2-0.7z",
    WLN: "M620.1 495.2l-1.2 0.9-0.6 0.8-0.2 1.4-0.9 0.9-3-1.3-2-0.2-1.2-1.2-1-0.1-3.6 0.7-0.9 0.5-0.7 0.9-0.4 0-0.1-0.4-0.1-0.5 0.7-1.2 0.1-0.8-1.2-3.8 0.5-0.6 1.1-0.4 0.2-0.5-1.1-0.6-3 1-1.3-1.5 0.6-0.5 1.6-0.6 2.6-2.4 2.4-0.9 0.1-1 1.4-0.9 1.7-2.2 0.9-0.2 0.6 0.6 1.3 0 1.3-1.1 0.3-0.5 2.6 0.7 0 0.1 0 0.3-0.1 2 0 1.9 0.1 2.5 0.7 1.1 1 0.4 0.9 0.5 0.2 0.6-0.3 3.9 0 1.7z",
    EDH: "M621.8 495.7l-0.4-0.5-0.9-0.2-0.4 0.2 0-1.7 0.3-3.9-0.2-0.6-0.9-0.5-1-0.4-0.7-1.1-0.1-2.5 0-1.9 0.1-2 0-0.3 0-0.1 2.1 0.6 2.2 0 0.8-0.4 0.5 0.1 0.5 0.6 0.7 0.7 8.6 0.7 0.3 0.3 0.8 1.2 0.3 0.3 0.6 0.1 0 0.9-0.3 1.8-0.1 2-2.3 0.2-2.5 0.5-2.9 2.2-4.1 2.8-1 0.9z",
    MLN: "M647.1 494.9l-0.6 0.3-1.1 0.4-1.4 2.1-1 0.5-1.2-0.4 0.3-1.6-0.4-0.7-0.4-0.1-6.1 5.3-1 1.3 0.2 0.9-0.1 0.6-1.3 0.5-1.1-0.8 0-1.4-0.9-2.3-0.1-1.2-0.9-1.8-2.1 2.1-1.9 0.3-1-0.6-0.3-1.1-1.8 0-1.1-1.5 1-0.9 4.1-2.8 2.9-2.2 2.5-0.5 2.3-0.2 0.1-2 0.3-1.8 0-0.9 0.8-0.1 0 0.1 0 0.2 0.3 1.5 1.2 1.3 5.3 4 3.3 2.5 1.2 1z",
    ELN: "M668.6 483.9l-0.2 0.6-0.6 1.1-2.7 3.1 1.6 0.8 0.3 0.8-0.1 0.4-0.6-0.2-0.8 0.9-2.2 0.1-0.7 0.9-0.5-0.6-1.6 0.2-0.6 1.2-0.9-0.2-0.6 1-0.8 0.4-2.1-0.5 0-0.8-0.7-0.4-3.8 1.6-2.1-0.8-1.8 1.4-1.2-1-3.3-2.5-5.3-4-1.2-1.3-0.3-1.5 0-0.2 0-0.1 2.1-0.2 3.6-1.6 1.1-0.9 0.7-1.3 0.8-1 1.2-0.2-0.2-1-0.2-0.4-0.2-0.3 0.9-0.8 1.3-1.6 1-0.5 7.9 0.6 0.9 0.4 1.3 1.9 0.8 0.5-0.4 1.4-0.2 0.4 0.6 0.3 1.2-0.3 0.7 0.6 0.2-0.4 0.5-0.4 0.3-0.4 0.7 0.7 1.9 1.4 1.8 0.6 2.5 2.1z",
    NTY: "M701.9 557.1l3 0.6 1.2 0.8 2.2 0.3 0.9-0.1 1.2-1.5 0.6-0.2 0.1 0.2 0.7 2 0.4 0.8 0.3 0.7 0.2 1 0.3 1-3.6 1.4-3.7-2.7-2.7-2.4-1.1-1.9z",
    STY: "M709.4 564.1l3.6-1.4 0.5 0.3 0.2 0.3 1.3 1.4 0.4 0.9 0 0.4-0.1 0.4 0 0.5 0.1 1.8 0.1 0.7-1.7-0.2-2.9 0.9-1.7-0.7-1.5-0.3 0.3-1.5-0.6-1.2 0.7-1.1 1.3-1.2z",
    SND: "M707.7 569.1l1.5 0.3 1.7 0.7 2.9-0.9 1.7 0.2 0.3 0.3-0.1 0.8 0.7 2.6-0.5 0.2-0.8 0.4-1 0.3-0.2 0.6-0.5 1.6 0.1 1.8-0.4 0.9-1.4 0.3-1.6 0-1.5-0.2-0.4-0.4-0.2-1-0.2-1.2-0.5-0.7-0.8-1.4-0.1-1.2-0.3-0.6-0.8-0.5 1-2.7 1.4-0.2z",
    DUR: "M671.2 580.3l1.5-0.7 2.9 1.1 0.4-0.3 0.5-1.4 0.8-0.5 0.7 0.2 0.4-0.9 0.9-0.6 0.2-0.6-0.1-0.6 2.3 0.5 4.1-2.8 3.4 1.6 0.3 0.8 0.5 0.1 1.8-1.2 0.9-2.1 1.2-1.6 0-0.8 2.6 0.5 3 0.3 2.4-0.1 2.6 0.2 0.8 0.6 0.8 0.5 0.3 0.6 0.1 1.2 0.8 1.4 0.5 0.7 0.2 1.2 0.2 1 0.4 0.4 1.5 0.2 1.6 0 1.4-0.3 0.4-0.9-0.1-1.8 0.5-1.6 0.2-0.6 1-0.3 0.8-0.4 0.5-0.2 2 7.5 1 2.6 1.5 1.8-0.2 0.1-2.1 1.1-0.5 1.4-1 0.9-0.4 2.8-2.1 0.7-0.4 1-0.4 1-0.8 0.7 0 0.5-0.3 0.1-1.4 1.5-1.6 0.6-1.9 0.1-1.1 0-1.2-0.1-1.1-1.2-1.5-0.7-1.1 0-1 0.4-0.3 1-0.1 1.6 0 1.3 0 1-1.5-0.1-0.5 0.5-1.1-0.4-0.9 0.2 0 1.1-0.6 1.1-0.3 1.5-1.8-1.7-0.5-0.1-0.7 0.9 0 1-3.7 2.1-1.2 0-2.4-1.4-1.8-0.6-2.6 0.9-1.8 1.5-0.8-0.5 0.3-1.4-0.4-1-0.2-3.4-1.4-0.3-0.8-1.7-3.6-2.8-0.5-1.3-0.4-2 0.9-1 0.3-0.8 0-0.6-0.5-0.6-2.5-1.4-0.5-0.7 1.3-2.9 1-4.6z",
    HPL: "M714.2 593l0.4-1 2.1-0.7 0.4-2.8 1-0.9 0.5-1.4 2.1-1.1 0.2-0.1 0.2 0.3 0.7 0.6 2.5 1.1 0 0.6-1 0 0 0.4 0.1 0.2 0.3 0.5 0.1 0.7 0.2 0.5 0.3 0.6 0.3 0.4-0.3 0.7-0.5 0.4-1.1 0.5 0.1 0.6 0.2 0.3 0.3 0.2-0.1 0.2-0.2 0.3-0.5 0.5-0.1 0-2.3 0-2.7-0.4-2.5-0.6-0.7-0.6z",
    RCC: "M722.4 594.6l0.1 0 0.5-0.5 0.2-0.3 0.1-0.2 0.1 0 0.4 0 0.1-0.1 0.1-0.3 0.1-0.2 0.2 0.1 0.1 0.2 0.2 0.4 0.1 0.4-0.1 0.1 0.6-0.1 0.3-0.4 0.4-2.3 0.8 1.1 0.8 0.7 0.9 0.3 2 0.3 2.3 1.5 9.6 3.1 0.4 0.2 0 0.1-0.4 0.8-1.3 0.5-0.7 0.8-0.4 1.2 0 2.3-2-0.7-2.4 0.7-1.1-0.8-0.9-0.2-2.5 0.6-2.1-1-1.9 0.5-3.1-0.4-0.3-0.7-0.6-1.1-0.5-1.2-0.3-1.1-0.1-1 0-0.7 0.1-1.7 0.2-0.9z",
    NYK: "M664.5 624.9l2.2 0.2 0.9-1.1 1.4-0.7 1.1 0.8 0.9-0.2 0.3-0.4 0.1-1.4-0.5-1.2 0.3-0.9 0-2.3-0.3-0.7-1.4-1-0.3-0.7 3-2.6 0-1-0.5-1.8 0.8-1.4 1.5-1 2.4 0.1 1.2-1.1 0.6 0.3 0.8 0.5 1.8-1.5 2.6-0.9 1.8 0.6 2.4 1.4 1.2 0 3.7-2.1 0-1 0.7-0.9 0.5 0.1 1.8 1.7 0.3-1.5 0.6-1.1 0-1.1 0.9-0.2 1.1 0.4 0.5-0.5 1.5 0.1 0.9 0 1 0.6 0.3 1.1 0.2 0.1 1.4-0.3 0.5 0.3 0.6 1.5 2.1 2 0.6-0.1-0.3-1.2 1.5 0.2 0.5 0.6 0.5 1.9 0.6 0.5 0.5-0.3 0.2-0.5-1-2.5 0-1 0.3-0.3 0.6 0 0.5 0.6 0.2 0.8 0.7 0.3 0.4-1.2 1 0.3 0.3-0.4 0.5 0.4 0.4 1.7 1.3 0 0.3 0.4 3.6-2 0.1 0 0.6-1 1.6-0.5 1 0.2 3.1 0.4 1.9-0.5 2.1 1 2.5-0.6 0.9 0.2 1.1 0.8 2.4-0.7 2 0.7 0-2.3 0.4-1.2 0.7-0.8 1.3-0.5 0.4-0.8 0-0.1 10.1 6.5 1.3 1.3 0.6 1.1 0.1 0.8-0.1 0.6 0.1 0.8 0.5 0.7 1.6 1.1 0.6 0.7 0.7 1.3 0.8 1.9 0.6 2 0 1.6 0.2 0.6 0.2 0.5 0.4 0.4 0.5 0.2-0.2 0.8-0.1 0.3 0.4 0.4 0.8 1.3 0.4 0.5 1.9 0.5 0.5 0.3 0.5 0.6 1.1 0.5 0.4 0.9 0.3 2.1 0.1 0.3 1.2 1.3 1.6 0.7-0.4 1-0.6 0.5-3.4-0.2-0.8-0.7-2-0.4-0.9-1.3-1.2-0.3-0.8 0.6-0.2 1.9-1.3 1.2 0.3 0.7-0.2 0.6-3.2 1.9-1.6-0.3-1 0.2-1.6 1.3-1.7 0.8-0.2 0.2 0.3 0.7-0.1 1.2-1.2 0.6-0.1 1.4-1.6-0.1-1.5-1.1-7.3 1.2-1.3 1.6-0.5 1.2-1.2 0-1.6-0.2-0.7-1.3 0-1.4-0.2-1.6-0.9-0.9-1-0.1-2.1 0-1.4 0.6-1.1 0.4-0.5 1-0.3 1.5-0.7 1.3-0.8 0.1-0.9 0.3-0.8 0.5-0.1 1.9 0.7 2.4 1.9 3 1.7 1.4 2.9 0.2 2.6 0 2.6-1.1 1.3 0.3 0 2.5 1 2.2-0.5 1.5-0.2 1.7-1.3 2 0.2 0.5 1.5 1.1-0.8 0.2-1.8 1.4-1.8 0.6-3.4-1.5-0.1 1.6-0.7 1.4 1.7 2.2-1.8 0.3-0.7 0.8-0.6 0-0.6-0.6-2.2 0.2-0.7 1.5-0.7-0.1-0.8-1.1 0-2.2 0.1-0.7 0.8-1.8 0.7-0.4 0.1-0.8-0.5-0.4-1.8-0.2-1.4-1.6-0.8 0 0.1-1 0.8-0.7-0.1-0.9-0.6-0.8-0.3-0.8 0.1-2.3-0.9-2.1-0.8-0.5-0.1-0.5 1.8-0.2 0.1-1.2-0.2-1.5 0.8-1.6-0.1-0.8-1.9-1.6-2.5 0.5-1.7 1.2 0 0.6-0.4 0.5-1.1 0.3-2.4-0.3-0.5-1.3-0.8-0.7-0.6 0.8-0.1 1.3-0.2 0.3-1.4 0.3-2.7-0.5-2.5 0.5-1.6-0.1-0.7-1.1-0.9-0.2-0.7-1.3-0.9-0.6-1.8 0.2-0.5 0.7-1.2-0.7-0.2-1.8-1.2 0.6-2-0.2-0.5 0.6 0.2 1.5-1.1 1.1 0.5 1.6-0.1 1.7-0.6 0.5-1.1 0-1.4 1.8-1.6-1.2-1.5-2.1-0.3-2.1-3.3-1.7-0.2-1.4-0.5-0.9-1.5-0.2-0.3-0.4 0-0.8-2.1 1-0.6 0-0.6-1.5-1.7-0.1-0.6-0.9 0.5-1.3-0.4-0.3-0.1-1.2-0.3-0.4-1.2-0.3-2.2 0.6-1-0.1-0.5-0.6 0-2-0.4-0.6-2.4-1.4-1.2-1.3-0.3-1.2 0.2-1.8 1.3-0.7 0.3-1 2.8-3.6 0.2-1.1z",
    ERY: "M735.7 645.6l0.5-1.2 1.3-1.6 7.3-1.2 1.5 1.1 1.6 0.1 0.1-1.4 1.2-0.6 0.1-1.2-0.3-0.7 0.2-0.2 1.7-0.8 1.6-1.3 1-0.2 1.6 0.3 3.2-1.9 0.2-0.6-0.3-0.7 1.3-1.2 0.2-1.9 0.8-0.6 1.2 0.3 0.9 1.3 2 0.4 0.8 0.7 3.4 0.2 0.6-0.5 0.4-1 4.2 1.6 1.7 1.6-4.2 2.3-1.4 1.7-1.2 3.1 1 2.3 1.4 5.2 0.8 2.4 5 7.8 8.3 12.5 0.8 2.6-0.6 2.6-0.3 0.3-1 0.8 1-2.4 0.3-1.4-0.8-0.6-0.9-0.3-2.1-1.5-1-0.4-0.9 0.3-1.8 1.1-1 0.3-1.2-0.2-1-0.3-1-0.5-0.8-0.7-4.5-5.8-1.6-1.2-1.7-0.3 0-0.3-0.1-0.7-0.5-1.1-0.6-1-0.9-0.8-0.9-0.1-1.2 0-1 0.6-0.9 0.6-0.8 2-0.2 1.8-0.1 0.9-2.8 0-1.6 0.4-0.3-0.1-1.2-1.2-0.1-0.1-2.7-0.4-1 0.4-3.2 2.1 0.4 0.2 0.4 0.2 0.4 0.3 0 0.1 0 0.2-0.1-0.1-1 1-2 1.5-2 1.8-1.6 1.7-0.8 0.1-0.1-0.6 0.1-1-3.8-1.9-2.6-0.3-3.6 1-1.7-2.2 0.7-1.4 0.1-1.6 3.4 1.5 1.8-0.6 1.8-1.4 0.8-0.2-1.5-1.1-0.2-0.5 1.3-2 0.2-1.7 0.5-1.5-1-2.2 0-2.5 0.1-1.9 0.9-4.2-0.5-2 0.1-0.2z",
    KHL: "M758.1 666l0.1-0.9 0.2-1.8 0.8-2 0.9-0.6 1-0.6 1.2 0 0.9 0.1 0.9 0.8 0.6 1 0.5 1.1 0.1 0.7 0 0.3-0.4-0.1-5.9 2-0.9 0z",
    NLN: "M738.9 674.1l0.8-0.1 1.6-1.7 2-1.8 2-1.5 1-1 0.1 0.1 0-0.2 0.4 0.3 0.7-1.3 1.3-0.6 1.4-0.1 1.1 0.3 1.9 1.4 0.5 0.6 0.7 0.4 0.7-0.2 1.3-1.1 8.4-1.6 1.3 0.6 0.9 1.6 2.9 4.5-0.2 0.1-2 0.6-1.4 0.4-0.3 0.8-0.2-0.2-0.3 0.6 0.1 1.4-1.7 2-1.2 0.2-3-0.8-2.8 2.1 0 0.4 3.5 0.2 0.6 0.5 0.1 0.7-0.6 0.5-2.8 0.5-0.6 1.3 0.3 0.8-0.1 0.3-1.9 0.9-2.9 0.8-1.6-0.1-0.5-0.3-0.3-0.7 0.5-1.8 0-0.9-0.3-0.4-5.8-0.7-0.3 2.1-0.9 1-1.4 1.7-5.1-0.4-0.2-0.2 0.8-0.5 0.1-0.4-1.4-1.3-1.1-2.4 1.3-1.1 1.6 0.4 0.4-0.3 0-1.1-0.8-0.7-0.1-0.9-0.6-0.5 1.1-0.7 0.6 0.2 0.4-0.3 0.2-1.3-0.2-1.1z",
    NEL: "M766 674.6l0.3-0.8 1.4-0.4 2-0.6 0.2-0.1 0.5 0.8 2 1.1 1.5 1.7 0.8 0.6 1.6 0.2 0.7 0.3 2.2 2.8 1 0.8-0.2 0.2-0.1 0-0.7 0.5-1.1 0.2-1-0.2-0.6 0.5-1.6 3.8 0.1 0.5 0.8 1-1.4 1.2-0.5 0-1.1-1.1-0.3-0.8-0.7-0.4-0.3-0.6-1.2-1.1 0.3-1.8-0.7-2.7 1.3-1.8 0-0.5-1.8-0.1-1.3-1.9-2.1-1.3z",
    LIN: "M741.9 686.7l1.4-1.7 0.9-1 0.3-2.1 5.8 0.7 0.3 0.4 0 0.9-0.5 1.8 0.3 0.7 0.5 0.3 1.6 0.1 2.9-0.8 1.9-0.9 0.1-0.3-0.3-0.8 0.6-1.3 2.8-0.5 0.6-0.5-0.1-0.7-0.6-0.5-3.5-0.2 0-0.4 2.8-2.1 3 0.8 1.2-0.2 1.7-2-0.1-1.4 0.3-0.6 0.2 0.2 2.1 1.3 1.3 1.9 1.8 0.1 0 0.5-1.3 1.8 0.7 2.7-0.3 1.8 1.2 1.1 0.3 0.6 0.7 0.4 0.3 0.8 1.1 1.1 0.5 0 1.4-1.2-0.8-1-0.1-0.5 1.6-3.8 0.6-0.5 1 0.2 1.1-0.2 0.7-0.5 0.1 0 0.2-0.2 3.5 2.9 0.9 0.4 0.9 0.2 0.8 0.4 0.8 0.9 0.1 0.5 0.1 0.9 0.1 0.7 0.3 0.3 0.4 0.1 1.4 1-0.4 0.5 0.8 0.7 0.8 1 0.5 1.3 0.2 1.1 3.8 10.5 0.7 3 0 3.3-1 4.1-0.3 0.6-0.5 0.2-0.9 0.2-0.8 0.5-4.2 4.2-0.8 0.4-0.7 0.5-3.7 5.5-0.9 1-1.1 0.5-0.8 0.5-0.6 1.1 0.1 0.9 1.4 0.1 2.4-0.5 0.6 0.2 1.3 1.1 0.7 0.3 1.1 0.7 2.4 3.8 1.2 1.4 0.8-0.6 0.7-0.1-0.2 0.3-0.6 1.9 0.8 1-0.2 0.5-3.6 2.7-1.2-0.2-1.1-0.1-2.4 1.4-1.8 0.2-0.3 0.3 0.2 2.4-0.5 1-0.7 0.7-1.5 0-2.3-0.8-0.1 0-1.5 0.6-0.9-0.1-1.6 1-1.1-0.4-1.1 0.2-0.8-1.1-2.9 0.6-2.5-1.2-4 2.1-1.6 0-1.5-0.5-1.1 0.5-0.8-0.5-0.2-0.8 0.8 0.2 2.1-0.9 1.4-1 0.2-0.9-4.7-1.8-0.5-1.2-1.7-1.2-1.1 0.2-1-0.5-2-0.1 0-0.1-0.6-1.6-0.6-3-0.7-0.7-0.8-2.5-0.7-1.4-1.4-0.3 0-1-0.5-0.9 0.9-2.6-0.1-0.6-0.8-0.6-0.1-1.4-0.9-2 0.2-1.5 1.1-0.9 0.9-1.4 2.3-1.1-0.3-1.6-0.8-1 0.5-1-0.6-0.9 0.4-0.8-0.2-1.7 0.2-1.6-1.5-0.1-0.2-0.1-0.1-0.6 0.7-1.6 1.1-0.2 0.7-0.8 1.3 0 0.3-1.1 1-1.3-0.1-0.6-0.3-0.1-0.6 1-1-0.9-1.2 0.1-0.9 0.9-2.5-0.4 0.4-3.5 0.9-2.5 0.2-0.9-0.1-0.6-0.7-2.5-0.3-0.4-0.3-0.2-0.2-0.3-0.1-0.5 0.3-0.8 0-0.5 0-0.4-0.7-1.4-0.4-0.8-0.2-0.8 0.3-1z",
    NFK: "M787.3 743.5l1.2 0.2 3.6-2.7 0.2-0.5-0.8-1 0.6-1.9 0.2-0.3 0.3-0.1 1.8 0.2 0.8 0.4 1.3 1.9 0.7 0.4 0-0.5-0.2-1.3 0.9-1.4 1.2-1.4 0.6-1 0.3-1.9 0.6-2.1 0.7-1.9 0.6-1.3 1.7-1.7 2.3-1.1 2.5-0.5 2.3 0.1-0.4-0.6 1-0.3 1 0.2 1.1 0.5 1 0.2 3.9 0 1.9 0.5 2.1 1 2.3 0.6 2.1-1-0.5-0.4-0.6-0.2-0.5 0-0.6 0 0-0.5 14.4 3.5 5.7 2.9 11.6 9 1.4 1.6 1.1 1.9 0.9 3.6 0.8 2.3 0.6 2.3-0.3 1.6 0.3 1.2 0.1 1.5 0 2.8-0.1 0.1-0.2 0-2.4-0.8-0.8 0.2-0.5 0.5-0.5 1.7 1.1 1.4 1.1 0.3 0.1 0.9-0.4 0.5-0.3-0.4-1.2 1.2-1 0.5-1.9-1.2-0.7-0.1-0.5 0.6-0.1 1-1.3-0.6-1.1 0.5-1.4-0.6-1.2 0.5-1-0.7-0.6 0-0.3 0.5 0.9 0.9-0.1 0.2-1.4 0.3-2.3 1.1-1.2 2.4-0.6 0.6-2.3 0.1-1.9 1.6-1.5 0.5-1.9-0.2-1.7-0.6-2.2 0-2-0.7-2.9 1.1-2-1.7-2.3-0.1-2.1-0.9-2.3 1-1.7 0.2-0.8-0.7-1.9-0.1-1.1-0.7-0.2-1.1 0.2-0.5 1.8-1.4-1-0.2-0.5-0.5-1.8 0.5-3.7-0.5-3.2 1.2-2.1-0.1-2.3-1.8-1.5-2.1-0.1-0.6-1.6-0.9-2 0.2-1.1 1-0.5 0-0.8-1.5 0-0.7-0.6-0.5-0.2-1.6 0.5-1.4-0.5-0.9 0.1-0.9 1.2-1 0-0.3-2.9-2.2 0-0.5 0.8-1.1-0.2-0.8-1.8-0.7 0.7-4.2z",
    SFK: "M800.1 766l2.1 0.1 3.2-1.2 3.7 0.5 1.8-0.5 0.5 0.5 1 0.2-1.8 1.4-0.2 0.5 0.2 1.1 1.1 0.7 1.9 0.1 0.8 0.7 1.7-0.2 2.3-1 2.1 0.9 2.3 0.1 2 1.7 2.9-1.1 2 0.7 2.2 0 1.7 0.6 1.9 0.2 1.5-0.5 1.9-1.6 2.3-0.1 0.6-0.6 1.2-2.4 2.3-1.1 1.4-0.3 0.1-0.2-0.9-0.9 0.3-0.5 0.6 0 1 0.7 1.2-0.5 1.4 0.6 1.1-0.5 1.3 0.6 0.1-1 0.5-0.6 0.7 0.1 1.9 1.2 1-0.5 1.2-1.2 0.3 0.4 0.4-0.5-0.1-0.9-1.1-0.3-1.1-1.4 0.5-1.7 0.5-0.5 0.8-0.2 2.4 0.8 0.2 0 0.1-0.1 1.1 3.6-0.2 0.7-0.6 0.7-1.2 4 0 0.7-0.1 0.8-2 5.5-1.5 2.7-0.5 0.6-0.5 0.8-0.1 2 0.1 3.4-0.3 1.5-0.8 2.6-0.2 1.4-0.7 2.1 0 1-0.3 0.5-3.7 1.5-0.8 0.9-0.6-0.5-0.3 0.6-0.1 1-0.4 0.5-0.3 0.3-1.2 1.7-3.2 3.7-0.6 0.8-0.5 0.2-3.2-4.1-1.4-0.5-2.3-1.8-1.3-0.3 0 0.5 1.7 1.6 1 0.7 2.1 0.5 0.5 0.3 0.2 0.3 0 1.2-0.2 0.4-0.9-0.3-0.6 0.1-1 0.3-0.5 0.1-0.6-0.2-1.3-0.8-1.1 0-2.2 0.8-1.2 0.2 0.4 0.2-0.9 0.1-1.9-0.1-2.4-1-2.5-0.3-2.2 0.7-3.7 0.3-0.5-0.2-1.4-2.7-0.4-1.8-0.8 0.4-0.1-0.3-0.5-1.4 0.3-0.8-0.7-1.8-1-0.7-2 0.2-5.2 2-1.1-0.4-0.6-1.2-3.7 0.7-0.6-3.4 1.4-1.9 0.2-1.2 1-1.1 0.4-0.3 1.1 0.4 0.7-0.2-0.1-1.2 0.9-2.6 0-0.6-0.6-0.8-1.1 0.1-0.9-0.9-0.6 0.4-1-0.3-0.8 1-0.8 0-2-2.5 0.8-2.5 0.7 0.5 0 0.5 2.3 1.8 3-0.9 0.7-0.7 0-0.5-1.8-2.1-1.8-0.1 0-0.6 0.7-1.1-0.1-0.6-1.3-1.2-1.4-2.7 0-0.9 0.2-0.4 2.5-1.9z",
    ESS: "M798.4 794.5l3.7-0.7 0.6 1.2 1.1 0.4 5.2-2 2-0.2 1 0.7 0.7 1.8-0.3 0.8 0.5 1.4 0.1 0.3 0.8-0.4 0.4 1.8 1.4 2.7 0.5 0.2 3.7-0.3 2.2-0.7 2.5 0.3 2.4 1 1.9 0.1 0.9-0.1 0.8 0.4 7.8 0.5 0.9-0.6-0.1 1.4-3.7 3.9 0.6 0.4 0.7 0.3 1.7 0.3 0.5-0.5 0.4-0.8 0.2 0 0 1.6-0.5 1.2-2.7 2.4-2.4 1.7-1.5 0.6-3.3 0.5-0.9-0.1-0.4-0.4-0.8-1.5-1.5-2.1-0.4-1.1-0.1 1.5-0.7 0.8-1.8 0.9-1.4 1.3-0.4 0.2 0 0.4-0.1 0.9-0.2 0.9-0.3 0.4-0.5 0.2-0.8 0.6-0.5 0.3-0.5 0-1.1-0.5-0.4-0.1-1.2 0.1-2.1 0.9-1.1 0.6 0.8 0.4 0.8 0.1 0.8 0.4 0.5 1.2 1.4-1.4 3-0.6 1.4-0.6 1.3-1.1 0.9-0.2 0.7 0.8 0.1 0.6-0.2 0.7-0.2 0.6-0.1 0.1 0.1 0.6 0.2 0.6 0.4 0.9-0.5 0.4-0.2 0.7 0 1.7-0.1 0.5-0.4 0.3-0.7 0.6 1.3-0.1 0.4 0.2 0.2 0.4-1.3 2.1-2.4 2.2-2.1 1.3-0.4-0.4-3.1-1.2-1.6-0.4-1.6-0.6-1.7 0.6-0.7 1.9 0.5 0.5 0.1 0.1-0.1 0.1-0.1 0.1-0.9 0.8-0.7 0.3-0.6 0-0.6 0.1-0.7 0.7-0.7-0.8-0.3 0.1-0.1-0.9-0.8-0.3-2.2-0.8-2.5-0.3-3.3-0.7-1.7-0.1-0.2-0.3-0.4-1.2-1.1-0.4-0.6-0.8-0.9-1.7-0.2-0.8-0.8-0.1-2.2 0.7-1.6 0.1-1.7 0.2-0.8 1-0.6 0.1-2.5-1.5-0.1-0.4-0.3-0.8-1-0.7-0.1-0.1-0.5-0.2 0.3-1.2-0.2-0.9 0.5-4.2 1.7-2.7 3.4-0.6 2.3-1 0.2-1.2 1.3-0.8-0.8-0.7 0-1.7 1.2-1.3-0.1-0.5-0.5-0.6 0.2-0.8-2.3 0.5-0.5-1.7-0.2-2-0.6-1.4-0.1-1.7-1.3-0.8-0.1-1.4 1.3-1.9-0.1-2.1 0.4-0.1 1.1 1.1 1.8-0.5 0.8-0.7 0-1.5 0.6-0.4 2.3 0.4 1.4-0.6 1 0.2 0.8 0.6 1.9 2.3 1.2 0.7 0.5-0.6-0.4-0.7 0.8-0.6z",
    SOS: "M809.5 834.2l-0.1-0.1-0.5-0.5 0.7-1.9 1.7-0.6 1.6 0.6 1.6 0.4 3.1 1.2 0.4 0.4-0.6 0.4-2.1 0.7-3.7-0.6-1.3 0.1 0-0.1-0.6 0-0.2 0z",
    THR: "M794.2 832.5l1.7 0.1 3.3 0.7 2.5 0.3 2.2 0.8 0.8 0.3 0.1 0.9-1 0-3.2 0.9-0.3 0.5-0.1 0.8-0.3 0.8-0.6 0.8-0.7 0.4-0.7 0.2-0.7 0.4-0.8 0.3-0.5 0.2-0.9-0.1-0.4-0.6-0.3-0.8-0.8 0-1.4 0.5-2.5-0.9-0.3-0.4 0.1-0.6 0.3-0.3 0.8-0.7 0.3-1.6 1.2 0.2 0.3-0.7 2.6-1-0.7-1.4z",
    KEN: "M789.6 839l2.5 0.9 1.4-0.5 0.8 0 0.3 0.8 0.4 0.6 0.9 0.1 0.5-0.2 0.8-0.3 3-0.5 0.4-0.2 0.2-0.6 0.2-0.5 0.2-0.2 2-0.6-0.1 0.2-0.2 0-0.4 0.4-0.7 1.3-0.1 1.1 0.2 0.8 1 0.1 0.3 0.7-0.4 1.9-0.8 0.8-1.4 2.1-0.5 1.4 0 0.4 0.7 0.1 0.5-0.1 0.8-0.4 0.8-0.3 1.4 0.4 1.4 1.1 1.3 1.2 1.4-0.9 1.2-1 0.6-2.7 0.2-0.8 0.3-0.5 1.9 0.5-0.4-0.9-0.2-1 0.2-0.8 1 0.1 0.1 0.9 0.5 1.4 0.7 1.2 0.5 0.6 10 1.1 5.8-1.8 15.1-1.4 1.1 0.7-0.4 2.5-0.2 0.4-0.2 0.5-0.2 0.3-0.4 0.3-1.6 0-0.3 0.2 0.2 1.7 0.3 1.2 0.8 2 0.4 3-0.4 2.8-1 2.4-1.2 1.5-3.2 1.1-1.2 1-0.6 0.1-1-0.1-0.5 0.2-0.5 0.5-0.4 0.5-0.4 0.4-0.9 0.4-3.1 0-0.9 0.3-0.9 0.6-1.9 1.7-2.4 3.5-0.4 0.9 0.1 1.9 0.5 2.9-1.6 0.7-3.6-1.2 0.2-0.4-0.3-1-0.8-0.5-0.6 0.5-0.7 0-1.7-3.3-1-0.7-3.2 0.2-1-1.1-0.8-0.3-4.1 1-1.6-1.3-2.6-0.9-0.3-1.3-2.7-1.3-0.7-1.3-0.9-0.5-1.2 0.2 0.1-1.1-1.1-0.5 0-0.8-0.2-0.1-3 0.7-2.1-0.9-3.8 0.8 0.6-2.1-1-0.3-1.7 0.5-1.6 0.1-0.3-2.4 0.2-1-0.7-2.1 0.9-2.5-0.4-1.8-0.1-1.7 0.7 0.5 1.2-0.4 0.1-1.7 1.1-1 0.5-1.3 1.2-1 0.6-2.5-0.1-0.8-0.3-1.4 1-1.5 1.4-1.5 0.5-1.1z m32.3 4.5l1 1.1 0.4 1.1-0.2 0.9-1.2 0.5-5.5-0.5-0.9-0.3-0.8-0.9-0.7-1-0.4-0.9 0.6-2.1 0.3-0.4 0.6-0.2 5.8 2 0.5 0.3 0.5 0.4z",
    MDW: "M810.7 845.1l-0.3 0.5-0.2 0.8-0.6 2.7-1.2 1-1.4 0.9-1.3-1.2-1.4-1.1-1.4-0.4-0.8 0.3-0.8 0.4-0.5 0.1-0.7-0.1 0-0.4 0.5-1.4 1.4-2.1 0.8-0.8 0.4-1.9-0.3-0.7-1-0.1-0.2-0.8 0.1-1.1 0.7-1.3 0.4-0.4 0.2 0 0.1-0.2 1-0.3 7.5 1.1 0.7 0.5 0.6 1.1 0.1 0.7-0.5 0.4-1 0.1-1.7-0.3-0.7 0-1.5 1.4-1.7 0.4-0.8 0.6 0.3 0.4 0.4 0.5 0.3 0.5 0.4 0.2 4.1 0z",
    ESX: "M782.1 864.2l1.6-0.1 1.7-0.5 1 0.3-0.6 2.1 3.8-0.8 2.1 0.9 3-0.7 0.2 0.1 0 0.8 1.1 0.5-0.1 1.1 1.2-0.2 0.9 0.5 0.7 1.3 2.7 1.3 0.3 1.3 2.6 0.9 1.6 1.3 4.1-1 0.8 0.3 1 1.1 3.2-0.2 1 0.7 1.7 3.3 0.7 0 0.6-0.5 0.8 0.5 0.3 1-0.2 0.4-3.1-1.1-1.9 0.7-4.6 4.5-1.9 0.8-10.1 2.2-1.8 0.8-0.2 0-0.5 0.7-0.5 0.7-0.1 0.3-1.6 1.1-1.7 2.5-1.7 0-1-0.1-2.1-0.9-0.5 0-1.7 0-0.4-0.3-0.8-0.8-0.9-0.3-2-0.1-0.8-0.3-0.1-0.8-1.2-2.1-2-1.8-2-1.3-1.5-1.3 0-0.5 0-0.8 0.5-1.9 1.1-1.7-0.6-1.6 1.8-1.7 0.3 0 0.8 0.9 1.4 0 0.3-0.9 0.1-2.2 0.3-0.7 0.9-1.3-0.3-0.4-0.6-0.1-0.3-1-1.1-0.6 0.4-0.9 1-0.2 0.7-0.4 0.1-0.9 0.9-0.1-0.7-1.8 1.9 0z",
    BNH: "M773.2 883l1.5 1.3 2 1.3 2 1.8 1.2 2.1 0.1 0.8-8.9-3.3-1.6-0.1-0.1 0-1-1.9 0-0.8 0.8-0.6 1.5 0.2 0.4-1 0.6-0.4 0.3 0 0.6 0.8 0.6 0.1 0-0.3z",
    WSX: "M780.2 864.2l0.7 1.8-0.9 0.1-0.1 0.9-0.7 0.4-1 0.2-0.4 0.9 1.1 0.6 0.3 1 0.6 0.1 0.3 0.4-0.9 1.3-0.3 0.7-0.1 2.2-0.3 0.9-1.4 0-0.8-0.9-0.3 0-1.8 1.7 0.6 1.6-1.1 1.7-0.5 1.9 0 0.8 0 0.5 0 0.3-0.6-0.1-0.6-0.8-0.3 0-0.6 0.4-0.4 1-1.5-0.2-0.8 0.6 0 0.8 1 1.9-1.1 0.6-1.7-0.6-6 2.1-8.1 0-7.6 2.6-0.4-0.1-0.4-0.4-0.4-0.2-0.5 0.1-0.2 0.7 0.3 1.4-0.2 0.7-0.9 0.6-1.1-0.4-4.3-2.7-0.3-0.5 0.3-0.7 0.6-0.5 1.3-0.6 0-0.4-0.4-0.4-0.9-0.9-0.6-0.3-0.2 0.2-0.6 0.4-0.3-0.1 0.4-1-0.5-0.3 0.4-0.7-0.1-1.2-1.2-1.4-0.1-0.5 1.4-2.2-0.4-0.9 0-0.8 1.8-3.7 0.1-1.2 1.1-1.4 0.2-1.1 1.2-1.3 0.4-0.2 1.9 0.2 0.6-1.5 1-0.6 1 0.8 2.1 0.5 1.1-0.1 1.7-0.9 1.2 0.6 2.8-0.2 1-0.7 0.8 0.2 1.3-0.7 2.6-0.1 3.2-1.4 2.3-0.1 5.7-3.3 1.9 0.7 0.2 1 0.8 0.3 2-0.5 1.1 0.4 2.5-0.1 1 0.1z",
    HAM: "M743.9 867.7l-1 0.6-0.6 1.5-1.9-0.2-0.4 0.2-1.2 1.3-0.2 1.1-1.1 1.4-0.1 1.2-1.8 3.7 0 0.8 0.4 0.9-1.4 2.2 0.1 0.5 1.2 1.4 0.1 1.2-0.4 0.7-0.4-0.2-1.5-0.3-1.1 0-0.2-0.3-1.4-0.4-1.3-0.1-0.8 0-0.7 0.6-2.9 0.2-0.7 0.2 1.7 1.4 0.3 0.5 0.1 1.4-0.2 0.8-0.6 0.6-0.6-0.1-0.9-0.3-0.7-0.5-0.4-0.4-0.3-0.7-1.5-0.8-1.1-1-1.5-0.5-0.7-0.4-0.8-1 0.2-1 0.4-1.5 0-1.3-0.1-0.9-1.4-1.2-1.4-0.6-1.4 0-1.3 0.3-0.7 0.5-0.3 0.7-0.1 1-0.8-0.5 0 0.5 0.5 0.2 0.8 0.6 0.6 0 1.2 1.4 3.6 4.2 0.4 1-0.1 0.9-1.1 0.3-3 0.3-0.7 0.2 0.4 0.3 0.3 0.3 0 0.4-2.2 0.4-1.2 0.5-0.5 0.4-0.2 0-1.5-0.2-1.6 2.8-0.1 0.3-1-0.3-1-0.7-3.2-0.6-0.1 0-0.1-1-2.7 0 0.1-1.6-0.2-0.2-2.4 0.7-0.6-1-0.5-1.5 0.2-1.2 0.5-1-0.5-2.6-1.3 0.1-0.3-1.9 1.3-1.1 0.3-1.7-1.5-0.3-1.2 0.8-0.8-0.2-1.2-1.4-2.1-3.3 1.2-0.8 2.6-0.5 0.2 0.1-0.1 0.6 0.5 0.1 0.5-0.9 0.4-0.2 1.3 1.3 2 0.4 1.3 0.7 1.9 0.2 1.3 1.5 0.8 0.3 2-0.7 0.6-1.3-1.1-1.3 0.3-0.8 0.9-0.9-0.3-0.6-0.9-0.6 0.1-1.5-0.5-2.4 0.4-1.7-0.3-0.6-1.1-0.7 0.2-1.8-0.3-1.6-1.5-2.5-0.5-2.3 0.8-0.3 2.4 0.4 0.7-0.3 0.6-1 1-0.4 1.9 0.9 0.5-0.5-0.5-1.8 0.9-2-0.3-2 1.8-0.2 2.6-0.2 0.2-0.4-0.4-0.9 1.7-1.4 7.3 0.1 5.8 1.1 0.5-0.2-0.1-1 1.6-0.4 0.8 0.2 0.5 0.9 0.9 0.5 1.6-0.5 1.4 0.3 2.2-0.2 1.6 0.7 1.5 0.1 1.6 0.1 1 0.7 1.5 0.6 1.7 2.9 0.2 1.7-0.3 1.9-0.8 0.9-2.4-0.5-0.8 0.1-0.5 0.9-0.6 1.6 0.8 1.6 0 2.3 1.5 0.4 0.6 1.7 1.5 0.9 0.1 0.6-0.4 1.1z",
    POR: "M728.2 885.5l0.7-0.6 0.8 0 1.3 0.1 1.4 0.4 0.2 0.3-0.3 0-0.9 0.2-0.6 1.3-0.4 1.8-0.7 1.4-1.2 0.2-1-1.1 0.5-1.3 0.8-1.3 0.3-1-0.8-0.4-0.1 0z m6 3.1l0 0.4 0.3 0.3 0.4 0.5 0.3 0.2 0 0.6-3.8-0.6 0-0.5 1-0.4 1.2-2.1 0.6 0 0.5 0.4 0.1 0.5-0.2 0.3-0.4 0.4z",
    STH: "M711.3 880.9l0.1-1 0.3-0.7 0.7-0.5 1.3-0.3 1.4 0 1.4 0.6 1.4 1.2 0.1 0.9 0 1.3-0.4 1.5-0.2 1-0.9-1.1-5.2-2.9z",
    DOR: "M687.8 875.2l2.1 3.3 1.2 1.4 0.8 0.2 1.2-0.8 1.5 0.3-0.3 1.7-1.3 1.1 0.3 1.9 1.3-0.1 0.5 2.6-0.5 1-0.2 1.2 0.5 1.5 0.6 1 2.4-0.7 0.2 0.2-0.1 1.6 2.7 0 0.1 1-0.9 0-1 0.3-1.8 1-0.9 0.2-1.2-0.2-0.9-1.2-1.5-0.6-1-0.3-0.9-0.2-0.8 0-0.4 0-0.3 0.3-0.3-0.6-0.7-0.6-0.8-0.3-1 0-0.6 0-0.6 0.5-0.1 0.7-0.4 1-0.1 0.9-0.3 0.2-0.4-0.9-0.2-0.2-0.4 0.4-1.7 2.7 0.6-0.1 0.6-0.2 0.5-0.4 0.5-0.4 1 1.8 0.6 0.6 0.9 0.2 0.7 0 0.7 0.1 0.3 0.6-0.3 1.2 0.7 0.5 0.3 0.1-1.7 2 0.1 1.1-0.8 0.4-3.8 0.1-0.8-0.2-3.6-1.7-8.6-0.9-1.7-1-1 0.1-1.7 0.6-0.6 0.7-0.5 1.6-0.3 1.6 0.4 0.7 1.2 0.4 0.1 0.9-0.5 1.2-0.6 1-0.3 0-0.1-2.8-1-1.8-9.9-7.6-8-3-1.1-0.1-2.7 0.7-0.2-0.6 0.8-2.1-0.6-0.7 3-1.9-0.4-0.7-1.5-0.2-1.2-1 1.3-1.4 4.5-0.8 0.8-0.7 0.9 0.5 1.4-0.9 2-0.1 2.9-1.4 1.8 0.1 0.3-0.3-0.4-1.6 0.5-1 0.1-1.4 0.4-1-0.1-1.4 1.1-0.5 0.6 0.5 0.5-0.2 0.4-0.7-0.1-0.8 0.1-0.2 2.2 0.5 1.2 2.4 0.8 0.8 0.5-0.1 0.2-1.1 0.2-0.2 1.5 0.4 3-1.3-0.1-0.5-1.5-0.7 0-0.6 0.3-0.7 1.9-1.9-0.5-1.7 0.6-1.4 1.6 0.2 1.1 0.7 1.2 0 0.7 0.4 1.4 1.7 2.4 4.3 0.9 0.3 0.5 1.2 0.7 0.7 1.8-0.3 1.2-0.9 1.8-0.4 1.2-1.1 0.9 0.3z",
    BMH: "M689.2 892.9l0.3-0.3 0.4 0 0.8 0 0.9 0.2 1 0.3 1.5 0.6 0.9 1.2-1.8-0.4-1 0.1-0.9 0.3-0.9 0.5-0.1 0-0.3-0.1-0.8-0.2-0.3-0.5 0-1 0.2-0.6 0.1-0.1z",
    POL: "M684.3 894.7l0.3-0.2 0.1-0.9 0.4-1 0.1-0.7 0.6-0.5 0.6 0 1 0 0.8 0.3 0.7 0.6 0.3 0.6-0.1 0.1-0.2 0.6 0 1 0.3 0.5 0.8 0.2 0.3 0.1-0.8 0.6-0.7 0.9-0.5 0.4-0.2-0.6-0.1-0.7-0.1-0.4-1.8-0.5-1.2 0.1-0.4-0.1-0.2-0.3 0-0.1z",
    DEV: "M641.1 887.5l1.2 1 1.5 0.2 0.4 0.7-3 1.9 0.6 0.7-0.8 2.1 0.2 0.6-0.8 0.2-1.7 1.1-1.1 0.1-1.7-0.5-0.6 0.2-1 0.9-0.3 0.1-0.8 0.7-0.4 0.2-0.5-0.1-0.9-0.4-0.5-0.1-0.9 0.2-1.6 0.7-1.9 0.5-0.6 0.7-0.4 1-0.7 1-3.4 1.5-1-0.1-0.8-0.2-0.7-0.6-0.5-1.1-0.6-1.8-0.2-0.3-0.2-0.1-0.1-0.1-0.1-0.2-0.3 0-0.1 0.1-0.1 0.4 0 0.3 0.6 0.7 0.7 2.5 0.4 1-0.9 0.8-0.7 1-0.7 1.3-0.6 1.5-0.5 2 0 0.9-0.2 0-1 0-1.3 0-1.3 0-1.1 0.7-0.9 1.2-0.6 1.4-0.2 1.2-0.1 1.1 0.6 0.9 0.7 1 1.3 0.5 1.4 0.9 1.7 0.7 0.4 0.1-0.1 0.1-0.3 1.9-0.6 0.4-0.7-0.3-0.8-0.6-0.3 1.6-1 0.6-1.1 0.3-0.4 0.7-0.3 1.3-0.5 1.5-0.2 1.7 0.3 1.9-0.7 0.3-1.9 0.6-0.8 0.1-1-0.3-0.9-0.4-0.7-0.1-0.7 0.8-1.7-1.6-2.8-3.4-3-2.9-0.6-0.2-0.4 0.1-1.2 0.7-0.4 0.2-0.3 0.1-0.6 0.7-0.4 0.2-0.5-0.1-0.5-0.3-0.8-0.6 0.1-0.3 0.2-0.7-1-0.3-1.1-0.8-0.3-0.8 0.7-0.9 1.1-0.4 1.1-0.6 0.7-0.3 0.1-0.5 0-0.4-0.2-0.7-0.9-0.7-1-0.7-1.1-0.7-0.9-0.5-0.7 0-0.7 0-0.7 0.6-0.7 0 0 0.1-0.1 0 0.1-0.4 0.6-1 0.5-1.1-0.9 0.5-0.5-0.1-0.5-0.4-0.1 0.6-0.5-1-0.5 0.1-0.3 0.5-0.3-0.4 0.3-0.6 0.5-1 0.1-0.8 1.3 0 0.4-0.3 0-0.6-1-0.4-0.3-1-0.3-0.5-2.6-0.7-0.1-1.6-0.5-1.2-0.8-0.5 0.2-2.8-1.8-1.3-0.5-2.6-0.7-1.1-0.1-2-0.7-1.6 0.1-1.7-0.9-0.4-0.5 0.8-0.3-0.1-1.3-1.4-1.5-0.1-0.6-0.4 0.2-0.4 1.4-0.6 0.4-1.2 0.1-1.9 0.8-0.5 0.2-0.5-1.2-2.7-0.5-0.8-0.2-1.4-4.2-0.2 0.2-1.2 0.4-0.6 0.6-1.9-0.2-0.5-0.1-1.1-0.1-1 0.3-0.5 4.1 0 0.5 0.2 1 0.7 0.5 0.2 2.7 0.3 1-0.3 0.7-0.5 3.1-3.6 0.3-0.4 0.2-0.5 0.3-0.4 0.5-0.3-0.3-0.7-0.6-2-0.1-0.6-0.1-0.4-0.8-1.2-0.4-0.7 1.6 0.2 0.4-0.2 0.3-0.8-0.1-0.8-0.4-0.6-0.5-0.4 0-0.4 3.6-1.5 8.5-0.8 1.8-0.6 0.9-0.2 3.4 0 1-0.2 1.5-0.8 0.8-0.1 2.7 0.7-0.1 0.5 0 0.1-0.3 0.7 0.2 1.2-0.4 2-2.1 0.4-2.4-0.3-0.3 0.4 0.1 2.2 0.6 1 1.8 1.3 1.1 0.3 1.6 1.8 1.8 0.1 2 1.5 1.8-0.1 0.4 0.6-0.3 1.2-0.6 1.1 0.4 0.9 3.3 0.4 0.5-0.5 0.1-0.9 0.4-0.4 1.5-0.4 1.4 0.8 1.1-0.3 1 0.8 0.9 0.1 0.3 0.7 0.2 2 2.3 0.2 2.5 2.3 2.2 0.3 3-0.4-1 2.6 1.5 1.3 2.6-0.8 2 0.1 0.2 0.5-0.2 1.6 1 0.7-0.2 1.2 1.3-0.7 0.5 0.3 0.7-0.2 0.7 0.7 0.7 2.1z m-80.5-26.9l0.1 0.5 0 0.9-0.3 0.4-0.4-0.5 0-1.1 0.1-0.9 0.3-0.1 0.2 0.5 0 0.3z",
    TOB: "M614.4 920.4l-0.4-0.1-1.7-0.7-1.4-0.9-1.3-0.5-0.7-1-0.6-0.9 0.1-1.1 0.2-1.2 0.6-1.4 0.9-1.2 1.1-0.7 1.3 0 1.3 0 1 0 0.2 0 0 0.5 0.8 3.1-1 0.1-1.1 0.3-0.8 0.6-0.3 1 0.3 1.2 0.8 0.4 2.1-0.1 0 0.5-0.4 1.3-0.1 0.3-0.4 0.1-0.4 0.2-0.1 0.2z",
    PLY: "M583.1 916.8l0.1 0 0-0.1 0.7 0 0.7-0.6 0.7 0 0.7 0 0.9 0.5 1.1 0.7 1 0.7 0.9 0.7 0.2 0.7 0 0.4-0.1 0.5-0.7 0.3-1.1 0.6-1.1 0.4-0.7 0.9-0.1-0.3 0.6-1.4-1.7 0.2-0.5-0.2-0.6-0.4-0.3-0.4-0.2-0.6-0.4-0.8-0.4-1.2 0.3-0.6z",
    CON: "M566.1 880l4.2 0.2 0.2 1.4 0.5 0.8 1.2 2.7-0.2 0.5-0.8 0.5-0.1 1.9-0.4 1.2-1.4 0.6-0.2 0.4 0.6 0.4 1.5 0.1 1.3 1.4 0.3 0.1 0.5-0.8 0.9 0.4-0.1 1.7 0.7 1.6 0.1 2 0.7 1.1 0.5 2.6 1.8 1.3-0.2 2.8 0.8 0.5 0.5 1.2 0.1 1.6 2.6 0.7 0.3 0.5 0.3 1 1 0.4 0 0.6-0.4 0.3-1.3 0-0.1 0.8-0.5 1-0.3 0.6 0.3 0.4 0.3-0.5 0.5-0.1 0.5 1-0.1 0.2-0.3 0.5-0.5 0.3-0.6 0 0 0.4 0.7 0.5 0.2 0.7-0.2 0.8-0.4 0.6-0.6 0.2-2.3-0.2 0.8 1.1 2.7-0.4 1 0.8-1.6 0.4 0 0.5 0.4-0.1 0.9 0.1-0.3 0.6 1.3 0 0 0.5-0.5 0.1-0.4 0.4 0 0.5 0.2 0.5 0 0.5-1-0.1-0.5-0.9-0.4-1-0.8-0.5-4-1.1-2.2 0.3-3.4 2.1-1.8 0.7-7.7 0.5 0 0.1-0.1 0.2-0.3 0.2-0.2 0-0.7-2-0.3-0.1-0.3 0.2-0.2 0.3-0.3 0.1-1 0.1-0.9 0.3-0.5 0.6 0.3 1 0 0.5-0.3 0.3-0.4 0.5-0.4 0.5-0.2 0.5 0.1 0.4 0.2 0.5 0 0.3-0.5 1.4-0.1 0.4-0.5 0.5-2.3-0.4-0.9 0.4-0.8 1.1-0.9 0.4-2 0.7-0.6 0.7-1.9 3.3-0.6-0.9-0.3-2.6-0.6-0.5-0.9 0.3 0 0.6 0 0.8-0.6 0.8 0 0.5 0.3 0.2 0.7 0.8-0.4 0-0.3 0.1-0.5 0.4-0.5 0.4 0 0.5 0 0.6-0.2 0.5-0.4 0.4-1.5 0.6 0.5 0 0.4 0.1 0.7 0.4 0.2 0.1 0.5-0.1 0.3 0 0.1 0.4 0.1 0.9 0.2 0.2 0.2 0.6-0.6 1.4-1.3 2-0.5 0.1-0.9-0.2-0.6 0.1-0.3 0.3-1.4 1.6-0.5 1.8-0.2 0.3-0.4-0.1-0.5-0.4-1.4-1.6-0.2-0.3-0.2-0.5-0.2-1 0.1-0.5-0.1-0.6-0.3-0.7-1.3-2.2-0.8-0.9-0.9-0.7-2.8-1.3-1.9-0.4-1.6-0.9-0.8-0.4-0.9 0.1-1.3 0.4-0.9 0.8 0 1 0.3 1.3-0.5 0.9-0.8 0.7-0.7 0.4-1.9 0.6-2.3 0.2-1.8-0.6-0.5-2.3 0.5 0 0.3-0.2 0.2-0.3 0-0.4-0.1-0.4-0.1-0.2-0.1 0-0.3-1.3 0-0.8 0.1-0.4 0.1-0.2 0.9-1.5 0.4-0.3 1.3-0.5 3-1.7 1.6-0.6 1.8-1.2 1.1 0 1.4 1.4 1 0.5 0.9-0.6 0.7-1.1 0.3-0.7 0.2-0.7 0.2-0.3 1.7 0 1.7-1 5.4-5.6 1.7-1.2 0.7-0.2 0.1-0.4 0.1-0.9-0.1-0.9-0.3-1.5 0.5-0.3 0.7-0.1 0.4 0 3.2-1.7 0.1-0.4 0.5-1 0.4-2.9 0-1.5 0.2-1.3 0.4-1 1-0.7 0.9 0 0.4-0.3 0.6-0.7 0.3-0.1 0.3 0.4 0.2 0.9 0.1 1 0.1 0.8 0.3-0.2 0.1-0.1 0.2-0.2 0.8 0.5 2 0.1 0.7 0.4-0.5-1-0.8-0.5-1.5-0.6-0.8-0.9 0.1-0.7 0.2-0.6-0.2-0.8 0-0.4 1.2 0.2 3.4-0.2 1.4-0.5 0.7-1.1 0.6-1.3 0.7-1.2-0.3-1.1 0.2-0.8 0.5-0.4 0.6 0.2 3.3-2.8 0.6-1 0.3-1.3 0.9-1 2-1.5 1.2-2.5-0.2-6.6 0.3-1.9z",
    SOM: "M670.4 868.1l-0.6 1.4 0.5 1.7-1.9 1.9-0.3 0.7 0 0.6 1.5 0.7 0.1 0.5-3 1.3-1.5-0.4-0.2 0.2-0.2 1.1-0.5 0.1-0.8-0.8-1.2-2.4-2.2-0.5-0.1 0.2 0.1 0.8-0.4 0.7-0.5 0.2-0.6-0.5-1.1 0.5 0.1 1.4-0.4 1-0.1 1.4-0.5 1 0.4 1.6-0.3 0.3-1.8-0.1-2.9 1.4-2 0.1-1.4 0.9-0.9-0.5-0.8 0.7-4.5 0.8-1.3 1.4-0.7-2.1-0.7-0.7-0.7 0.2-0.5-0.3-1.3 0.7 0.2-1.2-1-0.7 0.2-1.6-0.2-0.5-2-0.1-2.6 0.8-1.5-1.3 1-2.6-3 0.4-2.2-0.3-2.5-2.3-2.3-0.2-0.2-2-0.3-0.7-0.9-0.1-1-0.8-1.1 0.3-1.4-0.8-1.5 0.4-0.4 0.4-0.1 0.9-0.5 0.5-3.3-0.4-0.4-0.9 0.6-1.1 0.3-1.2-0.4-0.6-1.8 0.1-2-1.5-1.8-0.1-1.6-1.8-1.1-0.3-1.8-1.3-0.6-1-0.1-2.2 0.3-0.4 2.4 0.3 2.1-0.4 0.4-2-0.2-1.2 0.3-0.7 0-0.1 0.1-0.5 3.4 0.9 3.8-0.1 5.8 1.4 1.4 1.3 0.9 0.4 5.4-0.2 3.3-1.1 1.7-0.2 3.1 0.2 1.9-0.3 1.3-0.9 0.3 0.5-0.6 1 0.6 0.6 0.8-1.6 0.2-0.5 0.1-1-0.1-0.5-0.2-0.4-0.1-0.7 0-2.8-0.1-1.4-0.6-0.9 0.9 0.3 0.5-0.2 0.1 0 0.1 0.3 0.5 0.4 0.1 1.4 0.9 0.2 1.3-0.6 1.8 0.9 0.3 0 0.2-1.1 2 0.5 2.3-0.2 0.1-0.2-0.2-0.3-1.2-1.1-0.1-0.3 0.3-0.3 3.8 0.3 0.8 0.2 2.1 0.6 0.3 0.7 1.1 0.3 0.2 0.8 0.6 0.4 1.4 0 1.1-1 1.3-0.3 2.2 0.8 0.2 1 1.4 0.2 1.7-0.7 0.8-1.2 2.8-0.1 2.6-1.9 0.5-0.1 0.6 0.8-0.4 0.7 0.2 0.8 1.3 0.8 0.3 1.6-0.7 1.5-0.7 2.6-3.8 6.8-0.2 1 0.2 0.7 1.2 0.9z",
    NSM: "M652.1 850.4l-0.8-0.2-3.8-0.3-0.3 0.3 0.1 0.3 1.2 1.1 0.2 0.3-0.1 0.2-2.3 0.2-2-0.5-0.2 1.1-0.3 0-1.8-0.9-1.3 0.6-0.9-0.2-0.1-1.4-0.5-0.4-0.1-0.3-0.1 0 0.2-0.7 0-1.2 0.4-0.7 0.7-0.7 0.3-0.7-0.8-0.7 1.1-1.1 1.5 0.3 1.7-1.7 3.2-4.2 0.8-0.7 0.8-0.5 0.9-0.3 1.2-0.1 0.3-0.1 0.4 0.3 0.8 0.9 0.9 0.6 0.8 0.4 1.1 0.9 0.7 0.9 0 1 0 0.9 0 1.3-0.1 0.9-0.1 0.5-0.1 1-0.5 1.4-0.4 0.4-0.6 0.2-0.6 0-0.5-0.3-0.5-0.6-0.3 0-0.3 0.8 0.1 1.2 0 0.5z",
    BST: "M655.8 845.8l0.1-0.5 0.1-0.9 0-1.3 0-0.9 0-1-0.7-0.9-1.1-0.9-0.8-0.4-0.9-0.6-0.8-0.9-0.4-0.3 0.6-0.3 1-1 0.8-1.4 0.1 0.3 0.5 0.5 1.4 0.9 1.8 0.9 1.2 0.8 1.2 0.4 0.8 0.1 0.5 0.6 0 0.8 0 1.4-0.1 1.5-0.1 0.3-0.2 0.8-0.6 1.1-1 1-2.1 0-1.3-0.1z",
    SGC: "M660.4 823.9l0.2 0 2.1 1 0.4 1.5 1.6-0.7 3 1 0.2 0.1-0.1 1.2-0.3 1.1 0.3 0.7 0.6 0 1-1.1 2 0.2-0.3-1.3 1 0 0.6 0.8-0.6 1.2 0 0.6 0.7 0.9 0.5 0.7-0.1 1.5 0.8 2.2-1.6 0.6-1.6 1.3-0.3 0.7 0.4 0.3 1.2-0.1 0.2 0.5-0.3 1.1 0.4 3-2.1 0.4-3.4 0.9-2.1-0.1-1.5 0-1.4-0.1-0.9-1 0.1-0.3 0.1-1.5 0-1.4 0-0.8-0.5-0.6-0.8-0.1-1.2-0.4-1.2-0.8-1.8-0.9-1.4-0.9-0.5-0.5-0.1-0.3 3.3-5.7 0.4-0.3 0.5-0.2 0.4-0.3 0.2-0.7 0.1-0.6 0.3-0.7 0.3-0.7 0.2-0.4 1-1z",
    NWP: "M640.5 827.3l0.7-0.2 0.7 0.2 0.4 0.1 1.2 0 2.9-1.8 0.9 0 0.7 0.4 0.5 1-0.4 0.7-0.9 0.8-1.4 1.2-0.3 0.8 1 0.9 1.6 0.7-0.8 0.6-2 0.7-4 0.3-0.6-0.2-0.4-0.6-0.2-0.5-0.3-0.2-0.4 0.3-1.2 1.5-0.3 0.5-2.7 1.8-0.1 0 0-0.2 0.5-0.9-0.1-0.3-1.3-0.5-0.3-0.8 0.8-1.4-1.1-1.3-0.1-0.5 0-0.1 2.7-0.9 1-0.5 2.8-1.5 0.5-0.1z",
    CRF: "M633.9 833.6l0.3 0.8 1.3 0.5 0.1 0.3-0.5 0.9 0 0.2-0.6 0.2-0.8 0.6-1.2 1.3-0.2 0.3-0.2 0.8-0.2 0.4-0.4 0.2-0.6 0.1-0.3 0.2-0.4-0.4-0.5-0.5-0.4-0.2-0.5 0-0.8 0.1-0.6 0-0.5 0-0.5-0.2-0.4-0.6-0.7-1.2-0.3-0.5 0.3-0.2 0.4-1 1.9-2 0.4-0.2 0.7-0.4 2.6-0.2 2.6 0.7z",
    VGL: "M625 836.9l0.3 0.5 0.7 1.2 0.4 0.6 0.5 0.2 0.5 0 0.6 0 0.8-0.1 0.5 0 0.4 0.2 0.5 0.5 0.4 0.4 0.6 1.6-0.4 1.6-0.8 1-0.9-0.3-0.7-0.1-3.3 1.4-11.7-1.1-0.9-0.5-0.8-1.1 0.1 0 0-0.1 2.2-1.1-0.8-0.9 0.4-0.3 0.8 0.2-0.3-1.4 0.2-0.8-0.1-1.1 2-1.4 0.2 0.1 0.5 0.3 0.5-0.7 0.5 0 0.7 0.7 1.2 0.2 0.5 0.6 0.9-0.8 2 0.5 0.1-1 0.3 0 1.3 1 0.1 0z",
    BGE: "M616.4 836.1l-0.2-0.1-2 1.4 0.1 1.1-0.2 0.8 0.3 1.4-0.8-0.2-0.4 0.3 0.8 0.9-2.2 1.1 0 0.1-0.1 0-1.4-1.9-2.7-2.3-0.7-0.1-0.8 0.4-1.1-0.5-0.9-0.9-0.5-0.8 0-0.3 0-0.1 0.2-0.1 0.1 0-0.3-1.5-0.2-0.4 2.9 0.6 2.4-1.3-0.6-2.1-1.4-1.3 0.1-0.6 0.6-0.7 0.3-2.3 0.3-0.4 3.1 0.5 1.8-0.6 1.2 0.6 1.6 1.3 1.3 2-0.3 3.6-0.3 2.4z",
    NTL: "M601.2 815.4l1.7 2 1.4-0.2 0.5-0.9 1.3 0.4 2.2-0.9 2.6 1.3 0.4 0.8-0.4 0.7 1 0.8 0.2 0.8-0.2 2.3 0.1 1.4 1 1.4 0.1 0.9-0.2 0-1.8 0.6-3.1-0.5-0.3 0.4-0.3 2.3-0.6 0.7-0.1 0.6 1.4 1.3 0.6 2.1-2.4 1.3-2.9-0.6-0.3-1-0.5-1.3-0.6-1-0.4-0.4-0.8-0.5-0.4-0.6-0.7-1.4-0.5-0.5-0.6-0.1-1.5 0.1 0.6-1.1 2.1-3.9-1.7-2-2.4-2.7-0.7-0.9 0.8-0.7 0.9 0.6 0.5-0.1 0.3-0.8-0.3-1.3 0.8-0.6 2.3 0 0.9 1.2z",
    SWA: "M595 817.1l0.7 0.9 2.4 2.7 1.7 2-2.1 3.9-0.6 1.1-3.5 0.5-0.7 0.3-0.6 0.4-0.4 0.4-0.1 0.7 0.4 0.8 0.5 0.7 0.3 0.7-1.9 0 0 0.1-0.3 0.4-0.2 0.1-0.2-0.4-0.1-0.3-0.3-0.2-0.4-0.2-0.3 0-0.1 0.1-0.5 0.8-0.2 0.1-0.3-0.1-0.5-0.4-1.1-0.2-0.5-0.1-0.5 0.3-0.5 0.4-0.6 0.8-0.5 0.3-0.5-0.1-0.5-0.4-0.4 0-0.2 0.8-0.6-0.1-2.7-1.1-0.9-0.1-0.1-0.3-0.1-0.2-0.1-0.5 0.9-0.7-0.1-0.8-0.5-1 0-1.1 1.6-0.5 0.2-0.3 0.5-0.9 0.3-0.4 0.3 0.5-0.3 0 0 0.5 0.3 0.2 0.4 0.4 1.4-0.5 2.4-0.2 2.2-0.5 1-1.7 0-0.5 0-0.4 0-0.2 1.4-2 0.2-1.4 0.6-0.8 0-0.9 0.7-0.8 0.8-0.2 0.6-0.7 2.1 0.4 0.1-0.1z",
    CMN: "M603.9 789.8l1.7 0.5 0.1 0.5-0.5 1.4 0.2 0.3 2 0.8 0.3 0.5 0.1 1.1 0.8 1-0.1 0.8-1.4 1.4-1 1.8-0.1 1.3 0.5 1.8-0.2 0.6-0.5 0.3-0.4 0.3-0.3 2.2 0.2 1.6-0.4 1.3-1.5 1.4-0.7 2.2-1.5 2.5-0.9-1.2-2.3 0-0.8 0.6 0.3 1.3-0.3 0.8-0.5 0.1-0.9-0.6-0.8 0.7-0.1 0.1-2.1-0.4-0.6 0.7-0.8 0.2-0.7 0.8 0 0.9-0.6 0.8-0.2 1.4-1.4 2-0.2-0.1-0.6 0.7-0.4 0.2-0.5 0.1-1.8-0.2-2.6-1.4-0.7 0.4-3.6 0.6-1.1-0.4-1.2-1-1.1-1.3-0.6-1.4 1.9 0.2 0.8-0.1 0.5-0.6-0.9 0-0.8-0.2-0.8-0.5-0.4-0.9 0.1-0.2 0.3-0.5 0.2-0.7 0-0.7-0.3-0.5-0.3 0.2-0.3 0.8-0.3 0.3-0.4 0.6-0.3 0.2-0.5-0.2-0.4-0.3-0.4-0.6-0.9 0.2-0.1 0.5 0.3 0.7 0.7 0.7-1.6 0.9-1.8 0.1-3.5-0.5-1.3 0.1-1.7 0.5 0-0.1 0.1-0.6 0-1.3 0-1.4 0-1.2-0.2-0.9-0.4-0.9-0.6-0.6-0.7-0.1-0.6 0-0.6 0.1-0.6 0.3-0.4 0.1-0.6 0-0.7 0-0.5-0.1-0.2-0.2 0-0.5 0.4-0.6 1.1-0.2 0.5-0.3 0-0.6-0.1-0.5-0.7-0.7 0-0.4 0.4-0.7 1.8-1.9 1-0.3 0.9 0 1 0.2 1.6-0.7 3.8-2.2 1-0.9 0-0.7-0.5-0.7-0.8-1.2-0.6-1.2-0.3-1.1-0.8-1 0.2-0.1 2.8 0.1 4 0.7 2 0 1.5-0.1 1.4-0.2 1.6 0 1.7 0 1.5-0.7 2-2.2 1.9-1.5 2.2-1.1 0.6-0.1 1.1 0.5 0.9 0.2 1.3 0 0.9-1 1.2-0.7 0.5-0.3 1 0.2 0.6 0 0.8 0 0.8-0.3 1.2 0.3 1.3 0.2 1.3 0.9 1 0 1-1.2z",
    PEM: "M565.6 796.2l0.8 1 0.3 1.1 0.6 1.2 0.8 1.2 0.5 0.7 0 0.7-1 0.9-3.8 2.2-1.6 0.7-1-0.2-0.9 0-1 0.3-1.8 1.9-0.4 0.7 0 0.4 0.7 0.7 0.1 0.5 0 0.6-0.5 0.3-1.1 0.2-0.4 0.6 0 0.5 0.2 0.2 0.5 0.1 0.7 0 0.6 0 0.4-0.1 0.6-0.3 0.6-0.1 0.6 0 0.7 0.1 0.6 0.6 0.4 0.9 0.2 0.9 0 1.2 0 1.4 0 1.3-0.1 0.6 0 0.1-0.3 0.1-1.6 1.1 0 1.9-0.5 0-0.1 0.2 0 0.3-0.1 0.5-0.8 2.2-0.5-0.2-0.6-0.5-0.3 0.2-0.8 0.9-4.2-0.1-0.7 0.1-0.8 0.5-0.4 0.6-0.3 0.7-0.5 0.5-0.9 0.4-0.3 0.7-0.5 0.2-0.2-0.1-0.5-0.3-3-1-1.2-0.9 0.5-0.8-0.7-1.4-2.3-0.6-0.9-1.1 0.3-0.5 3.6 0.5-0.1-0.2-0.2-0.6-0.1-0.2 0.7-0.1 1.3 0.5 0.6 0.1 0.7-0.2 1.5-0.9 2.3-0.5 1.1-0.8 0.5-0.1 0.6 0.4 0-0.5-1.3-1.3-0.3-1.9 0.8-1.5 1.8-0.5 0-0.5-0.5 0.3-1.4 0.6-2.6 0.3-0.6 0.3 0.8 0 0.5 0.3 0.2 0.7-0.2 1.1 0.6 0.6-0.1 0.9-0.7 0.7-3.7 0.9-1 0-6.5-0.9-0.8 0.4 0.4 1.2-0.5 0.6-0.7 0 0.1-0.8 0-0.5-2.3-1.8-0.9-0.2 1-0.1 0.7-0.1 0.5-0.4 0.5-0.7 0.7-0.7 1.6-0.3 0.8-0.4 0.7-0.7 0.2-0.8-0.3-1.9 0-1.1-0.2-1.2-0.4-0.9-0.7-0.6-0.3 0.5-0.8-0.7-1.9-0.3-0.8-0.5-0.7 0.5-2.6 0.5-0.9 0 0.3-0.3 0.3-0.2 0-0.5-0.1-0.4-0.1-0.2 0.1-0.3 0.5-0.2 0-0.5-0.4-1 0.4-0.4 1.7-0.2 0.9-0.3 1.4-1.5 0.6-0.3 1.5-0.2 1.9-0.7 1.4-1.3 0.2-2 0.7 0 0-0.5-0.6-0.4 0.1-0.6 0.5-0.3 0.8-0.2 1.2 0.1 0.6 0.1 2.5 1.4 0.9 0 1.3-0.6-0.3-1 0.9 0.1 1.8 0.8 1 0.1 0.4-0.3 0-0.7-0.3-0.9 0.1-0.7 0.3-0.3 1.6-0.2 0.9-0.7 0.7-0.8 1.1-1.9 0.9-1 0.6 0 0.6 0.5 0 0.2-0.2 0.7 0 1.1 0.1 1 0.6 0.2 0.6 0 0.8 0 0.6 0.1 0.4 0.6 0.5 0.4 0.7 0.3 1.1 0.2 1.1 0.5z",
    CGN: "M595.2 756.7l2.8-0.2 1.3 0.6 0.5 1.2-0.2 2.2 1 1.7 2.1-0.4 1-1.1 1 0.2-0.6 2.4-0.9 0.7-0.2 1.6 1.9 1.3 1.2 2.9 0.2 1.4 1 0.1 0.8 1.2-0.5 0.6-1.9 0.4-1.3 1.2 0 0.6 0.7 1 0 0.9 0.7 1-0.2 0.4-1.4 0.8-0.2 0.8 0.3 0.4-0.4 0.4 0 2.6-0.5 1.9 0.3 2.6-0.4 1.5 0.6 0.2-1 1.2-1 0-1.3-0.9-1.3-0.2-1.2-0.3-0.8 0.3-0.8 0-0.6 0-1-0.2-0.5 0.3-1.2 0.7-0.9 1-1.3 0-0.9-0.2-1.1-0.5-0.6 0.1-2.2 1.1-1.9 1.5-2 2.2-1.5 0.7-1.7 0-1.6 0-1.4 0.2-1.5 0.1-2 0-4-0.7-2.8-0.1-0.2 0.1-1.1-0.5-1.1-0.2-0.7-0.3-0.5-0.4-0.4-0.6-0.6-0.1-0.8 0-0.6 0-0.6-0.2-0.1-1 0-1.1 0.2-0.7 0-0.2 1 0.7-0.1-2.2 1.8-0.9 5.7 0.2 0.6-0.2 0.3-0.4 0.2-0.5 0.3-0.5 1.4-0.4 1-0.6 0.9-0.9 1.4-1.7 0.6-0.4 0.8-0.2 1-0.1 0.8-0.2 5.6-4.9 2.7-3.9 1.4-2.6 0.6-1.8 0.4-3.2 0.4-1.8 0.5-1.6 0.6-1.1-0.3-0.7-0.1-0.9 0.1-0.9 0.3-0.7 0.3 0 1.1 0.5 0.5 0.1 0.8-0.3 2.4-1.8 0-0.1 0.9-0.2z",
    GWN: "M616.6 732.8l-0.3 1.4-0.6 0.8-1.7 0.1-2.4 1.1-0.4 0.5-0.5 2.1 0.8 1.7 0.4 2.5-1.4 2.7-3.1 0.5-1.5 1-1.3-0.1-1.7 0.6-1.6-0.4-1.7 2.7 0.3 1-0.5 2.2-1.8 1.7-1.7 0.7-0.7 1.1-0.9 0.2 0-0.5-1.3 0-2.4 0.9-1.3 0.2-0.7-0.6-2.1-2.9-0.6-1.2 0.2-1.9 0.8-1.9 0.9-1.5 0.9-0.6 0.1-0.2 0.3-1.1 0.1-0.3 0.1-0.1 0.6-0.2 1.9-1.5 0.6-0.8-1.3 0.2-0.8 0.6-0.8 0.2-3.5-4.4-0.9-1.9-0.3-0.7 0.2-0.6 0.8-0.3 0.5-0.5-0.1-1.2-0.4-1.2-0.2-0.6 0-1.1 0.1-0.5 0.3-0.3 2.8-2-0.3-0.2-0.2-0.1-0.1-0.3-0.6 0.6-0.5 0.4-0.5-0.1-0.3-0.9-1.2 0.9-1.3 0.1-2.7-0.4-3.4 1-0.7 0.5-1 0.6-3.2 0-1 0.5-0.9 0.8-1.6 1.9 0.1 0.2 0.1 0.3-0.7 0.5-0.4 0.9-0.1 1 0.6 0.8-0.6 0.6-0.3 0.3-0.4 0.2-0.5-0.1-0.7-0.8-1-0.4-0.9-0.7-0.5-0.2-0.6 0.2-0.3 0.3-0.3 0.3-0.3 0.3-1.1 0.3-2.6-0.3-0.7 0.4-0.6 0.8-0.7 0.3-0.7-0.4 0.5-0.8 0-0.3-0.2-0.5 0.3-0.4 0.7-1.2 6.5-7.6 0.7-0.4 0.9-0.1 0.9-0.3 0.9-0.5 3.7-2.9 1-1.6 3-2 0.4-1 0.2-1.4 0.1-3.3 0.1-0.9 0.4-0.3 0.3 0.2 0.1 0.5 0.2 0.5 0.4-0.6 0.3-0.9 0.1-0.4 1.9-2.2 0.5-0.4 0.8-0.4 0.7-0.8 0.9-2.1 1.1-1.3 1.2-0.8 1.4-0.4 1.5-0.1 0.4 0.1 0.3 0.2 0.4 0.1 0.6-0.4 1-0.5 1.1-0.3 0.4-0.3 0.3 0.2 3.1 3.5-1.1 3.5-1.2 2.1-1.3 1.5-0.2 0.8 0.1 0.9 0.7 1.1 0.7 1.1 0.4 1 0 1.3-0.5 1.2-0.2 0.6 0.2 0.9 0.5 0 1.1 0 0.9-0.5 0.9-0.2 0.5-0.3 0.4 0.5 0.2 1.2 1.1 1.8 1.8 1.5 1.6 0.6 0.9-1 2.2-1.1 1.8-1.4 0.6-0.5 3.2-1.4 0.5 0.2 0.2 0.5-0.3 1.2 1.2 1.3 2.3-0.3 1.1 0.4 1.5-1 0.3-0.1 1.4 0.4 0.1 0.2-0.5 0.9-2 2 0.4 1.2 0.6 0.1 0.3 0.5-0.1 0.6-0.8 0.7-0.1 2.4z",
    CWY: "M617 723.9l-1.5 1-1.1-0.4-2.3 0.3-1.2-1.3 0.3-1.2-0.2-0.5-0.5-0.2-3.2 1.4-0.6 0.5-1.8 1.4-2.2 1.1-0.9 1-1.6-0.6-1.8-1.5-1.1-1.8-0.2-1.2-0.4-0.5-0.5 0.3-0.9 0.2-0.9 0.5-1.1 0-0.5 0-0.2-0.9 0.2-0.6 0.5-1.2 0-1.3-0.4-1-0.7-1.1-0.7-1.1-0.1-0.9 0.2-0.8 1.3-1.5 1.2-2.1 1.1-3.5-3.1-3.5-0.3-0.2 1.2-1 5.1-2.2 1.6 0-0.5-1.4-1.3-1.4-0.4-1 0.9 0.1 0.9 0.3 0.8 0.5 0.6 0.7 0.9-0.5 1 0.4 1 0.9 0.8 1.1 0.7 0.5 5.4-0.2 1.8-0.4 2.3-1.1 0 0.1-0.1 1.3 0 1.8-0.1 0.6 0 0.8 0.6 0.7 0.6 0.7 0.7 1.5 0.1 1.5 0 1.9-1.1 2-4.1 4.4 1.8 0.5 1.4 0.1 0.6 0.5 1.3 1.3 0.4 1.8 0.1 1.9 0.2 2.5z",
    DEN: "M621.8 694.7l-0.1 0-0.2 0.5 0.1 0-0.5 0.9-0.3 2.8 0.3 0.5 1.2 0.5 0.4 0.9 0 0.9-0.3 1.2 0 1.2 0.3 0.9 0.7 1.1 1.3 2.3 1.3 1.5 0.9 0.4 0.9 0 0.9 0 1 0.3 0.4 0.7 0.7 1.7 1.1 2.2 1 1.7-0.4 0.6-0.5 2.9 0 1.9 0.6 0.9 0.9 0.7 0.7 1-2.5 1-2.4 1-1.7 0.2-2.2 0.1-1.3 0.1-1.5 1.5-1.4 1.9-0.8 1.7-2.2 0.8-1.6-0.4 0.1-2.4 0.8-0.7 0.1-0.6-0.3-0.5-0.6-0.1-0.4-1.2 2-2 0.5-0.9-0.1-0.2-1.4-0.4-0.3 0.1-0.2-2.5-0.1-1.9-0.4-1.8-1.3-1.3-0.6-0.5-1.4-0.1-1.8-0.5 4.1-4.4 1.1-2 0-1.9-0.1-1.5-0.7-1.5-0.6-0.7-0.6-0.7 0-0.8 0.1-0.6 0-1.8 0.1-1.3 0-0.1 6.6-3.3 0.6 0z",
    WRL: "M642.1 698.3l-0.1 0.2-0.3 0.7-0.5 0.3-1.3-0.6-2.4 0.3-2-1-1.3 1.5-0.7-1.2-1.2-2.5-1.7-2.2-0.6-1.2-0.1-1.2 0.5-0.8 0.9-0.5 2-0.3 0.9-0.3 1.7-1.4 1.1 0.1 1.1 1.3 2.8 7.3 0.8 1.1 0.4 0.4z",
    HAL: "M658.8 697.7l-2.7 1.4-3.2-0.2-1.8 0.4-1.9-0.6 1.3-0.8-0.3-1 0.1-0.7 0.4-0.5 0.4-0.5 0.4 0.2 0.4-0.1 0.4-0.2 0.4-0.5-0.6 0-2.4 0.5-0.5 0.4-0.3 1.1-0.9 0.4-0.5 0 0.1-0.6 0.3-1.2 0.7 0.6 0.3-0.4 0.4-0.6-0.1-0.9 0.1-0.3 0.9-1.1 0.6-0.8 2.8 0.8 0.9 1.7 1.5 1.2 0.8 0.1 0.3 0.2 0.7 1 0.5 0.8 0.5 0.2z",
    KWL: "M650.2 692.5l-0.9 1.1-0.1 0.3 0.1 0.9-0.4 0.6-0.3 0.4-0.7-0.6-0.3 1.2-0.1 0.6-1.5-0.2-1.5-0.6-0.1-3.3 0.2-1.9-1.2-0.7-0.3-1 0.9-0.9-0.6-2.7-1.6-2.2 1.2-0.9 0.5-1.4 1.5 0.3 1.2 0.7 1.1 1.5 0.5 1.9 0.5 2.9 0 2.1 1.9 1.9z",
    LIV: "M641.8 683.5l1.6 2.2 0.6 2.7-0.9 0.9 0.3 1 1.2 0.7-0.2 1.9 0.1 3.3-0.5-0.2-1.8-1.2-1.5-1.7-1.1-1.7-3.2-6.9 2-0.3 1.7-0.2 1.7-0.5z",
    SFT: "M643.5 681.2l-0.5 1.4-1.2 0.9-1.7 0.5-1.7 0.2-2 0.3-2.3-5-0.2-1.1 0.1-1.1 0.6-1.3 3-5.1 2.5-3.3 0.4-0.2 0.4-0.9 0.2-0.1 0 0.1 0.1 0.3 0.6 3.5-1.4 2.7-1-0.3-0.5 0.3-0.1 1-1 1.6 0.3 1.3-0.2 0.9-0.7 0.4 0 1.5 3.4 2-0.4-1.9 0.1-0.4 0.5 0 2.1 1.6 0.6 0.2z",
    LAN: "M646.3 630l0.1-0.1 1.1-0.4 0.9-1.4 2.8 0.6 1.1 1.5 1.8 0.5 0.4-0.3 0.2-1 1.4-2 2.4 0.3 2.1-1 3.5-2.4 0.4 0.6-0.2 1.1-2.8 3.6-0.3 1-1.3 0.7-0.2 1.8 0.3 1.2 1.2 1.3 2.4 1.4 0.4 0.6 0 2 0.5 0.6 1 0.1 2.2-0.6 1.2 0.3 0.3 0.4 0.1 1.2 0.4 0.3-0.5 1.3 0.6 0.9 1.7 0.1 0.6 1.5 0.6 0 2.1-1 0 0.8 0.3 0.4 1.5 0.2 0.5 0.9 0.2 1.4 3.3 1.7 0.3 2.1 1.5 2.1 1.6 1.2-0.2 1.1-0.5 0.7-2.3 1.1-1.1 1.5-0.1 2.9-1.8 2.4 0.5 1.6-0.1 0.6-3.5 2-0.9 0.8-0.4 1.2 0.1 2.1-0.3 0.5-0.8-1-0.2-3.1-0.6-0.1-1.7 0.7-1.2-0.7-0.1 0.2-0.3-0.8-0.8-2.6-0.9-2.4-0.9-2.2-1.3-0.6-1.1 0.3-1.2 0.6-0.8 0.7-0.6 1.2-0.1 1.4-0.1 1.9 0.1 1.6 0 1.7 0.7 1.5 0.4 0.6-2.6 2.2-0.8-0.9-0.6-0.2-1.3 1.4-0.3 0-0.5-0.9-2 0.4-0.5 0.2-0.4 1.9 0.2 1.2-0.6 0.9-0.4 1.5-1.8 1.5-0.7-1.3-0.5-0.1-1.1 0.9-0.3 0.6 0.1 1.3-0.5 0.2-1.1-1.5-1.2-0.7-1.5-0.3-0.6-0.2-2.1-1.6-0.5 0-0.1 0.4 0.4 1.9-3.4-2 0-1.5 0.7-0.4 0.2-0.9-0.3-1.3 1-1.6 0.1-1 0.5-0.3 1 0.3 1.4-2.7-0.6-3.5-0.1-0.3 0-0.1 1.7-1.2 0.6-0.8-4-0.1-1.7-0.8 3.1-4.9 0.4-3.1-1-3.9-2.4-2.8 4.3-1.7 0.8-0.1 0.6 0.5 0.4 0.1 0.1-0.3 0.2-0.5 0.4-0.4 0.4-0.3 0.3-0.2-0.5-0.9 1.6-1.6 0.2-1.3-0.8 0.6-0.8 0.3-1.4 0.2-0.3-0.2-0.7-1.8-0.1-0.6 0.3-0.4 0.5-0.4 0.4-0.4 0.9-1.8 0.7-0.7 1.5-0.6 0.5-0.8 0.9-2.1-0.8-1.2-1.1-2.2z",
    BPL: "M637.8 648.8l2.4 2.8 1 3.9-0.4 3.1-3.1 4.9-1.3-1.8-0.4-2.7 0.6-6-0.6-2.2 0.8-1.4 1-0.6z",
    SAY: "M569.9 549.8l-1 0.5-2.3-0.8-0.6 0.2-2.8 1.5-1.7 1.7-0.2 1 0.3 1.8 1.2 0.7 0.1 0.6-0.1 0.7-0.5 0.6-3.3 1-3 0-0.5 0.5-1.2-0.7-3.3 0.6-0.5 0.6-0.3 1.2-1.2 1.2-0.5 0.1-1.6-0.7-1.3-0.1-2.1 1.2-0.1-0.1-0.6-1.7-0.2-0.9 0-1.8 0.1-0.6 0.2-0.7 0.9-2 0.3-1.1 0.1-1.7 0.4-1.5 0.9-0.9 1.9-1.3 3.1-4.1 0.2-0.2 0.5-0.1 0.1-0.3 0-0.9 0-0.4 1.1-2.8 0.2-0.7 0-0.8-0.1-1.8 0.1-0.8 0.2-0.5 1.6-1.9 0.8-0.7 0.4-0.5 0.3-0.8 0.4-1.9 0.4-1 1.5-1.4 3.1-1.5 1.2-1.6 0.4-2.3-0.4-1.9-1.2-1.5-1.7-0.6 1-1.5 0.4 0.1 0.4-0.1 1.8-1.1 1.4-1.3 0.7 0.8 1.7 0.7 1.8 1.4 2.3 1 0.7 2.2 0 1.6-0.2 1.3-1.2 1.3-1 0.8-0.2 1 0.3 1 0.5 0.8 0.2 1 0 1.4-0.2 0.7-0.9 0-1.4-0.6-1.4 0-1.1-0.2-0.5 0.6 0.1 0.6 0.8 1.4 0.5 1.2 0.7 0.9 1.4 1.1 1.4 1.2 1 1.3 0.4 1.1 0.1 1.3 0 2 0 1.5-0.1 1.8-0.5 1.4-0.6 1.6 0 0.6z",
    NAY: "M564.6 514l-1.4 1.3-1.8 1.1-0.4 0.1-0.4-0.1 0-0.1-0.2-1.7-1-1.7-1.4-1.2-2.6-1.1-1.5-0.1-0.4-0.3 0.3-0.8 0-0.6-2.7-1.8-1.5-1.4-0.9-1.3 2.1-2.2 0.7-1.8-0.2-2.8-0.3-1-0.3-0.7-0.2-0.9-0.3-3.6 0-0.1 0.1 0 1.6-0.4 2.5 0 1.1 0.1 1.1 1 0.7 2 1 1.8 2.2 2.4 1.6 1.4 2.6 0.2 1.7-0.1 1.2 0.2 0 0.3-0.7 1.1-1.2 2.6-1.6 1.9-1.2 1.2-0.4 1 0.7 0.6 1.1 0.2 1.4 0 1.1 0 1.5 0.8 0 0.8-0.4 1.2-1.5 1.1-1.6 1.2-0.2 0.2z",
    IVC: "M556.6 491.9l-1.1-1-1.1-0.1-2.5 0-1.6 0.4-0.1 0-0.2-2.3 0.3-2.2 0.7-1.5 1-0.9 1.5-0.6 0.9-0.2 0.6 0.1 3 1.4 0.8 0.1 0.5-0.2 1 0.6 2.2 0.3 0 0.1 0.3 1.3 0.7 1.3 0.7 1.4 0.3 1.5-0.2 1-1 0.7-0.9 0-1.2 0-1.1-0.1-1.3-0.1-1.1-0.3-1-0.6-0.1-0.1z",
    RFW: "M567.6 499.8l-1.2-0.2-1.7 0.1-2.6-0.2-1.6-1.4-2.2-2.4-1-1.8-0.7-2 0.1 0.1 1 0.6 1.1 0.3 1.3 0.1 1.1 0.1 1.2 0 0.9 0 1-0.7 0.2-1-0.3-1.5-0.7-1.4-0.7-1.3-0.3-1.3 0-0.1 5.6 0.9 0.8-0.5 0.4 0.4 0.8 0.5 1.1 0.9 2 1.7 2 1.6 0 1.1-0.1 1.6 0 1 0 0.1-1.3 0.8-2.6 1.9-2.3 0.9-1.2 0.8-0.1 0.3z",
    WDU: "M563.8 473.4l1 0 1.3 0.4 1.3 0.1 1 0.8 2.5 0.8 0.9 0.7-0.1 0.3-1.9 1.1-0.1 0.9 0.6 1.2 1.3 0.4 1.1 1.9 0.8 0.3 1.2-0.3 0.1 3.5 0.2 1.8 0.3 0.6-0.1 1.4 0 1.6 0 0.4-2-1.6-2-1.7-1.1-0.9-0.8-0.5-0.4-0.4 0.4-0.2-5.1-1.1-0.1-0.3-0.3-1.3-0.1-1.7 0-0.1 0-0.8 0-0.8 0-0.1 0.1-0.8 0-0.6 0-0.6 0-3.1 0-1.3z",
    AGB: "M561.9 440.2l-1.3 1-1.6-0.1-1 0.6 0 0.3-0.2 1.1-2.1 0.9-1.5 1.6-0.2 0.7-0.1 0.6-1.3 1.9 0.2 0.6 2.7 1.7 0 0.3 0 0.3-0.3 0.8-0.1 0.3 0.2 0.4 2.5-0.7 0.3-0.1 0.7 0.1 2.6 0.5-1 1.7 0 0.3 0.1 0.6 0.5 0.7-0.2 0.3-0.6 0.6-0.2 1.2-0.1-0.1-0.2 0.8 0.1 1.7 0 0.1 0 0.2 0.1 2.2 0.7 2.2 1.6 4 1 3.1 0.6 0.8 0 1.3 0 3.1 0 0.6 0 0.6-0.1 0.8 0 0.1 0 0.8 0 0.8 0 0.1 0.1 1.7 0.3 1.3 0.1 0.3-1.9-0.4-2-1.3-2.4-3.1-1.9-0.7-0.9-0.9-0.7-1.1-0.6-1.1-0.6-2.5 0-0.4-0.7-0.2-0.2 0.6 0 0.9 0.3 1 2.2 3.4 0.5 1.5-0.3 0.7-0.8 0.2-1.2-0.1-1.1-0.4-0.5-1.2-0.1-1.5-0.1-3.2 0.1-0.7 1.8-4.9 3.3-5.4 0.2-1.2-0.2-0.3-0.5 0.4-0.6 0.9-2.7 5.6-0.7 1-1 0.1-0.3-0.7 0-2.6-0.2-1.1-0.4-0.9-0.7-0.2-0.6 0.8 0.5 1.5 0.7 2.9 0.4 2.9-0.1 1.3-0.6 0.3-0.1 0.6 0.2 1.7 0 1.6 0.1 1.2 0.2 0.9-0.6 0.4-0.7-0.3-0.8-0.4-0.8-0.2 0 0.5 0.6 0.3 0.6 0.4 0.5 0.7 0.2 1-0.2 1.2-0.4 0.8-0.6 0.7-0.4 0.7-0.2 1-0.1 0.8-0.2 0.8-0.5 0.8-0.6 0.8-0.6 0.1-1.5-0.4-0.7-0.9-0.7-2.1-0.5-2.4-0.1-1.7-1.9-2.5-0.3-1.1-0.3-0.7-0.8 0.6 0.8 1.4 1.8 4.6 0.3 1.7-0.4 0.8-0.9-0.3-3.1-2.5-0.4-1.1 0-1.8-0.5 0.7-0.4 1.1-0.3 1.1-0.1 0.9-0.2 0.6-1.4 2 1.2 2.4 0.4 1.3 0.4 1.5-0.9 0-2.1-1.2-1.5-0.6-0.5-0.7-0.3-2.1-0.3-0.3-0.4-0.2-0.3-0.4-0.2-0.6 0-0.8 0-1.5 0.1-0.6 0.5-1 0.1-0.7-0.1-0.7-0.6-2.4 1.2-1.4 5.1-9 2.7-1.1 2-1.6 0.4-0.4 1.7-3.9 0.7-1.1 1.5-1 1.7-0.7 1.7-1.3 0.9-2.2-0.8 0.6-1.8 1.9-0.7 0.4-2 0.2-0.7 0.3-0.8 0.7-0.5 1-1.1 3-0.4 0.6-5.6 3.8-3.9 6-0.4 0.3-0.9 0-0.3 0.3 0 0.4-0.2 1.2-0.3 1-0.2-0.1-0.4 1-1 0.3-1.2-0.1-0.8-0.3-0.1-0.4 0-0.7-0.1-0.5-0.3 0.2-0.2 0.4 0 0.5 0 0.6-0.3 4.5 0.1 0.2 0.7 0.3 0.3 0.1 0.5 1.7 0.2 0.9 0 0.8 0.2 0.7 0.5 0.5 0 0.5-0.3 0 0 0.6 0.2 0.1 0.5 0.4-0.3 0.2-0.2 0.3-0.2 0.1 2.6 2.9 1.2 2 0.4 2.1-0.3 1.1-0.7 0.6-1.6 0.5-0.7 0.5-2.1 2.5-0.6 0.7-0.4 1-0.3 1-0.1 0.7-0.2 1.4-0.1 0.7-1 0.8 0.1 0.4 0.2 0.3 0.1 0.3-0.1 1.9 0.4 0.5 0.6 0.1 0.4 0.9-0.3 1.1-0.8 0.3-0.5 0.5 0.3 1.5-1 2-0.3 0.8 0 0.4 0 1.6-0.1 0.7-0.1 0-0.2-0.1-0.2 0.2-1.1 2.8-0.7 1.1-1.1 0.7 0 0.5 0.6-0.1 0.4 0.2 0.5 0.4 0.4 0.7 0.8 1.8 0 0.4 0.6 0.5-0.5 1.3-1.6 2.2-0.7 0.8-1 0.7-1 0.5-1.1 0.3-0.5-0.1-0.9-0.5-0.5-0.1-0.5 0.3-1.1 0.8-0.5 0.1-1.4 0-0.8-0.3-0.5-1-0.6-3.6 0-1.8 0.2-1.6 1.3-1.2 1.8-2.1 0.4-0.8 0.1-1.7-0.3-1.9 0-1.9 0.6-2.4-0.2-0.6-0.3-0.6-0.1-0.6 0.1-0.9 1.1-2.5 1-2.9 0.2-1.6-0.5-1.2 2.5-2.2 0.4-0.9 0.2-1.1 0.7-1.5 0.8-1.2 0.7-0.5 1.3-0.6 1.6-1.5 1.5-2.2 0.9-2.5-4.6 5.1-1.6 1.4-0.6 0.3-0.6 0 0.3-1.1-1.3-0.5-0.6-0.4-0.7-0.8-0.3-1.1-0.1-2.3-0.2-0.6 2-3 0.3-0.7 0.3-1.1 0.7-0.9 0.8-0.8 0.7-1-1 0.6-1.6 1.9-1.3 0.6-0.8 0.9-0.4 0-0.4-0.5-0.2-1-0.1-0.9 5.1-8 0.4-1.1-0.2-0.4 0.3-0.3 0.2-0.4-0.6-0.2-0.6 0.3-0.6 0.6-0.7 0.4-0.3 1.6-2 2.3 0 1.9-0.8 1.5-0.2 0.2-0.4-0.1-0.2-0.5 0.1-0.6 0.2-0.5 0.2-2.2 1.8-3.5 3.5-5.1 0.1-0.3 0.1-0.4 0.1-0.4 0.3-0.1 0.3 0 0.4 0.2 0.3 0.2 0 0.1 0.1 0.2 0.4 0.3 0.4 0 0-0.5-0.2-0.5-0.3-0.3-0.3-0.2-0.1-0.2-0.3-1.3-0.1-0.7 0.2-0.6 1.5-2.3 0.3-0.8 0.3-1.2-1.4 0.5-1.1 1.3-0.9 1.4-1.1 0.9 0.3-1.7 0.6-1.7 0.8-1.7 0.9-1.3-0.4-1.1 0.5-0.9 1.1-0.6 0.9-0.2 0.5-0.3 0.1-0.6-0.3-0.6-0.6-0.3-2 0.6-0.4 0.3-0.5 0.5-0.4 0.5-0.5-0.1-0.2-0.8 0.1-0.9 0.5-1.8 0.6-3.1 0.4-1.1 0.9-1 0.9 0.5 1.2-0.1 2.4-1 0-0.5-1.1 0-2.1 0.7-1-0.2 0.9-2.8 0.4-0.7 0.5-0.3 0.6-0.3 0.4-0.4-0.2-0.7 1.2-1.7 1.5-0.8 4.7-0.4 3.8 1.1 1.6-0.4 1.3-1.1 2.9-4.1 1.6-3.4 0.9-1.4-1 0.5-0.6 1.3-0.5 1.5-0.7 1.3-1.9 1.8-1.1 1.8-0.5 0.5-2 0.3-5-1.2-1.3 1.2-0.8-0.6-0.8-3.2-0.6 0.3-0.5 0.8-0.9 1.8-0.7-0.5 1.7-4.1 0.2-1.2 1.2 1.1 1.1 0.5 1.1-0.1 0.8-0.3 2.3-1.8 1.2-0.5 0.5-0.5 0.5-0.7-1.5 1-0.6 0.1-0.9-0.1-0.2 0.1-0.8 0.6-0.5 0.2-1 0.9-0.6 0.1-0.5-0.2-0.8-0.9-0.6-0.1 0.1-0.6 0.2-0.3 0.2-0.2 0.3-0.3 0.2-0.4 0.1-0.8 0.2-0.3 1.2-2.3 0.4-0.6 1.9-1.8 0.3-0.5 0.3 0 0.1 0 5.9 0.8 1.2 1.2 3.3 0.8 0.6-0.9 1.1-0.5 0.8-1.5 2.3-0.3 2.2-1.3 1.1 0.2 0.3 0.1 1.4 0.8 3.5-0.6 1.3 0.8 0.2 0.1 2.2 0.2 0.1 0 1.7 0.1 1.8-0.8 0.6 0.2 0.2 1.3-0.5 0.7 0 1 1.3 0.3 0.2 0.1 0.6 1 1.2 2.1-0.3 0.6-0.5-0.3-1-0.6-4.5 2.2-0.1 0.2 0 0.2 0.3 0.5 1.3 0.3 0.3 0.4 0.2 0.2 0 0.7-1.3 2.3 0.1 0.7 0.5 0.6 1.2 0.4z m-20.2 80.6l-1.1 0.7 0.1 1.1 0.5 1.3 0.1 1.4-0.6 0.7-1.2 0.6-2.2 0.4-2.5-0.3-2.2-0.8-1.9-1.2-1.9-1.7 0-0.5 0-0.6-0.5-2.2-0.2-0.6 0-0.6 0.3-0.2 0.1-0.2 0.1-0.3 0.2-0.4-1.2-1.6-0.9-1.7-0.4-2 0.3-2.7 0.6-1.8 1.1-1.7 1.5-1.3 1.6-0.3-0.1-0.3-0.2-0.6-0.1-0.3 1.3-0.1 0.3 0.1 3.1 1.5 0.8 0.8 1 1.6 0.6 1.7 1 4.1-0.6 1.2 2.1 2.1 0.1 1.8-0.5 0.3-0.7 0-0.4 0.3 0.3 1.1 0.3 0.3 2 0.9z m1.9-19.9l0.5 0.3 0.3 0.7 0.1 0.7-0.3 0.5-0.6 0-0.4-0.8-0.6-1.4-3-2.9-0.5-1.4-0.6-2.3-0.1-1.1-1.6-1.1-0.3-0.7-0.4-1.2-0.5-1.5 0-1.3 1.6-0.8 1.4 1.2 1.4 1.6 0.5 0.3 0.4 0.1 0.3 0.2 0.3 1.9 0.3 0.4 0.4 0.2 0.4 0.4 0.6 1.1 0.4 1.1 0.4 1.1 0.4 2.6 0 0.5-0.3 0.4-0.5 1.2z m-46.9 1.7l-0.1 0.9 0 1 0.2 0.8 0.2 0.7 0 0.5-0.5 0.3-0.5 0.3-0.4 0.5-0.2 0.7-0.3-0.6-0.8 1.3-1.1 1-1.2 0.7-1.4 0.4-2-0.3-0.6 0.3-0.3 1.7-0.2 0.4-0.5 0.5-1.1 0.9-1.2 0.5-1.1-0.4-0.7-1.9 0.3-1.8 1-1.2 2.5-1.5-1-2.9-0.6-0.7-1.8-1-0.4 0 0.2-1.5 1.2-1.5 2.1-2.1-1-0.5-1.3-0.2-1.4 0.2-0.9 0.8-1.1 2.9-0.7 1.3-1.5 1.1-1.5 2.2-0.6 0.7-1.3 0.2-0.6-0.7 0.1-1.4 0.6-1.5-0.2-0.1-0.2-0.4-0.3-0.1 0.5-1.4 2.1-3.1-1.6-1.1 0.7-0.6 0.3-0.5 0.2-0.8 0.1-1.3 0.1-1 0.4-0.7 1.7-1.2 2.5-1.2 0.6-0.6 0.5-0.4 0.6 0.2-0.3 0.6-0.6 2.3 0 0.6 0.3 1.5 0.4 0.6 0.6 0.1 0-0.5-0.4-1.7 1-1.8 1.5-1.5 1.7-1 1.2-1.7 0.6-0.3 0.6-0.2 0.7-0.4 0.6-0.6 0.5-0.5 0.4 0.1 0.3 0.4 0.2 0.5 0.2 3.5 0.6 4.7 0.2 2.5 0.3 0.8 0.6 0.8 0.7 0.7 0.5 0.3 0.2 0.3-0.1 0.7-0.2 0.7-0.1 0.5 0.2 0.5 0.3 0.3 0.8 0.4z m-8.2-31.3l0.3-0.2 0.8 0.3 0.4-0.4-0.2-0.3-0.1-0.2-0.1-0.6 0.8-0.1 0.7-0.3 0.6 0 0.2 1-1.5 2.6-0.6 1.7 0.2 1.5-1 0.7-1.3 0.4-1.2-0.1-1-0.5 0.7-0.6 0.4-0.9 0.2-1.2 0.4-1 1-1.3 0.3-0.5z m19.1-0.8l2.4-2.4 1.4-1 1 0.5 0.2 0.8 0.1 1.2 0 1-0.8 0.7-0.7 1.3-0.9 1-1.9 4.6-3.9 7.9-1 3.3-0.5-0.1-1.2 1.4-0.8 0.4-0.3 0.7-0.5 3.2-0.3 1.3-1.2 0.8-1.8-0.1-1.7-1.1-0.7-2.1-0.4-4 0.1-1.5 0.4-1.3 0.7-0.6 0.8-0.4 0.8-0.8 1.4-1.2 3.6-0.7 1.6-1.3-1.2-0.1-1.7 0.5-1.6 0.1-0.7-1.4 0.6-1.9 1.3-2.1 1.5-1.8 0.9-0.8 1.4-0.4 3.6-3.6z m5.1-7.5l0.4 0.6 0.3 1.3-0.9 0.9-1.5 0.5-1.1 0.1 0.5-1.3 0.7-0.8 1.6-1.3z m2.6-5.2l0.3 0.3 0.2 0.2 0.2 0 0.3-0.5 0.1 1.2-0.4 1.2-0.5 1.2-0.4 2.7-0.5-0.5-0.9-2.3 0.5-0.8 0.5-2 0.6-0.7z m0-4.6l0.6-0.5 1.1 0.2 0.6-0.3-0.3 1-0.4 0.7-0.3 0.7 0.3 1.1-1 0.7-0.9-0.6-0.3-1.4 0.6-1.6z m3.5-8.1l1.5 0 0.7-0.1 0.4-0.5-0.7 1.5-0.8 0.9-1.1 0.5-1.2 0 0.2-0.8 0.3-0.6 0.7-0.9z m-28.2-4.7l-2.4 0.1-1.2-0.2-1.2-1.1 0.5-0.8 0.5-0.6 0.6-0.3 0.6 0 0.7 0.7 1.4 1.2 0.5 1z m-30.8-5.8l2.4-0.9 1.2 0 0.6 1.5-0.7 1.1-2.8 0.4-0.1 1.4-0.9 0.8-1.1 0.2-1 0.4-0.8 1.5 0.2 1.5-0.9 0.1-3-1.4-0.4-1-0.3-1.3-0.4-1.4 1-0.6 3.1-0.5 1.1-0.4 1.7-1.1 1.1-0.3z m52.9 8.7l0.4 0.6 0.7 1.2 0.4 1.2-0.6 0.5-1.6 0-0.6-0.3 0-0.9-0.2-0.4-0.3-0.1-0.3-0.1-0.4 0.1 0.2 1.1-0.6 1-1.5 1.3 0 0.7 0.7-0.6 0.8-0.4 1.8-0.2 0.8 0.4-0.3 0.9-0.9 1-4.1 2.8-1.9 0.5-1.5-1 0.3-0.3 0.6-0.5 0.4-0.8 0.1-0.7-0.4-0.5-0.6 0.1-1.2 0.4-0.2 0.2-0.3 0.6-0.3 0.6-0.4 0.3-1.6 0.4-3.7 1.9-0.8 0.9-0.6 0.4-0.5-0.1-0.6-0.4-0.6-0.2-0.4 0.2-1.2 0.7-0.5 0.3-4.3 0-0.3 0.3-0.2 0.6-0.3 0.5-0.5 0.3-0.6 0-0.9-0.4-1.3-0.7-0.9-1-0.6-1.3-0.3-1.5 0.4-1.2 1-0.7 1.2-0.3 0.9 0.2 0.8 0.9 0.6 1.2 0.6 0.8 0.9-0.6 0-0.6-0.4-0.1-0.2-0.2-0.1-0.1-0.3-0.2 0.9-0.4 2.1 0.5 0.7-0.4 0.8-0.7 3.3-0.7 2.1-1.6 0.9-0.9-0.3-0.4-1 0.2-2.7 1.6-2.3 0.6-1.2-0.1-0.9-0.8-0.2-1 0.2-0.8 0.5-0.6 0.5-0.3 0.6-0.1 0.4-0.4 0.6-1.8 0.2-0.6 0.2-0.6 0.4-0.5 0.5-0.2 1.6 0.2 2.8-1.3 0.6-0.5 0.2-0.9 0.1-0.8-0.2-0.7-0.5-0.5-3 1.6-1 0.1-0.3 0.2-0.4 0.4-0.4 0.2-0.5-0.4-0.7-1.8-0.5-0.8-0.5-0.6-1-0.6-4.4-0.7-0.9-0.5-0.8-0.6-0.6-0.6 2.2-1.7-0.4-0.8-0.9-1.1-0.3-1 1.7-0.2 0.8-0.3 0.7-0.7 0.4 0.6 0.5 0.4 0.3 0 0.4-0.4 0.1-1.6 1.4-1.1 1.8-0.6 1.6-0.2 0.6 0.5 2.2 0.7-0.1 0.4-0.1 0.9-0.1 0.4 1.5 0.1 1.1 1.7 1.9 4.6 0.2 0.6 0 0.6 0.1 0.4 0.5 0.2 4.7 0 0.3 0.3 0.4 0.5 0.3 0.3 0.7-0.5 0.5-0.1 0.5 0.1 0.3 0.3 1 1.6 0.4 0.4 0.5 0.1 0.9-0.2 0.3 0.1 0.5 0.4 0.6 0.8 0.6 1 0.2 1 0.3 0.2 0.7-0.2 0.5 0.3-0.2 1.7-0.4-0.3-0.4-0.1-0.9-0.2z m-36.1-20.6l-0.4 0.8-0.7 1.7-0.3 0.7-0.4 0.5-0.3 0.3-0.5 0.3-0.6 0-1.7 2.4-2.4 2-0.8 0.3-1.2-0.5-0.5 0-0.2 0.8-0.2 0.9-0.4-0.5-0.5-1-0.3-0.9 1.3-0.2 1.3-1.2 2.1-3.5 0.5-0.7 1.5-1.2 1.1-0.4 1.4-1.3 0.8-0.2 1.3-0.3 0.4 0.3-0.3 0.9z",
    HLD: "M558.6 425.8l-0.1 0-2.2-0.2-0.2-0.1-1.3-0.8-3.5 0.6-1.4-0.8-0.3-0.1-1.1-0.2-2.2 1.3-2.3 0.3-0.8 1.5-1.1 0.5-0.6 0.9-3.3-0.8-1.2-1.2-5.9-0.8-0.1 0-0.3 0 0.3-0.5-0.9-0.7 0-0.6 0.4-0.3 1-0.9 1.2 0.2 0.6-0.1 1.4-1.2 1.1 0 2 0.6 1-0.3 1.8-1.2 3.8-0.9 0.8-0.6-7.7 1.7-3.7-1.7 0-0.5 0.5-1.2 0.3-0.5 3.1-3.4 0.9-1.5 0.8-1.6-2.8 2.5-0.4 0.7-0.2 0.5-0.5 0.5-0.6 0.3-0.5 0.1-0.4 0.3-0.1 0.6-0.1 0.8-0.2 0.7-0.6 1.2-0.6 0.8-0.7 0.3-0.8 0.1-0.4 0.1-0.5 0.8-1 0.4-0.3 0.5-0.6 1-1.3 1.7-0.7 0.5-1 0.2-0.5 0.4-0.6 1.5-0.5 0.4-0.6 0.1-0.5 0.5-0.5 0.6-1.9 2.8-3.1 3.7-3.2 2.6-0.3 0.2-0.4-0.3-0.6-1.2-0.5-0.2-0.7-0.2-0.9-0.4-0.8-0.5-0.6-0.7 0.7-1.4 0.2-0.7 0.1-0.8-0.4 0-1.7 2.4-2.8-0.6-7-5.8-0.3-0.7 0-1.3 0.5-0.6 0.7-0.3 2.3-0.2 1.7 0.4 1.5 0.8 1.3 1.2 0.3-0.6-1.1-0.9-0.5-0.6 0-0.8 5-3.4 1.1-0.1 3 1.5 1.1 0.3 2.5-0.2 1.4-0.4 1-0.6-4.3 0.6-1.1-0.2-2.3-1.5-2-0.6-5.1 2.9-1.7 0.5-0.5 0-0.6-0.2-1.1-0.8-0.6-0.1-3.2 0.2-3.5-1-1.2 0.2-0.9 0.9-0.8 0.5-1.2-0.2-1.1-0.6-0.6-0.6-0.3-0.5-0.2-0.5-0.1-0.5 0-0.5 0-0.9 0.3 0 0.3 0.2 0.3-0.2 1.1-1.7 0.6-0.5 7.2-0.8 0.5-0.2 1.7-1.3 0.7-0.3 0.8 0.2 0.4 0.5 0.5 0.6 0.7 0.5 2.4 1.2 0.5 0.3-0.1-1-0.2-0.9-0.5-0.6-0.8-0.1 0-0.7 0.5 0 0.6 0 0.6 0.2 0.5 0.5 0.6-0.9 1.1-0.4 1.2 0.4 0.9 0.2-3.5-1.7-0.9-1.1 0-0.9 0.6-0.7 4.9-0.7 1.9-0.9 1.5-1.5-0.6-0.3-0.8 0.1-0.8 0.4-0.8 1.4-0.9 0-1.8-0.5 0.4-0.8 1.8-2.1-2.1-0.4-4.4 1-2.2-0.6 1.6-0.4 1.7-0.2 0-0.6-0.4-0.2-1-1 0.9-1 0.5-1.8 0.4-2 0.5-1.7 0.8-1 1.4-1 1.4-0.5 1.2 0.2 0.5 0.6 0.9 1.7 0.5 0.7 0.7 0.5 0.7 0.4 1.6 0.2 2.5-0.6 2.3-1.2 0-0.6-0.8 0.3-0.8 0.4-0.7 0.3-0.6-0.4-1.1 0.8-1-0.3-1-0.7-0.9-0.4-0.7-0.4 0.1-1.1 0.1-1.2-1-0.8-0.4 0.1-1 0.4-0.5 0.1-0.5-0.2-0.8-0.8-0.5-0.2-0.5-0.6 0.7-1.4 2-2.6 0.5-0.9 0.3-0.4 0.6 0 1.4 0.1 0.5-0.4 0.8-0.5 1.2 0.5 2 1.5 0.9 0.5 4.6 0.1 0.3-0.3 0.3-0.6 0.8-0.1 0.8 0.3 0.3 0.1 0.3 0 0-0.6-0.9-0.6-3.9 0.7-1.1 0.4-0.7 0.1-0.3-0.3-1.2-1.5-0.5-0.5-3.9-1.2-0.6-0.9 0.3-1.5 1.6-2.4 0.7-1.2-0.9-1.4 1.1-1.7 2-1.2 1.6-0.4 1.5 1.2 1.5 1.7 1.6 1.2 1.8-0.5 0-0.6-2-0.5-0.4-0.4-0.7-1.3-0.4-0.5-0.5-0.3-0.4-0.6 0.6-1.3 1.1-1.2 1.1-0.4 0-0.7-1.1-0.5-0.8 0.7-0.6 1.1-0.5 0.5-0.8 0.3-1.7 1.2-0.9 0.3-1-0.1-1.8-0.9-0.9-0.2-2 0.7-1-0.1-0.4-1.2 0.2-0.3 1.1-2.6 0.4-0.4 1-0.7 0.4-0.4 0.4-0.4 0.4 0.3 0.2 0.6 0.3 0.3 1-0.2 5.3-2.5 2.1-1.9 0.4-2.5-0.8-0.2-1.3 1.3-2.1 3.1-1.2 0.9-1.1-0.2-1.1-0.5-1.4-0.2 1.1-0.8 0.4-0.6-0.1-0.7-0.4-1.1-0.1-0.6-0.2 0.1-0.7 0.7-3.2 4.2-1.1 0.6-2.5 0.4-1.1-0.6-0.8-3.4 0.2 0.1 0.2-0.2 0.2-0.2 0.1-0.3-0.2-0.3-0.4-0.7-0.1-0.2 0-1.2 0.2-0.6 0.5-0.6-0.5-0.3-1.5-0.4-0.3-0.2-0.1-0.9-0.4-1.5-0.1-1.2 0.1-0.6 0.7-1.5 0.2-0.5 0-1.3 0-1.1 0.2-0.6 0.7 0-0.1-0.4-0.1-1-0.1-0.4 0.8-0.4 0.8 0.2 0.8 0.5 2.6 2.6 0.7 0.6 0.5-0.3 0.8 1.3 0.4 0.3 1.4 1 0.5 0.1-0.3-0.5-0.1-0.4-0.1-0.4-0.1-0.5 3.3-0.6 2 0.4 1.1 0 0.2-0.6-1.5-1.2-2.1-0.5-2.1 0.3-1.3 1.1-1.6-1.9 0.3-0.3 0.4-0.8-1.6-0.3-0.8-1.4-0.6-1.7-0.9-1.4-0.7-0.3-0.7-0.1-0.6-0.4-0.2-1.1 0.2-1 1-1.1-0.3-0.8 0-0.6 1.8-1 0.9-0.1 1.3 1.6 0.6-0.1 0.5-0.7 0.4-0.9-0.5-0.2-0.4-0.4-0.3-0.6-0.4-0.6-0.6-0.3-3.9-0.9-0.1-1 0.2-2.3-0.1-1 0.1-0.7-0.4-1.8 0-1.1 0.2-0.9 0.3-0.9 0.5-0.7 0.6-0.5 1.2-0.5 1.2 0 1.2 0.3 1.2 0.8-0.2 1.2 0.2 1.7 0.3 1.8 0.3 1.3 0.5 0.9 0.6 0.7 0.7 0.3 0.8 0-0.4-0.4-0.2-0.4-0.3-1.1 0.6 0 0.4 0.1 0.9 0.6-0.3-1.8 0.2-1.2 0.1-1.1-0.7-1.4-1.8-1.7-0.6-1 0.5-0.9-0.4-0.1-0.1-0.2-0.1-0.3 0.4-0.8 1.1-1.5 0.4-0.7 0.7 0.8 0.5 0.4 1.7 0-0.3 2.4 1.3 1.8 2 1 1.5 0.2-0.3-0.6 0.5-0.8 0.6-2.5 0.4-0.9 0.6 0 2.2 0.9 0.6 0.6 1.3 1.6 1.6 1 3.4 1.3-0.7-1.2-0.5-0.6-1.4-0.6-2-2.1-3.1-1.4-0.3-0.4-0.1-0.5-0.1-0.2 0-0.2 0.2-0.6 0.3-0.1 0.3 0.4 0.4 0.1 0.2-1.1 0.9 0.6 1.3 1.9 1 0.6 0.6 0 0.9-0.5 0.5-0.1 0.6 0.2 1 0.8 0.5 0.1 0.6 0.4 1.7 1.7 2 0.9 1.3 2.5 1 0.6-0.3-0.5-0.3-0.8-0.3-0.8-0.1-0.6-0.3-0.6-4.7-4.2-1.1-0.3 0-0.6 0.9 0 0.4-0.6-0.1-1.1-0.4-1.1-0.6-0.5-1.5-0.3-0.7-0.6-1.3-0.4-2-2.5-1.2-0.2 0.1-0.2 0.1-0.1 0.2-0.3-0.7-1-0.9-0.3-2 0.1 0.2-0.3 0.1-0.3 0.1-0.3 0.3-0.3 0-0.6-1.6-2.9 0.9-1.2 1.8 0.5 1.1 2.4 1-0.9 1 0.4 1.1 0.1 1.1-1.5-0.3 0 0.2-0.8 0-0.8-0.2-0.7-0.3-0.7 0.6 0 0-0.6-1-0.6 0.7-0.5 1.3-0.3 0.6-0.4 0-0.7-1.5 0.1-0.8-0.2-0.6-0.5 0.3-0.5-0.3-0.5-0.4-0.3-0.4-0.3-0.5-0.1 0.1-0.5 0.2-1 0.1-0.4-0.6 0-0.5-0.3-2.1-3.4 0-1.5 0.8-0.2 1 0.4 2 1.4 0.8 0.2 0.8-0.2 1.9-1.3 1-0.3 1 0.1 1 0.8 0.3-0.6 0.6-0.6 0.7-0.4 0.4-0.2 0.8 0.3 1.5 1.3 0.6 0.2 2.3-0.2 0.8 0.2 3.2 2.5-0.5-0.9-0.5-0.6-1.3-1 0.6-0.5 1.4-0.2 0.6-0.5-3-0.6-0.9 0-0.4 0.3-0.5 0.8-0.5 0.1-0.5-0.2-0.9-0.8-0.6-0.2-0.6-0.5-1.4-2.1-0.5-0.4-0.1-0.4-0.9-1.3-0.1-0.2-0.4-1.1-0.1-0.7-0.1-0.6 0.9 0-0.5-1 0-0.9 0.4-0.9 0.4-0.9 0.1-0.5-0.1-0.6 0-0.5 0.2-0.2 0.3 0.1 0.6 0.4 0.3 0.1 2.8 1.9 1.9-0.1-1.3-1.1-0.4-0.6 0.1-0.7-0.3-0.6-0.4 0.4-0.5 0.2-0.5 0.1-0.5-0.1 0-0.6 0.4 0 0.2 0 0-0.7-0.3 0-0.2-0.2-0.5-0.4 2.6-1.6 1.2 0.6 1.4 1-5.2-4.6 0-1.6 0.1-0.8 0.4-0.4 2.5-1.5 0.7-0.8 0.5-1.3-0.3 0 0.4-1.9 0.1-1.8 0.3-1.6 0.8-0.9 6.1 1.3 1.1 0.8 0.8 1 0 0.5 0.2 1.4 0.3 1.2 0.2 0-0.1 0.9-0.1 0.8-0.2 0.7-0.3 0.7 0.9-0.7 0.3-0.9 0.1-0.9 0-0.9 0.2-1.3 0.4-0.6 0.3-0.6-0.3-1.5 0.9 0.7 1.4 1.9 0.8 0.4 1.3 1.1 0.6 0.2 0.5 0.3 0 0.7-0.2 0.8-0.1 0.6-0.6 0.7-1.7 1.7-0.8 2.2-0.9 1.7-0.4 1.2 0.8-0.1 2.8-3.1 0.5-0.3 0.3-1.4 0.7-0.6 1-0.5 0.8-0.8 0.6-1.6 0.2-1.6 0.5-1.3 1.2-0.5 2 0.4 1.9 0.9 2.3 1.7 0 0.7 0 0.3-0.1 0.1 0.1 0.9-1.1 1.3-0.7 1.6-0.6 1.9-0.8 1.9 0.8-0.4 0.8-0.8 1.3-1.8 0-0.4 0-0.4 0-0.4 0.2-0.1 0.2-0.1 1.9-2.1 0.1-0.2 1.8-1.3 1.3-0.6 0.4-0.1 1 0.3 1.4 1.4 1 0.3-0.6-0.7 0.5-0.4 0.2-0.5 0.3-0.5 0.3-0.4 0.5-0.1 0.9 0.5 0.6 0.1 0.4-0.2 0.4-1.2 0.5-0.3 1.8 0 1 0.3 0.4 0 0.5-0.3 0.4-0.7 0.6-1.5 0.5-0.3 0.4-0.1 0.1-0.1 0 0.3 0.9 1.7 0.2 0.2 1.1-0.2 4 0.7 4-0.7 2-0.9 3.2-2.5 1.8-0.9 3-0.5 1.5 0 1 0.5-0.4 0.5-0.2 0.1 1.1 1.1 1.4-0.1 2.6-1 2.6 1.2 1.3 0 0.6-1.8-0.8-0.3-0.8-0.6-0.8-1-0.5-1.2 1.1-1.5 0.7-0.4 0.8 0.1 0.2 0.5 0.1 0.8 0.2 0.8 0.3 0.4 1.4 0 3.1-1 1.9-0.2 2.4 1.8 1.6 0 3.1-0.6 1.6 0.7-0.3 1.6-0.9 1.9-0.2 1.3-0.6 0.7-0.7 1.7-0.4 0.7-1.2 1.2-0.4 0.6-0.5 1.8 0 1.4 0.5 1.1 1 0.6 0.6-0.1 0.5-0.3 0.4-0.1 0.4 0.5 0.2 1.1-0.2 0.8-0.5 0.5-0.4 0.1-0.5 3.2-2 4-2.5 3.6-1.8 2.1-1.9 1.1-4.1 1.5-1.7 1-2.5 2.6-0.4 0.8-0.3 1.5-0.9 1.5-2 2.2-10.3 8.5-3.4 1.8-0.9 0.9-0.4 0.9-0.5 1.8-0.2 0.7-0.5 0.4-1.1 0.7-1.5 0.3-3 2.1-0.5 0.3-0.3 0.5-0.1 0.8-0.1 0.9-0.7-0.5-0.3-0.2 0.4-0.5-0.7-0.4-1.2-0.1-1.3-0.8-0.3 0.3 0.2 0.7 0.4 0.8 0.7 0.6 1.4 0 0.8 0.4 0.3 0.4 1 1.7-1 1.6-0.2 0.9 0.2 1.1-0.8-0.1-1.4-0.5-0.7 0-0.4 0.3-0.8 1.2-0.4 0.3-1.3 0-2.7-1.4-1.3-0.4-3.8 1-1-0.7-1.5-2.2-0.9-0.8-1-0.3 2.5 3.7 1.5 1.3 1.8 0.4 1.9-0.9 1-0.2 0.8 0.8 0.8 1 1.1 0.8 0.8 0-0.3-1.5 3 2.1 1.6 0.4 2.7-2.1 1.5 0.4 0.8 1.1-0.6 1.1 1.5 0.5 1.7-0.8 1.7-1.6 1.4-2 0.7-0.8 0.5 0.1 0.3 0.8-0.1 1.5-0.3 0.7-6.4 8.5-1.1 0.8-1.2 1.9-0.6 0.7-1 0.2-0.7-0.4-0.2-0.9 0.6-1.3-1.3-1.3-1.6 0.6-3.7 3.4-0.6 0.2-1.2 0.1-3 0.9-0.9-0.2-0.8 0-0.3 1.1-0.3 1.2-0.8 0.5-0.6 0.3-3.1 3.1-0.4 0.6-0.4 0.9-0.4 1.3 0.3 0.1 0.6-0.5 1.4-0.6 0.7-0.7 0.7-0.9 0.5-0.8 0.5-0.8 2.2-1.4 1.8-1.9 2-1 0.3 0 0.6 0.2 0.6 0.8 2.4 0.5 1 0 0.7-0.6 0.6-0.7 2.1-1.3 0.7-0.1 0.2 1.1-1 1.8-1.3 1.7-1.4 1.1-1.6 2.7 0.1 0.4 0.2 0.3 0.1 0.3 0.2 0.2-2.2 0.2-0.9 0.5-0.8 1.1 0.5 0.8-0.3 0.1-1.1-0.4-2.6 0 0 0.7 1.4 0 0.6 0.1 0.6 0.4-0.9 2-0.5 0.9-0.5 0.7 1.6 0.5 0.9 0 1-0.5 0.7-0.9 0.4-0.6 0-0.3 1.1-0.1 0.5-0.2 0.8-1.3 0.7-0.7 0.8-0.5 0.6-0.2 0.9-0.4-0.6-0.9-1.7-1.6 1.3 0.1 4.3-0.7 4.5 0.4 1.4-0.4 3.9-2.9 0 0.1 0.8 1.6 0.4 1.9 1 0.6-0.1 1-0.3 0.6 0.3 0.9-0.1 1.5 1.2 0.8 0.2 1.3 0.1 1.3-0.3 2.8 0.1 1.3-1.6 2-0.3 1 0.3 0.5 0.8-0.2 1.6-2 2.7-0.3 0.7-0.9 0.8-0.4 3.7-0.7 2.8 2.7 1.9 0.4 0.7 3.5-0.3 1-1.3 1.1-1.3 2.4-1.3 1.1-0.6 1 0.1 0.6 1.8 1.1-0.5 4.2 1.7 1.3-0.5 0.8 0.1 0.9-0.4 1.2-0.7 0.9-1.1 0-2.6 1.3-1.2 1.5-1.4 1-1.3 1.5-1.3 0.1-1.6 1.7-0.2 0.1-2.7 1.5-0.3 1 0.2 0.5-0.4 2.8 0.1 3.1-0.3 0.9-1.3 1.5-0.7 2.9-1-0.4-2.9 0.9-0.9-0.3-2-1.7-0.4 0.4-0.5 1.2-0.3 2.5-0.5 0.4-2.6-0.6-3.1 0.6-3.1-1.2-0.6 0.1-1.2 1.3 0.4 1.5-0.3 0.5-2.4 1.4-2.4 0.7-1.4 1.8-1.6-0.2-0.5 0.4-0.1 0.2-0.6 0.5-2 3-0.5 0-1.3-0.6-0.9-1.4-1-0.2-1.4 2.2-0.3 1.3-1.3 0.7 0.2 2.3-0.9 1-0.2 0.7 0.5 1.3-2.7 1.5-2.7 0.4-0.3 0.6 0 1.9z m-75.7-35.8l2.4 1.6 1.1 1.2-0.9 0.8 0 0.6 1.2 0-0.6 3.1-0.9 1.8-1.3 0.8-1.8 0.2-0.8-0.5-0.8-2-0.7-0.5-0.7-0.3-1.4-1.6-0.9-0.5 2.8-3.2 1.5-1.2 1.8-0.3z m-13.2 0.6l0.8-0.6 1.6-1 0.9-0.2 0.5 0.5 1.1 0.3 0.6 0.4-1.2 0.7-1.6 0.3-1.5-0.1-1.2-0.3z m30.4-20.1l-1.3-0.5-1-1.1-0.3-1.2 1.1-0.7 1.6 0.3 1.2 1.3 0.2 1.3-1.5 0.6z m-5-5.4l-0.5-0.7-0.1-1.4 0.4-5.6 0.3-1.5 0.8-0.7 1.3-0.2 0-0.5-0.3-0.5-0.2-0.4-0.4-0.9 0.5-0.6 0.5 0 0.9 0.6 0-0.7-0.6-1.2 0.4 0.1 0.3 0.3 0.3 0.3 0.2 0.5-0.1 1.3-0.8 2.6-0.7 3 0 2.7 0.4 0.6 0.7 1.5 0.2 1.4-0.8 0.6-0.7 0.3-0.8 0.6-0.7 0.3-0.8-0.5 0.1-0.7 0.1-0.2 0.1-0.4z m4.5-14.9l-0.7-0.4-0.3-0.9 0.1-1.1 0.6-1.1-0.2-0.3-0.1-0.1-0.1-0.3 0.4-0.5 0.3-0.4 0.3-0.1 0.3 0.5-0.6 3.3 0 1.4z m-27.9 14.9l-0.8 0.7-4.3-1.5-1.1-0.7-0.9-1.1-0.3-1.2-0.4-2.3-2-1.5-0.5-1.9 2.9 0-0.7-0.8-0.4-0.9-0.1-1.1 0.4-1.1 0.6-0.9 0.5-0.2 0.4 0.2 2.5 3.7 0.3 0.8 0.4 0.6 0.9 0.6 0.6 0.2-0.3-1.1 0-0.6 0.2-0.1 0.2-0.3 0.2-0.1-0.8-1-0.1-0.2-0.1-0.3-0.4-0.7-0.1-0.3 0.1-0.4 0.4-0.1 0.1-0.3 0.4-0.5 0.8 0.1 1.4 0.7-0.5-1.6-1.1-1.4-1.5-0.9-1.1-0.4 0.6-0.8 0.5-1.3 0.1-1.3-0.6-0.7 0-0.7 1 0 0.7 0.7 0.5 0.8 1 0.7 0.2 0.7 0.1 0.8 0.1 0.6 0.5 0.5 0.3 0.3 2.2 1.2 0.5 0.5 0.5 0.8 0.7 0.7 0.6-0.1 0.6-0.3 0.8-0.1-1 2.6 0.4 0.2 1-1.3 0.6-1.7 0.6 0.3 3.6 4.7 0-0.5-0.3-0.3-0.2-0.6-0.2-0.3 0-1.2-0.6-1.1-1.6-2-0.8-1.8 0.2-0.9 0.6-0.8 0.6-1.8-0.6 0.1-0.5-0.1-0.5-0.3-0.3-0.3 0.2-1.2-0.3-0.7-0.4-0.5-0.2-0.6 0-1 0.1-0.3 0.3-0.1 1.9-1.3 0.3-0.3 0.4-1.1 0.3-1 0.3-0.6 0.6 0.3 0.4-0.2 0.1-0.1 0.2-0.3 0.4 0.9 0.4 0.5 1.1 1 0.4 0.6 1.2 1.9 0.1 0.4 2.1 1.8 0.9 1.2 0.5 0.8 0.2 0.8 0.5 6 0.4 2.7 0.1 1.2-0.1 1.3-0.5 1.9-0.1 1.2-0.2 0.7-1.2 1.2-0.5 0.8 0.6-0.6 0.8-0.5 0.8-0.3 0.7 0.2 0.4 0.9-0.3 0.8-0.5 0.7-0.2 0.6 0.2 1.4 0.7 0.9 0.7 0.6 0.3 0.7-0.4 0.7-1.5 1-0.7 0.6 4-0.5 1.1 0.3 0.2 0.7-0.5 0.8-1.2 0.5 0 0.6 1.2-0.1 1.1-0.5 0.9-0.2 1.1 1.1 0.4 0.4 0.6 0 1.2-0.1 0.7 0.3 0.5 0.8 0.3 0.8 0.3 0.5 0.7 0.1 0.4-0.4 0.3-0.6 0.2-0.3 2 0.1 1.3-1.4 1.3-0.5 1.4 0 0.8 1.1 3.4 0-0.7 2.2 0 0.6 0.2 0.9-0.2 0.8-0.3 0.7-1 1.3-1.7 1.5-0.7 0.4-1.9 0.2-0.3 0.5-0.1 1.9-0.4 1.2-1 0.8-1 0.6-0.4 0.4-0.4 0.7-2.8 3.9-0.7 0.7-0.9 0.7-2.5 0.4-0.6-0.3-0.5-1.1 0.2-1.5 1.2-1.8-0.1-0.8 0-0.6 0.3-0.2 0.1-0.2 0.2-0.8 0.1-0.4 0.4-0.4 0.8-1.7 0.4-0.5 0.6-0.6 4.5-2.3 0-0.5-1.3 0.7-1.3 0.4-4 0-0.3-0.2 0-0.5-0.1-0.6-0.1-0.5-1.1-1.9-0.6-0.8-0.5-0.2 0.2 0.9 0.2 0.6 0.5 1.4-0.5 1.3-0.3 0.6-0.5 0.5 0.4 0.6-0.6 0.7-0.4 1-0.4 0.8-0.7 0.4-0.6-0.7-0.3-1.5-0.2-1.8-0.1-1.2-0.3-0.5-0.3-0.1-0.3 0.1-0.3 0.5-0.4-0.6-0.4-0.4-0.4-0.2-0.4 0 0 0.5 0.6 0.7-0.8 0.6-6.6 1.7 0-0.6 0.5-0.5 1.5-1.9 0-0.5-0.9-0.1-0.8 0.2-0.8 0.5-0.8 0.6-0.9-1.5-0.7-1.6 0.5-0.2 0.5-0.3 0.4-0.5 0.2-0.7-2.1 0.2-0.8-0.2-2.2-3-0.1-0.3-0.3-0.8-0.1-0.4-0.2-0.3-0.2-0.2-0.2-0.3-0.2-0.6 2.2-1.6 0.9-0.4 1.1 0.2 0.8 0.7 0.8 1.1 1 0.9 1.3 0.2-0.6-1.1-3-2.5-0.6-0.7-0.3-0.3-0.5-0.1-0.6 0.1-1 0.4-0.6 0 0.7-0.5 0-0.6-0.4-0.1-0.9-0.5 0.4-0.2 0.1-0.1 0.1-0.3-0.4-0.3-0.3-0.4-0.1-0.7 0.2-1-0.7 0.2-0.9 1.2-0.6 0.4 0.2-0.8 0.1-0.8-0.2-0.8-0.4-0.6-0.4 1.1-0.6 0.4-0.5 0.2-0.4 0.7-0.1 1 0.5 1.6-0.1 0.9z",
    MRY: "M606.8 386.9l0.2-0.1 1.6-1.7 1.3-0.1 1.3-1.5 1.4-1 1.2-1.5 2.6-1.3 1.1 0 0.7-0.9 0.4-1.2-0.1-0.9 0.5-0.8-1.7-1.3 0.5-4.2-1.8-1.1-0.1-0.6 0.6-1 1.3-1.1 1.3-2.4 1.3-1.1 0.3-1-0.7-3.5-1.9-0.4-2.8-2.7-3.7 0.7-0.8 0.4-0.7 0.9-2.7 0.3-1.6 2-0.8 0.2-0.3-0.5 0.3-1 1.6-2-0.1-1.3 0.3-2.8-0.1-1.3-0.2-1.3-1.2-0.8 0.1-1.5-0.3-0.9 0.3-0.6 0.1-1-1-0.6-0.4-1.9-0.8-1.6 0-0.1 3.3-2.5 2.8-0.7-0.4 1-0.2 0.4-0.4 0.4 0.6 0.5 0.6 0 0.7-0.3 0.7-0.2-1-2.3 1.7 0.6 1 0.1 0.9-0.2 0.6-0.5 0.8-0.9 0.4-1.1-0.2-1 0.4-0.9 0.4-0.1 0.5 0.2 0.6 0.2 0.6-0.3 1.2-0.8 0.6-0.1 5.8 0.2 3.5 2.3 6.2 2.2 2 0.1 1.9-0.6 2.9-2.2 0.8-0.2 4.4 0 0 0.7 0 2.1 0 3.2 1.9 4.2 1.5 1.5 1.4 1.9 0.6 1.5 0 1.4-1.2 0.7-1.9-0.6-1.7-0.7-2.1-0.1-1.8 0.1-2 1.4-2.7 2.4-0.8 2.4-0.1 2.7 0.3 1.6 0.9 1.5 0.8 1.6 0.1 1.6 0 1.6-0.9 2.6-1.1 1.9-0.9 0.7-0.7 0-1.1-0.1-1.2-0.5-1.4-0.2-1 0.6-2.1 1.1-1.1 1.4-1 1.6-1.1 1.5-1.1 1.4-1.2 0.6-1.2 0.5-0.5 1.2-0.1 1.2 0.2 0.8 0.3 0.9 0.5 1.4 0 1.1-1 0.9-1.7 0.4-2.2 0.2-2.4 0-3.4 0-3.2 0-1.7-0.2-1.1-0.9z",
    ABD: "M601.4 401.1l0.7-2.9 1.3-1.5 0.3-0.9-0.1-3.1 0.4-2.8-0.2-0.5 0.3-1 2.7-1.5 1.1 0.9 1.7 0.2 3.2 0 3.4 0 2.4 0 2.2-0.2 1.7-0.4 1-0.9 0-1.1-0.5-1.4-0.3-0.9-0.2-0.8 0.1-1.2 0.5-1.2 1.2-0.5 1.2-0.6 1.1-1.4 1.1-1.5 1-1.6 1.1-1.4 2.1-1.1 1-0.6 1.4 0.2 1.2 0.5 1.1 0.1 0.7 0 0.9-0.7 1.1-1.9 0.9-2.6 0-1.6-0.1-1.6-0.8-1.6-0.9-1.5-0.3-1.6 0.1-2.7 0.8-2.4 2.7-2.4 2-1.4 1.8-0.1 2.1 0.1 1.7 0.7 1.9 0.6 1.2-0.7 0-1.4-0.6-1.5-1.4-1.9-1.5-1.5-1.9-4.2 0-3.2 0-2.1 0-0.7 3 0 0.3 0.2 0.5 0.8 0.5 0.2 0.5-0.2 0.4-0.3 0.4 0 0.4 0.5 1.6-0.8 4 1.4 1.5 0 0.8 1.2 0.3-0.2 0.4-0.6 0.6-0.4 0.8 0.1 2.2 1.1 0.4-0.7 0.3 0.2 0.5 0.4 0.5 0.1 0.5-0.3 0.8-0.8 0.4-0.1 0.9 0.5 0.6 0.2 0.2-0.4 0.2-0.5 0.3-0.5 0.5-0.4 0.4-0.1 1 0.1 2 1.3 1 0.4 1.2-0.3 2.8-2.1 0.7-0.2 5.2 0.2 0 0.3 0.3 0.7 0.4 0.9 0.4 0.5 0.6 0 0.8-0.7 0.6 0.1 0.3 0.3 0.5 1.2 4 4.5 0.4 1.5 0.2 1.6 0.2 1.5 0.8 1.4 0 0.5-0.2 1.1 0.5 1 1.3 1.5-0.7 0.1-0.3 0.6 0.1 0.8 0.4 0.4 0.6 0.2-0.3 0.5-1.1 1-1.9 2.6-0.8 1.6-0.2 1.2-4.9 4.6-1.2 1.9-3 8-0.2-0.6-0.1-0.1-0.8-0.3-1 0-0.6 0-0.6 0-0.5 0.3-0.5 0.7-0.5 0.5-0.6 0-0.7 0-0.7-0.9-0.8-0.7-1.1-0.1-1.7 0.1-0.8 0.4-0.5 0.8-0.3 0.6-0.1 0.8 0.2 1.3 0.7 0.6 0.5 0.7 0.3 1.4-0.4 1.3-0.7 1.1-1.4 0-1.1 0-0.4 0.6-0.1 1.1 0.1 1.4 0.3 1 0.6 0.5 0.6 0 1.2-0.1 1.3-0.6 1.3-0.3 1.6-0.4 1.4-0.3 2-0.5 1.3-0.3 1.4 0.2 0.3 0.4 0.1 0.3 0 0.1-4.2 6.8-1.4 3.1-0.7 3.1 0.2 0.7 0.2 0.5 0.3 0.7 0 1-0.3 0.5-0.8 1.1-0.2 0.5-0.3 1.5-0.7 1-1.6 1.3-1.3 1.8-1.1 2-0.7 0.9-2.6 1.7-0.8 0.7-0.9 1-0.4 0.9-0.5-0.4-0.9 0-1.4 0.1-1.9-2.3-2.8-0.4-1.1-0.8-2.3-3.4 0.1-1.2-0.3-1.5 0.8-1.8 0.1-1-1-0.7-0.5-1.7-1.9-1.3-0.8-1.6-0.7-0.7-2.3 0-1.1-1.2-2-1-0.9 0.2-1.7 1.1-4.6-0.2-1.5 0.7-0.9 0.7-0.5 0.9-0.9 4.1-0.6 0.6-1.8-1.4-1.8-0.2-3.6-1.8-0.4 0.2-0.2 1.8-0.3 0.5-2.4 0.6-1.2 1.1-1.1 0-1.8-0.1-1.4 0.6-1.9-1.3-2.2 0.4-0.6-0.3-0.3-0.4 0-2.4-0.9-0.7-1.7 0.6-1.8-0.6-1.2 0.8-0.9 0.2-0.9-0.4-0.8-0.8-2.4 0.2z",
    ABE: "M682.4 386.4l-0.1-0.3-0.3-0.4-1.4-0.2-1.3 0.3-2 0.5-1.4 0.3-1.6 0.4-1.3 0.3-1.3 0.6-1.2 0.1-0.6 0-0.6-0.5-0.3-1-0.1-1.4 0.1-1.1 0.4-0.6 1.1 0 1.4 0 0.7-1.1 0.4-1.3-0.3-1.4-0.5-0.7-0.7-0.6-0.2-1.3 0.1-0.8 0.3-0.6 0.5-0.8 0.8-0.4 1.7-0.1 1.1 0.1 0.8 0.7 0.7 0.9 0.7 0 0.6 0 0.5-0.5 0.5-0.7 0.5-0.3 0.6 0 0.6 0 1 0 0.8 0.3 0.1 0.1 0.2 0.6-1.1 4.5-0.3 1.8 0.2 1.6 0.9 0.7 0.1 0.7-0.8 1.6z",
    ANS: "M620.2 405.3l1.1 0 1.2-1.1 2.4-0.6 0.3-0.5 0.2-1.8 0.4-0.2 3.6 1.8 1.8 0.2 1.8 1.4 0.6-0.6 0.9-4.1 0.5-0.9 0.9-0.7 1.5-0.7 4.6 0.2 1.7-1.1 0.9-0.2 2 1 1.1 1.2 2.3 0 0.7 0.7 0.8 1.6 1.9 1.3 0.5 1.7 1 0.7-0.1 1-0.8 1.8 0.3 1.5-0.1 1.2 2.3 3.4 1.1 0.8 2.8 0.4 1.9 2.3 1.4-0.1 0.9 0 0.5 0.4-0.2 0.5-0.6 3.8-0.5 1-0.7 0.9-0.4 1.2 0 0.7 0.3 1.2 0 0.4-0.3 0.6-0.8 1-0.5 1.4-0.7 0.9-4.4 3.2-0.8 1.8-1 0.7-1.8 0.9-0.4 0.6-0.9 2.3-0.4 0.2-0.4-0.2-0.3-0.4-0.6-0.1-2.6 0.3-0.1-0.4-0.5-1.4 0-1.1-0.6-0.9-1.8-0.1-2.1 0.1-1.9 0.6-2.9 0.4-1.5 0.3-0.6 1.2-0.2 1-0.2-0.2-1.3-0.1-1.6-1-1.1-2.2 0.1-1.2 1.2-3.3 1.4-1.8 1.3-0.7 0-0.7-0.9-0.6-1.2-0.1-0.8-1-0.1-1-0.3-0.8-1.3-0.8-0.9-0.3-1.5-0.4-1.3-0.3-0.8-0.7-1.2-1.8-1.4-2.1-0.4-1.2-0.6-2 0-1.5 0-1.6-0.7-2-0.5-0.6-0.5-2.1-0.1-2.5z",
    DND: "M634.9 439.9l0.2-1 0.6-1.2 1.5-0.3 2.9-0.4 1.9-0.6 2.1-0.1 1.8 0.1 0.6 0.9 0 1.1 0.5 1.4 0.1 0.4-11 1.7-0.1-0.3-0.5-1.1-0.6-0.6z",
    PKN: "M609.1 469.2l-0.3-0.5-0.3-1.8 3.8-1.8 0.4-0.4-0.3-0.4-2.4-1-0.8 0.4-1.2-0.3-0.5 0.8-2.7-0.2-0.5-0.3-0.7-1.5-0.5-0.4-3.1 2-0.1 0.1-0.4-0.4-0.1-1.7-0.2-0.2-1.7 0.4-1.3-1.7-2.6-1.4-1.6-1.6-2.3-0.3-0.8-1.1-0.3 0.1-0.3 0.9-0.3 0-0.8-0.4-1-1.2-2.4-0.6-2.3-2.4 0.2-1.6-0.6-0.7 0-1.3-0.3-0.1 0.3-0.1 0.2-0.5 1.1 0 0.4-0.4 0.3-0.6 0-5.6 1.8 0.4 1-0.9 1.5-0.4-1.3-2.9-1.1-0.8-0.4-0.1-1 0.3-2.8 1.5-2.3 0.9-0.3-0.5-1.5-3.9-1.4-0.7-1.8 1.3-3.7 1.2-0.6 0.1-0.8-0.7-0.6 0-0.4 0.4 0 0.7-0.4 0.4-1.7 0.1-1.6 0.7-1.8 1.7-1.2-0.4-0.5-0.6-0.1-0.7 1.3-2.3 0-0.7-0.2-0.2-0.3-0.4-1.3-0.3-0.3-0.5 0-0.2 0.1-0.2 4.5-2.2 1 0.6 0.5 0.3 0.3-0.6-1.2-2.1-0.6-1-0.2-0.1-1.3-0.3 0-1 0.5-0.7-0.2-1.3-0.6-0.2-1.8 0.8-1.7-0.1 0-1.9 0.3-0.6 2.7-0.4 2.7-1.5-0.5-1.3 0.2-0.7 0.9-1-0.2-2.3 1.3-0.7 0.3-1.3 1.4-2.2 1 0.2 0.9 1.4 1.3 0.6 0.5 0 2-3 0.6-0.5 0.1-0.2 0.5-0.4 1.6 0.2 1.4-1.8 2.4-0.7 2.4-1.4 0.3-0.5-0.4-1.5 1.2-1.3 0.6-0.1 3.1 1.2 3.1-0.6 2.6 0.6 0.5-0.4 0.3-2.5 0.5-1.2 0.4-0.4 2 1.7 0.9 0.3 2.9-0.9 1 0.4 2.4-0.2 0.8 0.8 0.9 0.4 0.9-0.2 1.2-0.8 1.8 0.6 1.7-0.6 0.9 0.7 0 2.4 0.3 0.4 0.6 0.3 2.2-0.4 1.9 1.3 1.4-0.6 1.8 0.1 0.1 2.5 0.5 2.1 0.5 0.6 0.7 2 0 1.6 0 1.5 0.6 2 0.4 1.2 1.4 2.1 1.2 1.8 0.8 0.7 1.3 0.3 1.5 0.4 0.9 0.3 1.3 0.8 0.3 0.8 0.1 1 0.8 1 1.2 0.1 0.9 0.6 0 0.7-1.3 0.7-1.4 1.8-1.2 3.3-0.1 1.2 1.1 2.2 1.6 1 1.3 0.1 0.2 0.2 0.6 0.6 0.5 1.1 0.1 0.3-0.3 0-1.8 0.8-1.6 1.3-4.9 5-2 0.8-2-0.6 0.6 0.8 0.8 0.3 1.5 0 0 0.1 0.1 0.4 0.3 1-0.6 0.6 0 0.3 1.1 0.9 0 0.6-0.8 0.4-1.5-0.1-0.2 0.2 0.2 1.2-0.4 0.4-1.6 0-1.3 1.4 0 0.4 0.7 0.5-0.1 1.5 2.8 0.3 1.2 1.2 0.1 1.9-1.7 0.9-0.2 0.5 0.5 0.6 1 0.3-0.2 0.2-0.8 0.4-1.5-0.5-1.2 0.2-0.5 0.3-0.3 1.4-1 0.7-4-0.6-2.6 0.2-1-0.9-0.9 0.2-0.3 1-0.4 0.3-2.2 0.5z",
    FIF: "M603.7 473.9l0.2-0.2 0.8-0.8 0.4-1.1 1.1 0.1 2.9-0.9 0-0.4-0.6-0.3-0.2-0.5 0.8-0.6 2.2-0.5 0.4-0.3 0.3-1 0.9-0.2 1 0.9 2.6-0.2 4 0.6 1-0.7 0.3-1.4 0.5-0.3 1.2-0.2 1.5 0.5 0.8-0.4 0.2-0.2-1-0.3-0.5-0.6 0.2-0.5 1.7-0.9-0.1-1.9-1.2-1.2-2.8-0.3 0.1-1.5-0.7-0.5 0-0.4 1.3-1.4 1.6 0 0.4-0.4-0.2-1.2 0.2-0.2 1.5 0.1 0.8-0.4 0-0.6-1.1-0.9 0-0.3 0.6-0.6-0.3-1-0.1-0.4 0-0.1 0.5 0 1-0.3 1.9-1.2 1.9-0.4 9.3-4.8 0.5-0.6 0.4-0.8 1-0.6 1.1-0.2 0.8 0.5 0.9 0.8 1.6 0.2 0.6 1 0.1 1.6-0.4 1.5-0.6 1.3-0.7 0.9 1.1 0 0.2 0.2 0.2 1.2 0.1 0.3 0.5 0.2 0.4 0.1 0.4 0.2 0.3 0.6 4.3 0.3 1 0.6 1.6 1.5 0.4 0.2 1.7 1.5 0 0.5-2.5 2.5-0.9 1.7-1.1 0.5-2.2 0.5-3 2-1.1 0.3-1.1-0.2-2.9-1.5-2.2 0-1.2 0.3-0.5 0.6-0.3 0.8-2.5 1.8-2.6 3-0.8 0.4-0.9 0.4-0.5 0.9-0.7 2.8-0.5 1.2-0.7 0.5-3.3 0.2-0.9 0.4-1.6 1.1-1.9 0.9-1.8 0.3-1.9-0.1-7.5-2.3-4.2 0.1-1.8-0.6-1.7-1.2z",
    IOW: "M728.5 895.6l0.9 1.5 0 0.6-0.2 0-0.1 0.1-0.1 0.2-0.2 0.2-1.7 0.5-0.8 0.4-1.3 1.1-0.2 0.4-0.2 0.3 0.1 1.6-0.1 0.9-0.1 0.3-5.2 1.6-1.7-0.5-6.1-4.4-0.4-0.4-1.5-1.2-0.6-0.2-1.7 0.2-0.8 0.4-0.8 0.5 1.1-2.1 1.9-1.6 4-1.9-0.1 0.2-0.1 0.5-0.1 0.3 1.2-0.2 1.1-0.9 1.6-1.9 1.1-0.9 1.1 0 7.1 2.9 1.2-0.1 0.4 0.1 0.6 0.5 0 0.2 0 0.6 0 0.2 0.1 0 0.4-0.1 0.2 0.1z",
    AGY: "M564.8 700.9l0.2 0.4 0.4 0.5 0.3 0.6-0.3 0.8-0.4 0.2-0.4-0.2-1-0.9-1-1.7-0.4-0.6-0.4-0.1-1.4 0.1-0.3-0.2-0.8-1.3 0-0.6 1.3-1.1 0.5 0.3 0.5 0 0.9-0.1 0.3 0.3 0.7 0.7 0.7 0.9 0.4 0.9 0.2 1.1z m22.4-3l1.4 0 0.6 0.1 0.6 0.5-1 1-1.6 3.1-1.1 0.6-1.2 0.2-1.1 0.6-1.1 0.9-0.9 1-0.2 0.3-0.1 0.2 0 0.3 0 0.6-0.1 0.6-0.1 0.1-0.2-0.1-1.7 1.2-0.7 0.9-3 1.8-0.5 0.2-0.6-0.1-1.2-0.6 0 0.2-0.3 0.3-0.3 0.1-0.3-0.1-0.1-0.4 0-0.8 0.1-0.6 0.1-0.3 0.4-0.4 0.5-0.7 0.3-0.7-0.5-0.4-0.7 0.4-1.1 1.5-0.6 0.3-0.1-0.3-1.5-1.3-0.2-0.1-0.4 0.1-0.1 0 0-0.2 0-0.7 0-0.2 0-0.2 0-0.6-0.2-0.6-0.9-0.9-1.6-3-0.8-1.1 0-0.6 0.2-0.8 0.1-1.2 0-1.7 0.2-2.6-0.1-1.1-0.4-1.2 0.8-0.6 6-2.1 0.6 0 3.2 0.5 0.9 0.1 1.8 1 0.5 0.4 0.2 1 0.1 0.9 0.2 0.5-0.1 0.2 0.6 0.4 0.7 0.4 0.2 0 0.1 0.4-0.1 0.6 0 0.4 0.2 0.2 0 0.2 0.8 0.9 0.2 0.9 0.1 0.7 0.2 0.4 0.6 0.1 0.6 0 1.1-0.4 0.5 0 0.3-0.2 0.4-0.8 0.3-0.2 0.3 0.1 0.6 0.4 0.2 0.1z",
    ELS: "M432.8 394.2l0.3 0.6 0.1 0.7 0.2 0.7 0.4 0.4-1.4-0.1-0.4 0.3-0.4 0.6-0.3 0.4-0.4 0.3-0.3 0.2 0.2 0.8-0.4 0.5-0.7 0.4-0.7 0.1-3.1-0.6-0.7-0.4 0-0.8 0.6-0.8 0.7-0.4 0.6-0.4 0.2-0.9-0.1-1-0.5-0.6 1.2-0.8 1.1-0.3 0.9-0.7 0.3-2.4 0.3 0 0.1 0.2 0.3 0.4 0.3 0.1 0.3 0.1 0.2 0.2 0.2 0.2-0.7 1.5-0.3 0.3 1.5 0.8 0.4 0.4z m7.1-27.2l0.5 0.6 0.5 0.7 0.5 0.5 0.7-0.1-0.2 1.3-0.4 0.4-0.6 0.3-0.5 0.7-0.3 0.8-0.5 1.8-0.3 0.7-0.9 0.4-3.7-1 0 0.6 3.1 0.9 0.8 0.8 0.4 1.4 0.2 1.8-0.1 1.7-0.5 1-0.8-0.5-0.9-0.1-1.8 0 0 0.6 0.8 0.2 1.7-0.2 0.7 0 0.8 0.7 0.5 0.9 0.6 0.7 1 0.1 0 0.6-1.1 1.1-3.9-0.8-1.5 0.9-1.3-1.6-0.4-0.9-1.2-4.6-0.2-1.4 0.3-1 0-0.6-0.8-1.1-0.5-0.5-0.6-0.1 0.5-0.7 0.4-0.7 0.6-1.6 0.2-0.9 0.1-0.8 0.3-0.5 0.6-0.2 0.3-1.2-0.5-2.6-1.3-3.9 1-0.7 2.1-1.1 0.4 0 4.2 3-0.4 0.3-0.3 0-0.9-0.3 0 0.6 1 0.2 1.5 1.4 1.1 0.1 0 0.6-1.3 0.7-1-0.5-0.9-0.8-1.9-1.2-1-1.4-0.9-0.9-1.1 0.6 0.3 0.3 0.3 0.3 0.3 0.5 0.1 0.4 0.1 0.7 0.4 0.2 0.4-0.1 0.4 0.1 1.1 0.5 0.2 0.2 0.6 1.1 0.7 0.3 1.4 0 0.8 0.3z m-1-13.7l0 0.3-0.1 0.1-0.2 0.2 0.4 0.3 0.4 0 0.4-0.2 0.4-0.1 0.3 0.1 1.3 1-0.3 0.6-0.6-0.4-1.1 1-0.9 0 0.3 0.9 0.4 0.3 1.1 0 0.7 0.3 0.3 0.6 0 0.6-4.1 1.2-1.2-0.3-3.7-2.3-0.5-1 0.2-1.6 0.7-1.4 0.9-0.8 1.1 0 0.5 0.4 0.6 0.2 0.6-0.1 0.5-0.5 0.3 0.4 0.4 0.2 0.4 0 0.5 0z m6.3-14.9l0.7 0.1 1 0 0.9 0.5 0.4 1.1-0.4 0.5-0.8 1.5-0.4 0.3-0.6-0.1-0.5-0.6-0.3-0.7-0.3-0.3-0.6-0.2-1-1.1-2.1 0 0 0.7 0.5 0 0.3 0.2 0.1 0.4-0.3 0.5 0 0.7 1.4-0.1 0.4 0.4 0.1 1.2 0.4 0.8 0.7 0 1.5-0.5-0.9 1.9-1.1 0.8-2.8 0.3-0.3 0.1-0.7 0.4-0.3 0-0.3-0.3-0.4-1.2-0.2-0.2-0.7 0.1-1.9 1.6 0 0.7 3.3 0 2.8-0.8 0.9 0.1 0.8 0.4 0.3 0.3 0.2 0.5-0.1 0.6-1 1.8-1.9-0.1-1 0.1-0.8 0.7-0.7-0.6-1.7 0.1-0.8-0.2-0.5-0.3-0.1-0.2-0.6-1-0.1-0.5-0.3-0.5-0.3-0.4 0.4 0 0.9-0.7-1.6-0.1-2.8-1.9-1.4-0.3-0.4 0.5-0.3 0.4-0.3 0.2-0.4-0.1-0.6-0.3-0.7-0.4-2.1-1.5 0-0.6 1-0.8 0.8-1.5 0.6-1.7 0.8-1.5 1 0.6 3.2-0.6 0 0.6-0.4 0.1-0.9 0.5 0.8 1.2 1.4-1.4 1.5-2.2 1.1-1.1 0 0.6-0.3 0.3-0.2 0.3-0.5 1.1 2.6 1.1 1 0.1 0-0.6-0.4 0-0.6-0.6 1-0.4 2.2-1.7 1.3-0.2 0.6 0.8 0.1 0.8-0.3 0.8-0.8 0.5 0.8 0.5 1.4-0.7 0.6 0.4z m-4.3-4.9l1.9-2.2 0.9-0.2 0.5 0.9-0.9 1-1.3 0.6-1.1-0.1z m-65.5-10.9l0.7 0.6 1.7 0.2 0.8 0.5-0.8 1-1 0.2-1-0.7-0.4-1.8z m73.8-6.1l-0.2 1-0.3 0.6-0.5 0.3-0.6 0.1 0.1-0.8 0-0.2-0.1 0 0-0.3 1.9-1.9 1.1-0.5 0.8 0.6 0 1.9-0.5 0.3-1.7-1.1z m8-27.8l0.5 0 0.2 0 0-0.6-0.6-0.3-0.5-0.9-0.2-1 0.3-0.9 0.9 0.4 1.5 1.8 0.5-0.3 0.4 0.4 0.4 0.5 0.3 0.7 0.2 0.8-3.9 0 0-0.6z m-3.8 41.8l-0.9 0.9-0.3-0.2-2.4-2.8-0.5-0.3-2.8-3.6-0.5-0.4-0.2-0.6-0.4-0.7 0-0.5 0.8-0.2 0.5 0.1 0.4 0.4 0.3 0.7 0.2 1.1 3.8-3.6 0.6-1 1.1-0.3 2.2 0.1-2.3-1.8 0-0.6 2.4-1.4 1.4-0.3 1.4 0.3 0.9 0.7-0.4-0.4-0.5-0.4-0.3-0.3-0.2-0.3-0.1-0.3 0.9-0.5 0.3-0.1 0-0.6-2.7 0-0.6-0.3-1.3-1.3-0.7-0.3-2.7 0.1-1.2-0.4-0.4-1.4-0.6 0.5-0.4 0-2.2-1.7 0.8-0.7 0.5-0.7 0.6-0.6 1 0.1 0-0.6-0.2-0.2 0-0.1-0.1-0.3 1.4-0.2 1.5-0.6 2.8-1.6-4.4 1.2-1.3 0 0.2-0.8 0.3-0.5 0.5-0.1 0.6 0.2 0-0.6-1.3 0 0.4-0.3 0.3-0.4 0.3-0.5 0.3-0.6-2.1 1.4-0.4 0.1-1.3-2.9-0.4-0.5 0.2-1-0.2-0.4-0.4-0.2-0.2-0.5 0.1-1.1 0.5-0.8 0-0.9 0.4-0.1 0.2-0.2 0.1-0.3 0.2-0.5-0.3-0.2-0.3-0.3-0.3-0.2 0-0.5 3.5-0.3 1-0.4-1.2-0.6-0.5-0.5-0.2-1 0.1-1.1 0.2-0.6 0.9-1.1 0.7 0.5 1.8 1 0.4 0.1 0.4-0.3 2.5 1.2 0 0.6-1.4-0.1 0.3 1.2 1 1.6 0.6 0.6-0.1 1.4 0.5 1.9 0.7 1.6 0.7 0.9-0.1-0.8 0-0.5 0.1-1.1-0.4-0.6-0.7-1.6-0.2-0.8 0.4-0.4 0.2-0.6 0.1-0.6 0.1-0.3 2.1-0.5 0.4-0.4 0.8-0.2 1.2 0.6 1.2 1.1 0.5 1.3 1.3-1.9-1.2-0.7-0.4-0.5-0.2-0.6-0.2-1.3-0.2-0.5-0.3-0.1-0.7 0.1-0.3 0-0.1-0.3-0.2-0.8 0-0.2-0.6-0.8-0.2-0.5-0.2-0.5 0.2-0.2 0.2-0.2 0.2-0.1 0.4-0.1-0.3-0.6-0.2-0.5-0.3-0.1-0.5 0 3.8-3.4 1-1.5 0.6 0.4 0.3-0.3 0.3-0.4 0.4-0.3 1.6 0 1.3-0.4 2.9-1.6 0.4-0.3 1.2-1.6 8.3-6.5 2.3-3.1 1.4-1.3 1.1 0.1 1 1.1 0.8 1.6 0.6 1.7 0.2 1.4 0.9 1.5 0.1 0.9-0.8 0.4-0.4 0.5-1.1 3.7 0.4 0.6 0.6 0.4 0.6 0.3 0.7 0 0 0.6-1 0.5-2.1 1.6-0.8 0.9 0.3 0.8-0.1 0.6-0.4 0.4-0.6 0.1-0.5 0.3-0.5 1.2-1.4 0.6-0.1 0.6 0.2 0.8-0.1 0.7-0.4 0.4-0.5 0.2-1.3 0.1 0.8 1.4 1.8 0.5 1.8-0.1 1.3-0.6 2.3-2.5 0.7-0.4 0.9-0.3 0.5 0.1-0.5 0.6 0 0.6 0.3 0-0.2 0.4-0.2 0.6-0.2 0.3 0.1 0.3 0.2 0.9-1.2 0.6-0.4 0.3-0.3 0.4-0.5 0.9-0.2 0.2-0.8 0.5-0.7-0.1-1.3-1-0.8-0.3-2.1 0.3-0.8-0.3-1.4-0.9-0.7 0 1.1 3.2 0.5 1-0.4 0.4-0.2 0.4 0.1 0.4 0.2 0.7-0.9 0.7-2.3 0.5-1.6 2-0.7 0.4-0.5 0-0.7-0.5-0.4-0.1-1.3 1.2-2.4 0.7-0.8-0.1 0 0.7 1.8 0 6.1-1.5 1.4-0.9 0.7-0.1 0.6 0.5 0.4 0.9 0.3 1.1-0.1 1.2 0.2 0.1 0.5 0.5-0.4 0.5-0.4 0.4-0.4 0.2-0.4 0.1 0.5 0.4 0.5 0.2 0.6 0 0.6 0-0.8 1-0.7 1-0.7 0.8-1.2 0.3-4.3-0.8-1-0.4-0.3-0.1-0.3 0.7 0.4 0.4 1 0.4 0.8 0.8 1.6 0.5 0.7 0.9 0 0.6-0.5 0.3-0.7 1.4-0.4 0.6-0.8 0.7-0.6-0.1-0.6-0.3-0.9-0.3 0 0.7 0.2 0.1 0.2 0.3 0.3 0.2 0 0.6-1.1 0.6-0.9-0.2-0.7-0.7-0.6-0.9-0.4-1.2-0.2-0.5-0.5-0.2-0.2 0.5 0.2 1 0.5 1 0.3 0.6-0.3 0.6-1.5-0.8-0.4-0.4-0.3-0.5-0.3-1.1-1.3-2.6-0.3-1.2-0.1-1.2 0.7-2.4 1.3-1.3 1.7-0.5 1.8-0.1 0-0.6-4.5 0 0 0.6-0.2 1-1.1 1.4-1.3 1.3-1 0.6 0.7 0.9 0.9 2.7 0.5 0.5 0.7 0.3 0.6 0.8 0.4 0.8 0.5 0.6-0.3 0.2-0.2 0.2-0.2 0.2-0.4 0 0.4 0.6 0.4 0.3 0.3 0.1 0.2 0.2 0.2 0.6 0.2 1.9-3.9-1-1.6-1-0.4 0.3-0.3 0.5-0.2 0.5-0.4 0.7 0.5 0.3 1 0.5 0.4 0.3 1.1 2 0.2 0.5-0.2 0.7-0.7 0.4-0.8 0.2-0.8-0.1 0 0.6 0.3 0 0 0.5-1-0.2-2.2-1.6-0.3 0.7 0.2 0.2 0.4 0.6 0.3 0.3-0.5 0.9-0.5 0.5-1.2 1.1 0.2 0.1 0.2 0.3 0.2 0.2-0.9 1-2.9 2z m-315.5 12.9l-0.1 0 0-0.1 0.1 0 0.1 0 0 0.1-0.1 0z",
    ORK: "M640.9 232.8l2.1 0.1 1.1 0.6-0.1 1.1-1.3 0.8-0.3 0.4 0 0.8 0.2 0.6 0.1 0.5-0.6 0.6 0.5 1.5 0.2 1.2-0.3 0.9-1 0.7-2.3-2.4 0-0.6 0.7-0.7-0.5-1.4-1.5-2.3 0.6 0.4 0.6 0.2 0.6-0.2 0.5-0.4 0-0.6-3.2 0 0-0.6 1.8-0.8 2.1-0.4z m-13.9 4.3l1.4-0.1 2.8-1.4 1.3 0.2-1.2 1.8-2.3 0.7-4.4 0-0.2-0.5-0.9-2.3-0.2-0.8-0.5-0.5-0.5-0.4-0.4-0.4-1-1.9 0-0.5 0.2-0.4 0.1-0.4-0.3-0.5-0.3-0.2-0.6 0.6-0.2-0.1-0.4-0.4-0.5 0.1-0.4-0.1-0.1-0.9 0.7-1.8 0.1-0.3 1-1.1 2.1-0.8 0.6 0 0.7 0.5 1.6 1.6 1 0.3 0.9 0.6 2.5 3.8-0.7 0.6 0 0.7 0.6 0 0.4 0.3 0.7 0.9 0 0.6-0.9 0.1-1.1 0.4-1 0.8-0.6 1.2z m24.4-16.2l0.7 0.3 0.3 0.8 0 1 0 1.4-0.4 0.6-0.9 0.5-1.8 0.4-0.6 0.4-1 2.1-0.8 0.6-0.7-0.1-3.6-1.5-0.5-0.5-0.5-0.8-1.7-3.7-0.4-0.5-0.5 0.1-0.7 0.9-0.8 0.7-0.8-0.2-0.5 0.4-0.4-0.1-0.5-0.2-0.6-0.1 0.7 1.3-1.5-0.1-0.5 0.3-0.3 1-1.1-0.5-2.8 0.5-1.2-1.2-0.5-2 0.1-2 0.6-1.7 0.7-1.2 0-0.6-0.3-0.6-0.3-0.6-0.2-0.6-0.1-0.7-0.5 0.3-0.4 0.5 0 0.5 0.3 0.6 0 0.6-0.5-0.3-0.4-0.1-0.4 0.1-0.4 0.3 0.5 0.4 0.1 0.6 0 0.7 0.1 0.1 0.2 1.2-0.4 0.8-1.1 1.2 0 0.5-1.6-0.6-1.4-2.3-0.6-3 0.7-2.8 0.3-0.6-0.2-4.1 1.2-2.7 2.1-1.4 2.2-0.5 2.3 0.1 1.2 0.5 1.7 1.6 0.6 0 0.6-0.3 0.5 0 0.5 0.4 0.7 1.1 0.5 0.3-0.7 0.5-0.3 0.1 0.9 1 2.6 1.6-0.3 0.1-0.2 0.1-0.1 0.4 0.2 0.2 0.2 0.2 0.2 0.2-2.8 1.1-0.4-0.2-0.4 1.5-0.9 1.3-1.1 1-0.8 0.3 0.7 0.6 0.9 0.4 1.8 0.2 0.7-0.6 0.7-1.1 0.8-0.6 1.8 1.6 0.6-0.2 0.6-0.6 0.7-0.3 0.7 0.5 0.5 0.8 0.6 0.6 0.8-0.7-0.1 0.4-0.2 1.1-0.1 0.4 1 0.2 0.8-0.5 0.8-0.6 0.8-0.4 1.1-0.1 0.4 0.2 0.3 0.6-0.3 0.9-1.9 1.4-0.7 0.7 0.5 1.2 0.7 0.8 0.8 0.3 0.9-0.3-0.7-1.9-0.3-0.6 0.9-0.1 1.6-1.1 0.7-0.1z m8.7-13.6l-0.3 1 0.3 0.6 1.3 0.8-0.8 0.9-2.1 0.3-1 0.7-0.1-2.1-0.7-1-0.9-0.2-0.8 0.7 0.1 1.4-1 0.4-0.7-0.7 0.9-1.7 0.7-0.3 0.8-0.1 0.5-0.4 0.3-1-0.3-0.6-1.5-1.6-0.5-0.3 1.9-0.7 0.7 0.1 0 0.6-0.2 0.3-0.1 0.3 1.3 0 0.5 0.1 0.4 0.5-0.6-0.2-0.5 0.5-0.1 0.8 0.6 0.9 0.5 0.1 0.6-0.2 1.1-0.6 0.1 0.4-0.1 0.2-0.2-0.1-0.1 0.2z m-21.7-0.7l-1.4-0.1-1.4-0.4-1.2-0.9-1.1-1.4-0.3-1.7 0.9-1.2 1.3-0.7 1.2 0.1 0 0.2 0.1 0.3 0.2 0.4 0.3 0.3 0.3 0.1 0.3 0 2-0.5 0.6 0 0.7 0.4 0 0.5-0.1 0.1-0.1 0-0.2 0.1-0.8 1.1 0.2 1.5-0.1 1.2-1.4 0.6z m8.2-6.3l0.6 0.5 0.5-0.1 0.5-0.3 0.5-0.1 0-0.3-0.2-1.6 0-0.6-0.1-1.2 0.2-0.9 0.5-0.6 0.8 0.1 0 0.7-0.4 0 0 0.6 0.6-0.1 0.6 0.1 0.4 0.4 0.3 0.9-0.3 0.8-1 1.6-0.2 0.4 0 1.5 0.1 1.2 0.3 0.7 0.8 0.1 0 0.6-1.4 0.5-0.8 0.1-0.4-0.3-0.1-1.2-0.4-0.9-0.7-0.5-0.7-0.2 0-1.9z m18-8.8l1-1.6 0.7-0.8 0.2 0.2 0.5 2 0.1 0.9-2.2 0.1-0.9 0.4-0.4 1-0.5 0.5-0.9 2.2-0.3 0.5-0.5 0.3-0.1-2-0.8 0.1-2 2.5 0.2-1 0.1-0.3 0-0.6-0.9 0.6-0.3-0.1-0.4-0.5-1.7 2.4-1 1-0.8-0.2-0.1 1.2-0.3 0.6-0.2-0.2-0.1-1 0.3-1.4 0.3-0.4 0.4-0.2 0.6-0.5 0.5-0.6 0.7-1.4 0.4-0.5 0.6-0.3 0.5 0 0.3-0.3 0.2-1.3-0.2-0.3-0.7-1 1.1 0 1.9-1.2 1.1-0.1 0 0.7-0.6 0.4-0.7 0.7-1.2 1.5 0.3 0.1 0.2 0.1 0.1 0.3 0.6-0.5 1.5-0.3 1.2-1.4 0.8-0.1 0.7 0 0.7-0.2z m-28.2-2.5l-0.5-0.3-0.4 0-0.3-0.1-0.1-0.9 0.9 0 1.5 0.3 0.8-0.3 1.3-1.9 0.7-0.6 0.9 0.7 0 0.4-0.1 0.1-0.1 0-0.1 0-0.5 0.7-0.1 0.5 0.2 0.8-0.9 0.1-0.4-0.1 0 0.6 3.7 1.2 0.7 0.4 0.8 2.3 0.3 0.6 0.5 0.3 0.5 0.1 0.5 0.1 0.4 0.7 0 0.5-0.9 0-0.6 0.5-1.1 1.5 0.1-0.8 0.1-0.6 0.2-0.6 0.3-0.5-2.3-2.3-1.3-0.8-1.3-0.1 0 0.7 0.3 0.3 0.4 1-0.7-0.7-0.3 0.8-0.4 0.2-0.3 0-0.5-0.3-0.3-0.4-0.3-0.5-0.7-1.9-0.1-0.5-0.1-0.5-0.4-0.7z",
    ZET: "M701.8 169.8l0.4-1.6 0.9-0.9 1-0.4 0.9 0 0.1 0.4-0.1 0.2-0.1 0-0.2 0.1-0.6 0.1-0.2 0.4-0.1 0.7 0.6 0 0 0.7-0.8 0.5-0.8 0.9-0.7 0.2-0.3-1.3z m40.6-102l0.8 0.1 0.5 0.6 0.1 0.8-0.2 1.1-1.2 1.1-1.3-0.4-1.4-0.8-1.3 0.1 0 0.7 0.3 0.3 0.1 0.3 0.1 0.3 0.2 0.3-1.3-0.3-1-1.5-1.6-3.3 0-0.7 5.5 0 0.5 0.2 0 0.7 0 0.6 0.1 0.4 0.4 0 0.3-0.2 0.3-0.3 0.1-0.1z m-14.6 18.9l0.4-1.6 0.7-1.1 0.9-0.6 0.9 0-0.6 1.7-3.3 4-0.3 0.7 0.1 0.7 0.2 0.2 0.4-0.5 0.5-0.9 0.2-0.3 0.6-0.4 0.7 0 0.2 1 0 0.5-0.1 1-0.2 1-0.5 0.4-3.6 0.4-0.7 0.3 0.9 1 2.4 0.6 1.2 0.9-2.2 2.3-0.5 0.4-0.2 0.2 0 0.5 0 0.5 0.2 0.4 0.2 0.2 0.3-0.5 0.3 0 0.3 0.2 0.7 0.1 0.2 0.3-1.8 1.9-0.9 0.3-0.8-0.2-0.4-1.3-0.4-0.7-0.5 0-0.3 0.5 0.1 0.6 0.2 0.6 0.4 0.3 0 0.6-0.5 0-0.4 0.1-0.7 0.5 0 0.6 1.9 0-0.3 0.6-0.3 0.7-0.4 1.3 0.9-1.2 0.4-0.5 0.7-0.2-1.4 3.2-0.3 1.4 0.8-1.1 1-0.5 0.5 0.5-0.6 1.7 1.6 1.3 0 0.6-1.4 0 0 0.7 0.4 0 0 0.6-0.8-0.5-0.5 0.4-0.5 0.7-0.8 0 0.7 0.7-0.2 0.8-0.3 0.4-0.3 0.2-0.5 0 0 0.5 0.3 0.1 1 0.6-0.8 1 0.4 1.3 0.9 0.9 0.4 0-0.2 1.3-0.7 0.7-0.9 0.2-0.7-0.3 0.2 1.3 1 2.7-0.4 1-0.7 0-1.4-1 0.2 1.9-0.1 2-0.4 1.7-0.7 1.3-0.2-0.4-0.1-0.2 0.4 1.1 0.1 1-0.1 1.1-0.4 1.3 0.5 0.6 0.1 0.8-0.2 0.7-0.4 0.5-0.2-0.5-0.8-1.4-0.3 0.9-0.4-0.1-0.1-0.7 0.5-0.8 0-0.7-0.7-0.6-1.4 0.3-0.8-0.4-0.6-1.1 0.9-1.2-0.3-1.5 0.4-0.8 0.4-0.4 0.6-0.2 0.5 0.1 0-0.5-0.8-1.1-0.4-0.2 0-0.7 1.2 0-0.2-1.6 0.5-1.5 0.7-1.6 0.7-4.5 0.7-1.8 0.4-1.9-0.2-2.5-0.2-0.4-0.3 0.1-0.3-0.1-0.2-0.9 0.1-0.4 0.1-0.4 0.7-2-0.4 0-0.7 0.6-0.2 0.3-0.5-0.1-0.2-0.3 0.2-0.8 0.6-2.5 0.4-0.9 0.4-0.8 0.5-0.5 0-0.6-0.9-0.1-0.7 1-1.3 2.9-0.6-2.2-0.7-1.5-1-1-1.5-0.4 0 0.7 0.9 0.4 0.7 0.9 0.7 1.1 0.6 1.4-0.4 1.3-0.9-0.9-0.4-0.4-0.6 0 0 1.7-0.3 1.3-0.4 0.2-0.3-1.3-0.5 0.6-0.2 0.9-0.2 1.1-0.3 0.7-0.5 0-1.8-1.3-0.1-0.2-1-1.2-0.2 0.1-0.2-0.9 0-0.4 0.2-0.7 0.6-0.5 1.4-0.4 0.6-0.3-0.6-0.5-1.1-2-0.2 0.8-0.3 1.3-0.5 0.9-0.6 0.1-0.2-0.9-0.3-0.9-0.7 0.2-1.4 1-1.1 0.2-0.4-0.2-0.3-0.3 0-0.5-0.1-0.4-0.4-0.2-0.9-0.2-0.4-0.5-0.5-2.5-0.5-1.8 0.2-0.5 0.7-0.9 0.7-0.6 0.8-0.5 0.9-0.3 0.8 0.1 0.7 0.6 0.5 0.8 0.6 0.6 0.8 0-0.4-1.3 1.6 0.6 0-0.6-0.3 0 0-0.7 2.2-0.3 0.6 0.8 0.1 2.8 0.2-0.1 0.6-0.4 0.2-0.2-0.3-0.5-0.2-1-0.2-0.4 1 0-0.1-0.4-0.2-1 1-0.5 1.3 0.4 1 1.3 0.5 2.1 0.7-1.1 0.6-0.8-1.3-1.4 1-2.5 0.3 0.4 0.3 0.1 0.7 0.1-0.6-1.1 0.8-0.3 2.4 0.1-1.2-0.8-1.4-0.3-1.1-0.8-0.2-2-0.9 1.1-0.5 0.3-0.6-0.1-0.5-0.7-0.1-0.9 0.1-0.9 0.5-0.7 0-0.7-1.4 0-0.7-0.2-0.4-0.5 0.1-1.2-0.1-1.6-0.3-3-0.7 1.8-0.5 1-0.4 0.5-0.8-0.4-0.1-0.7 0.3-0.9 0.6-0.7-1 0-0.8 0.3-0.7-0.1-0.7-0.8-0.5 1.1-0.6 0.3-1.7-0.1-0.1-0.5 0.2-1.1 0.5-1.1 0.4-0.5 1.1 0.1 0.3-0.1 0.3-0.7 0-0.7 0-0.7 0.1-0.5 0.4-0.9 0.6-0.8 0.6-0.1 0.6 1.1 0.6 2 1.5 1.6 1.8 0.6 1.5-0.9-0.5-0.5-0.7-0.1-1.2-0.1-0.3-0.3-0.4-0.7-0.6-0.7-0.7-0.2 0.4-0.7 0.6-1.7 0.2-0.3 0.6-0.1 1.4-1.1-0.5-0.6-0.2-0.1 0.4-0.7 0.2-0.5-0.1-0.4-0.2-0.4 1.2-0.6 1.3 0.2 1.2 0.8 1.2 1 0.1-0.4 0.2-0.3-0.8-1 0.1-0.9 1-2.1 0.5 1.9 0 0.8-0.2 0.6 0.2 0.8-0.1 0.6-0.3 0.4-0.4 0.2 0.3 2.2-0.3 1-0.7 0.7-0.6 1.3 1 0-0.3 0.4-0.2 0.2-0.5 0.1 0.3 0.2 0.1 0.2 0.2 0.1 0.4 0.1-1 3.2 0.5-0.1 0.4-0.2 0.4-0.4 0.3-0.5 0.3 0.6-0.6 1.4-0.2 0.6 0.2 0.6 0 0.7-0.9 0.4-1.1 3.3-0.9 0.8 0 0.7 0.6 0.1 0.6-0.1 0.5-0.2 0.5-0.5 0-1.7 1.2-1 3-0.5-2.2-1.7-0.7-0.9 0.5-0.7 0.6-0.6 0.5 0.3 0.1 1.6 0.4-0.6 0.9-1.7 0.2-0.6 0.5-0.3 0.8 0.6 0.6 0.9-0.3 1.1 0.6 0.3 0.5 0.4 0.3 0.8 0.3 1.1-0.3 0.4-0.1 0.2 0.6 0.6-0.5 0.5-1.1-0.6-0.4 0.5-0.4 0.6-0.5 0.5-0.5 0.3 0.2 0.3 0.6-0.2 1.1-0.5-0.2 0.2-0.5 0.4 0 0.7 1.6-0.9 0.6 0.4 0 1.8 0.4 0 0.2-1 0.1 0 0.3 0.1 0.4-0.4 0.1-0.5 0.2-0.8 0.2-0.7 0.4-0.7 0.2 0.3 0 0.3 0.1 0.8z m5.2-26.8l-0.6 1.1 0.1 0.9 0.8 1.9-0.3 1-0.3 1-1.6-1.8-0.7-0.7-1-0.1 0.6 0.7 0.6 1.2 1.1 2.7-0.6 0.4-0.7 0.2-0.6-0.1-0.7-0.5 0.2 1 0.6 0.6 0.7 0.3 0.8 0.1-0.1 0.3 0 0.1-0.3 0.2 0.8 0.9 0 1.2-0.5 0.9-0.9 0.3 0.7 1.6 0.2 0.8 0.1 1.2-0.2 1.1-0.3 0.3-1.1-0.5-1.2 0-0.6-0.2-0.2-0.7-0.2 0-0.2 0.4-0.1 0.5 0.5 0.7 0 0.6-1.6-0.4-1.1-1.2-0.6-2.1-0.6-9 0.4-2 1.6-0.3 0 0.6-0.2 1.1 0.6 1.2 0.7 0.6 0.5-0.2-0.1-0.5-0.7-2.5-0.1-1.3 0.1-0.6 0.4-1.5-0.1-0.2-0.2-0.4-0.1-0.9 0.1-0.9 0.2-0.8 0.5-1 0.5-0.9 0.6-0.1 0.5 1.7 0.6-1.1 0.9-0.3 2.1 0.2 0 1.2-0.1 0.4-0.3 0.3 0 0.7 0.2 0.1 0.2 0.3 0.3 0.2z m3.8 1.3l-1.4 0.2-0.7-0.3-0.8-0.5 0.3-1 0-0.9-0.1-0.8-0.2-0.7 0.9 0.7 0.2-0.7-0.1-1.4-0.3-1.2 0.8-0.3 0.4-1.3 0-1.5-0.6-0.7 0-0.8 0.8-0.3 0.8-1 0.7-1.1 0-0.9 0.4-1 0.5 0 0.5 0.7 0.2 1.4-0.2 1-0.5 0.6-0.5 0.6-0.4 0.8 0.1 0.2 0.6-0.2 0.6-0.6 0.4-0.5 1-3.5 0.5-0.7 0.3 0.4 0.3 0.1 0.6 0.1 0.6 0.3 0.5 0.4 0.4 0.8 0.2 1.2-0.4 0-0.9 0.6 0.9 0.6 0.4 0-0.7 0.9-1 0.5-0.6 0.7 0.3 1.2 0 0.7-0.9 0 0.3 0.2 0.3 0.2 0.3 0.2 0 0.8-1.9 1.9-0.3 0.6 0.3 1.2 0.7 1 0.3 1-0.7 0.8-0.4 0-0.4-0.2-0.4-0.3-0.4-0.2-0.9-0.1-0.7 0.1z m-19.2 55.9l0.3 0 0.2 0.7-0.3 1-0.3 0.9-0.5 1.5-0.3 0.6-0.2 0 0-0.7 0.2-0.9 0-1.2 0-0.2-0.1 0.6-0.1 0.5-0.7 1.2-0.7 0.6-0.1-0.4 0.6-0.8 0.3-1.1 0.2-1.3 0.4-0.9-0.1-0.6-0.3-0.5 0.1-0.4 0.8-0.2 0.3-0.4 0.3 0 0 0.8-0.3 1.3-0.1 0.5 0.4-0.6z m-34.6-5.8l0.2 0.8 0.1 1.7-0.7 1.1-1.2-0.5-0.8-0.9-0.4-0.5 0.1-0.7 0.4-0.5 0.7-0.5 1.1-0.1 0.5 0.1z m46.4-0.8l0.6-0.5 0 0.6-0.1 1.4-0.3 1-0.4 0.8-0.3 2-0.5 0.3-1.3-1.1-0.5-0.6 0.2-3.1-0.8-1.1 0-1.1 0.9-0.1 0.9 0.4 0.4-0.2 0.1-0.8 0.3-0.2 0.2 0.6 0.1 0.9 0.2 0.8 0.3 0z m6.8-21l0.2 0 0.1 0.4-0.3 0.5-0.6 0.8-0.8 1.2-1.3 1.5-1.9 0.6-0.8-0.6 0.2-0.5 0.2-0.4 0.1-0.5 0.3-0.7 0.5-0.6 0.5-0.3 0.5 0 0.4-0.4 0.4-0.5 1.6-0.1 0.5-0.2 0.2-0.2z",
    IOS: "M484.1 952.7l0.3 0.2 0.4 0.7-0.1 0.6-0.5 0.3-0.6-0.2 0.1-1.1 0.4-0.5z m-1.6-1.8l0.3 0.2 0 0.6-0.2 0.5-0.5-0.2-0.3-0.8 0-0.6 0.3 0 0.3 0.2 0.1 0.1z",
    CAY: "M623 815l2.1-0.2 1.5 1.7 0.3 1 0.9 1.4 0.7 0.4 0.3-0.4 1.9 1 1.3 1.1 1.2 0.8 0.1 0 0.3 0.7 0.9 0.2 0.9 0.6 0 0.8 0 1.1-0.2 1.1-0.1 0.8 0.7 1 1.4 0.8-1 0.5-2.7 0.9 0 0.1 0.1 0.5 1.1 1.3-0.8 1.4-2.6-0.7-2.6 0.2-0.7 0.4-1.4-2.6-2.1-5.2 1.2-0.8 0.1-1.3-1-2.5-1.4-4.4-0.4-1.7z",
    RCT: "M611.3 817.9l1.2-0.8 0.5-0.9 1.1 0.3 0.1-0.3-0.2-0.5 2.2-0.7 0.3-0.4 0.1-1.6 0.3-0.4 0.6 0 0.8 0.4 1 3.9-1.2 0.8 2.8 3.9 3.6 4 0 0.1 2.1 5.2 1.4 2.6-0.4 0.2-1.9 2-0.4 1-0.3 0.2-0.1 0-1.3-1-0.3 0-0.1 1-2-0.5-0.9 0.8-0.5-0.6-1.2-0.2-0.7-0.7-0.5 0-0.5 0.7-0.5-0.3 0.3-2.4 0.3-3.6-1.3-2-1.6-1.3-1.2-0.6 0.2 0-0.1-0.9-1-1.4-0.1-1.4 0.2-2.3-0.2-0.8-1-0.8 0.4-0.7z",
    BGW: "M625.1 814.8l-0.2-0.5 0.1-0.6 0.8-0.6 3.2 0.5 2.1-0.1 0.2-0.1 0.7 0.8 0.6 0.5 0.1 0.6 0.8 1.6 0.2 1.3 0 1.7 0 1.6-0.4 0.3-0.1 0-1.2-0.8-1.3-1.1-1.9-1-0.3 0.4-0.7-0.4-0.9-1.4-0.3-1-1.5-1.7z",
    TOF: "M632.6 814.7l1.1 0 1.1 0 1.6 0.8 0.7 1.5 0 1.8 0.5 0.9 0.8 0.4 0.7 0 0.7 1 0 1.1 0 2 0.2 2 0.5 1.1-0.5 0.1-2.8 1.5-1.4-0.8-0.7-1 0.1-0.8 0.2-1.1 0-1.1 0-0.8-0.9-0.6-0.9-0.2-0.3-0.7 0.4-0.3 0-1.6 0-1.7-0.2-1.3-0.8-1.6-0.1-0.6z",
    MTY: "M618.3 813l0.4 0.2 0.3-0.1 0.2-0.8 0.5-0.2 0.9 1.3 1.3 0.4 0.5 1.3 0.6-0.1 0.4 1.7 1.4 4.4 1 2.5-0.1 1.3-1.2 0.8 0-0.1-3.6-4-2.8-3.9 1.2-0.8-1-3.9z",
    NLK: "M585.9 479.5l0.8-0.3 1.3-1.4 3 0 0.3 1.1 0.2 0.7 1.6-0.2 0.2 0.6-0.3 1.2 1.8 0.1 0.1 1.3 0.5 0.9 2.7 0.1 0.2 0.3-0.2 0.3-1.3 1.4 1.7 1.3 2 0.9 0.3 0.9-0.6 0.5 1.3 1.5 3-1 1.1 0.6-0.2 0.5-1.1 0.4-0.5 0.6 1.2 3.8-0.1 0.8-0.7 1.2 0.1 0.5-2.2 1.7-3.1 1.6-1.6 0.9-0.8-0.2-1.3-1-2.6-2.4-3.9-3.1-0.9-1 0-0.2 0-1.2 0.6-1.2 0-0.5-0.4-0.5-0.8 0-1.1 0-0.7-0.6-1.1-1.1-0.2-0.3-0.4-0.7 0-0.4 1-0.4 2.3 0.2 1.4 0 0.7-0.3 0.5-1.1 0.3-1.4 0-1-0.4-0.4-1.3 0-1.1 0.2-0.5 0.2-0.5-0.8-0.3-1.7 0-1.9z",
    EDU: "M574.7 482l0.3-0.1 2.7 1.7 1.3-0.2 0.4-0.8-0.1-1.6-1-2.4 0.5-0.7 1.4 0.4 2.3 0 1.1 0.8 0.5-0.4 0.3-0.9 0.8-0.2 0.1 0.6-0.1 1 0.4 0.4 0.3-0.1 0 1.9 0.3 1.7 0.5 0.8 0.5-0.2 1.1-0.2 1.3 0 0.4 0.4 0 1-0.3 1.4-0.5 1.1-0.7 0.3-1.4 0-2.3-0.2-1 0.4 0 0.4 0.4 0.7-0.6 0.2-0.7 0.1-1.1-0.1-1.1-0.6-0.8-1.1-0.7-0.5-0.4 0.2-0.2 0.7-0.6 0.6-0.5 0.1-0.5 0-0.7-0.3-0.9-0.3-0.1-0.1-0.3-0.6-0.2-1.8-0.1-3.5z",
    GLG: "M575.1 495.1l0-0.1 0-1 0.1-1.6 0-1.1 0-0.4 0-1.6 0.1-1.4 0.1 0.1 0.9 0.3 0.7 0.3 0.5 0 0.5-0.1 0.6-0.6 0.2-0.7 0.4-0.2 0.7 0.5 0.8 1.1 1.1 0.6 1.1 0.1 0.7-0.1 0.6-0.2 0.2 0.3 1.1 1.1 0.7 0.6 1.1 0 0.8 0 0.4 0.5 0 0.5-0.6 1.2 0 1.2-1.1 0.1-2.1-0.4-1.2 0-0.7 0.4-0.2 0.5 0.4 1.1-0.1 1-0.5 0.9-1.2 0-0.5-0.6-0.1-0.2-0.8-0.8-0.7 0.2-1 0.5-1.3 0.2-0.8 0-0.5-0.1-0.4-0.9 0-1.2z",
    ERW: "M567.6 500.1l0-0.3 0.1-0.3 1.2-0.8 2.3-0.9 2.6-1.9 1.3-0.8 0 1.2 0.4 0.9 0.5 0.1 0.8 0 1.3-0.2 1-0.5 0.7-0.2 0.8 0.8 0 0.8-0.2 0.9-0.4 0.6-0.3 0.4 0.3 1 0.8 0.7 0.5 0.5 0.3 1.2-0.1 1.4-0.2 1.1-0.7 0.2-0.5 0.2-0.2 0-1.4-0.4-3-1.7-7.4-3.3-0.5-0.7z",
    EAY: "M592.6 524.8l-0.7 0.3-0.5 0.3 0.5 1.3-0.2 0.3-3.2 1.6-1.1 1.6-0.2 2 0.6 2-1.3 2.5 0 1.4-1 1.3-0.8-0.4-1-1.6-0.7-0.5-2-0.2-0.3 0.9-0.3 0.1-1.9-0.4-0.6 0.1-1.2 2.7-1.2 1-0.2 1.8-1.2 2-0.3 2.9-0.8 0.7-0.1 1.7-0.7 0.8-0.6 0.1-0.3-2.8-0.6 0-0.4 1.2-0.4 0.3 0-0.6 0.6-1.6 0.5-1.4 0.1-1.8 0-1.5 0-2-0.1-1.3-0.4-1.1-1-1.3-1.4-1.2-1.4-1.1-0.7-0.9-0.5-1.2-0.8-1.4-0.1-0.6 0.5-0.6 1.1 0.2 1.4 0 1.4 0.6 0.9 0 0.2-0.7 0-1.4-0.2-1-0.5-0.8-0.3-1 0.2-1 1-0.8 1.2-1.3 0.2-1.3 0-1.6-0.7-2.2-2.3-1-1.8-1.4-1.7-0.7-0.7-0.8 0.2-0.2 1.6-1.2 1.5-1.1 0.4-1.2 0-0.8-1.5-0.8-1.1 0-1.4 0-1.1-0.2-0.7-0.6 0.4-1 1.2-1.2 1.6-1.9 1.2-2.6 0.7-1.1 0.5 0.7 7.4 3.3 3 1.7 1.4 0.4 0.2 0 0.5 1.6 1 2.1 0.8 1 1 1 0.3 0.9 0 0.6-0.5 0.9-1.1 1.3-0.2 1 0.7 0.7 0.9 0 1.2 0 2.6 0 1.5-0.2 0.8-0.8 0.8-0.7 0.9-0.1 0.9 0.3 1 1.2 0.5 1.2 0 1.5-0.2 1.3-0.5 2.2-0.4 1.6z",
    SLK: "M617.2 499.2l0 0.7 1.1 2.3-0.1 1.3 0.7 0.4 1 0 0.3 0.5-4 4.9-0.1 0.9 0.5 0.4 0.1 0.6-0.4 1.1-1.8 0.3-0.5 0.7 1.1 1.8 0.1 1 0.6 0.5 0.2 0.6-0.2 0.9 0.1 2.2-1.2 1.9-0.1 1.1-1 3.4 1.6 2.3-3.1 2.2 0.1 1.6-0.3 1.2 0 1.6-1.7 0.9-0.3 0.6-0.1 1.6-1.2 0.2-1.4-1.6-1.4-0.9-0.3-0.9 0-2.6-1.6-0.7-1.3-3.1-2.6-3.1-2.5-0.7-3.7 0.1-0.9-0.7-0.3 0.1 0.4-1.6 0.5-2.2 0.2-1.3 0-1.5-0.5-1.2-1-1.2-0.9-0.3-0.9 0.1-0.8 0.7-0.8 0.8-1.5 0.2-2.6 0-1.2 0-0.9 0-0.7-0.7 0.2-1 1.1-1.3 0.5-0.9 0-0.6-0.3-0.9-1-1-0.8-1-1-2.1-0.5-1.6 0.5-0.2 0.7-0.2 0.2-1.1 0.1-1.4-0.3-1.2-0.5-0.5-0.8-0.7-0.3-1 0.3-0.4 0.4-0.6 0.2-0.9 0-0.8 0.1 0.2 0.5 0.6 1.2 0 0.5-0.9 0.1-1-0.4-1.1 0.2-0.5 0.7-0.4 1.2 0 2.1 0.4 1.1-0.1 0 0.2 0.9 1 3.9 3.1 2.6 2.4 1.3 1 0.8 0.2 1.6-0.9 3.1-1.6 2.2-1.7 0.1 0.4 0.4 0 0.7-0.9 0.9-0.5 3.6-0.7 1 0.1 1.2 1.2 2 0.2 3 1.3z",
    MFT: "M454.6 581.6l1.3-0.6 0.2-0.6-0.1-0.6-0.9-1 0.1-1.1 1.3-1.2-0.1-1.7 3.7 0.4 1.6-1.5 0-1.9 0.4-1.1-0.6-0.8 0.5 0.1 1.6-1.5 1.3 0.2 0.7 0.8 1.8-0.6 0.7-0.9 2.6 1.1 1.3-0.3 0.7-0.3 0.3-1 0.8-0.3 0.7 1.8-0.1 0.5-0.2 0.8 0.9 1.3 0.5 1.7-0.1 1.4 0.6 2-0.3 1.4-0.2 0.9-0.1 0.5 0.1 0.8 0 0.1 0 0.2 0.2 0.5 0.2 0.4 0.1 0 0 0.1-0.3 1.8-0.1 0-0.4 0.8-0.4 1 0 0.8-0.1 0.6-0.4-0.4-0.7-0.4-0.1 0-1.7-0.9-0.2 0.8-0.4 0.4-1.3-0.3-2.1 0.7-0.7 0.9-1.1 0-1.8-0.8-1.8-2.4-1 0.4-2.1-0.8-3 1-1-0.3-1.6 0.2-0.5-0.2-0.6-0.8 1.6-0.8 0.3-1.3z",
    OMH: "M418.8 595.1l1.9-2 1.9 0.1 2.5-1.4 0.6-0.1 0.1 0.5 1.6-0.9 1.3-0.2 0.8 0.7 1.1-0.1 0.1-1 1.2-1 1.1-2 2.8-1.4 1.1-1.8 1.2-0.2 0.6 0.4 1.3-1.2 1.7-0.7 4.4 0.3 1.3-0.9 2.8-0.7 1.1-0.7 1.2 0.2 0.9 0.6 1.2 0-0.3 1.3-1.6 0.8-1.2 0.9 0.4 3-0.6 1.5 1.4 1-0.6 0.8 0.5 0.8 1 3-0.5 2.4-0.7 1.5 0.4 0.8-0.2 0.8-1.4 1.3-1.2 0.2-0.2 1.1-0.3 0.2-2.5 0.8-0.6 1.4-0.4 0.4-0.6 0.2-0.7-0.5-0.4 0.4-1-0.1-2.2 0.9-0.6 0.9-0.8 0.3-0.8-0.3-2.2 1-1.6-0.1-0.9 0.6-2.6-0.5-0.9 0.9-1.2 0.2-2 1.4-1.3-0.8-0.6-1-0.5-0.1 0-2.2-0.8-2.2 0.3-1-0.4-0.8 0.8-3 1.3-0.3 0-0.5-0.7-1-2.3 0.3-1.9-1.5-1.5 0.1-1.1-1.8z",
    CKT: "M473.4 600l-0.2 0.1-1.8-0.9-0.9-0.4 0.1 0-2.3-0.9-0.5 0.8-1.8-0.3-0.9 1-0.5-0.3-1.1-1.7-1.3 0.7-1.5-0.3-1.2-0.7-1.4 0.7-0.7-0.2-1.2 0.5-3.1-1 0.5-2.4-1-3-0.5-0.8 0.6-0.8-1.4-1 0.6-1.5-0.4-3 1.2-0.9 0.6 0.8 0.5 0.2 1.6-0.2 1 0.3 3-1 2.1 0.8 1-0.4 1.8 2.4 1.8 0.8 1.1 0 0.7-0.9 2.1-0.7 1.3 0.3 0.4-0.4 0.2-0.8 1.7 0.9 0.1 0 0.7 0.4 0.4 0.4 1.1 1 1.7 2.1 0.8 1.1 0.1 1.1-0.3 1.2-0.4 1.8-0.1 1.4 0 1.4-2.2 1.2-2.1 1.1z",
    CGV: "M472.1 606.2l-0.4-1.3-0.1-1.1-0.8-1.2 0.5-0.4 1.4-1.3 0.7-0.9 2.1-1.1 2.2-1.2 0.2 0.1 2.6-1.4 1.6-0.9 0.4-0.2 0.6 0.4 0.4 0.5 0.5 0.2 0.6 0 0.3-0.5-0.1-1 0-0.5 0.3-0.1 0.6 0.5 0.1 1-0.6 1.3-1 0.6 0.6 0.4 0.4 1.2 0.1 2.2 1.6 1.6 0 0.5-0.6 0.8 0.3 0.5 0.2 1.1 1.4 1.3 0.1 1.3-0.7 0 0 0.8 0.5 0.9-0.9 0.5-0.2 0.7-3.2 0.2-0.9-0.2 0 0.5-0.2 0-2.9-0.8-0.7 0.6-1.3 1.4-1.3-0.1-1.1-1.4 0-1.7-1.2-0.2-2.1-3.6z",
    BNB: "M481.3 621.2l-0.9-1.3 0.2-3.8-0.6-1.1-0.1-1-0.7-1-0.1-1.2 0.7-0.6 2.9 0.8 0.2 0 0-0.5 0.9 0.2 3.2-0.2 0.2-0.7 0.9-0.5-0.5-0.9 0-0.8 0.7 0 2-0.8 0.1 0.8 1.3-0.3 3.6 2.4 0.1 0.3-0.5 0.4 0.2 0.9 2.6 0.9 1.8-0.6 1 0.4 0.5 1 0 0.3-1.5 1.8 0.2 1.6 0.9 2.4-0.1 0.3-0.8 0.2 0.1 0.9-0.5 0.8 0.4 1.1-1.1 0.3-2.2-1.4-0.3 0.1-0.1 1.2-1.3-0.4-2 0.8-1.8-0.2-0.7-0.5-1.1 0.4-4.2-1.6-1 0.3-0.9-0.4-1 0.1-0.7-0.9z",
    ANT: "M494.2 579.6l1.8 1.5-0.1 1.6-0.8 0.5 0.4 1.8 0.8 0.9-0.1 0.8-0.5 0.8 0 1.9 0.3 0.5 1.1 0.2-0.7 0.7-1 0.1-0.2 0.3 0.8 1.6-1 0.5-3.3 0.4-2.5 1.3-1.1 0.1-0.7 0.8-1.6-0.1-0.1-1-0.6-0.5-0.3 0.1 0 0.5 0.1 1-0.3 0.5-0.6 0-0.5-0.2-0.4-0.5-0.6-0.4-0.4 0.2-1.6 0.9-2.6 1.4-0.2-0.1 0-1.4 0.1-1.4 0.4-1.8 0.3-1.2-0.1-1.1-0.8-1.1-1.7-2.1-1.1-1 0.1-0.6 0-0.8 0.4-1 0.4-0.8 0.1 0 0.3-1.8 0-0.1-0.1 0-0.2-0.4-0.2-0.5 0-0.2 0.2 0.2 0.5-0.1 3.6 0.4 1.7-1.6 1.1 0.6 1.2-0.3 1.2 0.4 0.5-0.6 1 0.4 0.2 0.5 1.4 0.1 0.9-1.6 1.9-0.4 3.2 1.2z",
    LSB: "M495 593.3l1.1 1.2 0.5 1.2 0 1 2.1 1.5 0.4 1.7 0.5 0.1 0.2-0.7 0.4-0.4 1.5 1.2 0.3 1 0.7 0.6 0.2 1.5 0.5 0 0.1 0.8 0.8 0.9-0.5 1.1-0.8 0.2-0.2 0.7-0.7 0.4 0.2 1.3-1.3 1.4-0.2 0.5 0.5 1.6-0.8 0.9-1-0.4-1.8 0.6-2.6-0.9-0.2-0.9 0.5-0.4-0.1-0.3-3.6-2.4-1.3 0.3-0.1-0.8-2 0.8-0.1-1.3-1.4-1.3-0.2-1.1-0.3-0.5 0.6-0.8 0-0.5-1.6-1.6-0.1-2.2-0.4-1.2-0.6-0.4 1-0.6 0.6-1.3 1.6 0.1 0.7-0.8 1.1-0.1 2.5-1.3 3.3-0.4z",
    BLY: "M473.8 567.2l-1.3-0.7-0.3-0.5 0.1-1.4-1.4-1.5-0.5-2.1 0.4-0.7 0-0.9-0.5-1.7-0.9-1.3 1.2-1 0.4-0.7 0.3-2.7 1.4-1 1.2 0 0.1-0.5 1.7 0 0.9 0.9 1.1-0.4-0.1 0.5 0.6 0.9 1.4-1 0.8 0 0.7 0.8 0.8 1.6 1 0.4 4.5-1.4 0.1 1.8-0.4 0.8 0.3 0.6 0 1.1 1.6 2.7 0.1 0.6-0.1 0.5-0.8-0.3-1.4 1.2-1.4 0.2-0.7 0.5-1.8-0.1-0.3 0.9 0.2 1.3-0.3 0.4-0.7-0.7-0.5 0.1-0.5 0.7-1.1-0.5-0.9 0.9-1.8 0.4-0.1 0.3 0.5 0.8 0.9 0.7-0.7 0.6 0.2 1.7-1.2-0.6-2.2 0.1 0.1-0.5-0.7-1.8z",
    BLA: "M489.1 560.4l1.1 0.5 0.4 1.6 1 1.3 0.7 0.3 1.1-0.4 0.7 0.4 0.9 1.5 1.5 1.3 0.5 1.1-0.1 2-0.6 1.1 0.5 3.1 1.4 0.6 0.5-0.3 1.1 0 0.9 1.8-0.1 0.6-0.6 0.4-2.8 0.2-0.1 0.4 0.7 1.2-3.6 0.5-3.2-1.2-1.9 0.4-0.9 1.6-1.4-0.1-0.2-0.5-1-0.4-0.5 0.6-1.2-0.4-1.2 0.3-1.1-0.6-1.7 1.6-3.6-0.4-0.5 0.1-0.2-0.2 0-0.1-0.1-0.8 0.1-0.5 0.2-0.9 0.3-1.4-0.6-2 0.1-1.4-0.5-1.7-0.9-1.3 0.2-0.8 2.2-0.1 1.2 0.6-0.2-1.7 0.7-0.6-0.9-0.7-0.5-0.8 0.1-0.3 1.8-0.4 0.9-0.9 1.1 0.5 0.5-0.7 0.5-0.1 0.7 0.7 0.3-0.4-0.2-1.3 0.3-0.9 1.8 0.1 0.7-0.5 1.4-0.2 1.4-1.2 0.8 0.3 0.1-0.5z",
    CSR: "M500.2 598.9l0.3-0.6 2-1 0.6-0.7 1.6-0.2 1-0.7 1 0 0.4-1.7 0.8-0.4 1.6 0.3-0.2 1.8 0.4 0.5-0.1 0.3-0.9 0.6-0.9 1.4 0.3 1-1.7 1.7 0.2 2.7-0.7 0-1.6 1-0.8-0.9-0.1-0.8-0.5 0-0.2-1.5-0.7-0.6-0.3-1-1.5-1.2z",
    WND: "M773 843.1l-1-0.1-1-0.6-0.1-0.1-0.2-0.4-0.2-0.2-0.1 0-2.7 0.3 0-0.4 0.1-0.6 0-0.1-0.1-0.4 0-0.1 0-0.2 0.1-0.3 0.1-0.1 0.8 0 0.1 0 0-0.1 0.4-0.7 0-0.1 0.2 0.2 0.5 0.3 0.9-0.3 0.4-0.1 0.7-0.4 0.6-0.5 0.3-0.2 0.4-0.4 0.3 1.2-0.1 0.3-0.1 0.1-0.7 0.8-0.1 0.1 0 0.1 0 0.1 0.1 0.2 0.1 0.4 0.1 0.1 0.1 0.1 0.1 0.1 0 1.9 0 0.1z",
    MRT: "M767.7 842l2.7-0.3 0.1 0 0.2 0.2 0.2 0.4 0.1 0.1 1 0.6 1 0.1-0.2 0.4 0 0.1 0 0.1 0.4 0.1 0.2 0.4 0.2 0.5 0 0.1 0 0.1-0.1 0.1-0.1 0.1-0.2 0.1-0.2 0.2-0.1 0.1-0.1 0.1-0.2 0-0.3-0.2-0.3-0.1-0.6 0.1-0.3 0.1-1.1 0.2-0.2-0.1-0.1 0-0.1 0.1-0.1 0.1 0 0.1-0.1 0 0 0.1-0.1 0-0.3-0.1-0.1-0.1-0.2-0.3-0.1-0.1 0-0.2-0.2-0.3-0.3-0.5 0-0.5-0.1-0.3 0-0.2 0-0.2-0.1-0.2 0-0.6-0.2-0.4z",
    WSM: "M773.2 837.5l-0.4 0.4-0.3 0.2-0.1-0.3-0.1-0.3 0-0.1-0.1 0-0.5 0.2-0.2-0.1-0.1 0-0.1-0.2-0.2-0.5-0.4-0.5-0.4-0.3-0.2-0.1 0-0.1 0-0.1 0-0.2 0-0.1-0.1 0-0.7-0.2 0.2-0.1 0.1-0.3 0.1 0 0.2 0.1 0.1 0.1 0.4 0.1 0.1 0 0.1-0.1 0.2-0.2 0.4-0.3 1 0 0.1 0.1 0.1 0.1 0.1 0.2 0.2 0.3 0.8 1 0.1 0.1 0.2 0 0.1 0.4-0.7 0.8z",
    KEC: "M772.5 838.1l-0.6 0.5-0.7 0.4-1.3-1.4-0.2-0.2-0.1-0.3 0-0.6 0-0.1 0-0.1-0.4-0.3-0.1 0 0-0.1 0-0.1 0-0.3 0-0.1 0.2-0.2 0.7 0.2 0.1 0 0 0.1 0 0.2 0 0.1 0 0.1 0.2 0.1 0.4 0.3 0.4 0.5 0.2 0.5 0.1 0.2 0.1 0 0.2 0.1 0.5-0.2 0.1 0 0 0.1 0.1 0.3 0.1 0.3z",
    HNS: "M767.7 837.3l0.2 0.1 0.1 0.1 0 0.1 0.1 0.2 0 0.1-0.5 0.1-0.6 0.7-0.5 0.2-1.8 0.1-0.6 0.6 0.3 0.6-2.3 0.4-0.1 0.1-0.4 0.4 0 0.2-0.1 0 0 0.1 0.1 0 0 0.1 0.1 0.1 0.1 0 0.7 0.1 0 0.1-0.5 0.4-0.4 0.5-0.1 0.3-0.3 0.4-0.8-0.9-1.4-0.4-0.4-0.5-0.1-1.2 0.2 0.1 0.5 0 0.2-0.1 0.2-0.2 0-0.1 0-0.6 0.2-0.3 0.4-0.5 0.6-1.3 1.3 0.4 1.2-0.4 1.8 0.3 0.1 0 0.4-0.4 0.9-0.1 0.6 0.3 0.3 0 0.3-0.2z",
    EAL: "M767.7 837.3l-0.3 0.2-0.3 0-0.6-0.3-0.9 0.1-0.4 0.4-0.1 0-1.8-0.3-1.2 0.4-1.3-0.4 1-1.5 0-0.3 0.1-0.1-0.1 0 0-0.2-0.1-0.1-0.2-0.1-1-0.1-0.2-0.1-0.1 0 0-0.1-0.1-0.1 0-0.1 0-0.1 0.1 0 0-0.1 0.6-0.1 1.2-1 1.9-0.1 0.9 0.3 0.3 0.2 0 0.1 0.1 0.1 0 0.6 0 0.1 0.1 0 0.1 0.1 0.5-0.2 0.3 0 0 0.1 0.1 0.2 0 0.1 1.8 0 0.1 1.3-0.1 0.3-0.1 0.4-0.3 0.4z",
    HMF: "M771.2 839l-0.4 0.1-0.9 0.3-0.5-0.3-0.2-0.2-0.6-0.8-0.5-0.2 0-0.1-0.1-0.2 0-0.1-0.1-0.1-0.2-0.1 0.3-0.4 0.1-0.4 0.1-0.3-0.1-1.3 0.4 0 0.2 0.1 0.2 0 0.1 0.1 0.3 0.1-0.2 0.2 0 0.1 0 0.3 0 0.1 0 0.1 0.1 0 0.4 0.3 0 0.1 0 0.1 0 0.6 0.1 0.3 0.2 0.2 1.3 1.4z",
    STT: "M713 595.2l0-0.5 0.8-0.7 0.4-1 0.7 0.6 2.5 0.6 2.7 0.4 2.3 0-0.2 0.9-0.1 1.7-0.6-0.2-0.8 0-0.5 0-0.5 0.4-0.3 0.5-0.4 0.9-0.4 0.9-0.2 1.1-0.1 1.2 0.4 1.1 0.9 0.6 1 0.6-3.6 2-0.3-0.4-1.3 0-0.4-1.7-0.5-0.4-0.3 0.4-1-0.3-0.4 1.2-0.7-0.3 0.6-1 0.4-1.5-1.1-1.9 0.5-1.6 1.1-0.7 0.1-0.6 0.1-1.1-0.8-1.1 0-0.1z",
    DAL: "M700.4 600.8l0-1 0-1.3 0.1-1.6 0.3-1 1-0.4 1.1 0 1.5 0.7 1.1 1.2 1.2 0.1 1.1 0 1.9-0.1 1.6-0.6 1.4-1.5 0.3-0.1 0 0.1 0.8 1.1-0.1 1.1-0.1 0.6-1.1 0.7-0.5 1.6 1.1 1.9-0.4 1.5-0.6 1-0.2-0.8-0.5-0.6-0.6 0-0.3 0.3 0 1 1 2.5-0.2 0.5-0.5 0.3-0.6-0.5-0.5-1.9-0.5-0.6-1.5-0.2 0.3 1.2-0.6 0.1-2.1-2-0.6-1.5-0.5-0.3-1.4 0.3-0.2-0.1-0.3-1.1-1-0.6-0.9 0z",
    MDB: "M722.1 597.2l0 0.7 0.1 1 0.3 1.1 0.5 1.2 0.6 1.1 0.3 0.7-1-0.2-1.6 0.5-0.6 1-0.1 0-1-0.6-0.9-0.6-0.4-1.1 0.1-1.2 0.2-1.1 0.4-0.9 0.4-0.9 0.3-0.5 0.5-0.4 0.5 0 0.8 0 0.6 0.2z",
    RIC: "M769.2 838.9l0 0.1-0.4 0.7 0 0.1-0.1 0-0.8 0-0.1 0.1-0.1 0.3 0 0.2 0 0.1 0.1 0.4 0 0.1-0.1 0.6 0 0.4-0.3-0.1-0.1 0-0.5 0.5-0.7 0.2-0.1 0-0.6-0.4-0.1 0-0.1 0-0.1 0-0.1 0.1 0 0.1 0 0.3 0.2 0.6 0 0.7-0.1 1 0 0.1-0.3 0.5-0.2-0.6-1.1-0.5-0.7 0 0-0.1-1.1-0.9-0.5-0.1 0.3-0.4 0.1-0.3 0.4-0.5 0.5-0.4 0-0.1-0.7-0.1-0.1 0-0.1-0.1 0-0.1-0.1 0 0-0.1 0.1 0 0-0.2 0.4-0.4 0.1-0.1 2.3-0.4-0.3-0.6 0.6-0.6 1.8-0.1 0.5-0.2 0.6-0.7 0.5-0.1 0.5 0.2 0.6 0.8z",
    LND: "M775.8 835.7l0.1 0.1 0 0.1 0.1 0.1 0.1 0.1 0 0.1 0 0.1-0.1 0-0.8-0.3-0.6 0.2 0.1-0.5-0.2-0.2 0-0.1-0.1-0.2 0-0.1 0.2-0.1 0.2-0.1 0.3 0 0.1 0 0.4 0.2 0 0.1 0.1 0.2 0.1 0.3z",
    TWH: "M776.1 836.3l0-0.1 0-0.1-0.1-0.1-0.1-0.1 0-0.1-0.1-0.1 0.2-0.3 0-0.4 0.1-0.1 0-0.1 0.4-0.1 0.2-0.2 0.8 0 0.2-0.1 0.2-0.1 0.2-0.4 0.6-0.3 0.1 0.8 0.6 1.5 0.2 0.2 0.2 0.1 0.1 0.1 0.2 0.4-0.5 0.2-0.1 0-0.1 0.1 0 0.5 0 0.2 0 0.2-0.1 0.3-0.1 0.2-0.1 0-0.1 0-0.3 0-0.3-0.2-0.3-0.5 0-0.5-0.7-0.1-0.5-0.3-0.8-0.5z",
    GAT: "M693.9 570.5l-1.3-0.7-0.1-0.6 1.4-0.8 1-3.5 0.3-0.4 1.2-0.5 0.1-1.1 0.7-0.4 1.9 0.6 2.5 1.5 3.7 1.2 2.1 0.6 0.6 1.2-0.3 1.5-1.4 0.2-1 2.7-0.8-0.6-2.6-0.2-2.4 0.1-3-0.3-2.6-0.5z",
    NET: "M697.2 562.5l1-2.1 1.5-0.4 0.8-0.7 0-0.6-0.9-0.6 0.1-0.8 0.4-0.5 1.8 0.3 1.1 1.9 2.7 2.4 3.7 2.7-1.3 1.2-0.7 1.1-2.1-0.6-3.7-1.2-2.5-1.5-1.9-0.6z",
    YOR: "M735.1 653.9l-1.3-0.3-2.6 1.1-2.6 0-2.9-0.2-1.7-1.4-1.9-3-0.7-2.4 0.1-1.9 0.8-0.5 0.9-0.3 0.8-0.1 0.7-1.3 0.3-1.5 0.5-1 1.1-0.4 1.4-0.6 2.1 0 1 0.1 0.9 0.9 0.2 1.6 0 1.4 0.7 1.3 1.6 0.2 1.2 0-0.1 0.2 0.5 2-0.9 4.2-0.1 1.9z",
    SHN: "M653.6 692.5l-2.8-0.8-0.6 0.8-1.9-1.9 0-2.1-0.5-2.9-0.5-1.9 0.5-0.2-0.1-1.3 0.3-0.6 1.1-0.9 0.5 0.1 0.7 1.3 2.9 3.1 0.7-0.7 1.2 0.6 2.1 0 0.2 1.1 0.8 0.7 0.8 1.1-2.4 0.4-1.1-0.8-1.2 0-0.2 0.8 0.4 0.6 0 1 0.8 0.7-0.2 0.8-1.5 1z",
    ENF: "M778.7 823.5l0.2 0.9-0.3 1.2 0.5 0.2-0.5 0.8 0 0.1-0.1 0 0 0.1 0 0.1 0 0.1 0 0.1 0 0.1-0.1 0.3 0 0.2 0 0.1-0.1 0.1 0 0.1-0.1 0-0.2 0.2-0.1 0.1-0.1 0.1 0 0.1 0 0.2 0 0.1 0 0.1 0 0.1 0 0.1 0 0.1 0 0.1-4.7-0.5 0.5-1.5-2.2-1.8 0-1.5 0.4-0.4 0.5-1 6.4 0.9z",
    HRT: "M783 798.9l0.1 1.4 1.3 0.8 0.1 1.7 0.6 1.4 0.2 2 0.5 1.7 2.3-0.5-0.2 0.8 0.5 0.6 0.1 0.5-1.2 1.3 0 1.7 0.8 0.7-1.3 0.8-0.2 1.2-2.3 1-3.4 0.6-1.7 2.7-0.5 4.2-6.4-0.9-0.5 1-0.4 0.4-0.3 0.4-1.3 0.3-0.8 0.6-0.5-1.1-0.5-0.3-0.3 0.4-0.4 1.7-1.9 0.5-1.2 0.3-2.5 1.5-1.2-0.1-1.5 0-1.3 0.3-0.5-0.5-0.6 0.2-0.2 1.3-0.3 0.5-1.2-1.2-0.3-1.3 0.1-1.2 1.2-2 0-0.6-0.4-0.3-1.5 0.3-0.1-1.4-0.5-1.1 0.1-0.6 1.2-0.9-0.2-0.5-0.7-0.3-1.1 0.5-1.1-1.3-2 0-1.4-0.7-0.6-0.8 0.1-1.3-0.3-0.7-0.8-1-0.7 0-0.9-1.5 0.8-1.5 0.5-0.1 1.3 0.5 0.1 0.5-0.2 0.5 1.1 1.4 1.8 0.1 1.6 0.6 1.3-1.5 0.9 0.2 0.9 1.3 0.3 0 0.8-1 0.4-1.5 0.8-0.9 0.6 0 1.6 0.3 1.8 1.4 0.7-0.1 0.3-0.8 0.9-0.6 0.2-0.5-0.6-1.1 0-1.2-0.9-0.8-0.2-1.2-0.6-1-0.7-1.1 0-1.5 0.6-1.2 0.5-0.6 0.2 1.7 0.2 0.5 0.3 0 0.8-1-0.4-0.9 0.2-0.5 1.7-0.2 1-0.7 1.1 1 0.6 0.1 0.8-1.4 1.7-1-0.2-1.5 0.9-1.3 1.3-0.7 0.5-1 0.6 0.3 0.2 0.5-0.3 1.1 0.8 0.7 0.1 0.8 0.4 0.4 1.9-1.1 1.8-0.5 0.9-0.9 0.5 0.2 2.4 0.5 1.4 3.1z",
    BNE: "M771.4 824l0 1.5 2.2 1.8-0.5 1.5 0 0.1-0.1 0.2-0.1 0.3-0.1 0.2 0 0.1-0.1 0-0.1 0-0.1-0.1 0-0.2-0.1-0.1-0.1 0-0.1 0.1 0 0.1 0 0.1 0.2 0.7-0.1 0.1 0 0.2-0.2 0.2-0.3 0.1-0.1 0.1-0.1 0.9-0.6 0.3-0.2 0.2-0.1 0.2-0.2 0.2-0.9 0.2-1-1.1 0-0.1-0.1 0-0.1 0-0.1 0.1-0.1 0.1-0.1-0.1-0.2-0.2-0.1-0.3-0.1-0.3 0-0.3 0-0.1 0-0.1-1-1.3-1.2-2.1-0.1-0.7 1.9-0.5 0.4-1.7 0.3-0.4 0.5 0.3 0.5 1.1 0.8-0.6 1.3-0.3 0.3-0.4z",
    WFT: "M779.1 825.8l0.1 0.1 1 0.7 0.3 0.8-0.4 0.2 0 0.1-0.1 0.2 0 0.1 0.1 0.1 0.2 0.2 0 0.2 0.1 0.2 0 0.2-0.2 0.6-0.1 1 0.3 1.1-0.1 1.2-1.6 0.1-0.5-0.5-0.1 0-0.6 0.1-0.2-0.1-0.4-0.4-0.2-0.6 0.1-0.3 0.1-0.1 0-0.2 0.1 0 0-0.2 0.1-0.1 0-0.1 0.1-0.1 0-0.1 0.2-0.2 0-0.1 0.1-0.1 0.1-0.2 0-0.1 0.2-0.2 0-0.1 0-0.1 0-0.1 0-0.1 0-0.1 0-0.1 0-0.2 0-0.1 0.1-0.1 0.1-0.1 0.2-0.2 0.1 0 0-0.1 0.1-0.1 0-0.1 0-0.2 0.1-0.3 0-0.1 0-0.1 0-0.1 0-0.1 0-0.1 0.1 0 0-0.1 0.5-0.8z",
    RDB: "M780.5 827.4l0.1 0.4 2.5 1.5 0.6-0.1 0.8-1 1.7-0.2 0.1 0.4 0 1-0.5 0.4-0.1 0 0 0.2-0.1 0-0.1 1.4-0.3 1.1 0 0.3-0.1 0.1 0 0.1-0.1 0-0.2 0-0.4 0-0.2 0.1-0.1 0.1 0 0.1-0.1 0.1-0.1 0.1-0.4-0.1-0.8 0.3-0.1-0.6-0.1-0.2 0-0.1-0.4-0.2-0.1 0-0.3-0.4-0.2-0.1-0.1 0.1-0.1 0-0.3 0.4-0.1 0.1-0.6 0.1 0.1-1.2-0.3-1.1 0.1-1 0.2-0.6 0-0.2-0.1-0.2 0-0.2-0.2-0.2-0.1-0.1 0-0.1 0.1-0.2 0-0.1 0.4-0.2z",
    HAV: "M786.2 828l1.6-0.1 2.2-0.7 0.8 0.1 0.2 0.8 0.9 1.7 0.6 0.8 1.1 0.4 0.4 1.2 0.2 0.3 0.7 1.4-2.6 1-0.3 0.7-1.2-0.2-0.3 1.6-0.8 0.7-0.8 0.4-0.8 0.1-0.1-0.1-0.9-1.2-0.1 0 0-1.2 0.1-0.4 0-0.1 0.1-0.2 1-1.8 0-0.1 0.1-0.3-0.1 0 0-0.1-0.2-0.3-0.1-0.1 0-0.2 0-0.1 0-0.1-0.1 0-0.1 0-0.7 0.4-0.1 0-0.1-0.1-0.1-0.1-0.2-0.4-0.1-0.5-0.3-0.4 0-0.1 0-0.2 0-0.1 0.1-0.2 0.1-0.8 0-1-0.1-0.4z",
    CAM: "M776.9 748.6l2.3 0.8 1.5 0 0.7-0.7 0.5-1-0.2-2.4 0.3-0.3 1.8-0.2 2.4-1.4 1.1 0.1-0.7 4.2 1.8 0.7 0.2 0.8-0.8 1.1 0 0.5 2.9 2.2 0 0.3-1.2 1-0.1 0.9 0.5 0.9-0.5 1.4 0.2 1.6 0.6 0.5 0 0.7 0.8 1.5 0.5 0 1.1-1 2-0.2 1.6 0.9 0.1 0.6 1.5 2.1 2.3 1.8-2.5 1.9-0.2 0.4 0 0.9 1.4 2.7 1.3 1.2 0.1 0.6-0.7 1.1 0 0.6 1.8 0.1 1.8 2.1 0 0.5-0.7 0.7-3 0.9-2.3-1.8 0-0.5-0.7-0.5-0.8 2.5 2 2.5 0.8 0 0.8-1 1 0.3 0.6-0.4 0.9 0.9 1.1-0.1 0.6 0.8 0 0.6-0.9 2.6 0.1 1.2-0.7 0.2-1.1-0.4-0.4 0.3-1 1.1-0.2 1.2-1.4 1.9 0.6 3.4-0.8 0.6 0.4 0.7-0.5 0.6-1.2-0.7-1.9-2.3-0.8-0.6-1-0.2-1.4 0.6-2.3-0.4-0.6 0.4 0 1.5-0.8 0.7-1.8 0.5-1.1-1.1-0.4 0.1 0.1 2.1-1.3 1.9-1.4-3.1-2.4-0.5-0.5-0.2-0.9 0.9-1.8 0.5-1.9 1.1-0.4-0.4-0.1-0.8-0.8-0.7 0.3-1.1-0.2-0.5-0.6-0.3 0.8-4-0.1-0.9-1.8 0.3-2.2-0.3-0.2-0.2 0.7-1.1-1.9-0.8-0.1-0.2 0.7-0.7-0.1-0.5-0.8-1-1.8-0.8 0-1.6-1.8-0.4-0.7 0.4-0.4-0.3-0.7-1.1-0.1-2-2.2-0.8-0.5-1.4-1.4-0.9-0.1-1.1-1.2-2 0.1-1.3 2.7-1.3 0.5-1 1.6-1.2 2-2.8 0.2-0.6-0.6-2.6-2.8-1.7 0.4-2-0.8-1 0.1-0.7 0.8 0.1 0.7 1 1.2 1.4 1.4 1.5 1.9 0.3 0.7-0.9 1.5-1.3 1.1-1.5 1-0.4 2.5-1.5 2.5-0.5 1.2-0.2 0.3-0.2 0.3-0.8 0-1.5 0-3.1z",
    BEX: "M789.7 837.7l-0.3 0.3-0.1 0.6 0.3 0.4-0.5 1.1-1.4 1.5-1 1.5 0.3 1.4-1.4-1-1.3-0.1-0.7-0.6-0.6-0.8 0-0.1 0.3-0.7 0.1-0.2 0-0.4-0.1-0.8 0-0.2 0-0.1 0-0.1 0.3-0.3 0.1-0.1 1-0.2 0.1-0.1 0.1 0 0-0.1-0.1-0.7 0.1-0.9-0.1-0.3 0.4-0.1 1-0.1 0.8 0.4 0.1 0 0.9 1.2 0.1 0.1 0.8-0.1 0.8-0.4z",
    STN: "M768.7 845.5l0.2 0.3 0.1 0.1 0.3 0.1 0.1 0 0-0.1 0.1 0 0-0.1 0.1-0.1 0.1-0.1 0.1 0 0.2 0.1 1.1-0.2 0.3-0.1 0.6-0.1 0.3 0.1 0.3 0.2 0.2 0 0.1-0.1 0.1-0.1 0.6 0.7 0.1 0.2 0 0.2 0.3 0.9 0 0.2 0 0.2 0 0.5-0.1 0.3-0.1 0.1-0.5-0.1-0.2 0.1-0.2 0.1-0.1 0.3 0 0.1-0.1 1 0 0.1-0.2 0.1-1 0-0.7-1.4-0.4-0.1-1.5 0.9 0.1-1.9-1.2-1.5 0.3-0.4 0.1 0 0-0.1 0.2-0.2 0.1-0.1 0.2-0.1z",
    MIK: "M738.6 796.5l0.5-0.5 0-1.4 1-0.2 0.3-0.2 0-0.6-1.1-1.1-0.7-1.2-0.5-0.3-0.1-0.8 2.5-0.8 0.6-0.8 0-0.6 0.3-0.5 1.4 0.4 0.7-1.2 1.5 0 3.5-2.3 1.6 1.3-0.5 2.2 2 2.2 0.7 1.6-2.1 1.7-0.1 0.2 0.3 0.7-1.2 0.5-0.8 1.3 0.9 0.2 0.4 0.6-0.2 1.8-1 1.3 0.6 2-0.7 1-1.4 0-1.6-0.1-2.7-2.1-2.8-2.6-1.3-1.7z",
    BKM: "M754.2 812.8l-0.9-0.2-1.3 1.5-1.6-0.6-1.8-0.1-1.1-1.4 0.2-0.5-0.1-0.5-1.3-0.5-0.5 0.1-0.8 1.5 0.9 1.5 0.7 0 0.8 1 0.3 0.7-0.1 1.3 0.6 0.8 1.4 0.7 2 0 1.1 1.3 1.1-0.5 0.7 0.3 0.2 0.5-1.2 0.9-0.1 0.6 0.5 1.1 0.1 1.4 1.5-0.3 0.4 0.3 0 0.6-1.2 2-0.1 1.2 0.3 1.3 1.2 1.2 1 3.1-0.6 4.2-0.6 1.3-0.7 0.1-0.4-0.9 0.1-0.9-0.2-0.5-1.6 0.2-0.2-1.4-0.3-0.3-0.6 0-0.2 0.5-1.5-0.8-1.3 0.3-0.2 0.5 0.3 1.2 0.3 0.8-1.2 0.1-0.8-0.2-1.1-0.9 0.1-0.8 0.5-0.9 0.2-1.5-0.5-0.8-1.1-0.3-1.1 0.1-0.8 0.5-0.7-0.1-3.4 1.1-1-0.3-0.6-0.3-0.3 0.2-2.1-1.7 0.2-0.8 0.8-0.7 0-0.5-0.3-0.4-0.7 0.1-0.5-1.4 0.6-1.2-0.5-0.7 0.7-0.3 0.2-1.4 0.4-0.2 1.7 0.4 0.1-0.3-0.4-1.2 0.3-1.2-0.3-1.2-1.3-1.9-2.5-1.1-1.2 0.5-1.3-0.3-1 0.7-1.2-0.6-0.7-1.6-1.3-0.5-0.3-2.6-0.7-1 0.2-0.5 0.4-0.3 2.2 1 1-0.7 0-0.8-0.7-1.4 0-1.2-0.7-0.7-0.2-0.8 0.3-1.6 1.3-1.6 0-0.2-1.2-0.1-0.4-0.6 0.3-1.2 1.1-1.9-0.3-0.3-2.3-0.9-1.6-0.7 1.1-1.3 1-0.7 2.8-0.7 0.7-0.9 1.5 0.2 1.9-0.9 0.4 0.2 1.9 4 0.5-0.1 1.1-1 1.3 1.7 2.8 2.6 2.7 2.1 1.6 0.1 1.4 0-0.6 0.9-0.8 2.6 1.2 0.4 1.7 1.6 1-0.3 2 1.9 0.5 1.2 0.8 0.9 0 0.6z",
    HIL: "M760.8 837.4l-0.6 1.3-0.4 0.5-0.2 0.3 0 0.6 0 0.1-0.2 0.2-0.2 0.1-0.5 0-0.2-0.1-1.5-0.4-1.1-1.4 0.6-1.3 0.6-4.2-1-3.1 0.3-0.5 0.2-1.3 0.6-0.2 0.5 0.5 1.3-0.3 1.5 0 0.4 2.2 0.1 0.1 0 0.1 0 0.1 0.1 0.1 0 0.1 0 0.1 0.8 1.9 0.1 0.4-1.2 1-0.6 0.1 0 0.1-0.1 0 0 0.1 0 0.1 0.1 0.1 0 0.1 0.1 0 0.2 0.1 1 0.1 0.2 0.1 0.1 0.1 0 0.2 0.1 0-0.1 0.1 0 0.3-1 1.5z",
    BEN: "M770.8 834.8l-0.2 0.2-0.1 0.1-0.1 0-0.4-0.1-0.1-0.1-0.2-0.1-0.1 0-0.1 0.3-0.2 0.1-0.3-0.1-0.1-0.1-0.2 0-0.2-0.1-0.4 0-1.8 0 0-0.1-0.1-0.2 0-0.1-0.3 0-0.5 0.2-0.1-0.1-0.1 0 0-0.1 0-0.6-0.1-0.1 0-0.1-0.3-0.2-0.9-0.3 0.1-0.5 0.1-0.1 0-0.4 0.1-0.2 0.2-0.1 0-0.1 0.1 0 0-0.1 0-0.2 0-0.2 0.1-0.1 1.4-0.5 0-0.1 0.1 0 0-0.1-0.1-0.2 0-0.1 0.7-0.9 1 1.3 0 0.1 0 0.1 0 0.3 0.1 0.3 0.1 0.3 0.2 0.2 0.1 0.1 0.1-0.1 0.1-0.1 0.1 0 0.1 0 0 0.1 1 1.1 1.1 1.3 0.1 0.5z",
    LUT: "M761.2 805.1l0.6 1 0.2 1.2 0.9 0.8 0 1.2 0.6 1.1-0.2 0.5-0.9 0.6-0.3 0.8-0.7 0.1-1.8-1.4-1.6-0.3-0.1-0.3-0.8-1.2-0.3-0.8 0-1 0.3-1.1 0.3-0.7 1 0 1.9-0.1 0.9-0.4z",
    HRW: "M763.9 833.2l-1.9 0.1-0.1-0.4-0.8-1.9 0-0.1 0-0.1-0.1-0.1 0-0.1 0-0.1-0.1-0.1-0.4-2.2 1.2 0.1 2.5-1.5 1.2-0.3 0.1 0.7 1.2 2.1-0.7 0.9 0 0.1 0.1 0.2 0 0.1-0.1 0 0 0.1-1.4 0.5-0.1 0.1 0 0.2 0 0.2 0 0.1-0.1 0 0 0.1-0.2 0.1-0.1 0.2 0 0.4-0.1 0.1-0.1 0.5z",
    CBF: "M758 810.7l-0.6 0-0.8 0.9-0.4 1.5-0.8 1-0.3 0-0.9-1.3 0-0.6-0.8-0.9-0.5-1.2-2-1.9-1 0.3-1.7-1.6-1.2-0.4 0.8-2.6 0.6-0.9 0.7-1-0.6-2 1-1.3 0.2-1.8-0.4-0.6-0.9-0.2 0.8-1.3 1.2-0.5-0.3-0.7 0.1-0.2 2.1-1.7 3.3 1.9 2.1-0.4 3.1 0.8 2.5-2.9-0.2-3 0.9-2.7 3.3-1 0.8 1 0.1 0.5-0.7 0.7 0.1 0.2 1.9 0.8-0.7 1.1 0.2 0.2 2.2 0.3 1.8-0.3 0.1 0.9-0.8 4-0.5 1-1.3 0.7-0.9 1.3 0.2 1.5-1.7 1-0.8 1.4-0.6-0.1-1.1-1-1 0.7-1.7 0.2-0.2 0.5 0.4 0.9-0.8 1-0.3 0-0.2-0.5-0.2-1.7-0.5 0.6-0.6 1.2 0 1.5 0.7 1.1-0.9 0.4-1.9 0.1-1 0-0.3 0.7-0.3 1.1 0 1 0.3 0.8 0.8 1.2 0.1 0.3z",
    BDF: "M757.7 775.5l1.4 0.9 0.5 1.4 2.2 0.8 0.1 2 0.7 1.1 0.4 0.3 0.7-0.4 1.8 0.4 0 1.6 1.8 0.8-3.3 1-0.9 2.7 0.2 3-2.5 2.9-3.1-0.8-2.1 0.4-3.3-1.9-0.7-1.6-2-2.2 0.5-2.2-1.6-1.3 1-1.8-0.1-1.7-0.4-1.1 0.1-0.5 2.4-0.5 0.6 0.2 0.9 1.1 0.8 0.2 0.5-0.3 0.3-0.8 0-1.8 1-1.5 2.1-0.4z",
    RUT: "M748.7 741.7l0 0.1 2 0.1 1 0.5 1.1-0.2 1.7 1.2 0.5 1.2 4.7 1.8-0.2 0.9-1.4 1-2.1 0.9-0.8-0.2 0.2 0.8 0.8 0.5-1.4 1-1.3 2.5-6.2 3.7-0.8 1.5-1.5 1.3-0.6-0.5-1-1.5-1.1-2.5-0.6-2.4-0.1-1.9 0-2.7 0.1-1.4-0.2-1.1 0-1.6 1-0.8 2.6 0.2 2.2-1.3 1.4-1.1z",
    NTT: "M736.1 683.9l1.4 1.3-0.1 0.4-0.8 0.5 0.2 0.2 5.1 0.4-0.3 1 0.2 0.8 0.4 0.8 0.7 1.4 0 0.4 0 0.5-0.3 0.8 0.1 0.5 0.2 0.3 0.3 0.2 0.3 0.4 0.7 2.5 0.1 0.6-0.2 0.9-0.9 2.5-0.4 3.5 2.5 0.4 0.9-0.9 1.2-0.1 1 0.9 0.6-1 0.3 0.1 0.1 0.6-1 1.3-0.3 1.1-1.3 0-0.7 0.8-1.1 0.2-0.7 1.6 0.1 0.6 0.2 0.1 1.5 0.1-0.2 1.6 0.2 1.7-0.4 0.8 0.6 0.9-0.5 1 0.8 1 0.3 1.6-2.3 1.1-0.9 1.4-1.1 0.9-0.2 1.5 0.9 2-1.2 0.3-1.3 1.3-0.1 0.9-1.3 2.8-2.2 2-1.3 0.4-0.2 0.2 0.2 0.8-1 1.2-1.1 0.7-0.2 1-0.3 0.3-3.4 0.3-0.8-0.6-1.4 0.3-1.6 1.3-1.5 0.4-1.1 1.1-1.7-0.5-1.6-1.6-0.4-1.5 0.2-3.3 0.9-0.3 0.6-1.2-1.8-1.4 0-1.6-0.6-2.1 0-3.1-1.8-2.1 0-1.6-0.4-1.3 0.4-1.1 1-0.8 0.4-0.7-1-3.7 0.1-0.9 1.6-0.9 1.5 0.2 0.7-0.9 1.8-0.4 0.1-0.3-0.3-1.1 0.3-1.9-0.3-1.7 0.3-0.8 0.9-0.6 0.4-1-0.2-0.8 0.2-1-0.7-0.6 0.5-1 1.4-1.5-0.4-1 1.1-0.6 0.3-0.8-0.2-1.8 1.4-1.9 1-0.8 1.8-0.1 0.7 0.5 0.4-0.3 1.3-1.8 0.4-2.2 2.3-2z m-11.8 48.1l1.4-1.5 1.8-2.1 0-1.6-0.6-1.7-0.9-1.6-1.2-1-1.5 0.2-1.1 1.8-0.5 1.9-0.1 2.2 0.8 1.9 0.6 1 1.3 0.5z",
    NTH: "M759.8 756.2l-0.1 0.7 0.8 1-0.4 2 2.8 1.7 0.6 2.6-0.2 0.6-2 2.8-1.6 1.2-0.5 1-2.7 1.3-0.1 1.3 1.2 2 0.1 1.1-2.1 0.4-1 1.5 0 1.8-0.3 0.8-0.5 0.3-0.8-0.2-0.9-1.1-0.6-0.2-2.4 0.5-0.1 0.5 0.4 1.1 0.1 1.7-1 1.8-3.5 2.3-1.5 0-0.7 1.2-1.4-0.4-0.3 0.5 0 0.6-0.6 0.8-2.5 0.8 0.1 0.8 0.5 0.3 0.7 1.2 1.1 1.1 0 0.6-0.3 0.2-1 0.2 0 1.4-0.5 0.5-1.1 1-0.5 0.1-1.9-4-0.4-0.2-1.9 0.9-1.5-0.2-0.7 0.9-2.8 0.7-1 0.7-1.1 1.3 1.6 0.7-0.5 0.2-0.9 1.2-1.1 0.2-1.1 0.7-2.3-0.1-1 0.3-0.5-0.3-1-3.8-0.4-0.7 0.1-2.5-0.6-0.4 1.5-0.8 1.4-0.2 0.3-0.5-3.9-5 0.2-0.7 0.7-0.7 2.5-1.1 0.2-0.8-1-1.2 0-0.5 2.7-1.7 0-1.7-0.8-0.8 1.1-1.4-0.3-0.4-1.6-0.4-0.3-0.6 0.7-0.6 2.5-0.9 0.7-0.7-0.1-0.9-0.9-1.7 1.4 0.3 1.1-2 1.5-1.6 2.6 1.7 1.1-2.3-0.5-0.3-0.2-0.4 0.2-0.2 3.3-1.5 1.2 0.2 1.9 1.1 0.6 0 0.6-1.2-1-0.9 1-2.4 0.4-0.3 1.4 0.5 2-0.3 1.3 0.6 1.3-0.4 0.2-0.2 1.5-1.3 0.8-1.5 6.2-3.7 1.3-2.5 1.4-1 0.8 0.9 0.4 1.2-0.4 3.2 0.6 0.4 2.2-0.3 0 0.5z",
    CMD: "M773.9 836.7l-0.1-0.4-0.2 0-0.1-0.1-0.8-1-0.2-0.3-0.1-0.2-0.1-0.1-0.1-0.1-1 0-0.4 0.3-0.1-0.5-1.1-1.3 0.9-0.2 0.2-0.2 0.1-0.2 0.2-0.2 0.6-0.3 0.6 0 0.9 0.2 0.1 0.2 0 0.3 0 0.3 0.6 0.7 0.2 0.6 0 0.1 0 0.1 0 0.2 0 0.2 0 0.1 0.3 0.2 0.1 0 0 0.1 0.1 0.2 0 0.1 0.2 0.2-0.1 0.5-0.2 0-0.3 0.3-0.2 0.2z",
    ISL: "M775.1 834.9l-0.3 0-0.2 0.1-0.2 0.1-0.1 0-0.3-0.2 0-0.1 0-0.2 0-0.2 0-0.1 0-0.1-0.2-0.6-0.6-0.7 0-0.3 0-0.3-0.1-0.2 0.1-0.2 0.6-0.3 0.2 0 0.1 0 0.1 0.1 0.2 0.4 0.4 0.3 0.5 0.4 0.1 0.1 0 0.2 0 0.1 0.4 0.1 0.1 0.1 0 0.1 0 0.1-0.8 1 0 0.1 0 0.1 0 0.1z",
    PTE: "M756.2 750.3l1.1-0.5 1.5 0.5 1.6 0 4-2.1 2.5 1.2 2.9-0.6 0.8 1.1 1.1-0.2 1.1 0.4 1.6-1 0.9 0.1 1.5-0.6 0.1 0 0 3.1 0 1.5-0.3 0.8-0.3 0.2-1.2 0.2-2.5 0.5-2.5 1.5-1 0.4-1.1 1.5-1.5 1.3-0.7 0.9-1.9-0.3-1.4-1.5-1.2-1.4-0.7-1-0.8-0.1 0-0.5-2.2 0.3-0.6-0.4 0.4-3.2-0.4-1.2-0.8-0.9z",
    LBH: "M773 843.1l0-0.1 0-1.9-0.1-0.1-0.1-0.1-0.1-0.1-0.1-0.4-0.1-0.2 0-0.1 0-0.1 0.1-0.1 0.7-0.8 0.1-0.1 0.1-0.3-0.3-1.2 0.7-0.8 0.2-0.2 0.3 0.2 0 0.1 0.1 0.1 0.1 0.2-0.1 0.3 0 0.1 0.1 0.1 0 0.2 0 0.4 0.1 0.1 0.5 1 0.1 0.3 0.1 0.2 0 0.1 0 0.1 0 0.1-0.5 0.7 0 0.1 0 0.1 0 0.2 0.2 0.3 0.1 0.5 0.5 1 0 0.1 0 0.1-0.1 0 0 0.1-1.2-0.2-0.3 0.1-0.9 0.6-0.4-0.1 0-0.1 0-0.1 0.2-0.4z",
    SWK: "M774.6 836.2l0.6-0.2 0.8 0.3 0.1 0 0.8 0.5 0.5 0.3 0.7 0.1 0 0.5-0.2 0-0.1 0-0.1 0.2-0.3 0.1-0.4 0.2 0 0.1-0.1 0.1 0 0.1 0.2 0.6 0 0.4 0.1 0.3 0.1 0.2 0.3 0.4 0 0.1 0 0.1-0.2 0.4 0 0.1-0.1 0.1-0.5 0.1-0.1 0.1-0.1 0.2-0.1 0.5-0.4 0.5 0 0.1 0 0.1-0.1 0-0.1 0.1-0.1 0-0.1 0.1-0.5-1-0.1-0.5-0.2-0.3 0-0.2 0-0.1 0-0.1 0.5-0.7 0-0.1 0-0.1 0-0.1-0.1-0.2-0.1-0.3-0.5-1-0.1-0.1 0-0.4 0-0.2-0.1-0.1 0-0.1 0.1-0.3-0.1-0.2-0.1-0.1 0-0.1-0.3-0.2 0.3-0.3 0.2 0z",
    DNC: "M721.6 673.4l0.7 0.1 0.7-1.5 2.2-0.2 0.6 0.6 0.6 0 0.7-0.8 1.8-0.3 3.6-1 2.6 0.3 3.8 1.9-0.1 1 0.1 0.6 0.2 1.1-0.2 1.3-0.4 0.3-0.6-0.2-1.1 0.7 0.6 0.5 0.1 0.9 0.8 0.7 0 1.1-0.4 0.3-1.6-0.4-1.3 1.1 1.1 2.4-2.3 2-0.4 2.2-1.3 1.8-0.4 0.3-0.7-0.5-1.8 0.1-1 0.8-1.4 1.9-2.9-1.7-2.9-2.6-0.8-2.8-3.1-0.7 1.4-2.8-1.4-2.2-0.9-3.1 1.8 0.4 3-1.7 0.6-1.9z",
    CRY: "M773 845.4l0.2-0.2 0.2-0.1 0.1-0.1 0.1-0.1 0-0.1 0-0.1-0.2-0.5-0.2-0.4 0.9-0.6 0.3-0.1 1.2 0.2 0.1 0.2 0.8 1.4 1 0.7 0.8 1.1 1.5 3.7-0.6-0.7-1.3-0.1-0.9 1.2-0.9-0.1-0.9 0.4-0.8 1.4-1.2 0.2-1.1-1-0.6-1.3 1 0 0.2-0.1 0-0.1 0.1-1 0-0.1 0.1-0.3 0.2-0.1 0.2-0.1 0.5 0.1 0.1-0.1 0.1-0.3 0-0.5 0-0.2 0-0.2-0.3-0.9 0-0.2-0.1-0.2-0.6-0.7z",
    LEW: "M776.1 842.8l0-0.1 0-0.1 0.4-0.5 0.1-0.5 0.1-0.2 0.1-0.1 0.5-0.1 0.1-0.1 0-0.1 0.2-0.4 0-0.1 0-0.1-0.3-0.4-0.1-0.2-0.1-0.3 0-0.4-0.2-0.6 0-0.1 0.1-0.1 0-0.1 0.4-0.2 0.3-0.1 0.1-0.2 0.1 0 0.2 0-0.2 0.5 0.1 0.1 0.5 0.4 0.1 0 0 0.1-0.1 0.2 0.1 0 0 0.1 0.2 0.4 0 0.1 0.1 0 0.1-0.1 0-0.1 0.1-0.1 0.8 0.2 0 0.1 0 0.1-0.1 0.1 0 0.1 0 0.1 0 0.2 0.1 0.1 0 0.1 0.1 0.2 0.3 0.2 0 0.1 0 0.1 0 0.2 0 0.1 0.1 0.2 0 0.1 0.8 0.9 0.1 0.1 0 0.1-0.1 0.1 0 0.1-0.2 0.1-0.1 0-0.7-0.2-0.3 0.1-0.3 0.5-0.1 0.1-0.1 0.1-0.2 0-0.9-0.6-2.2-0.2z",
    HRY: "M773.1 828.8l4.7 0.5-0.2 0.2 0 0.1-0.1 0.2-0.1 0.1 0 0.1-0.2 0.2 0 0.1-0.1 0.1 0 0.1-0.1 0.1 0 0.2-0.1 0 0 0.2-0.1 0.1-0.1 0.3-1.5 0-0.2 0.1-0.1 0.1 0 0.1 0 0.1-0.1 0.6-0.4-0.3-0.2-0.4-0.1-0.1-0.1 0-0.2 0-0.6 0.3-0.1 0.2-0.9-0.2-0.6 0 0.1-0.9 0.1-0.1 0.3-0.1 0.2-0.2 0-0.2 0.1-0.1-0.2-0.7 0-0.1 0-0.1 0.1-0.1 0.1 0 0.1 0.1 0 0.2 0.1 0.1 0.1 0 0.1 0 0-0.1 0.1-0.2 0.1-0.3 0.1-0.2 0-0.1z",
    KTT: "M767.7 842l0.2 0.4 0 0.6 0.1 0.2 0 0.2 0 0.2 0.1 0.3 0 0.5 0.3 0.5 0.2 0.3 0 0.2 0.1 0.1-0.2 0.1-0.1 0.1-0.2 0.2 0 0.1-0.1 0-0.3 0.4-1.2 0.9-1.1 2.4-0.9 0.4-0.2-1.7 0.8-1.8-0.4-1 0.3-0.5 0-0.1 0.1-1 0-0.7-0.2-0.6 0-0.3 0-0.1 0.1-0.1 0.1 0 0.1 0 0.1 0 0.6 0.4 0.1 0 0.7-0.2 0.5-0.5 0.1 0 0.3 0.1z",
    NWM: "M780.1 836.7l-0.2-0.4-0.1-0.1-0.2-0.1-0.2-0.2-0.6-1.5-0.1-0.8 0-0.1 0-0.2 0-0.4 1.6-0.1 0.6-0.1 0.1-0.1 0.3-0.4 0.1 0 0.1-0.1 0.2 0.1 0.3 0.4 0.1 0 0.4 0.2 0 0.1 0.1 0.2 0.1 0.6 0 0.5 0 0.2 0.3 0.4 0.1 0.1 0.6 0.3 0 0.1 0.1 0.2 0.1 0.1 0 0.1-0.1 0.2-0.1 1.2-1.1 0.4-1.1 0.1-1.4-0.9z",
    GRE: "M778.1 837.7l0.3 0.5 0.3 0.2 0.3 0 0.1 0 0.1 0 0.1-0.2 0.1-0.3 0-0.2 0-0.2 0-0.5 0.1-0.1 0.1 0 0.5-0.2 1.4 0.9 1.1-0.1 1.1-0.4 1.1-0.4 0.1 0.3-0.1 0.9 0.1 0.7 0 0.1-0.1 0-0.1 0.1-1 0.2-0.1 0.1-0.3 0.3 0 0.1 0 0.1 0 0.2 0.1 0.8 0 0.4-0.1 0.2-0.3 0.7 0 0.1-0.3 0.5-0.3 0.2-0.1 0-0.1 0-0.1-0.1-0.2-0.4-0.7-0.7-0.3 0-0.5 0.1 0-0.1-0.1-0.2 0-0.1 0-0.2 0-0.1 0-0.1-0.3-0.2-0.1-0.2 0-0.1-0.1-0.1 0-0.2 0-0.1 0-0.1 0.1-0.1 0-0.1 0-0.1-0.8-0.2-0.1 0.1 0 0.1-0.1 0.1-0.1 0 0-0.1-0.2-0.4 0-0.1-0.1 0 0.1-0.2 0-0.1-0.1 0-0.5-0.4-0.1-0.1 0.2-0.5z",
    HCK: "M775.8 835.7l-0.1-0.3-0.1-0.2 0-0.1-0.4-0.2-0.1 0 0-0.1 0-0.1 0-0.1 0.8-1 0-0.1 0-0.1-0.1-0.1-0.4-0.1 0-0.1 0-0.2-0.1-0.1-0.5-0.4 0.1-0.6 0-0.1 0-0.1 0.1-0.1 0.2-0.1 1.5 0 0.2 0.6 0.4 0.4 0.2 0.1 0.6-0.1 0.1 0 0.5 0.5 0 0.4 0 0.2 0 0.1-0.6 0.3-0.2 0.4-0.2 0.1-0.2 0.1-0.8 0-0.2 0.2-0.4 0.1 0 0.1-0.1 0.1 0 0.4-0.2 0.3z",
    BDG: "M782.7 833.7l0.8-0.3 0.4 0.1 0.1-0.1 0.1-0.1 0-0.1 0.1-0.1 0.2-0.1 0.4 0 0.2 0 0.1 0 0-0.1 0.1-0.1 0-0.3 0.3-1.1 0.1-1.4 0.1 0 0-0.2 0.1 0 0.5-0.4-0.1 0.8-0.1 0.2 0 0.1 0 0.2 0 0.1 0.3 0.4 0.1 0.5 0.2 0.4 0.1 0.1 0.1 0.1 0.1 0 0.7-0.4 0.1 0 0.1 0 0 0.1 0 0.1 0 0.2 0.1 0.1 0.2 0.3 0 0.1 0.1 0-0.1 0.3 0 0.1-1 1.8-0.1 0.2 0 0.1-0.1 0.4 0 1.2-0.8-0.4-1 0.1-0.4 0.1-1.1 0.4 0.1-1.2 0.1-0.2 0-0.1-0.1-0.1-0.1-0.2 0-0.1-0.6-0.3-0.1-0.1-0.3-0.4 0-0.2 0-0.5z",
    LEC: "M743.3 725.1l0.1 1.4 0.8 0.6 0.1 0.6-0.9 2.6 0.5 0.9 0 1 1.4 0.3 0.7 1.4 0.8 2.5 0.7 0.7 0.6 3 0.6 1.6-1.4 1.1-2.2 1.3-2.6-0.2-1 0.8 0 1.6 0.2 1.1-0.1 1.4 0 2.7 0.1 1.9 0.6 2.4 1.1 2.5 1 1.5 0.6 0.5-0.2 0.2-1.3 0.4-1.3-0.6-2 0.3-1.4-0.5-0.4 0.3-1 2.4 1 0.9-0.6 1.2-0.6 0-1.9-1.1-1.2-0.2-3.3 1.5-0.2 0.2 0.2 0.4 0.5 0.3-1.1 2.3-2.6-1.7-1.5 1.6-1.1 2-1.4-0.3-1.2-2.6-1.3-0.8-2.5-4.1-4.8-2.6-0.4-1-0.6-0.7-3.6-1.6-1.1-1.4-1.3-0.5 0.1-1.6-0.7-1.6 1-0.6 0.1-0.9-2.1-2.7-0.2-0.7 2.3-1.6 0.2-0.6-0.6-1.5 0.1-1 0.4-0.3 2.7 0.1 1-0.3 0.2-0.2-0.1-0.8 1.1-1.4 1.5-0.5 0.4-1.3 0.9-1.6-0.1-0.3 1.5-1.4 1.7-1 1.8 0.1-0.2 3.3 0.4 1.5 1.6 1.6 1.7 0.5 1.1-1.1 1.5-0.4 1.6-1.3 1.4-0.3 0.8 0.6 3.4-0.3 0.3-0.3 0.2-1 1.1-0.7 1-1.2-0.2-0.8 0.2-0.2 1.3-0.4 2.2-2 1.3-2.8 0.1-0.9 1.3-1.3 1.2-0.3z m-16.7 30.7l2.7-2.4 0.4-2.1-0.7-1.9-2.3-0.6-1.8 0-1 1.3 0 1.6 0.6 3.3 2.1 0.8z",
    CHE: "M656.3 723.2l0.2-2 0-1.3-1.2-0.7-1.1-0.9 0.7-3.3 1.9-1.3 3-1.5 2.8-1.6-0.2-1.7 0.3-1.4 1.7 0.5 0.8-2 1.1-2-0.5-2-2.6-2-1.5-3.7 2.9-1.9 0.6-1.4 0.2-0.6 1.6 0.5 1.4 0.9 2.3 0.2 1.5 1.4 1.1-0.2 1-0.8 1.7 0.1 1.3 0.6 0.1 0.6-0.1 0.6 0.7 0.7 0.9-0.5 0.5-1.9 0.5-0.6 1.8-0.1 1.5 0.7 0.7-1.2 0.8-0.3-0.1 0.6 0.9 1.3 0.1 0.9 0.1 5.6 0.2 1.7 1 0.9-0.3 1.8-1.4 1.7-1.1 0.1-1.8 1.5-1.6 0-1.1-0.7-0.6 0.1-0.1 0.3 0.5 0.9-0.2 0.6-1.1 0.2-2.2 2.7-1.8 2.1-0.1 0.2-1.2 0.5-1.6-0.2-1.4 1.8-1.4 0.3-0.4 1.2 0.3 2.9-0.5 0.8-2.1 0.9-0.4 1-0.8 0.7-1.4 0.2-1.6-0.6-0.7 1.1-1.4-0.7-1 0.2-0.5-1.8-1.6-0.7z",
    DBY: "M724.1 699.2l0.7 0.6-0.2 1 0.2 0.8-0.4 1-0.9 0.6-0.3 0.8 0.3 1.7-0.3 1.9 0.3 1.1-0.1 0.3-1.8 0.4-0.7 0.9-1.5-0.2-1.6 0.9-0.1 0.9 1 3.7-0.4 0.7-1 0.8-0.4 1.1 0.4 1.3 0 1.6 1.8 2.1 0 3.1 0.6 2.1 0 1.6 1.8 1.4-0.6 1.2-0.9 0.3-1.8-0.1-1.7 1-1.5 1.4 0.1 0.3-0.9 1.6-0.4 1.3-1.5 0.5-1.1 1.4 0.1 0.8-0.2 0.2-1 0.3-2.7-0.1-0.4 0.3-0.1 1 0.6 1.5-0.2 0.6-2.3 1.6-0.7 0-0.4-0.6-0.7 0.7-0.8-0.1-0.3-1.6-1.7-0.7-0.9-0.8 1.3-2.5 2.1-1.1 0.6-2 1.2-1-0.8-1.5-1.1-0.8-4.2-0.4-0.7-0.4-0.9-1.2-1.6 0-0.5-0.6-1.1-0.1-0.2-1.2-0.6-1.1 0-1.5 0.8-0.1 0.3-0.3 0.3-1.3-0.1-1.2 2.6-1.6 0.5-1.4-0.1-1.7-0.7-0.8-0.3-0.7-0.3-2.3 0.2-1.5-1.3-2.2 0-1.8-0.2-0.6-1-1.1-1.5-1-3.5-1.5-1-1.5-1.1 0.5 0.3-1.8-1-0.9-0.2-1.7-0.1-5.6-0.1-0.9-0.9-1.3 0.1-0.6 0.6-0.2 1.1-1.9-0.5-0.7-0.9-0.5-0.1-0.5 0.2-0.6 1.2-1.3 0.2-2 0.7-2 1.5-0.1 0.6-0.4 0.4-1.6 0.6-0.9 1.3 0 2.5 1.3 1 1.5 0.1 1.5 0.3 0.7 2.6 2.2-0.3 1.5 0.2 0.9 1.5 0.5 0.5 1.3 0.7 0 1.4 0.9 0 0.6-0.4 0.7 0.2 0.6 2.7 1.1 0.5 0.6 0 0.3-1.3 0.9-0.2 0.5 0.2 0.2 1 0.3 0.8-0.2 1.9 1.2 3.4-1.4 1.2-1.3 1.8-0.1 0.5 0.3 0.1 1.1 1 0.6 1.3 0.1 0.5-0.3 0.5-0.9 1.1-0.3 0.5 0.3-0.3 1.1 1 0.1 0.9 0.6 3.1-0.2z m-12 35.2l0.5-0.8 0.7-1.5 0.4-1.6-0.2-1.4-0.9-1-1.5-0.9-1.5-0.3-0.8 0.6-0.9 1.3-0.8 1.2-0.3 1.7 2.4 2.3 1.7 0.3 1.2 0.1z",
    ROT: "M726.8 692.5l0.2 1.8-0.3 0.8-1.1 0.6 0.4 1-1.4 1.5-0.5 1-3.1 0.2-0.9-0.6-1-0.1 0.3-1.1-0.5-0.3-1.1 0.3-0.5 0.9-0.5 0.3-1.3-0.1-1-0.6-0.1-1.1-0.5-0.3 0-4.6-0.6-2.1 0-2.7 1.7-1.9 2.1-0.7 3.1 0.7 0.8 2.8 2.9 2.6 2.9 1.7z",
    SHF: "M713.9 696.7l-1.8 0.1-1.2 1.3-3.4 1.4-1.9-1.2-0.8 0.2-1-0.3-0.2-0.2 0.2-0.5 1.3-0.9 0-0.3-0.5-0.6-2.7-1.1-0.2-0.6 0.4-0.7 0-0.6-1.4-0.9-0.7 0-0.5-1.3-1.5-0.5-0.2-0.9 0.3-1.5-2.6-2.2-0.3-0.7-0.1-1.5-1-1.5 10.6 1.5 1.5 2.2 2.2 0.2 2.2-0.2 0.8 3 0.9 1.6 1 0 0.6 2.1 0 4.6z",
    STE: "M674.1 715.4l1.8-2.1 0.6 2.3 1 1.4 1 1.1 1.2 2.1 1.2 2.8 0.4 1.8-0.3 1.3-0.7 0.6-1.5 0.2-1.6-0.5-1.1-1.5-0.5-1.8-0.5-3-0.3-2.3-0.3-1.5-0.4-0.9z",
    TFW: "M670.3 741.7l-0.7 1.4-1.9 4.9-0.8 1.9-0.8 1.6-0.5 1.1-0.6 0-1.1-0.8-2.2-2.2-3.2-3.2-3-2.7-1.1-1.6 0.8-1.3 2.7-0.7 2.5-1.3 2.9-1 2.6-1.5 1-0.3 1.4 1.1 0.3 1-0.5 0.7 0.1 0.2 2.1 2.7z",
    STS: "M666.9 736l-0.2-0.2 1.1-1.1 0.6-3.6-0.7 0-2.5 1.3-0.7-1.4-0.1-0.9 0.4-1.2 1.1-1.8 1.1-1.1 0.9 0 0.3-0.5 0.3-0.9-0.1-1-0.3-0.6-0.3-0.1 0.5-0.8-0.3-2.9 0.4-1.2 1.4-0.3 1.4-1.8 1.6 0.2 1.2-0.5 0.1-0.2 0.4 0.9 0.3 1.5 0.3 2.3 0.5 3 0.5 1.8 1.1 1.5 1.6 0.5 1.5-0.2 0.7-0.6 0.3-1.3-0.4-1.8-1.2-2.8-1.2-2.1-1-1.1-1-1.4-0.6-2.3 2.2-2.7 1.1-0.2 0.2-0.6-0.5-0.9 0.1-0.3 0.6-0.1 1.1 0.7 1.6 0 1.8-1.5 1.1-0.1 1.4-1.7 1.1-0.5 1 1.5 3.5 1.5 1.5 1 1 1.1 0.2 0.6 0 1.8 1.3 2.2-0.2 1.5 0.3 2.3 0.3 0.7 0.7 0.8 0.1 1.7-0.5 1.4-2.6 1.6 0.1 1.2-0.3 1.3-0.3 0.3-0.8 0.1 0 1.5 0.6 1.1 0.2 1.2 1.1 0.1 0.5 0.6 1.6 0 0.9 1.2 0.7 0.4 4.2 0.4 1.1 0.8 0.8 1.5-1.2 1-0.6 2-2.1 1.1-1.3 2.5 0.9 0.8 1.7 0.7 0.3 1.6 0.8 0.1 0.7-0.7 0.4 0.6 0.7 0 0.2 0.7-1 1.6-1.4 1-0.1 0.3 0.4 1-0.5 1.4 0 1.5-0.4 0.6-1 0.4-4.2-0.3-1.1 0.3-0.5-0.9-1.2-0.3-0.8 0.2-1.1 1-0.3-0.1-0.7-0.7-0.2-1.5-0.7-0.9-0.1-2.5-1.7-1.2-0.3 0-0.3 0.5 0 1.2-0.3 0.4-3.4 1.7-1.2-0.1-0.7 0.7-1.5-2-1.5 0.3-0.4 0.4-0.2 0.9-1.8 1-0.2 0.8-0.7 0.8 1.2 0.9 0.8 1.6 1.1-0.1 0.4 0.3-0.4 1.1 0 1.1-2 1.1 0.9 1.8 0.2 4.2-0.8 0.1-2.3-1-1.9-0.1-1.2-0.6 0.1-0.8-0.7-1.6 0-0.7 0.7-1.6 1.4-1 0.1-1.2-0.7-1.1 0.7-1.1-0.8-1.2-1.9-1-0.1-0.6 0.4-0.8 1.7 0.4 1.4-0.7 0.5-1.8-0.2-1.1 0.1-0.6-0.1-0.8-0.6-0.6-2.3-0.3-0.6-0.5-0.2-1.1 0.3-1.6-0.1-0.9-0.9-1.1-2.1-2.7-0.1-0.2 0.5-0.7-0.3-1-1.4-1.1z",
    BRY: "M787 844.5l0.1 0.8-0.6 2.5-1.2 1-0.5 1.3-1.1 1-0.1 1.7-1.2 0.4-0.7-0.5-0.2-0.4-1.3 0.4-0.2-2.2-0.2-0.1-1.5-3.7-0.8-1.1-1-0.7-0.8-1.4-0.1-0.2 0-0.1 0.1 0 0-0.1 0-0.1 0.1-0.1 0.1 0 0.1-0.1 0.1 0 2.2 0.2 0.9 0.6 0.2 0 0.1-0.1 0.1-0.1 0.3-0.5 0.3-0.1 0.7 0.2 0.1 0 0.2-0.1 0-0.1 0.1-0.1 0-0.1-0.1-0.1-0.8-0.9 0.5-0.1 0.3 0 0.7 0.7 0.2 0.4 0.1 0.1 0.1 0 0.1 0 0.3-0.2 0.3-0.5 0.6 0.8 0.7 0.6 1.3 0.1 1.4 1z",
    WOR: "M655.5 773.7l1.1 0.6 0.3 0.4 0.1 0.8 0.5 0.3 2-0.3 0.4-1.7 1-0.7 1.5 1 0.9 0 0.3-0.8-0.3-1 0.2-0.5 2.8-0.5 0.5-0.5 0.1-0.7 0.3-0.3 3.3-0.1-0.3-0.4-1.1-2.6 0.5-0.9 1.6 0.3 0.9-1 1.2 0.6 1.9 0.1 2.3 1 0.8-0.1 1.6 0.1 1.7-1.1 1.2 1.1 0.5-0.9 0.8-0.2 0.4 0.9 0.7-0.2 1.1 0.7 0 0.6-0.9 1.3 0.3 1.1 0.6 0.1 1.3-0.7 1.4 0.1 1.2-0.6 2.6 0.8 0.1 0.5-0.5 1.1-1.1 1.3 0.1 0.5 1.1 1.2 0.1 1-0.9 0.8-0.7 1.9-1.7 0.7-0.1 0.5 0.9 2.2 0 1.5-1 1.2-0.4 1.4-0.6 0.9 0.7 0.4 0.7 1.2 1.1 0.8 0.3-0.8 0.4-0.4 1.7 1 0.5-0.5 0.8 0.7 1.2 0.3 0.2 1 0.9 0.3 0.3 0.5-1 0.5-1.7 2.3-1.3-0.3-1 0.8 0 0.3 0.7 0.4 1 1.4 0.1 1.2-0.3 0.9-0.6 0-1.6-1.6-1.2-0.2-0.7 0.3-1.1-0.2-1.3 0.3-2.8 2-2-0.6-1.6 0-1.1 0.9-0.6-0.8 1.3-2.7-2.3 0.1-0.3 0.5-0.3 2 0.8 0.9-0.7 0.6-1.5-0.2-1.3 2-0.8 0.1-2.6-0.8-0.5-1.5-1.1-1.7-0.5 0.1 0.1-1.1 0-1.9 0.1-1.8 0-1.3-0.1-1-0.5-1.1-0.7-0.4-0.8-0.3-0.6-0.9-0.2-1.1 0-1.7 0.2-2-0.5-1.1-1.1-0.3-0.8-0.5-0.2-0.5 0.3-1 0.3-0.7-1.2-0.5-0.7 0-0.6 0.5-0.5 0.6-0.7 0.6-1.1 0.1-1.4 0-1.2 0-0.6-0.8 0.2-1.1 0-0.8-0.8-1.1-0.5-2.4 0.1-0.7z",
    WAR: "M701.8 800.3l0-0.4 0.8-0.9 1.1-2-0.4-0.3-1.7 0.3-0.8-0.3-1.6-2.6-0.4-1.5-1-0.3-0.9-1.3-0.3-0.5-0.9-0.3-0.2-1-1.2-0.3-0.8-0.7-0.5 0.5-1.7-1-0.4 0.4-0.3 0.8-1.1-0.8-0.7-1.2-0.7-0.4 0.6-0.9 0.4-1.4 1-1.2 0-1.5-0.9-2.2 0.1-0.5 1.7-0.7 0.7-1.9 0.9-0.8-0.1-1-1.1-1.2-0.1-0.5 1.1-1.3 0.5-1.1-0.1-0.5 0.4 0.2 0.6 0.3 0.4 1 0.8 0.9 1.8 1.1 0.3-0.8 1.8-0.6 1.5 1 0.5-0.5 1.5-0.1 1.8-0.9 0.5-0.9 1.3 0.1 1.2 1.3 1.2-0.9 2.3 0.1 1.4-1.3-0.3-3.6-0.2-0.4-0.6-0.2-7.7-0.5-1.9 1.5-1-1.2-2.8-4.4 0.4-1.1-0.9-1.8 0-0.9-0.9-1.2-0.3-1 1.1-0.3 4.2 0.3 1-0.4 0.4-0.6 0-1.5 0.5-1.4-0.4-1 0.1-0.3 1.4-1 1-1.6 2.1 2.7-0.1 0.9-1 0.6 0.7 1.6-0.1 1.6 1.3 0.5 1.1 1.4 3.6 1.6 0.6 0.7 0.4 1 4.8 2.6 2.5 4.1 1.3 0.8 1.2 2.6 0.9 1.7 0.1 0.9-0.7 0.7-2.5 0.9-0.7 0.6 0.3 0.6 1.6 0.4 0.3 0.4-1.1 1.4 0.8 0.8 0 1.7-2.7 1.7 0 0.5 1 1.2-0.2 0.8-2.5 1.1-0.7 0.7-0.2 0.7-0.6 0.8-0.3 1.3-1.6 1.3 1.1 1-0.3 0.7-1 0.3-1.3-1.2-0.9-0.1-0.5 0.1 0 1.1-0.2 0.1-1.4 0.2-0.2 0.9-1 1.2 0 1.6-0.6 3.2-0.4 0.8-1.3 0.2-0.2 1.2-1.7 0.2-0.3 0.8-0.5 0.1-2.3-2.2z",
    OXF: "M700.3 823.4l1.6 0.4 0.3-0.5-0.2-0.5-1.3-1.3-0.2-2.1-0.6-2.3-0.8-1 1.4-1.6 0.2-4.4 0.8-2.1 1-0.9-0.4-1.2 1.5-1.6 0.1-0.6-0.3-0.5-1.8-1 0.2-1.9 2.3 2.2 0.5-0.1 0.3-0.8 1.7-0.2 0.2-1.2 1.3-0.2 0.4-0.8 0.6-3.2 0-1.6 1-1.2 0.2-0.9 1.4-0.2 0.2-0.1 0-1.1 0.5-0.1 0.9 0.1 1.3 1.2 1-0.3 0.3-0.7-1.1-1 1.6-1.3 0.3-1.3 0.6-0.8 3.9 5-0.3 0.5-1.4 0.2-1.5 0.8 0.6 0.4-0.1 2.5 0.4 0.7 1 3.8 0.5 0.3 1-0.3 2.3 0.1 1.1-0.7 1.1-0.2 0.9-1.2 0.5-0.2 2.3 0.9 0.3 0.3-1.1 1.9-0.3 1.2 0.4 0.6 1.2 0.1 0 0.2-1.3 1.6-0.3 1.6 0.2 0.8 0.7 0.7 0 1.2 0.7 1.4 0 0.8-1 0.7-2.2-1-0.4 0.3-0.2 0.5 0.7 1 0.3 2.6 1.3 0.5 0.7 1.6 1.2 0.6 1-0.7 1.3 0.3 1.2-0.5 2.5 1.1 1.3 1.9 0.3 1.2-0.3 1.2 0.4 1.2-0.1 0.3-1.7-0.4-0.4 0.2-0.2 1.4-0.7 0.3 0.5 0.7-0.6 1.2 0.5 1.4 0.7-0.1 0.3 0.4 0 0.5-0.8 0.7-0.2 0.8 2.1 1.7 0.2 1.5 0.2 0.7 0.2 0.4 0.1 0.4-0.4 0.8-0.3 0.5-0.9 1.1-1.1 0.5-1.6 1.1-1.1 0.1-0.7-0.4-1.8-1.8-0.8-0.3-1-0.2-1.1-0.4-0.9-0.6-0.7-0.9-0.4-1.2-1.8 0.6-0.9-0.1-1.1-0.7-1.7 0.1-1.2-1.3-0.8-0.3-0.7 0.2-0.8 1-1.3-0.6-1 0.7-1.4-0.3-1.5 0.5-1.7-1-2.3-0.3-1.5 0.3-0.4 0.4-0.4 1.8-0.9-0.2-2-3.7-1.1 0.1-0.3-0.4-0.1-2 0.8-0.9 0.3-1.5-1.4-1.4-0.1-1.5 0.1-0.7z",
    WGN: "M650.3 682.1l1.8-1.5 0.4-1.5 0.6-0.9-0.2-1.2 0.4-1.9 0.5-0.2 2-0.4 0.5 0.9 0.3 0 1.3-1.4 0.6 0.2 0.8 0.9 1.9 3.5 0.4 1.4 0.4 1.8 0.8 4.1-1.8 0-0.7 1.1-1.3 1-0.8-1.1-0.8-0.7-0.2-1.1-2.1 0-1.2-0.6-0.7 0.7-2.9-3.1z",
    SKP: "M684.7 693.1l-0.8 0.3-0.7 1.2-1.5-0.7-1.8 0.1-0.5 0.6-0.5 1.9-0.9 0.5-0.7-0.7 0.1-0.6-0.1-0.6-1.3-0.6-1.7-0.1-1 0.8-0.3-2 1.5-2.4 0.4-2.9 2.2 0.7 2.6 1.5 3.2 0 2.1-0.3 0.9 0.5 0.5 0.7-1.1 1.9-0.6 0.2z",
    WRT: "M661.7 696.3l-1.1 0.8-1.1 0.6-0.7 0-0.5-0.2-0.5-0.8-0.7-1-0.3-0.2-0.8-0.1-1.5-1.2-0.9-1.7 1.5-1 0.2-0.8-0.8-0.7 0-1-0.4-0.6 0.2-0.8 1.2 0 1.1 0.8 2.4-0.4 1.3-1 0.7-1.1 1.8 0 1.8 3.4 0.1 1-0.8 1.4 0.3 0.2 1.2 0.5-0.2 0.6-0.6 1.4-2.9 1.9z",
    WBK: "M730.9 847.8l-0.9-0.5-0.5-0.9-0.8-0.2-1.6 0.4 0.1 1-0.5 0.2-5.8-1.1-7.3-0.1-1.7 1.4 0.4 0.9-0.2 0.4-2.6 0.2 0.1-0.9-0.5-0.8-0.1-0.8-1.6-0.9-1.4-2.6 0.4-0.6 1.5-0.4 0-0.7-0.3-1.2-1-0.8-1.3-2.1-0.1-1-0.2-1.1 0.4-1.8 0.4-0.4 1.5-0.3 2.3 0.3 1.7 1 1.5-0.5 1.4 0.3 1-0.7 1.3 0.6 0.8-1 0.7-0.2 0.8 0.3 1.2 1.3 1.7-0.1 1.1 0.7 0.9 0.1 1.8-0.6 0.4 1.2 0.7 0.9 0.9 0.6 1.1 0.4-0.2 4.2 1.4 1.6 0.8 2.1 0.3 2.2z",
    WOK: "M739.2 848.2l-1.5-0.1-1.6-0.7-2.2 0.2-1.4-0.3-1.6 0.5-0.3-2.2-0.8-2.1 1.3 0 2-0.8 0.9-2.4 1.6-1.1 1.1-0.5 0.9-1.1 0.3-0.5 0.4-0.8-0.1-0.4-0.2-0.4-0.2-0.7-0.2-1.5 0.3-0.2 0.6 0.3 1 0.3 0.8 2.8 0.1 2.7 0.8 2.5-0.1 2.8-1.3 2.1-0.6 1.6z",
    BRC: "M743.3 849.6l-1.5-0.6-1-0.7-1.6-0.1 0.6-1.6 1.3-2.1 0.1-2.8-0.8-2.5 2.5 0.4 2.9 0.8 1.4 1.7 0.2 2-1.7 0.9 0.8 1.9-1.1 0.2-2.1 2.5z",
    WNM: "M739.5 833.7l3.4-1.1 0.7 0.1 0.8-0.5 1.1-0.1 1.1 0.3 0.5 0.8-0.2 1.5-0.5 0.9-0.1 0.8 1.1 0.9 0.8 0.2 1.2-0.1 1.5-0.1 0.6 0.5 0.6 0.9 0.1 2.3-0.7 1.4-0.4 1.7-0.9 1.2-1.8 0.4-1.9 1.2-0.8-1.9 1.7-0.9-0.2-2-1.4-1.7-2.9-0.8-2.5-0.4-0.1-2.7-0.8-2.8z",
    SLG: "M749.4 837.4l-0.3-0.8-0.3-1.2 0.2-0.5 1.3-0.3 1.5 0.8 0.2-0.5 0.6 0 0.3 0.3 0.2 1.4 1.6-0.2 0.2 0.5-0.1 0.9 0.4 0.9-0.4 1.9 0.1 0.9-0.6 0.4-2.1-0.9-0.1-2.3-0.6-0.9-0.6-0.5-1.5 0.1z",
    RDG: "M728.6 837.7l1 0.2 0.8 0.3 1.8 1.8 0.7 0.4 1.1-0.1-0.9 2.4-2 0.8-1.3 0-1.4-1.6 0.2-4.2z",
    SRY: "M781.7 852.7l0.1 1.7 0.4 1.8-0.9 2.5 0.7 2.1-0.2 1 0.3 2.4-1.9 0-1-0.1-2.5 0.1-1.1-0.4-2 0.5-0.8-0.3-0.2-1-1.9-0.7-5.7 3.3-2.3 0.1-3.2 1.4-2.6 0.1-1.3 0.7-0.8-0.2-1 0.7-2.8 0.2-1.2-0.6-1.7 0.9-1.1 0.1-2.1-0.5-1-0.8 0.4-1.1-0.1-0.6-1.5-0.9-0.6-1.7-1.5-0.4 0-2.3-0.8-1.6 0.6-1.6 0.5-0.9 0.8-0.1 2.4 0.5 0.8-0.9 0.3-1.9-0.2-1.7-1.7-2.9 2.1-2.5 1.1-0.2 1.9-1.2 1.8-0.4 0.9-1.2 0.4-1.7 0.7-1.4 2.1 0.9 0.6-0.4-0.1-0.9 0.4-1.9 0.7-0.1 1.1 1.4 1.5 0.4 0.1 1.2 0.4 0.5 1.4 0.4 0.8 0.9 0.5 0.1 1.1 0.9 0 0.1 0.7 0 1.1 0.5 0.2 0.6 0.4 1-0.8 1.8 0.2 1.7 0.9-0.4 1.1-2.4 1.2-0.9 1.2 1.5-0.1 1.9 1.5-0.9 0.4 0.1 0.7 1.4 0.6 1.3 1.1 1 1.2-0.2 0.8-1.4 0.9-0.4 0.9 0.1 0.9-1.2 1.3 0.1 0.6 0.7 0.2 0.1 0.2 2.2 1.3-0.4 0.2 0.4z",
    BBD: "M661.9 672.9l-0.4-0.6-0.7-1.5 0-1.7-0.1-1.6 0.1-1.9 0.1-1.4 0.6-1.2 0.8-0.7 1.2-0.6 1.1-0.3 1.3 0.6 0.9 2.2 0.9 2.4 0.8 2.6 0.3 0.8-0.2 0.2 0 1-0.2 0.6-0.5 0.5-2.7-0.7-1.4 1.6-1.9-0.3z",
    SWD: "M697.2 824.9l1.2-0.3 1.1-1.4 0.8 0.2-0.1 0.7 0.1 1.5 1.4 1.4-0.3 1.5-0.8 0.9 0.1 2 0.3 0.4 1.1-0.1 2 3.7 0.9 0.2 0.2 1.1-1 0.9-1.6 0.8-1.7 0.8-1.2 0.7-1.6 0-1.4-0.2-1.2-0.5-1.1-0.8-1.2-2.1-0.2-1.2 0-1.7 0.4-1.5 0.6-1.1 1.2-1.8 1-1.8 0.7-1 0.3-1.3z",
    BAS: "M671.9 850l-2.6 1.9-2.8 0.1-0.8 1.2-1.7 0.7-1.4-0.2-0.2-1-2.2-0.8-1.3 0.3-1.1 1-1.4 0-0.6-0.4-0.2-0.8-1.1-0.3-0.3-0.7-2.1-0.6 0-0.5-0.1-1.2 0.3-0.8 0.3 0 0.5 0.6 0.5 0.3 0.6 0 0.6-0.2 0.4-0.4 0.5-1.4 0.1-1 1.3 0.1 2.1 0 1-1 0.6-1.1 0.2-0.8 0.9 1 1.4 0.1 1.5 0 2.1 0.1 3.4-0.9 2.1-0.4 0.1 1.6-0.4 1 0.3 1-2.5 1.9 0.3 0.3 1.4 0.2 0.3 1.1z",
    WIL: "M672.8 831.1l1.5-0.2 2.2-1.4 2 0.7 2.3-2.4 2-3.3 3.3 1.4 0.9 0.9 0.9-0.5 0-1.5 0.4-0.2 2.1 0.9 1 0.8 0.2-0.4-0.8-1.2-0.1-0.8 1.1-0.1 1.5 1.3 0.8-1 0.2-1.7 0.3-0.4 0.5 0.2 0.8 2.6 0.9 0.2 0.4-0.1-0.3 1.3-0.7 1-1 1.8-1.2 1.8-0.6 1.1-0.4 1.5 0 1.7 0.2 1.2 1.2 2.1 1.1 0.8 1.2 0.5 1.4 0.2 1.6 0 1.2-0.7 1.7-0.8 1.6-0.8 1-0.9 0.1 1 1.3 2.1 1 0.8 0.3 1.2 0 0.7-1.5 0.4-0.4 0.6 1.4 2.6 1.6 0.9 0.1 0.8 0.5 0.8-0.1 0.9-1.8 0.2 0.3 2-0.9 2 0.5 1.8-0.5 0.5-1.9-0.9-1 0.4-0.6 1-0.7 0.3-2.4-0.4-0.8 0.3 0.5 2.3 1.5 2.5 0.3 1.6-0.2 1.8 1.1 0.7 0.3 0.6-0.4 1.7 0.5 2.4-0.1 1.5 0.9 0.6 0.3 0.6-0.9 0.9-0.3 0.8 1.1 1.3-0.6 1.3-2 0.7-0.8-0.3-1.3-1.5-1.9-0.2-1.3-0.7-2-0.4-1.3-1.3-0.4 0.2-0.5 0.9-0.5-0.1 0.1-0.6-0.2-0.1-2.6 0.5-1.2 0.8-0.9-0.3-1.2 1.1-1.8 0.4-1.2 0.9-1.8 0.3-0.7-0.7-0.5-1.2-0.9-0.3-2.4-4.3-1.4-1.7-0.7-0.4-1.2 0-1.1-0.7-1.6-0.2-1.2-0.9-0.2-0.7 0.2-1 3.8-6.8 0.7-2.6 0.7-1.5-0.3-1.6-1.3-0.8-0.2-0.8 0.4-0.7-0.6-0.8-0.5 0.1-0.3-1.1-1.4-0.2-0.3-0.3 2.5-1.9-0.3-1 0.4-1-0.1-1.6-0.4-3 0.3-1.1-0.2-0.5-1.2 0.1-0.4-0.3 0.3-0.7 1.6-1.3 1.6-0.6-0.8-2.2 0.1-1.5-0.5-0.7z",
    CLD: "M684 655.5l1.4-1.8 1.1 0 2.7 3.8 2 0.3 1.9 1.5 2.2 2.2 1.6 2.6 0.8 2.8-3.9 2.6-2.5 0.6-6.9 1.9-0.5-0.6 0.1-1.3-0.5-0.9-0.2-0.8-0.8 0.1-0.8 0.7-0.8 0.2-0.9-0.9-0.7 0.1-0.5-1-0.4-0.2 0.1-0.6-0.5-1.6 1.8-2.4 0.1-2.9 1.1-1.5 2.3-1.1 0.5-0.7 0.2-1.1z",
    KIR: "M694.1 681.7l-2.5-1.3-1.3 0-1.9-2.8-1.8-2-0.5-1.7-1.4-0.3-0.3-1.6 6.9-1.9 2.5-0.6 3.9-2.6-0.8-2.8 1.7-1.2 3.4-0.8 3.1 4.9-0.3 3.3-1.5 0.9 0.3 3.4 0.6 2.5-0.7 0.9-2.7 1-1.9-0.3-2.7 1.5-1.6 0.2-0.5 1.3z",
    NGM: "M724.3 732l-1.3-0.5-0.6-1-0.8-1.9 0.1-2.2 0.5-1.9 1.1-1.8 1.5-0.2 1.2 1 0.9 1.6 0.6 1.7 0 1.6-1.8 2.1-1.4 1.5z",
    LCE: "M726.6 755.8l-2.1-0.8-0.6-3.3 0-1.6 1-1.3 1.8 0 2.3 0.6 0.7 1.9-0.4 2.1-2.7 2.4z",
    DER: "M712.1 734.4l-1.2-0.1-1.7-0.3-2.4-2.3 0.3-1.7 0.8-1.2 0.9-1.3 0.8-0.6 1.5 0.3 1.5 0.9 0.9 1 0.2 1.4-0.4 1.6-0.7 1.5-0.5 0.8z",
    LDS: "M698.2 651.1l1.6 0.1 2.5-0.5 2.7 0.5 1.4-0.3 0.2-0.3 0.1-1.3 0.6-0.8 0.8 0.7 0.5 1.3 2.4 0.3 1.1-0.3 0.4-0.5 0-0.6 1.7-1.2 2.5-0.5 1.9 1.6 0.1 0.8-0.8 1.6 0.2 1.5-0.1 1.2-1.8 0.2 0.1 0.5 0.8 0.5 0.9 2.1-0.1 2.3 0.3 0.8 0.6 0.8 0.1 0.9-0.8 0.7-0.1 1-1.2 1.6-3.9 1.9-2.4-1-2.9-0.4-2.5 0.7-3.1-4.9 1-2-2.3-0.3 0-4.8-2.5-3.9z",
    BRD: "M686.5 653.7l0.6-0.5 0.1-1.7-0.5-1.6 1.1-1.1-0.2-1.5 0.5-0.6 2 0.2 1.2-0.6 0.2 1.8 1.2 0.7 0.5-0.7 1.8-0.2 0.9 0.6 0.7 1.3 0.9 0.2 0.7 1.1 2.5 3.9 0 4.8 2.3 0.3-1 2-3.4 0.8-1.7 1.2-1.6-2.6-2.2-2.2-1.9-1.5-2-0.3-2.7-3.8z",
    WKF: "M718 664.2l0.8 0 1.4 1.6 1.8 0.2 0.5 0.4-0.1 0.8-0.7 0.4-0.8 1.8-0.1 0.7 0 2.2 0.8 1.1-0.6 1.9-3 1.7-1.8-0.4-0.4-1-0.7-0.4-2.6 0.3-1.1-0.5-1.8 0.7-0.8-0.3-1.5 0.2-0.3-0.1-0.3-0.7-0.6-0.2-1.1 0.7-0.8 1.8-0.6-2.5-0.3-3.4 1.5-0.9 0.3-3.3 2.5-0.7 2.9 0.4 2.4 1 3.9-1.9 1.2-1.6z",
    BNS: "M716.2 676.6l0.9 3.1 1.4 2.2-1.4 2.8-2.1 0.7-1.7 1.9 0 2.7-1 0-0.9-1.6-0.8-3-2.2 0.2-2.2-0.2-1.5-2.2-10.6-1.5 0.5-1.3 1.6-0.2 2.7-1.5 1.9 0.3 2.7-1 0.7-0.9 0.8-1.8 1.1-0.7 0.6 0.2 0.3 0.7 0.3 0.1 1.5-0.2 0.8 0.3 1.8-0.7 1.1 0.5 2.6-0.3 0.7 0.4 0.4 1z",
    SLF: "M662.8 685.9l-0.8-4.1-0.4-1.8 3.2-1.3 3.3 1.6 1.7 0 1.4 2.3 0.3 2.6-1 1.5-2.2-0.5-1.9 0.5-1.8 2.6-1.8-3.4z",
    BOL: "M659.3 675.1l2.6-2.2 1.9 0.3 1.4-1.6 2.7 0.7 0.7 3.7 1.2 4.3-1.7 0-3.3-1.6-3.2 1.3-0.4-1.4-1.9-3.5z",
    TRF: "M670.7 694l-2.3-0.2-1.4-0.9-1.6-0.5-1.2-0.5-0.3-0.2 0.8-1.4-0.1-1 1.8-2.6 1.9-0.5 2.2 0.5 0.8 2-0.6 1.6-0.7 1.5 0.7 2.2z",
    MAN: "M673.3 695.2l-1.1 0.2-1.5-1.4-0.7-2.2 0.7-1.5 0.6-1.6-0.8-2 1-1.5-0.3-2.6 1.2-2 1.3-1.5 3.3 1.8-0.3 1.7-0.7 2.2-1.1 1.4 0 1.7-0.4 2.9-1.5 2.4 0.3 2z",
    OLD: "M690.3 680.4l-0.6 0.9-0.4 1.6-0.6 0.4-1.5 0.1-0.7 2-2.6-1.9-3.3-1.2-2.6 2-2 0.5 0.7-2.2 0.3-1.7 1.4-3.2 2.6-1.5 5.1-2.3 0.5 1.7 1.8 2 1.9 2.8z",
    RCH: "M673.4 674l0.3-0.5-0.1-2.1 0.4-1.2 0.9-0.8 3.5-2 0.4 0.2 0.5 1 0.7-0.1 0.9 0.9 0.8-0.2 0.8-0.7 0.8-0.1 0.2 0.8 0.5 0.9-0.1 1.3 0.5 0.6 0.3 1.6 1.4 0.3-5.1 2.3-2.6 1.5-1.4 3.2-3.3-1.8-0.1-2.9-0.2-2.2z",
    TAM: "M686.5 685.4l-0.2 2-1.2 1.3-0.2 0.6 0.1 0.5-2.1 0.3-3.2 0-2.6-1.5-2.2-0.7 0-1.7 1.1-1.4 2-0.5 2.6-2 3.3 1.2 2.6 1.9z",
    BUR: "M668.8 670l0.1-0.2 1.2 0.7 1.7-0.7 0.6 0.1 0.2 3.1 0.8 1 0.2 2.2 0.1 2.9-1.3 1.5-1.2 2-1.4-2.3-1.2-4.3-0.7-3.7 0.5-0.5 0.2-0.6 0-1 0.2-0.2z",
    SOL: "M702.4 772.3l-1.5 0.1-0.5 0.5-1.5-1-1.8 0.6-0.3 0.8-1.8-1.1-0.8-0.9-0.4-1-0.6-0.3 1.3-2.4 1.7-0.5 0.2-3.4-1-1.1-0.1-1.3 2.3-0.3 2.8 4.4 1 1.2 1.9-1.5-0.9 7.2z",
    COV: "M703.3 765.1l7.7 0.5 0.6 0.2 0.2 0.4 0.3 3.6-1.4 1.3-2.3-0.1-1.2 0.9-1.2-1.3-1.3-0.1-0.5 0.9-1.8 0.9 0.9-7.2z",
    BIR: "M692.3 755l1.1-1 0.8-0.2 1.2 0.3 0.5 0.9 0.3 1 0.9 1.2 0 0.9 0.9 1.8-0.4 1.1-2.3 0.3 0.1 1.3 1 1.1-0.2 3.4-1.7 0.5-1.3 2.4-0.4-0.2-2.6-0.8-1.2 0.6-1.4-0.1-1.3 0.7-0.6-0.1-0.3-1.1 0.9-1.3 0-0.6-1.1-0.7-0.7 0.2-0.4-0.9 0.2-2.1 1.4 0.4 1.5-0.3 0.9-1.6-0.9-0.9 0.9-2.1 1.4-0.4 0.6-1.5 1.4-0.9 0.8-1.3z",
    SAW: "M690.1 757.2l-0.6 1.5-1.4 0.4-0.9 2.1 0.9 0.9-0.9 1.6-1.5 0.3-1.4-0.4-0.6-1.3-1.7 0.2-0.7-0.8 1.1-2.2-0.6-2.2 0-0.9 1.1-0.8 0.7 1.1 2.4-1 3.2 0.5 0.9 1z",
    DUD: "M678.3 766.7l-0.2-4.2-0.9-1.8 2-1.1 0-1.1 0.4-1.1 0.4-1.2 0.8-0.4 1 0.6 0 0.9 0.6 2.2-1.1 2.2 0.7 0.8 1.7-0.2 0.6 1.3-0.2 2.1-0.8 0.2-0.5 0.9-1.2-1.1-1.7 1.1-1.6-0.1z",
    WLL: "M683.1 751.8l1.2 0.1 3.4-1.7 0.3-0.4 0-1.2 0.3-0.5 0.3 0 1.7 1.2 0.1 2.5 0.7 0.9 0.2 1.5 0.7 0.7 0.3 0.1-0.8 1.3-1.4 0.9-0.9-1-3.2-0.5-2.4 1-0.7-1.1 1-1.4-0.8-2.4z",
    WLV: "M679.6 757.4l-0.4-0.3-1.1 0.1-0.8-1.6-1.2-0.9 0.7-0.8 0.2-0.8 1.8-1 0.2-0.9 0.4-0.4 1.5-0.3 1.5 2 0.7-0.7 0.8 2.4-1 1.4-1.1 0.8-1-0.6-0.8 0.4-0.4 1.2z",
  };

  const regionOrderFromSVG = [
    "DRY",
    "STB",
    "FER",
    "DGN",
    "ARM",
    "NYM",
    "FLN",
    "CHW",
    "WRX",
    "SHR",
    "POW",
    "HEF",
    "MON",
    "GLS",
    "SCB",
    "NBL",
    "CMA",
    "DGY",
    "LMV",
    "CLR",
    "MYL",
    "LRN",
    "CKF",
    "NTA",
    "BFS",
    "NDN",
    "ARD",
    "DOW",
    "CLK",
    "STG",
    "FAL",
    "WLN",
    "EDH",
    "MLN",
    "ELN",
    "NTY",
    "STY",
    "SND",
    "DUR",
    "HPL",
    "RCC",
    "NYK",
    "ERY",
    "KHL",
    "NLN",
    "NEL",
    "LIN",
    "NFK",
    "SFK",
    "ESS",
    "SOS",
    "THR",
    "KEN",
    "MDW",
    "ESX",
    "BNH",
    "WSX",
    "HAM",
    "POR",
    "STH",
    "DOR",
    "BMH",
    "POL",
    "DEV",
    "TOB",
    "PLY",
    "CON",
    "SOM",
    "NSM",
    "BST",
    "SGC",
    "NWP",
    "CRF",
    "VGL",
    "BGE",
    "NTL",
    "SWA",
    "CMN",
    "PEM",
    "CGN",
    "GWN",
    "CWY",
    "DEN",
    "WRL",
    "HAL",
    "KWL",
    "LIV",
    "SFT",
    "LAN",
    "BPL",
    "SAY",
    "NAY",
    "IVC",
    "RFW",
    "WDU",
    "AGB",
    "HLD",
    "MRY",
    "ABD",
    "ABE",
    "ANS",
    "DND",
    "PKN",
    "FIF",
    "IOW",
    "AGY",
    "ELS",
    "ORK",
    "ZET",
    "IOS",
    "CAY",
    "RCT",
    "BGW",
    "TOF",
    "MTY",
    "NLK",
    "EDU",
    "GLG",
    "ERW",
    "EAY",
    "SLK",
    "MFT",
    "OMH",
    "CKT",
    "CGV",
    "BNB",
    "ANT",
    "LSB",
    "BLY",
    "BLA",
    "CSR",
    "WND",
    "MRT",
    "WSM",
    "KEC",
    "HNS",
    "EAL",
    "HMF",
    "STT",
    "DAL",
    "MDB",
    "RIC",
    "LND",
    "TWH",
    "GAT",
    "NET",
    "YOR",
    "SHN",
    "ENF",
    "HRT",
    "BNE",
    "WFT",
    "RDB",
    "HAV",
    "CAM",
    "BEX",
    "STN",
    "MIK",
    "BKM",
    "HIL",
    "BEN",
    "LUT",
    "HRW",
    "CBF",
    "BDF",
    "RUT",
    "NTT",
    "NTH",
    "CMD",
    "ISL",
    "PTE",
    "LBH",
    "SWK",
    "DNC",
    "CRY",
    "LEW",
    "HRY",
    "KTT",
    "NWM",
    "GRE",
    "HCK",
    "BDG",
    "LEC",
    "CHE",
    "DBY",
    "ROT",
    "SHF",
    "STE",
    "TFW",
    "STS",
    "BRY",
    "WOR",
    "WAR",
    "OXF",
    "WGN",
    "SKP",
    "WRT",
    "WBK",
    "WOK",
    "BRC",
    "WNM",
    "SLG",
    "RDG",
    "SRY",
    "BBD",
    "SWD",
    "BAS",
    "WIL",
    "CLD",
    "KIR",
    "NGM",
    "LCE",
    "DER",
    "LDS",
    "BRD",
    "WKF",
    "BNS",
    "SLF",
    "BOL",
    "TRF",
    "MAN",
    "OLD",
    "RCH",
    "TAM",
    "BUR",
    "SOL",
    "COV",
    "BIR",
    "SAW",
    "DUD",
    "WLL",
    "WLV",
  ];

  return (
    <svg
      version="1.0"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1000 1000"
      preserveAspectRatio="xMidYMid meet"
      onMouseLeave={() => setHoveredRegionId(null)}
      className="interactive-japan-map"
    >
      <g id="great-britian-regions-group">
        {regionOrderFromSVG.map((svgId) => {
          const regionInfo = REGION_DATA[svgId];
          const pathD = regionPathData[svgId];
          if (!regionInfo || !pathD) {
            console.warn("No state data!", svgId);
            return null;
          }

          return (
            <path
              key={svgId}
              id={svgId}
              title={regionInfo.name}
              style={getRegionStyle(svgId)}
              onClick={() => handleRegionClick(svgId)}
              onMouseEnter={() => setHoveredRegionId(regionInfo.gameId)}
              d={pathD}
            />
          );
        })}
      </g>
    </svg>
  );
}

export default GreatBritainMap;

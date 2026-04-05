export interface PostalCodeResponse {
  city: string;
  state: string;
  stateCode: string;
  country: string;
  countryCode: string;
}

export interface PostalCodeError {
  message: string;
  code?: string;
  allowManualEntry?: boolean;
}

// Zipcodebase API response structure
interface ZipcodebaseResult {
  postal_code: string;
  locale: string;
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  state_code: string;
  city_en: string;
  state_en: string;
  country_code: string;
}

interface ZipcodebaseResponse {
  results: Record<string, ZipcodebaseResult[]>;
}

const ZIPCODEBASE_API_KEY = process.env.NEXT_PUBLIC_ZIP_CODE_BASE_API_KEY;
const ZIPCODEBASE_API_URL = "https://app.zipcodebase.com/api/v1/search";

// ISO 3166-1 alpha-2 country code to country name mapping
const COUNTRY_CODE_TO_NAME: Record<string, string> = {
  AF: "Afghanistan", AL: "Albania", DZ: "Algeria", AS: "American Samoa", AD: "Andorra",
  AO: "Angola", AI: "Anguilla", AQ: "Antarctica", AG: "Antigua and Barbuda", AR: "Argentina",
  AM: "Armenia", AW: "Aruba", AU: "Australia", AT: "Austria", AZ: "Azerbaijan",
  BS: "Bahamas", BH: "Bahrain", BD: "Bangladesh", BB: "Barbados", BY: "Belarus",
  BE: "Belgium", BZ: "Belize", BJ: "Benin", BM: "Bermuda", BT: "Bhutan",
  BO: "Bolivia", BA: "Bosnia and Herzegovina", BW: "Botswana", BR: "Brazil", BN: "Brunei",
  BG: "Bulgaria", BF: "Burkina Faso", BI: "Burundi", KH: "Cambodia", CM: "Cameroon",
  CA: "Canada", CV: "Cape Verde", KY: "Cayman Islands", CF: "Central African Republic", TD: "Chad",
  CL: "Chile", CN: "China", CO: "Colombia", KM: "Comoros", CG: "Congo",
  CD: "Congo (Democratic Republic)", CK: "Cook Islands", CR: "Costa Rica", HR: "Croatia", CU: "Cuba",
  CY: "Cyprus", CZ: "Czech Republic", DK: "Denmark", DJ: "Djibouti", DM: "Dominica",
  DO: "Dominican Republic", EC: "Ecuador", EG: "Egypt", SV: "El Salvador", GQ: "Equatorial Guinea",
  ER: "Eritrea", EE: "Estonia", ET: "Ethiopia", FJ: "Fiji", FI: "Finland",
  FR: "France", GA: "Gabon", GM: "Gambia", GE: "Georgia", DE: "Germany",
  GH: "Ghana", GR: "Greece", GD: "Grenada", GT: "Guatemala", GN: "Guinea",
  GW: "Guinea-Bissau", GY: "Guyana", HT: "Haiti", HN: "Honduras", HK: "Hong Kong",
  HU: "Hungary", IS: "Iceland", IN: "India", ID: "Indonesia", IR: "Iran",
  IQ: "Iraq", IE: "Ireland", IL: "Israel", IT: "Italy", CI: "Ivory Coast",
  JM: "Jamaica", JP: "Japan", JO: "Jordan", KZ: "Kazakhstan", KE: "Kenya",
  KI: "Kiribati", KP: "North Korea", KR: "South Korea", KW: "Kuwait", KG: "Kyrgyzstan",
  LA: "Laos", LV: "Latvia", LB: "Lebanon", LS: "Lesotho", LR: "Liberia",
  LY: "Libya", LI: "Liechtenstein", LT: "Lithuania", LU: "Luxembourg", MO: "Macau",
  MK: "North Macedonia", MG: "Madagascar", MW: "Malawi", MY: "Malaysia", MV: "Maldives",
  ML: "Mali", MT: "Malta", MH: "Marshall Islands", MR: "Mauritania", MU: "Mauritius",
  MX: "Mexico", FM: "Micronesia", MD: "Moldova", MC: "Monaco", MN: "Mongolia",
  ME: "Montenegro", MA: "Morocco", MZ: "Mozambique", MM: "Myanmar", NA: "Namibia",
  NR: "Nauru", NP: "Nepal", NL: "Netherlands", NZ: "New Zealand", NI: "Nicaragua",
  NE: "Niger", NG: "Nigeria", NO: "Norway", OM: "Oman", PK: "Pakistan",
  PW: "Palau", PA: "Panama", PG: "Papua New Guinea", PY: "Paraguay", PE: "Peru",
  PH: "Philippines", PL: "Poland", PT: "Portugal", PR: "Puerto Rico", QA: "Qatar",
  RO: "Romania", RU: "Russia", RW: "Rwanda", KN: "Saint Kitts and Nevis", LC: "Saint Lucia",
  VC: "Saint Vincent and the Grenadines", WS: "Samoa", SM: "San Marino", ST: "Sao Tome and Principe",
  SA: "Saudi Arabia", SN: "Senegal", RS: "Serbia", SC: "Seychelles", SL: "Sierra Leone",
  SG: "Singapore", SK: "Slovakia", SI: "Slovenia", SB: "Solomon Islands", SO: "Somalia",
  ZA: "South Africa", SS: "South Sudan", ES: "Spain", LK: "Sri Lanka", SD: "Sudan",
  SR: "Suriname", SZ: "Eswatini", SE: "Sweden", CH: "Switzerland", SY: "Syria",
  TW: "Taiwan", TJ: "Tajikistan", TZ: "Tanzania", TH: "Thailand", TL: "Timor-Leste",
  TG: "Togo", TO: "Tonga", TT: "Trinidad and Tobago", TN: "Tunisia", TR: "Turkey",
  TM: "Turkmenistan", TV: "Tuvalu", UG: "Uganda", UA: "Ukraine", AE: "United Arab Emirates",
  GB: "United Kingdom", US: "United States", UY: "Uruguay", UZ: "Uzbekistan", VU: "Vanuatu",
  VA: "Vatican City", VE: "Venezuela", VN: "Vietnam", YE: "Yemen", ZM: "Zambia",
  ZW: "Zimbabwe"
};

function getCountryNameFromCode(countryCode: string): string {
  return COUNTRY_CODE_TO_NAME[countryCode] || countryCode;
}

export async function lookupPostalCode(postalCode: string): Promise<PostalCodeResponse | null> {
  if (!postalCode || postalCode.length < 2) {
    return null;
  }

  if (!ZIPCODEBASE_API_KEY) {
    console.warn("NEXT_PUBLIC_ZIP_CODE_BASE_API_KEY is not configured");
    return null;
  }

  try {
    const url = `${ZIPCODEBASE_API_URL}?codes=${encodeURIComponent(postalCode)}&apikey=${ZIPCODEBASE_API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      return null;
    }

    const data: ZipcodebaseResponse = await response.json();
    
    if (!data.results || Object.keys(data.results).length === 0) {
      return null;
    }

    // Get the first result from the first key in results
    const firstKey = Object.keys(data.results)[0];
    const results = data.results[firstKey];
    
    if (!results || results.length === 0) {
      return null;
    }

    const result = results[0];
    const countryCode = result.country_code || "";
    
    return {
      city: result.city || "",
      state: result.state || "",
      stateCode: result.state_code || "",
      country: getCountryNameFromCode(countryCode),
      countryCode: countryCode,
    };
  } catch (error) {
    console.error("Error looking up postal code:", error);
    return null;
  }
}

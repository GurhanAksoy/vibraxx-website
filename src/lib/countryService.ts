export interface Country {
  code: string; // ISO 3166-1 alpha-2
  name: string;
  flag: string; // flagcdn.com URL — emoji değil, Windows Chrome/Edge uyumlu
}

const flagUrl = (code: string) =>
  `https://flagcdn.com/24x18/${code.toLowerCase()}.png`;

// Tüm dünya ülkeleri — ISO 3166-1 alpha-2
export const ALL_COUNTRIES: Country[] = [
  // Afghanistan — gambling/gaming yasak
  { code: "AL", name: "Albania",                    flag: flagUrl("AL") },
  { code: "DZ", name: "Algeria",                    flag: flagUrl("DZ") },
  { code: "AD", name: "Andorra",                    flag: flagUrl("AD") },
  { code: "AO", name: "Angola",                     flag: flagUrl("AO") },
  { code: "AG", name: "Antigua and Barbuda",        flag: flagUrl("AG") },
  { code: "AR", name: "Argentina",                  flag: flagUrl("AR") },
  { code: "AM", name: "Armenia",                    flag: flagUrl("AM") },
  { code: "AU", name: "Australia",                  flag: flagUrl("AU") },
  { code: "AT", name: "Austria",                    flag: flagUrl("AT") },
  { code: "AZ", name: "Azerbaijan",                 flag: flagUrl("AZ") },
  { code: "BS", name: "Bahamas",                    flag: flagUrl("BS") },
  // Bahrain — İslam hukuku, gambling yasak
  { code: "BD", name: "Bangladesh",                 flag: flagUrl("BD") },
  { code: "BB", name: "Barbados",                   flag: flagUrl("BB") },
  { code: "BY", name: "Belarus",                    flag: flagUrl("BY") },
  { code: "BE", name: "Belgium",                    flag: flagUrl("BE") },
  { code: "BZ", name: "Belize",                     flag: flagUrl("BZ") },
  { code: "BJ", name: "Benin",                      flag: flagUrl("BJ") },
  { code: "BT", name: "Bhutan",                     flag: flagUrl("BT") },
  { code: "BO", name: "Bolivia",                    flag: flagUrl("BO") },
  { code: "BA", name: "Bosnia and Herzegovina",     flag: flagUrl("BA") },
  { code: "BW", name: "Botswana",                   flag: flagUrl("BW") },
  { code: "BR", name: "Brazil",                     flag: flagUrl("BR") },
  { code: "BN", name: "Brunei",                     flag: flagUrl("BN") },
  { code: "BG", name: "Bulgaria",                   flag: flagUrl("BG") },
  { code: "BF", name: "Burkina Faso",               flag: flagUrl("BF") },
  { code: "BI", name: "Burundi",                    flag: flagUrl("BI") },
  { code: "CV", name: "Cabo Verde",                 flag: flagUrl("CV") },
  { code: "KH", name: "Cambodia",                   flag: flagUrl("KH") },
  { code: "CM", name: "Cameroon",                   flag: flagUrl("CM") },
  { code: "CA", name: "Canada",                     flag: flagUrl("CA") },
  { code: "CF", name: "Central African Republic",   flag: flagUrl("CF") },
  { code: "TD", name: "Chad",                       flag: flagUrl("TD") },
  { code: "CL", name: "Chile",                      flag: flagUrl("CL") },
  // China — online real-money gaming yasak
  { code: "CO", name: "Colombia",                   flag: flagUrl("CO") },
  { code: "KM", name: "Comoros",                    flag: flagUrl("KM") },
  { code: "CG", name: "Congo",                      flag: flagUrl("CG") },
  { code: "CD", name: "Congo (DRC)",                flag: flagUrl("CD") },
  { code: "CR", name: "Costa Rica",                 flag: flagUrl("CR") },
  { code: "HR", name: "Croatia",                    flag: flagUrl("HR") },
  // Cuba — OFAC yaptırım listesi, Stripe yasak
  { code: "CY", name: "Cyprus",                     flag: flagUrl("CY") },
  { code: "CZ", name: "Czech Republic",             flag: flagUrl("CZ") },
  { code: "DK", name: "Denmark",                    flag: flagUrl("DK") },
  { code: "DJ", name: "Djibouti",                   flag: flagUrl("DJ") },
  { code: "DM", name: "Dominica",                   flag: flagUrl("DM") },
  { code: "DO", name: "Dominican Republic",         flag: flagUrl("DO") },
  { code: "EC", name: "Ecuador",                    flag: flagUrl("EC") },
  { code: "EG", name: "Egypt",                      flag: flagUrl("EG") },
  { code: "SV", name: "El Salvador",                flag: flagUrl("SV") },
  { code: "GQ", name: "Equatorial Guinea",          flag: flagUrl("GQ") },
  { code: "ER", name: "Eritrea",                    flag: flagUrl("ER") },
  { code: "EE", name: "Estonia",                    flag: flagUrl("EE") },
  { code: "SZ", name: "Eswatini",                   flag: flagUrl("SZ") },
  { code: "ET", name: "Ethiopia",                   flag: flagUrl("ET") },
  { code: "FJ", name: "Fiji",                       flag: flagUrl("FJ") },
  { code: "FI", name: "Finland",                    flag: flagUrl("FI") },
  { code: "FR", name: "France",                     flag: flagUrl("FR") },
  { code: "GA", name: "Gabon",                      flag: flagUrl("GA") },
  { code: "GM", name: "Gambia",                     flag: flagUrl("GM") },
  { code: "GE", name: "Georgia",                    flag: flagUrl("GE") },
  { code: "DE", name: "Germany",                    flag: flagUrl("DE") },
  { code: "GH", name: "Ghana",                      flag: flagUrl("GH") },
  { code: "GR", name: "Greece",                     flag: flagUrl("GR") },
  { code: "GD", name: "Grenada",                    flag: flagUrl("GD") },
  { code: "GT", name: "Guatemala",                  flag: flagUrl("GT") },
  { code: "GN", name: "Guinea",                     flag: flagUrl("GN") },
  { code: "GW", name: "Guinea-Bissau",              flag: flagUrl("GW") },
  { code: "GY", name: "Guyana",                     flag: flagUrl("GY") },
  { code: "HT", name: "Haiti",                      flag: flagUrl("HT") },
  { code: "HN", name: "Honduras",                   flag: flagUrl("HN") },
  { code: "HU", name: "Hungary",                    flag: flagUrl("HU") },
  { code: "IS", name: "Iceland",                    flag: flagUrl("IS") },
  // India — PROGA 2025, real-money gaming yasak
  { code: "ID", name: "Indonesia",                  flag: flagUrl("ID") },
  // Iran — OFAC yaptırım listesi, Stripe yasak
  { code: "IQ", name: "Iraq",                       flag: flagUrl("IQ") },
  { code: "IE", name: "Ireland",                    flag: flagUrl("IE") },
  { code: "IL", name: "Israel",                     flag: flagUrl("IL") },
  { code: "IT", name: "Italy",                      flag: flagUrl("IT") },
  { code: "JM", name: "Jamaica",                    flag: flagUrl("JM") },
  { code: "JP", name: "Japan",                      flag: flagUrl("JP") },
  { code: "JO", name: "Jordan",                     flag: flagUrl("JO") },
  { code: "KZ", name: "Kazakhstan",                 flag: flagUrl("KZ") },
  { code: "KE", name: "Kenya",                      flag: flagUrl("KE") },
  { code: "KI", name: "Kiribati",                   flag: flagUrl("KI") },
  // Kuwait — gambling yasak
  { code: "KG", name: "Kyrgyzstan",                 flag: flagUrl("KG") },
  { code: "LA", name: "Laos",                       flag: flagUrl("LA") },
  { code: "LV", name: "Latvia",                     flag: flagUrl("LV") },
  { code: "LB", name: "Lebanon",                    flag: flagUrl("LB") },
  { code: "LS", name: "Lesotho",                    flag: flagUrl("LS") },
  { code: "LR", name: "Liberia",                    flag: flagUrl("LR") },
  // Libya — gambling yasak
  { code: "LI", name: "Liechtenstein",              flag: flagUrl("LI") },
  { code: "LT", name: "Lithuania",                  flag: flagUrl("LT") },
  { code: "LU", name: "Luxembourg",                 flag: flagUrl("LU") },
  { code: "MG", name: "Madagascar",                 flag: flagUrl("MG") },
  { code: "MW", name: "Malawi",                     flag: flagUrl("MW") },
  { code: "MY", name: "Malaysia",                   flag: flagUrl("MY") },
  { code: "MV", name: "Maldives",                   flag: flagUrl("MV") },
  { code: "ML", name: "Mali",                       flag: flagUrl("ML") },
  { code: "MT", name: "Malta",                      flag: flagUrl("MT") },
  { code: "MH", name: "Marshall Islands",           flag: flagUrl("MH") },
  { code: "MR", name: "Mauritania",                 flag: flagUrl("MR") },
  { code: "MU", name: "Mauritius",                  flag: flagUrl("MU") },
  { code: "MX", name: "Mexico",                     flag: flagUrl("MX") },
  { code: "FM", name: "Micronesia",                 flag: flagUrl("FM") },
  { code: "MD", name: "Moldova",                    flag: flagUrl("MD") },
  { code: "MC", name: "Monaco",                     flag: flagUrl("MC") },
  { code: "MN", name: "Mongolia",                   flag: flagUrl("MN") },
  { code: "ME", name: "Montenegro",                 flag: flagUrl("ME") },
  { code: "MA", name: "Morocco",                    flag: flagUrl("MA") },
  { code: "MZ", name: "Mozambique",                 flag: flagUrl("MZ") },
  // Myanmar — yüksek riskli, Stripe kısıtlı
  { code: "NA", name: "Namibia",                    flag: flagUrl("NA") },
  { code: "NR", name: "Nauru",                      flag: flagUrl("NR") },
  { code: "NP", name: "Nepal",                      flag: flagUrl("NP") },
  { code: "NL", name: "Netherlands",                flag: flagUrl("NL") },
  { code: "NZ", name: "New Zealand",                flag: flagUrl("NZ") },
  { code: "NI", name: "Nicaragua",                  flag: flagUrl("NI") },
  { code: "NE", name: "Niger",                      flag: flagUrl("NE") },
  { code: "NG", name: "Nigeria",                    flag: flagUrl("NG") },
  { code: "NO", name: "Norway",                     flag: flagUrl("NO") },
  // Oman — gambling yasak
  // Pakistan — gambling yasak
  { code: "PW", name: "Palau",                      flag: flagUrl("PW") },
  { code: "PA", name: "Panama",                     flag: flagUrl("PA") },
  { code: "PG", name: "Papua New Guinea",           flag: flagUrl("PG") },
  { code: "PY", name: "Paraguay",                   flag: flagUrl("PY") },
  { code: "PE", name: "Peru",                       flag: flagUrl("PE") },
  { code: "PH", name: "Philippines",                flag: flagUrl("PH") },
  { code: "PL", name: "Poland",                     flag: flagUrl("PL") },
  { code: "PT", name: "Portugal",                   flag: flagUrl("PT") },
  // Qatar — gambling yasak
  { code: "RO", name: "Romania",                    flag: flagUrl("RO") },
  { code: "RU", name: "Russia",                     flag: flagUrl("RU") },
  { code: "RW", name: "Rwanda",                     flag: flagUrl("RW") },
  { code: "KN", name: "Saint Kitts and Nevis",      flag: flagUrl("KN") },
  { code: "LC", name: "Saint Lucia",                flag: flagUrl("LC") },
  { code: "VC", name: "Saint Vincent",              flag: flagUrl("VC") },
  { code: "WS", name: "Samoa",                      flag: flagUrl("WS") },
  { code: "SM", name: "San Marino",                 flag: flagUrl("SM") },
  { code: "ST", name: "Sao Tome and Principe",      flag: flagUrl("ST") },
  // Saudi Arabia — gambling yasak
  { code: "SN", name: "Senegal",                    flag: flagUrl("SN") },
  { code: "RS", name: "Serbia",                     flag: flagUrl("RS") },
  { code: "SC", name: "Seychelles",                 flag: flagUrl("SC") },
  { code: "SL", name: "Sierra Leone",               flag: flagUrl("SL") },
  { code: "SG", name: "Singapore",                  flag: flagUrl("SG") },
  { code: "SK", name: "Slovakia",                   flag: flagUrl("SK") },
  { code: "SI", name: "Slovenia",                   flag: flagUrl("SI") },
  { code: "SB", name: "Solomon Islands",            flag: flagUrl("SB") },
  // Somalia — yüksek riskli
  { code: "ZA", name: "South Africa",               flag: flagUrl("ZA") },
  { code: "SS", name: "South Sudan",                flag: flagUrl("SS") },
  { code: "ES", name: "Spain",                      flag: flagUrl("ES") },
  { code: "LK", name: "Sri Lanka",                  flag: flagUrl("LK") },
  // Sudan — yüksek riskli, Stripe kısıtlı
  { code: "SR", name: "Suriname",                   flag: flagUrl("SR") },
  { code: "SE", name: "Sweden",                     flag: flagUrl("SE") },
  { code: "CH", name: "Switzerland",                flag: flagUrl("CH") },
  // Syria — OFAC yaptırım listesi, Stripe yasak
  { code: "TW", name: "Taiwan",                     flag: flagUrl("TW") },
  { code: "TJ", name: "Tajikistan",                 flag: flagUrl("TJ") },
  { code: "TZ", name: "Tanzania",                   flag: flagUrl("TZ") },
  { code: "TH", name: "Thailand",                   flag: flagUrl("TH") },
  { code: "TL", name: "Timor-Leste",                flag: flagUrl("TL") },
  { code: "TG", name: "Togo",                       flag: flagUrl("TG") },
  { code: "TO", name: "Tonga",                      flag: flagUrl("TO") },
  { code: "TT", name: "Trinidad and Tobago",        flag: flagUrl("TT") },
  { code: "TN", name: "Tunisia",                    flag: flagUrl("TN") },
  { code: "TR", name: "Turkey",                     flag: flagUrl("TR") },
  { code: "TM", name: "Turkmenistan",               flag: flagUrl("TM") },
  { code: "TV", name: "Tuvalu",                     flag: flagUrl("TV") },
  { code: "UG", name: "Uganda",                     flag: flagUrl("UG") },
  { code: "UA", name: "Ukraine",                    flag: flagUrl("UA") },
  // UAE — lisanssız online gaming yasak
  { code: "GB", name: "United Kingdom",             flag: flagUrl("GB") },
  { code: "US", name: "United States",              flag: flagUrl("US") },
  { code: "UY", name: "Uruguay",                    flag: flagUrl("UY") },
  { code: "UZ", name: "Uzbekistan",                 flag: flagUrl("UZ") },
  { code: "VU", name: "Vanuatu",                    flag: flagUrl("VU") },
  { code: "VE", name: "Venezuela",                  flag: flagUrl("VE") },
  { code: "VN", name: "Vietnam",                    flag: flagUrl("VN") },
  // Yemen — yüksek riskli
  { code: "ZM", name: "Zambia",                     flag: flagUrl("ZM") },
  { code: "ZW", name: "Zimbabwe",                   flag: flagUrl("ZW") },
].sort((a, b) => a.name.localeCompare(b.name));

export const POPULAR_COUNTRIES: Country[] = [
  "GB", "US", "TR", "DE", "FR", "AU", "CA", "NL",
  "SE", "NO", "DK", "FI", "IE", "SG", "NZ", "ZA", "NG",
  "PL", "IT", "ES", "PT", "BE", "CH", "AT", "GR",
].map(code => ALL_COUNTRIES.find(c => c.code === code)!).filter(Boolean);

// IP bazlı ülke tespiti
export async function detectCountry(): Promise<string> {
  try {
    const res = await fetch("https://ipapi.co/json/");
    const data = await res.json();
    return data.country_code || "GB";
  } catch {
    return "GB";
  }
}

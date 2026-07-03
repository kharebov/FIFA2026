function isoToFlagEmoji(iso2: string): string {
  return [...iso2.toUpperCase()]
    .map((char) => String.fromCodePoint(0x1f1e6 + (char.charCodeAt(0) - 65)))
    .join("");
}

// England and Scotland don't have their own ISO 3166-1 codes (they're part of
// GB), so they use Unicode's regional tag-sequence flags instead of the usual
// two-letter regional-indicator ones.
const ENGLAND_FLAG = "\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}";
const SCOTLAND_FLAG = "\u{1F3F4}\u{E0067}\u{E0062}\u{E0073}\u{E0063}\u{E0074}\u{E007F}";

// Team names exactly as returned by football-data.org for the WC 2026 field.
const TEAM_ISO_CODES: Record<string, string> = {
  Algeria: "DZ",
  Argentina: "AR",
  Australia: "AU",
  Austria: "AT",
  Belgium: "BE",
  "Bosnia-Herzegovina": "BA",
  Brazil: "BR",
  Canada: "CA",
  "Cape Verde Islands": "CV",
  Colombia: "CO",
  "Congo DR": "CD",
  Croatia: "HR",
  "Curaçao": "CW",
  Czechia: "CZ",
  Ecuador: "EC",
  Egypt: "EG",
  France: "FR",
  Germany: "DE",
  Ghana: "GH",
  Haiti: "HT",
  Iran: "IR",
  Iraq: "IQ",
  "Ivory Coast": "CI",
  Japan: "JP",
  Jordan: "JO",
  Mexico: "MX",
  Morocco: "MA",
  Netherlands: "NL",
  "New Zealand": "NZ",
  Norway: "NO",
  Panama: "PA",
  Paraguay: "PY",
  Portugal: "PT",
  Qatar: "QA",
  "Saudi Arabia": "SA",
  Senegal: "SN",
  "South Africa": "ZA",
  "South Korea": "KR",
  Spain: "ES",
  Sweden: "SE",
  Switzerland: "CH",
  Tunisia: "TN",
  Turkey: "TR",
  "United States": "US",
  Uruguay: "UY",
  Uzbekistan: "UZ",
};

const TEAM_FLAGS: Record<string, string> = {
  ...Object.fromEntries(Object.entries(TEAM_ISO_CODES).map(([team, iso]) => [team, isoToFlagEmoji(iso)])),
  England: ENGLAND_FLAG,
  Scotland: SCOTLAND_FLAG,
};

export function teamFlag(teamName: string): string | null {
  return TEAM_FLAGS[teamName] ?? null;
}

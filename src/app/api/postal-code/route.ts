import { NextRequest, NextResponse } from "next/server";

const COUNTRY_CODE_MAP: Record<string, string> = {
  "US": "United States",
  "IN": "India",
  "GB": "United Kingdom",
  "CA": "Canada",
  "AU": "Australia",
  "DE": "Germany",
  "FR": "France",
  "JP": "Japan",
  "CN": "China",
  "BR": "Brazil",
  "MX": "Mexico",
  "ES": "Spain",
  "IT": "Italy",
  "NL": "Netherlands",
  "BE": "Belgium",
  "CH": "Switzerland",
  "AT": "Austria",
  "PL": "Poland",
  "SE": "Sweden",
  "NO": "Norway",
  "DK": "Denmark",
  "FI": "Finland",
  "IE": "Ireland",
  "NZ": "New Zealand",
  "SG": "Singapore",
  "MY": "Malaysia",
  "TH": "Thailand",
  "PH": "Philippines",
  "ID": "Indonesia",
  "VN": "Vietnam",
  "KR": "South Korea",
  "TW": "Taiwan",
  "HK": "Hong Kong",
  "AE": "United Arab Emirates",
  "SA": "Saudi Arabia",
  "ZA": "South Africa",
  "EG": "Egypt",
  "NG": "Nigeria",
  "KE": "Kenya",
  "AR": "Argentina",
  "CL": "Chile",
  "CO": "Colombia",
  "PE": "Peru",
  "VE": "Venezuela",
  "RU": "Russia",
  "UA": "Ukraine",
  "TR": "Turkey",
  "GR": "Greece",
  "PT": "Portugal",
  "CZ": "Czech Republic",
  "HU": "Hungary",
  "RO": "Romania",
  "BG": "Bulgaria",
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json(
      { error: "Postal code is required", code: "MISSING_CODE" },
      { status: 400 }
    );
  }

  const apiKey = process.env.NEXT_PUBLIC_ZIP_CODE_BASE_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json(
      { error: "API configuration error", code: "NO_API_KEY" },
      { status: 500 }
    );
  }

  const cleanCode = code.trim();

  try {
    const response = await fetch(
      `https://app.zipcodebase.com/api/v1/search?apikey=${apiKey}&codes=${encodeURIComponent(cleanCode)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Zipcodebase API error:", response.status, errorText);
      return NextResponse.json(
        { error: "Failed to lookup postal code", code: "API_ERROR" },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (data.results && Object.keys(data.results).length > 0) {
      const firstKey = Object.keys(data.results)[0];
      const locationData = data.results[firstKey];

      if (locationData && locationData.length > 0) {
        const place = locationData[0];
        
        const countryCode = place.country_code || "";
        const countryName = COUNTRY_CODE_MAP[countryCode] || countryCode;

        let cityName = place.city || place.city_en || "";
        const stateName = place.state || place.state_en || "";
        
        if (!cityName || cityName.length < 4) {
          cityName = place.province || stateName || cityName;
        }

        const responseData = {
          city: cityName,
          state: stateName,
          stateCode: place.state_code || "",
          country: countryName,
          countryCode: countryCode,
        };

        return NextResponse.json(responseData);
      }
    }

    return NextResponse.json(
      { 
        error: "Postal code not found. You can enter manually.",
        code: "NOT_FOUND",
        allowManualEntry: true
      },
      { status: 404 }
    );

  } catch (error) {
    console.error("Postal code lookup error:", error);
    return NextResponse.json(
      { error: "Failed to lookup postal code", code: "ERROR" },
      { status: 500 }
    );
  }
}
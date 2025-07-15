import { z } from "zod";
import { publicProcedure } from "../../../create-context";

const GOCARDLESS_BASE_URL = "https://bankaccountdata.gocardless.com/api/v2";

export const getInstitutionsProcedure = publicProcedure
  .input(z.object({ 
    accessToken: z.string(),
    countries: z.array(z.string()).default(["gb", "us"])
  }))
  .query(async ({ input }) => {
    try {
      console.log(`Fetching institutions for countries: ${input.countries.join(', ')}`);
      
      // Fetch institutions for all requested countries
      const allInstitutions = [];
      
      for (const country of input.countries) {
        try {
          const response = await fetch(
            `${GOCARDLESS_BASE_URL}/institutions/?country=${country}`,
            {
              headers: {
                "Authorization": `Bearer ${input.accessToken}`,
                "Accept": "application/json",
              },
            }
          );

          console.log(`Institutions response status for ${country}:`, response.status);

          if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data)) {
              console.log(`Fetched ${data.length} institutions for ${country}`);
              allInstitutions.push(...data.map((institution: any) => ({
                ...institution,
                country: country.toUpperCase(),
              })));
            }
          } else {
            console.warn(`Failed to fetch institutions for ${country}:`, response.statusText);
          }
        } catch (countryError) {
          console.warn(`Error fetching institutions for ${country}:`, countryError);
        }
      }
      
      if (allInstitutions.length === 0) {
        throw new Error('No institutions found for the requested countries');
      }
      
      // Transform to match our existing Bank interface
      const institutions = allInstitutions.map((institution: any) => ({
        id: institution.id,
        name: institution.name,
        logoUrl: institution.logo || "",
        color: getColorForBank(institution.name),
        bic: institution.bic,
        transaction_total_days: institution.transaction_total_days,
        countries: institution.countries || [institution.country],
        country: institution.country,
      }));

      console.log(`Total institutions fetched: ${institutions.length}`);
      return institutions;
    } catch (error) {
      console.error("GoCardless institutions error:", error);
      throw new Error("Failed to fetch supported banks");
    }
  });

// Helper function to assign colors to banks
function getColorForBank(bankName: string): string {
  const colorMap: { [key: string]: string } = {
    // UK Banks
    "Lloyds Bank": "#006A4D",
    "Barclays": "#00AEEF", 
    "HSBC": "#DB0011",
    "NatWest": "#4E2A84",
    "Santander": "#EC0000",
    "Halifax": "#0040FF",
    "Nationwide": "#004A8F",
    "Royal Bank of Scotland": "#003399",
    "TSB": "#0066B3",
    "Monzo": "#FF4D55",
    "Starling Bank": "#7433FF",
    "Revolut": "#191C1F",
    // US Banks
    "Bank of America": "#E31837",
    "Chase": "#117ACA",
    "Wells Fargo": "#D71921",
    "Citibank": "#1976D2",
    "Capital One": "#004879",
    "American Express": "#006FCF",
    "Goldman Sachs": "#0066CC",
    "Morgan Stanley": "#0066CC",
    "US Bank": "#005DAA",
    "PNC Bank": "#F47920",
    "TD Bank": "#00B04F",
    "Ally Bank": "#A020F0",
  };

  // Try to match bank name
  for (const [name, color] of Object.entries(colorMap)) {
    if (bankName.toLowerCase().includes(name.toLowerCase())) {
      return color;
    }
  }

  // Default color
  return "#4F46E5";
}
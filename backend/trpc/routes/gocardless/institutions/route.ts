import { z } from "zod";
import { publicProcedure } from "../../../create-context";

const GOCARDLESS_BASE_URL = "https://bankaccountdata.gocardless.com/api/v2";

export const getInstitutionsProcedure = publicProcedure
  .input(z.object({ 
    accessToken: z.string(),
    country: z.string().default("gb")
  }))
  .query(async ({ input }) => {
    try {
      console.log(`Fetching institutions for country: ${input.country}`);
      
      const response = await fetch(
        `${GOCARDLESS_BASE_URL}/institutions/?country=${input.country}`,
        {
          headers: {
            "Authorization": `Bearer ${input.accessToken}`,
            "Accept": "application/json",
          },
        }
      );

      console.log('Institutions response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Institutions error response:', errorText);
        throw new Error(`Failed to fetch institutions: ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log(`Fetched ${data.length} institutions`);
      
      if (!Array.isArray(data)) {
        console.error('Unexpected institutions response format:', data);
        throw new Error('Invalid response format from GoCardless');
      }
      
      // Transform to match our existing Bank interface
      const institutions = data.map((institution: any) => ({
        id: institution.id,
        name: institution.name,
        logoUrl: institution.logo || "",
        color: getColorForBank(institution.name),
        bic: institution.bic,
        transaction_total_days: institution.transaction_total_days,
        countries: institution.countries,
      }));

      return institutions;
    } catch (error) {
      console.error("GoCardless institutions error:", error);
      throw new Error("Failed to fetch supported banks");
    }
  });

// Helper function to assign colors to banks
function getColorForBank(bankName: string): string {
  const colorMap: { [key: string]: string } = {
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
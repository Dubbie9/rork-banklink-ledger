import { z } from "zod";
import { publicProcedure } from "../../../create-context";

const GOCARDLESS_BASE_URL = "https://bankaccountdata.gocardless.com/api/v2";

export const getInstitutionsByCountryProcedure = publicProcedure
  .input(z.object({ 
    accessToken: z.string(),
    country: z.string()
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
      console.log(`Fetched ${data.length} institutions for ${input.country}`);
      
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
        country: input.country,
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
    
    // German Banks
    "Deutsche Bank": "#0018A8",
    "Commerzbank": "#FFCC00",
    "DKB": "#005CA9",
    "ING": "#FF6200",
    "Sparkasse": "#FF0000",
    "Postbank": "#FFCC00",
    
    // French Banks
    "BNP Paribas": "#009639",
    "Crédit Agricole": "#00A651",
    "Société Générale": "#E20613",
    "LCL": "#009FE3",
    "Crédit Mutuel": "#003D6B",
    
    // Spanish Banks
    "BBVA": "#004481",
    "CaixaBank": "#0075C9",
    "Banco Sabadell": "#0066CC",
    
    // Italian Banks
    "UniCredit": "#E30613",
    "Intesa Sanpaolo": "#1E3A8A",
    "Banco BPM": "#FF6B35",
    
    // Dutch Banks
    "ABN AMRO": "#00A651",
    "Rabobank": "#FF6200",
    "ING Bank": "#FF6200",
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
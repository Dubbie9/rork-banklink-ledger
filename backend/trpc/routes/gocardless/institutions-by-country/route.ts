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
      
      // For US and Nigeria, return mock data since GoCardless has limited coverage
      if (input.country.toLowerCase() === 'us') {
        return getMockUSBanks();
      }
      
      if (input.country.toLowerCase() === 'ng') {
        return getMockNigerianBanks();
      }
      
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
    
    // US Banks
    "Chase": "#0066B2",
    "Bank of America": "#E31837",
    "Wells Fargo": "#D71921",
    "Citibank": "#1976D2",
    "Capital One": "#004879",
    "American Express": "#006FCF",
    "Goldman Sachs": "#1E3A8A",
    "Morgan Stanley": "#0066CC",
    
    // Nigerian Banks
    "Access Bank": "#E31837",
    "Zenith Bank": "#FF6B35",
    "Guaranty Trust Bank": "#FF6200",
    "First Bank of Nigeria": "#004225",
    "United Bank for Africa": "#E31837",
    "Fidelity Bank": "#1E3A8A",
    "Sterling Bank": "#7B68EE",
    "Stanbic IBTC": "#0066CC",
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

// Mock US banks data
function getMockUSBanks() {
  return [
    {
      id: "CHASE_US",
      name: "Chase",
      logoUrl: "",
      color: "#0066B2",
      bic: "CHASUS33",
      transaction_total_days: 90,
      countries: ["US"],
      country: "us",
    },
    {
      id: "BANK_OF_AMERICA_US",
      name: "Bank of America",
      logoUrl: "",
      color: "#E31837",
      bic: "BOFAUS3N",
      transaction_total_days: 90,
      countries: ["US"],
      country: "us",
    },
    {
      id: "WELLS_FARGO_US",
      name: "Wells Fargo",
      logoUrl: "",
      color: "#D71921",
      bic: "WFBIUS6S",
      transaction_total_days: 90,
      countries: ["US"],
      country: "us",
    },
    {
      id: "CITIBANK_US",
      name: "Citibank",
      logoUrl: "",
      color: "#1976D2",
      bic: "CITIUS33",
      transaction_total_days: 90,
      countries: ["US"],
      country: "us",
    },
    {
      id: "CAPITAL_ONE_US",
      name: "Capital One",
      logoUrl: "",
      color: "#004879",
      bic: "HIBKUS44",
      transaction_total_days: 90,
      countries: ["US"],
      country: "us",
    },
    {
      id: "AMERICAN_EXPRESS_US",
      name: "American Express",
      logoUrl: "",
      color: "#006FCF",
      bic: "AEXPUS33",
      transaction_total_days: 90,
      countries: ["US"],
      country: "us",
    },
  ];
}

// Mock Nigerian banks data
function getMockNigerianBanks() {
  return [
    {
      id: "ACCESS_BANK_NG",
      name: "Access Bank",
      logoUrl: "",
      color: "#E31837",
      bic: "ABNGNGLA",
      transaction_total_days: 90,
      countries: ["NG"],
      country: "ng",
    },
    {
      id: "ZENITH_BANK_NG",
      name: "Zenith Bank",
      logoUrl: "",
      color: "#FF6B35",
      bic: "ZEIBNGLA",
      transaction_total_days: 90,
      countries: ["NG"],
      country: "ng",
    },
    {
      id: "GTB_NG",
      name: "Guaranty Trust Bank",
      logoUrl: "",
      color: "#FF6200",
      bic: "GTBINGLA",
      transaction_total_days: 90,
      countries: ["NG"],
      country: "ng",
    },
    {
      id: "FIRST_BANK_NG",
      name: "First Bank of Nigeria",
      logoUrl: "",
      color: "#004225",
      bic: "FBNINGLA",
      transaction_total_days: 90,
      countries: ["NG"],
      country: "ng",
    },
    {
      id: "UBA_NG",
      name: "United Bank for Africa",
      logoUrl: "",
      color: "#E31837",
      bic: "UNAFNGLA",
      transaction_total_days: 90,
      countries: ["NG"],
      country: "ng",
    },
    {
      id: "FIDELITY_BANK_NG",
      name: "Fidelity Bank",
      logoUrl: "",
      color: "#1E3A8A",
      bic: "FIDTNGLA",
      transaction_total_days: 90,
      countries: ["NG"],
      country: "ng",
    },
    {
      id: "STERLING_BANK_NG",
      name: "Sterling Bank",
      logoUrl: "",
      color: "#7B68EE",
      bic: "STBLNGLA",
      transaction_total_days: 90,
      countries: ["NG"],
      country: "ng",
    },
    {
      id: "STANBIC_IBTC_NG",
      name: "Stanbic IBTC",
      logoUrl: "",
      color: "#0066CC",
      bic: "SBICNGLA",
      transaction_total_days: 90,
      countries: ["NG"],
      country: "ng",
    },
  ];
}
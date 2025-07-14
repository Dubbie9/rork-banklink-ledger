import { publicProcedure } from "../../../create-context";

export const debugEnvProcedure = publicProcedure
  .query(async () => {
    return {
      hasSecretId: !!process.env.GOCARDLESS_SECRET_ID,
      hasSecretKey: !!process.env.GOCARDLESS_SECRET_KEY,
      secretIdLength: process.env.GOCARDLESS_SECRET_ID?.length || 0,
      secretKeyLength: process.env.GOCARDLESS_SECRET_KEY?.length || 0,
      nodeEnv: process.env.NODE_ENV,
      // Don't expose actual values for security
    };
  });
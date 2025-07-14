import { z } from "zod";
import { publicProcedure } from "../../../create-context";

const GOCARDLESS_BASE_URL = "https://bankaccountdata.gocardless.com/api/v2";

export const getAccessTokenProcedure = publicProcedure
  .mutation(async () => {
    const secretId = process.env.GOCARDLESS_SECRET_ID;
    const secretKey = process.env.GOCARDLESS_SECRET_KEY;

    if (!secretId || !secretKey) {
      throw new Error("GoCardless credentials not configured");
    }

    try {
      const response = await fetch(`${GOCARDLESS_BASE_URL}/token/new/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          secret_id: secretId,
          secret_key: secretKey,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to get access token: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        access: data.access,
        refresh: data.refresh,
        access_expires: data.access_expires,
        refresh_expires: data.refresh_expires,
      };
    } catch (error) {
      console.error("GoCardless auth error:", error);
      throw new Error("Failed to authenticate with GoCardless");
    }
  });

export const refreshTokenProcedure = publicProcedure
  .input(z.object({ refreshToken: z.string() }))
  .mutation(async ({ input }) => {
    try {
      const response = await fetch(`${GOCARDLESS_BASE_URL}/token/refresh/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          refresh: input.refreshToken,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to refresh token: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        access: data.access,
        refresh: data.refresh,
        access_expires: data.access_expires,
        refresh_expires: data.refresh_expires,
      };
    } catch (error) {
      console.error("GoCardless token refresh error:", error);
      throw new Error("Failed to refresh access token");
    }
  });
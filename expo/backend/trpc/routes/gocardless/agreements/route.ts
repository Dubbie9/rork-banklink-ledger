import { z } from "zod";
import { publicProcedure } from "../../../create-context";

const GOCARDLESS_BASE_URL = "https://bankaccountdata.gocardless.com/api/v2";

export const createAgreementProcedure = publicProcedure
  .input(z.object({
    accessToken: z.string(),
    institutionId: z.string(),
    maxHistoricalDays: z.number().default(90),
    accessValidForDays: z.number().default(30),
    accessScope: z.array(z.string()).default(["balances", "details", "transactions"]),
  }))
  .mutation(async ({ input }) => {
    try {
      const response = await fetch(`${GOCARDLESS_BASE_URL}/agreements/enduser/`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${input.accessToken}`,
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          institution_id: input.institutionId,
          max_historical_days: input.maxHistoricalDays,
          access_valid_for_days: input.accessValidForDays,
          access_scope: input.accessScope,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create agreement: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        id: data.id,
        created: data.created,
        max_historical_days: data.max_historical_days,
        access_valid_for_days: data.access_valid_for_days,
        access_scope: data.access_scope,
        accepted: data.accepted,
        institution_id: data.institution_id,
      };
    } catch (error) {
      console.error("GoCardless agreement error:", error);
      throw new Error("Failed to create end user agreement");
    }
  });

export const getAgreementProcedure = publicProcedure
  .input(z.object({
    accessToken: z.string(),
    agreementId: z.string(),
  }))
  .query(async ({ input }) => {
    try {
      const response = await fetch(
        `${GOCARDLESS_BASE_URL}/agreements/enduser/${input.agreementId}/`,
        {
          headers: {
            "Authorization": `Bearer ${input.accessToken}`,
            "Accept": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get agreement: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("GoCardless get agreement error:", error);
      throw new Error("Failed to get agreement details");
    }
  });

export const deleteAgreementProcedure = publicProcedure
  .input(z.object({
    accessToken: z.string(),
    agreementId: z.string(),
  }))
  .mutation(async ({ input }) => {
    try {
      const response = await fetch(
        `${GOCARDLESS_BASE_URL}/agreements/enduser/${input.agreementId}/`,
        {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${input.accessToken}`,
            "Accept": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete agreement: ${response.statusText}`);
      }

      return { success: true };
    } catch (error) {
      console.error("GoCardless delete agreement error:", error);
      throw new Error("Failed to delete agreement");
    }
  });
import { z } from "zod";
import { publicProcedure } from "../../../create-context";

const GOCARDLESS_BASE_URL = "https://bankaccountdata.gocardless.com/api/v2";

export const createRequisitionProcedure = publicProcedure
  .input(z.object({
    accessToken: z.string(),
    institutionId: z.string(),
    redirectUrl: z.string(),
    reference: z.string(),
    agreementId: z.string().optional(),
    userLanguage: z.string().default("EN"),
  }))
  .mutation(async ({ input }) => {
    try {
      const response = await fetch(`${GOCARDLESS_BASE_URL}/requisitions/`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${input.accessToken}`,
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          redirect: input.redirectUrl,
          institution_id: input.institutionId,
          reference: input.reference,
          agreement: input.agreementId,
          user_language: input.userLanguage,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create requisition: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        id: data.id,
        link: data.link,
        redirect: data.redirect,
        status: data.status,
        institution_id: data.institution_id,
        agreement: data.agreement,
        reference: data.reference,
        accounts: data.accounts,
        user_language: data.user_language,
        created: data.created,
      };
    } catch (error) {
      console.error("GoCardless requisition error:", error);
      throw new Error("Failed to create bank connection");
    }
  });

export const getRequisitionProcedure = publicProcedure
  .input(z.object({
    accessToken: z.string(),
    requisitionId: z.string(),
  }))
  .query(async ({ input }) => {
    try {
      const response = await fetch(
        `${GOCARDLESS_BASE_URL}/requisitions/${input.requisitionId}/`,
        {
          headers: {
            "Authorization": `Bearer ${input.accessToken}`,
            "Accept": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get requisition: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("GoCardless get requisition error:", error);
      throw new Error("Failed to get bank connection status");
    }
  });

export const deleteRequisitionProcedure = publicProcedure
  .input(z.object({
    accessToken: z.string(),
    requisitionId: z.string(),
  }))
  .mutation(async ({ input }) => {
    try {
      const response = await fetch(
        `${GOCARDLESS_BASE_URL}/requisitions/${input.requisitionId}/`,
        {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${input.accessToken}`,
            "Accept": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete requisition: ${response.statusText}`);
      }

      return { success: true };
    } catch (error) {
      console.error("GoCardless delete requisition error:", error);
      throw new Error("Failed to disconnect bank");
    }
  });
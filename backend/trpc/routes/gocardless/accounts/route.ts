import { z } from "zod";
import { publicProcedure } from "../../../create-context";

const GOCARDLESS_BASE_URL = "https://bankaccountdata.gocardless.com/api/v2";

export const getAccountDetailsProcedure = publicProcedure
  .input(z.object({
    accessToken: z.string(),
    accountId: z.string(),
  }))
  .query(async ({ input }) => {
    try {
      const response = await fetch(
        `${GOCARDLESS_BASE_URL}/accounts/${input.accountId}/details/`,
        {
          headers: {
            "Authorization": `Bearer ${input.accessToken}`,
            "Accept": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get account details: ${response.statusText}`);
      }

      const data = await response.json();
      return data.account;
    } catch (error) {
      console.error("GoCardless account details error:", error);
      throw new Error("Failed to get account details");
    }
  });

export const getAccountBalancesProcedure = publicProcedure
  .input(z.object({
    accessToken: z.string(),
    accountId: z.string(),
  }))
  .query(async ({ input }) => {
    try {
      const response = await fetch(
        `${GOCARDLESS_BASE_URL}/accounts/${input.accountId}/balances/`,
        {
          headers: {
            "Authorization": `Bearer ${input.accessToken}`,
            "Accept": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get account balances: ${response.statusText}`);
      }

      const data = await response.json();
      return data.balances;
    } catch (error) {
      console.error("GoCardless account balances error:", error);
      throw new Error("Failed to get account balances");
    }
  });

export const getAccountTransactionsProcedure = publicProcedure
  .input(z.object({
    accessToken: z.string(),
    accountId: z.string(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
  }))
  .query(async ({ input }) => {
    try {
      let url = `${GOCARDLESS_BASE_URL}/accounts/${input.accountId}/transactions/`;
      
      const params = new URLSearchParams();
      if (input.dateFrom) params.append("date_from", input.dateFrom);
      if (input.dateTo) params.append("date_to", input.dateTo);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${input.accessToken}`,
          "Accept": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get transactions: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Transform transactions to match our existing Transaction interface
      const transformedTransactions = data.transactions.booked.map((tx: any) => {
        const amount = parseFloat(tx.transactionAmount.amount);
        const isOutgoing = amount < 0;
        
        return {
          id: tx.transactionId || tx.internalTransactionId,
          bankId: input.accountId,
          amount: Math.abs(amount),
          date: tx.bookingDate || tx.valueDate,
          description: tx.remittanceInformationUnstructured || tx.additionalInformation || "Transaction",
          type: isOutgoing ? "outgoing" : "incoming",
          counterpartyId: generateCounterpartyId(tx),
          counterpartyName: getCounterpartyName(tx, isOutgoing),
          reference: tx.endToEndId || tx.mandateId || "",
          currency: tx.transactionAmount.currency,
          rawData: tx, // Keep original data for debugging
        };
      });

      return transformedTransactions;
    } catch (error) {
      console.error("GoCardless transactions error:", error);
      throw new Error("Failed to get transactions");
    }
  });

// Helper functions
function generateCounterpartyId(transaction: any): string {
  // Try to create a consistent ID for the counterparty
  const creditorName = transaction.creditorName;
  const debtorName = transaction.debtorName;
  const creditorAccount = transaction.creditorAccount?.iban;
  const debtorAccount = transaction.debtorAccount?.iban;
  
  const name = creditorName || debtorName || "Unknown";
  const account = creditorAccount || debtorAccount || "";
  
  // Create a simple hash-like ID
  return btoa(`${name}-${account}`).replace(/[^a-zA-Z0-9]/g, "").substring(0, 16);
}

function getCounterpartyName(transaction: any, isOutgoing: boolean): string {
  if (isOutgoing) {
    // For outgoing transactions, the counterparty is the creditor (recipient)
    return transaction.creditorName || 
           transaction.ultimateCreditor || 
           "Unknown Recipient";
  } else {
    // For incoming transactions, the counterparty is the debtor (sender)
    return transaction.debtorName || 
           transaction.ultimateDebtor || 
           "Unknown Sender";
  }
}
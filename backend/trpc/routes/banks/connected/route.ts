import { z } from "zod";
import { publicProcedure } from "../../../create-context";

// Mock connected banks storage - in production, this would be in a database
const connectedBanks = new Map<string, any[]>();

export const getConnectedBanksProcedure = publicProcedure
  .input(z.object({ 
    userId: z.string()
  }))
  .query(async ({ input }) => {
    const userBanks = connectedBanks.get(input.userId) || [];
    return userBanks;
  });

export const addConnectedBankProcedure = publicProcedure
  .input(z.object({
    userId: z.string(),
    bankId: z.string(),
    bankName: z.string(),
    requisitionId: z.string(),
    accountId: z.string(),
    accountNumber: z.string,
    color: z.string(),
    logoUrl: z.string().optional(),
  }))
  .mutation(async ({ input }) => {
    const userBanks = connectedBanks.get(input.userId) || [];
    
    // Check if bank is already connected
    const existingBank = userBanks.find(bank => bank.id === input.bankId);
    if (existingBank) {
      throw new Error("Bank is already connected");
    }
    
    const newBank = {
      id: input.bankId,
      name: input.bankName,
      color: input.color,
      logoUrl: input.logoUrl || "",
      accountNumber: input.accountNumber,
      lastUpdated: "Today",
      transactionCount: 0,
      requisitionId: input.requisitionId,
      accountId: input.accountId,
      connectedAt: new Date().toISOString(),
    };
    
    userBanks.push(newBank);
    connectedBanks.set(input.userId, userBanks);
    
    return newBank;
  });

export const removeConnectedBankProcedure = publicProcedure
  .input(z.object({
    userId: z.string(),
    requisitionId: z.string(),
  }))
  .mutation(async ({ input }) => {
    const userBanks = connectedBanks.get(input.userId) || [];
    const filteredBanks = userBanks.filter(bank => bank.requisitionId !== input.requisitionId);
    
    connectedBanks.set(input.userId, filteredBanks);
    
    return { success: true };
  });
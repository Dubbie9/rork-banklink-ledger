import { trpcClient } from '@/lib/trpc';
import { Institution } from '../../core/entities/bank.entity';
import { GoCardlessRepository } from '../../core/repositories/gocardless.repository';

/**
 * GoCardless API implementation
 * Handles all interactions with GoCardless Open Banking API
 */
export class GoCardlessApiRepository implements GoCardlessRepository {
  
  /**
   * Get all available institutions
   */
  async getAllInstitutions(): Promise<Institution[]> {
    try {
      const response = await trpcClient.gocardless.institutions.list.query();
      return this.transformInstitutions(response);
    } catch (error) {
      console.error('Failed to fetch institutions:', error);
      throw new Error('Failed to fetch available banks');
    }
  }

  /**
   * Get institutions by country code
   */
  async getInstitutionsByCountry(countryCode: string): Promise<Institution[]> {
    try {
      const response = await trpcClient.gocardless.institutions.byCountry.query({ 
        country: countryCode.toUpperCase() 
      });
      return this.transformInstitutions(response);
    } catch (error) {
      console.error('Failed to fetch institutions by country:', error);
      throw new Error(`Failed to fetch banks for ${countryCode}`);
    }
  }

  /**
   * Get specific institution details
   */
  async getInstitution(institutionId: string): Promise<Institution> {
    try {
      // This would typically be a separate endpoint, but we'll get from the list
      const institutions = await this.getAllInstitutions();
      const institution = institutions.find(inst => inst.id === institutionId);
      
      if (!institution) {
        throw new Error('Institution not found');
      }
      
      return institution;
    } catch (error) {
      console.error('Failed to fetch institution:', error);
      throw new Error('Failed to fetch bank details');
    }
  }

  /**
   * Create end user agreement
   */
  async createAgreement(institutionId: string): Promise<{
    id: string;
    accepted: boolean;
    max_historical_days: number;
    access_valid_for_days: number;
  }> {
    try {
      const response = await trpcClient.gocardless.agreements.create.mutate({
        institutionId,
        maxHistoricalDays: 90,
        accessValidForDays: 90,
        accessScope: ['balances', 'details', 'transactions'],
      });
      
      return response;
    } catch (error) {
      console.error('Failed to create agreement:', error);
      throw new Error('Failed to create bank agreement');
    }
  }

  /**
   * Get agreement details
   */
  async getAgreement(agreementId: string): Promise<any> {
    try {
      return await trpcClient.gocardless.agreements.get.query({ agreementId });
    } catch (error) {
      console.error('Failed to fetch agreement:', error);
      throw new Error('Failed to fetch agreement details');
    }
  }

  /**
   * Delete agreement
   */
  async deleteAgreement(agreementId: string): Promise<void> {
    try {
      await trpcClient.gocardless.agreements.delete.mutate({ agreementId });
    } catch (error) {
      console.error('Failed to delete agreement:', error);
      throw new Error('Failed to delete agreement');
    }
  }

  /**
   * Create requisition for bank connection
   */
  async createRequisition(params: {
    institutionId: string;
    agreementId: string;
    redirectUrl: string;
  }): Promise<{
    id: string;
    link: string;
    status: string;
    institution_id: string;
    agreement: string;
    accounts: string[];
  }> {
    try {
      const response = await trpcClient.gocardless.requisitions.create.mutate({
        institutionId: params.institutionId,
        agreementId: params.agreementId,
        redirectUrl: params.redirectUrl,
        userLanguage: 'EN',
      });
      
      return response;
    } catch (error) {
      console.error('Failed to create requisition:', error);
      throw new Error('Failed to create bank connection request');
    }
  }

  /**
   * Get requisition details
   */
  async getRequisition(requisitionId: string): Promise<{
    id: string;
    status: string;
    institution_id: string;
    agreement: string;
    accounts: string[];
  }> {
    try {
      return await trpcClient.gocardless.requisitions.get.query({ requisitionId });
    } catch (error) {
      console.error('Failed to fetch requisition:', error);
      throw new Error('Failed to fetch connection status');
    }
  }

  /**
   * Delete requisition
   */
  async deleteRequisition(requisitionId: string): Promise<void> {
    try {
      await trpcClient.gocardless.requisitions.delete.mutate({ requisitionId });
    } catch (error) {
      console.error('Failed to delete requisition:', error);
      throw new Error('Failed to delete connection');
    }
  }

  /**
   * Get account details
   */
  async getAccountDetails(accountId: string): Promise<any> {
    try {
      return await trpcClient.gocardless.accounts.details.query({ accountId });
    } catch (error) {
      console.error('Failed to fetch account details:', error);
      throw new Error('Failed to fetch account information');
    }
  }

  /**
   * Get account balances
   */
  async getAccountBalances(accountId: string): Promise<any> {
    try {
      return await trpcClient.gocardless.accounts.balances.query({ accountId });
    } catch (error) {
      console.error('Failed to fetch account balances:', error);
      throw new Error('Failed to fetch account balances');
    }
  }

  /**
   * Get account transactions
   */
  async getAccountTransactions(accountId: string): Promise<any> {
    try {
      return await trpcClient.gocardless.accounts.transactions.query({ accountId });
    } catch (error) {
      console.error('Failed to fetch account transactions:', error);
      throw new Error('Failed to fetch transactions');
    }
  }

  /**
   * Authenticate with GoCardless API
   */
  async authenticate(): Promise<{
    access: string;
    refresh: string;
    access_expires: number;
    refresh_expires: number;
  }> {
    try {
      return await trpcClient.gocardless.auth.getAccessToken.mutate();
    } catch (error) {
      console.error('Failed to authenticate with GoCardless:', error);
      throw new Error('Failed to authenticate with banking service');
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<{
    access: string;
    refresh: string;
    access_expires: number;
    refresh_expires: number;
  }> {
    try {
      return await trpcClient.gocardless.auth.refreshToken.mutate({ refreshToken });
    } catch (error) {
      console.error('Failed to refresh GoCardless token:', error);
      throw new Error('Failed to refresh authentication');
    }
  }

  /**
   * Transform GoCardless institution data to our domain model
   */
  private transformInstitutions(institutions: any[]): Institution[] {
    return institutions.map(inst => ({
      id: inst.id,
      name: inst.name,
      bic: inst.bic || '',
      transaction_total_days: inst.transaction_total_days || '90',
      countries: inst.countries || [],
      logo: inst.logo || '',
    }));
  }
}
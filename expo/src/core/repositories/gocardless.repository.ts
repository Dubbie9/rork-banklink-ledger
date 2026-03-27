import { Institution } from '../entities/bank.entity';

/**
 * GoCardless API repository interface
 * Defines the contract for GoCardless API interactions
 */
export interface GoCardlessRepository {
  /**
   * Get all available institutions
   */
  getAllInstitutions(): Promise<Institution[]>;

  /**
   * Get institutions by country code
   */
  getInstitutionsByCountry(countryCode: string): Promise<Institution[]>;

  /**
   * Get specific institution details
   */
  getInstitution(institutionId: string): Promise<Institution>;

  /**
   * Create end user agreement
   */
  createAgreement(institutionId: string): Promise<{
    id: string;
    accepted: boolean;
    max_historical_days: number;
    access_valid_for_days: number;
  }>;

  /**
   * Get agreement details
   */
  getAgreement(agreementId: string): Promise<any>;

  /**
   * Delete agreement
   */
  deleteAgreement(agreementId: string): Promise<void>;

  /**
   * Create requisition for bank connection
   */
  createRequisition(params: {
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
  }>;

  /**
   * Get requisition details
   */
  getRequisition(requisitionId: string): Promise<{
    id: string;
    status: string;
    institution_id: string;
    agreement: string;
    accounts: string[];
  }>;

  /**
   * Delete requisition
   */
  deleteRequisition(requisitionId: string): Promise<void>;

  /**
   * Get account details
   */
  getAccountDetails(accountId: string): Promise<any>;

  /**
   * Get account balances
   */
  getAccountBalances(accountId: string): Promise<any>;

  /**
   * Get account transactions
   */
  getAccountTransactions(accountId: string): Promise<any>;

  /**
   * Authenticate with GoCardless API
   */
  authenticate(): Promise<{
    access: string;
    refresh: string;
    access_expires: number;
    refresh_expires: number;
  }>;

  /**
   * Refresh access token
   */
  refreshToken(refreshToken: string): Promise<{
    access: string;
    refresh: string;
    access_expires: number;
    refresh_expires: number;
  }>;
}
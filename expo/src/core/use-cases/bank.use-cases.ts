import { Bank, Institution, BankConnection, ConnectBankRequest } from '../entities/bank.entity';
import { BankRepository } from '../repositories/bank.repository';
import { GoCardlessRepository } from '../repositories/gocardless.repository';

/**
 * Bank management use cases
 * Contains all business logic related to bank connections and management
 */
export class BankUseCases {
  constructor(
    private bankRepository: BankRepository,
    private goCardlessRepository: GoCardlessRepository
  ) {}

  /**
   * Get all connected banks for a user
   */
  async getUserBanks(userId: string): Promise<Bank[]> {
    return await this.bankRepository.getUserBanks(userId);
  }

  /**
   * Get available institutions by country
   */
  async getInstitutionsByCountry(countryCode: string): Promise<Institution[]> {
    // Validate country code
    if (!countryCode || countryCode.length !== 2) {
      throw new Error('Invalid country code');
    }

    return await this.goCardlessRepository.getInstitutionsByCountry(countryCode);
  }

  /**
   * Search institutions by name
   */
  async searchInstitutions(query: string, countryCode?: string): Promise<Institution[]> {
    if (!query.trim()) {
      return [];
    }

    const institutions = countryCode 
      ? await this.goCardlessRepository.getInstitutionsByCountry(countryCode)
      : await this.goCardlessRepository.getAllInstitutions();

    return institutions.filter(institution => 
      institution.name.toLowerCase().includes(query.toLowerCase())
    );
  }

  /**
   * Connect a new bank account
   */
  async connectBank(request: ConnectBankRequest): Promise<{ redirectUrl: string; requisitionId: string }> {
    // Validate request
    if (!request.institutionId) {
      throw new Error('Institution ID is required');
    }
    if (!request.userId) {
      throw new Error('User ID is required');
    }
    if (!request.redirectUrl) {
      throw new Error('Redirect URL is required');
    }

    // Create agreement and requisition
    const agreement = await this.goCardlessRepository.createAgreement(request.institutionId);
    const requisition = await this.goCardlessRepository.createRequisition({
      institutionId: request.institutionId,
      agreementId: agreement.id,
      redirectUrl: request.redirectUrl,
    });

    // Store connection record
    const connection: BankConnection = {
      id: requisition.id,
      bankId: request.institutionId,
      userId: request.userId,
      status: 'pending',
      requisitionId: requisition.id,
      agreementId: agreement.id,
      createdAt: new Date().toISOString(),
      expiresAt: agreement.accepted ? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() : undefined,
    };

    await this.bankRepository.saveBankConnection(connection);

    return {
      redirectUrl: requisition.link,
      requisitionId: requisition.id,
    };
  }

  /**
   * Complete bank connection after user authorization
   */
  async completeBankConnection(requisitionId: string): Promise<Bank> {
    // Get requisition details
    const requisition = await this.goCardlessRepository.getRequisition(requisitionId);
    
    if (requisition.status !== 'LN') { // LN = Linked
      throw new Error('Bank connection not completed');
    }

    // Get institution details
    const institution = await this.goCardlessRepository.getInstitution(requisition.institution_id);
    
    // Create bank record
    const bank: Bank = {
      id: requisition.institution_id,
      name: institution.name,
      color: '#0077b6', // Default color
      logoUrl: institution.logo || '',
      isConnected: true,
      connectionId: requisitionId,
      lastUpdated: new Date().toISOString(),
    };

    // Save bank and update connection status
    await this.bankRepository.saveBank(bank);
    await this.bankRepository.updateConnectionStatus(requisitionId, 'connected');

    return bank;
  }

  /**
   * Disconnect a bank
   */
  async disconnectBank(bankId: string, userId: string): Promise<void> {
    const connection = await this.bankRepository.getBankConnection(bankId, userId);
    
    if (!connection) {
      throw new Error('Bank connection not found');
    }

    // Delete requisition and agreement from GoCardless
    if (connection.requisitionId) {
      await this.goCardlessRepository.deleteRequisition(connection.requisitionId);
    }
    if (connection.agreementId) {
      await this.goCardlessRepository.deleteAgreement(connection.agreementId);
    }

    // Remove bank and connection records
    await this.bankRepository.removeBank(bankId, userId);
    await this.bankRepository.removeBankConnection(connection.id);
  }

  /**
   * Sync bank data (accounts, transactions)
   */
  async syncBankData(bankId: string, userId: string): Promise<void> {
    const connection = await this.bankRepository.getBankConnection(bankId, userId);
    
    if (!connection || connection.status !== 'connected') {
      throw new Error('Bank not connected');
    }

    // Get accounts from GoCardless
    const requisition = await this.goCardlessRepository.getRequisition(connection.requisitionId!);
    
    for (const accountId of requisition.accounts) {
      // Sync account details and transactions
      await this.syncAccountData(accountId, bankId);
    }

    // Update last sync time
    await this.bankRepository.updateLastSync(connection.id, new Date().toISOString());
  }

  /**
   * Sync individual account data
   */
  private async syncAccountData(accountId: string, bankId: string): Promise<void> {
    // Get account details
    const accountDetails = await this.goCardlessRepository.getAccountDetails(accountId);
    
    // Get account balances
    const balances = await this.goCardlessRepository.getAccountBalances(accountId);
    
    // Get account transactions
    const transactions = await this.goCardlessRepository.getAccountTransactions(accountId);
    
    // Process and save data (implementation depends on your data structure)
    // This would typically involve transforming GoCardless data to your domain entities
    // and saving them via repositories
  }
}
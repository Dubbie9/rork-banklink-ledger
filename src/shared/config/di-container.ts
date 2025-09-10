import { AuthUseCases } from '@/src/core/use-cases/auth.use-cases';
import { BankUseCases } from '@/src/core/use-cases/bank.use-cases';
import { TransactionUseCases } from '@/src/core/use-cases/transaction.use-cases';

import { FirebaseAuthRepository } from '@/src/infrastructure/auth/firebase-auth.repository';
import { AsyncStorageRepository } from '@/src/infrastructure/storage/async-storage.repository';
import { LocalBankRepository } from '@/src/infrastructure/storage/local-bank.repository';
import { LocalTransactionRepository } from '@/src/infrastructure/storage/local-transaction.repository';
import { GoCardlessApiRepository } from '@/src/infrastructure/api/gocardless-api.repository';

/**
 * Dependency Injection Container
 * Manages the creation and lifecycle of all dependencies
 */
export class DIContainer {
  private static instance: DIContainer;
  
  // Repositories
  private _storageRepository?: AsyncStorageRepository;
  private _authRepository?: FirebaseAuthRepository;
  private _bankRepository?: LocalBankRepository;
  private _transactionRepository?: LocalTransactionRepository;
  private _goCardlessRepository?: GoCardlessApiRepository;
  
  // Use Cases
  private _authUseCases?: AuthUseCases;
  private _bankUseCases?: BankUseCases;
  private _transactionUseCases?: TransactionUseCases;

  private constructor() {}

  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  // Repository getters with lazy initialization
  get storageRepository(): AsyncStorageRepository {
    if (!this._storageRepository) {
      this._storageRepository = new AsyncStorageRepository();
    }
    return this._storageRepository;
  }

  get authRepository(): FirebaseAuthRepository {
    if (!this._authRepository) {
      this._authRepository = new FirebaseAuthRepository(this.storageRepository);
    }
    return this._authRepository;
  }

  get bankRepository(): LocalBankRepository {
    if (!this._bankRepository) {
      this._bankRepository = new LocalBankRepository(this.storageRepository);
    }
    return this._bankRepository;
  }

  get transactionRepository(): LocalTransactionRepository {
    if (!this._transactionRepository) {
      this._transactionRepository = new LocalTransactionRepository(this.storageRepository);
    }
    return this._transactionRepository;
  }

  get goCardlessRepository(): GoCardlessApiRepository {
    if (!this._goCardlessRepository) {
      this._goCardlessRepository = new GoCardlessApiRepository();
    }
    return this._goCardlessRepository;
  }

  // Use case getters with lazy initialization
  get authUseCases(): AuthUseCases {
    if (!this._authUseCases) {
      this._authUseCases = new AuthUseCases(
        this.authRepository,
        this.storageRepository
      );
    }
    return this._authUseCases;
  }

  get bankUseCases(): BankUseCases {
    if (!this._bankUseCases) {
      this._bankUseCases = new BankUseCases(
        this.bankRepository,
        this.goCardlessRepository
      );
    }
    return this._bankUseCases;
  }

  get transactionUseCases(): TransactionUseCases {
    if (!this._transactionUseCases) {
      this._transactionUseCases = new TransactionUseCases(
        this.transactionRepository
      );
    }
    return this._transactionUseCases;
  }

  /**
   * Reset all instances (useful for testing)
   */
  reset(): void {
    this._storageRepository = undefined;
    this._authRepository = undefined;
    this._bankRepository = undefined;
    this._transactionRepository = undefined;
    this._goCardlessRepository = undefined;
    this._authUseCases = undefined;
    this._bankUseCases = undefined;
    this._transactionUseCases = undefined;
  }
}

// Export singleton instance
export const diContainer = DIContainer.getInstance();
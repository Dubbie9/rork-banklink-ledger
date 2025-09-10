// Re-export core entities for easier imports
export * from '../core/entities/user.entity';
export * from '../core/entities/bank.entity';
export * from '../core/entities/transaction.entity';

// Re-export use cases
export * from '../core/use-cases/auth.use-cases';
export * from '../core/use-cases/bank.use-cases';
export * from '../core/use-cases/transaction.use-cases';

// Re-export repositories (interfaces only)
export type { AuthRepository } from '../core/repositories/auth.repository';
export type { BankRepository } from '../core/repositories/bank.repository';
export type { TransactionRepository } from '../core/repositories/transaction.repository';
export type { StorageRepository } from '../core/repositories/storage.repository';
export type { GoCardlessRepository } from '../core/repositories/gocardless.repository';

// Re-export DI container
export { diContainer, DIContainer } from './config/di-container';
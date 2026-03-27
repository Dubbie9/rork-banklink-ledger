/**
 * Generate UUID v4
 * Simple implementation for generating unique identifiers
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Generate short ID (8 characters)
 */
export function generateShortId(): string {
  return Math.random().toString(36).substr(2, 8);
}

/**
 * Generate transaction ID
 */
export function generateTransactionId(): string {
  return `txn_${Date.now()}_${generateShortId()}`;
}

/**
 * Generate counterparty ID from name
 */
export function generateCounterpartyId(name: string): string {
  // Simple hash function for consistent counterparty IDs
  let hash = 0;
  const normalizedName = name.toLowerCase().trim();
  for (let i = 0; i < normalizedName.length; i++) {
    const char = normalizedName.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return `cp_${Math.abs(hash).toString(36)}`;
}

/**
 * Generate bank connection ID
 */
export function generateConnectionId(): string {
  return `conn_${Date.now()}_${generateShortId()}`;
}

/**
 * Generate requisition reference
 */
export function generateRequisitionReference(): string {
  return `req_${Date.now()}_${generateShortId()}`;
}

// Export v4 as default for compatibility
export const v4 = generateUUID;
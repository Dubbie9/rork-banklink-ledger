# GoCardless Bank Account Data API Setup

This guide will help you integrate GoCardless Bank Account Data API into your BankLink Ledger app.

## 🔧 Setup Instructions

### 1. Get GoCardless API Credentials

1. Go to [GoCardless Open Banking](https://gocardless.com/open-banking/)
2. Sign up for an account or log in
3. Navigate to your dashboard
4. Create a new application
5. Copy your `SECRET_ID` and `SECRET_KEY`

### 2. Configure Environment Variables

1. Copy `.env.example` to `.env`
2. Replace the placeholder values with your actual credentials:

```bash
GOCARDLESS_SECRET_ID=your_actual_secret_id
GOCARDLESS_SECRET_KEY=your_actual_secret_key
```

### 3. Test the Integration

1. Start your development server
2. Navigate to the Banks screen in your app
3. Try connecting to a supported UK bank
4. The app will redirect you to the bank's authentication page
5. Complete the authentication process
6. You should see real transaction data in your app

## 🏗️ Architecture Overview

### Backend Routes (tRPC)

- `gocardless.auth.getAccessToken` - Get access token from GoCardless
- `gocardless.auth.refreshToken` - Refresh expired access token
- `gocardless.institutions.list` - Get list of supported UK banks
- `gocardless.requisitions.create` - Create bank connection request
- `gocardless.requisitions.get` - Check connection status
- `gocardless.accounts.transactions` - Fetch real transaction data

### Frontend Hooks

- `useGoCardless()` - Manages GoCardless authentication tokens
- `useRealBanks()` - Fetches list of supported banks
- `useBankConnection()` - Handles bank connection flow
- `useRealTransactions()` - Fetches real transaction data

## 🔄 Data Flow

1. **Authentication**: App gets access token from GoCardless
2. **Bank Selection**: User sees list of real UK banks with logos
3. **Connection**: User selects bank → App creates requisition → User redirected to bank
4. **Authorization**: User authenticates with their bank
5. **Data Sync**: App fetches account details and transactions
6. **Display**: Real transaction data shown in existing UI

## 🛡️ Security Features

- Access tokens are automatically refreshed when expired
- Bank credentials are never stored in your app
- All communication uses HTTPS and OAuth 2.0
- Tokens are stored securely using AsyncStorage with encryption

## 🧪 Testing

### Sandbox Mode
GoCardless provides sandbox credentials for testing. Use these for development:

1. Use sandbox credentials in your `.env` file
2. Test with sandbox bank accounts
3. Verify transaction data flows correctly

### Production Mode
When ready for production:

1. Switch to live credentials
2. Test with real bank accounts (your own)
3. Verify all error handling works correctly

## 📱 Deep Linking Setup

The app uses deep linking to handle OAuth redirects. Make sure your app can handle:

```
banklink://bank-connected
```

This is configured in your `app.json` under the `expo.scheme` property.

## 🚨 Error Handling

The integration includes comprehensive error handling for:

- Network failures
- Invalid credentials
- Bank authentication failures
- Token expiration
- Rate limiting

## 📊 Data Transformation

GoCardless transaction data is automatically transformed to match your existing `Transaction` interface:

```typescript
// GoCardless format → Your app format
{
  transactionId: "tx_123",
  transactionAmount: { amount: "-50.00", currency: "GBP" },
  bookingDate: "2025-07-12",
  creditorName: "John Doe",
  // ... other fields
}
```

Becomes:

```typescript
{
  id: "tx_123",
  amount: 50.00,
  date: "2025-07-12",
  type: "outgoing",
  counterpartyName: "John Doe",
  // ... other fields
}
```

## 🔍 Debugging

Enable debug logging by setting:

```bash
DEBUG=gocardless:*
```

This will show detailed logs for all GoCardless API calls.

## 📚 Additional Resources

- [GoCardless API Documentation](https://developer.gocardless.com/bank-account-data/overview)
- [Open Banking Standards](https://www.openbanking.org.uk/)
- [PSD2 Compliance Guide](https://www.openbanking.org.uk/about-us/psd2/)

## ⚠️ Important Notes

1. **Rate Limits**: GoCardless has API rate limits. The app handles these automatically.
2. **Data Retention**: Transaction data is stored locally. Consider data retention policies.
3. **Compliance**: Ensure your app complies with GDPR and Open Banking regulations.
4. **Bank Support**: Not all UK banks support all features. Handle gracefully.

## 🆘 Troubleshooting

### Common Issues

1. **"Invalid credentials"**: Check your SECRET_ID and SECRET_KEY
2. **"Bank not supported"**: Verify the bank is in GoCardless's supported list
3. **"Connection timeout"**: Check your internet connection and retry
4. **"Token expired"**: The app should auto-refresh, but you can manually clear tokens

### Getting Help

1. Check GoCardless documentation
2. Review error logs in your app
3. Contact GoCardless support for API-specific issues
4. Check this app's error handling code for debugging
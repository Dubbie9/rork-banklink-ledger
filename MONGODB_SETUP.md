# MongoDB Setup for Multiple Rork Apps

## Overview
This guide shows you how to connect multiple Rork apps to the same MongoDB database.

## Setup Steps

### 1. MongoDB Atlas Setup
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a free cluster
3. Create a database user
4. Whitelist your IP addresses (or use 0.0.0.0/0 for development)
5. Get your connection string

### 2. Environment Variables
Add to your `.env` file:
```
MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/database-name?retryWrites=true&w=majority"
```

### 3. Shared Database Strategy

#### Option A: Same Database, Different Collections
- Use the same `MONGODB_URI` in both apps
- Use different collection prefixes:
  - App 1: `app1_users`, `app1_transactions`
  - App 2: `app2_users`, `app2_orders`

#### Option B: Same Database, Shared Collections
- Use the same `MONGODB_URI` in both apps
- Share collections like `users` between apps
- Add an `appId` field to distinguish data

#### Option C: Separate Databases, Same Cluster
- App 1: `mongodb+srv://...@cluster.mongodb.net/finance-app`
- App 2: `mongodb+srv://...@cluster.mongodb.net/ecommerce-app`

### 4. Backend Deployment Options

#### Option 1: Deploy Each App's Backend Separately
- Deploy this backend to Vercel/Railway
- Point both apps to the same MongoDB
- Each app has its own API endpoints

#### Option 2: Shared Backend Service
- Create a separate backend repository
- Deploy it once
- Both apps connect to the same backend URL

### 5. Code Changes for Multiple Apps

#### For Shared Collections:
```typescript
// Add appId to your models
const UserSchema = new Schema({
  appId: { type: String, required: true }, // 'finance-app' or 'ecommerce-app'
  email: String,
  name: String,
  // ... other fields
});

// Filter by appId in queries
const users = await User.find({ appId: 'finance-app' });
```

#### For Collection Prefixes:
```typescript
// Use dynamic collection names
const getCollectionName = (baseName: string) => {
  const appPrefix = process.env.APP_PREFIX || 'app1';
  return `${appPrefix}_${baseName}`;
};

const User = mongoose.model('User', UserSchema, getCollectionName('users'));
```

### 6. Environment Variables for Each App

#### App 1 (.env):
```
MONGODB_URI="mongodb+srv://...@cluster.mongodb.net/shared-db"
APP_PREFIX="finance"
APP_ID="finance-app"
```

#### App 2 (.env):
```
MONGODB_URI="mongodb+srv://...@cluster.mongodb.net/shared-db"
APP_PREFIX="ecommerce"
APP_ID="ecommerce-app"
```

### 7. Deployment

#### Vercel Deployment:
1. Push your code to GitHub
2. Connect to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

#### Railway Deployment:
1. Connect your GitHub repo
2. Add environment variables
3. Deploy

### 8. Client Configuration

Update your `lib/trpc.ts` to point to the deployed backend:

```typescript
const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://your-backend.vercel.app';
```

## Example Usage

```typescript
// Create user in App 1
const user = await trpc.users.create.mutate({
  email: 'user@example.com',
  name: 'John Doe',
  appId: 'finance-app'
});

// Get user in App 2 (if sharing users)
const user = await trpc.users.get.query({
  email: 'user@example.com'
});
```

## Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **Database Access**: Use proper MongoDB user permissions
3. **API Authentication**: Add auth middleware to protect routes
4. **Data Isolation**: Ensure apps can't access each other's sensitive data

## Troubleshooting

1. **Connection Issues**: Check MongoDB Atlas IP whitelist
2. **Authentication**: Verify username/password in connection string
3. **Network**: Ensure your deployment platform can reach MongoDB Atlas
4. **Environment Variables**: Verify they're set correctly in production

## Next Steps

1. Set up your MongoDB Atlas cluster
2. Update the `MONGODB_URI` in your `.env` file
3. Deploy your backend
4. Update your second app to use the same setup
5. Test the connection between both apps
# 💰 BankLink Ledger

<div align="center">

**A secure, modern mobile-first banking ledger with real-time bank integration**

[![Expo SDK](https://img.shields.io/badge/Expo-53.0.0-blue.svg)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React%20Native-0.79.1-61DAFB.svg)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

---

## 📖 What is BankLink Ledger?

BankLink Ledger is a cross-platform mobile banking ledger application that connects to real bank accounts through Open Banking APIs (GoCardless). It provides users with a unified view of their financial transactions, counterparties, and account balances with enterprise-grade security features including biometric authentication and PIN protection.

Built with **Clean Architecture** principles, the app ensures maintainability, testability, and scalability while delivering a beautiful, native mobile experience.

---

## 👥 Who is it for?

- **Personal Finance Users**: Individuals who want to track multiple bank accounts in one place
- **Small Business Owners**: Entrepreneurs managing business transactions and counterparties
- **Privacy-Conscious Users**: People who want control over their financial data with local-first storage
- **Developers**: Teams looking for a production-ready finance app template with clean architecture
- **FinTech Startups**: Companies building financial management or budgeting tools

---

## 🎯 The Problem

Modern banking is fragmented:
- Users have **multiple bank accounts** across different institutions
- Each bank has its own app with **inconsistent UX**
- **No unified view** of transactions and spending patterns
- **Manual tracking** is time-consuming and error-prone
- **Privacy concerns** with cloud-only financial apps

**BankLink Ledger solves this** by providing:
✅ Single interface for all your banks  
✅ Real-time transaction sync via Open Banking  
✅ Local-first data storage with optional cloud sync  
✅ Biometric security (Face ID / Touch ID)  
✅ Cross-platform (iOS, Android, Web)  

---

## 🏗️ Architecture Overview

BankLink Ledger follows **Clean Architecture** with strict separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Expo Router │  │  React Hooks │  │  Components  │      │
│  │  (app/)      │  │ (hooks/)     │  │ (components/)│      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                     CORE BUSINESS LAYER                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Entities   │  │  Use Cases   │  │ Repositories │      │
│  │  (Domain)    │  │ (Business)   │  │ (Interfaces) │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                   INFRASTRUCTURE LAYER                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  GoCardless  │  │   Firebase   │  │ AsyncStorage │      │
│  │     API      │  │     Auth     │  │   + Secure   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Key Architectural Components

#### 📁 Project Structure
```
banklink-ledger/
├── app/                          # Expo Router file-based routing
│   ├── (auth)/                   # Authentication flow
│   │   ├── index.tsx            # Initial auth screen
│   │   ├── login.tsx            # Email/password login
│   │   ├── signup.tsx           # Sign up with Google OAuth
│   │   ├── complete-profile.tsx # Country & DOB onboarding
│   │   ├── create-pin.tsx       # PIN setup
│   │   └── enter-pin.tsx        # PIN entry
│   ├── (app)/                    # Main app screens
│   │   ├── index.tsx            # Home / Dashboard
│   │   ├── banks.tsx            # Bank accounts list
│   │   ├── people.tsx           # Counterparties
│   │   ├── profile.tsx          # User profile
│   │   └── settings.tsx         # App settings
│   ├── bank-connect/            # Bank connection flow
│   ├── bank/                     # Bank detail screens
│   ├── person/                   # Person detail screens
│   └── _layout.tsx              # Root layout
│
├── src/
│   ├── core/                     # Business logic (framework-independent)
│   │   ├── entities/            # Domain models (User, Bank, Transaction)
│   │   ├── use-cases/           # Business rules & orchestration
│   │   └── repositories/        # Data access interfaces
│   │
│   ├── infrastructure/           # External integrations
│   │   ├── api/                 # GoCardless API client
│   │   ├── auth/                # Firebase authentication
│   │   └── storage/             # AsyncStorage & SecureStore
│   │
│   ├── presentation/             # React-specific UI logic
│   │   └── hooks/               # Clean architecture React hooks
│   │
│   └── shared/                   # Cross-cutting concerns
│       ├── constants/           # App config, colors, themes
│       ├── utils/               # Pure utility functions
│       └── config/              # Dependency injection container
│
├── backend/                      # API layer
│   ├── hono.ts                  # Hono server setup
│   └── trpc/                    # tRPC API routes
│       ├── app-router.ts        # Main API router
│       └── routes/              # API endpoints
│           ├── gocardless/      # Bank data integration
│           └── debug/           # Development utilities
│
├── components/                   # Shared React components
├── hooks/                        # Legacy hooks (migrating to src/)
├── context/                      # React context providers
├── constants/                    # App-wide constants
├── data/                         # Mock data & fixtures
└── utils/                        # Helper utilities
```

### 🔄 Data Flow

```
User Action → Presentation Hook → Use Case → Repository Interface
                                      ↓
                                Infrastructure Implementation
                                      ↓
                     ┌────────────────┼────────────────┐
                     ↓                ↓                ↓
              GoCardless API    Firebase Auth    Local Storage
                     ↓                ↓                ↓
                     └────────────────┴────────────────┘
                                      ↓
                              Update UI State
```

### 🔌 API Integration

- **Backend**: Hono + tRPC for type-safe API routes
- **Authentication**: Firebase Auth with Google OAuth
- **Banking Data**: GoCardless Open Banking API (UK banks)
- **State Management**: React Query + Context API
- **Storage**: AsyncStorage + SecureStore for sensitive data

---

## ✨ Key Features

### 🔐 Security First
- **Biometric Authentication**: Face ID / Touch ID support
- **PIN Protection**: 6-digit PIN for app access
- **Encrypted Storage**: Secure storage for sensitive credentials
- **OAuth 2.0**: Industry-standard authentication flows

### 🏦 Banking Integration
- **Real Bank Connections**: Connect to 100+ UK banks via GoCardless
- **Live Transaction Sync**: Automatic transaction updates
- **Multi-Account Support**: Manage multiple bank accounts
- **Account Balances**: Real-time balance tracking
- **Transaction History**: Up to 90 days of historical data

### 💼 Financial Management
- **Counterparty Tracking**: Automatically detect and track people/businesses
- **Transaction Categorization**: Smart categorization of spending
- **Search & Filter**: Find transactions quickly
- **Transaction Details**: Comprehensive transaction metadata

### 🎨 User Experience
- **Native Mobile Feel**: Platform-specific optimizations
- **Dark Mode**: Beautiful dark theme support
- **Smooth Animations**: Polished micro-interactions
- **Cross-Platform**: iOS, Android, and Web support
- **Responsive Design**: Adapts to all screen sizes

### 🏗️ Developer Experience
- **TypeScript**: 100% type-safe codebase
- **Clean Architecture**: Maintainable, testable code
- **tRPC**: End-to-end type safety for APIs
- **Hot Reload**: Instant development feedback
- **File-Based Routing**: Intuitive navigation structure

---

## 📸 Screenshots

> 🚧 **Coming Soon**: Screenshots of the app in action

*Planned screenshots:*
- Authentication flow (Login, Sign up, PIN setup)
- Dashboard with account overview
- Bank connection flow
- Transaction list and details
- Counterparties screen
- Settings and profile

---

## 🚀 How to Run

### Prerequisites

- **Node.js**: v18 or higher
- **Bun**: Latest version (or npm/yarn)
- **Expo CLI**: Installed globally
- **Mobile Device**: iOS/Android device or emulator
- **GoCardless Account**: For bank integration ([Sign up here](https://gocardless.com/open-banking/))

### Installation Steps

#### 1. Clone the Repository
```bash
git clone <repository-url>
cd banklink-ledger
```

#### 2. Install Dependencies
```bash
bun install
# or
npm install
```

#### 3. Configure Environment Variables
```bash
cp .env.example .env
```

Edit `.env` and add your credentials:
```env
GOCARDLESS_SECRET_ID=your_gocardless_secret_id
GOCARDLESS_SECRET_KEY=your_gocardless_secret_key
```

#### 4. Start the Development Server
```bash
bun start
# or
npm start
```

#### 5. Run on Your Device

**Option A: Scan QR Code**
- Install **Expo Go** app on your phone
- Scan the QR code shown in the terminal

**Option B: Use Simulator/Emulator**
- Press `i` for iOS Simulator (macOS only)
- Press `a` for Android Emulator

**Option C: Run in Browser**
```bash
bun run start-web
# or
npm run start-web
```

### 🧪 Development Commands

```bash
# Start with tunnel for remote testing
bun start

# Start web version
bun run start-web

# Start with debug logging
bun run start-web-dev

# Type checking
tsc --noEmit

# Clear cache
expo start -c
```

---

## 🔧 Configuration

### GoCardless Setup

1. **Create GoCardless Account**
   - Visit [GoCardless Open Banking](https://gocardless.com/open-banking/)
   - Sign up for sandbox or production account

2. **Get API Credentials**
   - Navigate to your dashboard
   - Create a new application
   - Copy `SECRET_ID` and `SECRET_KEY`

3. **Configure App**
   - Add credentials to `.env` file
   - Restart development server

**📚 Detailed Setup**: See [README_GOCARDLESS_SETUP.md](./README_GOCARDLESS_SETUP.md)

### Firebase Setup (Optional)

For authentication, you'll need Firebase:

1. Create a Firebase project
2. Enable Google Sign-In
3. Add iOS/Android apps to Firebase
4. Download config files
5. Configure OAuth credentials

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React Native 0.79.1
- **Navigation**: Expo Router 5.0
- **UI Library**: React Native + Lucide Icons
- **Styling**: StyleSheet API + NativeWind
- **State**: React Query + Context API
- **Type Safety**: TypeScript 5.8

### Backend
- **Server**: Hono 4.8
- **API**: tRPC 11.4
- **Validation**: Zod 4.0
- **Serialization**: SuperJSON 2.2

### Infrastructure
- **Platform**: Expo 53.0
- **Authentication**: Firebase + expo-local-authentication
- **Storage**: AsyncStorage + SecureStore
- **Banking API**: GoCardless Open Banking
- **Deployment**: Vercel (backend) + Expo Go (mobile)

---

## 📦 Key Dependencies

```json
{
  "expo": "^53.0.4",
  "react-native": "0.79.1",
  "@trpc/server": "^11.4.3",
  "@tanstack/react-query": "^5.83.0",
  "hono": "^4.8.5",
  "expo-router": "~5.0.3",
  "expo-secure-store": "~14.2.4",
  "expo-local-authentication": "~16.0.5",
  "@react-native-google-signin/google-signin": "^15.0.0"
}
```

---

## 🏛️ Clean Architecture Benefits

### 1. **Testability**
- Business logic is framework-independent
- Mock repositories for unit tests
- Test use cases without UI

### 2. **Maintainability**
- Clear separation of concerns
- Easy to locate and modify code
- Minimal coupling between layers

### 3. **Scalability**
- Add new features without touching core
- Swap implementations (e.g., change storage provider)
- Multiple developers can work in parallel

### 4. **Type Safety**
- End-to-end TypeScript coverage
- Compile-time error detection
- IDE autocomplete support

---

## 🗺️ Roadmap

### ✅ Completed
- [x] Clean architecture refactor
- [x] GoCardless bank integration
- [x] Firebase authentication
- [x] Google OAuth sign-in
- [x] Biometric authentication
- [x] PIN protection
- [x] Transaction management
- [x] Counterparty tracking
- [x] Multi-account support

### 🚧 In Progress
- [ ] Transaction categorization
- [ ] Budget tracking
- [ ] Spending insights
- [ ] Export transactions (CSV/PDF)

### 🔮 Future Plans
- [ ] Multi-currency support
- [ ] Recurring transactions detection
- [ ] Bill reminders
- [ ] Split expenses
- [ ] Receipt scanning
- [ ] Financial goals
- [ ] Savings calculator
- [ ] Investment tracking

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Guidelines

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Follow the architecture**: Place code in appropriate layers
4. **Write tests**: Ensure new features have test coverage
5. **Commit with clear messages**: Use conventional commits
6. **Push to your fork**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**: Describe your changes clearly

### Code Standards

- **TypeScript**: All code must be type-safe
- **Clean Architecture**: Follow existing patterns
- **SOLID Principles**: Single responsibility, dependency inversion
- **DRY**: Don't repeat yourself
- **Comments**: Document complex business logic
- **Console Logs**: Use for debugging (production apps should minimize logs)

### Areas We Need Help

- 📱 UI/UX improvements
- 🧪 Test coverage
- 📚 Documentation
- 🌍 Internationalization (i18n)
- ♿ Accessibility enhancements
- 🐛 Bug fixes

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🆘 Troubleshooting

### Common Issues

**1. "Module not found" errors**
```bash
# Clear Expo cache
expo start -c

# Reinstall dependencies
rm -rf node_modules
bun install
```

**2. "GoCardless authentication failed"**
- Verify `.env` credentials are correct
- Check you're using sandbox credentials for development
- Ensure your GoCardless account is active

**3. "Biometric authentication not working"**
- iOS: Enable Face ID in simulator (Features → Face ID → Enrolled)
- Android: Configure fingerprint in emulator settings
- Check `NSFaceIDUsageDescription` in app.json

**4. "TypeScript errors"**
```bash
# Run type checking
npx tsc --noEmit

# Check specific file
npx tsc --noEmit src/your-file.ts
```

**5. "Deep linking not working"**
- Verify `scheme` in app.json matches your OAuth redirect
- Test deep link: `npx uri-scheme open myapp://bank-connected --ios`

### Getting Help

- 📖 **Documentation**: Check the [GoCardless setup guide](./README_GOCARDLESS_SETUP.md)
- 🐛 **Bug Reports**: Open an issue with reproduction steps
- 💬 **Questions**: Start a discussion in GitHub Discussions
- 📧 **Contact**: Reach out to the maintainers

---

## 📞 Support & Resources

- **GoCardless Docs**: [https://developer.gocardless.com/bank-account-data/overview](https://developer.gocardless.com/bank-account-data/overview)
- **Expo Docs**: [https://docs.expo.dev](https://docs.expo.dev)
- **tRPC Docs**: [https://trpc.io](https://trpc.io)
- **React Native**: [https://reactnative.dev](https://reactnative.dev)

---

## 🙏 Acknowledgments

- **GoCardless**: For providing Open Banking API access
- **Expo Team**: For the amazing React Native framework
- **tRPC Community**: For type-safe API development
- **Clean Architecture**: Inspired by Robert C. Martin's principles

---

<div align="center">

**Built with ❤️ using React Native & Clean Architecture**

[Report Bug](../../issues) · [Request Feature](../../issues) · [Documentation](./README_GOCARDLESS_SETUP.md)

</div>

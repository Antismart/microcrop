# MicroCrop Insurance Protocol - Frontend Development Prompt

## Project Overview
Build a modern, responsive web application for the MicroCrop Insurance Protocol - a decentralized crop insurance platform built on Flow blockchain. The platform allows farmers to purchase weather-based crop insurance policies, liquidity providers to earn yield by providing capital, and integrates real-time weather data from WeatherXM network.

## Core User Types & Workflows

### 1. Farmers
- **Policy Purchase**: Browse available crop insurance policies, select coverage amount, pay premiums
- **Claims Management**: View policy status, submit claims, track payout history
- **Weather Monitoring**: Real-time weather data for their farm locations
- **Portfolio**: View active policies, coverage details, premium payment history

### 2. Liquidity Providers (LPs)
- **Capital Management**: Deposit/withdraw capital to/from insurance pools
- **Yield Tracking**: Monitor returns from premiums and RWA investments
- **Pool Analytics**: View pool utilization, total value locked, historical performance
- **Risk Management**: Monitor pool health, diversification metrics

### 3. Insurance Pool Administrators
- **Pool Configuration**: Set pool parameters (fees, minimum deposits, RWA allocations)
- **RWA Management**: Invest pool capital in real-world assets (Treasury bonds, etc.)
- **Policy Management**: Approve/reject policies, adjust coverage terms
- **Analytics Dashboard**: Comprehensive pool performance metrics

## Technical Requirements

### Blockchain Integration
- **Flow Blockchain**: Connect to Flow testnet/mainnet using FCL (Flow Client Library)
- **Smart Contracts**: Integrate with deployed MicroCrop contracts
- **Wallet Connection**: Support Flow wallet authentication (Blocto, Lilico, etc.)
- **Transaction Handling**: Sign and submit transactions with proper error handling

### WeatherXM Integration
- **API Integration**: Connect to WeatherXM API for real-time weather data
- **Location Services**: Map farm locations to nearest weather stations
- **Data Visualization**: Display weather trends, alerts, and historical data
- **Automated Triggers**: Monitor weather conditions for automatic claim processing

## UI/UX Design Requirements

### Design System
- **Modern & Clean**: Minimalist design with focus on data visualization
- **Color Palette**: 
  - Primary: Deep green (#2D5016) for agriculture theme
  - Secondary: Sky blue (#4A90E2) for weather/water
  - Accent: Warm orange (#FF8C00) for alerts/actions
  - Neutral: Clean grays and whites
- **Typography**: Professional, readable fonts (Inter, Roboto, or similar)
- **Responsive**: Mobile-first design, works on all devices

### Key Pages & Components

#### 1. Dashboard (Landing Page)
```
Layout: Header with wallet connection, main dashboard with cards
Components:
- Total Value Locked (TVL) counter
- Active Policies counter  
- Pool Utilization chart
- Weather alerts banner
- Quick actions (Buy Policy, Add Liquidity)
```

#### 2. Farmer Dashboard
```
Layout: Sidebar navigation, main content area with tabs
Components:
- Policy Portfolio table (active/expired policies)
- Weather widget for farm locations
- Claims history timeline
- Premium payment schedule
- Coverage calculator
```

#### 3. Liquidity Provider Dashboard
```
Layout: Grid layout with analytics cards
Components:
- Pool balance and yield metrics
- Deposit/Withdraw modal
- Pool performance charts (APY, utilization over time)
- RWA allocation pie chart
- Transaction history table
```

#### 4. Policy Marketplace
```
Layout: Card-based grid of available policies
Components:
- Policy cards with coverage details
- Search/filter by crop type, location, coverage amount
- Policy detail modal with terms and conditions
- Purchase flow with payment integration
```

#### 5. Weather Dashboard
```
Layout: Map-based interface with data overlays
Components:
- Interactive map with weather stations
- Real-time weather data widgets
- Historical weather charts
- Weather alerts and notifications
- Risk assessment indicators
```

#### 6. Admin Panel
```
Layout: Tabbed interface for different admin functions
Components:
- Pool configuration forms
- RWA investment management
- Policy approval queue
- Analytics and reporting tools
- System health monitors
```

## Feature Specifications

### Core Features

#### 1. Wallet Integration
- One-click wallet connection with Flow wallets
- Display wallet balance and transaction history
- Automatic account setup (vault creation)
- Transaction signing with clear fee display

#### 2. Policy Management
- Browse available crop insurance policies
- Filter by crop type, location, coverage amount, premium
- Detailed policy information (terms, conditions, coverage)
- Purchase flow with premium calculation
- Policy status tracking (active, expired, claimed)

#### 3. Weather Integration
- Real-time weather data from WeatherXM
- Historical weather charts and trends
- Weather alerts and notifications
- Integration with policy trigger conditions
- Farm location mapping to weather stations

#### 4. Pool Management
- Capital deposit/withdrawal interface
- Pool statistics and performance metrics
- Yield tracking and earnings history
- RWA investment allocation visualization
- Pool health monitoring

#### 5. Claims Processing
- Automated claim detection based on weather triggers
- Manual claim submission interface
- Claims history and status tracking
- Payout processing and notifications

### Advanced Features

#### 1. Analytics & Reporting
- Real-time pool analytics dashboard
- Historical performance charts
- Risk assessment metrics
- Portfolio diversification analysis
- Yield farming calculators

#### 2. Risk Management
- Pool utilization monitoring
- Diversification metrics
- Risk score calculations
- Alert systems for pool health
- Automated rebalancing suggestions

#### 3. Social Features
- Farmer community forums
- Weather data sharing
- Policy reviews and ratings
- Educational resources
- News and updates feed

## Technical Stack Recommendations

### Frontend Framework
- **React** with TypeScript for type safety
- **Next.js** for SSR, routing, and API routes
- **TailwindCSS** for responsive styling
- **React Query** for data fetching and caching

### State Management
- **Zustand** or **Redux Toolkit** for global state
- **FCL** for Flow blockchain state
- **React Hook Form** for form management

### Data Visualization
- **Recharts** or **Chart.js** for charts and graphs
- **MapBox** or **Leaflet** for interactive maps
- **D3.js** for complex visualizations

### UI Components
- **Headless UI** or **Radix UI** for accessible components
- **Framer Motion** for animations
- **React Hot Toast** for notifications

## WeatherXM Integration Details

### API Integration
```javascript
// Example WeatherXM API integration
const fetchWeatherData = async (deviceId, startDate, endDate) => {
  const response = await fetch(`https://api.weatherxm.com/api/v1/devices/${deviceId}/data`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${WEATHERXM_API_KEY}`,
      'Content-Type': 'application/json'
    },
    params: {
      fromDate: startDate,
      toDate: endDate
    }
  });
  return response.json();
};
```

### Data Processing
- Process weather data to match insurance trigger conditions
- Calculate risk scores based on weather patterns
- Generate weather-based alerts and notifications
- Integrate with smart contract oracle updates

### Real-time Updates
- WebSocket connection for live weather data
- Automatic policy trigger evaluation
- Push notifications for weather alerts
- Real-time dashboard updates

## Smart Contract Integration

### Flow Client Library (FCL) Setup
```javascript
// FCL configuration
import * as fcl from "@onflow/fcl";

fcl.config({
  "app.detail.title": "MicroCrop Insurance",
  "app.detail.icon": "https://microcrop.app/icon.png",
  "accessNode.api": "https://rest-testnet.onflow.org",
  "discovery.wallet": "https://fcl-discovery.onflow.org/testnet/authn"
});
```

### Contract Interactions
- Deploy transaction functions for all contract methods
- Query scripts for reading contract state
- Event listeners for contract events
- Error handling for failed transactions

## Performance & Security

### Performance Optimizations
- Lazy loading for large data sets
- Image optimization and CDN usage
- Code splitting and bundle optimization
- Caching strategies for weather and blockchain data

### Security Measures
- Input validation and sanitization
- Secure API key management
- Rate limiting for external API calls
- XSS and CSRF protection

## Deployment & Infrastructure

### Hosting
- **Vercel** or **Netlify** for frontend hosting
- **GitHub Actions** for CI/CD pipeline
- **Environment variables** for configuration

### Monitoring
- **Sentry** for error tracking
- **Analytics** for user behavior
- **Performance monitoring** for load times

## Success Metrics

### User Engagement
- Number of active farmers and LPs
- Policy purchase conversion rate
- Average session duration
- User retention rates

### Business Metrics
- Total value locked (TVL)
- Total policies issued
- Claims processing efficiency
- Pool utilization rates

## Deliverables

1. **Responsive Web Application** with all specified features
2. **Smart Contract Integration** with Flow blockchain
3. **WeatherXM API Integration** for real-time weather data
4. **Comprehensive Testing Suite** (unit, integration, E2E)
5. **Documentation** (user guides, API docs, deployment guide)
6. **CI/CD Pipeline** for automated deployment

## Timeline Estimate
- **Phase 1** (4 weeks): Core dashboard, wallet integration, basic pool management
- **Phase 2** (4 weeks): Policy marketplace, weather integration, claims processing
- **Phase 3** (3 weeks): Advanced analytics, admin panel, optimization
- **Phase 4** (2 weeks): Testing, documentation, deployment

Build this as a production-ready application with clean, maintainable code and comprehensive testing. Focus on user experience, data visualization, and seamless blockchain integration.

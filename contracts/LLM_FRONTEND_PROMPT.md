# Frontend Development Prompt for MicroCrop Insurance Protocol

## Prompt for LLM

"I need you to build a modern, responsive web application for MicroCrop Insurance Protocol - a decentralized crop insurance platform on Flow blockchain. This is a DeFi application that connects farmers needing crop insurance with liquidity providers earning yield from premiums and RWA investments.

### Key Requirements:

**Tech Stack:**
- React + TypeScript + Next.js
- TailwindCSS for styling
- FCL (Flow Client Library) for blockchain integration
- WeatherXM API for weather data
- Recharts for data visualization
- MapBox for location mapping

**Core Features to Build:**

1. **Multi-User Dashboard System**
   - Farmer dashboard: Policy management, weather monitoring, claims
   - LP dashboard: Capital management, yield tracking, pool analytics
   - Admin panel: Pool configuration, RWA management, policy approval

2. **Smart Contract Integration**
   - Connect to Flow testnet using FCL
   - Wallet authentication (Blocto, Lilico)
   - Transaction signing for deposits, withdrawals, policy purchases
   - Real-time contract state updates

3. **WeatherXM Integration**
   - Fetch real-time weather data from WeatherXM API
   - Display weather widgets and charts
   - Map farm locations to weather stations
   - Monitor weather conditions for automatic claims

4. **Policy Marketplace**
   - Browse available crop insurance policies
   - Filter by crop type, location, coverage amount
   - Policy purchase flow with premium calculation
   - Coverage calculator and risk assessment

5. **Pool Management Interface**
   - Capital deposit/withdrawal forms
   - Pool statistics and performance charts
   - RWA investment allocation visualization
   - Yield tracking and earnings history

**Design Requirements:**
- Modern, clean UI with agriculture theme colors (greens, blues, oranges)
- Responsive design that works on mobile and desktop
- Data-heavy interface with charts, tables, and real-time updates
- Professional look suitable for financial services

**Smart Contract Methods to Integrate:**
- `DepositCapital(amount)` - LP deposits
- `RedeemCapital(amount)` - LP withdrawals
- `RegisterPolicy(id, farmer, location, crop, coverage)` - Policy creation
- `CollectPremium(policyId, amount)` - Premium payments
- `TriggerPayout(farmer, policyId, amount)` - Claims processing
- `GetPoolStats()` - Pool analytics
- `GetOracleStats()` - Weather/policy data

**WeatherXM API Integration:**
- Fetch weather data: `GET /api/v1/devices/{deviceId}/data`
- Process data for insurance triggers (drought, flood, temperature)
- Display real-time weather widgets
- Historical weather charts and trends

**Key Pages:**
1. Landing page with TVL, active policies, weather alerts
2. Farmer dashboard with policy portfolio and weather
3. LP dashboard with pool performance and yield
4. Policy marketplace with search and filters
5. Weather dashboard with map and data
6. Admin panel for system management

**UX Flow:**
- Farmer: Connect wallet → Browse policies → Purchase → Monitor weather → File claims
- LP: Connect wallet → View pools → Deposit capital → Track yields → Withdraw
- Admin: Login → Configure pools → Manage RWA → Approve policies

Please build this as a production-ready application with:
- Clean, maintainable code structure
- Comprehensive error handling
- Loading states and user feedback
- Mobile-responsive design
- Accessibility features
- Type safety with TypeScript

Focus on creating an intuitive, data-rich interface that makes complex DeFi operations accessible to farmers and investors. The app should feel professional, trustworthy, and easy to use while handling real financial transactions."

---

## Additional Context for LLM

**Flow Blockchain Specifics:**
- Use FCL for all blockchain interactions
- Contract addresses: All deployed to 0xf8d6e0586b0a20c7 on testnet
- Handle Flow transaction lifecycle (pending, sealed, error states)
- Implement proper gas fee estimation and display

**WeatherXM API Details:**
- Authentication: Bearer token in headers
- Rate limiting: Respect API limits
- Data format: JSON with temperature, humidity, rainfall, wind speed
- Error handling: Network failures, invalid locations

**Business Logic:**
- Insurance triggers: Drought (low rainfall), flood (high rainfall), temperature extremes
- Pool utilization: percentage of capital deployed in policies
- Yield calculation: premiums + RWA returns - payouts
- Risk assessment: based on historical weather patterns

**Performance Considerations:**
- Lazy load large datasets
- Cache blockchain and weather data
- Optimize charts and maps for mobile
- Use skeleton loading for better UX

Build this with the understanding that it will handle real money and needs to be secure, reliable, and user-friendly for both crypto-native and traditional users.

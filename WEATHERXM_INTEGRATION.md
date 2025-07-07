# WeatherXM Integration with Flow Blockchain

## Overview

This document explains the comprehensive integration between WeatherXM weather data and Flow blockchain smart contracts for the MicroCrop parametric insurance platform.

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   WeatherXM     │    │   React App     │    │ Flow Blockchain │
│   Pro API       │───▶│  (Frontend)     │───▶│   Contracts     │
│                 │    │                 │    │                 │
│ • Weather Data  │    │ • Data Proc.    │    │ • Oracle        │
│ • Station Info  │    │ • Risk Assess.  │    │ • Insurance     │
│ • Real-time     │    │ • UI/UX         │    │ • Triggers      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Integration Components

### 1. WeatherXM Hook (`useWeatherXM.ts`)

**Purpose**: Fetches real-time weather data from WeatherXM API
**Key Features**:
- Real-time weather data fetching
- Weather station discovery
- Alert generation
- Risk assessment
- Mock data fallback for development

**API Endpoints**:
- `https://api.weatherxm.com/api/v1/devices` - Get weather stations
- `https://api.weatherxm.com/api/v1/devices/{id}/data` - Get weather data

**Data Structure**:
```typescript
interface WeatherData {
  locationId: string;
  temperature: number;
  humidity: number;
  rainfall: number;
  windSpeed: number;
  condition: 'sunny' | 'cloudy' | 'rainy';
  alerts: string[];
  timestamp: number;
}
```

### 2. Flow Blockchain Service (`WeatherXMFlowService.ts`)

**Purpose**: Integrates WeatherXM data with Flow blockchain contracts
**Key Features**:
- Weather data validation
- Blockchain transaction management
- Smart contract interaction
- Policy management

**Contract Interactions**:
- `OracleContract`: Weather data updates, trigger checking
- `InsurancePool`: Policy registration, payout management
- `FlowToken`: Premium payments, claim settlements

### 3. Comprehensive Hook (`useWeatherXMFlow.ts`)

**Purpose**: Combines WeatherXM and Flow functionalities
**Key Features**:
- Unified data management
- Auto-sync weather data to blockchain
- Risk assessment and policy recommendations
- Real-time trigger monitoring

### 4. Weather Dashboard (`WeatherDashboard.tsx`)

**Purpose**: User interface for weather monitoring and insurance management
**Key Features**:
- Real-time weather visualization
- Risk assessment display
- Policy management interface
- Alert notifications

## Contract Integration

### Deployed Contracts (Testnet)

- **Oracle Contract**: `0xa9642fdcc3bd17f8`
- **Insurance Pool**: `0xa9642fdcc3bd17f8`
- **XINSURE Token**: `0xa9642fdcc3bd17f8`

### Key Contract Functions

#### Oracle Contract
```cadence
// Update weather data
updateWeatherData(
  locationId: String,
  rainfallMM: UFix64,
  temperatureCelsius: UFix64,
  humidity: UFix64,
  windSpeedKMH: UFix64,
  timestamp: UInt64,
  dataSource: String
)

// Check trigger conditions
checkAndProcessTriggers()

// Get weather data
getWeatherData(locationId: String): [WeatherData]?
```

#### Insurance Pool
```cadence
// Register new policy
registerPolicy(
  locationId: String,
  cropType: String,
  coverageAmount: UFix64,
  premiumPayment: @FlowToken.Vault
)

// Get pool statistics
getPoolStats(): {String: AnyStruct}

// Get user policies
getUserPolicies(userAddress: Address): [PolicyInfo]
```

## API Configuration

### Environment Variables

```bash
# WeatherXM API
VITE_WEATHERXM_API_KEY=your_api_key_here

# Flow Blockchain
VITE_FLOW_ACCESS_NODE=https://rest-testnet.onflow.org
VITE_FLOW_NETWORK=testnet

# Contract Addresses
VITE_ORACLE_CONTRACT_ADDRESS=0xa9642fdcc3bd17f8
VITE_INSURANCE_POOL_ADDRESS=0xa9642fdcc3bd17f8
VITE_XINSURE_CONTRACT_ADDRESS=0xa9642fdcc3bd17f8
```

### WeatherXM API Authentication

The integration uses Bearer token authentication:
```typescript
headers: {
  'Authorization': `Bearer ${WEATHERXM_API_KEY}`,
  'Content-Type': 'application/json'
}
```

## Data Flow

### 1. Weather Data Acquisition
```
WeatherXM API → useWeatherXM → WeatherData[]
```

### 2. Risk Assessment
```
WeatherData → calculateRiskScore → RiskAssessment
```

### 3. Blockchain Integration
```
WeatherData → WeatherXMFlowService → Flow Blockchain
```

### 4. Trigger Processing
```
Blockchain → Oracle Contract → Insurance Pool → Payouts
```

## Error Handling

### API Failures
- Automatic fallback to mock data
- Retry mechanisms with exponential backoff
- User notifications for service issues

### Blockchain Failures
- Transaction retry logic
- Gas limit management
- User-friendly error messages

### Data Validation
- Weather data range validation
- Type checking for blockchain transactions
- Sanitization of user inputs

## Testing

### Integration Test Script
Run `./test_integration.sh` to verify:
- Environment configuration
- WeatherXM API connectivity
- Flow blockchain connection
- Contract deployment status
- Frontend build process

### Manual Testing
1. Start development server: `npm run dev`
2. Navigate to Weather Dashboard
3. Verify weather data display
4. Test blockchain integration
5. Check policy management

## Security Considerations

### API Security
- API key protection in environment variables
- Rate limiting and timeout handling
- Input validation and sanitization

### Blockchain Security
- Transaction signing with user authorization
- Smart contract access control
- Secure data transmission

## Performance Optimization

### Data Caching
- Local storage for weather data
- Reduced API calls with intelligent caching
- Optimized re-rendering with React hooks

### Blockchain Efficiency
- Batch transaction processing
- Gas optimization
- Efficient data structures

## Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Testing
```bash
./test_integration.sh
```

## Monitoring and Logging

### Frontend Logging
- Console logging for development
- Error tracking for production
- Performance metrics

### Blockchain Monitoring
- Transaction status tracking
- Event emission monitoring
- Gas usage analytics

## Future Enhancements

### WeatherXM Integration
- WebSocket for real-time updates
- Historical data analysis
- Advanced weather predictions

### Blockchain Features
- Multi-sig transaction support
- Governance token integration
- Cross-chain compatibility

### User Experience
- Mobile app development
- Push notifications
- Advanced visualization

## Troubleshooting

### Common Issues

1. **WeatherXM API Not Responding**
   - Check API key validity
   - Verify network connectivity
   - Review rate limiting

2. **Flow Blockchain Connection Issues**
   - Verify testnet accessibility
   - Check contract deployment
   - Validate wallet connection

3. **Data Synchronization Problems**
   - Review transaction logs
   - Check gas limits
   - Verify data validation

### Debug Commands

```bash
# Check API connectivity
curl -H "Authorization: Bearer $API_KEY" https://api.weatherxm.com/api/v1/devices

# Verify contract deployment
flow accounts get 0xa9642fdcc3bd17f8 --network testnet

# Test frontend build
npm run build
```

## Support

For technical support:
- Review this documentation
- Check the troubleshooting section
- Review console logs for errors
- Test with the integration script

## License

This integration is part of the MicroCrop platform and follows the project's licensing terms.

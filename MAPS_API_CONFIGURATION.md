# 🗺️ Maps API Configuration Guide

## Overview
Traveal supports both **Google Maps** and **MapMyIndia** APIs for mapping functionality. This guide explains how to configure and use both providers.

## 🔧 Environment Configuration

### Required Environment Variables

Add these variables to your `.env` file in the `backend/` directory:

```env
# ===== GOOGLE MAPS CONFIGURATION =====
# Get these from Google Cloud Console
# https://console.cloud.google.com/apis/credentials
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
GOOGLE_MAPS_PLACES_API_KEY=your_google_places_api_key_here

# ===== MAPMYINDIA CONFIGURATION =====
# Get these from MapMyIndia Developer Console
# https://www.mapmyindia.com/api/
MAPMYINDIA_API_KEY=your_mapmyindia_api_key_here
MAPMYINDIA_CLIENT_ID=your_mapmyindia_client_id_here
MAPMYINDIA_CLIENT_SECRET=your_mapmyindia_client_secret_here

# ===== MAP SERVICE SETTINGS =====
DEFAULT_MAP_PROVIDER=google                 # Options: 'google' or 'mapmyindia'
MAP_GEOCODING_ENABLED=true                  # Enable/disable geocoding features
MAP_ROUTING_ENABLED=true                    # Enable/disable routing features
```

## 🚀 Getting API Keys

### Google Maps API Keys

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create or select a project**
3. **Enable required APIs**:
   - Maps JavaScript API
   - Places API
   - Geocoding API
   - Directions API
   - Static Maps API
4. **Create credentials**:
   - Go to \"Credentials\" → \"Create Credentials\" → \"API Key\"
   - Copy the API key to `GOOGLE_MAPS_API_KEY`
   - You can use the same key for `GOOGLE_MAPS_PLACES_API_KEY` or create separate keys

### MapMyIndia API Keys

1. **Visit MapMyIndia Developer Portal**: https://www.mapmyindia.com/api/
2. **Register or login to your account**
3. **Create a new project**
4. **Get your credentials**:
   - API Key → `MAPMYINDIA_API_KEY`
   - Client ID → `MAPMYINDIA_CLIENT_ID`
   - Client Secret → `MAPMYINDIA_CLIENT_SECRET`

## 📋 API Endpoints

### Provider Management
```bash
# Get current map provider
GET /api/v1/maps/provider

# Set map provider
POST /api/v1/maps/provider
Content-Type: application/json
{
  \"provider\": \"google\"  // or \"mapmyindia\"
}
```

### Geocoding Services
```bash
# Geocode address to coordinates
GET /api/v1/maps/geocode?address=New%20Delhi%2C%20India

# Reverse geocode coordinates to address
GET /api/v1/maps/reverse-geocode?lat=28.6139&lng=77.2090
```

### Places Services
```bash
# Get autocomplete suggestions
GET /api/v1/maps/autocomplete?input=New%20Delhi&sessionToken=abc123

# Get place details
GET /api/v1/maps/place-details?placeId=ChIJLbZ-NFv9DDkRzk0gTkm3wlI
```

### Routing Services
```bash
# Calculate route
POST /api/v1/maps/route
Content-Type: application/json
{
  \"origin\": \"New Delhi, India\",
  \"destination\": { \"latitude\": 28.6139, \"longitude\": 77.2090 },
  \"waypoints\": [\"Connaught Place, New Delhi\"]
}
```

### Static Maps
```bash
# Generate static map URL
POST /api/v1/maps/static-map
Content-Type: application/json
{
  \"center\": { \"latitude\": 28.6139, \"longitude\": 77.2090 },
  \"zoom\": 15,
  \"size\": { \"width\": 600, \"height\": 400 },
  \"markers\": [
    {
      \"location\": { \"latitude\": 28.6139, \"longitude\": 77.2090 },
      \"label\": \"A\",
      \"color\": \"red\"
    }
  ]
}
```

### Configuration & Testing
```bash
# Get map configuration
GET /api/v1/maps/config

# Test map providers
GET /api/v1/maps/test-providers
```

## 🧪 Testing Your Configuration

### 1. Test Provider Connectivity
```bash
curl -H \"Authorization: Bearer YOUR_TOKEN\" \\n     http://localhost:3001/api/v1/maps/test-providers
```

### 2. Test Geocoding
```bash
curl -H \"Authorization: Bearer YOUR_TOKEN\" \\n     \"http://localhost:3001/api/v1/maps/geocode?address=New%20Delhi%2C%20India\"
```

### 3. Switch Providers
```bash
# Switch to Google Maps
curl -X POST \n     -H \"Authorization: Bearer YOUR_TOKEN\" \n     -H \"Content-Type: application/json\" \n     -d '{\"provider\":\"google\"}' \n     http://localhost:3001/api/v1/maps/provider

# Switch to MapMyIndia
curl -X POST \n     -H \"Authorization: Bearer YOUR_TOKEN\" \n     -H \"Content-Type: application/json\" \n     -d '{\"provider\":\"mapmyindia\"}' \n     http://localhost:3001/api/v1/maps/provider
```

## 🔄 Frontend Integration Examples

### React Component Example
```jsx
// components/maps/MapComponent.jsx
import { useState, useEffect } from 'react';
import { mapsAPI } from '../../services/api';

function MapComponent() {
  const [currentProvider, setCurrentProvider] = useState('google');
  const [searchResults, setSearchResults] = useState([]);
  
  // Get autocomplete suggestions
  const handleSearch = async (input) => {
    try {
      const response = await mapsAPI.getAutocompleteSuggestions(input);
      setSearchResults(response.data.suggestions);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };
  
  // Switch map provider
  const switchProvider = async (provider) => {
    try {
      await mapsAPI.setProvider(provider);
      setCurrentProvider(provider);
    } catch (error) {
      console.error('Provider switch failed:', error);
    }
  };
  
  return (
    <div className=\"map-component\">
      <div className=\"provider-selector\">
        <button 
          onClick={() => switchProvider('google')}
          className={currentProvider === 'google' ? 'active' : ''}
        >
          Google Maps
        </button>
        <button 
          onClick={() => switchProvider('mapmyindia')}
          className={currentProvider === 'mapmyindia' ? 'active' : ''}
        >
          MapMyIndia
        </button>
      </div>
      
      <input 
        type=\"text\"
        onChange={(e) => handleSearch(e.target.value)}
        placeholder=\"Search for places...\"
      />
      
      <div className=\"search-results\">
        {searchResults.map((result) => (
          <div key={result.placeId} className=\"search-result\">
            <strong>{result.mainText}</strong>
            <span>{result.secondaryText}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MapComponent;
```

### API Service Example
```javascript
// services/mapsAPI.js
class MapsAPI {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }
  
  async setProvider(provider) {
    const response = await fetch(`${this.baseURL}/maps/provider`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({ provider })
    });
    return response.json();
  }
  
  async geocodeAddress(address) {
    const response = await fetch(
      `${this.baseURL}/maps/geocode?address=${encodeURIComponent(address)}`,
      {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      }
    );
    return response.json();
  }
  
  async getAutocompleteSuggestions(input, sessionToken) {
    const params = new URLSearchParams({ input });
    if (sessionToken) params.append('sessionToken', sessionToken);
    
    const response = await fetch(
      `${this.baseURL}/maps/autocomplete?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      }
    );
    return response.json();
  }
  
  async calculateRoute(origin, destination, waypoints) {
    const response = await fetch(`${this.baseURL}/maps/route`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({ origin, destination, waypoints })
    });
    return response.json();
  }
}

export const mapsAPI = new MapsAPI('/api/v1');
```

## 🎯 Use Cases

### 1. Trip Planning
- Geocode user-entered addresses
- Calculate routes between multiple destinations
- Get estimated travel time and distance

### 2. Emergency Services (SOS)
- Reverse geocode GPS coordinates to readable addresses
- Generate location links for emergency contacts
- Create static maps for emergency response

### 3. Location Search
- Autocomplete search for places
- Get detailed place information
- Find nearby points of interest

### 4. Data Visualization
- Generate static maps for trip reports
- Create location-based analytics visualizations
- Show user travel patterns

## 🔒 Security Considerations

### API Key Security
- **Never expose API keys in frontend code**
- Use environment variables for all API keys
- Implement proper access controls and rate limiting
- Regularly rotate API keys

### Rate Limiting
- Both providers have usage limits
- Implement caching for frequently requested data
- Monitor API usage to avoid overage charges

### Data Privacy
- Follow local data protection laws
- Anonymize location data when possible
- Implement user consent for location services

## 🛠️ Troubleshooting

### Common Issues

1. **\"API key not configured\" errors**
   - Check environment variables are set correctly
   - Verify API keys are valid and not expired
   - Ensure required APIs are enabled in provider console

2. **\"Geocoding failed\" errors**
   - Check internet connectivity
   - Verify provider service status
   - Ensure geocoding is enabled (`MAP_GEOCODING_ENABLED=true`)

3. **\"Provider not available\" errors**
   - Test provider connectivity using `/maps/test-providers`
   - Check API key permissions and quotas
   - Verify provider-specific configuration

### Debug Commands
```bash
# Check current configuration
curl -H \"Authorization: Bearer YOUR_TOKEN\" \\n     http://localhost:3001/api/v1/maps/config

# Test specific provider
curl -X POST \n     -H \"Authorization: Bearer YOUR_TOKEN\" \n     -H \"Content-Type: application/json\" \n     -d '{\"provider\":\"google\"}' \n     http://localhost:3001/api/v1/maps/provider

# Test geocoding with specific provider
curl -H \"Authorization: Bearer YOUR_TOKEN\" \\n     \"http://localhost:3001/api/v1/maps/geocode?address=Test%20Location\"
```

## 💰 Cost Optimization

### Google Maps
- Use session tokens for Places Autocomplete
- Cache geocoding results
- Optimize static map requests
- Monitor usage in Google Cloud Console

### MapMyIndia
- Implement request caching
- Use appropriate API endpoints for your use case
- Monitor usage in MapMyIndia dashboard

## 📚 Additional Resources

- [Google Maps Platform Documentation](https://developers.google.com/maps/documentation)
- [MapMyIndia API Documentation](https://www.mapmyindia.com/api/)
- [Maps Service Implementation](backend/src/services/mapsService.ts)
- [Maps Controller](backend/src/controllers/mapsController.ts)
- [Maps Routes](backend/src/routes/maps.ts)

---

**✨ Your maps functionality is now ready for both Google Maps and MapMyIndia!**

Choose the provider that best fits your needs:
- **Google Maps**: Global coverage, extensive features
- **MapMyIndia**: Optimized for India, local language support

Both providers can be switched dynamically based on user location or preferences.
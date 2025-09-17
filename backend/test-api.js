// Manual Backend API Test Script
import axios from 'axios';

// Test data
const validConsentData = {
  locationData: {
    allowTracking: true,
    preciseLocation: true
  },
  sensorData: {
    motionSensors: true,
    activityDetection: true
  },
  usageAnalytics: {
    anonymousStats: true,
    crashReports: true
  }
};

const testDeviceId = 'test-device-' + Date.now();

async function testBackendAPI() {
  console.log('🧪 Starting Backend API Tests...');
  
  try {
    // Test 1: Health Check
    console.log('\n1. Testing Health Check...');
    const healthResponse = await axios.get('http://localhost:3010/health');
    console.log('✅ Health Check:', healthResponse.data);
    
    // Test 2: API Status
    console.log('\n2. Testing API Status...');
    const statusResponse = await axios.get('http://localhost:3010/status');
    console.log('✅ API Status:', statusResponse.data);
    
    // Test 3: User Registration
    console.log('\n3. Testing User Registration...');
    const registerResponse = await axios.post('http://localhost:3010/api/v1/auth/register', {
      consentData: validConsentData
    }, {
      headers: {
        'X-Device-ID': testDeviceId,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ User Registration:', registerResponse.data);
    
    // Test 4: User Login
    console.log('\n4. Testing User Login...');
    const loginResponse = await axios.post('http://localhost:3010/api/v1/auth/login', {}, {
      headers: {
        'X-Device-ID': testDeviceId
      }
    });
    console.log('✅ User Login:', loginResponse.data);
    
    // Test 5: Get User Profile (with auth token)
    console.log('\n5. Testing Get User Profile...');
    const token = loginResponse.data.data.tokens.accessToken;
    const profileResponse = await axios.get('http://localhost:3010/api/v1/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ User Profile:', profileResponse.data);
    
    console.log('\n🎉 All Backend API Tests Passed!');
    
  } catch (error) {
    console.error('❌ Backend API Test Failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Test invalid scenarios
async function testErrorHandling() {
  console.log('\n🧪 Testing Error Handling...');
  
  try {
    // Test invalid device ID
    console.log('\n1. Testing Registration without Device ID...');
    await axios.post('http://localhost:3010/api/v1/auth/register', {
      consentData: validConsentData
    });
  } catch (error) {
    console.log('✅ Correctly rejected registration without Device ID:', error.response?.status);
  }
  
  try {
    // Test invalid consent data
    console.log('\n2. Testing Registration with invalid consent data...');
    await axios.post('http://localhost:3010/api/v1/auth/register', {
      consentData: { invalid: true }
    }, {
      headers: { 'X-Device-ID': 'test-invalid-' + Date.now() }
    });
  } catch (error) {
    console.log('✅ Correctly rejected invalid consent data:', error.response?.status);
  }
  
  try {
    // Test login with unregistered device
    console.log('\n3. Testing Login with unregistered device...');
    await axios.post('http://localhost:3010/api/v1/auth/login', {}, {
      headers: { 'X-Device-ID': 'unregistered-device' }
    });
  } catch (error) {
    console.log('✅ Correctly rejected unregistered device:', error.response?.status);
  }
}

// Run tests
testBackendAPI().then(() => {
  return testErrorHandling();
}).then(() => {
  console.log('\n✨ Backend API Testing Complete!');
  process.exit(0);
}).catch((error) => {
  console.error('\n💥 Testing failed:', error.message);
  process.exit(1);
});

export { testBackendAPI, testErrorHandling };
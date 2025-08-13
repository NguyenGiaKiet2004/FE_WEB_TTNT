const fetch = require('node-fetch');

async function testLogin() {
  try {
    console.log('🧪 Testing login API...');
    
    const loginData = {
      email: 'admin@company.com',
      password: 'admin123'
    };
    
    console.log('📤 Sending login request with:', loginData);
    
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
    });
    
    const data = await response.json();
    
    console.log('📥 Response status:', response.status);
    console.log('📥 Response data:', data);
    
    if (response.ok) {
      console.log('✅ Login successful!');
    } else {
      console.log('❌ Login failed!');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testLogin();

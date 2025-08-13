const fetch = require('node-fetch');

async function testSettingsAPI() {
  console.log('🧪 Testing Settings API...');
  
  try {
    // Test 1: Get current settings
    console.log('\n1️⃣ Testing GET /api/system/configs');
    const getResponse = await fetch('http://localhost:3001/api/system/configs', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (getResponse.ok) {
      const settings = await getResponse.json();
      console.log('✅ GET settings successful');
      console.log('Current work_start_time:', settings.work_start_time?.value);
      console.log('Current work_end_time:', settings.work_end_time?.value);
    } else {
      console.log('❌ GET settings failed:', getResponse.status);
    }
    
    // Test 2: Update a setting
    console.log('\n2️⃣ Testing PUT /api/system/configs/work_start_time');
    const updateResponse = await fetch('http://localhost:3001/api/system/configs/work_start_time', {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        value: '08:30:00',
        description: 'Test update'
      })
    });
    
    if (updateResponse.ok) {
      const result = await updateResponse.json();
      console.log('✅ UPDATE setting successful:', result.message);
    } else {
      console.log('❌ UPDATE setting failed:', updateResponse.status);
      const error = await updateResponse.text();
      console.log('Error details:', error);
    }
    
    // Test 3: Get settings again to verify
    console.log('\n3️⃣ Testing GET /api/system/configs again');
    const getResponse2 = await fetch('http://localhost:3001/api/system/configs', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (getResponse2.ok) {
      const settings2 = await getResponse2.json();
      console.log('✅ GET settings successful after update');
      console.log('Updated work_start_time:', settings2.work_start_time?.value);
    } else {
      console.log('❌ GET settings failed after update:', getResponse2.status);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSettingsAPI();

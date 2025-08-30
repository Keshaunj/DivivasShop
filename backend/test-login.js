const fetch = require('node-fetch');

async function testLogin() {
  try {
    console.log('Testing login with fixed user...');
    
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'keshaunjones48@gmail.com',
        password: 'testpassword123'
      })
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers.raw());
    
    if (response.ok) {
      const data = await response.json();
      console.log('Login successful!');
      console.log('Response data:', JSON.stringify(data, null, 2));
    } else {
      const errorData = await response.text();
      console.log('Login failed!');
      console.log('Error response:', errorData);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testLogin();

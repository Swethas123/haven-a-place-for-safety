// Test script for admin alert system
// Run this after starting server.js

const testAlerts = [
  {
    severity: 'High',
    emotion: 'Physical and Emotional Abuse',
    location: { lat: 28.6139, lng: 77.2090 },
    address: 'New Delhi, India',
    alert: '🚨 URGENT: High severity SOS detected - Immediate intervention required',
    response: 'CRITICAL'
  },
  {
    severity: 'Medium',
    emotion: 'Domestic Violence',
    location: { lat: 19.0760, lng: 72.8777 },
    address: 'Mumbai, Maharashtra',
    alert: '⚠️ ALERT: Medium severity case - Regular monitoring needed',
    response: 'ATTENTION'
  },
  {
    severity: 'Low',
    emotion: 'Emotional Manipulation',
    location: { lat: 12.9716, lng: 77.5946 },
    address: 'Bangalore, Karnataka',
    alert: 'ℹ️ INFO: Low severity - Supportive assistance recommended',
    response: 'SUPPORT'
  }
];

async function sendTestAlert(alert, delay = 0) {
  return new Promise((resolve) => {
    setTimeout(async () => {
      try {
        const response = await fetch('http://localhost:3001/admin-alert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(alert)
        });
        
        const result = await response.json();
        console.log(`✅ Alert sent successfully:`, result);
        resolve(result);
      } catch (error) {
        console.error(`❌ Error sending alert:`, error.message);
        resolve(null);
      }
    }, delay);
  });
}

async function runTests() {
  console.log('🧪 Starting Admin Alert System Tests...\n');
  console.log('Make sure server.js is running on port 3001!\n');
  
  // Test 1: Send High severity alert
  console.log('Test 1: Sending HIGH severity alert...');
  await sendTestAlert(testAlerts[0]);
  
  // Test 2: Send Medium severity alert (2 seconds later)
  console.log('\nTest 2: Sending MEDIUM severity alert...');
  await sendTestAlert(testAlerts[1], 2000);
  
  // Test 3: Send Low severity alert (2 seconds later)
  console.log('\nTest 3: Sending LOW severity alert...');
  await sendTestAlert(testAlerts[2], 4000);
  
  console.log('\n✨ All tests completed!');
  console.log('Check your Admin Dashboard to see the alerts appear in real-time.');
}

// Run tests
runTests();

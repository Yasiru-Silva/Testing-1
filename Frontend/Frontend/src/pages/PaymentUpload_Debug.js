// DEBUG VERSION - Check this in browser console
import { paymentsAPI } from '../services/api';

// Add this function temporarily to test
export const testPaymentUpload = async (applicationId) => {
  const token = localStorage.getItem('token');
  console.log('=== PAYMENT UPLOAD DEBUG ===');
  console.log('1. Token exists:', !!token);
  console.log('2. Token value:', token ? token.substring(0, 50) + '...' : 'NO TOKEN');
  console.log('3. User data:', localStorage.getItem('user'));
  
  const paymentPayload = {
    amount: 100.00,
    paymentMethod: "Bank Transfer",
    transactionReference: "TEST123",
    notes: "Test payment",
    application: { applicationId: parseInt(applicationId) }
  };

  const formData = new FormData();
  formData.append('payment', JSON.stringify(paymentPayload));
  
  // Create a dummy file for testing
  const blob = new Blob(['test'], { type: 'image/jpeg' });
  formData.append('slipFile', blob, 'test.jpg');

  console.log('4. FormData created');
  console.log('5. Payment data:', paymentPayload);
  
  try {
    const response = await paymentsAPI.create(formData);
    console.log('6. SUCCESS:', response);
    return response;
  } catch (error) {
    console.error('6. ERROR:', error.response || error);
    console.error('Error status:', error.response?.status);
    console.error('Error data:', error.response?.data);
    console.error('Error headers:', error.response?.headers);
    throw error;
  }
};

// To use: Open browser console and run:
// import('./pages/PaymentUpload_Debug.js').then(m => m.testPaymentUpload(YOUR_APP_ID));



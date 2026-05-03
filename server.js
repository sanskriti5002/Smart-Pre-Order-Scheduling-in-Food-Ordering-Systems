require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '.')));

// Initialize Razorpay
const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

if (!razorpayKeyId || !razorpayKeySecret) {
  console.error('Missing Razorpay test keys. Copy backend/.env.example to backend/.env and set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.');
  process.exit(1);
}

const razorpay = new Razorpay({
  key_id: razorpayKeyId,
  key_secret: razorpayKeySecret,
});

// Endpoint to create a Razorpay order
app.post('/api/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt = 'receipt#1' } = req.body;

    const options = {
      amount: Math.round(amount * 100), // amount in the smallest currency unit (paise)
      currency,
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    if (!order) {
      return res.status(500).send('Error creating Razorpay order');
    }

    // Pass the public key_id to the frontend so it doesn't need to be hardcoded
    res.json({ ...order, key_id: razorpay.key_id });
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Endpoint to verify payment
app.post('/api/verify-payment', (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ status: 'failure', message: 'Missing required fields' });
  }

  // To verify signature, we use the secret key
  const secret = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_mock_secret';

  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body.toString())
    .digest('hex');

  const isAuthentic = expectedSignature === razorpay_signature;

  if (isAuthentic) {
    // Payment verified successfully
    // In a real application, you would save the order details to a database here
    res.json({ status: 'success', message: 'Payment verified successfully' });
  } else {
    // Verification failed
    res.status(400).json({ status: 'failure', message: 'Invalid payment signature' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});
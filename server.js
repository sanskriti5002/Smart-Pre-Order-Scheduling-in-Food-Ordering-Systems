require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const mongoose = require('mongoose');
const Order = require('./models/Order');

const app = express();

app.use(cors());
app.use(express.json());

// Connect to MongoDB
const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/crave';
mongoose.connect(mongoURI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock_key',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_mock_secret',
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

    // Save order to the database
    const newOrder = new Order({
      amount: order.amount / 100, // storing original amount (not in paise)
      currency: order.currency,
      receipt: order.receipt,
      razorpay_order_id: order.id,
      status: 'created'
    });
    await newOrder.save();

    // Pass the public key_id to the frontend so it doesn't need to be hardcoded
    res.json({ ...order, key_id: razorpay.key_id });
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Endpoint to verify payment
app.post('/api/verify-payment', async (req, res) => {
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
    try {
      // Payment verified successfully
      // Update order in database
      await Order.findOneAndUpdate(
        { razorpay_order_id: razorpay_order_id },
        { razorpay_payment_id: razorpay_payment_id, status: 'paid' },
        { new: true }
      );
      res.json({ status: 'success', message: 'Payment verified successfully' });
    } catch (err) {
      console.error('Error updating order:', err);
      res.status(500).json({ status: 'error', message: 'Database update failed' });
    }
  } else {
    // Verification failed
    res.status(400).json({ status: 'failure', message: 'Invalid payment signature' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});

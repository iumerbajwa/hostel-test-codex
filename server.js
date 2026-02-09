require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { connectDatabase } = require('./config/db');

const authRoutes = require('./routes/auth');
const hostelRoutes = require('./routes/hostels');
const residentRoutes = require('./routes/residents');
const invoiceRoutes = require('./routes/invoices');

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:8000',
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/hostels', hostelRoutes);
app.use('/api/v1/residents', residentRoutes);
app.use('/api/v1/invoices', invoiceRoutes);

app.use((err, req, res, next) => {
  console.error('Unhandled error', err);
  res.status(500).json({ message: 'Internal server error' });
});

const port = process.env.PORT || 4000;

connectDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`HFMS API running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Failed to connect database', error);
    process.exit(1);
  });

const express = require('express');
const Hostel = require('../models/Hostel');

const router = express.Router();

const fallbackHostels = [
  {
    name: 'Greenview Hostel',
    city: 'Islamabad',
    address: 'G-11, Islamabad',
    university: 'NUST',
    distance: 0.8,
    price: 5000,
    gender: 'male',
    verified: true,
    image:
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80',
    description: 'Smart rooms with biometric entry and shared work pods.',
  },
  {
    name: 'Sunrise PG',
    city: 'Islamabad',
    address: 'E-11, Islamabad',
    university: 'FAST',
    distance: 1.2,
    price: 6500,
    gender: 'any',
    verified: true,
    image:
      'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=800&q=80',
    description: 'Calm, minimalist rooms with 24/7 security and meals.',
  },
  {
    name: 'City Stay Hostel',
    city: 'Islamabad',
    address: 'F-10, Islamabad',
    university: 'COMSATS',
    distance: 2.1,
    price: 4800,
    gender: 'female',
    verified: false,
    image:
      'https://images.unsplash.com/photo-1502005097973-6a7082348e28?auto=format&fit=crop&w=800&q=80',
    description: 'High-speed WiFi, study lounges, and flexible contracts.',
  },
];

router.get('/', async (req, res) => {
  const { university, distance } = req.query;
  const filters = {};

  if (university) {
    filters.university = new RegExp(university, 'i');
  }

  if (distance) {
    filters.distance = { $lte: Number(distance) || 0 };
  }

  const hostels = await Hostel.find(filters).limit(30).lean();
  if (!hostels.length) {
    return res.json(fallbackHostels);
  }

  return res.json(hostels);
});

module.exports = router;

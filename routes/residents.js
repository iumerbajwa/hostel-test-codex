const express = require('express');
const Resident = require('../models/Resident');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.post('/manual', requireAuth, requireRole('owner', 'admin'), async (req, res) => {
  const { fullName, contact, program, room, moveIn } = req.body;
  if (!fullName) {
    return res.status(400).json({ message: 'Full name is required' });
  }

  const resident = await Resident.create({
    fullName,
    contact,
    program,
    room,
    moveIn: moveIn ? new Date(moveIn) : undefined,
    createdBy: req.user.id,
  });

  return res.status(201).json({ resident });
});

module.exports = router;

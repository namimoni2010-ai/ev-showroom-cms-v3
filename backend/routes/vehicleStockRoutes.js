const express = require('express');
const router = express.Router();
const Vehicle = require('../models/VehicleStock');
const { protect } = require('../middleware/authMiddleware');

// Add vehicle
router.post('/', protect, async (req, res) => {
  try {
    const {
      vehicleModel, chassisNo, motorNo, controllerNo,
      chargerNo, batteryNo, vehicleColor, purchaseDate,
      price, stockStatus
    } = req.body;

    if (!vehicleModel) return res.status(400).json({ message: 'Vehicle model is required.' });
    if (!chassisNo) return res.status(400).json({ message: 'Chassis number is required.' });

    const v = await Vehicle.create({
      vehicleModel, chassisNo, motorNo, controllerNo,
      chargerNo, batteryNo, vehicleColor, purchaseDate,
      price: price || 0,
      stockStatus: stockStatus || 'Available'
    });

    res.status(201).json(v);
  } catch (err) {
    if (err.code === 11000)
      return res.status(400).json({ message: 'Chassis number already exists. Please use a unique chassis number.' });
    res.status(500).json({ message: err.message });
  }
});

// Get all vehicles with optional filter
router.get('/', protect, async (req, res) => {
  try {
    const filter = {};
    if (req.query.status && req.query.status !== 'All') {
      filter.stockStatus = req.query.status;
    }
    const vehicles = await Vehicle.find(filter).sort({ createdAt: -1 });
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Search vehicles
router.get('/search', protect, async (req, res) => {
  const { q } = req.query;
  try {
    const vehicles = await Vehicle.find({
      $or: [
        { chassisNo: { $regex: q, $options: 'i' } },
        { vehicleModel: { $regex: q, $options: 'i' } },
        { motorNo: { $regex: q, $options: 'i' } },
        { batteryNo: { $regex: q, $options: 'i' } }
      ]
    }).limit(10);
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get by chassis number (auto-fill)
router.get('/chassis/:chassisNo', protect, async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({
      chassisNo: { $regex: new RegExp(`^${req.params.chassisNo}$`, 'i') }
    });
    if (!vehicle)
      return res.status(404).json({ message: 'Vehicle not found for this chassis number.' });
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update vehicle
router.put('/:id', protect, async (req, res) => {
  try {
    const {
      vehicleModel, chassisNo, motorNo, controllerNo,
      chargerNo, batteryNo, vehicleColor, purchaseDate,
      price, stockStatus
    } = req.body;

    const v = await Vehicle.findByIdAndUpdate(
      req.params.id,
      {
        vehicleModel, chassisNo, motorNo, controllerNo,
        chargerNo, batteryNo, vehicleColor, purchaseDate,
        price: price || 0,
        stockStatus: stockStatus || 'Available'
      },
      { new: true, runValidators: true }
    );
    if (!v) return res.status(404).json({ message: 'Vehicle not found' });
    res.json(v);
  } catch (err) {
    if (err.code === 11000)
      return res.status(400).json({ message: 'Chassis number already exists.' });
    res.status(500).json({ message: err.message });
  }
});

// Mark vehicle as sold
router.put('/:id/sell', protect, async (req, res) => {
  try {
    const v = await Vehicle.findByIdAndUpdate(
      req.params.id,
      { stockStatus: 'Sold' },
      { new: true }
    );
    res.json(v);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete vehicle
router.delete('/:id', protect, async (req, res) => {
  try {
    await Vehicle.findByIdAndDelete(req.params.id);
    res.json({ message: 'Vehicle deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
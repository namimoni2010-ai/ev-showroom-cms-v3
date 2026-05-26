const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');
const { protect } = require('../middleware/authMiddleware');

// Get next invoice number
router.get('/next-number/:type', protect, async (req, res) => {
  try {
    const prefix = req.params.type === 'Sales Bill' ? 'SB' : 'SV';
    const last = await Invoice.findOne(
      { invoiceNo: { $regex: `^${prefix}-` } },
      {},
      { sort: { createdAt: -1 } }
    );
    let nextNum = 1001;
    if (last) {
      const parts = last.invoiceNo.split('-');
      nextNum = parseInt(parts[1]) + 1;
    }
    res.json({ invoiceNo: `${prefix}-${nextNum}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Save invoice
router.post('/', protect, async (req, res) => {
  try {
    const invoice = await Invoice.create(req.body);
    res.status(201).json(invoice);
  } catch (err) {
    if (err.code === 11000)
      return res.status(400).json({ message: 'Invoice number already exists.' });
    res.status(500).json({ message: err.message });
  }
});

// Get all invoices with filters
router.get('/', protect, async (req, res) => {
  try {
    const { type, search, from, to } = req.query;
    const filter = {};
    if (type && type !== 'All') filter.invoiceType = type;
    if (search) {
      filter.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { invoiceNo: { $regex: search, $options: 'i' } },
        { chassisNo: { $regex: search, $options: 'i' } },
        { vehicleModel: { $regex: search, $options: 'i' } }
      ];
    }
    if (from || to) {
      filter.invoiceDate = {};
      if (from) filter.invoiceDate.$gte = new Date(from);
      if (to) filter.invoiceDate.$lte = new Date(new Date(to).setHours(23, 59, 59));
    }
    const invoices = await Invoice.find(filter).sort({ createdAt: -1 });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single invoice
router.get('/:id', protect, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete invoice
router.delete('/:id', protect, async (req, res) => {
  try {
    await Invoice.findByIdAndDelete(req.params.id);
    res.json({ message: 'Invoice deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
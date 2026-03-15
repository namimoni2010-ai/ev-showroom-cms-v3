const Service = require('../models/Service');
const Customer = require('../models/Customer');
const Spare = require('../models/SpareStock');

const addService = async (req, res) => {
  try {
    const { customerId, vehicleName, kmRun, serviceType, labourCost, spareItems, paidAmount, serviceDate, paymentMode } = req.body;
    const customer = await Customer.findById(customerId);

    const items = Array.isArray(spareItems) ? spareItems : [];
    const spareCost = items.reduce((sum, item) => sum + (parseFloat(item.sellingPrice) || 0) * (parseFloat(item.quantity) || 1), 0);
    const labour = parseFloat(labourCost) || 0;
    const totalBill = labour + spareCost;
    const paid = parseFloat(paidAmount) || 0;
    const pending = totalBill - paid;
    const paymentStatus = pending <= 0 ? 'Paid' : 'Pending';

    const sDate = serviceDate ? new Date(serviceDate) : new Date();
    const nextServiceDate = new Date(sDate);
    nextServiceDate.setDate(nextServiceDate.getDate() + 90);

    const service = await Service.create({
      customerId,
      customerName: customer ? customer.name : '',
      vehicleName, kmRun, serviceType,
      labourCost: labour,
      spareItems: items,
      spareCost, totalBill,
      paidAmount: paid,
      pendingAmount: pending < 0 ? 0 : pending,
      paymentStatus,
      paymentMode: paymentMode || 'Cash',
      serviceDate: sDate,
      nextServiceDate
    });

    // Auto-decrement spare stock for each item used
    for (const item of items) {
      if (item.spareName && item.quantity > 0) {
        await Spare.findOneAndUpdate(
          { spareName: { $regex: new RegExp(`^${item.spareName}$`, 'i') }, quantity: { $gt: 0 } },
          { $inc: { quantity: -(parseFloat(item.quantity) || 1) } }
        );
      }
    }

    res.status(201).json(service);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getServices = async (req, res) => {
  try {
    const services = await Service.find().populate('customerId', 'name phone').sort({ createdAt: -1 });
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getServicesByCustomer = async (req, res) => {
  try {
    const services = await Service.find({ customerId: req.params.customerId }).sort({ createdAt: -1 });
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateServicePayment = async (req, res) => {
  try {
    const { paidAmount } = req.body;
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    service.paidAmount = paidAmount;
    service.pendingAmount = service.totalBill - paidAmount;
    service.paymentStatus = service.pendingAmount <= 0 ? 'Paid' : 'Pending';
    await service.save();
    res.json(service);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateService = async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json(service);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteService = async (req, res) => {
  try {
    await Service.findByIdAndDelete(req.params.id);
    res.json({ message: 'Service deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { addService, getServices, getServicesByCustomer, updateServicePayment, updateService, deleteService };

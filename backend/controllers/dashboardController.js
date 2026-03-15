const Customer = require('../models/Customer');
const Sale = require('../models/Sales');
const Service = require('../models/Service');
const Vehicle = require('../models/VehicleStock');
const Spare = require('../models/SpareStock');

const getDashboardStats = async (req, res) => {
  try {
    const totalCustomers = await Customer.countDocuments();
    const totalSales = await Sale.countDocuments();
    const totalServices = await Service.countDocuments();

    const salesPending = await Sale.aggregate([
      { $match: { paymentStatus: 'Pending' } },
      { $group: { _id: null, total: { $sum: '$pendingAmount' } } }
    ]);
    const servicesPending = await Service.aggregate([
      { $match: { paymentStatus: 'Pending' } },
      { $group: { _id: null, total: { $sum: '$pendingAmount' } } }
    ]);
    const totalPending = (salesPending[0]?.total || 0) + (servicesPending[0]?.total || 0);

    const pendingSales = await Sale.find({ paymentStatus: 'Pending' })
      .populate('customerId', 'name phone')
      .select('customerName pendingAmount customerId vehicleName finalPrice paidAmount');

    const pendingServices = await Service.find({ paymentStatus: 'Pending' })
      .populate('customerId', 'name phone')
      .select('customerName pendingAmount customerId vehicleName totalBill paidAmount');

    const today = new Date();
    const windowDate = new Date();
    windowDate.setDate(today.getDate() + 30);

    // Service reminders from service records
    const serviceReminders = await Service.find({ nextServiceDate: { $lte: windowDate } })
      .populate('customerId', 'name phone')
      .sort({ nextServiceDate: 1 })
      .limit(50);

    // Service reminders from sales (first service after purchase)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(today.getDate() - 90);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(today.getDate() - 60);

    const salesForReminder = await Sale.find({
      salesDate: { $gte: sixtyDaysAgo, $lte: ninetyDaysAgo }
    }).populate('customerId', 'name phone').sort({ salesDate: 1 });

    const salesReminders = [];
    for (const sale of salesForReminder) {
      const hasService = await Service.exists({
        customerId: sale.customerId,
        vehicleName: { $regex: new RegExp(`^${sale.vehicleName}$`, 'i') }
      });
      if (!hasService) {
        const dueDate = new Date(sale.salesDate);
        dueDate.setDate(dueDate.getDate() + 90);
        salesReminders.push({
          _id: sale._id,
          customerName: sale.customerName,
          customerId: sale.customerId,
          vehicleName: sale.vehicleName,
          serviceDate: sale.salesDate,
          nextServiceDate: dueDate,
          source: 'sale'
        });
      }
    }

    // Low stock alerts - vehicles with quantity <= 1
    const lowVehicleStock = await Vehicle.find({ quantity: { $lte: 1 } })
      .select('vehicleName vehicleType quantity price')
      .sort({ quantity: 1 });

    // Low stock alerts - spares with quantity <= 2
    const lowSpareStock = await Spare.find({ quantity: { $lte: 2 } })
      .select('spareName sellingPrice quantity')
      .sort({ quantity: 1 });

    res.json({
      totalCustomers, totalSales, totalServices, totalPending,
      pendingSales, pendingServices,
      serviceReminders, salesReminders,
      lowVehicleStock, lowSpareStock
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getDashboardStats };

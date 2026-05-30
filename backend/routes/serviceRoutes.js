const express = require('express');
const router = express.Router();
<<<<<<< HEAD
const {
  addService, getServices, getServiceById, getServicesByCustomer,
  addPayment, getPaymentHistory, updateServicePayment, updateService, deleteService
} = require('../controllers/serviceController');
=======
const { addService, getServices, getServicesByCustomer, updateServicePayment, updateService, deleteService } = require('../controllers/serviceController');
>>>>>>> 4b2cd7b56332a999799852674a8a168b7c1e951d
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, addService);
router.get('/', protect, getServices);
router.get('/customer/:customerId', protect, getServicesByCustomer);
<<<<<<< HEAD
router.get('/:id/payments', protect, getPaymentHistory);
router.get('/:id', protect, getServiceById);
router.post('/:id/payment', protect, addPayment);
=======
>>>>>>> 4b2cd7b56332a999799852674a8a168b7c1e951d
router.put('/:id/payment', protect, updateServicePayment);
router.put('/:id', protect, updateService);
router.delete('/:id', protect, deleteService);

module.exports = router;

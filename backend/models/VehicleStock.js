const mongoose = require('mongoose');

const vehicleStockSchema = new mongoose.Schema({
<<<<<<< HEAD
  vehicleModel: { type: String, required: true },
  chassisNo: { type: String, required: true, unique: true },
  motorNo: { type: String },
  controllerNo: { type: String },
  chargerNo: { type: String },
  batteryNo: { type: String },
  vehicleColor: { type: String },
  purchaseDate: { type: Date },
  price: { type: Number, default: 0 },
  stockStatus: {
    type: String,
    enum: ['Available', 'Sold'],
    default: 'Available'
  }
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', vehicleStockSchema);
=======
  vehicleName: { type: String, required: true },
  vehicleType: { type: String },
  range: { type: String },
  price: { type: Number, required: true },
  quantity: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', vehicleStockSchema);
>>>>>>> 4b2cd7b56332a999799852674a8a168b7c1e951d

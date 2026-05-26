const mongoose = require('mongoose');

const vehicleStockSchema = new mongoose.Schema({
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
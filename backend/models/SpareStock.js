const mongoose = require('mongoose');

const spareStockSchema = new mongoose.Schema({
  spareName: { type: String, required: true },
  buyingPrice: { type: Number, required: true, default: 0 },
  sellingPrice: { type: Number, required: true, default: 0 },
<<<<<<< HEAD
  quantity: { type: Number, default: 0 },
  minStockLevel: { type: Number, default: 5 }   // Admin sets alert threshold per item
=======
  quantity: { type: Number, default: 0 }
>>>>>>> 4b2cd7b56332a999799852674a8a168b7c1e951d
}, { timestamps: true });

module.exports = mongoose.model('Spare', spareStockSchema);

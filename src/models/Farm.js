import mongoose from "mongoose";

const farmSchema = new mongoose.Schema({
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  farmName: {
    type: String,
    required: true,
    trim: true
  },
  totalArea: {
    value: { type: Number, required: true },
    unit: { type: String, enum: ['acre', 'hectare'], default: 'acre' }
  },
  location: {
    coordinates: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true }
    },
    address: String
  },
  soilReport: {
    testDate: Date,
    ph: Number,
    nitrogen: Number,
    phosphorus: Number,
    potassium: Number,
    organicCarbon: Number,
  },
  waterSource: {
    type: { type: String, enum: ['Borewell', 'Canal', 'River', 'Pond', 'Rainwater'] },
    quality: { type: String, enum: ['Good', 'Average', 'Poor'] },
    availability: { type: String, enum: ['Abundant', 'Moderate', 'Scarce'] },
  },
  activeCrops: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CropCycle'
  }]
}, {
  timestamps: true
});


export const Farm = mongoose.model('Farm' , farmSchema);

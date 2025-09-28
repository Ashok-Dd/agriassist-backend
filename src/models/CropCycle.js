import mongoose from 'mongoose';
const cropCycleSchema = new mongoose.Schema({
  farm: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farm',
    required: true
  },
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  crop: {
    name: { type: String, required: true },
    variety: String,
    category: { type: String, enum: ['Cereal', 'Pulse', 'Oilseed', 'Vegetable', 'Fruit', 'Cash Crop'] }
  },
  
  season: {
    type: String,
    enum: ['Kharif', 'Rabi', 'Zaid'],
    required: true
  },
  cropStage: {
    type: String,
    enum: ['Planning', 'Sowing', 'Germination', 'Vegetative', 'Flowering', 'Fruiting', 'Maturity', 'Harvested'],
    default: 'Planning'
  },
  timeline: {
    sowingDate: Date,
    expectedHarvestDate: Date,
    actualHarvestDate: Date,
    duration: Number
  },
 aiRecommendations: {
  initialPlan: {
    fertilizerSchedule: [{
      date: { type: Date },
      type: { type: String },
      quantity: { type: Number },
      unit: { type: String },
      applied: { type: Boolean, default: false }
    }],
    irrigationSchedule: [{
      date: { type: Date },
      duration: { type: Number },
      method: { type: String },
      applied: { type: Boolean, default: false }
    }]
  }
},

  expenses: {
    seeds: Number,
    fertilizers: Number,
    pesticides: Number,
    irrigation: Number,
    labor: Number,
    other: Number,
    total: Number
  },
  yield: {
    expected: Number,
    actual: Number,
    unit: String,
    quality: String
  },
  status: {
    type: String,
    enum: ['Active', 'Completed', 'Failed'],
    default: 'Active'
  }
}, {
  timestamps: true
});
export const cropCycle = mongoose.model('cropCycle',cropCycleSchema)

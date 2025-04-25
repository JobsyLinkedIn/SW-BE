import mongoose from 'mongoose';

const subscriptionPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Plan name is required'],
  },
  price: {
    type: Number,
    required: [true, 'Plan price is required'],
    default: 0,
  },
  duration: {
    type: Number, // in days
    default: 30,
  },
  features: [String],
  description: {
    type: String,
  },
  limitations: [String],
  isActive: {
    type: Boolean,
    default: true,
  },
  isFree: {
    type: Boolean,
    default: true,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
});
const subscriptionPlanModel = mongoose.model('Plan', subscriptionPlanSchema);

export { subscriptionPlanModel };

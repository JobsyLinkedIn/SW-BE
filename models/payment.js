import mongoose from 'mongoose';
/*
Payment Schema:
user:
currency:
status:["pending","success","failed","refunded"]
subscriptionPlan:
amount:
*/
const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    currency: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed', 'refunded'],
      default: 'pending',
      required: true,
    },
    subscriptionPlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plan',
      required: true,
    },
    amount: {
      type: Number,
      default: 0,
    },
    paymentId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);
const paymentModel = mongoose.model('Payment', paymentSchema);

export { paymentModel };

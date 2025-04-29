import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['post','user','job'], 
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'type', 
    },
    reason: {
        type: String,
        enum: ['spam', 'harassment', 'inappropriate content', 'fake-account', 'other'],
        required: true,
      },
    details: {
      type: String,
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'ignored'],
      default: 'pending',
    },
    actionTaken: {
      type: String, 
      default: '',
    },
  },
  { timestamps: true }
);

const Report = mongoose.model('Report', reportSchema, 'Report');

export default Report;

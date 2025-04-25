import mongoose from 'mongoose';

const JobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    industry: { type: String, required: true },
    experienceLevel: { type: String, enum: ['Entry', 'Mid', 'Senior'], required: true },
    salaryRange: { type: String, required: true },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    applicants: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        status: { type: String, enum: ['Pending', 'Viewed', 'Rejected', 'Accepted'], default: 'Pending' },
      },
    ],
  },
  { timestamps: true }
);

const Job = mongoose.model('Job', JobSchema);
export default Job;
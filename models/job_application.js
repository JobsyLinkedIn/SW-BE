import mongoose from 'mongoose';

const jobApplicationSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  resume: { type: String }, // optional custom resume upload
  coverLetter: { type: String },
  status: { 
    type: String, 
    enum: ['pending', 'reviewed', 'accepted', 'rejected'], 
    default: 'pending' 
  },
  appliedAt: { type: Date, default: Date.now },
});

const JobApplication = mongoose.model('JobApplication', jobApplicationSchema);
export { jobApplicationSchema };
export default JobApplication;

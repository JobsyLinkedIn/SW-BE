import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  name: String,
  industry: String,
  location: String,
  logo: String,
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  description: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  jobPostings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Job" }],
});

const Company = mongoose.model('Company', companySchema, 'Company');

export default Company;

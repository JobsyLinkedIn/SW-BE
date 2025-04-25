import mongoose from 'mongoose';
import { jobApplicationSchema } from './job_application.js';

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  industry: { type: String, required: true },
  experienceLevel: { type: String, enum: ['Entry', 'Mid', 'Senior'], required: true }, 
  salary: { type: Number, required: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], 
  applications: [jobApplicationSchema], 
  createdAt: { type: Date, default: Date.now },
});

const Job = mongoose.model('Job', jobSchema, 'Job');

export default Job;
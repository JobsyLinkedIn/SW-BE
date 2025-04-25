import mongoose from 'mongoose';
const jobSchema = new mongoose.Schema({
    title: String,
    description: String,
    location: String,
    salary: Number,
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
  });

const Job = mongoose.model('Job', jobSchema, 'Job');

export default Job;
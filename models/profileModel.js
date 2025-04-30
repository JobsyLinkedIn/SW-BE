import mongoose from 'mongoose';

const workExperienceSchema = new mongoose.Schema({
  company: String,
  position: String,
  startDate: Date,
  endDate: {
    type: mongoose.Schema.Types.Mixed,
    validate: {
      validator: function (value) {
        // Allow "Present" or valid date strings
        return value === 'Present' || !isNaN(Date.parse(value));
      },
      message: (props) => `${props.value} is not a valid end date!`,
    },
  },
  description: String,
});

const profileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: String,
  bio: String,
  location: String,
  workExperience: [workExperienceSchema],
  education: [Object],
  skills: [String],
  industry: String,
  profilePicture: String,
  coverPhoto: String,
  resume: String,
  privacySettings: Object,
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

const Profile = mongoose.model('Profile', profileSchema);

export default Profile;

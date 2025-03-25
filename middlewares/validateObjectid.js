const { mongoose } = require('mongoose');

module.exports = (req, res, next) => {
  if (mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next();
  }
  res.status(400).json({ message: 'Invalid ID' });
};

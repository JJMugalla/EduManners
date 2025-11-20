const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['parent', 'institution'], default: 'parent' },
  theme: { type: String, default: 'light' }, // For Dark Mode preference
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
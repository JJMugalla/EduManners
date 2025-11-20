const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  // The Bank
  stats: {
    goldStars: { type: Number, default: 0 },
    silverStars: { type: Number, default: 0 },
    bronzeStars: { type: Number, default: 0 },
    coins: { type: Number, default: 0 }
  },
  // History of actions
  activityLog: [{
    habitName: String,
    type: { type: String, enum: ['gold', 'silver', 'bronze'] },
    date: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
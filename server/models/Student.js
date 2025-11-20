const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  stats: {
    goldStars: { type: Number, default: 0 },
    silverStars: { type: Number, default: 0 },
    bronzeStars: { type: Number, default: 0 },
    coins: { type: Number, default: 0 }
  },
  habits: [{ 
    name: String, 
    type: { type: String, enum: ['gold', 'silver', 'bronze'] } 
  }],
  logs: [{
    action: String,
    change: String, // e.g., "+1 Gold Star"
    date: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
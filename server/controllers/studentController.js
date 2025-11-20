const Student = require('../models/Student');
const sendEmail = require('../utils/emailService'); // Your nodemailer wrapper

// 1. Award a Star
exports.awardStar = async (req, res) => {
  const { studentId, habitName, starType } = req.body; 
  // starType must be 'gold', 'silver', or 'bronze'

  try {
    const updateField = `stats.${starType}Stars`;
    const student = await Student.findByIdAndUpdate(
      studentId,
      { 
        $inc: { [updateField]: 1 }, // Increment specific star count
        $push: { activityLog: { habitName, type: starType } }
      },
      { new: true }
    );
    
    // Optional: Emit Socket event for real-time dashboard update
    // req.io.to(studentId).emit('star_awarded', student);

    res.json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Redeem Coins (The Exchange Logic)
exports.redeemCoins = async (req, res) => {
  const { studentId, exchangeType } = req.body; 
  // exchangeType: 'gold_to_coin', 'silver_to_coin', 'bronze_to_coin'

  try {
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ msg: 'Student not found' });

    let success = false;

    // Logic based on your prompt
    if (exchangeType === 'gold_to_coin') {
      if (student.stats.goldStars >= 100) {
        student.stats.goldStars -= 100;
        student.stats.coins += 10;
        success = true;
      }
    } else if (exchangeType === 'silver_to_coin') {
      if (student.stats.silverStars >= 200) {
        student.stats.silverStars -= 200;
        student.stats.coins += 5;
        success = true;
      }
    } else if (exchangeType === 'bronze_to_coin') {
      if (student.stats.bronzeStars >= 300) {
        student.stats.bronzeStars -= 300;
        student.stats.coins += 100; // Note: High reward as requested
        success = true;
      }
    }

    if (success) {
      await student.save();
      
      // Trigger Email Notification
      await sendEmail({
        to: req.user.email, // Assuming auth middleware attaches user
        subject: 'EduManners Redemption Alert!',
        text: `${student.name} just redeemed coins! Current Balance: ${student.stats.coins}`
      });

      return res.json({ msg: 'Redemption successful', stats: student.stats });
    } else {
      return res.status(400).json({ msg: 'Insufficient stars for redemption' });
    }

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
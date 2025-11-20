const User = require('../models/User');
const Student = require('../models/Student');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Email Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

// --- Auth Controllers ---
exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashedPassword, role });
    res.status(201).json({ message: "User created" });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ token, user: { id: user._id, username: user.username, email: user.email } });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// --- Student Controllers ---
exports.createStudent = async (req, res) => {
  try {
    const student = await Student.create({ ...req.body, parentId: req.user.id });
    res.status(201).json(student);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getStudents = async (req, res) => {
  try {
    const students = await Student.find({ parentId: req.user.id });
    res.json(students);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateStars = async (req, res) => {
  const { studentId, type, habitName } = req.body;
  // type: 'gold', 'silver', 'bronze'
  try {
    const field = `stats.${type}Stars`;
    const student = await Student.findByIdAndUpdate(studentId, {
      $inc: { [field]: 1 },
      $push: { logs: { action: habitName, change: `+1 ${type} star` } }
    }, { new: true });
    
    // Notify Client via Socket
    req.io.emit('data_update', student);
    res.json(student);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.redeemCoins = async (req, res) => {
  const { studentId, exchangeType } = req.body;
  try {
    const student = await Student.findById(studentId);
    let success = false;

    if (exchangeType === 'gold' && student.stats.goldStars >= 100) {
      student.stats.goldStars -= 100; student.stats.coins += 10; success = true;
    } else if (exchangeType === 'silver' && student.stats.silverStars >= 200) {
      student.stats.silverStars -= 200; student.stats.coins += 5; success = true;
    } else if (exchangeType === 'bronze' && student.stats.bronzeStars >= 300) {
      student.stats.bronzeStars -= 300; student.stats.coins += 100; success = true;
    }

    if (success) {
      student.logs.push({ action: 'Redemption', change: 'Coins Added' });
      await student.save();
      req.io.emit('data_update', student);

      // Send Email
      transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: req.user.email,
        subject: 'EduManners Reward Redeemed!',
        text: `A reward was redeemed! New Coin Balance: ${student.stats.coins}`
      }).catch(err => console.log("Email failed", err));

      return res.json(student);
    }
    res.status(400).json({ error: "Insufficient stars" });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
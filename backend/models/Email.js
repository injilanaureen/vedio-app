const mongoose = require('mongoose');

const emailSchema = new mongoose.Schema({
  to: { type: String, required: true },
  subject: { type: String, default: '' },
  message: { type: String, required: true },
  sent_by: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  sent_at: { type: Date, default: Date.now },
  status: { type: String, enum: ['sent', 'failed'], default: 'sent' },
  error: { type: String }
});

module.exports = mongoose.model('email', emailSchema);


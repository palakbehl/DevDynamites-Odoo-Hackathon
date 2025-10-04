const mongoose = require('mongoose');

const approvalChainSchema = new mongoose.Schema({
  company_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  approver_role: {
    type: String,
    enum: ['admin', 'manager', 'employee'],
    required: true
  },
  sequence_order: {
    type: Number,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Ensure unique sequence per company
approvalChainSchema.index({ company_id: 1, sequence_order: 1 }, { unique: true });

module.exports = mongoose.model('ApprovalChain', approvalChainSchema);
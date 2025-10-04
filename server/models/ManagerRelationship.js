const mongoose = require('mongoose');

const managerRelationshipSchema = new mongoose.Schema({
  employee_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  manager_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  company_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Ensure unique relationship per company
managerRelationshipSchema.index({ employee_id: 1, company_id: 1 }, { unique: true });

module.exports = mongoose.model('ManagerRelationship', managerRelationshipSchema);
const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
  },
  ticker: {
    type: String,
    required: [true, 'Ticker/Symbol is required'],
    uppercase: true,
    trim: true,
  },
  industry: {
    type: String,
    enum: ['Technology', 'Manufacturing', 'Retail', 'Healthcare', 'Finance', 'Energy', 'Consumer Goods', 'Other'],
    default: 'Technology',
  },
  currency: {
    type: String,
    default: 'USD',
    uppercase: true,
  },
  description: {
    type: String,
    default: '',
  },
  foundedYear: {
    type: Number,
    default: 2015,
  },
  isSample: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Company', companySchema);

import mongoose from 'mongoose';

const swapRequestSchema = new mongoose.Schema({
  requesterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  accepterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requesterOfferedSkill: {
    type: String,
    required: true,
    trim: true
  },
  accepterWantedSkill: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'cancelled', 'completed'],
    default: 'pending'
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      trim: true
    }
  }
}, {
  timestamps: true
});

// Prevent duplicate requests
swapRequestSchema.index({ requesterId: 1, accepterId: 1, status: 1 });

export default mongoose.model('SwapRequest', swapRequestSchema);
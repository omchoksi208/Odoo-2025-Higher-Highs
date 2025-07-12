import express from 'express';
import SwapRequest from '../models/SwapRequest.js';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Create swap request
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { accepterId, requesterOfferedSkill, accepterWantedSkill, message } = req.body;
    const requesterId = req.user._id;

    // Validation
    if (!accepterId || !requesterOfferedSkill || !accepterWantedSkill) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    // Check if accepter exists
    const accepter = await User.findById(accepterId);
    if (!accepter) {
      return res.status(404).json({ message: 'Accepter not found' });
    }

    // Prevent self-requests
    if (requesterId.toString() === accepterId) {
      return res.status(400).json({ message: 'You cannot send a swap request to yourself' });
    }

    // Check for existing pending request
    const existingRequest = await SwapRequest.findOne({
      requesterId,
      accepterId,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'You already have a pending request with this user' });
    }

    // Create swap request
    const swapRequest = new SwapRequest({
      requesterId,
      accepterId,
      requesterOfferedSkill,
      accepterWantedSkill,
      message
    });

    await swapRequest.save();

    // Populate the request with user details
    await swapRequest.populate('requesterId', 'name email profilePhotoUrl');
    await swapRequest.populate('accepterId', 'name email profilePhotoUrl');

    res.status(201).json({
      message: 'Swap request created successfully',
      swapRequest
    });
  } catch (error) {
    console.error('Create swap request error:', error);
    res.status(500).json({ message: 'Server error creating swap request' });
  }
});

// Get user's swap requests
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const { status = '' } = req.query;
    const userId = req.user._id;

    let query = {
      $or: [
        { requesterId: userId },
        { accepterId: userId }
      ]
    };

    if (status) {
      query.status = status;
    }

    const swapRequests = await SwapRequest.find(query)
      .populate('requesterId', 'name email profilePhotoUrl')
      .populate('accepterId', 'name email profilePhotoUrl')
      .sort({ createdAt: -1 });

    // Format the response to include user-friendly data
    const formattedRequests = swapRequests.map(request => ({
      _id: request._id,
      requesterName: request.requesterId.name,
      requesterPhotoUrl: request.requesterId.profilePhotoUrl,
      accepterName: request.accepterId.name,
      accepterPhotoUrl: request.accepterId.profilePhotoUrl,
      requesterOfferedSkill: request.requesterOfferedSkill,
      accepterWantedSkill: request.accepterWantedSkill,
      message: request.message,
      status: request.status,
      createdAt: request.createdAt,
      isRequester: request.requesterId._id.toString() === userId.toString()
    }));

    res.json(formattedRequests);
  } catch (error) {
    console.error('Get swap requests error:', error);
    res.status(500).json({ message: 'Server error fetching swap requests' });
  }
});

// Accept swap request
router.put('/:id/accept', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const swapRequest = await SwapRequest.findById(id);
    
    if (!swapRequest) {
      return res.status(404).json({ message: 'Swap request not found' });
    }

    // Check if user is the accepter
    if (swapRequest.accepterId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'You can only accept requests sent to you' });
    }

    // Check if request is still pending
    if (swapRequest.status !== 'pending') {
      return res.status(400).json({ message: 'This request has already been processed' });
    }

    swapRequest.status = 'accepted';
    await swapRequest.save();

    res.json({ message: 'Swap request accepted successfully', swapRequest });
  } catch (error) {
    console.error('Accept swap request error:', error);
    res.status(500).json({ message: 'Server error accepting swap request' });
  }
});

// Reject swap request
router.put('/:id/reject', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const swapRequest = await SwapRequest.findById(id);
    
    if (!swapRequest) {
      return res.status(404).json({ message: 'Swap request not found' });
    }

    // Check if user is the accepter
    if (swapRequest.accepterId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'You can only reject requests sent to you' });
    }

    // Check if request is still pending
    if (swapRequest.status !== 'pending') {
      return res.status(400).json({ message: 'This request has already been processed' });
    }

    swapRequest.status = 'rejected';
    await swapRequest.save();

    res.json({ message: 'Swap request rejected successfully', swapRequest });
  } catch (error) {
    console.error('Reject swap request error:', error);
    res.status(500).json({ message: 'Server error rejecting swap request' });
  }
});

// Delete swap request (for requesters)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const swapRequest = await SwapRequest.findById(id);
    
    if (!swapRequest) {
      return res.status(404).json({ message: 'Swap request not found' });
    }

    // Check if user is the requester
    if (swapRequest.requesterId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'You can only delete your own requests' });
    }

    // Only allow deletion of pending requests
    if (swapRequest.status !== 'pending') {
      return res.status(400).json({ message: 'You can only delete pending requests' });
    }

    await SwapRequest.findByIdAndDelete(id);

    res.json({ message: 'Swap request deleted successfully' });
  } catch (error) {
    console.error('Delete swap request error:', error);
    res.status(500).json({ message: 'Server error deleting swap request' });
  }
});

export default router;
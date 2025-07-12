import express from 'express';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get public users (for browsing)
router.get('/', async (req, res) => {
  try {
    const { search = '', availability = '' } = req.query;
    
    let query = { isPublic: true };
    
    // Add search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { skillsOffered: { $in: [new RegExp(search, 'i')] } },
        { skillsWanted: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    // Add availability filter
    if (availability) {
      query.availability = availability;
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
});

// Get user profile by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server error fetching user profile' });
  }
});

// Update user profile
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user is updating their own profile
    if (req.user._id.toString() !== id) {
      return res.status(403).json({ message: 'You can only update your own profile' });
    }

    const allowedUpdates = ['name', 'location', 'skillsOffered', 'skillsWanted', 'availability', 'isPublic'];
    const updates = {};
    
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

// Upload profile photo (placeholder - you'll need to implement file upload)
router.put('/:id/profile-photo', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user is updating their own profile
    if (req.user._id.toString() !== id) {
      return res.status(403).json({ message: 'You can only update your own profile' });
    }

    // For now, just return a placeholder response
    // You'll need to implement actual file upload with multer and cloudinary
    res.json({ 
      message: 'Photo upload endpoint - implement with multer and cloudinary',
      profilePhotoUrl: 'https://via.placeholder.com/150'
    });
  } catch (error) {
    console.error('Upload photo error:', error);
    res.status(500).json({ message: 'Server error uploading photo' });
  }
});

export default router;
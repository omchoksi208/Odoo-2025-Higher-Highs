// pages/profile.jsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import SkillInput from '../components/SkillInput';
import { users } from '../lib/api';
import { UserCircle, Camera } from 'lucide-react';

const UserProfilePage = () => {
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [skillsOffered, setSkillsOffered] = useState([]);
  const [skillsWanted, setSkillsWanted] = useState([]);
  const [availability, setAvailability] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUserId = localStorage.getItem('userId');
      if (!storedUserId) {
        router.push('/login');
        return;
      }
      setUserId(storedUserId);
      fetchUserProfile(storedUserId);
    }
  }, [router]);

  const fetchUserProfile = async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await users.getUserProfile(id);
      const userData = response.data;
      setName(userData.name || '');
      setLocation(userData.location || '');
      setSkillsOffered(userData.skillsOffered || []);
      setSkillsWanted(userData.skillsWanted || []);
      setAvailability(userData.availability || '');
      setIsPublic(userData.isPublic !== undefined ? userData.isPublic : true);
      setProfilePhotoUrl(userData.profilePhotoUrl || null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch profile.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    if (!userId) return;

    try {
      const profileData = {
        name,
        location,
        skillsOffered,
        skillsWanted,
        availability,
        isPublic,
      };
      await users.updateUserProfile(userId, profileData);

      if (selectedFile) {
        const formData = new FormData();
        formData.append('profilePhoto', selectedFile);
        const photoResponse = await users.uploadProfilePhoto(userId, formData);
        setProfilePhotoUrl(photoResponse.data.profilePhotoUrl);
        setSelectedFile(null); // Clear selected file after upload
      }
      setSuccessMessage('Profile saved successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    // Re-fetch original data to discard changes
    if (userId) {
      fetchUserProfile(userId);
      setSuccessMessage(null);
      setError(null);
      setSelectedFile(null);
    }
  };

  if (isLoading) {
    return <p className="text-center text-gray-400">Loading profile...</p>;
  }

  return (
    <div className="w-full max-w-3xl bg-gray-800 p-8 rounded-lg shadow-xl my-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">User Profile</h1>
        <div className="flex space-x-4">
          <button
            onClick={handleSave}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors font-semibold"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={handleDiscard}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors font-semibold"
          >
            Discard
          </button>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      {successMessage && <p className="text-green-500 text-sm mb-4">{successMessage}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-1">
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-300 text-sm font-bold mb-2">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="location" className="block text-gray-300 text-sm font-bold mb-2">
              Location (Optional)
            </label>
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full"
            />
          </div>
          <SkillInput label="Skills Offered" skills={skillsOffered} setSkills={setSkillsOffered} />
          <SkillInput label="Skills Wanted" skills={skillsWanted} setSkills={setSkillsWanted} />
          <div className="mb-4">
            <label htmlFor="availability" className="block text-gray-300 text-sm font-bold mb-2">
              Availability
            </label>
            <select
              id="availability"
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              className="w-full"
            >
              <option value="">Select Availability</option>
              <option value="weekends">Weekends</option>
              <option value="evenings">Evenings</option>
              <option value="weekdays">Weekdays</option>
              {/* Add more options */}
            </select>
          </div>
          <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              id="isPublic"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="mr-2 h-4 w-4 text-primary rounded focus:ring-primary"
            />
            <label htmlFor="isPublic" className="text-gray-300 text-sm font-bold">
              Public Profile
            </label>
          </div>
        </div>

        <div className="md:col-span-1 flex flex-col items-center justify-start">
          <div className="relative mb-4">
            {profilePhotoUrl ? (
              <img
                src={profilePhotoUrl}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-2 border-primary"
              />
            ) : (
              <UserCircle size={128} className="text-gray-500" />
            )}
            <label htmlFor="profilePhotoInput" className="absolute bottom-0 right-0 bg-primary p-2 rounded-full cursor-pointer hover:bg-secondary transition-colors">
              <Camera size={20} className="text-white" />
              <input
                id="profilePhotoInput"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>
          {selectedFile && <p className="text-gray-400 text-sm mt-2">{selectedFile.name} selected</p>}
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
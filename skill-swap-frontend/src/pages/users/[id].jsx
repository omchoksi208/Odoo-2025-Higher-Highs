// pages/users/[id].jsx
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { users, swapRequests } from '../../lib/api';
import ProfileCard from '../../components/ProfileCard'; // Reusing ProfileCard for display
import { UserCircle, MessageSquare } from 'lucide-react';

const UserPublicProfilePage = () => {
  const router = useRouter();
  const { id } = router.query; // Get user ID from URL
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requesterOfferedSkill, setRequesterOfferedSkill] = useState('');
  const [accepterWantedSkill, setAccepterWantedSkill] = useState('');
  const [message, setMessage] = useState('');
  const [isSendingRequest, setIsSendingRequest] = useState(false);
  const [requestError, setRequestError] = useState(null);
  const [requestSuccess, setRequestSuccess] = useState(null);
  const [currentUserSkills, setCurrentUserSkills] = useState([]); // Skills of the logged-in user

  useEffect(() => {
    if (id) {
      fetchUserProfile(id);
      fetchCurrentUserSkills();
    }
  }, [id]);

  const fetchUserProfile = async (userId) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await users.getUserProfile(userId);
      setUser(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch user profile.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCurrentUserSkills = async () => {
    if (typeof window !== 'undefined') {
      const loggedInUserId = localStorage.getItem('userId');
      if (loggedInUserId) {
        try {
          const response = await users.getUserProfile(loggedInUserId);
          setCurrentUserSkills(response.data.skillsOffered || []);
        } catch (err) {
          console.error("Failed to fetch current user's skills:", err);
        }
      }
    }
  };

  const handleRequestSwap = async (e) => {
    e.preventDefault();
    setIsSendingRequest(true);
    setRequestError(null);
    setRequestSuccess(null);

    if (typeof window !== 'undefined') {
      const loggedInUserId = localStorage.getItem('userId');
      if (!loggedInUserId) {
        setRequestError('You must be logged in to send a swap request.');
        setIsSendingRequest(false);
        return;
      }

      try {
        await swapRequests.createRequest({
          accepterId: id,
          requesterOfferedSkill,
          accepterWantedSkill,
          message,
        });
        setRequestSuccess('Swap request sent successfully!');
        setShowRequestModal(false);
        setRequesterOfferedSkill('');
        setAccepterWantedSkill('');
        setMessage('');
      } catch (err) {
        setRequestError(err.response?.data?.message || 'Failed to send swap request.');
      } finally {
        setIsSendingRequest(false);
      }
    }

  };

  if (isLoading) {
    return <p className="text-center text-gray-400">Loading user profile...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  if (!user) {
    return <p className="text-center text-gray-400">User not found.</p>;
  }

  return (
    <div className="w-full max-w-4xl py-8">
      <ProfileCard user={user} /> {/* Reusing the display component */}
      
      <div className="flex justify-center mt-6">
        <button
          onClick={() => setShowRequestModal(true)}
          className="bg-primary text-white px-6 py-3 rounded-md hover:bg-secondary transition-colors font-semibold flex items-center gap-2"
        >
          <MessageSquare size={20} /> Request Swap
        </button>
      </div>

      {/* Request Swap Modal (Screen 5 logic) */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Request Swap with {user.name}</h2>
            <form onSubmit={handleRequestSwap}>
              <div className="mb-4">
                <label htmlFor="yourSkill" className="block text-gray-300 text-sm font-bold mb-2">
                  Choose one of your offered skills
                </label>
                <select
                  id="yourSkill"
                  value={requesterOfferedSkill}
                  onChange={(e) => setRequesterOfferedSkill(e.target.value)}
                  className="w-full"
                  required
                >
                  <option value="">Select your skill</option>
                  {currentUserSkills.map((skill, index) => (
                    <option key={index} value={skill}>{skill}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label htmlFor="theirSkill" className="block text-gray-300 text-sm font-bold mb-2">
                  Choose one of their wanted skills
                </label>
                <select
                  id="theirSkill"
                  value={accepterWantedSkill}
                  onChange={(e) => setAccepterWantedSkill(e.target.value)}
                  className="w-full"
                  required
                >
                  <option value="">Select their wanted skill</option>
                  {user.skillsWanted?.map((skill, index) => (
                    <option key={index} value={skill}>{skill}</option>
                  ))}
                </select>
              </div>
              <div className="mb-6">
                <label htmlFor="message" className="block text-gray-300 text-sm font-bold mb-2">
                  Message (Optional)
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows="4"
                  className="w-full"
                  placeholder="Tell them why you want to swap skills..."
                ></textarea>
              </div>
              {requestError && <p className="text-red-500 text-sm mb-4">{requestError}</p>}
              {requestSuccess && <p className="text-green-500 text-sm mb-4">{requestSuccess}</p>}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary text-white px-4 py-2 rounded-md hover:bg-secondary transition-colors font-semibold"
                  disabled={isSendingRequest}
                >
                  {isSendingRequest ? 'Sending...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPublicProfilePage;
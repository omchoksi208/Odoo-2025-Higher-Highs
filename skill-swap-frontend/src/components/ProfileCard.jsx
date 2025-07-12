import { useState, useEffect } from 'react';
import { UserCircle } from 'lucide-react';

const ProfileCard = ({ user }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsLoggedIn(!!localStorage.getItem('token'));
    }
  }, []);

  const handleRequest = () => {
    if (!isLoggedIn) {
      alert('Please login to request a swap!');
      return;
    }
    alert(`Request sent to ${user.name}`);
  };

  return (
    <div className="flex items-center justify-between bg-gray-900 rounded-lg p-6 shadow mb-4">
      <div className="flex items-center gap-6">
        {user.photo ? (
          <img src={user.photo} alt="Profile" className="w-20 h-20 rounded-full object-cover border-2 border-gray-700" />
        ) : (
          <div className="w-20 h-20 flex items-center justify-center rounded-full bg-gray-700 border-2 border-gray-600">
            <UserCircle size={48} className="text-gray-400" />
          </div>
        )}
        <div>
          <div className="text-xl font-semibold text-white">{user.name}</div>
          <div className="text-green-400 text-sm mt-1">
            Skills Offered =&gt;{' '}
            {user.skillsOffered?.map(skill => (
              <span key={skill} className="inline-block bg-gray-800 px-2 py-1 rounded mr-1 text-xs">{skill}</span>
            ))}
          </div>
          <div className="text-blue-400 text-sm mt-1">
            Skill wanted =&gt;{' '}
            {user.skillsWanted?.map(skill => (
              <span key={skill} className="inline-block bg-gray-800 px-2 py-1 rounded mr-1 text-xs">{skill}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <button
          className="bg-cyan-700 text-white px-5 py-2 rounded hover:bg-cyan-900 transition-colors"
          onClick={handleRequest}
        >
          Request
        </button>
        <div className="text-gray-300 text-sm">rating: {user.rating?.toFixed(1) || 'N/A'}/5</div>
      </div>
    </div>
  );
};

export default ProfileCard;
// components/SwapRequestCard.jsx
import { useState, useEffect } from 'react';
import { UserCircle } from 'lucide-react';

const SwapRequestCard = ({ request, onAccept, onReject, onDelete }) => {
  const [isRequester, setIsRequester] = useState(false);
  const isPending = request.status === 'pending';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userId = localStorage.getItem('userId');
      setIsRequester(request.isRequester || (request.requesterId === userId));
    }
  }, [request]);

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6 mb-6">
      <div className="flex-shrink-0">
        {request.requesterPhotoUrl ? ( // Assuming requesterPhotoUrl in request object
          <img
            src={request.requesterPhotoUrl}
            alt={`${request.requesterName}'s profile`}
            className="w-24 h-24 rounded-full object-cover border-2 border-primary"
          />
        ) : (
          <UserCircle size={96} className="text-gray-500" />
        )}
      </div>
      <div className="flex-grow text-center md:text-left">
        <h3 className="text-xl font-bold text-white mb-2">{request.requesterName}</h3>
        <div className="mb-2">
          <p className="text-gray-300 text-sm font-semibold">Skill Offered: {request.requesterOfferedSkill}</p>
          <p className="text-gray-300 text-sm font-semibold">Skill Wanted: {request.accepterWantedSkill}</p>
        </div>
        {request.message && (
          <p className="text-gray-400 text-sm italic">"{request.message}"</p>
        )}
        {request.rating !== undefined && ( // Assuming rating is part of the request object after completion
          <p className="text-gray-400 text-sm mt-2">Rating: {request.rating?.toFixed(1) || 'N/A'}/5</p>
        )}
      </div>
      <div className="flex-shrink-0 mt-4 md:mt-0 text-center md:text-right">
        <p className={`text-lg font-semibold mb-2 ${
          request.status === 'accepted' ? 'text-green-500' :
          request.status === 'rejected' ? 'text-red-500' :
          'text-yellow-500'
        }`}>
          Status: {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
        </p>
        {isPending && !isRequester && ( // If pending and current user is the accepter
          <div className="flex flex-col space-y-2">
            <button
              onClick={() => onAccept(request._id)}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors font-semibold"
            >
              Accept
            </button>
            <button
              onClick={() => onReject(request._id)}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors font-semibold"
            >
              Reject
            </button>
          </div>
        )}
        {isPending && isRequester && ( // If pending and current user is the requester
          <button
            onClick={() => onDelete(request._id)}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors font-semibold"
          >
            Delete Request
          </button>
        )}
      </div>
    </div>
  );
};

export default SwapRequestCard;
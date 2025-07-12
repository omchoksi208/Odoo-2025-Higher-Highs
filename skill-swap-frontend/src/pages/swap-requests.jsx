// pages/swap-requests.jsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import SwapRequestCard from '../components/SwapRequestCard';
import { swapRequests } from '../lib/api';

const SwapRequestsPage = () => {
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [filterStatus, setFilterStatus] = useState('pending'); // Default filter
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        router.push('/login');
        return;
      }
    }
    fetchSwapRequests(filterStatus);
  }, [router, filterStatus]);

  const fetchSwapRequests = async (status) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const response = await swapRequests.getMyRequests(status);
      setRequests(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch swap requests.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (id) => {
    try {
      await swapRequests.acceptRequest(id);
      setSuccessMessage('Swap request accepted!');
      fetchSwapRequests(filterStatus); // Refresh list
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to accept request.');
    }
  };

  const handleReject = async (id) => {
    try {
      await swapRequests.rejectRequest(id);
      setSuccessMessage('Swap request rejected!');
      fetchSwapRequests(filterStatus); // Refresh list
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject request.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await swapRequests.deleteRequest(id);
      setSuccessMessage('Swap request deleted!');
      fetchSwapRequests(filterStatus); // Refresh list
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete request.');
    }
  };

  return (
    <div className="w-full max-w-4xl py-8">
      <h1 className="text-4xl font-bold text-center text-white mb-8">My Swap Requests</h1>

      <div className="flex justify-center mb-8">
        <select
          className="px-4 py-2 rounded-md bg-gray-800 border border-gray-700 appearance-none pr-8"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
          <option value="">All</option>
        </select>
      </div>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      {successMessage && <p className="text-green-500 text-center mb-4">{successMessage}</p>}

      {isLoading ? (
        <p className="text-center text-gray-400">Loading swap requests...</p>
      ) : requests.length === 0 ? (
        <p className="text-center text-gray-400">No {filterStatus !== '' ? filterStatus : 'current'} swap requests found.</p>
      ) : (
        requests.map((request) => (
          <SwapRequestCard
            key={request._id}
            request={request}
            onAccept={handleAccept}
            onReject={handleReject}
            onDelete={handleDelete}
          />
        ))
      )}
    </div>
  );
};

export default SwapRequestsPage;
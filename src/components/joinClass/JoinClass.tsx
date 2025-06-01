import React, { useState, ChangeEvent } from 'react';
import API_ENDPOINTS from '~/config';
import { apiCallPost } from '~/services/apiCallService';
import { useNavigate } from 'react-router-dom';

interface JoinClassProps {
  isOpen: boolean;
  onRequestClose: () => void;
}

const JoinClass: React.FC<JoinClassProps> = ({ isOpen, onRequestClose }) => {
  const [classId, setClassId] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const navigate = useNavigate();

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setClassId(event.target.value);
  };

  const handleJoinClass = async (): Promise<void> => {
    setStatusMessage('Joining class...');
    const response = await apiCallPost<any>(
      API_ENDPOINTS.JOINCLASS,
      {
        _id: classId,
      },
      navigate,
    );
    if (response.success) {
      setStatusMessage('Successfully joined the class!');
      setClassId(''); // Clear input on success
      window.location.reload();
    } else {
      setStatusMessage('Failed to join the class. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
<div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 transition-opacity">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg transition">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold text-gray-800">Join a Class</h1>
          <button onClick={onRequestClose} className="text-gray-500 hover:text-gray-700 transition">
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            value={classId}
            onChange={handleInputChange}
            placeholder="Enter Class ID"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition"
          />
          <button
            onClick={handleJoinClass}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Join
          </button>
          {statusMessage && (
            <p
              className={`text-center ${
                statusMessage.includes('Successfully') ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {statusMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default JoinClass;

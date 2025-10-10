import React from 'react';
import { UserIcon } from '@heroicons/react/24/outline';

interface UserBotonProps {
  onClick: () => void;
}

const UserBoton: React.FC<UserBotonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
    >
      <UserIcon className="h-6 w-6" />
    </button>
  );
};

export default UserBoton;
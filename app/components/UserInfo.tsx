import React from 'react';
import { useWeb3Auth } from './Web3AuthProvider';

const UserInfoComponent = () => {
  const { user } = useWeb3Auth();

  if (!user) {
    return <div>Please log in</div>; 
  }

  return (
    <div className="flex items-center space-x-4">
      {user.profileImage && (
        <img src={user.profileImage} alt="User Avatar" className="w-10 h-10 rounded-full" />
      )}
      <div>
        <div className="font-bold">{user.name}</div>
        <div>Wallet Address: {user.walletAddress}</div>
      </div>
    </div>
  );
};

export default UserInfoComponent;

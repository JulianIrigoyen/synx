import React from 'react';
import { useWeb3Auth } from './Web3AuthProvider';

const UserInfoComponent = () => {
  const { user, getUserInfo } = useWeb3Auth();

  const handleLogin = async () => {
    // Assuming you have a login function to authenticate the user
    await login();
    await getUserInfo(); // Fetch user info after successful login
  };

  return (
    <div>
      <button onClick={handleLogin}>Login and Fetch User Info</button>
      {user && <div>Hello, {user.name}</div>}
    </div>
  );
};

export default UserInfoComponent;

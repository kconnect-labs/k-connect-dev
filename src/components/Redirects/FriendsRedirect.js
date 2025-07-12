import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

export function FriendsRedirect() {
  const { user } = useContext(AuthContext);
  if (user && user.username) {
    window.location.replace(`/friends/${user.username}`);
    return null;
  }
  // If not logged in, redirect to login or show error
  window.location.replace('/login');
  return null;
} 
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';

export default function LogoutPage() {
  const { logOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
      await logOut();
      navigate('/');
    };
    performLogout();
  }, [logOut, navigate]);

  return null;
}
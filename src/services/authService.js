// Authentication service for handling user auth operations
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, signInWithPopup, GoogleAuthProvider, GithubAuthProvider, OAuthProvider } from 'firebase/auth';
import { auth } from '../firebase/config';

// Initialize providers
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();
const appleProvider = new OAuthProvider('apple.com');
const microsoftProvider = new OAuthProvider('microsoft.com');

// Helper to store auth state in localStorage
const setAuthState = (isAuthenticated) => {
  localStorage.setItem('isAuthenticated', isAuthenticated.toString());
};

// Email & Password Authentication
export const registerWithEmail = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    setAuthState(true);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const loginWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    setAuthState(true);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// OAuth Providers
export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    setAuthState(true);
    return { success: true, user: result.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const loginWithGithub = async () => {
  try {
    const result = await signInWithPopup(auth, githubProvider);
    setAuthState(true);
    return { success: true, user: result.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const loginWithApple = async () => {
  try {
    const result = await signInWithPopup(auth, appleProvider);
    setAuthState(true);
    return { success: true, user: result.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const loginWithMicrosoft = async () => {
  try {
    const result = await signInWithPopup(auth, microsoftProvider);
    setAuthState(true);
    return { success: true, user: result.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Sign out
export const logout = async () => {
  try {
    await signOut(auth);
    setAuthState(false);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Check authentication state
export const getCurrentUser = () => {
  return auth.currentUser;
};
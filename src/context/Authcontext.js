// src/context/Authcontext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, db } from '../Firebase/Firebase';
import { doc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  async function login(email, password) {
    try {
      console.log(' Login attempt:', { email });
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Set current user immediately
      setCurrentUser(user);
      
      // Get user role from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      let role = 'student'; // default role
      
      if (userDoc.exists()) {
        role = userDoc.data().role;
        const profileData = { uid: user.uid, ...userDoc.data() };
        setUserProfile(profileData);
        localStorage.setItem('userProfile', JSON.stringify(profileData));
        console.log(' Role from Firestore:', role);
      } else {
        // If no role found, try to determine from email (for demo users)
        role = email.includes('admin') ? 'admin' : 'student';
        console.log(' Role inferred from email:', role);
      }
      
      setUserRole(role);
      
      // Save to localStorage for persistence
      const userData = {
        uid: user.uid,
        email: user.email,
        role: role,
      };
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('userRole', role); // <-- IMPORTANT: Store role separately
      
      return { success: true, role };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  }

  async function logout() {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setUserRole(null);
      setUserProfile(null);
      localStorage.removeItem('user');
      localStorage.removeItem('userRole'); // <-- Remove role from localStorage
      localStorage.removeItem('userProfile');
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log(' Auth state changed:', user?.email);
      
      if (user) {
        setCurrentUser(user);
        
        // Get user role from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          let role = 'student';
          
          if (userDoc.exists()) {
            role = userDoc.data().role;
            const profileData = { uid: user.uid, ...userDoc.data() };
            setUserProfile(profileData);
            localStorage.setItem('userProfile', JSON.stringify(profileData));
            console.log(' Role from Firestore in auth change:', role);
          } else {
            // Check localStorage for role
            const storedRole = localStorage.getItem('userRole');
            if (storedRole) {
              role = storedRole;
              console.log(' Role from localStorage in auth change:', role);
            }
            const storedProfile = localStorage.getItem('userProfile');
            if (storedProfile) {
              setUserProfile(JSON.parse(storedProfile));
            }
          }
          
          setUserRole(role);
          
          // Update localStorage
          const userData = {
            uid: user.uid,
            email: user.email,
            role: role,
          };
          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('userRole', role);
          
        } catch (error) {
          console.error('Error fetching user role:', error);
          // Fallback to localStorage
          const storedRole = localStorage.getItem('userRole');
          if (storedRole) {
            setUserRole(storedRole);
          }
        }
      } else {
        console.log(' No user, clearing state');
        setCurrentUser(null);
        setUserRole(null);
        setUserProfile(null);
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userProfile');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Check localStorage on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedRole = localStorage.getItem('userRole');
    const storedProfile = localStorage.getItem('userProfile');
    
    console.log(' Checking localStorage:', { storedUser: !!storedUser, storedRole });
    
    if (storedUser && storedRole && !currentUser) {
      try {
        const userData = JSON.parse(storedUser);
        console.log(' Restoring from localStorage:', { email: userData.email, role: storedRole });
        setUserRole(storedRole);
        if (storedProfile) {
          setUserProfile(JSON.parse(storedProfile));
        }
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userProfile');
      }
    }
  }, [currentUser]);

  const value = {
    currentUser,
    userRole,
    userProfile,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
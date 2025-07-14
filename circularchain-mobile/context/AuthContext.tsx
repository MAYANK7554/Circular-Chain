import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { View, Text } from 'react-native';
import { auth } from '../firebaseConfig';
import {
  onAuthStateChanged,
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut
} from 'firebase/auth';

// Define the shape of the data and functions in our context
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
}

// Create the context, initializing it with null.
// This is a more robust pattern for TypeScript.
const AuthContext = createContext<AuthContextType | null>(null);

// The AuthProvider component that will wrap our app
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Function to sign up a new user
  const signUp = async (email: string, password: string) => {
    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      return result;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Function to sign in an existing user
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Function to sign out the current user
  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  // The value that will be available to all children components
  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Loading...</Text>
        </View>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

// A custom hook to easily access the auth context in other components
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  // This check is now crucial. It ensures we don't try to use the context
  // outside of the provider where its value would be null.
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

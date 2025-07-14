import React, { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { Text, View } from 'react-native';

const InitialLayout = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  console.log('InitialLayout render - loading:', loading, 'user:', user);

  useEffect(() => {
    console.log('InitialLayout useEffect - loading:', loading, 'user:', user);
    if (!loading) {
      if (user) {
        console.log('Redirecting to tabs');
        router.replace('/(tabs)');
      } else {
        console.log('Redirecting to login');
        router.replace('/login');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>App Loading...</Text>
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <InitialLayout />
    </AuthProvider>
  );
}
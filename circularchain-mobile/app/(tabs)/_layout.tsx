import { Stack } from 'expo-router';
import React from 'react';

export default function AppLayout() {
  // No more login check needed here
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerStyle: { backgroundColor: '#004c91' },
          headerTintColor: '#fff',
          headerTitle: 'CircularChain Associate App'
        }}
      />
      <Stack.Screen
        name="scanner"
        options={{
          headerStyle: { backgroundColor: '#004c91' },
          headerTintColor: '#fff',
          headerTitle: 'Scan Product QR Code',
          presentation: 'modal'
        }}
      />
    </Stack>
  );
}

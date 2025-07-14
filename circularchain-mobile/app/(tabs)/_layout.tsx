import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#004c91',
        tabBarInactiveTintColor: '#bbb',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#004c91',
          borderTopWidth: 2,
          height: 65,
          borderRadius: 18,
          marginHorizontal: 10,
          marginBottom: 10,
          shadowColor: '#004c91',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.12,
          shadowRadius: 8,
          elevation: 8,
        },
        headerStyle: { backgroundColor: '#004c91' },
        headerTintColor: '#fff',
        tabBarLabelStyle: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={28} color={color} />
          ),
          headerTitle: 'CircularChain Associate App',
        }}
      />
      <Tabs.Screen
        name="scanner"
        options={{
          title: 'Scanner',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'qr-code' : 'qr-code-outline'} size={28} color={color} />
          ),
          headerTitle: 'Scan Product QR Code',
        }}
      />
    </Tabs>
  );
}

import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function TabsLayout() {
  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
          }}
        />

        <Tabs.Screen
          name="explore"
          options={{
            title: 'Explore',
          }}
        />
      </Tabs>

      <StatusBar style="auto" />
    </>
  );
}
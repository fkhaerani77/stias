import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs 
      screenOptions={{ 
        headerShown: false,
        // PAKSA MATI DI SINI: Menghilangkan tab bar secara global untuk semua screen di folder ini
        tabBarStyle: { display: 'none' }, 
      }}
    >
      <Tabs.Screen
        name="mahasiswa/index" 
        options={{
          title: 'Home',
        }}
      />
    </Tabs>
  );
}
import React, { useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { Home, ScanSearch, Wrench, Car, Settings } from 'lucide-react-native';

import { OnboardingHealthScreen } from '@/screens/Onboarding/OnboardingHealthScreen';
import { OnboardingDiagnoseScreen } from '@/screens/Onboarding/OnboardingDiagnoseScreen';
import { OnboardingShopsScreen } from '@/screens/Onboarding/OnboardingShopsScreen';
import { AuthScreen } from '@/screens/Auth';
import { AddCarScreen } from '@/screens/AddCar';
import { HomeScreen } from '@/screens/Home';
import { DiagnoseScreen } from '@/screens/Diagnose';
import { ShopsScreen } from '@/screens/Shops';
import { MyCarScreen } from '@/screens/MyCar';
import { SettingsScreen } from '@/screens/Settings';
import { SubscriptionScreen } from '@/screens/Subscription';
import { Colors, Typography } from '@/constants/theme';
import { AuthProvider } from '@/contexts/AuthContext';
import { VehicleProvider } from '@/contexts/VehicleContext';

SplashScreen.preventAutoHideAsync();

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_ICON_SIZE = 24;

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.onSurfaceVariant,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopWidth: 0,
          borderTopColor: 'transparent',
          elevation: 8,
          shadowColor: '#1a1a1a',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 12,
          height: 60,
          paddingBottom: 0,
          paddingTop: 8,
        },
        tabBarIcon: ({ color, focused }) => {
          // Gray out the Shops tab icon to indicate it's not available yet
          const shopsColor = route.name === 'Shops' ? Colors.outlineVariant : color;
          
          const icons: Record<string, React.ReactNode> = {
            Home: <Home size={TAB_ICON_SIZE} color={color} strokeWidth={2} />,
            Diagnose: <ScanSearch size={TAB_ICON_SIZE} color={color} strokeWidth={2} />,
            Shops: <Wrench size={TAB_ICON_SIZE} color={shopsColor} strokeWidth={2} />,
            MyCar: <Car size={TAB_ICON_SIZE} color={color} strokeWidth={2} />,
            Settings: <Settings size={TAB_ICON_SIZE} color={color} strokeWidth={2} />,
          };
          
          return icons[route.name] ?? null;
        },
      })}
    >
      <Tab.Screen name="Home"     component={HomeScreen}     options={{ tabBarLabel: 'HOME' }} />
      <Tab.Screen name="Diagnose" component={DiagnoseScreen} options={{ tabBarLabel: 'DIAGNOSE' }} />
      <Tab.Screen name="MyCar"    component={MyCarScreen}    options={{ tabBarLabel: 'MY CAR' }} />
      <Tab.Screen name="Shops"    component={ShopsScreen}    options={{ tabBarLabel: 'SHOPS' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarLabel: 'SETTINGS' }} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Manrope_700Bold,
    Manrope_800ExtraBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <AuthProvider>
      <VehicleProvider>
        <SafeAreaProvider onLayout={onLayoutRootView}>
          <NavigationContainer
              theme={{ ...DefaultTheme, colors: { ...DefaultTheme.colors, border: 'transparent' } }}
            >
            <StatusBar style="dark" />
            <Stack.Navigator
              initialRouteName="OnboardingHealth"
              screenOptions={{
                headerShown: false,
                cardStyle: { backgroundColor: Colors.background },
              }}
            >
              <Stack.Screen name="OnboardingHealth"  component={OnboardingHealthScreen} />
              <Stack.Screen name="OnboardingDiagnose" component={OnboardingDiagnoseScreen} />
              <Stack.Screen name="OnboardingShops"   component={OnboardingShopsScreen} />
              <Stack.Screen name="Auth"              component={AuthScreen} />
              <Stack.Screen name="AddCar"            component={AddCarScreen} />
              <Stack.Screen name="MainApp"           component={MainTabs} />
              <Stack.Screen name="Subscription"      component={SubscriptionScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </SafeAreaProvider>
      </VehicleProvider>
    </AuthProvider>
  );
}

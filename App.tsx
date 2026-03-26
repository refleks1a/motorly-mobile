import React, { useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
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

import { OnboardingHealthScreen } from '@/screens/Onboarding/OnboardingHealthScreen';
import { OnboardingDiagnoseScreen } from '@/screens/Onboarding/OnboardingDiagnoseScreen';
import { OnboardingShopsScreen } from '@/screens/Onboarding/OnboardingShopsScreen';
import { AddCarScreen } from '@/screens/AddCar';

// Keep splash screen visible while fonts load
SplashScreen.preventAutoHideAsync();

const Stack = createStackNavigator();

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

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider onLayout={onLayoutRootView}>
      <NavigationContainer>
        <StatusBar style="dark" />
        <Stack.Navigator
          initialRouteName="OnboardingHealth"
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: '#f9f9f7' },
          }}
        >
          <Stack.Screen
            name="OnboardingHealth"
            component={OnboardingHealthScreen}
          />
          <Stack.Screen
            name="OnboardingDiagnose"
            component={OnboardingDiagnoseScreen}
          />
          <Stack.Screen
            name="OnboardingShops"
            component={OnboardingShopsScreen}
          />
          <Stack.Screen name="AddCar" component={AddCarScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

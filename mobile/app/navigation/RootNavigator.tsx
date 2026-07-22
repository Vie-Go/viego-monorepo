import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '../shared/theme/ThemeProvider';
import { useI18n } from '../shared/i18n/I18nProvider';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { Placeholder } from '../screens/Placeholder';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const { theme } = useTheme();
  const { t } = useI18n();
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.surface },
        headerTintColor: theme.text,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarStyle: { backgroundColor: theme.surface, borderTopColor: theme.border },
      }}
    >
      <Tab.Screen name="Map" options={{ title: t('tab.map') }}>
        {() => <Placeholder messageKey="placeholder.map" />}
      </Tab.Screen>
      <Tab.Screen name="Collection" options={{ title: t('tab.collection') }}>
        {() => <Placeholder messageKey="placeholder.collection" />}
      </Tab.Screen>
      <Tab.Screen name="Streak" options={{ title: t('tab.streak') }}>
        {() => <Placeholder messageKey="placeholder.streak" />}
      </Tab.Screen>
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: t('tab.profile') }} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const { themeName, theme } = useTheme();
  const navTheme = themeName === 'dark' ? DarkTheme : DefaultTheme;
  return (
    <NavigationContainer
      theme={{
        ...navTheme,
        colors: { ...navTheme.colors, background: theme.background, primary: theme.primary },
      }}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

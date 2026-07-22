import type { NativeStackScreenProps } from '@react-navigation/native-stack';

/** Auth stack → Main tabs. No real auth in Phase 0; the buttons just enter the shell. */
export type RootStackParamList = {
  Welcome: undefined;
  Main: undefined;
};

export type WelcomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

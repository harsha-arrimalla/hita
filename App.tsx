import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';

// Keep the splash screen visible while we fetch resources
// SplashScreen.preventAutoHideAsync();

// Suppress specific warnings
LogBox.ignoreLogs([
    'Expo AV has been deprecated',
    'VoiceManager.ts:1 [expo-av]',
    '[expo-av]',
]);

export default function App() {
    useEffect(() => {
        // Simple fire-and-forget hide for debugging
        setTimeout(() => {
            SplashScreen.hideAsync().catch(e => console.warn(e));
        }, 1000);
    }, []);

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <StatusBar style="auto" />
                <AppNavigator />
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}

import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Suppress specific warnings
LogBox.ignoreLogs([
    'Expo AV has been deprecated',
    'VoiceManager.ts:1 [expo-av]',
    '[expo-av]',
]);

export default function App() {
    useEffect(() => {
        async function prepare() {
            try {
                console.log('App: Starting prepare()...');
                // Artificially wait for a bit to show off the splash screen
                await new Promise(resolve => setTimeout(resolve, 2000));
                console.log('App: Finished waiting.');
            } catch (e) {
                console.warn('App: Error in prepare:', e);
            } finally {
                // Tell the application to render
                console.log('App: Hiding splash screen...');
                await SplashScreen.hideAsync();
                console.log('App: Splash screen hidden.');
            }
        }

        prepare();

        // Safety fallback: Force hide after 5 seconds no matter what
        const safetyTimeout = setTimeout(() => {
            console.log('App: Safety timeout triggered, hiding splash screen.');
            SplashScreen.hideAsync().catch(console.warn);
        }, 5000);

        return () => clearTimeout(safetyTimeout);
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

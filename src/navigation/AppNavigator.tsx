import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { ChatScreen } from '../components/chat/ChatScreen';
import { CustomDrawer } from '../components/navigation/CustomDrawer';
import { theme } from '../theme';
// Assuming we put ChatScreen directly as the main screen. 
// We will hide the Drawer's default header and let ChatScreen manage its own header or overlay.

const Drawer = createDrawerNavigator();

export const AppNavigator = () => {
    return (
        <NavigationContainer>
            <Drawer.Navigator
                drawerContent={(props) => <CustomDrawer {...props} />}
                screenOptions={{
                    headerShown: false, // We'll use our own headers or the ChatScreen's header
                    drawerType: 'slide', // Slide behavior
                    overlayColor: 'rgba(0,0,0,0.2)', // Semi-transparent overlay
                    drawerStyle: {
                        width: '80%', // Standard drawer width
                        backgroundColor: theme.colors.background,
                    },
                }}
            // In @react-navigation/drawer v6+, sceneContainerStyle is a prop of Navigator, not screenOptions.
            // However, if TS complains, we can check types. But standard usage is as a prop.
            // Actually, looking at types, likely my previous placement was just wrong.
            // If it still fails, I'll remove it as theme.colors.background is default usually.
            >
                <Drawer.Screen name="Chat" component={ChatScreen} />
            </Drawer.Navigator>
        </NavigationContainer>
    );
};

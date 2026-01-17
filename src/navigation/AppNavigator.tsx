import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import React, { useState } from 'react';
import { ChatScreen } from '../components/chat/ChatScreen';
import { CustomDrawer } from '../components/navigation/CustomDrawer';
import { EmergencyScreen } from '../screens/main/EmergencyScreen';
import { MyTripsScreen } from '../screens/main/MyTripsScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';
import { SavedPlacesScreen } from '../screens/main/SavedPlacesScreen';
import { theme } from '../theme';
import { AuthNavigator } from './AuthNavigator';

const Drawer = createDrawerNavigator();

const MainNavigator = () => (
    <Drawer.Navigator
        drawerContent={(props) => <CustomDrawer {...props} />}
        screenOptions={{
            headerShown: false,
            drawerType: 'slide',
            overlayColor: 'rgba(0,0,0,0.2)',
            drawerStyle: {
                width: '80%',
                backgroundColor: theme.colors.background,
            },
        }}
    >
        <Drawer.Screen name="Chat" component={ChatScreen} />
        <Drawer.Screen name="MyTrips" component={MyTripsScreen} />
        <Drawer.Screen name="Profile" component={ProfileScreen} />
        <Drawer.Screen name="SavedPlaces" component={SavedPlacesScreen} />
        <Drawer.Screen name="Emergency" component={EmergencyScreen} />
    </Drawer.Navigator>
);

export const AppNavigator = () => {
    // TODO: Connect this to actual Auth Context
    // For testing: Set true to see Chat, false to see Login
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    return (
        <NavigationContainer>
            {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
        </NavigationContainer>
    );
};

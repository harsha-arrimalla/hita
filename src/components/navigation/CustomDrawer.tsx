import { Ionicons } from '@expo/vector-icons';
import { DrawerContentComponentProps, DrawerItem } from '@react-navigation/drawer';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../theme';

export const CustomDrawer: React.FC<DrawerContentComponentProps> = (props) => {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <View style={styles.header}>
                <Text style={styles.branding}>Hita</Text>
                <Text style={styles.version}>v1.0</Text>
            </View>

            <ScrollView contentContainerStyle={styles.menuContainer}>
                <DrawerItem
                    icon={({ color, size }) => <Ionicons name="chatbubble-outline" size={size} color={color} />}
                    label="New Chat"
                    onPress={() => props.navigation.navigate('Chat')}
                    active={true}
                    labelStyle={styles.drawerLabel}
                    style={styles.drawerItem}
                    activeTintColor={theme.colors.primary}
                    inactiveTintColor={theme.colors.text.primary}
                />
                <DrawerItem
                    icon={({ color, size }) => <Ionicons name="airplane-outline" size={size} color={color} />}
                    label="My Trips"
                    onPress={() => props.navigation.navigate('MyTrips')}
                    labelStyle={styles.drawerLabel}
                    style={styles.drawerItem}
                    inactiveTintColor={theme.colors.text.primary}
                />
                <DrawerItem
                    icon={({ color, size }) => <Ionicons name="heart-outline" size={size} color={color} />}
                    label="Saved Places"
                    onPress={() => props.navigation.navigate('SavedPlaces')}
                    labelStyle={styles.drawerLabel}
                    style={styles.drawerItem}
                    inactiveTintColor={theme.colors.text.primary}
                />
                <DrawerItem
                    icon={({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />}
                    label="Profile"
                    onPress={() => props.navigation.navigate('Profile')}
                    labelStyle={styles.drawerLabel}
                    style={styles.drawerItem}
                    inactiveTintColor={theme.colors.text.primary}
                />
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.emergencyItem}
                    onPress={() => props.navigation.navigate('Emergency')}
                >
                    <View style={styles.emergencyIcon}>
                        <Ionicons name="warning-outline" size={20} color="#FF453A" />
                    </View>
                    <Text style={styles.emergencyText}>Emergency Mode</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingHorizontal: theme.spacing.s,
    },
    header: {
        paddingVertical: theme.spacing.xl,
        paddingHorizontal: theme.spacing.m,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
        marginBottom: theme.spacing.m,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
    },
    branding: {
        ...theme.typography.hita,
        fontSize: 28,
        color: theme.colors.text.primary,
    },
    version: {
        ...theme.typography.caption,
        color: theme.colors.text.secondary,
    },
    menuContainer: {
        flexGrow: 1,
    },
    drawerItem: {
        borderRadius: 12,
        marginVertical: 4,
    },
    drawerLabel: {
        fontSize: 16,
        marginLeft: -16,
        fontWeight: '500',
    },
    footer: {
        padding: theme.spacing.m,
    },
    emergencyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#FFF0F0',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#FFE5E5',
    },
    emergencyIcon: {
        marginRight: 12,
    },
    emergencyText: {
        color: '#FF453A',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

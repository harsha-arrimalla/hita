import { DrawerContentComponentProps } from '@react-navigation/drawer';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../theme';
// We'll use simple text/emojis if icons aren't set up, to be safe. 
// Or use standard expo vector icons.
import { Ionicons } from '@expo/vector-icons';

export const CustomDrawer: React.FC<DrawerContentComponentProps> = (props) => {
    const insets = useSafeAreaInsets();

    const menuItems = [
        { label: 'New Chat', icon: 'add-circle-outline', action: () => { } },
        { label: 'My Trips', icon: 'airplane-outline', action: () => { } },
        { label: 'Saved Tips', icon: 'bulb-outline', action: () => { }, disabled: true },
        { label: 'About Hita', icon: 'information-circle-outline', action: () => { } },
        { label: 'Privacy', icon: 'lock-closed-outline', action: () => { } },
    ];

    return (
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <View style={styles.header}>
                <Text style={styles.branding}>Hita</Text>
                <Text style={styles.version}>v1.0</Text>
            </View>

            <ScrollView contentContainerStyle={styles.menuContainer}>
                {menuItems.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[styles.menuItem, item.disabled && styles.menuItemDisabled]}
                        onPress={item.action}
                        disabled={item.disabled}
                    >
                        <Ionicons
                            name={item.icon as any}
                            size={24}
                            color={item.disabled ? theme.colors.text.secondary : theme.colors.text.primary}
                        />
                        <Text style={[styles.menuLabel, item.disabled && styles.menuLabelDisabled]}>
                            {item.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <View style={styles.footer}>
                <Text style={styles.footerText}>Made with calm.</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background, // Match app background
        paddingHorizontal: theme.spacing.l,
    },
    header: {
        paddingVertical: theme.spacing.xl,
        paddingHorizontal: theme.spacing.s,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
        marginBottom: theme.spacing.l,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
    },
    branding: {
        ...theme.typography.hita, // Serif
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
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.spacing.m + 4, // Large tap target (approx 48-56px)
        paddingHorizontal: theme.spacing.s,
        // No background, clean look
    },
    menuItemDisabled: {
        opacity: 0.5,
    },
    menuLabel: {
        marginLeft: theme.spacing.m,
        ...theme.typography.user, // Sans-serif
        fontSize: 18, // Large readable text
        color: theme.colors.text.primary,
    },
    menuLabelDisabled: {
        color: theme.colors.text.secondary,
    },
    footer: {
        padding: theme.spacing.m,
        alignItems: 'center',
    },
    footerText: {
        ...theme.typography.caption,
        color: 'rgba(0,0,0,0.2)',
    },
});

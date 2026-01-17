import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Image, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../theme';

export const ProfileScreen = () => {
    const navigation = useNavigation<any>();
    const [notifications, setNotifications] = React.useState(true);
    const [darkMode, setDarkMode] = React.useState(false);

    const renderSettingItem = (icon: any, title: string, value?: boolean, onToggle?: (val: boolean) => void, isDestructive = false) => (
        <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
                <View style={[styles.iconBox, isDestructive && styles.destructiveIconBox]}>
                    <Ionicons name={icon} size={20} color={isDestructive ? '#FF453A' : theme.colors.text.primary} />
                </View>
                <Text style={[styles.settingText, isDestructive && styles.destructiveText]}>{title}</Text>
            </View>
            {onToggle ? (
                <Switch
                    value={value}
                    onValueChange={onToggle}
                    trackColor={{ false: '#eee', true: theme.colors.primary }}
                    thumbColor={'#fff'}
                />
            ) : (
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.menuButton}>
                    <Ionicons name="menu-outline" size={28} color={theme.colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profile</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?fit=crop&w=200&h=200' }}
                        style={styles.avatar}
                    />
                    <View style={styles.profileInfo}>
                        <Text style={styles.name}>Harsha Arrimalla</Text>
                        <Text style={styles.email}>harsha@example.com</Text>
                        <TouchableOpacity style={styles.editButton}>
                            <Text style={styles.editButtonText}>Edit Profile</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Settings Section */}
                <Text style={styles.sectionHeader}>Preferences</Text>
                <View style={styles.section}>
                    {renderSettingItem("notifications-outline", "Push Notifications", notifications, setNotifications)}
                    {renderSettingItem("moon-outline", "Dark Mode", darkMode, setDarkMode)}
                    {renderSettingItem("language-outline", "Language")}
                </View>

                <Text style={styles.sectionHeader}>Support</Text>
                <View style={styles.section}>
                    {renderSettingItem("help-circle-outline", "Help Center")}
                    {renderSettingItem("shield-checkmark-outline", "Privacy Policy")}
                    {renderSettingItem("lock-closed-outline", "Change Password")}
                </View>

                <View style={styles.section}>
                    {renderSettingItem("log-out-outline", "Log Out", undefined, undefined, true)}
                </View>

                <Text style={styles.version}>Version 1.0.0 (Beta)</Text>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    menuButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
    },
    content: {
        padding: 24,
    },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 24,
        marginBottom: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    avatar: {
        width: 70,
        height: 70,
        borderRadius: 35,
        marginRight: 16,
    },
    profileInfo: {
        flex: 1,
    },
    name: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
        marginBottom: 4,
    },
    email: {
        fontSize: 14,
        color: '#888',
        marginBottom: 8,
    },
    editButton: {
        backgroundColor: '#F5F5F5',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    editButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.colors.text.primary,
    },
    sectionHeader: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#999',
        textTransform: 'uppercase',
        marginBottom: 12,
        marginLeft: 8,
        letterSpacing: 1,
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 8,
        marginBottom: 24,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: '#F9F9F9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    destructiveIconBox: {
        backgroundColor: '#FFE5E5',
    },
    settingText: {
        fontSize: 16,
        fontWeight: '500',
        color: theme.colors.text.primary,
    },
    destructiveText: {
        color: '#FF453A',
    },
    version: {
        textAlign: 'center',
        color: '#ccc',
        fontSize: 12,
        marginTop: 8,
    },
});

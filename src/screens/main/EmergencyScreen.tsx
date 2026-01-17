import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const EmergencyScreen = () => {
    const navigation = useNavigation<any>();

    const handleSOS = () => {
        // In a real app, this would call 112 or local emergency
        Linking.openURL('tel:112');
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.menuButton}>
                    <Ionicons name="menu-outline" size={28} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Emergency Mode</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>
                <View style={styles.statusContainer}>
                    <View style={styles.pulseDisk}>
                        <Ionicons name="shield-checkmark" size={64} color="#fff" />
                    </View>
                    <Text style={styles.statusText}>Safety Watch Active</Text>
                    <Text style={styles.subText}>Hita is monitoring your location status</Text>
                </View>

                {/* Big SOS Button */}
                <TouchableOpacity style={styles.sosButton} onPress={handleSOS} activeOpacity={0.8}>
                    <View style={styles.sosInner}>
                        <Text style={styles.sosText}>SOS</Text>
                        <Text style={styles.sosSub}>Tap for Help</Text>
                    </View>
                </TouchableOpacity>

                {/* Quick Actions */}
                <View style={styles.actionsContainer}>
                    <TouchableOpacity style={styles.actionButton}>
                        <Ionicons name="people" size={24} color="#333" />
                        <Text style={styles.actionText}>Share Location</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                        <Ionicons name="call" size={24} color="#333" />
                        <Text style={styles.actionText}>Fake Call</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FF453A', // Red background for emergency feel
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
        color: '#fff',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingBottom: 40,
    },
    statusContainer: {
        alignItems: 'center',
    },
    pulseDisk: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.4)',
    },
    statusText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    subText: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
    },
    sosButton: {
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    sosInner: {
        alignItems: 'center',
    },
    sosText: {
        fontSize: 48,
        fontWeight: '900',
        color: '#FF453A',
        letterSpacing: 2,
    },
    sosSub: {
        fontSize: 14,
        color: '#FF453A',
        fontWeight: '600',
        marginTop: 4,
    },
    actionsContainer: {
        flexDirection: 'row',
        gap: 20,
    },
    actionButton: {
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderRadius: 30,
        gap: 8,
    },
    actionText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
});

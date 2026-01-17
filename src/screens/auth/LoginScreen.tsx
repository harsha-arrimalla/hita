import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../theme';

export const LoginScreen = () => {
    const navigation = useNavigation<any>();
    const { login } = useAuth();

    const handleLogin = () => {
        // TODO: Validate inputs
        login();
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backText}>← Back</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.form}>
                <Text style={styles.title}>Welcome Back</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="#999"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#999"
                    secureTextEntry
                />

                <TouchableOpacity style={styles.button} onPress={handleLogin}>
                    <Text style={styles.buttonText}>Log In</Text>
                </TouchableOpacity>

                <View style={styles.footer}>
                    <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                        <Text style={styles.footerText}>
                            Don't have an account? <Text style={styles.link}>Sign Up</Text>
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.skipButton} onPress={login}>
                        <Text style={styles.skipText}>Skip for now</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        padding: 24,
    },
    header: {
        marginBottom: 32,
    },
    backText: {
        fontSize: 16,
        color: theme.colors.text.secondary,
    },
    form: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
        marginBottom: 32,
        fontFamily: theme.typography.hita.fontFamily,
    },
    input: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#eee',
    },
    button: {
        backgroundColor: theme.colors.primary,
        padding: 18,
        borderRadius: 30,
        alignItems: 'center',
        marginTop: 16,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    footer: {
        marginTop: 32,
        alignItems: 'center',
        gap: 16,
    },
    footerText: {
        color: theme.colors.text.secondary,
        fontSize: 14,
    },
    link: {
        color: theme.colors.primary,
        fontWeight: 'bold',
    },
    skipButton: {
        padding: 8,
    },
    skipText: {
        color: '#999',
        fontSize: 14,
        textDecorationLine: 'underline',
    },
});

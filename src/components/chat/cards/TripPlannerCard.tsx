import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { theme } from '../../../theme';

interface Props {
    onSubmit: (details: string) => void;
    initialDestination?: string;
    initialOrigin?: string;
}

const TRAVELERS_OPTIONS = ['Solo', 'Couple', 'Friends', 'Family'];

export const TripPlannerCard: React.FC<Props> = ({ onSubmit, initialDestination = '', initialOrigin = '' }) => {
    const [destination, setDestination] = useState(initialDestination);
    const [origin, setOrigin] = useState(initialOrigin);
    const [duration, setDuration] = useState('');
    const [budget, setBudget] = useState('');
    const [travelers, setTravelers] = useState('Couple');

    const handlePlan = () => {
        if (!destination || !origin || !duration || !budget) return; // Basic validation
        const prompt = `Plan a ${duration}-day trip to ${destination} from ${origin} for a ${travelers} trip with a budget of ${budget}.`;
        onSubmit(prompt);
    };

    return (
        <View style={styles.card}>
            <Text style={styles.title}>Let's Plan It! ✈️</Text>

            {/* Destination Input */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Where to?</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g. Goa, Paris"
                    placeholderTextColor={theme.colors.text.secondary}
                    value={destination}
                    onChangeText={setDestination}
                />
            </View>

            {/* Origin Input */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Flying from?</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g. Mumbai, Delhi"
                    placeholderTextColor={theme.colors.text.secondary}
                    value={origin}
                    onChangeText={setOrigin}
                />
            </View>

            <View style={styles.row}>
                {/* Duration Input */}
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.label}>Days?</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="3"
                        placeholderTextColor={theme.colors.text.secondary}
                        keyboardType="numeric"
                        value={duration}
                        onChangeText={setDuration}
                    />
                </View>

                {/* Budget Input */}
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.label}>Budget?</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="30k"
                        placeholderTextColor={theme.colors.text.secondary}
                        value={budget}
                        onChangeText={setBudget}
                    />
                </View>
            </View>

            {/* Travelers Chips */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Who's coming?</Text>
                <View style={styles.chipContainer}>
                    {TRAVELERS_OPTIONS.map((opt) => (
                        <TouchableOpacity
                            key={opt}
                            style={[
                                styles.chip,
                                travelers === opt && styles.chipActive
                            ]}
                            onPress={() => setTravelers(opt)}
                        >
                            <Text
                                style={[
                                    styles.chipText,
                                    travelers === opt && styles.chipTextActive
                                ]}
                            >
                                {opt}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity style={styles.button} onPress={handlePlan}>
                <Text style={styles.buttonText}>Generate Plan ✨</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 16,
        marginVertical: 8,
        width: '100%',
        alignSelf: 'center',
        // Soft Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 4,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.text.primary,
        marginBottom: 16,
        fontFamily: theme.typography.hita.fontFamily,
    },
    inputGroup: {
        marginBottom: 12,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    label: {
        fontSize: 12,
        color: theme.colors.text.secondary,
        marginBottom: 6,
        fontWeight: '500',
    },
    input: {
        backgroundColor: '#F7F7F5', // Light Warm Grey
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        color: theme.colors.text.primary,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F0F0F0',
    },
    chipActive: {
        backgroundColor: theme.colors.primary, // Brand color (Orange/Warm)
    },
    chipText: {
        fontSize: 14,
        color: theme.colors.text.secondary,
    },
    chipTextActive: {
        color: '#fff',
        fontWeight: '600',
    },
    button: {
        backgroundColor: theme.colors.text.primary, // Dark button
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

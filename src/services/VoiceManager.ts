import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';

class VoiceManager {
    private recording: Audio.Recording | null = null;
    private isSpeaking: boolean = false;

    // --- Permissions ---
    async requestPermissions() {
        const { status } = await Audio.requestPermissionsAsync();
        return status === 'granted';
    }

    // --- Text to Speech (Speaking) ---
    async speak(text: string, onStart?: () => void, onDone?: () => void) {
        if (this.isSpeaking) {
            Speech.stop();
        }

        this.isSpeaking = true;
        onStart?.();

        Speech.speak(text, {
            language: 'en-US', // Default to English US
            pitch: 1.0,
            rate: 1.0,
            onDone: () => {
                this.isSpeaking = false;
                onDone?.();
            },
            onStopped: () => {
                this.isSpeaking = false;
                onDone?.();
            },
            onError: () => {
                this.isSpeaking = false;
                onDone?.();
            }
        });
    }

    stopSpeaking() {
        Speech.stop();
        this.isSpeaking = false;
    }

    // --- Audio Recording (Hearing) ---
    async startRecording() {
        try {
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );
            this.recording = recording;
            return true;
        } catch (err) {
            console.error('Failed to start recording', err);
            return false;
        }
    }

    async stopRecording(): Promise<string | null> {
        if (!this.recording) return null;

        await this.recording.stopAndUnloadAsync();
        const uri = this.recording.getURI();
        this.recording = null;

        // Reset audio mode
        await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
        });

        return uri;
    }
}

export const voiceManager = new VoiceManager();

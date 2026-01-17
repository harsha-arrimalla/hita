
import { Audio } from 'expo-av';
import { Platform } from 'react-native';

class VoiceManagerService {
    private recording: Audio.Recording | null = null;
    private sound: Audio.Sound | null = null;
    private isRecording = false;

    // 1. Setup Audio Mode (iOS needs specific config to record)
    async setup() {
        try {
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
                shouldDuckAndroid: true,
                playThroughEarpieceAndroid: false,
            });
        } catch (e) {
            console.error("Voice Setup Error:", e);
        }
    }

    // 2. Start Recording
    async startRecording(): Promise<boolean> {
        try {
            console.log("VoiceManager: Requesting Permissions...");
            const permission = await Audio.requestPermissionsAsync();
            console.log("VoiceManager: Permission Status:", permission.status);

            if (permission.status !== 'granted') {
                console.error("VoiceManager: Permission Denied!");
                return false;
            }

            console.log("VoiceManager: Setting up Audio Mode...");
            await this.setup();

            console.log("VoiceManager: Creating Recording...");
            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );
            this.recording = recording;
            this.isRecording = true;
            console.log("VoiceManager: Recording Started!");
            return true;
        } catch (e) {
            console.error("Start Recording Error:", e);
            return false;
        }
    }

    // 3. Stop Recording & Get URI
    async stopRecording(): Promise<string | null> {
        try {
            if (!this.recording) return null;

            this.isRecording = false;
            await this.recording.stopAndUnloadAsync();
            const uri = this.recording.getURI();
            this.recording = null; // Reset
            return uri;
        } catch (e) {
            console.error("Stop Recording Error:", e);
            return null;
        }
    }

    // 4. Play Audio (for testing / response)
    async playAudio(uri: string) {
        try {
            const { sound } = await Audio.Sound.createAsync({ uri });
            this.sound = sound;
            await sound.playAsync();
        } catch (e) {
            console.error("Play Audio Error:", e);
        }
    }

    // 5. Upload Audio to Backend
    async uploadAudio(uri: string): Promise<{ transcription: string, replies: string[], uiAction?: any } | null> {
        try {
            const formData = new FormData();
            formData.append('audio', {
                uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
                name: 'recording.m4a',
                type: 'audio/m4a',
            } as any);

            const response = await fetch('http://localhost:3000/chat/voice', {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (!response.ok) throw new Error("Upload Failed");

            const data = await response.json();
            return data;
        } catch (e) {
            console.error("Upload Error:", e);
            return null;
        }
    }
}

export const VoiceManager = new VoiceManagerService();

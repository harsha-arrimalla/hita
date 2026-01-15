import { EmotionalScript } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

export class HitaHeartService {

    /**
     * Retrieves a therapeutic script based on the detected emotional category.
     * Categories: 'anxiety', 'panic', 'loneliness', 'fear'
     */
    async getEmotionalScript(category: string): Promise<EmotionalScript | null> {
        try {
            const script = await prisma.emotionalScript.findFirst({
                where: {
                    triggerCategory: {
                        contains: category.toLowerCase()
                    }
                }
            });
            return script;
        } catch (error) {
            console.error('Error fetching emotional script:', error);
            return null;
        }
    }

    /**
     * Detects emotional keywords in user message.
     * Returns the primary category detected, or null.
     */
    detectEmotion(message: string): string | null {
        const lowerMsg = message.toLowerCase();

        if (lowerMsg.includes('panic') || lowerMsg.includes('can\'t breathe') || lowerMsg.includes('dying')) {
            return 'panic';
        }
        if (lowerMsg.includes('anxious') || lowerMsg.includes('anxiety') || lowerMsg.includes('scared') || lowerMsg.includes('worried')) {
            return 'anxiety';
        }
        if (lowerMsg.includes('lonely') || lowerMsg.includes('alone') || lowerMsg.includes('homesick')) {
            return 'loneliness';
        }

        return null;
    }
}

export const hitaHeart = new HitaHeartService();

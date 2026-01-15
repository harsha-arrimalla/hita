export interface Message {
    id: string;
    text: string;
    sender: 'user' | 'hita';
    timestamp: number;
    uiAction?: {
        type: 'safety_card' | 'therapy_card' | 'fare_card';
        data: any;
    };
}

export interface ChatState {
    messages: Message[];
    isTyping: boolean;
}

export interface Message {
    id: string;
    text: string;
    sender: 'user' | 'hita';
    timestamp: number;
    uiAction?: {
        type: 'safety_card' | 'therapy_card' | 'fare_card' | 'trip_planner_card' | 'trip_result_card' | 'place_carousel' | 'transit_card' | 'weather_card';
        data: any;
    };
}

export interface ChatState {
    messages: Message[];
    isTyping: boolean;
}

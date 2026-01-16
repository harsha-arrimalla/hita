export interface ChatRequest {
    message: string;
    sessionId: string;
    userLocation?: {
        lat: number;
        lon: number;
    };
    tripContext?: {
        city?: string;
        budget?: string;
        travel_type?: string;
    };
}

export interface ChatResponse {
    reply: string;
    state: string;
}

export interface SessionData {
    lastQuestion?: string;
    context: {
        dates?: string;
        originCity?: string;
        budget?: string;
        proactiveInfo?: string;
    };
    history: Array<{ role: 'user' | 'model'; parts: string }>;
}

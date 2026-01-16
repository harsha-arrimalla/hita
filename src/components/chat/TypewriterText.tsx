import React, { useEffect, useState } from 'react';
import { Text, TextStyle } from 'react-native';

interface Props {
    text: string;
    style?: TextStyle | TextStyle[];
    speed?: number;
    onComplete?: () => void;
}

export const TypewriterText: React.FC<Props> = ({ text, style, speed = 15, onComplete }) => {
    const [displayedText, setDisplayedText] = useState('');

    useEffect(() => {
        let currentIndex = 0;
        setDisplayedText(''); // Reset on text change

        const interval = setInterval(() => {
            if (currentIndex <= text.length) {
                setDisplayedText(text.slice(0, currentIndex));
                currentIndex++;
            } else {
                clearInterval(interval);
                if (onComplete) onComplete();
            }
        }, speed);

        return () => clearInterval(interval);
    }, [text, speed, onComplete]);

    return (
        <Text style={style}>
            {displayedText}
        </Text>
    );
};

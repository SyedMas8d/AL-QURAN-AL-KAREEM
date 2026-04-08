import React from 'react';
import { Text } from 'react-native';

/**
 * Component to render text with simple HTML tags like <b></b>
 * @param {string} children - Text content with HTML tags
 * @param {object} style - Base text style
 * @param {object} boldStyle - Additional style for bold text
 */
export default function RichText({ children, style, boldStyle }) {
    if (!children || typeof children !== 'string') {
        return <Text style={style}>{children}</Text>;
    }

    // Parse text with <b></b> tags
    const parseBoldText = (text) => {
        const parts = [];
        const regex = /<b>(.*?)<\/b>/g;
        let lastIndex = 0;
        let match;

        while ((match = regex.exec(text)) !== null) {
            // Add text before the <b> tag
            if (match.index > lastIndex) {
                parts.push({
                    text: text.substring(lastIndex, match.index),
                    bold: false,
                });
            }

            // Add bold text
            parts.push({
                text: match[1],
                bold: true,
            });

            lastIndex = regex.lastIndex;
        }

        // Add remaining text after last <b> tag
        if (lastIndex < text.length) {
            parts.push({
                text: text.substring(lastIndex),
                bold: false,
            });
        }

        return parts.length > 0 ? parts : [{ text: text, bold: false }];
    };

    const parts = parseBoldText(children);

    return (
        <Text style={style}>
            {parts.map((part, index) => (
                <Text key={index} style={part.bold ? [style, { fontWeight: 'bold' }, boldStyle] : style}>
                    {part.text}
                </Text>
            ))}
        </Text>
    );
}

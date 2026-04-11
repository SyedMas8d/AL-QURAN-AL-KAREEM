import React from 'react';
import { Text } from 'react-native';

/**
 * Component to render text with simple HTML tags like <b></b> and <i></i>
 * @param {string} children - Text content with HTML tags
 * @param {object} style - Base text style
 * @param {object} boldStyle - Additional style for bold text
 * @param {object} italicStyle - Additional style for italic text
 */
export default function RichText({ children, style, boldStyle, italicStyle }) {
    if (!children || typeof children !== 'string') {
        return <Text style={style}>{children}</Text>;
    }

    // Parse text with <b></b> and <i></i> tags
    const parseRichText = (text) => {
        const parts = [];
        const regex = /<b>(.*?)<\/b>|<i>(.*?)<\/i>/g;
        let lastIndex = 0;
        let match;

        while ((match = regex.exec(text)) !== null) {
            // Add text before the tag
            if (match.index > lastIndex) {
                parts.push({
                    text: text.substring(lastIndex, match.index),
                    bold: false,
                    italic: false,
                });
            }

            // Add formatted text (bold or italic)
            if (match[1] !== undefined) {
                // Bold text
                parts.push({
                    text: match[1],
                    bold: true,
                    italic: false,
                });
            } else if (match[2] !== undefined) {
                // Italic text
                parts.push({
                    text: match[2],
                    bold: false,
                    italic: true,
                });
            }

            lastIndex = regex.lastIndex;
        }

        // Add remaining text after last tag
        if (lastIndex < text.length) {
            parts.push({
                text: text.substring(lastIndex),
                bold: false,
                italic: false,
            });
        }

        return parts.length > 0 ? parts : [{ text: text, bold: false, italic: false }];
    };

    const parts = parseRichText(children);

    return (
        <Text style={style}>
            {parts.map((part, index) => {
                const textStyle = [style];

                if (part.bold) {
                    textStyle.push({ fontWeight: 'bold' });
                    if (boldStyle) textStyle.push(boldStyle);
                }

                if (part.italic) {
                    textStyle.push({ fontStyle: 'italic' });
                    if (italicStyle) textStyle.push(italicStyle);
                }

                return (
                    <Text key={index} style={textStyle}>
                        {part.text}
                    </Text>
                );
            })}
        </Text>
    );
}

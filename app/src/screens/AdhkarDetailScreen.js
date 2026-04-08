import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { getAudioSource } from '../utils/audioAssets';

// Helper function to render text with <b> tags as bold
const renderTextWithBold = (text, style, boldStyle) => {
    if (!text) return null;

    // Split by <b> and </b> tags
    const parts = text.split(/(<b>|<\/b>)/);
    let isBold = false;
    const elements = [];

    parts.forEach((part, index) => {
        if (part === '<b>') {
            isBold = true;
        } else if (part === '</b>') {
            isBold = false;
        } else if (part) {
            elements.push(
                <Text key={index} style={isBold ? [style, boldStyle] : style}>
                    {part}
                </Text>
            );
        }
    });

    return <Text style={style}>{elements}</Text>;
};

export default function AdhkarDetailScreen({ route }) {
    const { item, title } = route.params;
    const [sound, setSound] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        return sound
            ? () => {
                  sound.unloadAsync();
              }
            : undefined;
    }, [sound]);

    const playAudio = async () => {
        try {
            if (isPlaying) {
                // Pause if already playing
                if (sound) {
                    await sound.pauseAsync();
                    setIsPlaying(false);
                }
            } else {
                // Stop previous audio if any
                if (sound) {
                    await sound.stopAsync();
                    await sound.unloadAsync();
                }

                setIsLoading(true);

                // Get the audio source (local or remote)
                const audioSource = getAudioSource(item.audio);

                if (!audioSource) {
                    // Audio file not available
                    setIsLoading(false);
                    console.warn('Audio file not available yet');
                    return;
                }

                const { sound: newSound } = await Audio.Sound.createAsync(audioSource);

                setSound(newSound);
                setIsPlaying(true);
                setIsLoading(false);

                await newSound.playAsync();

                newSound.setOnPlaybackStatusUpdate((status) => {
                    if (status.didJustFinish) {
                        setIsPlaying(false);
                    }
                });
            }
        } catch (error) {
            console.error('Error playing audio:', error);
            setIsLoading(false);
            setIsPlaying(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>{title}</Text>
                    {item.description &&
                        renderTextWithBold(item.description, styles.headerDescription, styles.boldText)}
                </View>

                {/* Audio Player */}
                {item.audio && item.audio !== '' && (
                    <View style={styles.audioContainer}>
                        <TouchableOpacity style={styles.audioPlayer} onPress={playAudio} activeOpacity={0.7}>
                            {isLoading ? (
                                <ActivityIndicator size="small" color="#2E8B57" />
                            ) : (
                                <Ionicons name={isPlaying ? 'pause-circle' : 'play-circle'} size={28} color="#2E8B57" />
                            )}
                            <View style={styles.audioTextContainer}>
                                <Text style={styles.audioPlayerTextMain}>
                                    {isPlaying ? 'ஒலியை நிறுத்து' : 'ஒலியைக் கேளுங்கள்'}
                                </Text>
                                <Text style={styles.audioPlayerTextSub}>
                                    {isPlaying ? 'இயக்கத்தில்...' : 'தட்டவும்'}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Arabic Text */}
                {item.arabic && (
                    <View style={styles.arabicContainer}>
                        <Text style={styles.arabicText}>{item.arabic}</Text>
                    </View>
                )}

                {/* Tamil Transliteration */}
                {item.tamilTransliteration && item.tamilTransliteration.trim() !== '' && (
                    <View style={styles.transliterationContainer}>
                        <Ionicons name="leaf-outline" size={16} color="#8B4513" style={styles.leafIcon} />
                        <Text style={styles.transliterationText}>{item.tamilTransliteration}</Text>
                    </View>
                )}

                {/* Tamil Translation */}
                {item.tamilTranslation && (
                    <View style={styles.translationContainer}>
                        <Text style={styles.translationText}>{item.tamilTranslation}</Text>
                    </View>
                )}

                {/* Hadith */}
                {item.hadith && item.hadith.trim() !== '' && (
                    <View style={styles.hadithContainer}>
                        <View style={styles.hadithHeader}>
                            <Ionicons name="book" size={16} color="#8B4513" />
                            <Text style={styles.hadithHeaderText}>ஹதீஸ்</Text>
                        </View>
                        <Text style={styles.hadithText}>{item.hadith}</Text>
                    </View>
                )}

                {/* Reference */}
                {item.ref && (
                    <View style={styles.referenceContainer}>
                        <Ionicons name="bookmark-outline" size={14} color="#888" />
                        <Text style={styles.referenceText}>{item.ref}</Text>
                    </View>
                )}

                {/* Note */}
                {item.note && item.note.trim() !== '' && (
                    <View style={styles.noteContainer}>
                        <View style={styles.noteHeader}>
                            <Ionicons name="bulb" size={18} color="#FFA500" />
                            <Text style={styles.noteHeaderText}>குறிப்பு</Text>
                        </View>
                        <Text style={styles.noteText}>{item.note}</Text>
                    </View>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    scrollView: {
        flex: 1,
    },
    header: {
        backgroundColor: '#fff',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1A5F3E',
        marginBottom: 8,
        lineHeight: 28,
    },
    headerDescription: {
        fontSize: 15,
        color: '#555',
        lineHeight: 22,
    },
    boldText: {
        fontWeight: 'bold',
        color: '#1A5F3E',
    },
    audioContainer: {
        paddingHorizontal: 16,
        marginTop: 16,
    },
    audioPlayer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        marginBottom: 12,
        backgroundColor: '#E8F5E9',
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#2E8B57',
        borderStyle: 'dashed',
    },
    audioTextContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        marginLeft: 8,
    },
    audioPlayerTextMain: {
        fontSize: 15,
        color: '#2E8B57',
        fontWeight: '600',
        textAlign: 'center',
    },
    audioPlayerTextSub: {
        fontSize: 12,
        color: '#999',
        textAlign: 'center',
        marginTop: 2,
    },
    arabicContainer: {
        backgroundColor: '#FFF8DC',
        padding: 20,
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#8B4513',
    },
    arabicText: {
        fontSize: 24,
        lineHeight: 42,
        color: '#1A5F3E',
        textAlign: 'right',
        fontWeight: '500',
    },
    transliterationContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#F5F5DC',
        padding: 16,
        marginHorizontal: 16,
        marginTop: 12,
        borderRadius: 12,
    },
    leafIcon: {
        marginRight: 8,
        marginTop: 2,
    },
    transliterationText: {
        flex: 1,
        fontSize: 15,
        lineHeight: 24,
        color: '#555',
    },
    translationContainer: {
        backgroundColor: '#fff',
        padding: 18,
        marginHorizontal: 16,
        marginTop: 12,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#2E8B57',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    translationText: {
        fontSize: 16,
        lineHeight: 26,
        color: '#333',
        textAlign: 'left',
    },
    hadithContainer: {
        backgroundColor: '#FFF9F0',
        padding: 16,
        marginHorizontal: 16,
        marginTop: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#D4A574',
    },
    hadithHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    hadithHeaderText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#8B4513',
        marginLeft: 6,
    },
    hadithText: {
        fontSize: 14,
        lineHeight: 22,
        color: '#555',
        fontStyle: 'italic',
    },
    referenceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginTop: 12,
        marginHorizontal: 16,
    },
    referenceText: {
        fontSize: 13,
        color: '#888',
        fontStyle: 'italic',
        marginLeft: 6,
    },
    noteContainer: {
        backgroundColor: '#FFF9E6',
        padding: 16,
        marginHorizontal: 16,
        marginTop: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#FFD700',
    },
    noteHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    noteHeaderText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFA500',
        marginLeft: 6,
    },
    noteText: {
        fontSize: 14,
        lineHeight: 22,
        color: '#555',
    },
});

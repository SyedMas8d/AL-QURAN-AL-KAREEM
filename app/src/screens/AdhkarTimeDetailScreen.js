import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer } from 'expo-audio';
import * as Clipboard from 'expo-clipboard';
import { getAudioSource } from '../utils/audioAssets';

export default function AdhkarTimeDetailScreen({ route }) {
    const { type, title, data } = route.params;
    const [playingAudios, setPlayingAudios] = useState({});
    const [loadingAudios, setLoadingAudios] = useState({});

    useEffect(() => {
        return () => {
            // Cleanup: stop all audios when component unmounts
            Object.values(playingAudios).forEach(({ sound }) => {
                if (sound) {
                    sound.stopAsync();
                }
            });
        };
    }, [playingAudios]);

    const toggleAudio = async (index, audioPath) => {
        const audioKey = `${type}-${index}`;

        if (!audioPath) {
            return;
        }

        const audioSource = getAudioSource(audioPath);
        if (!audioSource) {
            return;
        }

        try {
            if (playingAudios[audioKey]) {
                // Stop the audio
                const { sound } = playingAudios[audioKey];
                await sound.stopAsync();
                await sound.stopAsync();
                setPlayingAudios((prev) => {
                    const newState = { ...prev };
                    delete newState[audioKey];
                    return newState;
                });
            } else {
                // Start the audio
                setLoadingAudios((prev) => ({ ...prev, [audioKey]: true }));
                const { sound: player } = await Audio.Sound.createAsync(audioSource, { shouldPlay: true });

                player.setOnPlaybackStatusUpdate((status) => {
                    if (status.didJustFinish) {
                        setPlayingAudios((prev) => {
                            const newState = { ...prev };
                            delete newState[audioKey];
                            return newState;
                        });
                        player.stopAsync();
                    }
                });

                setPlayingAudios((prev) => ({ ...prev, [audioKey]: { sound: player } }));
                setLoadingAudios((prev) => ({ ...prev, [audioKey]: false }));
            }
        } catch (error) {
            console.error('Error playing audio:', error);
            setLoadingAudios((prev) => ({ ...prev, [audioKey]: false }));
        }
    };

    const copyToClipboard = async (item) => {
        try {
            let textToCopy = '';

            // Add Arabic text
            if (item.arabic) {
                textToCopy += `${item.arabic}\n\n`;
            }

            // Add Tamil transliteration
            if (item.tamilTransliteration) {
                textToCopy += `${item.tamilTransliteration}\n\n`;
            }

            // Add Tamil translation
            if (item.tamilTranslation) {
                textToCopy += `${item.tamilTranslation}`;
            }

            // Add reference if available
            if (item.ref) {
                textToCopy += `\n\n— ${item.ref}`;
            }

            // Add source attribution
            textToCopy += `\n\nSource: https://al-quran-al-kareem-seven.vercel.app/`;

            await Clipboard.setStringAsync(textToCopy);
            Alert.alert('நகலெடுக்கப்பட்டது', 'திக்ர் உங்கள் கிளிப்போர்டுக்கு நகலெடுக்கப்பட்டது', [
                { text: 'சரி', style: 'default' },
            ]);
        } catch (error) {
            console.error('Error copying to clipboard:', error);
            Alert.alert('பிழை', 'நகலெடுக்க முடியவில்லை');
        }
    };

    const shareContent = async (item) => {
        try {
            let textToShare = '';

            // Add title if available
            if (item.title) {
                textToShare += `${item.title}\n\n`;
            }

            // Add Arabic text
            if (item.arabic) {
                textToShare += `${item.arabic}\n\n`;
            }

            // Add Tamil transliteration
            if (item.tamilTransliteration) {
                textToShare += `${item.tamilTransliteration}\n\n`;
            }

            // Add Tamil translation
            if (item.tamilTranslation) {
                textToShare += `${item.tamilTranslation}`;
            }

            // Add reference if available
            if (item.ref) {
                textToShare += `\n\n— ${item.ref}`;
            }

            // Add source attribution
            textToShare += `\n\nSource: https://al-quran-al-kareem-seven.vercel.app/`;

            await Share.share({
                message: textToShare,
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const renderDuaItem = (item, index) => {
        const audioKey = `${type}-${index}`;
        const isPlaying = !!playingAudios[audioKey];
        const isLoading = !!loadingAudios[audioKey];
        const audioSource = item.audio ? getAudioSource(item.audio) : null;

        return (
            <View key={index} style={styles.duaContainer}>
                {/* Dua Number */}
                <View style={styles.duaHeader}>
                    <View style={styles.duaNumberRow}>
                        <Ionicons name="book-outline" size={20} color="#2E8B57" />
                        <Text style={styles.duaNumber}>துஆ {index + 1}</Text>
                    </View>
                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={styles.copyButton}
                            onPress={() => copyToClipboard(item)}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="copy-outline" size={22} color="#2E8B57" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.copyButton}
                            onPress={() => shareContent(item)}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="share-outline" size={22} color="#2E8B57" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Title */}
                {item.title && (
                    <View style={styles.titleContainer}>
                        <Text style={styles.duaTitle}>{item.title}</Text>
                    </View>
                )}

                {/* Audio Player */}
                {item.audio && (
                    <View style={styles.audioContainer}>
                        <TouchableOpacity
                            style={styles.audioPlayer}
                            onPress={() => toggleAudio(index, item.audio)}
                            disabled={isLoading || !audioSource}
                        >
                            <Ionicons name={isPlaying ? 'stop-circle' : 'play-circle'} size={28} color="#2E8B57" />
                            <Text style={styles.audioText}>
                                {!audioSource
                                    ? 'ஒலி விரைவில்'
                                    : isLoading
                                      ? 'Loading...'
                                      : isPlaying
                                        ? 'நிறுத்து (Stop)'
                                        : 'ஒலி கேட்க (Play Audio)'}
                            </Text>
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
                {item.tamilTransliteration && (
                    <View style={styles.transliterationContainer}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="leaf" size={16} color="#2E8B57" />
                            <Text style={styles.sectionTitle}>தமிழ் எழுத்துருவாக்கம் (Transliteration)</Text>
                        </View>
                        <Text style={styles.transliterationText}>{item.tamilTransliteration}</Text>
                    </View>
                )}

                {/* Tamil Translation */}
                {item.tamilTranslation && (
                    <View style={styles.translationContainer}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="language" size={16} color="#2E8B57" />
                            <Text style={styles.sectionTitle}>தமிழ் மொழிபெயர்ப்பு (Translation)</Text>
                        </View>
                        <Text style={styles.translationText}>{item.tamilTranslation}</Text>
                    </View>
                )}

                {/* Reference */}
                {item.ref && (
                    <View style={styles.referenceContainer}>
                        <Ionicons name="bookmark" size={14} color="#666" />
                        <Text style={styles.referenceText}>{item.ref}</Text>
                    </View>
                )}

                {/* Note Section */}
                {item.note && item.note.trim() !== '' && (
                    <View style={styles.noteContainer}>
                        <View style={styles.noteHeader}>
                            <Ionicons name="bulb" size={18} color="#FFA500" />
                            <Text style={styles.noteHeaderText}>குறிப்பு (Note)</Text>
                        </View>
                        <Text style={styles.noteText}>{item.note}</Text>
                    </View>
                )}
            </View>
        );
    };

    return (
        <ScrollView style={styles.container}>
            {data.map((item, index) => renderDuaItem(item, index))}

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        padding: 16,
    },
    duaContainer: {
        backgroundColor: '#fff',
        marginBottom: 16,
        borderRadius: 12,
        padding: 16,
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
        elevation: 3,
    },
    duaHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 2,
        borderBottomColor: '#2E8B57',
    },
    duaNumberRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    duaNumber: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2E8B57',
        marginLeft: 8,
    },
    copyButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: '#e8f5e9',
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 8,
    },
    titleContainer: {
        marginBottom: 12,
    },
    duaTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    audioContainer: {
        marginBottom: 16,
    },
    audioPlayer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#E8F5E9',
        padding: 12,
        borderRadius: 8,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: '#2E8B57',
    },
    audioText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2E8B57',
        marginLeft: 8,
    },
    arabicContainer: {
        backgroundColor: '#FFF8DC',
        padding: 16,
        borderRadius: 8,
        marginBottom: 12,
        alignItems: 'flex-end',
    },
    arabicText: {
        fontSize: 24,
        lineHeight: 40,
        color: '#333',
        textAlign: 'right',
        fontWeight: '500',
    },
    transliterationContainer: {
        backgroundColor: '#F5F5DC',
        padding: 16,
        borderRadius: 8,
        marginBottom: 12,
    },
    translationContainer: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#2E8B57',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2E8B57',
        marginLeft: 6,
    },
    transliterationText: {
        fontSize: 15,
        lineHeight: 24,
        color: '#333',
        textAlign: 'left',
    },
    translationText: {
        fontSize: 15,
        lineHeight: 24,
        color: '#333',
        textAlign: 'left',
    },
    referenceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 12,
        marginTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    referenceText: {
        fontSize: 13,
        color: '#666',
        fontStyle: 'italic',
        marginLeft: 6,
    },
    noteContainer: {
        backgroundColor: '#FFF9E6',
        padding: 12,
        borderRadius: 8,
        marginTop: 12,
        borderWidth: 1,
        borderColor: '#FFD700',
    },
    noteHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    noteHeaderText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginLeft: 6,
    },
    noteText: {
        fontSize: 14,
        lineHeight: 22,
        color: '#333',
    },
});

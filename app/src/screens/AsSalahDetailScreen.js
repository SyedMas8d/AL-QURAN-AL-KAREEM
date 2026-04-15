import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer } from 'expo-audio';
import * as Clipboard from 'expo-clipboard';
import { getAudioSource } from '../utils/audioAssets';
import RichText from '../components/RichText';

export default function AsSalahDetailScreen({ route }) {
    const { section } = route.params;
    const [sound, setSound] = useState(null);
    const [playingAudio, setPlayingAudio] = useState(null);
    const [loadingAudio, setLoadingAudio] = useState(null);
    const [expandedStages, setExpandedStages] = useState({});

    useEffect(() => {
        return sound
            ? () => {
                  sound.stopAsync();
              }
            : undefined;
    }, [sound]);

    const toggleStage = (pointIndex) => {
        setExpandedStages((prev) => ({
            ...prev,
            [pointIndex]: !prev[pointIndex],
        }));
    };

    const playAudio = async (audioUrl, pointIndex) => {
        try {
            if (playingAudio === pointIndex) {
                // Pause if already playing
                if (sound) {
                    await sound.pauseAsync();
                    setPlayingAudio(null);
                }
            } else {
                // Stop previous audio if any
                if (sound) {
                    await sound.stopAsync();
                    await sound.stopAsync();
                }

                setLoadingAudio(pointIndex);

                // Get the audio source (local or remote)
                const audioSource = getAudioSource(audioUrl);

                if (!audioSource) {
                    // Audio file not available
                    setLoadingAudio(null);
                    console.warn('Audio file not available yet');
                    return;
                }

                const { sound: newSound } = await Audio.Sound.createAsync(audioSource, { shouldPlay: true });

                setSound(newSound);
                setPlayingAudio(pointIndex);
                setLoadingAudio(null);

                newSound.setOnPlaybackStatusUpdate((status) => {
                    if (status.didJustFinish) {
                        setPlayingAudio(null);
                    }
                });
            }
        } catch (error) {
            console.error('Error playing audio:', error);
            setLoadingAudio(null);
            setPlayingAudio(null);
        }
    };

    const copyToClipboard = async (point) => {
        try {
            let textToCopy = '';

            // Add Arabic text
            if (point.arabic) {
                textToCopy += `${point.arabic}\n\n`;
            }

            // Add Tamil transliteration
            if (point.tamilTransliteration) {
                textToCopy += `${point.tamilTransliteration}\n\n`;
            }

            // Add Tamil translation
            if (point.tamilTranslation) {
                textToCopy += `${point.tamilTranslation}`;
            }

            // Only show alert if we have content to copy
            if (textToCopy.trim()) {
                await Clipboard.setStringAsync(textToCopy + '\n\nSource: https://al-quran-al-kareem-seven.vercel.app/');
                Alert.alert('நகலெடுக்கப்பட்டது', 'துஆ உங்கள் கிளிப்போர்டுக்கு நகலெடுக்கப்பட்டது', [
                    { text: 'சரி', style: 'default' },
                ]);
            }
        } catch (error) {
            console.error('Error copying to clipboard:', error);
            Alert.alert('பிழை', 'நகலெடுக்க முடியவில்லை');
        }
    };

    const shareContent = async (point) => {
        try {
            let textToShare = '';

            // Add title if available
            if (point.title) {
                textToShare += `${point.title}\n\n`;
            }

            // Add Arabic text
            if (point.arabic) {
                textToShare += `${point.arabic}\n\n`;
            }

            // Add Tamil transliteration
            if (point.tamilTransliteration) {
                textToShare += `${point.tamilTransliteration}\n\n`;
            }

            // Add Tamil translation
            if (point.tamilTranslation) {
                textToShare += `${point.tamilTranslation}`;
            }

            if (textToShare.trim()) {
                await Share.share({
                    message: textToShare + '\n\nSource: https://al-quran-al-kareem-seven.vercel.app/',
                });
            }
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const renderPoint = (point, index) => {
        // Check if point has a stage array
        if (point.stage && Array.isArray(point.stage)) {
            return (
                <View key={index} style={styles.pointContainer}>
                    {/* Point Title - Clickable to expand/collapse */}
                    <TouchableOpacity style={styles.stageHeader} onPress={() => toggleStage(index)} activeOpacity={0.7}>
                        <Text style={styles.pointTitle}>{point.title}</Text>
                        <Ionicons
                            name={expandedStages[index] ? 'chevron-up' : 'chevron-down'}
                            size={24}
                            color="#2E8B57"
                        />
                    </TouchableOpacity>

                    {/* Simple description if available */}
                    {point.description ? <Text style={styles.simpleDescription}>{point.description}</Text> : null}

                    {/* Expandable Stage Content */}
                    {expandedStages[index] && (
                        <View style={styles.stageContainer}>
                            {point.stage.map((stageItem, stageIndex) => (
                                <View key={stageIndex} style={styles.stageItem}>
                                    <Text style={styles.stageTitle}>{stageItem.title}</Text>
                                    {stageItem.description ? (
                                        <Text style={styles.stageDescription}>{stageItem.description}</Text>
                                    ) : null}
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            );
        }

        // Regular point rendering (no stage array)
        return (
            <View key={index} style={styles.pointContainer}>
                {/* Point Title with Copy Button */}
                <View style={styles.pointTitleRow}>
                    <Text style={[styles.pointTitle, styles.pointTitleFlex]}>{point.title}</Text>
                    {(point.arabic || point.tamilTransliteration || point.tamilTranslation) && (
                        <View style={styles.buttonRow}>
                            <TouchableOpacity
                                style={styles.copyButton}
                                onPress={() => copyToClipboard(point)}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="copy-outline" size={20} color="#2E8B57" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.copyButton}
                                onPress={() => shareContent(point)}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="share-outline" size={20} color="#2E8B57" />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* descriptionRichText - with HTML formatting */}
                {point.descriptionRichText ? (
                    <View style={styles.richTextContainer}>
                        <RichText style={styles.richText} boldStyle={styles.boldText}>
                            {point.descriptionRichText}
                        </RichText>
                    </View>
                ) : null}

                {/* Simple description if available (for points without detailed fields) */}
                {point.description && !point.arabic && !point.tamilTranslation && !point.descriptionRichText ? (
                    <Text style={styles.simpleDescription}>{point.description}</Text>
                ) : null}

                {/* Audio Player or Coming Soon */}
                {point.audio !== undefined && point.audio !== null ? (
                    point.audio && point.audio.trim() !== '' ? (
                        <TouchableOpacity
                            style={styles.audioPlayer}
                            onPress={() => playAudio(point.audio, index)}
                            activeOpacity={0.7}
                        >
                            {loadingAudio === index ? (
                                <ActivityIndicator size="small" color="#2E8B57" />
                            ) : (
                                <Ionicons
                                    name={playingAudio === index ? 'pause-circle' : 'play-circle'}
                                    size={28}
                                    color="#2E8B57"
                                />
                            )}
                            <View style={styles.audioTextContainer}>
                                <Text style={styles.audioPlayerTextMain}>
                                    {playingAudio === index ? 'ஒலியை நிறுத்து' : 'ஒலியைக் கேளுங்கள்'}
                                </Text>
                                <Text style={styles.audioPlayerTextSub}>
                                    {playingAudio === index ? 'இயக்கத்தில்...' : 'தட்டவும்'}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.audioPlaceholder}>
                            <Ionicons name="volume-medium-outline" size={20} color="#999" />
                            <View style={styles.audioTextContainer}>
                                <Text style={styles.audioTextArabic}>இன்ஷா அல்லாஹ்</Text>
                                <Text style={styles.audioText}>ஒலி விரைவில்</Text>
                            </View>
                        </View>
                    )
                ) : null}

                {/* Arabic Text */}
                {point.arabic ? (
                    <View style={styles.arabicContainer}>
                        <Text style={styles.arabicText}>{point.arabic}</Text>
                    </View>
                ) : null}

                {/* Tamil Transliteration */}
                {point.tamilTransliteration && point.tamilTransliteration.trim() !== '' ? (
                    <View style={styles.transliterationContainer}>
                        <Ionicons name="leaf-outline" size={16} color="#8B4513" style={styles.leafIcon} />
                        <Text style={styles.transliterationText}>{point.tamilTransliteration}</Text>
                    </View>
                ) : null}

                {/* Tamil Translation */}
                {point.tamilTranslation ? (
                    <View style={styles.translationContainer}>
                        <Text style={styles.translationText}>{point.tamilTranslation}</Text>
                    </View>
                ) : null}

                {/* Hadith - for context and authenticity */}
                {point.hadith ? (
                    <View style={styles.hadithContainer}>
                        <View style={styles.hadithHeader}>
                            <Ionicons name="book" size={16} color="#8B4513" />
                            <Text style={styles.hadithHeaderText}>ஹதீஸ்</Text>
                        </View>
                        <Text style={styles.hadithText}>{point.hadith}</Text>
                    </View>
                ) : null}

                {/* Reference */}
                {point.ref ? (
                    <View style={styles.referenceContainer}>
                        <Ionicons name="bookmark-outline" size={14} color="#888" />
                        <Text style={styles.referenceText}>{point.ref}</Text>
                    </View>
                ) : null}

                {/* Note */}
                {point.note ? (
                    <View style={styles.noteContainer}>
                        <Ionicons name="information-circle" size={18} color="#8B4513" />
                        <Text style={styles.noteText}>{point.note}</Text>
                    </View>
                ) : null}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Section Header */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>{section.title}</Text>
                    {section.description && (
                        <RichText style={styles.sectionDescription} boldStyle={styles.boldText}>
                            {section.description}
                        </RichText>
                    )}
                </View>

                {/* Points */}
                <View style={styles.pointsWrapper}>
                    {section.points && section.points.map((point, index) => renderPoint(point, index))}
                </View>

                {/* Bottom Padding */}
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
    sectionHeader: {
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
    sectionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1A5F3E',
        marginBottom: 10,
        lineHeight: 32,
    },
    sectionDescription: {
        fontSize: 16,
        color: '#555',
        lineHeight: 24,
    },
    boldText: {
        fontWeight: 'bold',
        color: '#000',
    },
    richTextContainer: {
        marginVertical: 10,
        paddingHorizontal: 16,
        backgroundColor: '#FFFEF7',
        borderRadius: 8,
        padding: 12,
        borderLeftWidth: 3,
        borderLeftColor: '#2E8B57',
    },
    richText: {
        fontSize: 16,
        lineHeight: 26,
        color: '#333',
    },
    pointsWrapper: {
        padding: 16,
    },
    pointContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 18,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
        borderLeftWidth: 4,
        borderLeftColor: '#2E8B57',
    },
    pointTitleRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    pointTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2E8B57',
        marginBottom: 16,
        lineHeight: 26,
    },
    pointTitleFlex: {
        flex: 1,
        marginRight: 8,
        marginBottom: 0,
    },
    copyButton: {
        padding: 6,
        borderRadius: 20,
        backgroundColor: '#e8f5e9',
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 8,
    },
    stageHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    simpleDescription: {
        fontSize: 15,
        lineHeight: 24,
        color: '#555',
        marginBottom: 8,
    },
    stageContainer: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    stageItem: {
        backgroundColor: '#F8FFF8',
        padding: 14,
        borderRadius: 8,
        marginBottom: 10,
        borderLeftWidth: 3,
        borderLeftColor: '#4CAF50',
    },
    stageTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A5F3E',
        marginBottom: 8,
        lineHeight: 24,
    },
    stageDescription: {
        fontSize: 15,
        lineHeight: 24,
        color: '#444',
    },
    arabicContainer: {
        backgroundColor: '#FFF8DC',
        padding: 16,
        borderRadius: 8,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#8B4513',
    },
    arabicText: {
        fontSize: 24,
        lineHeight: 40,
        color: '#1A5F3E',
        textAlign: 'right',
        fontWeight: '500',
    },
    transliterationContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#F5F5DC',
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
    },
    leafIcon: {
        marginRight: 8,
        marginTop: 2,
    },
    transliterationText: {
        fontSize: 16,
        lineHeight: 26,
        color: '#654321',
        fontStyle: 'italic',
        flex: 1,
    },
    translationContainer: {
        paddingVertical: 8,
        marginBottom: 12,
    },
    translationText: {
        fontSize: 16,
        lineHeight: 26,
        color: '#333',
    },
    hadithContainer: {
        backgroundColor: '#FFFAF0',
        padding: 14,
        borderRadius: 10,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#8B4513',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    hadithHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    hadithHeaderText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#8B4513',
        marginLeft: 6,
    },
    hadithText: {
        fontSize: 15,
        lineHeight: 24,
        color: '#654321',
        fontStyle: 'italic',
    },
    referenceContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingTop: 8,
        marginTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    referenceText: {
        fontSize: 13,
        color: '#666',
        marginLeft: 6,
        lineHeight: 20,
        flex: 1,
    },
    noteContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#FFF8DC',
        padding: 12,
        borderRadius: 8,
        marginTop: 12,
        borderLeftWidth: 3,
        borderLeftColor: '#8B4513',
    },
    noteText: {
        fontSize: 14,
        color: '#654321',
        lineHeight: 22,
        marginLeft: 8,
        flex: 1,
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
    audioPlaceholder: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        marginBottom: 12,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderStyle: 'dashed',
    },
    audioTextContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        marginLeft: 8,
    },
    audioTextArabic: {
        fontSize: 16,
        color: '#2E8B57',
        fontWeight: '500',
        marginBottom: 2,
    },
    audioText: {
        fontSize: 14,
        color: '#999',
    },
});

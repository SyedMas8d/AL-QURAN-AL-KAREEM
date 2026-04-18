import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer } from 'expo-audio';
import * as Clipboard from 'expo-clipboard';
import { dailyDua } from '../data/daily_duas/tableOfContent';
import { getAudioSource } from '../utils/audioAssets';
import RichText from '../components/RichText';

export default function DailyDuasListScreen() {
    const player = useAudioPlayer();
    const [activeAudioKey, setActiveAudioKey] = useState(null);
    const pollIntervalRef = useRef(null);
    const [loadingAudios, setLoadingAudios] = useState({});
    const [expandedItems, setExpandedItems] = useState({});

    const clearPlayback = () => {
        if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
        }
        if (player.playing) {
            player.pause();
        }
        setActiveAudioKey(null);
    };

    useEffect(() => {
        return () => {
            if (player.playing) {
                player.pause();
            }
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
            }
        };
    }, []);

    const toggleItem = (index) => {
        setExpandedItems((prev) => ({
            ...prev,
            [index]: !prev[index],
        }));
    };

    const toggleAudio = async (index, audioPath) => {
        const audioKey = `dua-${index}`;

        if (!audioPath) {
            return;
        }

        const audioSource = getAudioSource(audioPath);
        if (!audioSource) {
            return;
        }

        try {
            if (activeAudioKey === audioKey) {
                clearPlayback();
                return;
            }
            if (activeAudioKey) {
                clearPlayback();
            }
            setLoadingAudios((prev) => ({ ...prev, [audioKey]: true }));

            if (typeof audioSource === 'object' && audioSource !== null && 'uri' in audioSource) {
                player.replace(audioSource.uri);
            } else {
                player.replace(audioSource);
            }
            player.play();
            setActiveAudioKey(audioKey);
            setLoadingAudios((prev) => ({ ...prev, [audioKey]: false }));

            const checkStatus = () => {
                if (!player.playing && player.duration > 0 && player.currentTime >= player.duration) {
                    if (pollIntervalRef.current) {
                        clearInterval(pollIntervalRef.current);
                        pollIntervalRef.current = null;
                    }
                    setActiveAudioKey((current) => (current === audioKey ? null : current));
                }
            };
            pollIntervalRef.current = setInterval(checkStatus, 500);
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
            Alert.alert('நகலெடுக்கப்பட்டது', 'துஆ உங்கள் கிளிப்போர்டுக்கு நகலெடுக்கப்பட்டது', [
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
        const audioKey = `dua-${index}`;
        const isPlaying = activeAudioKey === audioKey;
        const isLoading = !!loadingAudios[audioKey];
        const audioSource = item.audio ? getAudioSource(item.audio) : null;
        const isExpanded = expandedItems[index];

        return (
            <View key={index} style={styles.duaContainer}>
                {/* Dua Header - Clickable to expand/collapse */}
                <TouchableOpacity style={styles.duaHeader} onPress={() => toggleItem(index)} activeOpacity={0.7}>
                    <View style={styles.duaNumberContainer}>
                        <Text style={styles.duaNumber}>{index + 1}</Text>
                    </View>
                    <View style={styles.titleContainer}>
                        <Text style={styles.duaTitle}>{item.title}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.copyButton}
                        onPress={(e) => {
                            e.stopPropagation();
                            copyToClipboard(item);
                        }}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="copy-outline" size={22} color="#2E8B57" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.copyButton}
                        onPress={(e) => {
                            e.stopPropagation();
                            shareContent(item);
                        }}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="share-outline" size={22} color="#2E8B57" />
                    </TouchableOpacity>
                    <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={24} color="#2E8B57" />
                </TouchableOpacity>

                {/* Expandable Content */}
                {isExpanded && (
                    <View style={styles.expandedContent}>
                        {/* Audio Player */}
                        <View style={styles.audioContainer}>
                            {audioSource ? (
                                <TouchableOpacity
                                    style={styles.audioPlayer}
                                    onPress={() => toggleAudio(index, item.audio)}
                                    disabled={isLoading}
                                >
                                    <Ionicons
                                        name={isPlaying ? 'pause-circle' : 'play-circle'}
                                        size={28}
                                        color="#2E8B57"
                                    />
                                    <View style={styles.audioTextContainer}>
                                        <Text style={styles.audioPlayerTextMain}>
                                            {isPlaying ? 'ஒலியை நிறுத்து' : 'ஒலியைக் கேளுங்கள்'}
                                        </Text>
                                        <Text style={styles.audioPlayerTextSub}>
                                            {isPlaying ? 'இயக்கத்தில்...' : 'தட்டவும்'}
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
                            )}
                        </View>

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

                        {/* Hadith - for context and authenticity */}
                        {item.hadith && item.hadith.length > 0 && (
                            <View style={styles.hadithSection}>
                                <View style={styles.hadithHeader}>
                                    <Ionicons name="book" size={18} color="#8B4513" />
                                    <Text style={styles.hadithHeaderText}>தொடர்புடைய ஹதீஸ்கள்</Text>
                                </View>
                                {item.hadith.map((hadithItem, hadithIndex) => (
                                    <View key={hadithIndex} style={styles.hadithContainer}>
                                        <RichText style={styles.hadithText} boldStyle={styles.hadithBoldText}>
                                            {hadithItem.text}
                                        </RichText>
                                        {hadithItem.ref && <Text style={styles.hadithRef}>— {hadithItem.ref}</Text>}
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Reference */}
                        {item.ref && (
                            <View style={styles.referenceContainer}>
                                <Ionicons name="bookmark" size={14} color="#666" />
                                <Text style={styles.referenceText}>{item.ref}</Text>
                            </View>
                        )}
                    </View>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
                {/* Header Description */}
                <View style={styles.headerContainer}>
                    <View style={styles.headerIconRow}>
                        <Ionicons name="calendar" size={28} color="#2E8B57" />
                        <Text style={styles.headerTitle}>{dailyDua.title}</Text>
                    </View>
                    {dailyDua.description && (
                        <RichText
                            style={styles.headerDescription}
                            boldStyle={styles.boldText}
                            italicStyle={styles.italicText}
                        >
                            {dailyDua.description}
                        </RichText>
                    )}
                    <View style={styles.countBadge}>
                        <Ionicons name="list" size={16} color="#2E8B57" />
                        <Text style={styles.countText}>{dailyDua.points.length} துஆக்கள்</Text>
                    </View>
                </View>

                {/* Duas List */}
                <View style={styles.duasListContainer}>
                    {dailyDua.points.map((item, index) => renderDuaItem(item, index))}
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
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
    headerContainer: {
        backgroundColor: '#FFFEF7',
        padding: 20,
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#2E8B57',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
        elevation: 3,
    },
    headerIconRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2E8B57',
        marginLeft: 12,
    },
    headerDescription: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 12,
    },
    countBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e8f5e9',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    countText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#2E8B57',
        marginLeft: 6,
    },
    duasListContainer: {
        paddingHorizontal: 16,
    },
    expandedContent: {
        marginTop: 12,
    },
    duaContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
        elevation: 2,
        borderLeftWidth: 3,
        borderLeftColor: '#2E8B57',
    },
    duaHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    duaNumberContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#2E8B57',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    duaNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    titleContainer: {
        flex: 1,
        marginRight: 8,
    },
    duaTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        lineHeight: 22,
    },
    copyButton: {
        padding: 8,
        marginRight: 8,
        borderRadius: 20,
        backgroundColor: '#e8f5e9',
    },
    audioContainer: {
        marginBottom: 12,
    },
    audioPlayer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#e8f5e9',
        padding: 12,
        borderRadius: 8,
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
    arabicContainer: {
        backgroundColor: '#FFFEF7',
        padding: 16,
        borderRadius: 8,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    arabicText: {
        fontSize: 24,
        lineHeight: 40,
        textAlign: 'right',
        color: '#1a1a1a',
        fontWeight: '500',
    },
    transliterationContainer: {
        backgroundColor: '#f5f5f5',
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#2E8B57',
        marginLeft: 6,
    },
    transliterationText: {
        fontSize: 16,
        lineHeight: 24,
        color: '#333',
    },
    translationContainer: {
        backgroundColor: '#e8f5e9',
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
    },
    translationText: {
        fontSize: 15,
        lineHeight: 24,
        color: '#333',
    },
    referenceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    referenceText: {
        fontSize: 12,
        color: '#666',
        fontStyle: 'italic',
        marginLeft: 6,
    },
    hadithSection: {
        marginBottom: 12,
    },
    hadithHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    hadithHeaderText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#8B4513',
        marginLeft: 8,
    },
    hadithContainer: {
        backgroundColor: '#FFF8DC',
        padding: 12,
        borderRadius: 8,
        marginBottom: 10,
        borderLeftWidth: 3,
        borderLeftColor: '#8B4513',
    },
    hadithText: {
        fontSize: 14,
        lineHeight: 22,
        color: '#333',
        marginBottom: 6,
    },
    hadithRef: {
        fontSize: 12,
        color: '#8B4513',
        fontStyle: 'italic',
        marginTop: 4,
    },
    hadithBoldText: {
        fontWeight: 'bold',
        color: '#8B4513',
    },
    boldText: {
        fontWeight: 'bold',
        color: '#000',
    },
    italicText: {
        fontStyle: 'italic',
    },
});

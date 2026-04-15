import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView, Alert, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer } from 'expo-audio';
import * as Clipboard from 'expo-clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { tasbih_beads } from '../data/tasbih_beads/tableOfContent';
import { getAudioSource } from '../utils/audioAssets';

const STORAGE_KEY = 'tasbih_count';
const STORAGE_DATE_KEY = 'tasbih_date';
const TOTAL_BEADS = 33; // Total beads to display

export default function TasbihBeadsScreen() {
    const [count, setCount] = useState(0);
    const [sound, setSound] = useState(null);
    const player = useAudioPlayer();
    const [selectedTasbih] = useState(tasbih_beads[0]);
    const moveAnim = useRef(new Animated.Value(0)).current;
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        loadCount();
        return () => {
            if (player.playing) {
                player.pause();
            }
        };
    }, []);

    useEffect(() => {
        saveCount();
    }, [count]);

    const loadCount = async () => {
        try {
            const storedDate = await AsyncStorage.getItem(STORAGE_DATE_KEY);
            const today = new Date().toDateString();

            if (storedDate === today) {
                const storedCount = await AsyncStorage.getItem(STORAGE_KEY);
                if (storedCount !== null) {
                    setCount(parseInt(storedCount, 10));
                }
            } else {
                // Reset if it's a new day
                await AsyncStorage.setItem(STORAGE_DATE_KEY, today);
                await AsyncStorage.setItem(STORAGE_KEY, '0');
            }
        } catch (error) {
            console.error('Error loading count:', error);
        }
    };

    const saveCount = async () => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, count.toString());
            await AsyncStorage.setItem(STORAGE_DATE_KEY, new Date().toDateString());
        } catch (error) {
            console.error('Error saving count:', error);
        }
    };

    const playAudio = async () => {
        try {
            if (sound) {
                await sound.stopAsync();
                setSound(null);
            }

            if (!selectedTasbih.audio || selectedTasbih.audio === '') {
                return;
            }

            const audioSource = getAudioSource(selectedTasbih.audio);
            if (!audioSource) {
                return;
            }

            if (typeof audioSource === 'string') {
                player.replace(audioSource);
            } else {
                player.replace(audioSource.uri);
            }
            player.play();
        } catch (error) {
            console.error('Error playing audio:', error);
        }
    };

    const handleBeadPress = () => {
        if (isAnimating) return; // Prevent multiple clicks during animation

        const newCount = count + 1;
        setCount(newCount);
        setIsAnimating(true);

        // Animate bead moving from left to right
        moveAnim.setValue(0);
        Animated.timing(moveAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start(() => {
            setIsAnimating(false);
            moveAnim.setValue(0);
        });

        // Play audio at count 0 (first count = 1) and every 30 counts
        if (newCount === 1 || newCount % 30 === 0) {
            playAudio();
        }
    };

    const handleReset = () => {
        Alert.alert('எண்ணிக்கையை மீட்டமைக்கவா?', 'உறுதிப்படுத்த விரும்புகிறீர்களா?', [
            { text: 'இல்லை', style: 'cancel' },
            {
                text: 'ஆம்',
                onPress: () => setCount(0),
                style: 'destructive',
            },
        ]);
    };

    const copyToClipboard = async () => {
        try {
            let textToCopy = '';

            if (selectedTasbih.arabic) {
                textToCopy += `${selectedTasbih.arabic}\n\n`;
            }

            if (selectedTasbih.tamilTransliteration) {
                textToCopy += `${selectedTasbih.tamilTransliteration}\n\n`;
            }

            if (selectedTasbih.tamilTranslation) {
                textToCopy += `${selectedTasbih.tamilTranslation}`;
            }

            // Add title reference
            textToCopy += `\n\n— ${selectedTasbih.title || 'Tasbih'}`;

            // Add source attribution
            textToCopy += `\n\nSource: https://al-quran-al-kareem-seven.vercel.app/`;

            await Clipboard.setStringAsync(textToCopy);
            Alert.alert('நகலெடுக்கப்பட்டது', 'தஸ்பீஹ் உங்கள் கிளிப்போர்டுக்கு நகலெடுக்கப்பட்டது', [
                { text: 'சரி', style: 'default' },
            ]);
        } catch (error) {
            console.error('Error copying to clipboard:', error);
            Alert.alert('பிழை', 'நகலெடுக்க முடியவில்லை');
        }
    };

    const shareContent = async () => {
        try {
            let textToShare = '';

            if (selectedTasbih.arabic) {
                textToShare += `${selectedTasbih.arabic}\n\n`;
            }

            if (selectedTasbih.tamilTransliteration) {
                textToShare += `${selectedTasbih.tamilTransliteration}\n\n`;
            }

            if (selectedTasbih.tamilTranslation) {
                textToShare += `${selectedTasbih.tamilTranslation}`;
            }

            // Add title reference
            textToShare += `\n\n— ${selectedTasbih.title || 'Tasbih'}`;

            // Add source attribution
            textToShare += `\n\nSource: https://al-quran-al-kareem-seven.vercel.app/`;

            await Share.share({
                message: textToShare,
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
                <Ionicons name="ellipse" size={28} color="#2E8B57" />
                <Text style={styles.headerTitle}>தஸ்பீஹ் மணிகள்</Text>
            </View>

            {/* Tasbih Content */}
            <View style={styles.contentCard}>
                <View style={styles.contentHeader}>
                    <Text style={styles.contentTitle}>திக்ர்</Text>
                    <View style={styles.actionButtons}>
                        <TouchableOpacity style={styles.iconButton} onPress={copyToClipboard} activeOpacity={0.7}>
                            <Ionicons name="copy-outline" size={22} color="#2E8B57" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconButton} onPress={shareContent} activeOpacity={0.7}>
                            <Ionicons name="share-outline" size={22} color="#2E8B57" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.arabicContainer}>
                    <Text style={styles.arabicText}>{selectedTasbih.arabic}</Text>
                </View>

                <View style={styles.transliterationContainer}>
                    <Text style={styles.transliterationText}>{selectedTasbih.tamilTransliteration}</Text>
                </View>

                <View style={styles.translationContainer}>
                    <Text style={styles.translationText}>{selectedTasbih.tamilTranslation}</Text>
                </View>

                {selectedTasbih.haith && selectedTasbih.haith.trim() !== '' && (
                    <View style={styles.hadithContainer}>
                        <View style={styles.hadithHeader}>
                            <Ionicons name="book" size={16} color="#8B4513" />
                            <Text style={styles.hadithHeaderText}>ஹதீஸ்</Text>
                        </View>
                        <Text style={styles.hadithText}>{selectedTasbih.haith}</Text>
                    </View>
                )}
            </View>

            {/* Counter Display */}
            <View style={styles.counterContainer}>
                <Text style={styles.counterLabel}>எண்ணிக்கை</Text>
                <Text style={styles.counterText}>{count}</Text>
                <Text style={styles.counterSubtext}>
                    {count % 30 === 0 && count > 0 ? '✓ 30 முடிந்தது!' : `${30 - (count % 30)} மீதம்`}
                </Text>
            </View>

            {/* Tasbih Beads - Horizontal Rope */}
            <TouchableOpacity activeOpacity={0.8} onPress={handleBeadPress} disabled={isAnimating}>
                <View style={styles.ropeContainer}>
                    <Text style={styles.tapInstruction}>👇 தொடவும்</Text>

                    {/* Horizontal Rope with Beads */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.horizontalRope}
                    >
                        {/* Left Rope Section */}
                        <View style={styles.ropeSection} />

                        {/* Beads on Rope */}
                        {Array.from({ length: 10 }).map((_, i) => {
                            const beadNumber = i + 1;
                            const isCompleted = beadNumber <= (count % 10 || (count > 0 && count % 10 === 0 ? 10 : 0));
                            const isAnimatingBead = isAnimating && beadNumber === (count % 10 || 10);

                            return (
                                <View key={i} style={styles.beadContainer}>
                                    {/* Rope before bead */}
                                    <View style={styles.ropeSection} />

                                    {/* Bead */}
                                    <Animated.View
                                        style={[
                                            styles.horizontalBead,
                                            isAnimatingBead && {
                                                transform: [
                                                    {
                                                        scale: moveAnim.interpolate({
                                                            inputRange: [0, 0.5, 1],
                                                            outputRange: [1, 1.3, 1],
                                                        }),
                                                    },
                                                ],
                                            },
                                        ]}
                                    >
                                        <Ionicons
                                            name="ellipse"
                                            size={28}
                                            color={isCompleted ? '#FF6B6B' : '#2E8B57'}
                                        />
                                    </Animated.View>

                                    {/* Rope after bead */}
                                    <View style={styles.ropeSection} />
                                </View>
                            );
                        })}

                        {/* Right Rope Section */}
                        <View style={styles.ropeSection} />
                    </ScrollView>

                    {/* Progress Info */}
                    <View style={styles.progressInfo}>
                        <Text style={styles.progressText}>
                            {count % 10 === 0 && count > 0
                                ? `✓ 10 முடிந்தது! மொத்தம்: ${count}`
                                : `${count % 10}/10 - மொத்தம்: ${count}`}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>

            {/* Reset Button */}
            <TouchableOpacity style={styles.resetButton} onPress={handleReset} activeOpacity={0.7}>
                <Ionicons name="reload" size={24} color="#fff" />
                <Text style={styles.resetButtonText}>மீட்டமை</Text>
            </TouchableOpacity>

            {/* Instructions */}
            <View style={styles.instructionsCard}>
                <View style={styles.instructionItem}>
                    <Ionicons name="hand-left" size={20} color="#2E8B57" />
                    <Text style={styles.instructionText}>கயிற்றைத் தொட்டு மணி ஒன்றை நகர்த்தவும்</Text>
                </View>
                <View style={styles.instructionItem}>
                    <Ionicons name="arrow-forward" size={20} color="#2E8B57" />
                    <Text style={styles.instructionText}>இடமிருந்து வலமாக மணிகள் நகரும்</Text>
                </View>
                <View style={styles.instructionItem}>
                    <Ionicons name="musical-note" size={20} color="#2E8B57" />
                    <Text style={styles.instructionText}>ஒவ்வொரு 30 எண்ணிக்கையிலும் ஒலி ஒலிக்கும்</Text>
                </View>
                <View style={styles.instructionItem}>
                    <Ionicons name="calendar" size={20} color="#2E8B57" />
                    <Text style={styles.instructionText}>எண்ணிக்கை ஒரு நாளுக்கு சேமிக்கப்படும்</Text>
                </View>
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e8f5e9',
        padding: 20,
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 12,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2E8B57',
        marginLeft: 12,
    },
    contentCard: {
        backgroundColor: '#fff',
        margin: 16,
        padding: 16,
        borderRadius: 12,
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
        elevation: 3,
    },
    contentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 2,
        borderBottomColor: '#2E8B57',
    },
    contentTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2E8B57',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    iconButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: '#e8f5e9',
    },
    arabicContainer: {
        backgroundColor: '#FFFEF7',
        padding: 16,
        borderRadius: 8,
        marginBottom: 12,
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
    hadithContainer: {
        backgroundColor: '#FFF8DC',
        padding: 12,
        borderRadius: 8,
        marginTop: 8,
        borderLeftWidth: 3,
        borderLeftColor: '#8B4513',
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
        fontSize: 14,
        lineHeight: 22,
        color: '#333',
    },
    counterContainer: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        padding: 24,
        borderRadius: 12,
        alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
        elevation: 3,
    },
    counterLabel: {
        fontSize: 16,
        color: '#666',
        marginBottom: 8,
    },
    counterText: {
        fontSize: 72,
        fontWeight: 'bold',
        color: '#2E8B57',
    },
    counterSubtext: {
        fontSize: 14,
        color: '#999',
        marginTop: 8,
    },
    ropeContainer: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginVertical: 16,
        padding: 20,
        borderRadius: 12,
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
        elevation: 3,
    },
    tapInstruction: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2E8B57',
        textAlign: 'center',
        marginBottom: 20,
    },
    horizontalRope: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 10,
    },
    ropeSection: {
        height: 4,
        width: 20,
        backgroundColor: '#8B7355',
        borderRadius: 2,
        borderWidth: 1,
        borderColor: '#654321',
    },
    beadContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    horizontalBead: {
        marginHorizontal: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    progressInfo: {
        alignItems: 'center',
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    progressText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
        textAlign: 'center',
    },
    resetButton: {
        backgroundColor: '#d32f2f',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 16,
        padding: 16,
        borderRadius: 12,
        marginTop: 16,
    },
    resetButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
        marginLeft: 8,
    },
    instructionsCard: {
        backgroundColor: '#fff',
        margin: 16,
        padding: 16,
        borderRadius: 12,
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
        elevation: 3,
    },
    instructionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    instructionText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 12,
        flex: 1,
    },
});

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView, Alert, Share, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer } from 'expo-audio'; // Same as other working screens
import * as Clipboard from 'expo-clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAudioSource } from '../utils/audioAssets';
import { tasbih_beads } from '../data/tasbih_beads/tableOfContent';

const TOTAL_BEADS = 33; // Total beads to display
const STORAGE_KEY = 'tasbih_multi_count';

// Platform-specific storage functions
const PlatformStorage = {
    async getItem(key) {
        if (Platform.OS === 'web') {
            return localStorage.getItem(key);
        } else {
            return await AsyncStorage.getItem(key);
        }
    },
    async setItem(key, value) {
        if (Platform.OS === 'web') {
            localStorage.setItem(key, value);
        } else {
            await AsyncStorage.setItem(key, value);
        }
    },
    async removeItem(key) {
        if (Platform.OS === 'web') {
            localStorage.removeItem(key);
        } else {
            await AsyncStorage.removeItem(key);
        }
    },
};
const STORAGE_DATE_KEY = 'tasbih_multi_date';
const STORAGE_CURRENT_INDEX_KEY = 'tasbih_multi_current_index';

export default function TasbihMultiDetailScreen({ route }) {
    const { items, title } = route.params;
    const [count, setCount] = useState(0);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [sound, setSound] = useState(null);
    const [isResetting, setIsResetting] = useState(false);
    const player = useAudioPlayer(); // Same as other working screens
    const moveAnim = useRef(new Animated.Value(0)).current;
    const [isAnimating, setIsAnimating] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const countRef = useRef(0); // Keep track of current count
    const currentIndexRef = useRef(0); // Keep track of current index

    const currentItem = items[currentIndex];
    const currentTargetCount = currentItem?.count || 33;

    useEffect(() => {
        loadState();
        return () => {
            // Cleanup audio when component unmounts
            if (player.playing) {
                player.pause();
            }
        };
    }, []);

    useEffect(() => {
        if (!isResetting) {
            // Update refs and save immediately
            countRef.current = count;
            currentIndexRef.current = currentIndex;
            saveState();
        }
    }, [count, currentIndex, isResetting]);

    useEffect(() => {
        // Check if current item is completed and move to next
        if (count >= currentTargetCount && currentIndex < items.length - 1) {
            setTimeout(() => {
                setCurrentIndex((prev) => prev + 1);
                setCount(0);
                Alert.alert(
                    '✅ முடிந்தது!',
                    `${currentItem.tamilTransliteration} ${currentTargetCount} முறை முடிந்தது.\nஅடுத்த திக்ர் தொடங்குங்கள்.`,
                    [{ text: 'சரி', style: 'default' }]
                );
            }, 500);
        } else if (count >= currentTargetCount && currentIndex === items.length - 1) {
            // All items completed - just mark as completed without popup
            if (!isCompleted) {
                setIsCompleted(true);
            }
        }
    }, [count, currentIndex, currentTargetCount, isCompleted]);

    const loadState = async () => {
        try {
            const storedDate = await PlatformStorage.getItem(STORAGE_DATE_KEY);
            const storedCount = await PlatformStorage.getItem(STORAGE_KEY);
            const storedIndex = await PlatformStorage.getItem(STORAGE_CURRENT_INDEX_KEY);
            const today = new Date().toDateString();

            if (storedDate === today) {
                // Same day - load the stored values
                if (storedCount !== null) {
                    const parsedCount = parseInt(storedCount, 10);
                    setCount(parsedCount);
                    countRef.current = parsedCount; // Update ref
                }
                if (storedIndex !== null) {
                    const parsedIndex = parseInt(storedIndex, 10);
                    setCurrentIndex(parsedIndex);
                    currentIndexRef.current = parsedIndex; // Update ref
                }
            } else {
                // Different day - reset for new day
                resetAll();
            }
        } catch (error) {
            console.error('Error loading state:', error);
        }
    };

    const saveState = async () => {
        try {
            const today = new Date().toDateString();
            await PlatformStorage.setItem(STORAGE_KEY, count.toString());
            await PlatformStorage.setItem(STORAGE_CURRENT_INDEX_KEY, currentIndex.toString());
            await PlatformStorage.setItem(STORAGE_DATE_KEY, today);
        } catch (error) {
            console.error('Error saving state:', error);
        }
    };

    const resetAll = async () => {
        try {
            setIsResetting(true);
            // Reset state first
            setCount(0);
            setCurrentIndex(0);
            setIsCompleted(false);
            // Update refs
            countRef.current = 0;
            currentIndexRef.current = 0;
            // Then directly reset PlatformStorage
            await PlatformStorage.setItem(STORAGE_KEY, '0');
            await PlatformStorage.setItem(STORAGE_CURRENT_INDEX_KEY, '0');
            await PlatformStorage.setItem(STORAGE_DATE_KEY, new Date().toDateString());
            console.log('Multi reset successful');
            setIsResetting(false);
        } catch (error) {
            console.error('Error resetting:', error);
            setIsResetting(false);
        }
    };

    const playAudio = async () => {
        try {
            // Stop previous audio if any
            if (sound) {
                await sound.pauseAsync();
                setSound(null);
            }

            // Check if current item has audio
            if (!currentItem?.audio || currentItem.audio === '') {
                console.log(`📢 No audio file for: ${currentItem?.arabic || 'Unknown dhikr'}`);
                return;
            }

            // Get the audio source using your existing audioAssets system
            const audioSource = getAudioSource(currentItem.audio);
            if (!audioSource) {
                console.log(`⚠️  Audio mapping not found for: ${currentItem.audio}`);
                return;
            }

            console.log(`🔊 Playing audio: ${currentItem.audio} for "${currentItem.arabic}"`);

            // Use same pattern as other working screens (AdhkarDetailScreen)
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
    // Play tasbih beads click sound (general click sound for every tap)
    const playTasbihClickSound = async () => {
        try {
            // Only play click sound if no specific dhikr audio is currently playing
            if (player.playing) {
                return; // Don't play click sound if dhikr audio is playing
            }

            const clickAudioSource = getAudioSource(tasbih_beads.audio);
            if (!clickAudioSource) {
                return;
            }

            // Play the general tasbih click sound
            if (typeof clickAudioSource === 'string') {
                player.replace(clickAudioSource);
            } else {
                player.replace(clickAudioSource.uri);
            }

            player.play();
        } catch (error) {
            console.error('Error playing tasbih click sound:', error);
        }
    };
    const handleBeadPress = () => {
        if (isAnimating || count >= currentTargetCount) return; // Prevent multiple clicks during animation or if completed

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

        // Play audio only at START (first count) of each dhikr
        if (newCount === 1) {
            playAudio(); // Will show console log until stable audio solution is found
        } else {
            // Play general tasbih click sound for other taps (when no dhikr audio)
            playTasbihClickSound();
        }
    };

    const handleReset = async () => {
        const resetConfirmed = () => {
            return new Promise((resolve) => {
                if (Platform.OS === 'web') {
                    // Use browser's confirm for web
                    const confirmed = window.confirm(
                        'எண்ணிக்கையை மீட்டமைக்கவா?\n\nஇது முழு பல் எண்ணிக்கை தஸ்பீஹையும் மீட்டமைக்கும். தொடர விரும்புகிறீர்களா?'
                    );
                    resolve(confirmed);
                } else {
                    // Use React Native Alert for mobile
                    Alert.alert(
                        'எண்ணிக்கையை மீட்டமைக்கவா?',
                        'இது முழு பல் எண்ணிக்கை தஸ்பீஹையும் மீட்டமைக்கும். தொடர விரும்புகிறீர்களா?',
                        [
                            { text: 'இல்லை', style: 'cancel', onPress: () => resolve(false) },
                            {
                                text: 'மீட்டமை',
                                onPress: () => resolve(true),
                                style: 'destructive',
                            },
                        ],
                        { cancelable: false }
                    );
                }
            });
        };

        try {
            const confirmed = await resetConfirmed();
            if (confirmed) {
                resetAll();
            }
        } catch (error) {
            console.error('Error in reset confirmation:', error);
        }
    };

    const copyToClipboard = async () => {
        try {
            let textToCopy = '';

            if (currentItem.arabic) {
                textToCopy += `${currentItem.arabic}\n\n`;
            }

            if (currentItem.tamilTransliteration) {
                textToCopy += `${currentItem.tamilTransliteration}\n\n`;
            }

            if (currentItem.tamilTranslation) {
                textToCopy += `${currentItem.tamilTranslation}`;
            }

            // Add title reference
            textToCopy += `\n\n— ${currentTasbih.title}`;

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

            if (currentItem.arabic) {
                textToShare += `${currentItem.arabic}\n\n`;
            }

            if (currentItem.tamilTransliteration) {
                textToShare += `${currentItem.tamilTransliteration}\n\n`;
            }

            if (currentItem.tamilTranslation) {
                textToShare += `${currentItem.tamilTranslation}`;
            }

            // Add title reference
            textToShare += `\n\n— ${currentTasbih.title}`;

            // Add source attribution
            textToShare += `\n\nSource: https://al-quran-al-kareem-seven.vercel.app/`;

            await Share.share({
                message: textToShare,
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const getTotalProgress = () => {
        let totalCompleted = 0;
        let totalRequired = 0;

        items.forEach((item, index) => {
            totalRequired += item.count;
            if (index < currentIndex) {
                totalCompleted += item.count;
            } else if (index === currentIndex) {
                totalCompleted += Math.min(count, item.count);
            }
        });

        return { completed: totalCompleted, total: totalRequired };
    };

    const progress = getTotalProgress();
    const progressPercentage = (progress.completed / progress.total) * 100;

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Current Dhikr Display at Top */}
            <View style={styles.topDhikrDisplay}>
                <Text style={styles.topDhikrLabel}>தற்போது ஓதுவது</Text>
                {/* <Text style={styles.topDhikrArabic}>{currentItem?.arabic}</Text> */}
                <Text style={styles.topDhikrTransliteration}>{currentItem?.tamilTransliteration}</Text>
                {/* <Text style={styles.topDhikrCount}>
                    {currentIndex + 1} / {items.length} • {currentTargetCount} முறை
                </Text> */}
            </View>

            {/* Counter Display */}
            <View style={styles.counterContainer}>
                <Text style={styles.counterLabel}>தற்போதைய எண்ணிக்கை</Text>
                <Text style={styles.counterText}>{count}</Text>
                <Text style={styles.counterSubtext}>
                    {count >= currentTargetCount ? '✓ முடிந்தது!' : `${currentTargetCount - count} மீதம்`}
                </Text>
                <Text style={styles.targetText}>இலக்கு: {currentTargetCount}</Text>
            </View>

            {/* Tasbih Beads - Horizontal Rope */}
            {count < currentTargetCount && (
                <TouchableOpacity activeOpacity={0.8} onPress={handleBeadPress} disabled={isAnimating}>
                    <View style={styles.ropeContainer}>
                        <Text style={styles.tapInstruction}>👇 தொடவும்</Text>

                        {/* Horizontal Rope and Beads */}
                        <View style={styles.horizontalRopeWrapper}>
                            {/* Left side beads */}
                            <View style={styles.horizontalBeadGroup}>
                                {Array.from({ length: Math.min(TOTAL_BEADS - (count % TOTAL_BEADS), 5) }).map(
                                    (_, i) => (
                                        <View key={`left-${i}`} style={styles.horizontalBead}>
                                            <Ionicons name="ellipse" size={32} color="#FF6B6B" />
                                        </View>
                                    )
                                )}
                            </View>

                            {/* Horizontal rope line */}
                            <View style={styles.horizontalRope} />

                            {/* Center gap with moving bead */}
                            <View style={styles.horizontalCenterGap}>
                                {isAnimating && (
                                    <Animated.View
                                        style={[
                                            styles.horizontalMovingBead,
                                            {
                                                transform: [
                                                    {
                                                        translateX: moveAnim.interpolate({
                                                            inputRange: [0, 1],
                                                            outputRange: [-80, 80],
                                                        }),
                                                    },
                                                ],
                                            },
                                        ]}
                                    >
                                        <Ionicons name="ellipse" size={36} color="#FFD700" />
                                    </Animated.View>
                                )}
                            </View>

                            {/* Horizontal rope line */}
                            <View style={styles.horizontalRope} />

                            {/* Right side beads */}
                            <View style={styles.horizontalBeadGroup}>
                                {Array.from({ length: Math.min(count % TOTAL_BEADS, 5) }).map((_, i) => (
                                    <View key={`right-${i}`} style={styles.horizontalBead}>
                                        <Ionicons name="ellipse" size={32} color="#999" />
                                    </View>
                                ))}
                            </View>
                        </View>

                        {/* Bead counts */}
                        <View style={styles.horizontalBeadCounts}>
                            <Text style={styles.beadCountText}>{TOTAL_BEADS - (count % TOTAL_BEADS)} மீதம்</Text>
                            <Text style={styles.beadCountText}>{count % TOTAL_BEADS} முடிந்தது</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            )}

            {/* Completion message */}
            {count >= currentTargetCount && (
                <View style={styles.completionContainer}>
                    <Ionicons name="checkmark-circle" size={60} color="#4CAF50" />
                    <Text style={styles.completionText}>
                        {currentIndex === items.length - 1 ? '🎉 அனைத்தும் முடிந்தது!' : '✅ இந்த திக்ர் முடிந்தது!'}
                    </Text>
                    <Text style={styles.completionSubtext}>
                        {currentIndex === items.length - 1
                            ? 'அல்லாஹ் ஏற்றுக்கொள்வானாக, ஆமீன்'
                            : 'அடுத்த திக்ர் தொடங்கும்...'}
                    </Text>
                </View>
            )}

            {/* Progress Indicator */}
            <View style={styles.progressCard}>
                <View style={styles.progressHeader}>
                    <Text style={styles.progressTitle}>முன்னேற்றம்</Text>
                    <Text style={styles.progressText}>
                        {currentIndex + 1} / {items.length} திக்ர்கள்
                    </Text>
                </View>

                <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBar, { width: `${progressPercentage}%` }]} />
                </View>

                <View style={styles.progressLabels}>
                    <Text style={styles.progressLabel}>{progress.completed}</Text>
                    <Text style={styles.progressLabel}>{progress.total}</Text>
                </View>

                {/* Items indicator */}
                <View style={styles.itemsIndicator}>
                    {items.map((item, index) => (
                        <View key={index} style={styles.itemIndicator}>
                            <View
                                style={[
                                    styles.itemDot,
                                    index < currentIndex
                                        ? styles.completedDot
                                        : index === currentIndex
                                          ? styles.currentDot
                                          : styles.pendingDot,
                                ]}
                            />
                            <Text style={[styles.itemCount, index === currentIndex && styles.currentItemCount]}>
                                {item.count}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Current Tasbih Content */}
            {currentItem && (
                <View style={styles.contentCard}>
                    <View style={styles.contentHeader}>
                        <Text style={styles.contentTitle}>
                            திக்ர் {currentIndex + 1} / {items.length}
                        </Text>
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
                        <Text style={styles.arabicText}>{currentItem.arabic}</Text>
                    </View>

                    <View style={styles.transliterationContainer}>
                        <Text style={styles.transliterationText}>{currentItem.tamilTransliteration}</Text>
                    </View>

                    <View style={styles.translationContainer}>
                        <Text style={styles.translationText}>{currentItem.tamilTranslation}</Text>
                    </View>

                    {/* Hadith Section */}
                    {currentItem.haith && currentItem.haith.length > 0 && (
                        <View style={styles.hadithContainer}>
                            <View style={styles.hadithHeader}>
                                <Ionicons name="book" size={16} color="#8B4513" />
                                <Text style={styles.hadithHeaderText}>ஹதீஸ்</Text>
                            </View>
                            {currentItem.haith &&
                                currentItem.haith.map((hadith, index) => (
                                    <View key={index} style={styles.hadithItem}>
                                        {hadith.text && hadith.text.trim() !== '' && (
                                            <Text style={styles.hadithText}>{hadith.text}</Text>
                                        )}
                                        {hadith.ref && hadith.ref.trim() !== '' && (
                                            <Text style={styles.hadithRef}>{hadith.ref}</Text>
                                        )}
                                    </View>
                                ))}
                        </View>
                    )}
                </View>
            )}

            {/* Reset Button */}
            <TouchableOpacity style={styles.resetButton} onPress={handleReset} activeOpacity={0.7}>
                <Ionicons name="reload" size={24} color="#fff" />
                <Text style={styles.resetButtonText}>மீட்டமை</Text>
            </TouchableOpacity>

            {/* Instructions */}
            <View style={styles.instructionsCard}>
                <View style={styles.instructionItem}>
                    <Ionicons name="layers" size={20} color="#FF6B6B" />
                    <Text style={styles.instructionText}>ஒவ்வொரு திக்ரும் குறிப்பிட்ட எண்ணிக்கையில் முடிக்கவும்</Text>
                </View>
                <View style={styles.instructionItem}>
                    <Ionicons name="arrow-forward" size={20} color="#FF6B6B" />
                    <Text style={styles.instructionText}>முடிந்தவுடன் தானாக அடுத்த திக்ர் தொடங்கும்</Text>
                </View>
                <View style={styles.instructionItem}>
                    <Ionicons name="calendar" size={20} color="#FF6B6B" />
                    <Text style={styles.instructionText}>முன்னேற்றம் ஒரு நாளுக்கு சேமிக்கப்படும்</Text>
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
    topDhikrDisplay: {
        backgroundColor: '#2E8B57',
        paddingHorizontal: 16,
        paddingVertical: 20,
        alignItems: 'center',
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        elevation: 4,
    },
    topDhikrLabel: {
        fontSize: 12,
        color: '#fff',
        opacity: 0.9,
        marginBottom: 8,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    topDhikrArabic: {
        fontSize: 28,
        color: '#fff',
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
        lineHeight: 40,
    },
    topDhikrTransliteration: {
        fontSize: 18,
        color: '#fff',
        fontWeight: '600',
        marginBottom: 8,
        textAlign: 'center',
    },
    topDhikrCount: {
        fontSize: 12,
        color: '#fff',
        opacity: 0.9,
        fontWeight: '500',
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
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FF6B6B',
        marginLeft: 12,
    },
    progressCard: {
        backgroundColor: '#fff',
        margin: 16,
        padding: 16,
        borderRadius: 12,
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
        elevation: 3,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    progressTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2E8B57',
    },
    progressText: {
        fontSize: 14,
        color: '#666',
    },
    progressBarContainer: {
        height: 8,
        backgroundColor: '#e0e0e0',
        borderRadius: 4,
        marginBottom: 8,
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#4CAF50',
        borderRadius: 4,
    },
    progressLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    progressLabel: {
        fontSize: 12,
        color: '#666',
        fontWeight: '600',
    },
    itemsIndicator: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemIndicator: {
        alignItems: 'center',
        flex: 1,
    },
    itemDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginBottom: 4,
    },
    completedDot: {
        backgroundColor: '#4CAF50',
    },
    currentDot: {
        backgroundColor: '#FF6B6B',
    },
    pendingDot: {
        backgroundColor: '#e0e0e0',
    },
    itemCount: {
        fontSize: 10,
        color: '#666',
        fontWeight: '600',
    },
    currentItemCount: {
        color: '#FF6B6B',
        fontWeight: 'bold',
    },
    contentCard: {
        backgroundColor: '#fff',
        margin: 16,
        marginTop: 0,
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
        borderBottomColor: '#FF6B6B',
    },
    contentTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FF6B6B',
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
        marginBottom: 12,
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
    hadithItem: {
        marginBottom: 8,
    },
    hadithText: {
        fontSize: 14,
        lineHeight: 22,
        color: '#333',
        marginBottom: 4,
    },
    hadithRef: {
        fontSize: 12,
        color: '#8B4513',
        fontStyle: 'italic',
    },
    counterContainer: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginTop: 16,
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
        color: '#FF6B6B',
    },
    counterSubtext: {
        fontSize: 14,
        color: '#999',
        marginTop: 8,
    },
    targetText: {
        fontSize: 12,
        color: '#2E8B57',
        marginTop: 4,
        fontWeight: '600',
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
        color: '#FF6B6B',
        textAlign: 'center',
        marginBottom: 20,
    },
    ropeWrapper: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 200,
        position: 'relative',
    },
    beadGroup: {
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
    },
    bead: {
        marginVertical: 2,
    },
    horizontalRopeWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 80,
        position: 'relative',
    },
    horizontalBeadGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    horizontalBead: {
        marginHorizontal: 3,
    },
    horizontalRope: {
        height: 6,
        flex: 1,
        backgroundColor: '#8B7355',
        marginHorizontal: 12,
        borderRadius: 3,
        borderWidth: 1,
        borderColor: '#654321',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
        elevation: 2,
    },
    horizontalCenterGap: {
        width: 160,
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    horizontalMovingBead: {
        position: 'absolute',
    },
    horizontalBeadCounts: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    beadCountText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    movingBead: {
        position: 'absolute',
    },
    completionContainer: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginVertical: 16,
        padding: 32,
        borderRadius: 12,
        alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
        elevation: 3,
    },
    completionText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#4CAF50',
        marginTop: 16,
        textAlign: 'center',
    },
    completionSubtext: {
        fontSize: 14,
        color: '#666',
        marginTop: 8,
        textAlign: 'center',
    },
    resetButton: {
        backgroundColor: '#FF6B6B',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 16,
        padding: 16,
        borderRadius: 12,
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
        elevation: 3,
    },
    resetButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    instructionsCard: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginTop: 16,
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
        color: '#333',
        marginLeft: 12,
        lineHeight: 20,
        flex: 1,
    },
});

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView, Alert, Share, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer } from 'expo-audio'; // Same as other working screens
import * as Clipboard from 'expo-clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAudioSource } from '../utils/audioAssets';
import TasbihChart from '../components/TasbihChart';
import { tasbih_beads } from '../data/tasbih_beads/tableOfContent';

const TOTAL_BEADS = 33; // Total beads to display

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

export default function TasbihSingleDetailScreen({ route }) {
    const { item, index, title } = route.params;
    const [count, setCount] = useState(0);
    const [sound, setSound] = useState(null);
    const [isResetting, setIsResetting] = useState(false);
    const [isLoading, setIsLoading] = useState(true); // Prevent saves until loaded
    const [dailyHistory, setDailyHistory] = useState({}); // Store last 5 days
    const [showChart, setShowChart] = useState(false); // Toggle chart visibility
    const player = useAudioPlayer(); // Same as other working screens
    const moveAnim = useRef(new Animated.Value(0)).current;
    const [isAnimating, setIsAnimating] = useState(false);
    const countRef = useRef(0); // Keep track of current count for reliable saves
    const hasLoadedRef = useRef(false); // Prevent multiple loads

    const STORAGE_KEY = `tasbih_single_count_${index}`;
    const STORAGE_DATE_KEY = `tasbih_single_date_${index}`;
    const STORAGE_HISTORY_KEY = `tasbih_single_history_${index}`;

    // Get last 7 days including today (keeping for backward compatibility)
    const getLast5Days = () => {
        const today = new Date();
        const days = [];
        for (let i = 4; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            days.push({
                date: date.toDateString(),
                shortDate: date.getDate().toString(),
                isToday: i === 0,
            });
        }
        return days;
    };

    useEffect(() => {
        if (!hasLoadedRef.current) {
            hasLoadedRef.current = true;
            loadCount();
        }
        return () => {
            if (player.playing) {
                player.pause();
            }
        };
    }, []);

    useEffect(() => {
        if (!isResetting && !isLoading) {
            // Update ref and save immediately
            countRef.current = count;
            saveCount();
        } else {
            console.log(
                `Count changed to ${count} but isResetting: ${isResetting}, isLoading: ${isLoading}, not saving`
            );
        }
    }, [count, isResetting, isLoading]);

    const loadCount = async () => {
        try {
            const storedDate = await PlatformStorage.getItem(STORAGE_DATE_KEY);
            const storedCount = await PlatformStorage.getItem(STORAGE_KEY);
            const storedHistory = await PlatformStorage.getItem(STORAGE_HISTORY_KEY);
            const today = new Date().toDateString();

            // Load history
            let history = {};
            if (storedHistory) {
                try {
                    history = JSON.parse(storedHistory);
                } catch (e) {
                    console.error('Error parsing history:', e);
                }
            }
            setDailyHistory(history);

            if (storedDate === today) {
                // Same day - load the stored count
                if (storedCount !== null) {
                    const parsedCount = parseInt(storedCount, 10);
                    setCount(parsedCount);
                    countRef.current = parsedCount; // Update ref
                } else {
                    setCount(0);
                    countRef.current = 0; // Update ref
                }
            } else {
                // Different day - reset for new day but keep history
                setCount(0);
                countRef.current = 0; // Update ref
                await PlatformStorage.setItem(STORAGE_DATE_KEY, today);
                await PlatformStorage.setItem(STORAGE_KEY, '0');
            }

            // Mark loading as complete so saves can begin
            setIsLoading(false);
        } catch (error) {
            console.error('Error loading count:', error);
            setCount(0);
            countRef.current = 0; // Update ref
            setDailyHistory({});
        }
    };
    const saveCount = async () => {
        try {
            const today = new Date().toDateString();

            // Save current count
            await PlatformStorage.setItem(STORAGE_KEY, count.toString());
            await PlatformStorage.setItem(STORAGE_DATE_KEY, today);

            // Update daily history
            const updatedHistory = { ...dailyHistory };
            updatedHistory[today] = count;

            // Keep only last 30 days to prevent storage bloat
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            Object.keys(updatedHistory).forEach((date) => {
                if (new Date(date) < thirtyDaysAgo) {
                    delete updatedHistory[date];
                }
            });

            setDailyHistory(updatedHistory);
            await PlatformStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(updatedHistory));
        } catch (error) {
            console.error('Error saving count:', error);
        }
    };

    const playAudio = async () => {
        try {
            // Stop previous audio if any
            if (sound) {
                await player.pause();
                setSound(null);
            }

            // Check if item has audio
            if (!item.audio || item.audio === '') {
                return;
            }

            // Get the audio source using your existing audioAssets system
            const audioSource = getAudioSource(item.audio);
            if (!audioSource) {
                return;
            }

            console.log(`🔊 Playing audio: ${item.audio} for "${item.arabic}"`);

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

        // Play audio at first count and every 30 counts for single dhikr
        if (newCount === 1 || newCount % 30 === 0) {
            playAudio(); // Re-enabled with stable expo-av
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
                        'எண்ணிக்கையை மீட்டமைக்கவா?\n\nஎண்ணிக்கையை பூஜ்ஜியமாக மீட்டமைக்க விரும்புகிறீர்களா?'
                    );
                    resolve(confirmed);
                } else {
                    // Use React Native Alert for mobile
                    Alert.alert(
                        'எண்ணிக்கையை மீட்டமைக்கவா?',
                        'எண்ணிக்கையை பூஜ்ஜியமாக மீட்டமைக்க விரும்புகிறீர்களா?',
                        [
                            {
                                text: 'இல்லை',
                                style: 'cancel',
                                onPress: () => {
                                    resolve(false);
                                },
                            },
                            {
                                text: 'மீட்டமை (Reset for today)',
                                onPress: () => {
                                    resolve(true);
                                },
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
                setIsResetting(true);
                setCount(0);
                countRef.current = 0; // Update ref

                // Clear current count and today's history
                const today = new Date().toDateString();
                const updatedHistory = { ...dailyHistory };
                updatedHistory[today] = 0; // Reset today's count in history
                setDailyHistory(updatedHistory);

                await PlatformStorage.setItem(STORAGE_KEY, '0');
                await PlatformStorage.setItem(STORAGE_DATE_KEY, today);
                await PlatformStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(updatedHistory));

                setIsResetting(false);
            } else {
                console.log('Reset cancelled by user');
            }
        } catch (error) {
            console.error('Error resetting count:', error);
            setIsResetting(false);
        }
    };

    const copyToClipboard = async () => {
        try {
            let textToCopy = '';

            if (item.arabic) {
                textToCopy += `${item.arabic}\n\n`;
            }

            if (item.tamilTransliteration) {
                textToCopy += `${item.tamilTransliteration}\n\n`;
            }

            if (item.tamilTranslation) {
                textToCopy += `${item.tamilTranslation}`;
            }

            // Add title reference
            textToCopy += `\n\n— ${item.title}`;

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

            if (item.arabic) {
                textToShare += `${item.arabic}\n\n`;
            }

            if (item.tamilTransliteration) {
                textToShare += `${item.tamilTransliteration}\n\n`;
            }

            if (item.tamilTranslation) {
                textToShare += `${item.tamilTranslation}`;
            }

            // Add title reference
            textToShare += `\n\n— ${item.title}`;

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
            {/* Counter Display */}
            <View style={styles.counterContainer}>
                <View style={styles.counterHeader}>
                    <View style={styles.counterInfo}>
                        <Text style={styles.counterLabel}>எண்ணிக்கை</Text>
                        <Text style={styles.counterText}>{count}</Text>
                        <Text style={styles.counterSubtext}>
                            {count % 100 === 0 && count > 0
                                ? '✓ 100 முடிந்தது!'
                                : `அடுத்த 100க்கு ${100 - (count % 100)} மீதம்`}
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={styles.chartToggleButton}
                        onPress={() => setShowChart(!showChart)}
                        activeOpacity={0.7}
                    >
                        <Ionicons name={showChart ? 'bar-chart' : 'bar-chart-outline'} size={24} color="#4CAF50" />
                        <Text style={styles.chartToggleText}>{showChart ? 'அட்டவணை மறை' : 'அட்டவணை காட்டு'}</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Chart Display - Conditionally rendered */}
            {showChart && <TasbihChart dailyHistory={dailyHistory} title={`${item.title} - முன்னேற்ற அட்டவணை`} />}

            {/* Tasbih Beads - Horizontal Rope */}
            <TouchableOpacity activeOpacity={0.8} onPress={handleBeadPress} disabled={isAnimating}>
                <View style={styles.ropeContainer}>
                    <Text style={styles.tapInstruction}>👇 தொடவும்</Text>

                    {/* Horizontal Rope and Beads */}
                    <View style={styles.horizontalRopeWrapper}>
                        {/* Left side beads */}
                        <View style={styles.horizontalBeadGroup}>
                            {Array.from({ length: Math.min(TOTAL_BEADS - (count % TOTAL_BEADS), 5) }).map((_, i) => (
                                <View key={`left-${i}`} style={styles.horizontalBead}>
                                    <Ionicons name="ellipse" size={32} color="#4CAF50" />
                                </View>
                            ))}
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
                                    <Ionicons name="ellipse" size={36} color="#FF6B6B" />
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
                    <Text style={styles.arabicText}>{item.arabic}</Text>
                </View>

                <View style={styles.transliterationContainer}>
                    <Text style={styles.transliterationText}>{item.tamilTransliteration || ''}</Text>
                </View>

                {item.tamilTranslation && item.tamilTranslation.trim() !== '' ? (
                    <View style={styles.translationContainer}>
                        <Text style={styles.translationText}>{item.tamilTranslation}</Text>
                    </View>
                ) : null}

                {item.haith && item.haith.length > 0 ? (
                    <View style={styles.hadithContainer}>
                        <View style={styles.hadithHeader}>
                            <Ionicons name="book" size={16} color="#8B4513" />
                            <Text style={styles.hadithHeaderText}>ஹதீஸ்</Text>
                        </View>
                        {item.haith
                            ? item.haith.map((hadith, index) => (
                                  <View key={index} style={styles.hadithItem}>
                                      {hadith.text && hadith.text.trim() !== '' ? (
                                          <Text style={styles.hadithText}>{hadith.text}</Text>
                                      ) : null}
                                      {hadith.ref && hadith.ref.trim() !== '' ? (
                                          <Text style={styles.hadithRef}>{hadith.ref}</Text>
                                      ) : null}
                                  </View>
                              ))
                            : null}
                    </View>
                ) : null}
            </View>

            {/* Reset Button */}
            <TouchableOpacity style={styles.resetButton} onPress={handleReset} activeOpacity={0.7}>
                <Ionicons name="reload" size={24} color="#fff" />
                <Text style={styles.resetButtonText}>மீட்டமை (Reset)</Text>
            </TouchableOpacity>

            {/* Instructions */}
            <View style={styles.instructionsCard}>
                <View style={styles.instructionItem}>
                    <Ionicons name="hand-left" size={20} color="#4CAF50" />
                    <Text style={styles.instructionText}>கயிற்றைத் தொட்டு மணி ஒன்றை நகர்த்தவும்</Text>
                </View>
                {/* <View style={styles.instructionItem}>
                    <Ionicons name="arrow-down" size={20} color="#4CAF50" />
                    <Text style={styles.instructionText}>மேலிருந்து கீழாக மணிகள் நகரும்</Text>
                </View> */}
                <View style={styles.instructionItem}>
                    <Ionicons name="musical-note" size={20} color="#4CAF50" />
                    <Text style={styles.instructionText}>ஒவ்வொரு 30 எண்ணிக்கையிலும் ஒலி ஒலிக்கும்</Text>
                </View>
                <View style={styles.instructionItem}>
                    <Ionicons name="calendar" size={20} color="#4CAF50" />
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
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4CAF50',
        marginLeft: 12,
    },
    contentCard: {
        backgroundColor: '#fff',
        margin: 16,
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
    },
    contentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 2,
        borderBottomColor: '#4CAF50',
    },
    contentTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 4,
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
    hadithItem: {
        marginBottom: 12,
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
        fontWeight: '600',
    },
    counterContainer: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        padding: 24,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
    },
    counterHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    },
    counterInfo: {
        alignItems: 'center',
        flex: 1,
    },
    counterLabel: {
        fontSize: 16,
        color: '#666',
        marginBottom: 8,
    },
    counterText: {
        fontSize: 72,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    counterSubtext: {
        fontSize: 14,
        color: '#999',
        marginTop: 8,
    },
    chartToggleButton: {
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#e8f5e9',
        borderWidth: 1,
        borderColor: '#4CAF50',
    },
    chartToggleText: {
        fontSize: 10,
        color: '#4CAF50',
        fontWeight: '600',
        marginTop: 4,
        textAlign: 'center',
    },
    ropeContainer: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginVertical: 16,
        padding: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
    },
    tapInstruction: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4CAF50',
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
        justifyContent: 'space-between',
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
        justifyContent: 'space-between',
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
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
    resetButton: {
        backgroundColor: '#FF6B6B',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 16,
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
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

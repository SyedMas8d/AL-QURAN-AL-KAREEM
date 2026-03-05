import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { getSuraData } from '../data/dataService';

const SuraDetailScreen = ({ route }) => {
    const { sura } = route.params;
    const [suraData, setSuraData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sound, setSound] = useState(null);
    const [playingAyah, setPlayingAyah] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playingAll, setPlayingAll] = useState(false);
    const [paused, setPaused] = useState(false);
    const [currentAyahIndex, setCurrentAyahIndex] = useState(0);
    const [playingBismillah, setPlayingBismillah] = useState(false);
    const scrollViewRef = useRef(null);
    const ayahRefs = useRef({});
    const ayahPositions = useRef({});

    // Bismillah audio URL (Ayah 1 from Sura 1)
    const BISMILLAH_AUDIO_URL = 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3';

    useEffect(() => {
        loadSuraData();
        setupAudio();
        return () => {
            if (sound) {
                sound.unloadAsync();
            }
        };
    }, []);

    const setupAudio = async () => {
        try {
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: Boolean(false),
                staysActiveInBackground: Boolean(false),
                interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
                playsInSilentModeIOS: Boolean(true),
                shouldDuckAndroid: Boolean(true),
                interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
                playThroughEarpieceAndroid: Boolean(false),
            });
        } catch (error) {
            console.error('Error setting up audio mode:', error);
        }
    };

    const loadSuraData = async () => {
        try {
            const data = await getSuraData(sura.number);
            // Ensure proper data types
            if (data && data.ayahs) {
                data.ayahs = data.ayahs.map((ayah) => ({
                    ...ayah,
                    number: Number(ayah.number),
                    numberInSurah: Number(ayah.numberInSurah),
                    sajda: Boolean(ayah.sajda === true || ayah.sajda === 'true'),
                }));
            }
            setSuraData(data);
        } catch (error) {
            console.error('Error loading sura data:', error);
        } finally {
            setLoading(false);
        }
    };

    const playAyah = async (ayahNumber) => {
        try {
            // Stop current audio if playing
            if (sound) {
                await sound.unloadAsync();
                setSound(null);
            }

            setPlayingAyah(ayahNumber);
            setIsPlaying(true);

            // Load and play new audio
            const audioUrl = `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayahNumber}.mp3`;
            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: audioUrl },
                {
                    shouldPlay: Boolean(true),
                    isLooping: Boolean(false),
                    volume: 1.0,
                }
            );

            setSound(newSound);

            newSound.setOnPlaybackStatusUpdate((status) => {
                if (status.didJustFinish) {
                    setIsPlaying(false);
                    setPlayingAyah(null);
                }
            });
        } catch (error) {
            console.error('Error playing ayah:', error);
            setIsPlaying(false);
            setPlayingAyah(null);
        }
    };

    const stopAyah = async () => {
        try {
            if (sound) {
                await sound.stopAsync();
                setIsPlaying(false);
                setPlayingAyah(null);
                setPlayingAll(false);
            }
        } catch (error) {
            console.error('Error stopping ayah:', error);
        }
    };

    // --- Play All, Pause, Resume, Stop Logic ---
    const playAllAyahs = async () => {
        if (playingAll && !paused) {
            // Stop all
            await stopAyah();
            setPlayingAll(false);
            setPaused(false);
            setCurrentAyahIndex(0);
            setPlayingBismillah(false);
            return;
        }
        if (paused) {
            // Resume
            setPaused(false);
            if (sound) {
                await sound.playAsync();
            }
            return;
        }
        if (!suraData || !suraData.ayahs || suraData.ayahs.length === 0) return;

        setPlayingAll(true);
        setPaused(false);

        // Check if we need to play Bismillah first
        // All Suras except Sura 1 (Al-Fatihah) and Sura 9 (At-Tawbah) should start with Bismillah
        const needsBismillah = sura.number !== 1 && sura.number !== 9;

        if (needsBismillah) {
            setPlayingBismillah(true);
            setCurrentAyahIndex(-1); // -1 indicates we're playing Bismillah
        } else {
            setPlayingBismillah(false);
            setCurrentAyahIndex(0);
        }
    };

    // Pause All
    const pauseAllAyahs = async () => {
        if (playingAll && !paused && sound) {
            await sound.pauseAsync();
            setPaused(true);
        }
    };

    // Sequential playback effect
    useEffect(() => {
        let isCancelled = false;
        const playCurrentAyah = async () => {
            if (!playingAll || paused || !suraData || !suraData.ayahs) return;

            // Play Bismillah first (if needed)
            if (currentAyahIndex === -1 && playingBismillah) {
                try {
                    if (sound) {
                        await sound.unloadAsync();
                        setSound(null);
                    }

                    setPlayingAyah('bismillah');
                    setIsPlaying(true);

                    // Scroll to top to show Bismillah
                    setTimeout(() => {
                        if (scrollViewRef.current) {
                            scrollViewRef.current.scrollTo({
                                y: 0,
                                animated: true,
                            });
                        }
                    }, 150);

                    const { sound: newSound } = await Audio.Sound.createAsync(
                        { uri: BISMILLAH_AUDIO_URL },
                        {
                            shouldPlay: Boolean(true),
                            isLooping: Boolean(false),
                            volume: 1.0,
                        }
                    );

                    setSound(newSound);

                    newSound.setOnPlaybackStatusUpdate((status) => {
                        if (status.didJustFinish && playingAll && !paused && !isCancelled) {
                            setPlayingBismillah(false);
                            setCurrentAyahIndex(0); // Move to first ayah
                        }
                    });
                } catch (error) {
                    console.error('Error playing Bismillah:', error);
                    setPlayingBismillah(false);
                    setCurrentAyahIndex(0);
                }
                return;
            }

            const ayahs = suraData.ayahs;
            if (currentAyahIndex >= ayahs.length) {
                setPlayingAll(false);
                setPlayingAyah(null);
                setIsPlaying(false);
                setCurrentAyahIndex(0);
                setPlayingBismillah(false);
                return;
            }
            const ayah = ayahs[currentAyahIndex];
            const ayahNumber = Number(ayah.number);
            try {
                if (sound) {
                    await sound.unloadAsync();
                    setSound(null);
                }
                setPlayingAyah(ayahNumber);
                setIsPlaying(true);
                // Auto-scroll using pre-captured positions
                setTimeout(() => {
                    const ayahY = ayahPositions.current[ayahNumber];
                    if (ayahY !== undefined && scrollViewRef.current) {
                        // Scroll to show the ayah with appropriate offset
                        // Leave some space at the top (80px for controls and padding)
                        const scrollTo = Math.max(0, ayahY - 20);
                        scrollViewRef.current.scrollTo({
                            y: scrollTo,
                            animated: true,
                        });
                    }
                }, 150);
                const audioUrl = `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayahNumber}.mp3`;
                const { sound: newSound } = await Audio.Sound.createAsync(
                    { uri: audioUrl },
                    {
                        shouldPlay: Boolean(true),
                        isLooping: Boolean(false),
                        volume: 1.0,
                    }
                );
                setSound(newSound);
                newSound.setOnPlaybackStatusUpdate((status) => {
                    if (status.didJustFinish && playingAll && !paused && !isCancelled) {
                        setCurrentAyahIndex((idx) => idx + 1);
                    }
                });
            } catch (error) {
                console.error('Error playing ayah:', error);
                if (playingAll && !paused && !isCancelled) {
                    setCurrentAyahIndex((idx) => idx + 1);
                }
            }
        };
        if (playingAll && !paused) {
            playCurrentAyah();
        }
        return () => {
            isCancelled = true;
        };
        // eslint-disable-next-line
    }, [playingAll, paused, currentAyahIndex, playingBismillah, suraData]);

    const renderAyah = (ayah) => {
        const ayahNumber = Number(ayah.number);
        const isCurrentlyPlaying = playingAyah === ayahNumber && isPlaying;

        return (
            <View
                key={ayahNumber}
                ref={(ref) => {
                    ayahRefs.current[ayahNumber] = ref;
                }}
                onLayout={(event) => {
                    const { y } = event.nativeEvent.layout;
                    ayahPositions.current[ayahNumber] = y;
                }}
                style={[styles.ayahContainer, isCurrentlyPlaying && styles.ayahContainerHighlight]}
            >
                <View style={styles.ayahHeader}>
                    <TouchableOpacity
                        style={styles.playButton}
                        onPress={() => (isCurrentlyPlaying ? stopAyah() : playAyah(ayahNumber))}
                        activeOpacity={Number(0.7)}
                    >
                        <Ionicons
                            name={isCurrentlyPlaying ? 'stop' : 'play'}
                            size={Number(20)}
                            color={String('#fff')}
                        />
                    </TouchableOpacity>
                    <View style={styles.ayahNumber}>
                        <Text style={styles.ayahNumberText}>{String(ayah.numberInSurah)}</Text>
                    </View>
                </View>

                <View style={styles.ayahContent}>
                    <Text style={styles.arabicText}>{String(ayah.text)}</Text>
                    <Text style={styles.transliterationText}>{String(ayah.tamilTransliteration)}</Text>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size={String('large')} color={String('#2E8B57')} animating={Boolean(true)} />
                <Text style={styles.loadingText}>Loading Surah...</Text>
            </View>
        );
    }

    if (!suraData) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.errorText}>Failed to load Surah data</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Static Play All Controls */}
            <View style={styles.staticControls}>
                <TouchableOpacity style={styles.playAllButton} onPress={playAllAyahs} activeOpacity={0.7}>
                    <Ionicons
                        name={playingAll && !paused ? 'stop-circle' : 'play-circle'}
                        size={32}
                        color={'#2E8B57'}
                    />
                    <Text style={styles.playAllText}>{playingAll && !paused ? 'Stop All' : 'Play All'}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.playAllButton,
                        { marginLeft: 12, backgroundColor: paused ? '#ffe082' : '#f0f9f4', borderColor: '#fbc02d' },
                    ]}
                    onPress={pauseAllAyahs}
                    disabled={!playingAll || paused}
                    activeOpacity={0.7}
                >
                    <Ionicons name={'pause-circle'} size={32} color={paused ? '#fbc02d' : '#2E8B57'} />
                    <Text style={[styles.playAllText, { color: paused ? '#fbc02d' : '#2E8B57' }]}>
                        {paused ? 'Paused' : 'Pause'}
                    </Text>
                </TouchableOpacity>
            </View>
            <ScrollView
                ref={scrollViewRef}
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled={true}
            >
                {/* Surah Header */}
                <View style={styles.suraHeader}>
                    <Text style={styles.arabicName}>{String(suraData.name)}</Text>
                    <Text style={styles.englishName}>{String(suraData.tamilName)}</Text>
                    <Text style={styles.translation}>{String(suraData.tamilNameTranslation)}</Text>
                    <View style={styles.metaInfo}>
                        <Text style={styles.metaText}>
                            {String(suraData.revelationType)} • {String(suraData.numberOfAyahs)} Ayahs
                        </Text>
                    </View>
                </View>
                {/* Bismillah */}
                <View style={[styles.bismillahContainer, playingAyah === 'bismillah' && styles.ayahContainerHighlight]}>
                    <Text style={styles.bismillahText}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</Text>
                </View>
                {/* Ayahs */}
                {suraData.ayahs.map(renderAyah)}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        paddingTop: 50,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    errorText: {
        fontSize: 16,
        color: '#e74c3c',
        textAlign: 'center',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    suraHeader: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 24,
        marginBottom: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    arabicName: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#1a5c3a',
        marginBottom: 12,
        textAlign: 'center',
        lineHeight: 48,
    },
    englishName: {
        fontSize: 22,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    translation: {
        fontSize: 16,
        color: '#666',
        marginBottom: 12,
        fontStyle: 'italic',
    },
    metaInfo: {
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    metaText: {
        fontSize: 14,
        color: '#999',
    },
    staticControls: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        zIndex: 2,
    },
    playAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f9f4',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: '#2E8B57',
    },
    playAllText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2E8B57',
        marginLeft: 8,
    },
    bismillahContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    bismillahText: {
        fontSize: 30,
        color: '#1a5c3a',
        fontWeight: 'bold',
        textAlign: 'center',
        lineHeight: 42,
    },
    ayahContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    ayahContainerHighlight: {
        backgroundColor: '#e8f5e9',
        borderWidth: 2,
        borderColor: '#2E8B57',
        shadowOpacity: 0.15,
        shadowRadius: 4,
    },
    ayahHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    playButton: {
        backgroundColor: '#2E8B57',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    ayahNumber: {
        backgroundColor: '#f0f0f0',
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    ayahNumberText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#666',
    },
    ayahContent: {
        paddingLeft: 8,
        paddingRight: 4,
    },
    arabicText: {
        fontSize: 28,
        lineHeight: 48,
        color: '#2c3e50',
        textAlign: 'right',
        marginBottom: 16,
        fontWeight: '600',
    },
    transliterationText: {
        fontSize: 20,
        lineHeight: 32,
        color: '#2E8B57',
        fontWeight: '600',
        fontStyle: 'normal',
    },
});

export default SuraDetailScreen;

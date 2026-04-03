import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { getSignificantData } from '../data/dataService';

const SignificantDetailScreen = ({ route }) => {
    const { item, type } = route.params;
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sound, setSound] = useState(null);
    const [playingAyah, setPlayingAyah] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playingAll, setPlayingAll] = useState(false);
    const [paused, setPaused] = useState(false);
    const [currentAyahIndex, setCurrentAyahIndex] = useState(0);
    const [showTranslation, setShowTranslation] = useState(false);
    const scrollViewRef = useRef(null);
    const ayahRefs = useRef({});
    const ayahPositions = useRef({});

    useEffect(() => {
        loadData();
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
                allowsRecordingIOS: false,
                staysActiveInBackground: false,
                playsInSilentModeIOS: true,
                shouldDuckAndroid: true,
                playThroughEarpieceAndroid: false,
            });
        } catch (error) {
            console.error('Error setting up audio mode:', error);
        }
    };

    const loadData = async () => {
        try {
            const result = await getSignificantData(item.path);
            setData(result);
        } catch (error) {
            console.error('Error loading significant data:', error);
        } finally {
            setLoading(false);
        }
    };

    const playAyah = async (ayahNumber) => {
        try {
            if (sound) {
                await sound.unloadAsync();
                setSound(null);
            }

            setPlayingAyah(ayahNumber);
            setIsPlaying(true);

            const audioUrl = `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayahNumber}.mp3`;
            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: audioUrl },
                {
                    shouldPlay: true,
                    isLooping: false,
                    volume: 1.0,
                }
            );

            setSound(newSound);

            newSound.setOnPlaybackStatusUpdate((status) => {
                if (status.didJustFinish) {
                    setIsPlaying(false);
                    setPlayingAyah(null);
                    setShowTranslation(true);
                }
            });
        } catch (error) {
            console.error('Error playing audio:', error);
            setIsPlaying(false);
            setPlayingAyah(null);
        }
    };

    const stopAudio = async () => {
        try {
            if (sound) {
                await sound.stopAsync();
                await sound.unloadAsync();
                setSound(null);
                setIsPlaying(false);
                setPlayingAyah(null);
                setPlayingAll(false);
                setPaused(false);
                setShowTranslation(true);
            }
        } catch (error) {
            console.error('Error stopping audio:', error);
        }
    };

    // --- Play All, Pause, Resume, Stop Logic ---
    const playAllAyahs = async () => {
        const ayahs = data?.data || data?.ayahs || [];

        if (playingAll && !paused) {
            // Stop all
            await stopAudio();
            setPlayingAll(false);
            setPaused(false);
            setCurrentAyahIndex(0);
            return;
        }
        if (paused) {
            // Resume
            setPaused(false);
            setShowTranslation(false);
            if (sound) {
                await sound.playAsync();
            }
            return;
        }
        if (!data || ayahs.length === 0) return;

        setPlayingAll(true);
        setPaused(false);
        setShowTranslation(false);
        setCurrentAyahIndex(0);
    };

    // Pause All
    const pauseAllAyahs = async () => {
        if (playingAll && !paused && sound) {
            await sound.pauseAsync();
            setPaused(true);
            setShowTranslation(true);
        }
    };

    // --- Effect to play ayahs continuously when playingAll is active ---
    useEffect(() => {
        let isCancelled = false;
        const ayahs = data?.data || data?.ayahs || [];

        const playCurrentAyah = async () => {
            if (!playingAll || paused || !ayahs) return;
            if (currentAyahIndex >= ayahs.length) {
                setPlayingAll(false);
                setPaused(false);
                setCurrentAyahIndex(0);
                setShowTranslation(true);
                return;
            }
            const ayah = ayahs[currentAyahIndex];
            const ayahNumber = ayah.number || ayah.numberInSurah;

            try {
                if (sound) {
                    await sound.unloadAsync();
                    setSound(null);
                }
                setPlayingAyah(ayahNumber);
                setIsPlaying(true);

                // Auto-scroll
                setTimeout(() => {
                    const ayahY = ayahPositions.current[ayahNumber];
                    if (ayahY !== undefined && scrollViewRef.current) {
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
                        shouldPlay: true,
                        isLooping: false,
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
    }, [playingAll, paused, currentAyahIndex, data]);

    const renderAyah = (ayah, index) => {
        const ayahNumber = ayah.number || ayah.numberInSurah;
        const isCurrentlyPlaying = playingAyah === ayahNumber && isPlaying;

        return (
            <View
                key={index}
                ref={(ref) => {
                    ayahRefs.current[ayahNumber] = ref;
                }}
                onLayout={(event) => {
                    const { y } = event.nativeEvent.layout;
                    ayahPositions.current[ayahNumber] = y;
                }}
                style={[styles.ayahContainer, isCurrentlyPlaying && styles.playingAyah]}
            >
                <View style={styles.ayahHeader}>
                    <View style={styles.ayahNumberBadge}>
                        <Text style={styles.ayahNumberText}>{ayah.numberInSurah || index + 1}</Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.playButton, isCurrentlyPlaying && styles.playingButton]}
                        onPress={() => (isCurrentlyPlaying ? stopAudio() : playAyah(ayahNumber))}
                    >
                        <Ionicons
                            name={isCurrentlyPlaying ? 'stop' : 'play'}
                            size={20}
                            color={isCurrentlyPlaying ? '#fff' : '#2E8B57'}
                        />
                    </TouchableOpacity>
                </View>

                <Text style={styles.arabicText}>{ayah.text}</Text>

                {ayah.tamilTransliteration && (
                    <View style={styles.transliterationContainer}>
                        <Text style={styles.transliterationLabel}>தமிழ் எழுத்துமுறை:</Text>
                        <Text style={styles.transliterationText}>{ayah.tamilTransliteration}</Text>
                    </View>
                )}

                {ayah.tamilTranslation && showTranslation && (
                    <View style={styles.translationContainer}>
                        <Text style={styles.translationLabel}>தமிழ் மொழிபெயர்ப்பு:</Text>
                        <Text style={styles.translationText}>{ayah.tamilTranslation}</Text>
                    </View>
                )}

                {ayah.sajdaDua && (
                    <View style={styles.sajdaDuaContainer}>
                        <View style={styles.sajdaHeader}>
                            <Ionicons name="moon" size={20} color="#8B4513" />
                            <Text style={styles.sajdaHeaderText}>ஸஜ்தா செய்யும் போது ஓத வேண்டிய துஆ</Text>
                        </View>
                        {ayah.sajdaDua.description && (
                            <View style={styles.sajdaDuaDescription}>
                                <Text style={styles.sajdaDuaDescriptionText}>{ayah.sajdaDua.description}</Text>
                            </View>
                        )}
                        <Text style={styles.sajdaDuaArabic}>{ayah.sajdaDua.arabic}</Text>
                        {ayah.sajdaDua.tamilTransliteration && (
                            <View style={styles.sajdaDuaTransliteration}>
                                <Text style={styles.sajdaDuaTransliterationText}>
                                    {ayah.sajdaDua.tamilTransliteration}
                                </Text>
                            </View>
                        )}
                        {ayah.sajdaDua.tamilTranslation && (
                            <View style={styles.sajdaDuaTranslation}>
                                <Text style={styles.sajdaDuaTranslationText}>{ayah.sajdaDua.tamilTranslation}</Text>
                            </View>
                        )}
                    </View>
                )}
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2E8B57" />
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    if (!data) {
        return (
            <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={48} color="#999" />
                <Text style={styles.errorText}>Unable to load content</Text>
            </View>
        );
    }

    // Handle both verse format (data array) and sura format (ayahs array)
    // Also handle multiple suras format (like three_kul_suraas with 112, 113, 114 keys)
    let ayahs = [];
    let multipleSuras = null;

    if (data.data) {
        // Single verse format (e.g., aayathul_kursi)
        ayahs = data.data;
    } else if (data.ayahs) {
        // Single sura format (e.g., surathul_mulk)
        ayahs = data.ayahs;
    } else if (data[112] || data[113] || data[114]) {
        // Multiple suras format (three_kul_suraas)
        multipleSuras = [data[112], data[113], data[114]].filter(Boolean);
        // Flatten all ayahs for play all functionality
        multipleSuras.forEach((sura) => {
            if (sura && sura.ayahs) {
                ayahs = [...ayahs, ...sura.ayahs];
            }
        });
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{item.title}</Text>
            </View>

            {/* Static Play All Controls */}
            <View style={styles.staticControls}>
                <TouchableOpacity style={styles.playAllButton} onPress={playAllAyahs} activeOpacity={0.7}>
                    <Ionicons name={playingAll && !paused ? 'stop-circle' : 'play-circle'} size={24} color={'#fff'} />
                    <Text style={styles.playAllText}>{playingAll && !paused ? 'Stop' : 'Play All'}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.pauseButton, paused && styles.pauseButtonActive]}
                    onPress={pauseAllAyahs}
                    disabled={!playingAll || paused}
                    activeOpacity={0.7}
                >
                    <Ionicons name={'pause-circle'} size={24} color={'#fff'} />
                    <Text style={styles.pauseButtonText}>{paused ? 'Paused' : 'Pause'}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.eyeButton, showTranslation && styles.eyeButtonActive]}
                    onPress={() => setShowTranslation(!showTranslation)}
                    activeOpacity={0.7}
                >
                    <Ionicons name={showTranslation ? 'eye' : 'eye-off'} size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            <ScrollView
                ref={scrollViewRef}
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Render multiple suras if present */}
                {multipleSuras ? (
                    multipleSuras.map((sura, suraIndex) => (
                        <View key={suraIndex}>
                            {/* Sura header for multiple suras */}
                            {suraIndex > 0 && <View style={styles.suraDivider} />}

                            {/* Bismillah for each sura */}
                            {sura.bismillah && (
                                <View style={styles.bismillahContainer}>
                                    <Text style={styles.bismillahText}>{sura.bismillah.text}</Text>
                                    {showTranslation && sura.bismillah.tamilTransliteration && (
                                        <Text style={styles.bismillahTransliteration}>
                                            {sura.bismillah.tamilTransliteration}
                                        </Text>
                                    )}
                                    {showTranslation && sura.bismillah.tamilTranslation && (
                                        <Text style={styles.bismillahTranslation}>
                                            {sura.bismillah.tamilTranslation}
                                        </Text>
                                    )}
                                </View>
                            )}

                            {/* Ayahs for this sura */}
                            {sura.ayahs && sura.ayahs.map((ayah, ayahIndex) => renderAyah(ayah, ayahIndex))}
                        </View>
                    ))
                ) : (
                    <>
                        {/* Single bismillah for single sura/verse */}
                        {data.bismillah && (
                            <View style={styles.bismillahContainer}>
                                <Text style={styles.bismillahText}>{data.bismillah.text}</Text>
                                {showTranslation && data.bismillah.tamilTransliteration && (
                                    <Text style={styles.bismillahTransliteration}>
                                        {data.bismillah.tamilTransliteration}
                                    </Text>
                                )}
                                {showTranslation && data.bismillah.tamilTranslation && (
                                    <Text style={styles.bismillahTranslation}>{data.bismillah.tamilTranslation}</Text>
                                )}
                            </View>
                        )}

                        {/* Ayahs for single sura/verse */}
                        {ayahs.map((ayah, index) => renderAyah(ayah, index))}
                    </>
                )}

                <View style={styles.footer}>
                    <Ionicons name="leaf-outline" size={24} color="#2E8B57" />
                    <Text style={styles.footerText}>صَدَقَ اللَّهُ الْعَظِيمُ</Text>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
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
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
    },
    errorText: {
        marginTop: 10,
        fontSize: 16,
        color: '#999',
    },
    header: {
        backgroundColor: '#fff',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    staticControls: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    playAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2E8B57',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 25,
        minWidth: 120,
        shadowColor: '#2E8B57',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    pauseButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#666',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 25,
        minWidth: 110,
        opacity: 0.6,
    },
    pauseButtonActive: {
        backgroundColor: '#fbc02d',
        opacity: 1,
        shadowColor: '#fbc02d',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    pauseButtonText: {
        marginLeft: 6,
        fontSize: 15,
        fontWeight: 'bold',
        color: '#fff',
    },
    eyeButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#666',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: 0.6,
    },
    eyeButtonActive: {
        backgroundColor: '#2E8B57',
        opacity: 1,
        shadowColor: '#2E8B57',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    playAllText: {
        marginLeft: 6,
        fontSize: 15,
        fontWeight: 'bold',
        color: '#fff',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2E8B57',
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    bismillahContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 24,
        marginBottom: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    bismillahText: {
        fontSize: 28,
        lineHeight: 48,
        textAlign: 'center',
        color: '#2E8B57',
        fontWeight: 'bold',
        marginBottom: 8,
    },
    bismillahTransliteration: {
        fontSize: 16,
        textAlign: 'center',
        color: '#666',
        marginTop: 8,
        fontStyle: 'italic',
    },
    bismillahTranslation: {
        fontSize: 14,
        textAlign: 'center',
        color: '#888',
        marginTop: 4,
    },
    ayahContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    playingAyah: {
        borderColor: '#2E8B57',
        borderWidth: 2,
        backgroundColor: '#f0f8f4',
    },
    ayahHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    ayahNumberBadge: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#2E8B57',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    ayahNumberText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    playButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#e8f5e9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    playingButton: {
        backgroundColor: '#2E8B57',
    },
    arabicText: {
        fontSize: 24,
        lineHeight: 42,
        textAlign: 'right',
        color: '#333',
        marginBottom: 16,
        fontWeight: '600',
    },
    transliterationContainer: {
        marginBottom: 12,
        padding: 12,
        backgroundColor: '#fff9e6',
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#ffc107',
    },
    transliterationLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#666',
        marginBottom: 4,
    },
    transliterationText: {
        fontSize: 16,
        lineHeight: 24,
        color: '#333',
    },
    translationContainer: {
        padding: 12,
        backgroundColor: '#e8f5e9',
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#2E8B57',
    },
    translationLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#666',
        marginBottom: 4,
    },
    translationText: {
        fontSize: 15,
        lineHeight: 24,
        color: '#333',
    },
    sajdaDuaContainer: {
        marginTop: 16,
        padding: 16,
        backgroundColor: '#FFF8DC',
        borderRadius: 10,
        borderLeftWidth: 4,
        borderLeftColor: '#8B4513',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sajdaHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    sajdaHeaderText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#8B4513',
        marginLeft: 8,
    },
    sajdaDuaDescription: {
        backgroundColor: '#FAEBD7',
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
        borderLeftWidth: 3,
        borderLeftColor: '#D2691E',
    },
    sajdaDuaDescriptionText: {
        fontSize: 14,
        lineHeight: 22,
        color: '#654321',
        fontStyle: 'italic',
    },
    sajdaDuaArabic: {
        fontSize: 22,
        lineHeight: 38,
        textAlign: 'right',
        color: '#333',
        marginBottom: 12,
        fontWeight: '600',
    },
    sajdaDuaTransliteration: {
        backgroundColor: '#FFF',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    sajdaDuaTransliterationText: {
        fontSize: 15,
        lineHeight: 24,
        color: '#555',
        fontStyle: 'italic',
    },
    sajdaDuaTranslation: {
        backgroundColor: '#FFF',
        padding: 12,
        borderRadius: 8,
    },
    sajdaDuaTranslationText: {
        fontSize: 15,
        lineHeight: 24,
        color: '#333',
    },
    suraDivider: {
        height: 2,
        backgroundColor: '#2E8B57',
        marginVertical: 24,
        marginHorizontal: 32,
        borderRadius: 1,
    },
    footer: {
        shadowRadius: 4,
        elevation: 4,
    },
    toggleButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        marginLeft: 8,
    },
});

export default SignificantDetailScreen;

import React, { useState, useEffect } from 'react';
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
            }
        } catch (error) {
            console.error('Error stopping ayah:', error);
        }
    };

    const renderAyah = (ayah) => {
        const ayahNumber = Number(ayah.number);
        const isCurrentlyPlaying = playingAyah === ayahNumber && isPlaying;

        return (
            <View key={ayahNumber} style={styles.ayahContainer}>
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
                    {/* <Text style={styles.transliterationText}>{String(ayah.tamilTransliteration)}</Text> */}
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
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={Boolean(false)}
            >
                {/* Surah Header */}
                <View style={styles.suraHeader}>
                    <Text style={styles.arabicName}>{String(suraData.name)}</Text>
                    <Text style={styles.englishName}>{String(suraData.englishName)}</Text>
                    <Text style={styles.translation}>{String(suraData.englishNameTranslation)}</Text>
                    <View style={styles.metaInfo}>
                        <Text style={styles.metaText}>
                            {String(suraData.revelationType)} • {String(suraData.numberOfAyahs)} Ayahs
                        </Text>
                    </View>
                </View>

                {/* Bismillah */}
                <View style={styles.bismillahContainer}>
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

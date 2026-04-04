import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AsSalahDetailScreen({ route }) {
    const { section } = route.params;

    const renderPoint = (point, index) => {
        return (
            <View key={index} style={styles.pointContainer}>
                {/* Point Title */}
                <Text style={styles.pointTitle}>{point.title}</Text>

                {/* Audio Placeholder - Now shown before Arabic text */}
                {point.audio !== undefined && (
                    <View style={styles.audioPlaceholder}>
                        <Ionicons name="volume-medium-outline" size={20} color="#999" />
                        <View style={styles.audioTextContainer}>
                            <Text style={styles.audioTextArabic}>இன்ஷா அல்லாஹ்</Text>
                            <Text style={styles.audioText}>ஒலி விரைவில்</Text>
                        </View>
                    </View>
                )}

                {/* Arabic Text */}
                {point.arabic && (
                    <View style={styles.arabicContainer}>
                        <Text style={styles.arabicText}>{point.arabic}</Text>
                    </View>
                )}

                {/* Tamil Transliteration */}
                {point.tamilTransliteration && point.tamilTransliteration.trim() !== '' && (
                    <View style={styles.transliterationContainer}>
                        <Ionicons name="leaf-outline" size={16} color="#8B4513" style={styles.leafIcon} />
                        <Text style={styles.transliterationText}>{point.tamilTransliteration}</Text>
                    </View>
                )}

                {/* Tamil Translation */}
                {point.tamilTranslation && (
                    <View style={styles.translationContainer}>
                        <Text style={styles.translationText}>{point.tamilTranslation}</Text>
                    </View>
                )}

                {/* Reference */}
                {point.ref && (
                    <View style={styles.referenceContainer}>
                        <Ionicons name="bookmark-outline" size={14} color="#888" />
                        <Text style={styles.referenceText}>{point.ref}</Text>
                    </View>
                )}

                {/* Note */}
                {point.note && (
                    <View style={styles.noteContainer}>
                        <Ionicons name="information-circle" size={18} color="#8B4513" />
                        <Text style={styles.noteText}>{point.note}</Text>
                    </View>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Section Header */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>{section.title}</Text>
                    <Text style={styles.sectionDescription}>{section.description}</Text>
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
    pointTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2E8B57',
        marginBottom: 16,
        lineHeight: 26,
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

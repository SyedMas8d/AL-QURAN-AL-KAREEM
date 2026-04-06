import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { adkhars } from '../data/adkhars/tableOfContent';

export default function AdhkarListScreen({ navigation }) {
    const renderVideoItem = ({ item, index }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() =>
                navigation.navigate('VideoDetail', {
                    youtubeLink: item.youtube_link,
                    title: item.title,
                    categoryTitle: adkhars.title,
                })
            }
            activeOpacity={0.7}
        >
            <View style={styles.videoIconContainer}>
                <Ionicons name="play-circle" size={24} color="#FF6B6B" />
            </View>
            <View style={styles.contentContainer}>
                <Text style={styles.videoTitle}>{item.title}</Text>
                {item.description && <Text style={styles.videoDescription}>{item.description}</Text>}
            </View>
            <Ionicons name="chevron-forward" size={24} color="#999" />
        </TouchableOpacity>
    );

    const renderDuaTimeItem = (type, title, count) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() =>
                navigation.navigate('AdhkarTimeDetail', {
                    type: type,
                    title: title,
                    data: adkhars.data.morning_and_evening_adkhars_text[type],
                })
            }
            activeOpacity={0.7}
        >
            <View style={styles.textIconContainer}>
                <Ionicons name="book-outline" size={24} color="#2E8B57" />
            </View>
            <View style={styles.contentContainer}>
                <View style={styles.titleRow}>
                    <Text style={styles.videoTitle}>{title}</Text>
                    <View style={styles.duaCountBadge}>
                        <Ionicons name="list" size={14} color="#2E8B57" />
                        <Text style={styles.duaCountText}>{count} துஆக்கள்</Text>
                    </View>
                </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#999" />
        </TouchableOpacity>
    );

    const renderSectionHeader = (title) => (
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>{title}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Description */}
                {adkhars.description && (
                    <View style={styles.descriptionBox}>
                        <View style={styles.descriptionIconRow}>
                            <Ionicons name="information-circle" size={24} color="#2E8B57" />
                            <Text style={styles.descriptionTitle}>விவரம் (Description)</Text>
                        </View>
                        <Text style={styles.descriptionText}>{adkhars.description}</Text>
                    </View>
                )}

                {/* Text-based Adhkar Section */}
                <View style={styles.section}>
                    {renderSectionHeader('துஆக்கள் (Text and Audio)')}

                    {renderDuaTimeItem(
                        'morning',
                        'காலை (Morning) முக்கியமான துஆக்கள்',
                        adkhars.data.morning_and_evening_adkhars_text?.morning?.length || 0
                    )}

                    {renderDuaTimeItem(
                        'evening',
                        'மாலை (Evening) முக்கியமான துஆக்கள்',
                        adkhars.data.morning_and_evening_adkhars_text?.evening?.length || 0
                    )}
                </View>

                {/* Video Section */}
                {adkhars.data.morning_and_evening_adkhars_videos &&
                    adkhars.data.morning_and_evening_adkhars_videos.length > 0 && (
                        <View style={styles.section}>
                            {renderSectionHeader('வீடியோக்கள் (Videos)')}
                            <FlatList
                                data={adkhars.data.morning_and_evening_adkhars_videos}
                                renderItem={renderVideoItem}
                                keyExtractor={(item, index) => `video-${index}`}
                                scrollEnabled={false}
                                contentContainerStyle={styles.listContainer}
                            />
                        </View>
                    )}

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
    descriptionBox: {
        backgroundColor: '#FFFEF7',
        padding: 20,
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#2E8B57',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    descriptionIconRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    descriptionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2E8B57',
        marginLeft: 8,
    },
    descriptionText: {
        fontSize: 15,
        lineHeight: 24,
        color: '#444',
        textAlign: 'left',
    },
    section: {
        marginBottom: 8,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#2E8B57',
        paddingVertical: 12,
        paddingHorizontal: 20,
        marginHorizontal: 16,
        marginBottom: 8,
        borderRadius: 8,
    },
    sectionHeaderText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
        flex: 1,
    },
    sectionCountBadge: {
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
        minWidth: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    countBadge: {
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
        minWidth: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    countText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#2E8B57',
    },
    listContainer: {
        paddingHorizontal: 16,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    videoIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#e8f5e9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    textIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#e8f5e9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    contentContainer: {
        flex: 1,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    videoTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
        marginRight: 8,
    },
    duaCountBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e8f5e9',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#2E8B57',
    },
    duaCountText: {
        fontSize: 11,
        color: '#2E8B57',
        fontWeight: '600',
        marginLeft: 4,
    },
    videoDescription: {
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
    },
});

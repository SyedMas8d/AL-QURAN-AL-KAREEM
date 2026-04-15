import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getSignificantTableOfContents } from '../data/dataService';

const SignificantListScreen = ({ navigation }) => {
    const [verses, setVerses] = useState([]);
    const [suras, setSuras] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSignificantContent();
    }, []);

    const loadSignificantContent = async () => {
        try {
            const data = await getSignificantTableOfContents();
            setVerses(data.verses || []);
            setSuras(data.suras || []);
        } catch (error) {
            console.error('Error loading significant content:', error);
        } finally {
            setLoading(false);
        }
    };

    const navigateToDetail = (item, type) => {
        navigation.navigate('SignificantDetail', { item, type });
    };

    const renderVerseItem = ({ item }) => (
        <TouchableOpacity style={styles.item} onPress={() => navigateToDetail(item, 'verse')} activeOpacity={0.7}>
            <View style={styles.itemIconContainer}>
                <Ionicons name="bookmark" size={24} color="#2E8B57" />
            </View>
            <View style={styles.itemInfo}>
                <View style={styles.titleRow}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    {item.hadith && item.hadith.length > 0 && (
                        <View style={styles.hadithBadge}>
                            <Ionicons name="chatbox-ellipses" size={14} color="#2E8B57" />
                            <Text style={styles.hadithCount}>{item.hadith.length} நபி மொழி</Text>
                        </View>
                    )}
                </View>
                {item.description && <Text style={styles.itemDescription}>{item.description}</Text>}
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" style={styles.chevron} />
        </TouchableOpacity>
    );

    const renderSuraItem = ({ item }) => (
        <TouchableOpacity style={styles.item} onPress={() => navigateToDetail(item, 'sura')} activeOpacity={0.7}>
            <View style={styles.itemIconContainer}>
                <Ionicons name="book" size={24} color="#2E8B57" />
            </View>
            <View style={styles.itemInfo}>
                <View style={styles.titleRow}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    {item.hadith && item.hadith.length > 0 && (
                        <View style={styles.hadithBadge}>
                            <Ionicons name="chatbox-ellipses" size={14} color="#2E8B57" />
                            <Text style={styles.hadithCount}>{item.hadith.length} நபி மொழி</Text>
                        </View>
                    )}
                </View>
                {item.description && <Text style={styles.itemDescription}>{item.description}</Text>}
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" style={styles.chevron} />
        </TouchableOpacity>
    );

    const renderSectionHeader = (title) => (
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>{title}</Text>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2E8B57" />
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                ListHeaderComponent={() => (
                    <>
                        <View style={styles.header}>
                            <Text style={styles.headerTitle}>முக்கியமான வசனங்கள் மற்றும் ஸூராக்கள்</Text>
                            <Text style={styles.headerSubtitle}>
                                ஹதீஸ்களில் இருந்து பெறப்பட்ட சில முக்கிய வசனங்களும் ஸூராக்களும்
                            </Text>
                        </View>
                        {suras.length > 0 && renderSectionHeader('முக்கியமான ஸூராக்கள்')}
                    </>
                )}
                data={suras}
                renderItem={renderSuraItem}
                keyExtractor={(item, index) => `sura-${index}`}
                ListFooterComponent={() => (
                    <>
                        {verses.length > 0 && renderSectionHeader('முக்கியமான வசனங்கள்')}
                        <FlatList
                            data={verses}
                            renderItem={renderVerseItem}
                            keyExtractor={(item, index) => `verse-${index}`}
                            scrollEnabled={false}
                        />
                    </>
                )}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
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
    header: {
        backgroundColor: '#fff',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        marginBottom: 10,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#2E8B57',
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    listContent: {
        paddingBottom: 20,
    },
    sectionHeader: {
        backgroundColor: '#2E8B57',
        paddingVertical: 12,
        paddingHorizontal: 20,
        marginTop: 10,
        marginBottom: 5,
    },
    sectionHeaderText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    item: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#fff',
        padding: 16,
        marginHorizontal: 10,
        marginVertical: 5,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
        elevation: 2,
    },
    itemIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#e8f5e9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    itemInfo: {
        flex: 1,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginBottom: 8,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginRight: 8,
    },
    hadithBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e8f5e9',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#2E8B57',
    },
    hadithCount: {
        fontSize: 11,
        color: '#2E8B57',
        fontWeight: '600',
        marginLeft: 4,
    },
    itemDescription: {
        fontSize: 14,
        color: '#555',
        lineHeight: 22,
        textAlign: 'justify',
    },
    chevron: {
        marginTop: 2,
    },
});

export default SignificantListScreen;

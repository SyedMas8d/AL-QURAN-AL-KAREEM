import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { tasbih_beads } from '../data/tasbih_beads/tableOfContent';

export default function TasbihListScreen({ navigation }) {
    // Create list items from the data
    const getListItems = () => {
        const items = [];

        // Add multi_counter as one item (first)
        const multiHadithCount = tasbih_beads.multi_counter.reduce((count, item) => {
            return count + (item.haith && item.haith.length > 0 ? item.haith.length : 0);
        }, 0);

        items.push({
            id: 'multi_counter',
            type: 'multi',
            title: 'தஸ்பீஹ்',
            subtitle: 'ஸுப்ஹானல்லாஹ், அல்ஹம்துலில்லாஹ், அல்லாஹு அக்பர்',
            arabic: 'سُبْحَانَ اللَّهِ، الْحَمْدُ لِلَّهِ، اللَّهُ أَكْبَرُ',
            count: '33 + 33 + 33 + 1',
            hasHadith: multiHadithCount > 0,
            hadithCount: multiHadithCount,
            data: tasbih_beads.multi_counter,
        });

        // Add single_counter items individually (after multi_counter)
        tasbih_beads.single_counter.forEach((item, index) => {
            items.push({
                id: `single_${index}`,
                type: 'single',
                index: index,
                title: item.tamilTransliteration || 'திக்ர்',
                subtitle: item.tamilTranslation ? item.tamilTranslation.substring(0, 60) + '...' : '',
                arabic: item.arabic,
                hasHadith: item.haith && item.haith.length > 0,
                hadithCount: item.haith ? item.haith.length : 0,
                count: item.count,
                data: item,
            });
        });

        return items;
    };

    const handleItemPress = (item) => {
        if (item.type === 'single') {
            navigation.navigate('TasbihSingleDetail', {
                item: item.data,
                index: item.index,
                title: item.title,
            });
        } else if (item.type === 'multi') {
            navigation.navigate('TasbihMultiDetail', {
                items: item.data,
                title: item.title,
            });
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.itemCard} onPress={() => handleItemPress(item)} activeOpacity={0.7}>
            <View style={styles.cardContent}>
                <View style={styles.titleSection}>
                    <Text style={styles.itemTitle}>{item.title || ''}</Text>
                    {item.subtitle && item.subtitle.trim() !== '' ? (
                        <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
                    ) : null}
                </View>

                <View style={styles.arabicSection}>
                    <Text style={styles.arabicText}>{item.arabic || ''}</Text>
                </View>

                {item.hasHadith ? (
                    <View style={styles.hadithPreview}>
                        <View style={styles.hadithHeader}>
                            <Ionicons name="book" size={14} color="#8B4513" />
                            <Text style={styles.hadithHeaderText}>ஹதீஸ் ({item.hadithCount || 0})</Text>
                        </View>
                        <Text style={styles.hadithPreviewText}>
                            {item.type === 'single'
                                ? item.data && item.data.haith && item.data.haith[0] && item.data.haith[0].text
                                    ? item.data.haith[0].text.substring(0, 80) + '...'
                                    : 'ஹதீஸ் உரை கிடைக்கவில்லை'
                                : 'தொழுகைக்குப் பிறகு விவரங்களுடன் கௗரவேண்டிய ஹதீஸ்'}
                        </Text>
                    </View>
                ) : null}

                <View style={styles.typeIndicator}>
                    <View style={[styles.typeBadge, item.type === 'multi' ? styles.multiBadge : styles.singleBadge]}>
                        <Text style={styles.countText}>{item.count || 0}</Text>
                    </View>

                    {item.hasHadith ? (
                        <View style={styles.hadithIndicator}>
                            <Ionicons name="book" size={14} color="#8B4513" />
                            <Text style={styles.hadithText}>ஹதீஸ் ({item.hadithCount || 0})</Text>
                        </View>
                    ) : null}
                </View>

                <View style={styles.arrowSection}>
                    <Ionicons name="chevron-forward" size={24} color="#2E8B57" />
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Ionicons name="ellipse" size={28} color="#2E8B57" />
                <Text style={styles.headerTitle}>தஸ்பீஹ் மணிகள் பட்டியல்</Text>
            </View>

            <Text style={styles.description}>தஸ்பீஹ் வகைகளைத் தேர்ந்தெடுத்து எண்ணிக்கையைத் தொடங்குங்கள்</Text>

            <FlatList
                data={getListItems()}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContainer}
            />
        </View>
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
    description: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginHorizontal: 20,
        marginVertical: 16,
        lineHeight: 20,
    },
    listContainer: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    itemCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginVertical: 6,
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
        elevation: 3,
    },
    cardContent: {
        padding: 16,
        minHeight: 100,
    },
    titleSection: {
        marginBottom: 12,
    },
    itemTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2E8B57',
        marginBottom: 4,
    },
    itemSubtitle: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    arabicSection: {
        backgroundColor: '#FFFEF7',
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
    },
    arabicText: {
        fontSize: 16,
        textAlign: 'right',
        color: '#1a1a1a',
        fontWeight: '500',
    },
    typeIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    typeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: '#2E8B57',
    },
    multiBadge: {
        backgroundColor: '#FF6B6B',
    },
    singleBadge: {
        backgroundColor: '#4CAF50',
    },
    badgeText: {
        fontSize: 12,
        color: '#fff',
        marginLeft: 4,
        fontWeight: '600',
    },
    countText: {
        fontSize: 14,
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    hadithIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF8DC',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#8B4513',
    },
    hadithText: {
        fontSize: 12,
        color: '#8B4513',
        marginLeft: 4,
        fontWeight: '600',
    },
    hadithPreview: {
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
        marginBottom: 6,
    },
    hadithHeaderText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#8B4513',
        marginLeft: 4,
    },
    hadithPreviewText: {
        fontSize: 12,
        lineHeight: 16,
        color: '#333',
    },
    arrowSection: {
        position: 'absolute',
        right: 16,
        top: '50%',
        marginTop: -12,
    },
});

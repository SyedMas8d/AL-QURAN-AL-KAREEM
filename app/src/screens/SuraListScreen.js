import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getTableOfContents } from '../data/dataService';

const SuraListScreen = ({ navigation }) => {
    const [suraList, setSuraList] = useState([]);
    const [filteredSuraList, setFilteredSuraList] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSuraList();
    }, []);

    const loadSuraList = async () => {
        try {
            const tableOfContents = await getTableOfContents();
            setSuraList(tableOfContents.surahs);
            setFilteredSuraList(tableOfContents.surahs);
        } catch (error) {
            console.error('Error loading sura list:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (query) => {
        setSearchQuery(query);

        if (query.trim() === '') {
            setFilteredSuraList(suraList);
            return;
        }

        const lowercaseQuery = query.toLowerCase();
        const filtered = suraList.filter((sura) => {
            // Search by number
            if (sura.number.toString().includes(query)) {
                return true;
            }
            // Search by Arabic name
            if (sura.name.toLowerCase().includes(lowercaseQuery)) {
                return true;
            }
            // Search by English name
            if (sura.englishName.toLowerCase().includes(lowercaseQuery)) {
                return true;
            }
            // Search by English translation
            if (sura.englishNameTranslation.toLowerCase().includes(lowercaseQuery)) {
                return true;
            }
            // Search by revelation type
            if (sura.revelationType.toLowerCase().includes(lowercaseQuery)) {
                return true;
            }
            return false;
        });

        setFilteredSuraList(filtered);
    };

    const navigateToSura = (sura) => {
        navigation.navigate('SuraDetail', { sura });
    };

    const renderSuraItem = ({ item }) => (
        <TouchableOpacity style={styles.suraItem} onPress={() => navigateToSura(item)} activeOpacity={Number(0.7)}>
            <View style={styles.suraNumber}>
                <Text style={styles.suraNumberText}>{String(item.number)}</Text>
            </View>
            <View style={styles.suraInfo}>
                <Text style={styles.arabicName}>{String(item.name)}</Text>
                <Text style={styles.englishName}>{String(item.englishName)}</Text>
                <Text style={styles.translation}>{String(item.englishNameTranslation)}</Text>
                <View style={styles.metaInfo}>
                    <Text style={styles.metaText}>
                        {String(item.revelationType)} • {String(item.numberOfAyahs)} Ayahs
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size={String('large')} color={String('#2E8B57')} />
                <Text style={styles.loadingText}>Loading Surahs...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search by name, number, or type..."
                    placeholderTextColor="#999"
                    value={searchQuery}
                    onChangeText={handleSearch}
                    autoCapitalize="none"
                    autoCorrect={false}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => handleSearch('')} style={styles.clearButton}>
                        <Ionicons name="close-circle" size={20} color="#999" />
                    </TouchableOpacity>
                )}
            </View>
            <FlatList
                data={filteredSuraList}
                renderItem={renderSuraItem}
                keyExtractor={(item) => String(item.number)}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={Boolean(false)}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="search" size={48} color="#ccc" />
                        <Text style={styles.emptyText}>No surahs found</Text>
                        <Text style={styles.emptySubText}>Try a different search term</Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        margin: 16,
        marginBottom: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        paddingVertical: 4,
    },
    clearButton: {
        padding: 4,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#666',
        marginTop: 16,
    },
    emptySubText: {
        fontSize: 14,
        color: '#999',
        marginTop: 8,
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
    listContainer: {
        padding: 16,
    },
    suraItem: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
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
    suraNumber: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#2E8B57',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    suraNumberText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    suraInfo: {
        flex: 1,
    },
    arabicName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1a5c3a',
        marginBottom: 6,
        textAlign: 'right',
        lineHeight: 32,
    },
    englishName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 2,
    },
    translation: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    metaInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaText: {
        fontSize: 12,
        color: '#999',
    },
});

export default SuraListScreen;

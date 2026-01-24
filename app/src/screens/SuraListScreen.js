import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { getTableOfContents } from '../data/dataService';

const SuraListScreen = ({ navigation }) => {
    const [suraList, setSuraList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSuraList();
    }, []);

    const loadSuraList = async () => {
        try {
            const tableOfContents = await getTableOfContents();
            setSuraList(tableOfContents.surahs);
        } catch (error) {
            console.error('Error loading sura list:', error);
        } finally {
            setLoading(false);
        }
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
            <FlatList
                data={suraList}
                renderItem={renderSuraItem}
                keyExtractor={(item) => String(item.number)}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={Boolean(false)}
            />
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
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2E8B57',
        marginBottom: 4,
        textAlign: 'right',
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

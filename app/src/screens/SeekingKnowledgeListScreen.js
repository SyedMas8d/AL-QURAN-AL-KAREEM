import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import knowledgeData from '../data/seeking_knowledge/tableOfContents';

const SeekingKnowledgeListScreen = ({ navigation }) => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedCategories, setExpandedCategories] = useState({});

    useEffect(() => {
        console.log('SeekingKnowledgeListScreen mounted');
        loadKnowledgeData();
    }, []);

    const loadKnowledgeData = async () => {
        try {
            console.log('Loading knowledge data...');
            console.log('Data loaded:', knowledgeData);
            // Transform the object into an array for FlatList
            const transformedData = Object.keys(knowledgeData).map((key) => ({
                id: key,
                title: knowledgeData[key].title,
                episodes: knowledgeData[key].data,
            }));
            console.log('Transformed data:', transformedData);
            setCategories(transformedData);
        } catch (error) {
            console.error('Error loading knowledge data:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleCategory = (categoryId) => {
        setExpandedCategories((prev) => ({
            ...prev,
            [categoryId]: !prev[categoryId],
        }));
    };

    const handleVideoPress = (episode, categoryTitle) => {
        navigation.navigate('VideoDetail', {
            title: episode.title,
            youtubeLink: episode.youtube_link,
            categoryTitle: categoryTitle,
        });
    };

    const renderCategoryItem = ({ item }) => {
        const isExpanded = expandedCategories[item.id];

        return (
            <View style={styles.categoryCard}>
                <TouchableOpacity
                    style={styles.categoryHeader}
                    onPress={() => toggleCategory(item.id)}
                    activeOpacity={0.7}
                >
                    <Text style={styles.categoryTitle}>{item.title}</Text>
                    <Text style={styles.dropdownIcon}>{isExpanded ? '▼' : '▶'}</Text>
                </TouchableOpacity>

                {isExpanded && (
                    <View style={styles.episodesContainer}>
                        {item.episodes.map((episode, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.episodeButton}
                                onPress={() => handleVideoPress(episode, item.title)}
                            >
                                <Text style={styles.episodeText}>{episode.title}</Text>
                                <Text style={styles.playIcon}>▶</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2E8B57" />
            </View>
        );
    }

    if (!categories || categories.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.emptyText}>No knowledge content available</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={categories}
                renderItem={renderCategoryItem}
                keyExtractor={(item, index) => `category-${item.id}-${index}`}
                contentContainerStyle={styles.listContent}
                extraData={expandedCategories}
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
    emptyText: {
        fontSize: 16,
        color: '#666',
    },
    listContent: {
        padding: 16,
    },
    categoryCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        overflow: 'hidden',
    },
    categoryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#f0f8f4',
        borderBottomWidth: 1,
        borderBottomColor: '#d0e8dc',
    },
    categoryTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2E8B57',
        flex: 1,
    },
    dropdownIcon: {
        fontSize: 16,
        color: '#2E8B57',
        marginLeft: 10,
    },
    episodesContainer: {
        padding: 12,
        gap: 8,
    },
    episodeButton: {
        backgroundColor: '#f0f8f4',
        borderRadius: 8,
        padding: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#d0e8dc',
    },
    episodeText: {
        fontSize: 16,
        color: '#333',
        flex: 1,
    },
    playIcon: {
        fontSize: 18,
        color: '#2E8B57',
        marginLeft: 8,
    },
});

export default SeekingKnowledgeListScreen;

import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import knowledgeData from '../data/seeking_knowledge/tableOfContents';

// Helper function to render text with <b> tags as bold
const renderTextWithBold = (text, style, boldStyle) => {
    if (!text) return null;

    // Split by <b> and </b> tags
    const parts = text.split(/(<b>|<\/b>)/);
    let isBold = false;
    const elements = [];

    parts.forEach((part, index) => {
        if (part === '<b>') {
            isBold = true;
        } else if (part === '</b>') {
            isBold = false;
        } else if (part) {
            elements.push(
                <Text key={index} style={isBold ? [style, boldStyle] : style}>
                    {part}
                </Text>
            );
        }
    });

    return <>{elements}</>;
};

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
                description: knowledgeData[key].description || null,
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
        setExpandedCategories((prev) => {
            // If this category is already expanded, close it
            if (prev[categoryId]) {
                return {};
            }
            // Otherwise, close all others and open only this one
            return { [categoryId]: true };
        });
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
                        {/* Description Section */}
                        {item.description && (
                            <View style={styles.descriptionContainer}>
                                <Text style={styles.descriptionTitle}>📖 விவரம் (Description)</Text>
                                {renderTextWithBold(item.description, styles.descriptionText, styles.boldText)}
                            </View>
                        )}

                        {/* Episodes List */}
                        {item.episodes.map((episode, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.episodeButton}
                                onPress={() => handleVideoPress(episode, item.title)}
                            >
                                <View style={styles.episodeIconContainer}>
                                    <Ionicons name="play-circle" size={24} color="#FF6B6B" />
                                </View>
                                <View style={styles.episodeInfo}>
                                    <Text style={styles.episodeText}>{episode.title}</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#999" />
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
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
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
    descriptionContainer: {
        backgroundColor: '#fffbf0',
        borderRadius: 10,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#ffc107',
    },
    descriptionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2E8B57',
        marginBottom: 8,
    },
    descriptionText: {
        fontSize: 15,
        lineHeight: 24,
        color: '#333',
        textAlign: 'left',
    },
    boldText: {
        fontWeight: 'bold',
        color: '#1A5F3E',
    },
    episodeButton: {
        backgroundColor: '#f0f8f4',
        borderRadius: 8,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#d0e8dc',
    },
    episodeIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#e8f5e9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    episodeInfo: {
        flex: 1,
    },
    episodeText: {
        fontSize: 16,
        color: '#333',
    },
});

export default SeekingKnowledgeListScreen;

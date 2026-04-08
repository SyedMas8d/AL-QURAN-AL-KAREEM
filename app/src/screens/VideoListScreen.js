import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
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

    return <Text style={style}>{elements}</Text>;
};

export default function VideoListScreen({ route, navigation }) {
    const { categoryKey } = route.params;
    const category = knowledgeData[categoryKey];

    if (!category) {
        return (
            <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={48} color="#999" />
                <Text style={styles.errorText}>Category not found</Text>
            </View>
        );
    }

    const renderVideoItem = ({ item, index }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() =>
                navigation.navigate('VideoDetail', {
                    youtubeLink: item.youtube_link,
                    title: item.title,
                    categoryTitle: category.title,
                })
            }
            activeOpacity={0.7}
        >
            <View style={styles.videoIconContainer}>
                <Ionicons name="play-circle" size={24} color="#FF6B6B" />
            </View>
            <View style={styles.contentContainer}>
                <Text style={styles.videoTitle}>{item.title}</Text>
                {item.description && renderTextWithBold(item.description, styles.videoDescription, styles.boldText)}
            </View>
            <Ionicons name="chevron-forward" size={24} color="#999" />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={category.data}
                renderItem={renderVideoItem}
                keyExtractor={(item, index) => index.toString()}
                ListHeaderComponent={
                    category.description ? (
                        <View style={styles.descriptionBox}>
                            <View style={styles.descriptionIconRow}>
                                <Ionicons name="information-circle" size={24} color="#2E8B57" />
                                <Text style={styles.descriptionTitle}>விவரம் (Description)</Text>
                            </View>
                            {renderTextWithBold(category.description, styles.descriptionText, styles.boldText)}
                        </View>
                    ) : null
                }
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
    descriptionBox: {
        backgroundColor: '#FFFEF7',
        padding: 20,
        marginHorizontal: 16,
        marginTop: 0,
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
    listContainer: {
        padding: 16,
        paddingTop: 16,
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
    contentContainer: {
        flex: 1,
    },
    videoTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    videoDescription: {
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
    },
    boldText: {
        fontWeight: 'bold',
        color: '#1A5F3E',
    },
});

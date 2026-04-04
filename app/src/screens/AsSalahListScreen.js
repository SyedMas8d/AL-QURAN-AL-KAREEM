import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { salah } from '../data/as_salah/tableOfContent';

export default function AsSalahListScreen({ navigation }) {
    const renderSectionItem = ({ item, index }) => {
        const pointsCount = item.points ? item.points.length : 0;

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('AsSalahDetail', { section: item, index })}
                activeOpacity={0.7}
            >
                <View style={styles.cardContent}>
                    <View style={styles.headerRow}>
                        <Text style={styles.sectionTitle}>{item.title}</Text>
                        <Ionicons name="chevron-forward" size={24} color="#2E8B57" />
                    </View>

                    <Text style={styles.description} numberOfLines={2}>
                        {item.description}
                    </Text>

                    <View style={styles.footer}>
                        <View style={styles.badge}>
                            <Ionicons name="book-outline" size={14} color="#2E8B57" />
                            <Text style={styles.badgeText}>{pointsCount} விவரங்கள்</Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>தொழுகை வழிகாட்டி</Text>
                <Text style={styles.headerSubtitle}>அஸ்-ஸலாஹ் கற்போம்</Text>
            </View>

            <FlatList
                data={salah}
                renderItem={renderSectionItem}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        backgroundColor: '#fff',
        padding: 20,
        paddingTop: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2E8B57',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#666',
    },
    listContent: {
        padding: 16,
        paddingBottom: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardContent: {
        padding: 16,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1A5F3E',
        flex: 1,
        marginRight: 8,
        lineHeight: 26,
    },
    description: {
        fontSize: 14,
        color: '#555',
        lineHeight: 22,
        marginBottom: 12,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: 12,
        color: '#2E8B57',
        fontWeight: '500',
        marginLeft: 4,
    },
});

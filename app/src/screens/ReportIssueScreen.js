import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';

const ReportIssueScreen = () => {
    const [description, setDescription] = useState('');

    const handleSubmit = async () => {
        if (!description.trim()) {
            Alert.alert('பிழை', 'தயவுசெய்து உங்கள் கருத்தை உள்ளிடவும்');
            return;
        }

        const email = 'syedmasood.s@foodhub.com';
        const subject = 'பயன்பாட்டு - தவறு அறிக்கை / பின்னூட்டம்';
        const body = description;

        // Encode the email, subject, and body
        const encodedSubject = encodeURIComponent(subject);
        const encodedBody = encodeURIComponent(body);

        // Create mailto URL
        const url = `mailto:${email}?subject=${encodedSubject}&body=${encodedBody}`;

        try {
            const canOpen = await Linking.canOpenURL(url);
            if (canOpen) {
                await Linking.openURL(url);
                // Clear the description after opening email client
                setDescription('');
            } else {
                Alert.alert('பிழை', 'மின்னஞ்சல் பயன்பாடு கிடைக்கவில்லை');
            }
        } catch (error) {
            Alert.alert('பிழை', 'மின்னஞ்சல் திறக்க முடியவில்லை');
            console.error('Error opening email:', error);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <Ionicons name="mail" size={48} color="#2E8B57" />
                    <Text style={styles.headerTitle}>தவறுகளை சுட்டிக்காட்டு</Text>
                    <Text style={styles.headerSubtitle}>
                        பயன்பாட்டில் ஏதேனும் தவறுகள் அல்லது மேம்பாடுகள் இருந்தால் எங்களுக்கு தெரியப்படுத்துங்கள்
                    </Text>
                </View>

                <View style={styles.infoBox}>
                    <Ionicons name="information-circle" size={20} color="#2E8B57" />
                    <Text style={styles.infoText}>
                        உங்கள் கருத்துகள் மற்றும் பரிந்துரைகள் எங்களுக்கு மிகவும் மதிப்புமிக்கவை
                    </Text>
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>உங்கள் கருத்து / தவறு விவரம்</Text>
                    <TextInput
                        style={styles.textArea}
                        value={description}
                        onChangeText={setDescription}
                        placeholder="இங்கே உங்கள் கருத்தை எழுதவும்..."
                        placeholderTextColor="#999"
                        multiline
                        numberOfLines={8}
                        textAlignVertical="top"
                    />
                </View>

                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} activeOpacity={0.7}>
                    <Ionicons name="send" size={20} color="#fff" style={styles.buttonIcon} />
                    <Text style={styles.submitButtonText}>மின்னஞ்சல் அனுப்பு</Text>
                </TouchableOpacity>

                <View style={styles.contactInfo}>
                    <Text style={styles.contactLabel}>தொடர்பு மின்னஞ்சல்:</Text>
                    <Text style={styles.contactEmail}>syedmasood.s@foodhub.com</Text>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    content: {
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
        paddingVertical: 20,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#2E8B57',
        marginTop: 12,
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: '#e8f5e9',
        padding: 16,
        borderRadius: 8,
        marginBottom: 24,
        borderLeftWidth: 4,
        borderLeftColor: '#2E8B57',
        alignItems: 'center',
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: '#2E8B57',
        marginLeft: 12,
        lineHeight: 18,
    },
    inputContainer: {
        marginBottom: 24,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    textArea: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 16,
        fontSize: 15,
        color: '#333',
        minHeight: 150,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    submitButton: {
        backgroundColor: '#2E8B57',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 8,
        marginBottom: 24,
        shadowColor: '#2E8B57',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 5,
    },
    buttonIcon: {
        marginRight: 8,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    contactInfo: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    contactLabel: {
        fontSize: 13,
        color: '#666',
        marginBottom: 6,
    },
    contactEmail: {
        fontSize: 15,
        color: '#2E8B57',
        fontWeight: '600',
    },
});

export default ReportIssueScreen;

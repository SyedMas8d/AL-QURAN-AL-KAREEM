import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, Platform } from 'react-native';

// Conditionally import WebView only for native platforms
const WebView = Platform.OS !== 'web' ? require('react-native-webview').WebView : null;

const VideoDetailScreen = ({ route }) => {
    const { youtubeLink, title } = route.params;
    const [loading, setLoading] = useState(true);

    // Extract video ID from YouTube link
    const getYouTubeVideoId = (url) => {
        let videoId = null;

        // Handle different YouTube URL formats
        if (url.includes('youtube.com/watch?v=')) {
            const match = url.match(/[?&]v=([^&]+)/);
            if (match) videoId = match[1];
        } else if (url.includes('youtu.be/')) {
            const match = url.match(/youtu\.be\/([^?]+)/);
            if (match) videoId = match[1];
        } else if (url.includes('/shorts/')) {
            const match = url.match(/\/shorts\/([^?]+)/);
            if (match) videoId = match[1];
        }

        // Clean up any extra parameters
        if (videoId) {
            videoId = videoId.split('&')[0].split('?')[0];
        }

        return videoId;
    };

    const videoId = getYouTubeVideoId(youtubeLink);

    if (!videoId) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Invalid video link</Text>
            </View>
        );
    }

    // YouTube embed URL with options to minimize distractions
    const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1&playsinline=1`;

    // For web platform, render iframe directly
    if (Platform.OS === 'web') {
        return (
            <View style={styles.container}>
                <View style={{ flex: 1, width: '100%' }}>
                    <iframe
                        src={embedUrl}
                        style={{
                            width: '100%',
                            height: '100%',
                            border: 'none',
                            minHeight: 400,
                        }}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                        allowFullScreen
                        title={title}
                    />
                </View>
                {title && (
                    <View style={styles.infoContainer}>
                        <Text style={styles.titleText}>{title}</Text>
                    </View>
                )}
            </View>
        );
    }

    // For native platforms (iOS/Android), use WebView
    if (!WebView) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>WebView not available</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {loading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#2E8B57" />
                    <Text style={styles.loadingText}>Loading video...</Text>
                </View>
            )}
            <WebView
                style={styles.webview}
                source={{ uri: embedUrl }}
                allowsFullscreenVideo={true}
                allowsInlineMediaPlayback={true}
                mediaPlaybackRequiresUserAction={false}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                onLoadStart={() => setLoading(true)}
                onLoadEnd={() => setLoading(false)}
            />
            {title && (
                <View style={styles.infoContainer}>
                    <Text style={styles.titleText}>{title}</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    webview: {
        flex: 1,
        backgroundColor: '#000',
    },
    loadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
        zIndex: 10,
    },
    loadingText: {
        color: '#fff',
        marginTop: 10,
        fontSize: 14,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        color: '#d32f2f',
        textAlign: 'center',
    },
    infoContainer: {
        padding: 12,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    titleText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
});

export default VideoDetailScreen;

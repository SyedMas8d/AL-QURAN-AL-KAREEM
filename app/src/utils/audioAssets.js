// Audio assets mapping for local files
// This allows us to use require() for local audio files while maintaining string paths in data files

// Helper function to get audio source (local or remote)
export const getAudioSource = (audioPath) => {
    if (!audioPath) return null;

    // Check if it's a remote URL
    if (audioPath.startsWith('http://') || audioPath.startsWith('https://')) {
        return { uri: audioPath };
    }

    // Local audio files mapping
    const audioRequireMap = {
        '/assets/audios/after_salah/DUA_AFT_SALAH_ASTAKFIR.mp3': require('../../assets/audios/after_salah/DUA_AFT_SALAH_ASTAKFIR.mp3'),
        '/assets/audios/after_salah/DUA_AFT_SALAH_ANTHA_SALAAM.mp3': require('../../assets/audios/after_salah/DUA_AFT_SALAH_ANTHA_SALAAM.mp3'),
        '/assets/audios/after_salah/DUA_AFT_SALAH_TASBEEH.mp3': require('../../assets/audios/after_salah/DUA_AFT_SALAH_TASBEEH.mp3'),
        '/assets/audios/adkhars/DUA_MRNG_ADKHAR.mp3': require('../../assets/audios/adkhars/DUA_MRNG_ADKHAR.mp3'),
        '/assets/audios/adkhars/DUA_MRN_EVE_RALITHU.mp3': require('../../assets/audios/adkhars/DUA_MRN_EVE_RALITHU.mp3'),
    };

    if (audioRequireMap[audioPath]) {
        return audioRequireMap[audioPath];
    }

    // For paths not in the map, show placeholder
    if (audioPath.startsWith('/assets/audios/') || audioPath.startsWith('/audios/')) {
        console.log(`Audio mapping not found for: ${audioPath}`);
        return null;
    }

    // Fallback to URI for unknown paths
    return { uri: audioPath };
};

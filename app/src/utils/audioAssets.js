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
        '/assets/audios/at_salah/DUA_AT_SALAH_BAID.mp3': require('../../assets/audios/at_salah/DUA_AT_SALAH_BAID.mp3'),
        '/assets/audios/at_salah/DUA_AT_RUKU.mp3': require('../../assets/audios/at_salah/DUA_AT_RUKU.mp3'),
        '/assets/audios/at_salah/DUA_AT_SAJDA.mp3': require('../../assets/audios/at_salah/DUA_AT_SAJDA.mp3'),
        '/assets/audios/at_salah/DUA_AT_THASUHUDHU.mp3': require('../../assets/audios/at_salah/DUA_AT_THASUHUDHU.mp3'),
        '/assets/audios/at_salah/DUA_BTW_2_SAJDA.mp3': require('../../assets/audios/at_salah/DUA_BTW_2_SAJDA.mp3'),
        '/assets/audios/at_salah/DUA_BTW_2_SAJDA_OPT.mp3': require('../../assets/audios/at_salah/DUA_BTW_2_SAJDA_OPT.mp3'),
        '/assets/audios/at_salah/DUA_SALAWATH.mp3': require('../../assets/audios/at_salah/DUA_SALAWATH.mp3'),
        '/assets/audios/daily_duas/DUA_WAKEUP.mp3': require('../../assets/audios/daily_duas/DUA_WAKEUP.mp3'),
        '/assets/audios/daily_duas/DUA_ENT_TOILET.mp3': require('../../assets/audios/daily_duas/DUA_ENT_TOILET.mp3'),
        '/assets/audios/daily_duas/DUA_AFT_ODU.mp3': require('../../assets/audios/daily_duas/DUA_AFT_ODU.mp3'),
        '/assets/audios/daily_duas/DUA_AFT_DRESS_UP.mp3': require('../../assets/audios/daily_duas/DUA_AFT_DRESS_UP.mp3'),
        '/assets/audios/daily_duas/DUA_SEEING_MIRROR.mp3': require('../../assets/audios/daily_duas/DUA_SEEING_MIRROR.mp3'),
        '/assets/audios/daily_duas/DUA_AFT_MEAL.mp3': require('../../assets/audios/daily_duas/DUA_AFT_MEAL.mp3'),
        '/assets/audios/daily_duas/DUA_LEAVE_HOUSE.mp3': require('../../assets/audios/daily_duas/DUA_LEAVE_HOUSE.mp3'),
        '/assets/audios/daily_duas/DUA_TRAVEL.mp3': require('../../assets/audios/daily_duas/DUA_TRAVEL.mp3'),
        '/assets/audios/tasbih_beads/SUBHANALLAH.mp3': require('../../assets/audios/tasbih_beads/SUBHANALLAH.mp3'),
        '/assets/audios/tasbih_beads/ALHAMDULILLAH.mp3': require('../../assets/audios/tasbih_beads/ALHAMDULILLAH.mp3'),
        '/assets/audios/tasbih_beads/ALLAHU_AKBAR.mp3': require('../../assets/audios/tasbih_beads/ALLAHU_AKBAR.mp3'), // File doesn't exist yet
        '/assets/audios/tasbih_beads/KALIMAH.mp3': require('../../assets/audios/tasbih_beads/KALIMAH.mp3'),
        '/assets/audios/tasbih_beads/TASBIH_BEADS.mp3': require('../../assets/audios/tasbih_beads/TASBIH_BEADS.mp3'),
        '/assets/audios/tasbih_beads/ASTAKFIRULLAHA_WA_ATHOOBU_ILAIH.mp3': require('../../assets/audios/tasbih_beads/ASTAKFIRULLAHA_WA_ATHOOBU_ILAIH.mp3'),
        '/assets/audios/tasbih_beads/SUBHANALLAHI_AZEEMI_WABIHAMDHIHI.mp3': require('../../assets/audios/tasbih_beads/SUBHANALLAHI_AZEEMI_WABIHAMDHIHI.mp3'),
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

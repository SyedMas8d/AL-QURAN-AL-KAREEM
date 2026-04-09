// Data service to handle JSON data from the app data folder

// Import JSON data directly using ES6 imports for better web compatibility
import tableOfContentsData from './al_quran_json_collection/table_of_contents.json';

// Import significant verses and suras (tableOfContents as JS, data files as JSON)
import significantTableOfContents from './significants/tableOfContents';
import aayathulKursiData from './significants/aayathul_kursi.json';
import aamanarRasoolData from './significants/aamanar_rasool.json';
import surathulMulkData from './significants/surathul_mulk.json';
import suraYaseenData from './significants/sura_yaseen.json';
import suarAssajdaData from './significants/suar_assajda.json';
import { threeKulSuraas } from './significants/three_kul_suraas.js';

// Import all available sura JSON files
import sura1Data from './al_quran_json_collection/1.json';
import sura2Data from './al_quran_json_collection/2.json';
import sura112Data from './al_quran_json_collection/112.json';
import sura113Data from './al_quran_json_collection/113.json';
import sura114Data from './al_quran_json_collection/114.json';
import sura111Data from './al_quran_json_collection/111.json';
import sura110Data from './al_quran_json_collection/110.json';
import sura109Data from './al_quran_json_collection/109.json';
import sura108Data from './al_quran_json_collection/108.json';
import sura107Data from './al_quran_json_collection/107.json';
import sura106Data from './al_quran_json_collection/106.json';
import sura105Data from './al_quran_json_collection/105.json';
import sura104Data from './al_quran_json_collection/104.json';
import sura103Data from './al_quran_json_collection/103.json';
import sura102Data from './al_quran_json_collection/102.json';
import sura101Data from './al_quran_json_collection/101.json';
import sura100Data from './al_quran_json_collection/100.json';
import sura97Data from './al_quran_json_collection/97.json';
import sura94Data from './al_quran_json_collection/94.json';
import sura93Data from './al_quran_json_collection/93.json';
import sura87Data from './al_quran_json_collection/87.json';

// Create a mapping of sura numbers to their data
const suraDataMap = {
    1: sura1Data,
    2: sura2Data,
    112: sura112Data,
    113: sura113Data,
    114: sura114Data,
    111: sura111Data,
    110: sura110Data,
    109: sura109Data,
    108: sura108Data,
    107: sura107Data,
    106: sura106Data,
    105: sura105Data,
    104: sura104Data,
    103: sura103Data,
    102: sura102Data,
    101: sura101Data,
    100: sura100Data,
    97: sura97Data,
    94: sura94Data,
    93: sura93Data,
    87: sura87Data,
    // Add more suras as JSON files become available
};

/**
 * Get the table of contents with all surahs
 * @returns {Promise<Object>} Table of contents data
 */
export const getTableOfContents = async () => {
    try {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Add more sample suras to the list for demonstration
        const expandedSuras = [...tableOfContentsData.suras];

        return {
            surahs: expandedSuras,
        };
    } catch (error) {
        throw new Error('Failed to load table of contents');
    }
};

/**
 * Get detailed data for a specific sura
 * @param {number} suraNumber - The number of the sura (1-114)
 * @returns {Promise<Object>} Sura data with ayahs
 */
export const getSuraData = async (suraNumber) => {
    try {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Check if we have the sura data in our map
        if (suraDataMap[suraNumber]) {
            return suraDataMap[suraNumber];
        } else {
            // Return mock data for other suras with sample ayahs (data not available yet)
            const suraNames = {
                2: { name: 'سُورَةُ ٱلۡبَقَرَةِ', englishName: 'Al-Baqarah', translation: 'The Cow' },
                3: { name: 'سُورَةُ آلِ عِمۡرَانَ', englishName: 'Aal-E-Imran', translation: 'The Family of Imran' },
                4: { name: 'سُورَةُ ٱلنِّسَاءِ', englishName: 'An-Nisa', translation: 'The Women' },
                5: { name: 'سُورَةُ ٱلۡمَائِدَةِ', englishName: 'Al-Maidah', translation: 'The Table Spread' },
            };

            const suraInfo = suraNames[suraNumber] || {
                name: 'سُورَةُ مُؤَقَّتَة',
                englishName: 'Coming Soon',
                translation: 'Data Not Available',
            };

            return {
                number: suraNumber,
                name: suraInfo.name,
                englishName: suraInfo.englishName,
                englishNameTranslation: suraInfo.translation,
                revelationType: suraNumber <= 5 ? 'Medinan' : 'Unknown',
                numberOfAyahs: 3,
                ayahs: [
                    {
                        number: 1,
                        text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
                        tamilTransliteration: 'பிஸ்மில்லாஹிர் ரஹ்மானிர் ரஹீம்',
                        numberInSurah: 1,
                        juz: 1,
                        manzil: 1,
                        page: 1,
                        ruku: 1,
                        hizbQuarter: 1,
                        sajda: false,
                    },
                    {
                        number: 2,
                        text: '[Sample Arabic text for demonstration]',
                        tamilTransliteration: '[Sample Tamil transliteration - முழு டேட்டா கிடைக்கவில்லை]',
                        numberInSurah: 2,
                        juz: 1,
                        manzil: 1,
                        page: 1,
                        ruku: 1,
                        hizbQuarter: 1,
                        sajda: false,
                    },
                    {
                        number: 3,
                        text: '[Complete data coming soon...]',
                        tamilTransliteration: '[முழு தரவு விரைவில் வரும்...]',
                        numberInSurah: 3,
                        juz: 1,
                        manzil: 1,
                        page: 1,
                        ruku: 1,
                        hizbQuarter: 1,
                        sajda: false,
                    },
                ],
            };
        }
    } catch (error) {
        throw new Error(`Failed to load sura ${suraNumber} data`);
    }
};

/**
 * Get audio URL for a specific ayah
 * @param {number} ayahNumber - Global ayah number
 * @returns {string} Audio URL
 */
export const getAudioUrl = (ayahNumber) => {
    return `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayahNumber}.mp3`;
};

/**
 * Get the table of contents for significant verses and suras
 * @returns {Promise<Object>} Significant table of contents data
 */
export const getSignificantTableOfContents = async () => {
    try {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 300));
        return significantTableOfContents;
    } catch (error) {
        throw new Error('Failed to load significant table of contents');
    }
};

/**
 * Get data for a specific significant verse or sura
 * @param {string} filename - The filename of the significant content
 * @returns {Promise<Object>} Significant content data
 */
export const getSignificantData = async (filename) => {
    try {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Map filenames to their imported data
        const significantDataMap = {
            'aayathul_kursi.json': aayathulKursiData,
            'aamanar_rasool.json': aamanarRasoolData,
            'surathul_mulk.json': surathulMulkData,
            'sura_yaseen.json': suraYaseenData,
            'suar_assajda.json': suarAssajdaData,
            'three_kul_suraas.js': threeKulSuraas,
        };

        const data = significantDataMap[filename];
        if (!data) {
            throw new Error(`Significant data for ${filename} not found`);
        }

        return data;
    } catch (error) {
        throw new Error(`Failed to load significant data: ${error.message}`);
    }
};

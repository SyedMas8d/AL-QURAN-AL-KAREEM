// Data service to handle JSON data from the app data folder

// Import JSON data directly using ES6 imports for better web compatibility
import tableOfContentsData from './al_quran_json_collection/table_of_contents.json';

// Import all available sura JSON files
import sura1Data from './al_quran_json_collection/1.json';
import sura2Data from './al_quran_json_collection/2.json';

// Create a mapping of sura numbers to their data
const suraDataMap = {
    1: sura1Data,
    2: sura2Data,
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
        const expandedSuras = [
            ...tableOfContentsData.suras,
            {
                number: 3,
                name: 'سُورَةُ آلِ عِمۡرَانَ',
                englishName: 'Aal-E-Imran',
                englishNameTranslation: 'The Family of Imran',
                revelationType: 'Medinan',
                numberOfAyahs: 200,
            },
            {
                number: 4,
                name: 'سُورَةُ ٱلنِّسَاءِ',
                englishName: 'An-Nisa',
                englishNameTranslation: 'The Women',
                revelationType: 'Medinan',
                numberOfAyahs: 176,
            },
            {
                number: 5,
                name: 'سُورَةُ ٱلۡمَائِدَةِ',
                englishName: 'Al-Maidah',
                englishNameTranslation: 'The Table Spread',
                revelationType: 'Medinan',
                numberOfAyahs: 120,
            },
        ];

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

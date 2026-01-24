// Simple test file to check if the components can be imported without errors
console.log('Testing component imports...');

try {
    // Test dataService
    const { getTableOfContents, getSuraData } = require('./src/data/dataService');
    console.log('✅ dataService imported successfully');

    // Test if data files exist
    const tableOfContents = require('./src/data/al_quran_json_collection/table_of_contents.json');
    const sura1 = require('./src/data/al_quran_json_collection/1_sura_al_faatiha.json');

    console.log('✅ JSON data files loaded successfully');
    console.log('Table of contents has', tableOfContents.suras.length, 'suras');
    console.log('Sura 1 has', sura1.ayahs.length, 'ayahs');

    // Test async functions
    getTableOfContents()
        .then((data) => {
            console.log('✅ getTableOfContents works, returned', data.surahs.length, 'surahs');
        })
        .catch((err) => console.error('❌ getTableOfContents error:', err));

    getSuraData(1)
        .then((data) => {
            console.log('✅ getSuraData(1) works, returned', data.ayahs.length, 'ayahs');
        })
        .catch((err) => console.error('❌ getSuraData error:', err));
} catch (error) {
    console.error('❌ Import error:', error.message);
}

console.log('Test completed.');

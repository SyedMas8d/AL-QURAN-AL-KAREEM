# Audio Files for Prayer (As-Salah)

This folder contains audio files for post-prayer duas and dhikr.

## Required Audio Files

Please add the following MP3 audio files to this directory:

### 1. DUA_AFT_SALAH_ASTAKFIR.mp3

- **Dua**: أَسْتَغْفِرُ اللَّهَ (Astaghfirullah)
- **Meaning**: I seek forgiveness from Allah
- **Recitation**: Should be recited 3 times
- **Section**: After prayer (தொழுகை முடிந்தவுடன் ஓத வேண்டியவை)

### 2. DUA_AFT_SALAH_ANTHA_SALAAM.mp3

- **Dua**: اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ...
- **Translation**: O Allah, You are Peace, and from You comes peace...
- **Section**: After prayer (தொழுகை முடிந்தவுடன் ஓத வேண்டியவை)

### 3. DUA_AFT_SALAH_TASBEEH.mp3

- **Contains**:
    - 33x سُبْحَانَ اللَّهِ (Subhanallah)
    - 33x الْحَمْدُ لِلَّهِ (Alhamdulillah)
    - 33x اللَّهُ أَكْبَرُ (Allahu Akbar)
    - Followed by: لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ...
- **Section**: After prayer (தொழுகை முடிந்தவுடன் ஓத வேண்டியவை)

## File Format

- Format: MP3
- Encoding: 128kbps or higher recommended
- Sample Rate: 44.1kHz or higher

## Sources for Audio

You can record these yourself or download from reliable Islamic audio sources like:

- Islamic Network (islamic.network)
- Quran.com
- Muslim Central

## ⚠️ IMPORTANT: After Adding Audio Files

Once you've added the 3 MP3 files to this folder, you need to enable them in the code:

1. Open `app/src/utils/audioAssets.js`
2. Find the commented section that starts with `/*`
3. Uncomment the `audioRequireMap` object (remove `/*` and `*/`)
4. Save the file and restart your Expo development server

## Note

Make sure the audio files are named exactly as shown above (case-sensitive) for the app to recognize them properly.

import * as Speech from 'expo-speech';

class TextToSpeechService {
  constructor() {
    this.isPlaying = false;
    this.currentOptions = {
      language: 'en-US',
      pitch: 1.0,
      rate: 0.8, // Slightly slower for better learning
      voice: null
    };
  }

  // Play English word pronunciation
  async speakEnglish(text) {
    try {
      if (this.isPlaying) {
        // If currently playing, stop first
        Speech.stop();
      }

      this.isPlaying = true;
      
      const options = {
        language: 'en-US',
        pitch: 1.0,
        rate: 0.8,
        onStart: () => {
          console.log('Starting playback:', text);
        },
        onDone: () => {
          console.log('Playback completed:', text);
          this.isPlaying = false;
        },
        onStopped: () => {
          console.log('Playback stopped:', text);
          this.isPlaying = false;
        },
        onError: (error) => {
          console.error('Playback error:', error);
          this.isPlaying = false;
        }
      };

      await Speech.speak(text, options);
      return true;
    } catch (error) {
      console.error('Speech playback failed:', error);
      this.isPlaying = false;
      throw new Error('Speech playback failed');
    }
  }

  // Play Chinese
  async speakChinese(text) {
    try {
      if (this.isPlaying) {
        Speech.stop();
      }

      this.isPlaying = true;
      
      const options = {
        language: 'zh-CN',
        pitch: 1.0,
        rate: 0.8,
        onDone: () => {
          this.isPlaying = false;
        },
        onError: (error) => {
          console.error('Chinese playback error:', error);
          this.isPlaying = false;
        }
      };

      await Speech.speak(text, options);
      return true;
    } catch (error) {
      console.error('Chinese speech playback failed:', error);
      this.isPlaying = false;
      throw new Error('Chinese speech playback failed');
    }
  }

  // Play example sentence
  async speakSentence(sentence, language = 'en-US') {
    try {
      const options = {
        language: language,
        pitch: 1.0,
        rate: 0.7, // Read sentences slower
        onDone: () => {
          this.isPlaying = false;
        }
      };

      await Speech.speak(sentence, options);
      return true;
    } catch (error) {
      console.error('Example sentence playback failed:', error);
      throw new Error('Example sentence playback failed');
    }
  }

  // Stop playback
  stop() {
    try {
      Speech.stop();
      this.isPlaying = false;
    } catch (error) {
      console.error('Failed to stop playback:', error);
    }
  }

  // Check if currently playing
  isCurrentlyPlaying() {
    return this.isPlaying;
  }

  // Get available voices
  async getAvailableVoices() {
    try {
      const voices = await Speech.getAvailableVoicesAsync();
      return voices;
    } catch (error) {
      console.error('Failed to get voice list:', error);
      return [];
    }
  }
}

export default TextToSpeechService;
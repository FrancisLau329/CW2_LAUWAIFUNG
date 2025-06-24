import Voice from '@react-native-voice/voice';
import { Alert } from 'react-native';

class VoiceRecognitionService {
  constructor() {
    this.isListening = false;
    this.recognizedText = '';
    this.onSpeechResults = null;
    this.onSpeechError = null;
    this.onSpeechStart = null;
    this.onSpeechEnd = null;
    
    this.initializeVoice();
  }

  // Initialize voice recognition
  initializeVoice() {
    Voice.onSpeechStart = this.onSpeechStartHandler.bind(this);
    Voice.onSpeechEnd = this.onSpeechEndHandler.bind(this);
    Voice.onSpeechResults = this.onSpeechResultsHandler.bind(this);
    Voice.onSpeechError = this.onSpeechErrorHandler.bind(this);
    Voice.onSpeechPartialResults = this.onSpeechPartialResultsHandler.bind(this);
  }

  // Start voice recognition
  async startListening(language = 'en-US') {
    try {
      if (this.isListening) {
        await this.stopListening();
      }
      
      console.log('🎤 Starting voice recognition...');
      await Voice.start(language);
      this.isListening = true;
    } catch (error) {
      console.error('Failed to start voice recognition:', error);
      throw error;
    }
  }

  // Stop voice recognition
  async stopListening() {
    try {
      console.log('🛑 Stopping voice recognition');
      await Voice.stop();
      this.isListening = false;
    } catch (error) {
      console.error('Failed to stop voice recognition:', error);
    }
  }

  // Cancel voice recognition
  async cancelListening() {
    try {
      await Voice.cancel();
      this.isListening = false;
    } catch (error) {
      console.error('Failed to cancel voice recognition:', error);
    }
  }

  // Destroy voice recognition
  async destroy() {
    try {
      await Voice.destroy();
      this.isListening = false;
      Voice.removeAllListeners();
    } catch (error) {
      console.error('Failed to destroy voice recognition:', error);
    }
  }

  // Voice start event
  onSpeechStartHandler(event) {
    console.log('🎤 Voice recognition started');
    if (this.onSpeechStart) {
      this.onSpeechStart(event);
    }
  }

  // Voice end event
  onSpeechEndHandler(event) {
    console.log('🛑 Voice recognition ended');
    this.isListening = false;
    if (this.onSpeechEnd) {
      this.onSpeechEnd(event);
    }
  }

  // Voice recognition results
  onSpeechResultsHandler(event) {
    const results = event.value || [];
    this.recognizedText = results[0] || '';
    console.log('🎯 Recognition result:', this.recognizedText);
    
    if (this.onSpeechResults) {
      this.onSpeechResults(results);
    }
  }

  // Partial recognition results
  onSpeechPartialResultsHandler(event) {
    const partialResults = event.value || [];
    console.log('🔄 Partial result:', partialResults[0]);
  }

  // Voice recognition error
  onSpeechErrorHandler(error) {
    console.error('🚫 Voice recognition error:', error);
    this.isListening = false;
    
    if (this.onSpeechError) {
      this.onSpeechError(error);
    }
  }

  // Set callback functions
  setCallbacks({ onResults, onError, onStart, onEnd }) {
    this.onSpeechResults = onResults;
    this.onSpeechError = onError;
    this.onSpeechStart = onStart;
    this.onSpeechEnd = onEnd;
  }

  // Check if voice recognition is available
  async isRecognitionAvailable() {
    try {
      const available = await Voice.isAvailable();
      return available;
    } catch (error) {
      console.error('Failed to check voice recognition availability:', error);
      return false;
    }
  }

  // Get supported languages
  async getSupportedLanguages() {
    try {
      const languages = await Voice.getSupportedActivities();
      return languages;
    } catch (error) {
      console.error('Failed to get supported languages:', error);
      return [];
    }
  }
}

export default VoiceRecognitionService;
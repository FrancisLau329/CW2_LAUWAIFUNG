import VoiceRecognitionService from './VoiceRecognitionService';

class PronunciationService {
  constructor() {
    this.voiceService = new VoiceRecognitionService();
    this.targetWord = '';
    this.pronunciationScore = 0;
  }

  // Start pronunciation practice
  async startPronunciationPractice(targetWord, onResult) {
    this.targetWord = targetWord.toLowerCase().trim();
    
    // Set voice recognition callbacks
    this.voiceService.setCallbacks({
      onResults: (results) => this.evaluatePronunciation(results, onResult),
      onError: (error) => this.handlePronunciationError(error, onResult),
      onStart: () => console.log('🎤 Starting recording...'),
      onEnd: () => console.log('🛑 Recording ended')
    });

    try {
      await this.voiceService.startListening('en-US');
      return true;
    } catch (error) {
      console.error('Failed to start pronunciation practice:', error);
      return false;
    }
  }

  // Stop pronunciation practice
  async stopPronunciationPractice() {
    await this.voiceService.stopListening();
  }

  // Evaluate pronunciation
  evaluatePronunciation(results, onResult) {
    if (!results || results.length === 0) {
      onResult({
        success: false,
        score: 0,
        feedback: 'No voice detected, please try again',
        recognizedText: ''
      });
      return;
    }

    const recognizedText = results[0].toLowerCase().trim();
    const score = this.calculatePronunciationScore(this.targetWord, recognizedText);
    
    const result = {
      success: true,
      score,
      feedback: this.generateFeedback(score, this.targetWord, recognizedText),
      recognizedText,
      targetWord: this.targetWord
    };

    console.log('🎯 Pronunciation evaluation result:', result);
    onResult(result);
  }

  // Calculate pronunciation score
  calculatePronunciationScore(target, recognized) {
    // Perfect match
    if (target === recognized) {
      return 100;
    }

    // Similarity calculation
    const similarity = this.calculateSimilarity(target, recognized);
    
    // Score based on similarity
    let score = Math.round(similarity * 100);
    
    // Additional scoring rules
    if (recognized.includes(target) || target.includes(recognized)) {
      score = Math.max(score, 70);
    }
    
    // Bonus for length similarity
    const lengthRatio = Math.min(target.length, recognized.length) / Math.max(target.length, recognized.length);
    score = Math.round(score * (0.7 + 0.3 * lengthRatio));
    
    return Math.min(100, Math.max(0, score));
  }

  // Calculate string similarity
  calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) {
      return 1.0;
    }
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  // Calculate edit distance
  levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  // Generate feedback information
  generateFeedback(score, target, recognized) {
    if (score >= 90) {
      return `🎉 Perfect! Pronunciation is very accurate!`;
    } else if (score >= 80) {
      return `👍 Great! Pronunciation is basically correct, keep it up!`;
    } else if (score >= 70) {
      return `🔄 Good! Pronunciation is close to correct, a bit more practice would be better.`;
    } else if (score >= 50) {
      return `📚 Needs improvement. Target word: ${target}, recognized: ${recognized}. Listen to the original pronunciation and imitate.`;
    } else {
      return `💪 Needs more practice. Suggest listening to standard pronunciation first, then gradually follow along.`;
    }
  }

  // Handle pronunciation errors
  handlePronunciationError(error, onResult) {
    console.error('Pronunciation recognition error:', error);
    
    onResult({
      success: false,
      score: 0,
      feedback: 'Voice recognition error, please check microphone permissions and try again',
      recognizedText: '',
      error: error.message
    });
  }

  // Destroy service
  async destroy() {
    await this.voiceService.destroy();
  }
}

export default PronunciationService;
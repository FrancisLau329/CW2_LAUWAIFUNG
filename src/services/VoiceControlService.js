import VoiceRecognitionService from './VoiceRecognitionService';

class VoiceControlService {
  constructor() {
    this.voiceService = new VoiceRecognitionService();
    this.isActive = false;
    this.commands = this.buildCommandList();
  }

  // Build voice command list
  buildCommandList() {
    return {
      // Navigation commands
      'go home': { action: 'navigate', target: 'Home', description: 'Go to home page' },
      'take photo': { action: 'navigate', target: 'Camera', description: 'Open camera' },
      'show history': { action: 'navigate', target: 'History', description: 'View history' },
      'open dictionary': { action: 'navigate', target: 'Dictionary', description: 'Open dictionary' },
      'my favorites': { action: 'navigate', target: 'Favorites', description: 'My favorites' },
      'weather learning': { action: 'navigate', target: 'WeatherLearning', description: 'Weather learning' },
      
      // Learning control commands
      'play audio': { action: 'play_audio', description: 'Play audio' },
      'stop audio': { action: 'stop_audio', description: 'Stop audio' },
      'repeat': { action: 'repeat_audio', description: 'Repeat playback' },
      'next word': { action: 'next_word', description: 'Next word' },
      'previous word': { action: 'previous_word', description: 'Previous word' },
      'practice pronunciation': { action: 'start_pronunciation', description: 'Practice pronunciation' },
      
      // Favorite and bookmark commands
      'add to favorites': { action: 'add_favorite', description: 'Add to favorites' },
      'remove favorite': { action: 'remove_favorite', description: 'Remove favorite' },
      'mark as learned': { action: 'mark_learned', description: 'Mark as learned' },
      
      // App control commands
      'help': { action: 'show_help', description: 'Show help' },
      'stop listening': { action: 'stop_voice_control', description: 'Stop voice control' },
      'refresh': { action: 'refresh', description: 'Refresh page' },
      
      // Search commands
      'search': { action: 'search', description: 'Search function' },
      'find word': { action: 'search_word', description: 'Find word' },
      
      // Settings commands
      'settings': { action: 'open_settings', description: 'Open settings' },
      'change language': { action: 'change_language', description: 'Change language' }
    };
  }

  // Start voice control
  async startVoiceControl(onCommand, onError) {
    this.isActive = true;
    
    this.voiceService.setCallbacks({
      onResults: (results) => this.processVoiceCommand(results, onCommand),
      onError: (error) => this.handleVoiceControlError(error, onError),
      onStart: () => console.log('🎤 Voice control activated'),
      onEnd: () => {
        if (this.isActive) {
          // Auto-restart listening
          setTimeout(() => {
            if (this.isActive) {
              this.voiceService.startListening('en-US');
            }
          }, 500);
        }
      }
    });

    try {
      await this.voiceService.startListening('en-US');
      return true;
    } catch (error) {
      console.error('Failed to start voice control:', error);
      return false;
    }
  }

  // Stop voice control
  async stopVoiceControl() {
    this.isActive = false;
    await this.voiceService.stopListening();
  }

  // Process voice command
  processVoiceCommand(results, onCommand) {
    if (!results || results.length === 0) return;
    
    const spokenText = results[0].toLowerCase().trim();
    console.log('🎯 Voice command:', spokenText);
    
    // Find matching command
    const matchedCommand = this.findMatchingCommand(spokenText);
    
    if (matchedCommand) {
      console.log('✅ Command recognized:', matchedCommand);
      onCommand(matchedCommand, spokenText);
    } else {
      // Try fuzzy matching
      const fuzzyMatch = this.findFuzzyMatch(spokenText);
      if (fuzzyMatch) {
        console.log('🔄 Fuzzy match:', fuzzyMatch);
        onCommand(fuzzyMatch, spokenText);
      } else {
        console.log('❌ Unrecognized command:', spokenText);
        onCommand({
          action: 'unknown_command',
          originalText: spokenText,
          suggestions: this.getSuggestions(spokenText)
        }, spokenText);
      }
    }
  }

  // Find matching command
  findMatchingCommand(spokenText) {
    // Exact match
    if (this.commands[spokenText]) {
      return { ...this.commands[spokenText], command: spokenText };
    }
    
    // Partial match
    for (const [command, details] of Object.entries(this.commands)) {
      if (spokenText.includes(command) || command.includes(spokenText)) {
        return { ...details, command };
      }
    }
    
    return null;
  }

  // Fuzzy matching
  findFuzzyMatch(spokenText) {
    let bestMatch = null;
    let bestScore = 0;
    
    for (const [command, details] of Object.entries(this.commands)) {
      const score = this.calculateMatchScore(spokenText, command);
      if (score > bestScore && score > 0.6) {
        bestScore = score;
        bestMatch = { ...details, command, confidence: score };
      }
    }
    
    return bestMatch;
  }

  // Calculate match score
  calculateMatchScore(text1, text2) {
    const words1 = text1.split(' ');
    const words2 = text2.split(' ');
    
    let matchCount = 0;
    for (const word1 of words1) {
      for (const word2 of words2) {
        if (word1 === word2 || word1.includes(word2) || word2.includes(word1)) {
          matchCount++;
          break;
        }
      }
    }
    
    return matchCount / Math.max(words1.length, words2.length);
  }

  // Get suggested commands
  getSuggestions(spokenText) {
    const suggestions = [];
    
    // Provide suggestions based on keywords
    if (spokenText.includes('go') || spokenText.includes('open')) {
      suggestions.push('go home', 'take photo', 'open dictionary');
    }
    
    if (spokenText.includes('play') || spokenText.includes('audio')) {
      suggestions.push('play audio', 'stop audio', 'repeat');
    }
    
    if (spokenText.includes('favorite')) {
      suggestions.push('add to favorites', 'my favorites');
    }
    
    return suggestions.slice(0, 3);
  }

  // Handle voice control error
  handleVoiceControlError(error, onError) {
    console.error('Voice control error:', error);
    if (onError) {
      onError(error);
    }
  }

  // Get all available commands
  getAvailableCommands() {
    return Object.entries(this.commands).map(([command, details]) => ({
      command,
      description: details.description
    }));
  }

  // Detect wake word
  detectWakeWord(text) {
    const wakeWords = ['hey vocab', 'vocab lens', 'start listening'];
    return wakeWords.some(word => text.toLowerCase().includes(word));
  }

  // Destroy service
  async destroy() {
    this.isActive = false;
    await this.voiceService.destroy();
  }
}

export default VoiceControlService;
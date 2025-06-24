import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import TextToSpeechService from '../services/TextToSpeechService';

export default function PracticeScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { object } = route.params || {}; 
  
  
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [practiceMode, setPracticeMode] = useState(object ? 'selected' : 'random'); 
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  
  const ttsService = useRef(new TextToSpeechService()).current;

  
  const randomWords = [
    { 
      word: 'happy', 
      chinese: '快乐的', 
      pronunciation: '/ˈhæpi/',
      definition: '感到高兴和满足的',
      type: 'adjective'
    },
    { 
      word: 'beautiful', 
      chinese: '美丽的', 
      pronunciation: '/ˈbjuːtɪfəl/',
      definition: '令人愉悦的外观或声音',
      type: 'adjective'
    },
    { 
      word: 'important', 
      chinese: '重要的', 
      pronunciation: '/ɪmˈpɔːrtənt/',
      definition: '具有很大价值或意义的',
      type: 'adjective'
    },
    { 
      word: 'interesting', 
      chinese: '有趣的', 
      pronunciation: '/ˈɪntrəstɪŋ/',
      definition: '引起注意或好奇心的',
      type: 'adjective'
    },
    { 
      word: 'difficult', 
      chinese: '困难的', 
      pronunciation: '/ˈdɪfɪkəlt/',
      definition: '需要很多努力才能完成的',
      type: 'adjective'
    },
    { 
      word: 'wonderful', 
      chinese: '精彩的', 
      pronunciation: '/ˈwʌndərfəl/',
      definition: '非常好的；令人愉快的',
      type: 'adjective'
    }
  ];

  
  const generateQuestionForSelectedWord = useCallback((wordData, questionIndex = 0) => {
    console.log('Word:', wordData.name || wordData.word);
    
    
    const word = {
      word: wordData.name || wordData.word,
      chinese: wordData.chineseName || wordData.chinese,
      pronunciation: wordData.pronunciation || '/unknown/',
      definition: wordData.chineseDefinition || wordData.definition || '定义不可用',
      type: wordData.type || 'unknown'
    };

    
    const questionTypes = [
      'english_to_chinese',    
      'chinese_to_english',    
      'definition_match'       
    ];

    const questionType = questionTypes[questionIndex % questionTypes.length];

    switch (questionType) {
      case 'english_to_chinese':
        return generateEnglishToChinese(word);
      case 'chinese_to_english':
        return generateChineseToEnglish(word);
      case 'definition_match':
        return generateDefinitionMatch(word);
      default:
        return generateEnglishToChinese(word);
    }
  }, []);

  
  const generateEnglishToChinese = (word) => {
    const wrongOptions = randomWords
      .filter(w => w.chinese !== word.chinese)
      .slice(0, 3)
      .map(w => w.chinese);
    
    const options = [word.chinese, ...wrongOptions].sort(() => Math.random() - 0.5);
    
    return {
      id: `etc_${Date.now()}`,
      type: 'english_to_chinese',
      typeLabel: 'English to Chinese',
      question: `What does "${word.word}" mean in Chinese?`,
      word: word.word,
      pronunciation: word.pronunciation,
      options: options,
      correctAnswer: word.chinese,
      explanation: `"${word.word}" means "${word.chinese}" in Chinese, pronounced as ${word.pronunciation}.`
    };
  };

  
  const generateChineseToEnglish = (word) => {
    const wrongOptions = randomWords
      .filter(w => w.word !== word.word)
      .slice(0, 3)
      .map(w => w.word);
    
    const options = [word.word, ...wrongOptions].sort(() => Math.random() - 0.5);
    
    return {
      id: `cte_${Date.now()}`,
      type: 'chinese_to_english',
      typeLabel: 'Chinese to English',
      question: `What is the English word for "${word.chinese}"?`,
      word: word.chinese,
      pronunciation: word.pronunciation,
      options: options,
      correctAnswer: word.word,
      explanation: `The English word for "${word.chinese}" is "${word.word}", pronounced as ${word.pronunciation}.`
    };
  };

  
  const generateDefinitionMatch = (word) => {
    const wrongDefinitions = [
      '表示颜色的词汇',
      '描述动作的词汇', 
      '表示数量的词汇',
      '描述时间的词汇'
    ];
    
    const options = [word.definition, ...wrongDefinitions.slice(0, 3)].sort(() => Math.random() - 0.5);
    
    return {
      id: `def_${Date.now()}`,
      type: 'definition_match',
      typeLabel: 'Definition Match',
      question: `What does "${word.word}" mean?`,
      word: word.word,
      pronunciation: word.pronunciation,
      options: options,
      correctAnswer: word.definition,
      explanation: `"${word.word}" means: ${word.definition}, which translates to "${word.chinese}" in Chinese.`
    };
  };

  
  const generateRandomQuestion = useCallback(() => {
    console.log('🎲 生成随机题目...');
    
    const randomIndex = Math.floor(Math.random() * randomWords.length);
    const selectedWord = randomWords[randomIndex];
    
    const questionTypeIndex = Math.floor(Math.random() * 3); 
    return generateQuestionForSelectedWord(selectedWord, questionTypeIndex);
  }, [generateQuestionForSelectedWord]);

  
  const initializeQuestion = useCallback(() => {
    console.log('MODE1:', practiceMode);
    
    if (practiceMode === 'selected' && object) {
      
      const question = generateQuestionForSelectedWord(object, currentWordIndex);
      setCurrentQuestion(question);
      console.log('📖 生成选择单词题目:', object.name || object.word, '题型:', question.typeLabel);
    } else {
      
      const question = generateRandomQuestion();
      setCurrentQuestion(question);
      console.log('🎲 生成随机题目:', question.word, '题型:', question.typeLabel);
    }
    
    setSelectedAnswer(null);
    setShowExplanation(false);
  }, [practiceMode, object, currentWordIndex, generateQuestionForSelectedWord, generateRandomQuestion]);

  
  useEffect(() => {
    if (!initialized) {
      setInitialized(true);
      initializeQuestion();
    }
  }, [initialized, initializeQuestion]);

  
  const playAudio = useCallback(async (text) => {
    if (!text || isLoading) return;
    
    try {
      setIsLoading(true);
      await ttsService.speakEnglish(text);
    } catch (error) {
      console.error('🔊 音频播放失败:', error);
    } finally {
      setIsLoading(false);
    }
  }, [ttsService, isLoading]);

  
  const handleAnswer = useCallback((selectedAnswer) => {
    if (showExplanation || !currentQuestion) return;
    
    console.log('🎯 选择答案:', selectedAnswer);
    
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    
    setSelectedAnswer(selectedAnswer);
    setShowExplanation(true);

    setTimeout(() => {
      Alert.alert(
        isCorrect ? '🎉 Correct!' : '📚 Incorrect',
        isCorrect ? 
          'Great! You got it right!' : 
          `The correct answer is: ${currentQuestion.correctAnswer}\n\n${currentQuestion.explanation}`,
        [
          {
            text: 'Continue',
            onPress: () => {
              if (practiceMode === 'selected') {
                handleNextSelectedQuestion();
              } else {
                initializeQuestion();
              }
            }
          }
        ]
      );
    }, 800);
  }, [showExplanation, currentQuestion, practiceMode]);

  
  const handleNextSelectedQuestion = useCallback(() => {
    console.log('➡️ 下一题（选择模式）');
    setCurrentWordIndex(prev => prev + 1);
  }, []);

  
  const viewWordDictionary = useCallback(() => {
    if (object) {
      navigation.navigate('WordDictionary', { word: object });
    }
  }, [navigation, object]);

  
  const switchToRandomMode = useCallback(() => {
    console.log('🎲 切换到随机学习模式');
    setPracticeMode('random');
    setCurrentWordIndex(0);
  }, []);

  
  const backToSelectedMode = useCallback(() => {
    if (object) {
      console.log('📖 返回选择单词模式');
      setPracticeMode('selected');
      setCurrentWordIndex(0);
    }
  }, [object]);

  
  useEffect(() => {
    if (initialized) {
      initializeQuestion();
    }
  }, [practiceMode, currentWordIndex]);

  
  const getButtonStyle = (option) => {
    if (!showExplanation) return styles.optionButton;
    
    if (option === currentQuestion?.correctAnswer) {
      return [styles.optionButton, styles.correctAnswer];
    } else if (option === selectedAnswer) {
      return [styles.optionButton, styles.wrongAnswer];
    } else {
      return [styles.optionButton, styles.disabledAnswer];
    }
  };

  const getTextStyle = (option) => {
    if (!showExplanation) return styles.optionText;
    
    if (option === currentQuestion?.correctAnswer) {
      return [styles.optionText, { color: 'white', fontWeight: '600' }];
    } else if (option === selectedAnswer) {
      return [styles.optionText, { color: 'white', fontWeight: '600' }];
    } else {
      return [styles.optionText, { color: '#9CA3AF' }];
    }
  };

  
  if (!initialized || !currentQuestion) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5D5CDE" />
          <Text style={styles.loadingText}>Preparing practice...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#5D5CDE" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {practiceMode === 'selected' ? 'Word Practice' : 'Random Learning'}
        </Text>
        <TouchableOpacity onPress={initializeQuestion}>
          <MaterialIcons name="refresh" size={24} color="#5D5CDE" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
       
        <View style={styles.modeIndicator}>
          <View style={[
            styles.modeTag,
            { backgroundColor: practiceMode === 'selected' ? '#5D5CDE' : '#F59E0B' }
          ]}>
            <MaterialIcons 
              name={practiceMode === 'selected' ? 'quiz' : 'shuffle'} 
              size={16} 
              color="white" 
            />
            <Text style={styles.modeTagText}>
              {practiceMode === 'selected' ? `Practice Mode (Question ${currentWordIndex + 1})` : 'Random Learning'}
            </Text>
          </View>
          
          <View style={styles.questionTypeTag}>
            <Text style={styles.questionTypeText}>{currentQuestion.typeLabel}</Text>
          </View>
        </View>

        
        <View style={styles.wordCard}>
          <View style={styles.wordHeader}>
            <Text style={styles.wordText}>
              {currentQuestion.type === 'chinese_to_english' ? currentQuestion.word : 
               currentQuestion.word}
            </Text>
            <TouchableOpacity 
              style={styles.audioButton}
              onPress={() => playAudio(
                currentQuestion.type === 'chinese_to_english' 
                  ? currentQuestion.correctAnswer 
                  : currentQuestion.word
              )}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#5D5CDE" />
              ) : (
                <MaterialIcons name="volume-up" size={24} color="#5D5CDE" />
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.pronunciationText}>{currentQuestion.pronunciation}</Text>
        </View>

      
        <View style={styles.questionCard}>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>
        </View>

      
        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option, index) => (
            <TouchableOpacity
              key={`option-${index}`}
              style={getButtonStyle(option)}
              onPress={() => handleAnswer(option)}
              disabled={showExplanation || isLoading}
            >
              <Text style={getTextStyle(option)}>{option}</Text>
              {showExplanation && option === currentQuestion.correctAnswer && (
                <MaterialIcons name="check-circle" size={20} color="white" />
              )}
              {showExplanation && option === selectedAnswer && option !== currentQuestion.correctAnswer && (
                <MaterialIcons name="cancel" size={20} color="white" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        
        {showExplanation && (
          <View style={styles.explanationContainer}>
            <Text style={styles.explanationTitle}>
              {selectedAnswer === currentQuestion.correctAnswer ? '✅ Correct!' : '💡 Explanation'}
            </Text>
            <Text style={styles.explanationText}>
              {currentQuestion.explanation}
            </Text>
          </View>
        )}

  
        <View style={styles.actionButtonsContainer}>
          {practiceMode === 'selected' && object ? (
            
            <View style={styles.selectedModeButtons}>
              <TouchableOpacity 
                style={styles.dictionaryButton}
                onPress={viewWordDictionary}
                disabled={isLoading}
              >
                <MaterialIcons name="book" size={20} color="white" />
                <Text style={styles.dictionaryButtonText}>View Dictionary</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.nextQuestionButton}
                onPress={handleNextSelectedQuestion}
                disabled={isLoading}
              >
                <MaterialIcons name="arrow-forward" size={20} color="white" />
                <Text style={styles.nextQuestionButtonText}>Next Question</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.randomLearningButton}
                onPress={switchToRandomMode}
                disabled={isLoading}
              >
                <MaterialIcons name="shuffle" size={20} color="white" />
                <Text style={styles.randomLearningButtonText}>Random Learning</Text>
              </TouchableOpacity>
            </View>
          ) : (
            
            <View style={styles.randomModeButtons}>
              <TouchableOpacity 
                style={styles.changeQuestionButton}
                onPress={initializeQuestion}
                disabled={isLoading}
              >
                <MaterialIcons name="refresh" size={20} color="#5D5CDE" />
                <Text style={styles.changeQuestionButtonText}>Change Question</Text>
              </TouchableOpacity>
              
              {object && (
                <TouchableOpacity 
                  style={styles.backToSelectedButton}
                  onPress={backToSelectedMode}
                  disabled={isLoading}
                >
                  <MaterialIcons name="quiz" size={20} color="white" />
                  <Text style={styles.backToSelectedButtonText}>Back to Word Practice</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={styles.endPracticeButton}
                onPress={() => navigation.goBack()}
                disabled={isLoading}
              >
                <MaterialIcons name="home" size={20} color="white" />
                <Text style={styles.endPracticeButtonText}>End Practice</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  
  modeIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  modeTagText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  questionTypeTag: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  questionTypeText: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '500',
  },
  wordCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  wordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  wordText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#5D5CDE',
    marginRight: 16,
  },
  audioButton: {
    padding: 8,
    backgroundColor: '#F0F9FF',
    borderRadius: 20,
  },
  pronunciationText: {
    fontSize: 16,
    fontFamily: 'monospace',
    color: '#6B7280',
  },
  questionCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  optionButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 18,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  optionText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  correctAnswer: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  wrongAnswer: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  disabledAnswer: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  explanationContainer: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#5D5CDE',
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  
  actionButtonsContainer: {
    marginBottom: 20,
  },
  
  selectedModeButtons: {
    gap: 12,
  },
  dictionaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  dictionaryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  nextQuestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5D5CDE',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  nextQuestionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  randomLearningButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F59E0B',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  randomLearningButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  
  randomModeButtons: {
    gap: 12,
  },
  changeQuestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: '#5D5CDE',
    gap: 8,
  },
  changeQuestionButtonText: {
    color: '#5D5CDE',
    fontSize: 14,
    fontWeight: '600',
  },
  backToSelectedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5D5CDE',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  backToSelectedButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  endPracticeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6B7280',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  endPracticeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 20,
  },
});
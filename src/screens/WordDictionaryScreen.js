import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import TextToSpeechService from '../services/TextToSpeechService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function WordDictionaryScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { word, mode } = route.params || {}; 
  
  
  const [wordData, setWordData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  
  const ttsService = useRef(new TextToSpeechService()).current;

  
  const FAVORITES_KEY = 'favoriteWords';
  const HISTORY_KEY = 'historyWords';

  
  const isDictionaryMode = mode === 'dictionary';

  
  const getWordTypeDisplay = (type) => {
    const typeMap = {
      'noun': { label: 'Noun', icon: 'label', color: '#3B82F6' },
      'verb': { label: 'Verb', icon: 'play-arrow', color: '#10B981' },
      'adjective': { label: 'Adjective', icon: 'style', color: '#F59E0B' },
      'adverb': { label: 'Adverb', icon: 'speed', color: '#8B5CF6' },
      'preposition': { label: 'Preposition', icon: 'swap-horiz', color: '#6B7280' },
      'pronoun': { label: 'Pronoun', icon: 'person', color: '#EC4899' },
      'conjunction': { label: 'Conjunction', icon: 'link', color: '#14B8A6' },
      'interjection': { label: 'Interjection', icon: 'sentiment-very-satisfied', color: '#F97316' },
      'article': { label: 'Article', icon: 'title', color: '#84CC16' }
    };
    
    return typeMap[type] || { label: 'Word', icon: 'help', color: '#6B7280' };
  };

  
  const enrichWordData = useCallback((inputWord) => {
    console.log('📖 处理单词数据:', inputWord);
    
    
    const baseWord = {
      word: inputWord.name || inputWord.word || 'Unknown',
      chinese: inputWord.chineseName || inputWord.chinese || '未知',
      pronunciation: inputWord.pronunciation || '/unknown/',
      definition: inputWord.chineseDefinition || inputWord.definition || '暂无释义',
      type: inputWord.type || inputWord.wordType || 'noun',
      category: inputWord.category || 'General',
      confidence: inputWord.confidence || 1,
      timestamp: inputWord.timestamp || new Date().toISOString()
    };

    
    let examples = [];
    
    
    if (inputWord.examples && Array.isArray(inputWord.examples)) {
      examples = inputWord.examples.filter(ex => ex && (typeof ex === 'string' || (ex.english && ex.chinese)));
    } else if (inputWord.chineseExamples && Array.isArray(inputWord.chineseExamples)) {
      
      examples = inputWord.chineseExamples.map((chinese, index) => ({
        english: inputWord.examples && inputWord.examples[index] ? inputWord.examples[index] : `This is ${baseWord.word}.`,
        chinese: chinese || `这是${baseWord.chinese}。`
      }));
    }

    
    if (examples.length === 0) {
      examples = generateDefaultExamples(baseWord);
    }

    
    examples = examples.map(ex => {
      if (typeof ex === 'string') {
        return {
          english: ex,
          chinese: `这是一个包含${baseWord.chinese}的例句。`
        };
      }
      return {
        english: ex.english || `Example with ${baseWord.word}.`,
        chinese: ex.chinese || `包含${baseWord.chinese}的例句。`
      };
    }).slice(0, 3); 

    const enrichedWord = {
      ...baseWord,
      examples: examples,
      
      level: inputWord.level || 'intermediate',
      
      frequency: inputWord.frequency || 'common',
      
      synonyms: inputWord.synonyms || generateSynonyms(baseWord.word),
      
      antonyms: inputWord.antonyms || generateAntonyms(baseWord.word),
      
      etymology: inputWord.etymology || generateEtymology(baseWord.word),
      
      viewedAt: new Date().toISOString(),
      
      source: inputWord.source || 'user_selected'
    };

    console.log('DONE', enrichedWord);
    return enrichedWord;
  }, []);

  
  const generateDefaultExamples = (word) => {
    const templates = {
      'noun': [
        { english: `The ${word.word} is very important.`, chinese: `这个${word.chinese}很重要。` },
        { english: `I can see a ${word.word}.`, chinese: `我能看到一个${word.chinese}。` },
        { english: `This ${word.word} is beautiful.`, chinese: `这个${word.chinese}很美丽。` }
      ],
      'verb': [
        { english: `I ${word.word} every day.`, chinese: `我每天都${word.chinese}。` },
        { english: `She likes to ${word.word}.`, chinese: `她喜欢${word.chinese}。` },
        { english: `We should ${word.word} together.`, chinese: `我们应该一起${word.chinese}。` }
      ],
      'adjective': [
        { english: `This is very ${word.word}.`, chinese: `这很${word.chinese}。` },
        { english: `The weather is ${word.word}.`, chinese: `天气很${word.chinese}。` },
        { english: `I feel ${word.word} today.`, chinese: `我今天感觉很${word.chinese}。` }
      ]
    };

    return templates[word.type] || [
      { english: `This is an example with ${word.word}.`, chinese: `这是一个包含${word.chinese}的例句。` },
      { english: `The ${word.word} is interesting.`, chinese: `这个${word.chinese}很有趣。` },
      { english: `I learned about ${word.word}.`, chinese: `我学习了${word.chinese}。` }
    ];
  };

  
  const generateSynonyms = (word) => {
    const synonymsMap = {
      'happy': ['joyful', 'cheerful', 'pleased'],
      'beautiful': ['pretty', 'attractive', 'lovely'],
      'important': ['significant', 'crucial', 'vital'],
      'difficult': ['hard', 'challenging', 'tough'],
      'interesting': ['fascinating', 'engaging', 'intriguing'],
      'good': ['great', 'excellent', 'wonderful'],
      'big': ['large', 'huge', 'enormous']
    };
    return synonymsMap[word.toLowerCase()] || [];
  };

  
  const generateAntonyms = (word) => {
    const antonymsMap = {
      'happy': ['sad', 'unhappy', 'miserable'],
      'beautiful': ['ugly', 'unattractive'],
      'important': ['unimportant', 'trivial'],
      'difficult': ['easy', 'simple'],
      'big': ['small', 'tiny'],
      'good': ['bad', 'poor', 'terrible']
    };
    return antonymsMap[word.toLowerCase()] || [];
  };

  
  const generateEtymology = (word) => {
    return `${word} XX`;
  };

  
  const saveToHistory = useCallback(async (wordData) => {
    try {
      const historyWords = await AsyncStorage.getItem(HISTORY_KEY);
      let history = historyWords ? JSON.parse(historyWords) : [];
      
      history = history.filter(item => item.word !== wordData.word);
      history.unshift({
        ...wordData,
        timestamp: new Date().toISOString(),
        viewCount: (wordData.viewCount || 0) + 1
      });
      
      if (history.length > 100) {
        history = history.slice(0, 100);
      }
      
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));
      console.log('ok', wordData.word);
    } catch (error) {
      console.error('ERROR', error);
    }
  }, []);

  
  const checkIfFavorite = useCallback(async (wordData) => {
    try {
      const favoriteWords = await AsyncStorage.getItem(FAVORITES_KEY);
      if (favoriteWords) {
        const favorites = JSON.parse(favoriteWords);
        const isFav = favorites.some(item => item.word === wordData.word);
        setIsFavorite(isFav);
      }
    } catch (error) {
      console.error('ERROR:', error);
    }
  }, []);

  
  const toggleFavorite = useCallback(async () => {
    if (!wordData) return;
    
    try {
      setFavoriteLoading(true);
      
      const favoriteWords = await AsyncStorage.getItem(FAVORITES_KEY);
      let favorites = favoriteWords ? JSON.parse(favoriteWords) : [];
      
      const existingIndex = favorites.findIndex(item => item.word === wordData.word);
      
      if (existingIndex >= 0) {
        favorites.splice(existingIndex, 1);
        setIsFavorite(false);
        console.log('ok');
      } else {
        favorites.unshift({
          ...wordData,
          favoriteTimestamp: new Date().toISOString()
        });
        setIsFavorite(true);
        console.log('ADDED');
      }
      
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      
    } catch (error) {
      console.error('ERROR:', error);
    } finally {
      setFavoriteLoading(false);
    }
  }, [wordData]);

  
  const playAudio = useCallback(async (text) => {
    if (!text || isLoading) return;
    
    try {
      setIsLoading(true);
      await ttsService.speakEnglish(text);
    } catch (error) {
      console.error('🔊 ERROR:', error);
    } finally {
      setIsLoading(false);
    }
  }, [ttsService, isLoading]);

  
  useEffect(() => {
    if (!initialized && word) {
      setInitialized(true);
      
      const enriched = enrichWordData(word);
      setWordData(enriched);
      
      saveToHistory(enriched);
      checkIfFavorite(enriched);
      
      console.log('✅ WordDictionaryScreen ', enriched.word);
      console.log('NOW:', isDictionaryMode ? 'MODE1' : 'MODE2');
    }
  }, [initialized, word, enrichWordData, saveToHistory, checkIfFavorite]);

  
  const goToPractice = useCallback(() => {
    if (wordData) {
      navigation.navigate('Practice', { object: wordData });
    }
  }, [navigation, wordData]);

  
  if (!initialized || !wordData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5D5CDE" />
          <Text style={styles.loadingText}>Loading word information...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const wordTypeInfo = getWordTypeDisplay(wordData.type);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#5D5CDE" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isDictionaryMode ? 'Word Dictionary' : 'Word Details'}
        </Text>
        <TouchableOpacity onPress={toggleFavorite} disabled={favoriteLoading}>
          {favoriteLoading ? (
            <ActivityIndicator size="small" color="#5D5CDE" />
          ) : (
            <MaterialIcons 
              name={isFavorite ? "favorite" : "favorite-border"} 
              size={24} 
              color={isFavorite ? "#EF4444" : "#5D5CDE"} 
            />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
 
        <View style={styles.mainWordCard}>
          <View style={styles.wordHeaderSection}>
            <View style={styles.wordMainInfo}>
              <Text style={styles.mainWord}>{wordData.word}</Text>
              <Text style={styles.mainChinese}>{wordData.chinese}</Text>
              <Text style={styles.mainPronunciation}>{wordData.pronunciation}</Text>
            </View>
            
            <View style={styles.wordActions}>
              <TouchableOpacity 
                style={styles.playButton}
                onPress={() => playAudio(wordData.word)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <MaterialIcons name="volume-up" size={28} color="white" />
                )}
              </TouchableOpacity>
            </View>
          </View>

   
          <View style={styles.wordMetaInfo}>
            <View style={[styles.wordTypeTag, { backgroundColor: wordTypeInfo.color }]}>
              <MaterialIcons name={wordTypeInfo.icon} size={16} color="white" />
              <Text style={styles.wordTypeText}>{wordTypeInfo.label}</Text>
            </View>
            
            <View style={styles.wordLevel}>
              <MaterialIcons name="bar-chart" size={16} color="#6B7280" />
              <Text style={styles.wordLevelText}>
                {wordData.level === 'beginner' ? 'Beginner' : 
                 wordData.level === 'intermediate' ? 'Intermediate' : 'Advanced'}
              </Text>
            </View>
            
            <View style={styles.wordFrequency}>
              <MaterialIcons name="trending-up" size={16} color="#6B7280" />
              <Text style={styles.wordFrequencyText}>
                {wordData.frequency === 'common' ? 'Common' : 
                 wordData.frequency === 'uncommon' ? 'Uncommon' : 'Average'}
              </Text>
            </View>
          </View>

       
          <View style={styles.modeIndicator}>
            <MaterialIcons 
              name={isDictionaryMode ? "book" : "quiz"} 
              size={14} 
              color={isDictionaryMode ? "#059669" : "#5D5CDE"} 
            />
            <Text style={[
              styles.modeText,
              { color: isDictionaryMode ? "#059669" : "#5D5CDE" }
            ]}>
              {isDictionaryMode ? 'Dictionary View Mode' : 'Learning Practice Mode'}
            </Text>
          </View>
        </View>

        {/* 🆕 释义卡片 */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <MaterialIcons name="description" size={20} color="#5D5CDE" />
            <Text style={styles.infoTitle}>Definition</Text>
          </View>
          <Text style={styles.definitionText}>{wordData.definition}</Text>
        </View>

        {/* 🔧 修复后的例句卡片 */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <MaterialIcons name="format-quote" size={20} color="#5D5CDE" />
            <Text style={styles.infoTitle}>Examples</Text>
          </View>
          {wordData.examples && wordData.examples.length > 0 ? (
            wordData.examples.map((example, index) => (
              <View key={index} style={styles.exampleItem}>
                <TouchableOpacity 
                  style={styles.exampleEnglish}
                  onPress={() => playAudio(example.english)}
                >
                  <Text style={styles.exampleEnglishText}>{example.english}</Text>
                  <MaterialIcons name="volume-up" size={16} color="#5D5CDE" />
                </TouchableOpacity>
                <Text style={styles.exampleChineseText}>{example.chinese}</Text>
              </View>
            ))
          ) : (
            <View style={styles.noExamplesContainer}>
              <Text style={styles.noExamplesText}>No examples available</Text>
            </View>
          )}
        </View>

        {/* 🆕 同义词和反义词 */}
        {(wordData.synonyms?.length > 0 || wordData.antonyms?.length > 0) && (
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <MaterialIcons name="compare-arrows" size={20} color="#5D5CDE" />
              <Text style={styles.infoTitle}>Related Vocabulary</Text>
            </View>
            
            {wordData.synonyms?.length > 0 && (
              <View style={styles.relatedWordsSection}>
                <Text style={styles.relatedWordsLabel}>Synonyms:</Text>
                <View style={styles.relatedWordsList}>
                  {wordData.synonyms.map((synonym, index) => (
                    <TouchableOpacity key={index} style={styles.relatedWordTag}>
                      <Text style={styles.relatedWordText}>{synonym}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
            
            {wordData.antonyms?.length > 0 && (
              <View style={styles.relatedWordsSection}>
                <Text style={styles.relatedWordsLabel}>Antonyms:</Text>
                <View style={styles.relatedWordsList}>
                  {wordData.antonyms.map((antonym, index) => (
                    <TouchableOpacity key={index} style={[styles.relatedWordTag, styles.antonymTag]}>
                      <Text style={[styles.relatedWordText, styles.antonymText]}>{antonym}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {/* 🔧 修改后的操作按钮 - 根据模式显示不同按钮 */}
        <View style={styles.actionButtonsContainer}>
          {isDictionaryMode ? (
            
            <View style={styles.dictionaryModeActions}>
              <TouchableOpacity 
                style={styles.optionalPracticeButton}
                onPress={goToPractice}
              >
                <MaterialIcons name="school" size={20} color="#5D5CDE" />
                <Text style={styles.optionalPracticeButtonText}>Optional Practice</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <MaterialIcons name="arrow-back" size={20} color="#6B7280" />
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            </View>
          ) : (
            
            <TouchableOpacity 
              style={styles.practiceButton}
              onPress={goToPractice}
            >
              <MaterialIcons name="quiz" size={24} color="white" />
              <Text style={styles.practiceButtonText}>Start Practice</Text>
            </TouchableOpacity>
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
  
  mainWordCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  wordHeaderSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  wordMainInfo: {
    flex: 1,
  },
  mainWord: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#5D5CDE',
    marginBottom: 8,
  },
  mainChinese: {
    fontSize: 24,
    color: '#374151',
    marginBottom: 6,
    fontWeight: '500',
  },
  mainPronunciation: {
    fontSize: 18,
    fontFamily: 'monospace',
    color: '#6B7280',
  },
  wordActions: {
    alignItems: 'center',
  },
  playButton: {
    backgroundColor: '#5D5CDE',
    borderRadius: 25,
    padding: 12,
    shadowColor: '#5D5CDE',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  
  wordMetaInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  wordTypeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  wordTypeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  wordLevel: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  wordLevelText: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '500',
  },
  wordFrequency: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  wordFrequencyText: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '500',
  },
  
  modeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
    alignSelf: 'flex-start',
  },
  modeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  definitionText: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },
  
  exampleItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#5D5CDE',
  },
  exampleEnglish: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  exampleEnglishText: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
    flex: 1,
    lineHeight: 22,
  },
  exampleChineseText: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  
  noExamplesContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noExamplesText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  
  relatedWordsSection: {
    marginBottom: 16,
  },
  relatedWordsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  relatedWordsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  relatedWordTag: {
    backgroundColor: '#E0E7FF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  relatedWordText: {
    fontSize: 13,
    color: '#5D5CDE',
    fontWeight: '500',
  },
  antonymTag: {
    backgroundColor: '#FEE2E2',
  },
  antonymText: {
    color: '#EF4444',
  },
  
  actionButtonsContainer: {
    gap: 12,
    marginTop: 8,
    marginBottom: 20,
  },
  
  dictionaryModeActions: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  
  optionalPracticeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: '#5D5CDE',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  optionalPracticeButtonText: {
    color: '#5D5CDE',
    fontSize: 16,
    fontWeight: '600',
  },
  
  backButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingVertical: 14,
    gap: 8,
  },
  backButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  
  practiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5D5CDE',
    borderRadius: 16,
    paddingVertical: 16,
    gap: 12,
    shadowColor: '#5D5CDE',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  practiceButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 40,
  },
});
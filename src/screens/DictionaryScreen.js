import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import DictionaryService from '../services/DictionaryService';
import TextToSpeechService from '../services/TextToSpeechService';

const { width } = Dimensions.get('window');

export default function DictionaryScreen() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [randomWord, setRandomWord] = useState(null);
  const [categories, setCategories] = useState([]);
  const [dictionary] = useState(new DictionaryService());
  const [ttsService] = useState(new TextToSpeechService());

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = () => {
 
    const allCategories = dictionary.getAllCategories();
    setCategories(['all', ...allCategories]);
    
    const randomWordInfo = dictionary.getRandomWord();
    setRandomWord(randomWordInfo);
  };

 
  const handleSearch = (query) => {
    setSearchQuery(query);
    
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    
    const results = dictionary.searchDictionary(query);
    setSearchResults(results);
  };


  const handleCategoryFilter = () => {
    if (selectedCategory === 'all') {
      return [];
    }
    
    const categoryWords = dictionary.getWordsByCategory(selectedCategory);
    return categoryWords.slice(0, 20); 
  };


  const playPronunciation = async (word) => {
    try {
      await ttsService.speakEnglish(word);
    } catch (error) {
      Alert.alert('Error', 'Failed to play pronunciation');
    }
  };


  const WordCard = ({ wordInfo, showCategory = true }) => (
    <TouchableOpacity 
      style={styles.wordCard}
      onPress={() => showWordDetail(wordInfo)}
    >
      <View style={styles.wordHeader}>
        <View style={styles.wordInfo}>
          <Text style={styles.wordName}>{wordInfo.word || wordInfo.searchTerm}</Text>
          <Text style={styles.wordChinese}>{wordInfo.chinese}</Text>
          {showCategory && (
            <Text style={styles.wordCategory}>{wordInfo.category}</Text>
          )}
        </View>
        
        <View style={styles.wordActions}>
          <TouchableOpacity 
            style={styles.pronunciationButton}
            onPress={() => playPronunciation(wordInfo.word || wordInfo.searchTerm)}
          >
            <MaterialIcons name="volume-up" size={20} color="#5D5CDE" />
          </TouchableOpacity>
          
          <View style={[styles.difficultyBadge, 
            wordInfo.difficulty === 'Beginner' ? styles.beginnerBadge :
            wordInfo.difficulty === 'Intermediate' ? styles.intermediateBadge :
            styles.advancedBadge
          ]}>
            <Text style={styles.difficultyText}>
              {wordInfo.difficulty === 'Beginner' ? '初級' :
               wordInfo.difficulty === 'Intermediate' ? '中級' : '高級'}
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.wordPronunciation}>{wordInfo.pronunciation}</Text>
      <Text style={styles.wordDefinition} numberOfLines={2}>
        {wordInfo.chineseDefinition}
      </Text>
      
      {wordInfo.usageNote && (
        <Text style={styles.usageNote} numberOfLines={1}>
          💡 {wordInfo.usageNote}
        </Text>
      )}
    </TouchableOpacity>
  );


  const showWordDetail = (wordInfo) => {
    Alert.alert(
      `📚 ${wordInfo.word || wordInfo.searchTerm} (${wordInfo.chinese})`,
      `🔊 Pronunciation: ${wordInfo.pronunciation}\n\n📖 English Definition:\n${wordInfo.definition}\n\n🇨🇳 Chinese Definition:\n${wordInfo.chineseDefinition}\n\n💡 Usage Tips:\n${wordInfo.usageNote || 'No special tips'}\n\n📝 Examples:\n${wordInfo.examples?.[0] || 'No examples'}`,
      [
        { text: 'Play Pronunciation', onPress: () => playPronunciation(wordInfo.word || wordInfo.searchTerm) },
        { text: 'Practice', onPress: () => startPractice(wordInfo) },
        { text: 'Close', style: 'cancel' }
      ]
    );
  };

  
  const startPractice = (wordInfo) => {
    navigation.navigate('Practice', { object: wordInfo });
  };

 
  const getNewRandomWord = () => {
    const newRandomWord = dictionary.getRandomWord();
    setRandomWord(newRandomWord);
  };

  const displayResults = searchQuery.trim().length >= 2 ? searchResults : 
                        selectedCategory !== 'all' ? handleCategoryFilter() : [];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#5D5CDE" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>English-Chinese Dictionary</Text>
        <TouchableOpacity onPress={getNewRandomWord}>
          <MaterialIcons name="shuffle" size={24} color="#5D5CDE" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
     
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <MaterialIcons name="search" size={20} color="#6B7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search English words or Chinese..."
              value={searchQuery}
              onChangeText={handleSearch}
              placeholderTextColor="#9CA3AF"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => handleSearch('')}>
                <MaterialIcons name="clear" size={20} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>
        </View>

     
        {!searchQuery && selectedCategory === 'all' && randomWord && (
          <View style={styles.randomWordContainer}>
            <View style={styles.randomWordHeader}>
              <Text style={styles.randomWordTitle}>📖 Today's Recommendation</Text>
              <TouchableOpacity onPress={getNewRandomWord} style={styles.shuffleButton}>
                <MaterialIcons name="refresh" size={16} color="#5D5CDE" />
                <Text style={styles.shuffleText}>Get Another</Text>
              </TouchableOpacity>
            </View>
            <WordCard wordInfo={randomWord} showCategory={true} />
          </View>
        )}

       
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoryFilter}
        >
          {categories.map(category => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[
                styles.categoryButtonText,
                selectedCategory === category && styles.categoryButtonTextActive
              ]}>
                {category === 'all' ? 'All' : category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        
        {displayResults.length > 0 && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>
              {searchQuery.trim().length >= 2 ? 
                `🔍 Search Results (${displayResults.length})` : 
                `📚 ${selectedCategory} Category (${displayResults.length})`
              }
            </Text>
            
            {displayResults.map((wordInfo, index) => (
              <WordCard 
                key={index} 
                wordInfo={wordInfo} 
                showCategory={searchQuery.trim().length >= 2}
              />
            ))}
          </View>
        )}

     
        {searchQuery.trim().length >= 2 && displayResults.length === 0 && (
          <View style={styles.noResultsContainer}>
            <MaterialIcons name="search-off" size={48} color="#D1D5DB" />
            <Text style={styles.noResultsTitle}>No Results Found</Text>
            <Text style={styles.noResultsSubtitle}>
              Try searching other words or browse different categories
            </Text>
          </View>
        )}

       
        {!searchQuery && selectedCategory === 'all' && (
          <View style={styles.statsContainer}>
            <Text style={styles.statsTitle}>📊 Dictionary Statistics</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{Object.keys(dictionary.dictionary).length}</Text>
                <Text style={styles.statLabel}>Total Words</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{categories.length - 1}</Text>
                <Text style={styles.statLabel}>Categories</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {dictionary.getWordsByDifficulty('Beginner').length}
                </Text>
                <Text style={styles.statLabel}>Beginner Words</Text>
              </View>
            </View>
          </View>
        )}

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
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
    color: '#374151',
  },
  randomWordContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  randomWordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  randomWordTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  shuffleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  shuffleText: {
    fontSize: 12,
    color: '#5D5CDE',
    marginLeft: 4,
  },
  categoryFilter: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryButtonActive: {
    backgroundColor: '#5D5CDE',
    borderColor: '#5D5CDE',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#6B7280',
  },
  categoryButtonTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  resultsContainer: {
    paddingHorizontal: 20,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  wordCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  wordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  wordInfo: {
    flex: 1,
  },
  wordName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5D5CDE',
  },
  wordChinese: {
    fontSize: 16,
    color: '#374151',
    marginTop: 2,
  },
  wordCategory: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  wordActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pronunciationButton: {
    padding: 8,
  },
  difficultyBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  beginnerBadge: {
    backgroundColor: '#10B981',
  },
  intermediateBadge: {
    backgroundColor: '#F59E0B',
  },
  advancedBadge: {
    backgroundColor: '#EF4444',
  },
  difficultyText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  wordPronunciation: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#6B7280',
    marginBottom: 4,
  },
  wordDefinition: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 4,
  },
  usageNote: {
    fontSize: 12,
    color: '#F59E0B',
    fontStyle: 'italic',
  },
  noResultsContainer: {
    alignItems: 'center',
    padding: 40,
  },
  noResultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  noResultsSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  statsContainer: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#5D5CDE',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  bottomSpacing: {
    height: 40,
  },
});
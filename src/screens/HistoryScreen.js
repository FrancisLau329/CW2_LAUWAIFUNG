import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
  Dimensions
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { DataContext } from '../context/DataContext';
import TextToSpeechService from '../services/TextToSpeechService';

const { width } = Dimensions.get('window');

export default function HistoryScreen() {
  const navigation = useNavigation();
  const { 
    recognizedObjects, 
    learningProgress, 
    practiceHistory,
    getDetailedStats,
    loadAllData,
    clearAllData
  } = useContext(DataContext);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('date'); 
  const [filteredObjects, setFilteredObjects] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showStats, setShowStats] = useState(true);
  const [ttsService] = useState(new TextToSpeechService());

  
  useFocusEffect(
    React.useCallback(() => {
      updateFilteredObjects();
    }, [recognizedObjects, searchQuery, selectedCategory, sortBy])
  );

  useEffect(() => {
    updateFilteredObjects();
  }, [recognizedObjects, searchQuery, selectedCategory, sortBy]);

  
  const updateFilteredObjects = () => {
    let filtered = [...recognizedObjects];

    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(obj =>
        obj.name.toLowerCase().includes(query) ||
        obj.chineseName.toLowerCase().includes(query) ||
        obj.category.toLowerCase().includes(query)
      );
    }

    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(obj => 
        obj.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'confidence':
          return b.confidence - a.confidence;
        case 'date':
        default:
          return new Date(b.timestamp) - new Date(a.timestamp);
      }
    });

    setFilteredObjects(filtered);
  };

  
  const getCategories = () => {
    const categories = new Set(recognizedObjects.map(obj => obj.category));
    return ['all', ...Array.from(categories)];
  };

  
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadAllData();
    } catch (error) {
      console.error('刷新失敗:', error);
    } finally {
      setRefreshing(false);
    }
  };

  
  const playPronunciation = async (word) => {
    try {
      await ttsService.speakEnglish(word);
    } catch (error) {
      Alert.alert('Error', 'Failed to play pronunciation');
    }
  };

  
  const viewDictionary = (object) => {
    console.log('📖 跳轉到字典頁面:', object.name);
    navigation.navigate('WordDictionary', { word: object });
  };

  
  const startPractice = (object) => {
    console.log('🎯 跳轉到練習頁面:', object.name);
    navigation.navigate('Practice', { object });
  };

  
  const handleClearHistory = () => {
    Alert.alert(
      '⚠️ Confirm Clear All',
      'This will delete all learning records, progress and favorites. This action cannot be undone.\n\nAre you sure you want to continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllData();
              Alert.alert('✅ Complete', 'All data cleared');
            } catch (error) {
              Alert.alert('❌ Error', 'Failed to clear, please try again');
            }
          }
        }
      ]
    );
  };

  
  const getWordTypeInfo = (object) => {
    const type = object.type || object.wordType || 'unknown';
    const typeMap = {
      'noun': { label: '名', color: '#3B82F6', icon: 'label' },
      'verb': { label: '动', color: '#10B981', icon: 'play-arrow' },
      'adjective': { label: '形', color: '#F59E0B', icon: 'style' },
      'adverb': { label: '副', color: '#8B5CF6', icon: 'speed' },
      'preposition': { label: '介', color: '#6B7280', icon: 'swap-horiz' },
      'pronoun': { label: '代', color: '#EC4899', icon: 'person' },
      'conjunction': { label: '连', color: '#14B8A6', icon: 'link' },
      'interjection': { label: '感', color: '#F97316', icon: 'sentiment-very-satisfied' },
      'article': { label: '冠', color: '#84CC16', icon: 'title' }
    };
    
    return typeMap[type] || { label: '词', color: '#6B7280', icon: 'help' };
  };

  
  const StatsCard = () => {
    const stats = getDetailedStats();
    
    return (
      <View style={styles.statsCard}>
        <View style={styles.statsHeader}>
          <Text style={styles.statsTitle}>📊 Learning Statistics</Text>
          <TouchableOpacity onPress={() => setShowStats(!showStats)}>
            <MaterialIcons 
              name={showStats ? "expand-less" : "expand-more"} 
              size={24} 
              color="#6B7280" 
            />
          </TouchableOpacity>
        </View>
        
        {showStats && (
          <View style={styles.statsContent}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.totalObjects || 0}</Text>
                <Text style={styles.statLabel}>Total Recognized</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{learningProgress.wordsLearned || 0}</Text>
                <Text style={styles.statLabel}>Words Learned</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.favoriteCount || 0}</Text>
                <Text style={styles.statLabel}>Favorites</Text>
              </View>
            </View>
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.todayWords || 0}</Text>
                <Text style={styles.statLabel}>Today's Learning</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.weekWords || 0}</Text>
                <Text style={styles.statLabel}>This Week</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{learningProgress.streakDays || 0}</Text>
                <Text style={styles.statLabel}>Streak Days</Text>
              </View>
            </View>
          </View>
        )}
      </View>
    );
  };

  
  const SearchAndFilter = () => (
    <View style={styles.searchContainer}>
    
      <View style={styles.searchBox}>
        <MaterialIcons name="search" size={20} color="#6B7280" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search words, Chinese or categories..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9CA3AF"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <MaterialIcons name="clear" size={20} color="#6B7280" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryFilter}
      >
        {getCategories().map(category => (
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

      {/* 排序選項 */}
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        {[
          { key: 'date', label: 'Date' },
          { key: 'name', label: 'Name' },
          { key: 'confidence', label: 'Accuracy' }
        ].map(sort => (
          <TouchableOpacity
            key={sort.key}
            style={[
              styles.sortButton,
              sortBy === sort.key && styles.sortButtonActive
            ]}
            onPress={() => setSortBy(sort.key)}
          >
            <Text style={[
              styles.sortButtonText,
              sortBy === sort.key && styles.sortButtonTextActive
            ]}>
              {sort.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  
  const ObjectCard = ({ object, index }) => {
    const wordTypeInfo = getWordTypeInfo(object);
    
    return (
      <TouchableOpacity 
        style={styles.objectCard}
        onPress={() => viewDictionary(object)}
        activeOpacity={0.7}
      >
        <View style={styles.objectHeader}>
          <View style={styles.objectInfo}>
            <View style={styles.objectTitleRow}>
              <Text style={styles.objectName}>{object.name}</Text>
              {/* 🆕 词性标签 */}
              <View style={[styles.wordTypeTag, { backgroundColor: wordTypeInfo.color }]}>
                <MaterialIcons name={wordTypeInfo.icon} size={12} color="white" />
                <Text style={styles.wordTypeText}>{wordTypeInfo.label}</Text>
              </View>
            </View>
            <Text style={styles.objectChinese}>{object.chineseName}</Text>
            <Text style={styles.objectCategory}>{object.category}</Text>
          </View>
          
          <View style={styles.objectActions}>
            <TouchableOpacity 
              style={styles.pronunciationButton}
              onPress={(e) => {
                e.stopPropagation(); 
                playPronunciation(object.name);
              }}
            >
              <MaterialIcons name="volume-up" size={20} color="#5D5CDE" />
            </TouchableOpacity>
            
            <View style={styles.confidenceBadge}>
              <Text style={styles.confidenceText}>
                {Math.round(object.confidence * 100)}%
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.objectPronunciation}>{object.pronunciation}</Text>
        <Text style={styles.objectDefinition} numberOfLines={2}>
          {object.chineseDefinition || object.definition}
        </Text>

        <View style={styles.objectFooter}>
          <View style={styles.objectMeta}>
            <Text style={styles.objectDate}>
              {new Date(object.timestamp).toLocaleString('en-US')}
            </Text>
            <Text style={styles.objectSource}>{object.source}</Text>
          </View>
          
          <View style={styles.objectFooterActions}>
            <TouchableOpacity 
              style={styles.dictionaryButton}
              onPress={(e) => {
                e.stopPropagation(); 
                viewDictionary(object);
              }}
            >
              <MaterialIcons name="book" size={14} color="#059669" />
              <Text style={styles.dictionaryButtonText}>Dictionary</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.practiceButton}
              onPress={(e) => {
                e.stopPropagation(); 
                startPractice(object);
              }}
            >
              <MaterialIcons name="school" size={14} color="white" />
              <Text style={styles.practiceButtonText}>Practice</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 🔧 修改點擊提示 */}
        <View style={styles.clickHint}>
          <MaterialIcons name="book" size={16} color="#9CA3AF" />
          <Text style={styles.clickHintText}>Tap card to view dictionary</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (recognizedObjects.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Learning History</Text>
          <TouchableOpacity onPress={onRefresh}>
            <MaterialIcons name="refresh" size={24} color="#5D5CDE" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.emptyContainer}>
          <MaterialIcons name="history-edu" size={80} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>No Learning Records Yet</Text>
          <Text style={styles.emptySubtitle}>
            Start using AI image recognition{'\n'}to create your first learning record
          </Text>
          <TouchableOpacity 
            style={styles.startLearningButton}
            onPress={() => navigation.navigate('Camera')}
          >
            <MaterialIcons name="camera-alt" size={20} color="white" />
            <Text style={styles.startLearningButtonText}>Start Photo Learning</Text>
          </TouchableOpacity>
          <View style={styles.emptyStats}>
            <Text style={styles.emptyStatsText}>
              📊 Total Learning Progress: {learningProgress.wordsLearned || 0} words
            </Text>
            <Text style={styles.emptyStatsText}>
              🔥 Streak Days: {learningProgress.streakDays || 0} days
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Learning History</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleClearHistory} style={styles.clearButton}>
            <MaterialIcons name="delete-sweep" size={20} color="#EF4444" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onRefresh}>
            <MaterialIcons name="refresh" size={24} color="#5D5CDE" />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#5D5CDE']}
            tintColor="#5D5CDE"
          />
        }
      >
        <StatsCard />
        <SearchAndFilter />
        
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {filteredObjects.length} / {recognizedObjects.length} records
          </Text>
          <Text style={styles.clickToLearnHint}>
            💡 Tap any card to view dictionary
          </Text>
        </View>

        {filteredObjects.map((object, index) => (
          <ObjectCard key={object.id || index} object={object} index={index} />
        ))}
        
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
    justifyContent: 'space-between',
    alignItems: 'center',
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  clearButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  statsCard: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  statsContent: {
    marginTop: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
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
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
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
  categoryFilter: {
    marginBottom: 16,
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
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 12,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'white',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sortButtonActive: {
    backgroundColor: '#5D5CDE',
    borderColor: '#5D5CDE',
  },
  sortButtonText: {
    fontSize: 12,
    color: '#6B7280',
  },
  sortButtonTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  resultsHeader: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  resultsCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  clickToLearnHint: {
    fontSize: 12,
    color: '#F59E0B',
    marginTop: 4,
  },
  objectCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#5D5CDE',
  },
  objectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  objectInfo: {
    flex: 1,
  },
  
  objectTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  objectName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5D5CDE',
    marginRight: 8,
  },
  
  wordTypeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 2,
  },
  wordTypeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  objectChinese: {
    fontSize: 14,
    color: '#374151',
    marginTop: 2,
  },
  objectCategory: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  objectActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pronunciationButton: {
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  confidenceBadge: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  confidenceText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  objectPronunciation: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#6B7280',
    marginBottom: 4,
  },
  objectDefinition: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 8,
  },
  objectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
    marginBottom: 8,
  },
 
  objectMeta: {
    flex: 1,
  },
  objectDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  objectSource: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  
  objectFooterActions: {
    flexDirection: 'row',
    gap: 8,
  },
  
  dictionaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#059669',
  },
  dictionaryButtonText: {
    color: '#059669',
    fontSize: 12,
    marginLeft: 2,
    fontWeight: '600',
  },
  practiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5D5CDE',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  practiceButtonText: {
    color: 'white',
    fontSize: 12,
    marginLeft: 2,
    fontWeight: '600',
  },
  clickHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 4,
  },
  clickHintText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  startLearningButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5D5CDE',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 24,
  },
  startLearningButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyStats: {
    alignItems: 'center',
  },
  emptyStatsText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  bottomSpacing: {
    height: 20,
  },
});
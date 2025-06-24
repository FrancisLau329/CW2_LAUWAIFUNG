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
  RefreshControl,
  Dimensions
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import FavoritesService from '../services/FavoritesService';
import TextToSpeechService from '../services/TextToSpeechService';

const { width } = Dimensions.get('window');

export default function FavoritesScreen() {
  const navigation = useNavigation();
  const [favorites, setFavorites] = useState([]);
  const [filteredFavorites, setFilteredFavorites] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [favoritesService] = useState(new FavoritesService());
  const [ttsService] = useState(new TextToSpeechService());

  
  useFocusEffect(
    React.useCallback(() => {
      loadFavorites();
    }, [])
  );

  useEffect(() => {
    filterFavorites();
  }, [favorites, searchQuery, selectedCategory]);

  
  const loadFavorites = async () => {
    try {
      const favoritesList = await favoritesService.getFavorites();
      setFavorites(favoritesList);
    } catch (error) {
      console.error('加載收藏失敗:', error);
    }
  };


  const filterFavorites = () => {
    let filtered = [...favorites];

 
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(fav =>
        fav.name.toLowerCase().includes(query) ||
        fav.chineseName.toLowerCase().includes(query) ||
        fav.category.toLowerCase().includes(query)
      );
    }


    if (selectedCategory !== 'all') {
      filtered = filtered.filter(fav => 
        fav.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    setFilteredFavorites(filtered);
  };

 
  const onRefresh = async () => {
    setRefreshing(true);
    await loadFavorites();
    setRefreshing(false);
  };


  const removeFavorite = async (objectName) => {
    Alert.alert(
      'Confirm Remove',
      `Are you sure you want to remove "${objectName}" from favorites?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await favoritesService.removeFromFavorites(objectName);
              await loadFavorites();
              Alert.alert('✅ Success', 'Removed from favorites');
            } catch (error) {
              Alert.alert('❌ Error', 'Failed to remove, please try again');
            }
          }
        }
      ]
    );
  };


  const playPronunciation = async (word) => {
    try {
      await ttsService.speakEnglish(word);
    } catch (error) {
      Alert.alert('Error', 'Failed to play pronunciation');
    }
  };


  const viewDictionary = (item) => {
    navigation.navigate('WordDictionary', { word: item });
  };


  const startPractice = (object) => {
    navigation.navigate('Practice', { object });
  };


  const getCategories = () => {
    const categories = new Set(favorites.map(fav => fav.category));
    return ['all', ...Array.from(categories)];
  };


  const clearAllFavorites = () => {
    Alert.alert(
      '⚠️ Confirm Clear All',
      'This will delete all favorite words. This action cannot be undone.\n\nAre you sure you want to continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await favoritesService.clearAllFavorites();
              await loadFavorites();
              Alert.alert('✅ Complete', 'All favorites cleared');
            } catch (error) {
              Alert.alert('❌ Error', 'Failed to clear, please try again');
            }
          }
        }
      ]
    );
  };


  const getWordTypeInfo = (item) => {
    const type = item.type || item.wordType || 'unknown';
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


  const FavoriteCard = ({ item, index }) => {
    const wordTypeInfo = getWordTypeInfo(item);
    
    return (
      <TouchableOpacity 
        style={styles.favoriteCard}
        onPress={() => viewDictionary(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardInfo}>
            <View style={styles.cardTitleRow}>
              <Text style={styles.cardTitle}>{item.name}</Text>
             
              <View style={[styles.wordTypeTag, { backgroundColor: wordTypeInfo.color }]}>
                <MaterialIcons name={wordTypeInfo.icon} size={12} color="white" />
                <Text style={styles.wordTypeText}>{wordTypeInfo.label}</Text>
              </View>
            </View>
            <Text style={styles.cardChinese}>{item.chineseName}</Text>
            <Text style={styles.cardCategory}>{item.category}</Text>
          </View>
          
          <View style={styles.cardActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={(e) => {
                e.stopPropagation(); 
                playPronunciation(item.name);
              }}
            >
              <MaterialIcons name="volume-up" size={20} color="#5D5CDE" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={(e) => {
                e.stopPropagation(); 
                removeFavorite(item.name);
              }}
            >
              <MaterialIcons name="favorite" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.cardPronunciation}>{item.pronunciation}</Text>
        <Text style={styles.cardDefinition} numberOfLines={2}>
          {item.chineseDefinition || item.definition}
        </Text>

        <View style={styles.cardFooter}>
          <Text style={styles.cardDate}>
            Favorited on {new Date(item.favoritedAt).toLocaleDateString('en-US')}
          </Text>
          
          <View style={styles.cardFooterActions}>
            <TouchableOpacity 
              style={styles.dictionaryButton}
              onPress={(e) => {
                e.stopPropagation(); 
                viewDictionary(item);
              }}
            >
              <MaterialIcons name="book" size={14} color="#059669" />
              <Text style={styles.dictionaryButtonText}>Dictionary</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.practiceButton}
              onPress={(e) => {
                e.stopPropagation(); 
                startPractice(item);
              }}
            >
              <MaterialIcons name="school" size={14} color="white" />
              <Text style={styles.practiceButtonText}>Practice</Text>
            </TouchableOpacity>
          </View>
        </View>

      
        <View style={styles.clickHint}>
          <MaterialIcons name="book" size={16} color="#9CA3AF" />
          <Text style={styles.clickHintText}>Tap card to view dictionary</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#5D5CDE" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Favorites</Text>
        <View style={styles.headerActions}>
          {favorites.length > 0 && (
            <TouchableOpacity onPress={clearAllFavorites} style={styles.clearButton}>
              <MaterialIcons name="delete-sweep" size={20} color="#EF4444" />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={onRefresh}>
            <MaterialIcons name="refresh" size={24} color="#5D5CDE" />
          </TouchableOpacity>
        </View>
      </View>

      {favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="favorite-border" size={80} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>No Favorites Yet</Text>
          <Text style={styles.emptySubtitle}>
            Tap the ⭐ button during learning{'\n'}to add favorite words to your collection
          </Text>
          <TouchableOpacity 
            style={styles.goToLearnButton}
            onPress={() => navigation.navigate('Camera')}
          >
            <MaterialIcons name="camera-alt" size={20} color="white" />
            <Text style={styles.goToLearnButtonText}>Start Learning</Text>
          </TouchableOpacity>
        </View>
      ) : (
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
          {/* 統計信息 */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{favorites.length}</Text>
              <Text style={styles.statLabel}>Total Favorites</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {new Set(favorites.map(f => f.category)).size}
              </Text>
              <Text style={styles.statLabel}>Categories</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {favorites.filter(f => 
                  new Date(f.favoritedAt).toDateString() === new Date().toDateString()
                ).length}
              </Text>
              <Text style={styles.statLabel}>Today</Text>
            </View>
          </View>

          {/* 搜索框 */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBox}>
              <MaterialIcons name="search" size={20} color="#6B7280" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search favorite words..."
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

        
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsCount}>
              Showing {filteredFavorites.length} / {favorites.length} favorites
            </Text>
          </View>

   
          {filteredFavorites.map((item, index) => (
            <FavoriteCard key={item.favoriteId || index} item={item} index={index} />
          ))}

          <View style={styles.bottomSpacing} />
        </ScrollView>
      )}
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
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
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
    paddingHorizontal: 20,
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
  resultsHeader: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  resultsCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  favoriteCard: {
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
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardInfo: {
    flex: 1,
  },
  
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
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
  cardChinese: {
    fontSize: 14,
    color: '#374151',
    marginTop: 2,
  },
  cardCategory: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 8,
  },
  cardPronunciation: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#6B7280',
    marginBottom: 4,
  },
  cardDefinition: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  cardDate: {
    fontSize: 12,
    color: '#9CA3AF',
    flex: 1,
  },

  cardFooterActions: {
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
    marginBottom: 32,
  },
  goToLearnButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5D5CDE',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  goToLearnButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  clickHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    gap: 4,
  },
  clickHintText: {
    fontSize: 11,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  bottomSpacing: {
    height: 20,
  },
});
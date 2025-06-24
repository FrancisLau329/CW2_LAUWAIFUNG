import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  ScrollView,
  RefreshControl
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { DataContext } from '../context/DataContext';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);
  const { 
    recognizedObjects, 
    learningProgress, 
    getDetailedStats,
    loadAllData 
  } = useContext(DataContext);
  
  const [greeting, setGreeting] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [detailedStats, setDetailedStats] = useState({});

  
  useFocusEffect(
    React.useCallback(() => {
      updateStats();
    }, [recognizedObjects, learningProgress])
  );

  useEffect(() => {
    updateGreeting();
    updateStats();
  }, []);

  const updateGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good Morning');
    } else if (hour < 18) {
      setGreeting('Good Afternoon');
    } else {
      setGreeting('Good Evening');
    }
  };

  const updateStats = () => {
    if (getDetailedStats) {
      const stats = getDetailedStats();
      setDetailedStats(stats);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadAllData();
      updateStats();
    } catch (error) {
      console.error('ERROR:', error);
    } finally {
      setRefreshing(false);
    }
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

  
  const QuickStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statsHeader}>
        <Text style={styles.statsTitle}>📊 Learning Statistics</Text>
        <TouchableOpacity onPress={updateStats}>
          <MaterialIcons name="refresh" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <MaterialIcons name="school" size={24} color="#5D5CDE" />
          <Text style={styles.statNumber}>{learningProgress.wordsLearned || 0}</Text>
          <Text style={styles.statLabel}>Words Learned</Text>
        </View>
        
        <View style={styles.statCard}>
          <MaterialIcons name="local-fire-department" size={24} color="#EF4444" />
          <Text style={styles.statNumber}>{learningProgress.streakDays || 0}</Text>
          <Text style={styles.statLabel}>Streak Days</Text>
        </View>
        
        <View style={styles.statCard}>
          <MaterialIcons name="trending-up" size={24} color="#10B981" />
          <Text style={styles.statNumber}>{learningProgress.accuracy || 0}%</Text>
          <Text style={styles.statLabel}>Practice Accuracy</Text>
        </View>
      </View>

      {/* 詳細統計 */}
      <View style={styles.detailedStats}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Today's Learning:</Text>
          <Text style={styles.detailValue}>{detailedStats.todayWords || 0} words</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>This Week:</Text>
          <Text style={styles.detailValue}>{detailedStats.weekWords || 0} words</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Practice Sessions:</Text>
          <Text style={styles.detailValue}>{learningProgress.totalPractices || 0} times</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Favorites:</Text>
          <Text style={styles.detailValue}>{detailedStats.favoriteCount || 0} items</Text>
        </View>
      </View>
    </View>
  );

  
  
const QuickActions = () => (
  <View style={styles.actionsContainer}>
    <Text style={styles.actionsTitle}>🚀 Quick Actions</Text>
    <View style={styles.actionsGrid}>
      
      <TouchableOpacity 
        style={styles.actionCard}
        onPress={() => navigation.navigate('Camera')}
      >
        <MaterialIcons name="camera-alt" size={28} color="white" />
        <Text style={styles.actionText}>Photo Recognition</Text>
        <Text style={styles.actionSubtext}>AI Smart Recognition</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.actionCard, styles.actionCardSecondary]}
        onPress={() => navigation.navigate('History')}
      >
        <MaterialIcons name="history" size={28} color="white" />
        <Text style={styles.actionText}>Learning History</Text>
        <Text style={styles.actionSubtext}>{recognizedObjects.length} records</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.actionCard, styles.actionCardTertiary]}
        onPress={() => navigation.navigate('WeatherLearning')}
      >
        <MaterialIcons name="wb-sunny" size={28} color="white" />
        <Text style={styles.actionText}>Contextual Learning</Text>
        <Text style={styles.actionSubtext}>Weather News English</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.actionCard, styles.actionCardQuaternary]}
        onPress={() => navigation.navigate('Favorites')}
      >
        <MaterialIcons name="favorite" size={28} color="white" />
        <Text style={styles.actionText}>My Favorites</Text>
        <Text style={styles.actionSubtext}>Favorite Words</Text>
      </TouchableOpacity>
      
    </View>
  </View>
);

  
  const RecentObjects = () => (
    <View style={styles.recentContainer}>
      <View style={styles.recentHeader}>
        <Text style={styles.recentTitle}>📚 Recent Learning</Text>
        <TouchableOpacity onPress={() => navigation.navigate('History')}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>
      
      {recognizedObjects.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="auto-stories" size={48} color="#D1D5DB" />
          <Text style={styles.emptyText}>No Learning Records Yet</Text>
          <Text style={styles.emptySubtext}>Start taking photos to identify objects and learn English!</Text>
          <TouchableOpacity 
            style={styles.startButton}
            onPress={() => navigation.navigate('Camera')}
          >
            <Text style={styles.startButtonText}>Start Learning</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {recognizedObjects.slice(0, 10).map((object) => {
            const wordTypeInfo = getWordTypeInfo(object);
            
            return (
              <TouchableOpacity
                key={object.id}
                style={styles.recentCard}
                onPress={() => {
                  
                  navigation.navigate('WordDictionary', { word: object });
                }}
                activeOpacity={0.7}
              >
                <View style={styles.recentCardHeader}>
                  <View style={styles.recentCardTitleRow}>
                    <Text style={styles.recentCardTitle}>{object.name}</Text>
                    {/* 🆕 词性标签 */}
                    <View style={[styles.recentWordTypeTag, { backgroundColor: wordTypeInfo.color }]}>
                      <MaterialIcons name={wordTypeInfo.icon} size={10} color="white" />
                      <Text style={styles.recentWordTypeText}>{wordTypeInfo.label}</Text>
                    </View>
                  </View>
                  <Text style={styles.recentCardCategory}>{object.category}</Text>
                </View>
                <Text style={styles.recentCardChinese}>{object.chineseName}</Text>
                <Text style={styles.recentCardPronunciation}>
                  {object.pronunciation}
                </Text>
                <View style={styles.recentCardFooter}>
                  <Text style={styles.recentCardTime}>
                    {new Date(object.timestamp).toLocaleDateString('en-US')}
                  </Text>
                  <Text style={styles.recentCardConfidence}>
                    {Math.round(object.confidence * 100)}%
                  </Text>
                </View>
                
                {/* 🆕 点击提示 */}
                <View style={styles.recentClickHint}>
                  <MaterialIcons name="book" size={12} color="#9CA3AF" />
                  <Text style={styles.recentClickHintText}>View Dictionary</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );

  
  const LearningGoals = () => {
    const wordsToday = detailedStats.todayWords || 0;
    const dailyGoal = 5; 
    const progress = Math.min((wordsToday / dailyGoal) * 100, 100);
    
    return (
      <View style={styles.goalsContainer}>
        <Text style={styles.goalsTitle}>🎯 Today's Goal</Text>
        <View style={styles.goalProgress}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {wordsToday}/{dailyGoal} words
          </Text>
        </View>
        
        {wordsToday >= dailyGoal ? (
          <View style={styles.goalAchieved}>
            <MaterialIcons name="celebration" size={20} color="#10B981" />
            <Text style={styles.goalAchievedText}>Today's goal achieved!</Text>
          </View>
        ) : (
          <Text style={styles.goalEncouragement}>
            You need to learn {dailyGoal - wordsToday} more words to complete today's goal!
          </Text>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#5D5CDE']}
            tintColor="#5D5CDE"
          />
        }
      >
        {/* 歡迎標題 */}
        <View style={styles.header}>
          <Text style={styles.greeting}>{greeting}!</Text>
          <Text style={styles.userName}>
            {user?.displayName || user?.email?.split('@')[0] || 'Learner'}
          </Text>
          <Text style={styles.motivationText}>
            {learningProgress.streakDays > 0 
              ? `You've been learning for ${learningProgress.streakDays} consecutive days, keep it up!` 
              : 'Ready for today\'s English learning?'
            }
          </Text>
        </View>

  
        <QuickStats />

       
        <LearningGoals />

       
        <QuickActions />

       
        <RecentObjects />

       
        <View style={styles.tipContainer}>
          <View style={styles.tipHeader}>
            <MaterialIcons name="lightbulb" size={20} color="#F59E0B" />
            <Text style={styles.tipTitle}>💡 Learning Tips</Text>
          </View>
          <Text style={styles.tipText}>
            {learningProgress.wordsLearned === 0 
              ? "Take photos of objects around you to start your English learning journey! Identifying 5 new objects daily can effectively improve your vocabulary."
              : learningProgress.streakDays < 3
              ? "Consistent daily learning helps you remember words better. Try learning for 3+ consecutive days!"
              : "Great job! Regularly review learned words and use the practice feature to reinforce your memory."
            }
          </Text>
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
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#5D5CDE',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  userName: {
    fontSize: 18,
    color: '#E5E7EB',
    marginTop: 4,
  },
  motivationText: {
    fontSize: 14,
    color: '#C7D2FE',
    marginTop: 8,
    lineHeight: 20,
  },
  statsContainer: {
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
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  detailedStats: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
  },
  goalsContainer: {
    margin: 20,
    marginTop: 0,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  goalsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  goalProgress: {
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#5D5CDE',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  goalAchieved: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    padding: 12,
  },
  goalAchievedText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
    marginLeft: 6,
  },
  goalEncouragement: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  actionsContainer: {
    margin: 20,
    marginTop: 0,
  },
  actionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  actionCard: {
  width: (width - 80) / 2, 
  backgroundColor: '#5D5CDE',
  borderRadius: 12,
  padding: 16,
  alignItems: 'center',
  marginBottom: 12, 
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 2,
},
  actionCardSecondary: {
    backgroundColor: '#10B981',
  },
  actionCardTertiary: {
    backgroundColor: '#F59E0B',
  },
  actionCardQuaternary: {
    backgroundColor: '#EF4444',
  },
  actionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  actionSubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
  recentContainer: {
    margin: 20,
    marginTop: 0,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  viewAllText: {
    fontSize: 14,
    color: '#5D5CDE',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'center',
    marginBottom: 20,
  },
  startButton: {
    backgroundColor: '#5D5CDE',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  startButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  recentCard: {
    width: 180,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  recentCardHeader: {
    marginBottom: 8,
  },
  
  recentCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  recentCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#5D5CDE',
    flex: 1,
  },
  recentWordTypeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
    gap: 2,
  },
  recentWordTypeText: {
    color: 'white',
    fontSize: 8,
    fontWeight: '600',
  },
  recentCardCategory: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  recentCardChinese: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  recentCardPronunciation: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#6B7280',
    marginBottom: 8,
  },
  recentCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recentCardTime: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  recentCardConfidence: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '600',
  },
  
  recentClickHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    backgroundColor: '#F9FAFB',
    borderRadius: 6,
    gap: 2,
  },
  recentClickHintText: {
    fontSize: 10,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  tipContainer: {
    margin: 20,
    marginTop: 0,
    marginBottom: 40,
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    marginLeft: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 20,
  },
});
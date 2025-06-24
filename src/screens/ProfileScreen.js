import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Dimensions
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { DataContext } from '../context/DataContext';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { user, logout } = useContext(AuthContext);
  const { 
    learningProgress, 
    getDetailedStats, 
    clearAllData 
  } = useContext(DataContext);
  
  const [stats, setStats] = useState({});

  
  useFocusEffect(
    React.useCallback(() => {
      updateStats();
    }, [learningProgress])
  );

  const updateStats = () => {
    if (getDetailedStats) {
      const newStats = getDetailedStats();
      setStats(newStats);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          onPress: async () => {
            try {
              await logout();
              console.log('✅ 登出完成');
            } catch (error) {
              console.error('登出錯誤:', error);
            }
          }
        }
      ]
    );
  };

  const handleClearData = () => {
    Alert.alert(
      '⚠️ Clear All Data',
      'This will delete all learning records, progress and favorites. This action cannot be undone.\n\nAre you sure you want to continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: async () => {
            try {
              if (clearAllData) {
                await clearAllData();
                updateStats(); 
              }
              Alert.alert('✅ Complete', 'All data has been cleared');
            } catch (error) {
              Alert.alert('❌ Error', 'Failed to clear, please try again');
            }
          }
        }
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      '📤 Export Data',
      'Feature in development, will support exporting learning data in JSON format soon',
      [{ text: 'OK', style: 'default' }]
    );
  };

  const menuItems = [
    {
      title: 'My Favorites',
      subtitle: `${stats.favoriteCount || 0} favorite words`,
      icon: 'favorite',
      color: '#EF4444',
      onPress: () => navigation.navigate('Favorites')
    },
    {
      title: 'Learning History',
      subtitle: `${stats.totalObjects || 0} learning records`,
      icon: 'history',
      color: '#10B981',
      onPress: () => navigation.navigate('History')
    },
    {
      title: 'Practice Records',
      subtitle: `Completed ${learningProgress.totalPractices || 0} practice sessions`,
      icon: 'school',
      color: '#F59E0B',
      onPress: () => Alert.alert('Feature in Development', 'Practice record details feature coming soon')
    },
    {
      title: 'Data Statistics',
      subtitle: 'Detailed learning analysis report',
      icon: 'analytics',
      color: '#8B5CF6',
      onPress: () => showDetailedStats()
    }
  ];

  const showDetailedStats = () => {
    const detailedMessage = `
📊 Detailed Learning Statistics

📚 Learning Overview:
• Total Words Learned: ${learningProgress.wordsLearned || 0}
• Consecutive Days: ${learningProgress.streakDays || 0}
• Practice Accuracy: ${learningProgress.accuracy || 0}%

📈 Learning Progress:
• Today's Learning: ${stats.todayWords || 0} words
• This Week: ${stats.weekWords || 0} words
• This Month: ${stats.monthWords || 0} words

💾 Data Statistics:
• Total Recognitions: ${stats.totalObjects || 0}
• Favorites: ${stats.favoriteCount || 0}
• Practice Sessions: ${stats.practiceCount || 0}

🎯 Learning Achievements:
• Correct Answers: ${learningProgress.correctAnswers || 0}
• Total Practice Questions: ${(learningProgress.totalPractices || 0) * 4}
    `.trim();

    Alert.alert('📊 Detailed Statistics', detailedMessage, [
      { text: 'Export Data', onPress: handleExportData },
      { text: 'Close', style: 'cancel' }
    ]);
  };

  const settingsItems = [
    {
      title: 'App Settings',
      subtitle: 'Language, theme and notification settings',
      icon: 'settings',
      color: '#6B7280',
      onPress: () => Alert.alert('Feature in Development', 'Settings feature coming soon')
    },
    {
      title: 'Data Backup',
      subtitle: 'Backup and restore learning data',
      icon: 'backup',
      color: '#3B82F6',
      onPress: () => Alert.alert('Feature in Development', 'Data backup feature coming soon')
    },
    {
      title: 'Feedback & Suggestions',
      subtitle: 'Help us improve VocabLens',
      icon: 'feedback',
      color: '#F59E0B',
      onPress: () => Alert.alert('💌 Feedback & Suggestions', 'Thank you for using VocabLens! Please contact us through:\n\n📧 Email: feedback@vocablens.com\n🐛 Bug Reports: github.com/vocablens/issues')
    },
    {
      title: 'About VocabLens',
      subtitle: 'Version info and development team',
      icon: 'info',
      color: '#8B5CF6',
      onPress: () => Alert.alert(
        '📱 About VocabLens', 
        'VocabLens v1.0.0\n\n🎯 Mission: Learn English Through Vision\n🤖 Technology: AI Image Recognition + Speech Synthesis\n👥 Development: Professional EdTech Team\n\nThank you for choosing VocabLens to learn English!'
      )
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      
        <View style={styles.userCard}>
          <View style={styles.userAvatar}>
            <MaterialIcons name="person" size={40} color="white" />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {user?.displayName || 'Learner'}
            </Text>
            <Text style={styles.userEmail}>
              {user?.email || 'learner@vocablens.com'}
            </Text>
            <Text style={styles.userJoinDate}>
              Joined: {new Date().toLocaleDateString('en-US')}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => Alert.alert('Feature in Development', 'Edit profile feature coming soon')}
          >
            <MaterialIcons name="edit" size={20} color="#5D5CDE" />
          </TouchableOpacity>
        </View>

     
        <View style={styles.achievementCard}>
          <Text style={styles.achievementTitle}>🏆 Learning Achievements</Text>
          <View style={styles.achievementGrid}>
            <View style={styles.achievementItem}>
              <MaterialIcons name="school" size={32} color="#5D5CDE" />
              <Text style={styles.achievementNumber}>{learningProgress.wordsLearned || 0}</Text>
              <Text style={styles.achievementLabel}>Words Learned</Text>
            </View>
            <View style={styles.achievementItem}>
              <MaterialIcons name="local-fire-department" size={32} color="#EF4444" />
              <Text style={styles.achievementNumber}>{learningProgress.streakDays || 0}</Text>
              <Text style={styles.achievementLabel}>Streak Days</Text>
            </View>
            <View style={styles.achievementItem}>
              <MaterialIcons name="trending-up" size={32} color="#10B981" />
              <Text style={styles.achievementNumber}>{learningProgress.accuracy || 0}%</Text>
              <Text style={styles.achievementLabel}>Practice Accuracy</Text>
            </View>
          </View>
        </View>

  
        <View style={styles.quickStatsCard}>
          <Text style={styles.quickStatsTitle}>📈 This Week's Learning</Text>
          <View style={styles.quickStatsRow}>
            <View style={styles.quickStatItem}>
              <Text style={styles.quickStatNumber}>{stats.todayWords || 0}</Text>
              <Text style={styles.quickStatLabel}>Today</Text>
            </View>
            <View style={styles.quickStatItem}>
              <Text style={styles.quickStatNumber}>{stats.weekWords || 0}</Text>
              <Text style={styles.quickStatLabel}>This Week</Text>
            </View>
            <View style={styles.quickStatItem}>
              <Text style={styles.quickStatNumber}>{stats.monthWords || 0}</Text>
              <Text style={styles.quickStatLabel}>This Month</Text>
            </View>
            <View style={styles.quickStatItem}>
              <Text style={styles.quickStatNumber}>{stats.favoriteCount || 0}</Text>
              <Text style={styles.quickStatLabel}>Favorites</Text>
            </View>
          </View>
        </View>

      
        <View style={styles.menuCard}>
          <Text style={styles.menuTitle}>🛠 Learning Tools</Text>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: item.color }]}>
                  <MaterialIcons name={item.icon} size={20} color="white" />
                </View>
                <View style={styles.menuItemInfo}>
                  <Text style={styles.menuItemTitle}>{item.title}</Text>
                  <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>


        <View style={styles.menuCard}>
          <Text style={styles.menuTitle}>⚙️ Settings & Support</Text>
          {settingsItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: item.color }]}>
                  <MaterialIcons name={item.icon} size={20} color="white" />
                </View>
                <View style={styles.menuItemInfo}>
                  <Text style={styles.menuItemTitle}>{item.title}</Text>
                  <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>

       
        <View style={styles.menuCard}>
          <Text style={styles.menuTitle}>🗂 Data Management</Text>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={handleExportData}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, { backgroundColor: '#10B981' }]}>
                <MaterialIcons name="download" size={20} color="white" />
              </View>
              <View style={styles.menuItemInfo}>
                <Text style={styles.menuItemTitle}>Export Data</Text>
                <Text style={styles.menuItemSubtitle}>Export learning records and settings</Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={handleClearData}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, { backgroundColor: '#F59E0B' }]}>
                <MaterialIcons name="delete-sweep" size={20} color="white" />
              </View>
              <View style={styles.menuItemInfo}>
                <Text style={styles.menuItemTitle}>Clear All Data</Text>
                <Text style={styles.menuItemSubtitle}>Delete all learning records and settings</Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.menuItem, styles.logoutItem]}
            onPress={handleLogout}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, { backgroundColor: '#EF4444' }]}>
                <MaterialIcons name="logout" size={20} color="white" />
              </View>
              <View style={styles.menuItemInfo}>
                <Text style={[styles.menuItemTitle, styles.logoutText]}>Logout</Text>
                <Text style={styles.menuItemSubtitle}>Sign out of current account</Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>

        {/* 激勵文字 */}
        <View style={styles.motivationCard}>
          <MaterialIcons name="emoji-events" size={24} color="#F59E0B" />
          <Text style={styles.motivationText}>
            {learningProgress.wordsLearned === 0 
              ? "Start your English learning journey! Every word is the beginning of progress."
              : learningProgress.streakDays > 0
              ? `Awesome! You've been learning for ${learningProgress.streakDays} consecutive days, persistence is key!`
              : "Keep learning consistently, a little progress each day leads to great growth!"
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
  content: {
    flex: 1,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#5D5CDE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  userJoinDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  editButton: {
    padding: 8,
  },
  achievementCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  achievementTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
    textAlign: 'center',
  },
  achievementGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  achievementItem: {
    alignItems: 'center',
    flex: 1,
  },
  achievementNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 8,
  },
  achievementLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  quickStatsCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  quickStatsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  quickStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickStatItem: {
    alignItems: 'center',
  },
  quickStatNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#5D5CDE',
  },
  quickStatLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  menuCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemInfo: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  menuItemSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  logoutText: {
    color: '#EF4444',
  },
  motivationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  motivationText: {
    flex: 1,
    fontSize: 14,
    color: '#92400E',
    marginLeft: 12,
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 40,
  },
});
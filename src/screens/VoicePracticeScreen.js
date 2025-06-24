import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Dimensions
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Constants from 'expo-constants';

const { width } = Dimensions.get('window');

export default function VoicePracticeScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { object } = route.params || {};
  
  
  const [isExpoGo] = useState(Constants.default?.executionEnvironment === 'storeClient');

  useEffect(() => {
    if (isExpoGo) {
      
      setTimeout(() => {
        Alert.alert(
          '🚨 Feature Limitation',
          'Voice features are not available in Expo Go.\n\nTo use full functionality, please create a Development Build.\n\nTap "OK" to go back.',
          [
            { text: 'OK', onPress: () => navigation.goBack() }
          ]
        );
      }, 500);
    }
  }, [isExpoGo, navigation]);

  if (!object) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error" size={60} color="#EF4444" />
          <Text style={styles.errorText}>No Practice Content</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  
  if (isExpoGo) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color="#5D5CDE" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Voice Practice</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.limitationContainer}>
          <MaterialIcons name="build" size={100} color="#F59E0B" />
          <Text style={styles.limitationTitle}>Requires Development Build</Text>
          
          <View style={styles.limitationCard}>
            <Text style={styles.limitationText}>
              🎤 Voice recognition requires native module support, not available in Expo Go.
            </Text>
            <Text style={styles.limitationText}>
              📱 To use full voice features, please create a Development Build.
            </Text>
          </View>

          <View style={styles.wordPreview}>
            <Text style={styles.wordPreviewTitle}>Practice Word:</Text>
            <Text style={styles.wordPreviewName}>{object.name}</Text>
            <Text style={styles.wordPreviewChinese}>{object.chineseName}</Text>
            <Text style={styles.wordPreviewPronunciation}>{object.pronunciation}</Text>
          </View>

          <View style={styles.featureList}>
            <Text style={styles.featureListTitle}>🚀 Development Build Features:</Text>
            <Text style={styles.featureItem}>✅ AI Pronunciation Assessment & Scoring</Text>
            <Text style={styles.featureItem}>✅ Real-time Voice Recognition</Text>
            <Text style={styles.featureItem}>✅ Voice Control Commands</Text>
            <Text style={styles.featureItem}>✅ Smart Pronunciation Correction Suggestions</Text>
          </View>

          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={20} color="white" />
            <Text style={styles.backButtonText}>Back to Practice Selection</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Camera')}
          >
            <MaterialIcons name="camera-alt" size={20} color="#5D5CDE" />
            <Text style={styles.secondaryButtonText}>Continue Photo Learning</Text>
          </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Voice Practice</Text>
        <TouchableOpacity>
          <MaterialIcons name="help" size={24} color="#5D5CDE" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.wordCard}>
          <Text style={styles.wordName}>{object.name}</Text>
          <Text style={styles.wordChinese}>{object.chineseName}</Text>
          <Text style={styles.wordPronunciation}>{object.pronunciation}</Text>
        </View>

        <View style={styles.comingSoon}>
          <MaterialIcons name="mic" size={80} color="#5D5CDE" />
          <Text style={styles.comingSoonTitle}>Voice Features Ready!</Text>
          <Text style={styles.comingSoonText}>
            In Development Build environment, you can:{'\n'}
            • Practice word pronunciation{'\n'}
            • Get AI scoring feedback{'\n'}
            • Use voice control features
          </Text>
        </View>
      </View>
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
  limitationContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  limitationTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  limitationCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  limitationText: {
    fontSize: 16,
    color: '#92400E',
    lineHeight: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  wordPreview: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  wordPreviewTitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  wordPreviewName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#5D5CDE',
    marginBottom: 4,
  },
  wordPreviewChinese: {
    fontSize: 18,
    color: '#374151',
    marginBottom: 4,
  },
  wordPreviewPronunciation: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#6B7280',
  },
  featureList: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignSelf: 'stretch',
  },
  featureListTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  featureItem: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    lineHeight: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5D5CDE',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  secondaryButtonText: {
    color: '#5D5CDE',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  wordCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  wordName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#5D5CDE',
    marginBottom: 8,
  },
  wordChinese: {
    fontSize: 20,
    color: '#6B7280',
    marginBottom: 4,
  },
  wordPronunciation: {
    fontSize: 16,
    fontFamily: 'monospace',
    color: '#9CA3AF',
  },
  comingSoon: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  comingSoonTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 16,
    marginBottom: 12,
  },
  comingSoonText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});
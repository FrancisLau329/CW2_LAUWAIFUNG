import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  ScrollView,
  Image,
  Dimensions
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { DataContext } from '../context/DataContext';
import ImageRecognitionAPI from '../services/ImageRecognitionAPI';
import TextToSpeechService from '../services/TextToSpeechService';
import FavoritesService from '../services/FavoritesService';

const { width } = Dimensions.get('window');

export default function CameraScreen() {
  const navigation = useNavigation();
  const { addRecognizedObject } = useContext(DataContext);
  const [recognizing, setRecognizing] = useState(false);
  const [apiService] = useState(new ImageRecognitionAPI());
  const [ttsService] = useState(new TextToSpeechService());
  const [favoritesService] = useState(new FavoritesService());
  const [recognizedObject, setRecognizedObject] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [apiStatus, setApiStatus] = useState('unknown'); 
  const [isFavorited, setIsFavorited] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);

  useEffect(() => {
    checkAPIConnection();
  }, []);

  useEffect(() => {
    if (recognizedObject) {
      checkIfFavorited();
    }
  }, [recognizedObject]);

  
  const checkAPIConnection = async () => {
    try {
      await apiService.testConnection();
      setApiStatus('connected');
    } catch (error) {
      console.log('API:', error.message);
      setApiStatus('error');
    }
  };

 
  const checkIfFavorited = async () => {
    if (recognizedObject) {
      try {
        const favorited = await favoritesService.isFavorited(recognizedObject.name);
        setIsFavorited(favorited);
      } catch (error) {
        console.error('fail:', error);
      }
    }
  };

  
  const pickAndRecognizeImage = async () => {
    try {
      
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Error', 'Photo library permission is required to select images');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setCapturedImage(result.assets[0].uri);
        await recognizeImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('error:', error);
      Alert.alert('Error', 'Failed to select image');
      setRecognizing(false);
    }
  };

  
  const takePhotoAndRecognize = async () => {
    try {
     
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Error', 'Camera permission is required to take photos');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setCapturedImage(result.assets[0].uri);
        await recognizeImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('拍照錯誤:', error);
      Alert.alert('Error', 'Failed to take photo');
      setRecognizing(false);
    }
  };

 
  const recognizeImage = async (imageUri) => {
    console.log('start:', imageUri);
    
    if (apiStatus === 'error') {
      Alert.alert(
        '⚠️ API Connection Issue', 
        'Image recognition service is temporarily unavailable.\nPlease check your network connection or try again later.'
      );
      return;
    }

    setRecognizing(true);
    
    try {
      console.log('API..');
      const recognitionResult = await apiService.recognizeImage(imageUri);
      console.log('successful:', recognitionResult.name);
      
      if (recognitionResult) {
        setRecognizedObject(recognitionResult);
        setShowResults(true);
        
        
        if (addRecognizedObject) {
          addRecognizedObject(recognitionResult);
        }
        
       
        console.log('DONE:', {
          object: recognitionResult.name,
          confidence: Math.round(recognitionResult.confidence * 100) + '%',
          category: recognitionResult.category,
          rawTags: recognitionResult.rawTags
        });
      }
    } catch (error) {
      console.error('ERROR:', error);
      Alert.alert(
        'Recognition Failed', 
        `Error details: ${error.message}\n\nThis might be due to:\n• Network connection issues\n• Unsupported image format\n• API service temporarily unavailable`,
        [
          { text: 'Retry', onPress: () => recognizeImage(imageUri) },
          { text: 'View Details', onPress: () => console.log('ERROR:', error) },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } finally {
      setRecognizing(false);
    }
  };


  const closeResults = () => {
    setShowResults(false);
    setRecognizedObject(null);
    setCapturedImage(null);
    setIsFavorited(false);
    
    ttsService.stop();
    setAudioPlaying(false);
  };

  const playPronunciation = async (word) => {
    try {
      console.log('play:', word);
      setAudioPlaying(true);
      await ttsService.speakEnglish(word);
      setAudioPlaying(false);
    } catch (error) {
      console.error('ERROR:', error);
      setAudioPlaying(false);
      Alert.alert('Error', 'Failed to play pronunciation, please check device audio settings');
    }
  };

  
  const playExample = async (sentence) => {
    try {
      console.log('PLAY:', sentence);
      setAudioPlaying(true);
      await ttsService.speakSentence(sentence);
      setAudioPlaying(false);
    } catch (error) {
      console.error('ERROR:', error);
      setAudioPlaying(false);
      Alert.alert('Error', 'Failed to play example sentence');
    }
  };

  
  const saveToFavorites = async () => {
    try {
      if (!recognizedObject) return;
      
      if (isFavorited) {
      
        const result = await favoritesService.removeFromFavorites(recognizedObject.name);
        setIsFavorited(false);
        Alert.alert('Removed from Favorites', result.message);
      } else {
        
        const result = await favoritesService.addToFavorites(recognizedObject);
        setIsFavorited(true);
        Alert.alert('Added to Favorites', result.message);
      }
    } catch (error) {
      console.error('ERROR:', error);
      if (error.message.includes('added')) {
        Alert.alert('ℹInfo', error.message);
      } else {
        Alert.alert('Error', 'Favorite operation failed, please try again');
      }
    }
  };

 
  const startPractice = () => {
    if (!recognizedObject) return;
    
 
    closeResults();
    
 
    navigation.navigate('Practice', { object: recognizedObject });
  };

  
  const shareResults = () => {
    if (!recognizedObject) return;
    
    const shareText = `I learned a new word in VocabLens:\n${recognizedObject.name} (${recognizedObject.chineseName})\nPronunciation: ${recognizedObject.pronunciation}\nDefinition: ${recognizedObject.definition}${recognizedObject.usage ? `\nUsage: ${recognizedObject.usage}` : ''}`;
    
    Alert.alert(
      '📤 Share Learning Results',
      shareText,
      [
        { text: 'Copy Text', onPress: () => console.log('複製到剪貼板') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#5D5CDE" />
        </TouchableOpacity>
        <Text style={styles.title}>AI Image Recognition</Text>
        <View style={styles.statusContainer}>
          <MaterialIcons 
            name={apiStatus === 'connected' ? 'cloud-done' : apiStatus === 'error' ? 'cloud-off' : 'cloud'} 
            size={20} 
            color={apiStatus === 'connected' ? '#10B981' : apiStatus === 'error' ? '#EF4444' : '#6B7280'} 
          />
        </View>
      </View>
      
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <MaterialIcons name="psychology" size={80} color="#5D5CDE" />
          <MaterialIcons name="auto-awesome" size={30} color="#F59E0B" style={styles.magicIcon} />
        </View>
        
        <Text style={styles.message}>VocabLens AI Recognition</Text>
        <Text style={styles.description}>
          Using advanced image recognition technology{'\n'}
          Instantly identify objects and learn English vocabulary
        </Text>

        <View style={styles.apiStatus}>
          <Text style={styles.apiStatusText}>
            {apiStatus === 'connected' && '🟢 API Connected'}
            {apiStatus === 'error' && '🔴 API Connection Failed'}
            {apiStatus === 'unknown' && '🟡 Checking API Connection...'}
          </Text>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.primaryButton, recognizing && styles.buttonDisabled]}
            onPress={takePhotoAndRecognize}
            disabled={recognizing}
          >
            {recognizing ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <>
                <MaterialIcons name="camera-alt" size={24} color="white" />
                <Text style={styles.buttonText}>Take Photo</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton, recognizing && styles.buttonDisabled]}
            onPress={pickAndRecognizeImage}
            disabled={recognizing}
          >
            {recognizing ? (
              <ActivityIndicator color="#5D5CDE" size="small" />
            ) : (
              <>
                <MaterialIcons name="photo-library" size={24} color="#5D5CDE" />
                <Text style={[styles.buttonText, styles.secondaryButtonText]}>Choose Image</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
        
        {recognizing && (
          <View style={styles.recognizingContainer}>
            <View style={styles.recognizingBox}>
              <ActivityIndicator size="large" color="#5D5CDE" />
              <Text style={styles.recognizingText}>🤖 AI is analyzing image...</Text>
              <Text style={styles.recognizingSubtext}>Identifying objects and generating learning content</Text>
            </View>
          </View>
        )}

        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>✨ Features</Text>
          <View style={styles.infoList}>
            <Text style={styles.infoItem}>🎯 Real-time image recognition</Text>
            <Text style={styles.infoItem}>🌐 Cloud AI processing</Text>
            <Text style={styles.infoItem}>📚 Smart learning content generation</Text>
            <Text style={styles.infoItem}>🔊 Real voice playback</Text>
          </View>
        </View>
      </View>

    
      <Modal
        visible={showResults}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeResults}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>🎉 Recognition Successful!</Text>
            <View style={styles.modalHeaderButtons}>
              <TouchableOpacity 
                style={styles.shareButton}
                onPress={shareResults}
              >
                <MaterialIcons name="share" size={20} color="#5D5CDE" />
              </TouchableOpacity>
              <TouchableOpacity onPress={closeResults}>
                <MaterialIcons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>
          </View>

          {recognizedObject && (
            <ScrollView style={styles.modalContent}>
              
              {capturedImage && (
                <View style={styles.imageContainer}>
                  <Image source={{ uri: capturedImage }} style={styles.capturedImage} />
                  <View style={styles.imageOverlay}>
                    <Text style={styles.imageLabel}>Recognized Image</Text>
                  </View>
                </View>
              )}

              <View style={styles.objectCard}>
                
                <View style={styles.objectHeader}>
                  <View style={styles.objectTitleContainer}>
                    <Text style={styles.objectName}>{recognizedObject.name}</Text>
                    <Text style={styles.objectChineseName}>{recognizedObject.chineseName}</Text>
                  </View>
                  <View style={styles.confidenceTag}>
                    <Text style={styles.confidenceText}>
                      {Math.round(recognizedObject.confidence * 100)}% Accuracy
                    </Text>
                  </View>
                </View>

               
                <TouchableOpacity 
                  style={styles.pronunciationRow}
                  onPress={() => playPronunciation(recognizedObject.name)}
                  disabled={audioPlaying}
                >
                  <Text style={styles.pronunciation}>{recognizedObject.pronunciation}</Text>
                  {audioPlaying ? (
                    <ActivityIndicator color="#5D5CDE" size="small" />
                  ) : (
                    <MaterialIcons name="volume-up" size={24} color="#5D5CDE" />
                  )}
                </TouchableOpacity>

                
                <View style={styles.definitionContainer}>
                  <Text style={styles.definition}>{recognizedObject.definition}</Text>
                  <Text style={styles.chineseDefinition}>{recognizedObject.chineseDefinition}</Text>
                </View>

               
                {recognizedObject.usage && (
                  <View style={styles.usageContainer}>
                    <Text style={styles.usageLabel}>🎯 Usage & Functions</Text>
                    <Text style={styles.usageText}>{recognizedObject.usage}</Text>
                  </View>
                )}

               
                <View style={styles.tagsContainer}>
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>{recognizedObject.category}</Text>
                  </View>
                  <View style={[styles.tag, styles.difficultyTag]}>
                    <Text style={styles.tagText}>{recognizedObject.difficulty}</Text>
                  </View>
                  <View style={[styles.tag, styles.sourceTag]}>
                    <Text style={styles.tagText}>AI Recognition</Text>
                  </View>
                </View>

                
                {recognizedObject.rawTags && (
                  <View style={styles.rawTagsContainer}>
                    <Text style={styles.rawTagsLabel}>🏷 Recognition Tags:</Text>
                    <Text style={styles.rawTagsText}>
                      {recognizedObject.rawTags.join(', ')}
                    </Text>
                  </View>
                )}

           
                <View style={styles.examplesContainer}>
                  <Text style={styles.examplesLabel}>📝 Examples</Text>
                  {recognizedObject.examples.map((example, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.exampleItem}
                      onPress={() => playExample(example)}
                      disabled={audioPlaying}
                    >
                      <View style={styles.exampleTextContainer}>
                        <Text style={styles.exampleText}>• {example}</Text>
                        <Text style={styles.exampleChinese}>  {recognizedObject.chineseExamples[index]}</Text>
                      </View>
                      <MaterialIcons 
                        name="play-circle-outline" 
                        size={20} 
                        color="#6B7280" 
                      />
                    </TouchableOpacity>
                  ))}
                </View>

               
                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={[
                      styles.actionButton,
                      isFavorited ? styles.favoriteButtonActive : styles.favoriteButton
                    ]}
                    onPress={saveToFavorites}
                  >
                    <MaterialIcons 
                      name={isFavorited ? "star" : "star-border"} 
                      size={18} 
                      color="white" 
                    />
                    <Text style={styles.actionButtonText}>
                      {isFavorited ? 'Favorited' : 'Favorite'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.actionButton, styles.practiceButton]}
                    onPress={startPractice}
                  >
                    <MaterialIcons name="school" size={18} color="white" />
                    <Text style={styles.actionButtonText}>Practice</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
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
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  statusContainer: {
    width: 24,
    alignItems: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  magicIcon: {
    position: 'absolute',
    top: -5,
    right: -5,
  },
  message: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  apiStatus: {
    marginBottom: 30,
  },
  apiStatusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#5D5CDE',
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#5D5CDE',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  secondaryButtonText: {
    color: '#5D5CDE',
  },
  recognizingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recognizingBox: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    margin: 20,
  },
  recognizingText: {
    fontSize: 18,
    color: '#374151',
    marginTop: 15,
    fontWeight: '600',
  },
  recognizingSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 5,
    textAlign: 'center',
  },
  infoContainer: {
    marginTop: 40,
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    textAlign: 'center',
  },
  infoList: {
    gap: 8,
  },
  infoItem: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
  },
  modalHeaderButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  shareButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
  },
  capturedImage: {
    width: width,
    height: width * 0.75,
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
  },
  imageLabel: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  objectCard: {
    padding: 20,
  },
  objectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  objectTitleContainer: {
    flex: 1,
  },
  objectName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#5D5CDE',
  },
  objectChineseName: {
    fontSize: 18,
    color: '#6B7280',
    marginTop: 4,
  },
  confidenceTag: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  confidenceText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  pronunciationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  pronunciation: {
    fontSize: 20,
    fontFamily: 'monospace',
    color: '#374151',
    flex: 1,
  },
  definitionContainer: {
    marginBottom: 20,
  },
  definition: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 8,
  },
  chineseDefinition: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },
  usageContainer: {
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  usageLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 6,
  },
  usageText: {
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    gap: 8,
  },
  tag: {
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  difficultyTag: {
    backgroundColor: '#F59E0B',
  },
  sourceTag: {
    backgroundColor: '#10B981',
  },
  tagText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  rawTagsContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  rawTagsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  rawTagsText: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  examplesContainer: {
    marginBottom: 24,
  },
  examplesLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  exampleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  exampleTextContainer: {
    flex: 1,
  },
  exampleText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  exampleChinese: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 14,
    marginHorizontal: 6,
  },
  favoriteButton: {
    backgroundColor: '#6B7280',
  },
  favoriteButtonActive: {
    backgroundColor: '#F59E0B',
  },
  practiceButton: {
    backgroundColor: '#5D5CDE',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});
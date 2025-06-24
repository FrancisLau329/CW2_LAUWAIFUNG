import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [recognizedObjects, setRecognizedObjects] = useState([]);
  const [learningProgress, setLearningProgress] = useState({
    wordsLearned: 0,
    streakDays: 0,
    accuracy: 0,
    totalPractices: 0,
    correctAnswers: 0,
    lastStudyDate: null,
    studyDays: []
  });
  const [favorites, setFavorites] = useState([]);
  const [practiceHistory, setPracticeHistory] = useState([]);

  
  const STORAGE_KEYS = {
    OBJECTS: 'vocablens_recognized_objects',
    PROGRESS: 'vocablens_learning_progress',
    FAVORITES: 'vocablens_favorites',
    PRACTICE: 'vocablens_practice_history'
  };

  useEffect(() => {
    loadAllData();
  }, []);

  
  const loadAllData = async () => {
    try {
      await Promise.all([
        loadRecognizedObjects(),
        loadLearningProgress(),
        loadFavorites(),
        loadPracticeHistory()
      ]);
    } catch (error) {
      console.error('Load data error:', error);
    }
  };


  const loadRecognizedObjects = async () => {
    try {
      const objects = await AsyncStorage.getItem(STORAGE_KEYS.OBJECTS);
      if (objects) {
        setRecognizedObjects(JSON.parse(objects));
      }
    } catch (error) {
      console.error('Load recognized objects error:', error);
    }
  };


  const loadLearningProgress = async () => {
    try {
      const progress = await AsyncStorage.getItem(STORAGE_KEYS.PROGRESS);
      if (progress) {
        setLearningProgress(JSON.parse(progress));
      } else {
        
        await updateLearningProgress({});
      }
    } catch (error) {
      console.error('Load learning progress error:', error);
    }
  };

  
  const loadFavorites = async () => {
    try {
      const favs = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITES);
      if (favs) {
        setFavorites(JSON.parse(favs));
      }
    } catch (error) {
      console.error('Load favorites error:', error);
    }
  };

  
  const loadPracticeHistory = async () => {
    try {
      const history = await AsyncStorage.getItem(STORAGE_KEYS.PRACTICE);
      if (history) {
        setPracticeHistory(JSON.parse(history));
      }
    } catch (error) {
      console.error('Load practice history error:', error);
    }
  };


  const addRecognizedObject = async (object) => {
    try {
      const newObjects = [object, ...recognizedObjects].slice(0, 100); 
      setRecognizedObjects(newObjects);
      await AsyncStorage.setItem(STORAGE_KEYS.OBJECTS, JSON.stringify(newObjects));
      
      
      await updateWordLearned();
      
      console.log('✅ Add recognized object success:', object.name);
    } catch (error) {
      console.error('Save recognized object error:', error);
    }
  };

 
  const updateLearningProgress = async (updates) => {
    try {
      const today = new Date().toDateString();
      const currentProgress = { ...learningProgress };
      
      
      const studyDays = currentProgress.studyDays || [];
      if (!studyDays.includes(today)) {
        studyDays.push(today);
        currentProgress.studyDays = studyDays.slice(-365); 
        
        currentProgress.streakDays = calculateStreakDays(studyDays);
      }
      
    
      const newProgress = {
        ...currentProgress,
        ...updates,
        lastStudyDate: today
      };
      
      setLearningProgress(newProgress);
      await AsyncStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(newProgress));
      
      console.log('✅ Update learning progress:', newProgress);
    } catch (error) {
      console.error('Update learning progress error:', error);
    }
  };

 
  const calculateStreakDays = (studyDays) => {
    if (!studyDays || studyDays.length === 0) return 0;
    
    const sortedDays = studyDays
      .map(day => new Date(day))
      .sort((a, b) => b - a); 
    
    let streak = 1;
    for (let i = 1; i < sortedDays.length; i++) {
      const diff = (sortedDays[i - 1] - sortedDays[i]) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };


  const updateWordLearned = async () => {
    const uniqueWords = new Set(recognizedObjects.map(obj => obj.name.toLowerCase()));
    const wordsLearned = uniqueWords.size + 1; // +1 for the new word
    
    await updateLearningProgress({ wordsLearned });
  };

 
  const addPracticeRecord = async (practiceData) => {
    try {
      const newRecord = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ...practiceData
      };
      
      const newHistory = [newRecord, ...practiceHistory].slice(0, 200); // 保留最新200條
      setPracticeHistory(newHistory);
      await AsyncStorage.setItem(STORAGE_KEYS.PRACTICE, JSON.stringify(newHistory));
      
     
      const totalPractices = learningProgress.totalPractices + 1;
      const correctAnswers = learningProgress.correctAnswers + (practiceData.correct || 0);
      const accuracy = Math.round((correctAnswers / (totalPractices * 4)) * 100); // 假設每次練習4題
      
      await updateLearningProgress({
        totalPractices,
        correctAnswers,
        accuracy: Math.min(accuracy, 100)
      });
      
      console.log('✅ Add practice record:', newRecord);
    } catch (error) {
      console.error('Save practice record error:', error);
    }
  };

 
  const addToFavorites = async (object) => {
    try {
      const newFavorites = [object, ...favorites].slice(0, 100);
      setFavorites(newFavorites);
      await AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Add to favorites error:', error);
    }
  };

  
  const removeFromFavorites = async (objectName) => {
    try {
      const newFavorites = favorites.filter(fav => fav.name !== objectName);
      setFavorites(newFavorites);
      await AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Remove from favorites error:', error);
    }
  };

  
  const getDetailedStats = () => {
    const today = new Date().toDateString();
    const thisWeek = recognizedObjects.filter(obj => {
      const objDate = new Date(obj.timestamp).toDateString();
      const diffTime = new Date(today) - new Date(objDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    });
    
    const thisMonth = recognizedObjects.filter(obj => {
      const objDate = new Date(obj.timestamp);
      const currentDate = new Date();
      return objDate.getMonth() === currentDate.getMonth() && 
             objDate.getFullYear() === currentDate.getFullYear();
    });

    return {
      todayWords: recognizedObjects.filter(obj => 
        new Date(obj.timestamp).toDateString() === today
      ).length,
      weekWords: thisWeek.length,
      monthWords: thisMonth.length,
      totalObjects: recognizedObjects.length,
      favoriteCount: favorites.length,
      practiceCount: practiceHistory.length
    };
  };

  
  const clearAllData = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.OBJECTS),
        AsyncStorage.removeItem(STORAGE_KEYS.PROGRESS),
        AsyncStorage.removeItem(STORAGE_KEYS.FAVORITES),
        AsyncStorage.removeItem(STORAGE_KEYS.PRACTICE)
      ]);
      
      setRecognizedObjects([]);
      setLearningProgress({
        wordsLearned: 0,
        streakDays: 0,
        accuracy: 0,
        totalPractices: 0,
        correctAnswers: 0,
        lastStudyDate: null,
        studyDays: []
      });
      setFavorites([]);
      setPracticeHistory([]);
      
      console.log('✅ Clear all data completed');
    } catch (error) {
      console.error('Clear data error:', error);
    }
  };

  return (
    <DataContext.Provider value={{
      
      recognizedObjects,
      learningProgress,
      favorites,
      practiceHistory,
      
      
      addRecognizedObject,
      updateLearningProgress,
      addPracticeRecord,
      addToFavorites,
      removeFromFavorites,
      
      
      getDetailedStats,
      clearAllData,
      loadAllData
    }}>
      {children}
    </DataContext.Provider>
  );
};
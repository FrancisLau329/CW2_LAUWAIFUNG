import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  RefreshControl
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import TextToSpeechService from '../services/TextToSpeechService';

const { width } = Dimensions.get('window');


const WEATHER_API_KEY = '66494bfe24904b9d59b94693030dade2';
const NEWS_API_KEY = '05d3f63315f644e3b0ddfa581dfac670';

export default function WeatherLearningScreen() {
  const navigation = useNavigation();
  const [selectedTab, setSelectedTab] = useState('weather'); // 'weather', 'news', 'location'
  const [isLoading, setIsLoading] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [location, setLocation] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [newsData, setNewsData] = useState([]);
  const [locationPermission, setLocationPermission] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const ttsService = new TextToSpeechService();

  useEffect(() => {
    requestLocationPermission();
    
    fetchNewsData();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setLocationPermission(true);
        getCurrentLocation();
      } else {
        setLocationPermission(false);
        Alert.alert(
          'Location Permission',
          'Location permission is needed to get local weather information',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Settings', onPress: () => requestLocationPermission() }
          ]
        );
      }
    } catch (error) {
      console.error('ERROR', error);
    }
  };


  const getCurrentLocation = async () => {
    try {
      setIsLoading(true);
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      const { latitude, longitude } = currentLocation.coords;
      
     
      const addressInfo = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      
      const locationData = {
        coords: { latitude, longitude },
        address: addressInfo[0] || {},
        city: addressInfo[0]?.city || 'Unknown City',
        country: addressInfo[0]?.country || 'Unknown Country',
        region: addressInfo[0]?.region || 'Unknown Region'
      };
      
      setLocation(locationData);
      
      
      await fetchWeatherData(latitude, longitude);
      
    } catch (error) {
      console.error('ERROR:', error);
      Alert.alert('Error', 'Unable to get current location, please check GPS settings');
    } finally {
      setIsLoading(false);
    }
  };


  const fetchWeatherData = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric&lang=zh_cn`
      );
      
      if (!response.ok) {
        throw new Error('天气API请求失败');
      }
      
      const data = await response.json();
      
      
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric&lang=zh_cn`
      );
      
      const forecastData = await forecastResponse.json();
      
      setWeatherData({
        current: data,
        forecast: forecastData.list ? forecastData.list.slice(0, 8) : [] 
      });
      
    } catch (error) {
      console.error('ERROR:', error);
 
      setWeatherData(getMockWeatherData());
    }
  };


  const getCategoryFromQuery = (query) => {
    const categoryMap = {
      'science technology': 'Science & Tech',
      'health lifestyle': 'Health & Lifestyle',
      'education learning': 'Education',
      'environment nature': 'Environment',
      'business innovation': 'Business'
    };
    return categoryMap[query] || 'General';
  };


  const fetchNewsData = async () => {
    try {
    
      const searchQueries = [
        'science technology',
        'health lifestyle', 
        'education learning',
        'environment nature',
        'business innovation',
        'space exploration',
        'artificial intelligence',
        'sustainable energy'
      ];
      
      
      const randomQuery = searchQueries[Math.floor(Math.random() * searchQueries.length)];
      
      const response = await fetch(
        `https://newsapi.org/v2/everything?q=${encodeURIComponent(randomQuery)}&language=en&sortBy=popularity&pageSize=15&apiKey=${NEWS_API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error('新闻API请求失败');
      }
      
      const data = await response.json();
      
      
      const processedNews = data.articles?.map((article, index) => ({
        id: `api_${index}`,
        title: article.title,
        subtitle: article.description || '',
        content: article.content || article.description || '',
        category: getCategoryFromQuery(randomQuery),
        readTime: `${Math.ceil((article.content?.length || 200) / 200)} min read`,
        publishTime: formatTimeAgo(new Date(article.publishedAt)),
        source: article.source.name,
        url: article.url,
        imageUrl: article.urlToImage,
        keyWords: extractKeyWords(article.title + ' ' + (article.description || ''))
      })).filter(article => 
        article.title && 
        article.content && 
        article.content.length > 100 &&
        !article.title.includes('[Removed]')
      ) || [];
      
      setNewsData(processedNews.slice(0, 8));
      
    } catch (error) {
      console.error('ERROR:', error);
      
      setNewsData(getDefaultNewsData());
    }
  };


  const refreshData = async () => {
    setRefreshing(true);
    
    
    const promises = [fetchNewsData()];
    
    if (location) {
      promises.push(fetchWeatherData(location.coords.latitude, location.coords.longitude));
    } else if (locationPermission) {
      promises.push(getCurrentLocation());
    }
    
    await Promise.all(promises);
    setRefreshing(false);
  };


  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return date.toLocaleDateString('en-US');
  };

  
  const extractKeyWords = (text) => {
    const learningWords = {
 
      'new': { word: 'new', chinese: '新的', pronunciation: '/njuː/', level: 'beginner' },
      'good': { word: 'good', chinese: '好的', pronunciation: '/ɡʊd/', level: 'beginner' },
      'people': { word: 'people', chinese: '人们', pronunciation: '/ˈpiːpl/', level: 'beginner' },
      'time': { word: 'time', chinese: '时间', pronunciation: '/taɪm/', level: 'beginner' },
      'work': { word: 'work', chinese: '工作', pronunciation: '/wɜːk/', level: 'beginner' },
      'help': { word: 'help', chinese: '帮助', pronunciation: '/help/', level: 'beginner' },
      'find': { word: 'find', chinese: '找到', pronunciation: '/faɪnd/', level: 'beginner' },
      'make': { word: 'make', chinese: '制作', pronunciation: '/meɪk/', level: 'beginner' },
      'use': { word: 'use', chinese: '使用', pronunciation: '/juːz/', level: 'beginner' },
      'change': { word: 'change', chinese: '改变', pronunciation: '/tʃeɪndʒ/', level: 'beginner' },
      'water': { word: 'water', chinese: '水', pronunciation: '/ˈwɔːtə/', level: 'beginner' },
      'food': { word: 'food', chinese: '食物', pronunciation: '/fuːd/', level: 'beginner' },
      'health': { word: 'health', chinese: '健康', pronunciation: '/helθ/', level: 'beginner' },
      'family': { word: 'family', chinese: '家庭', pronunciation: '/ˈfæməli/', level: 'beginner' },
      'home': { word: 'home', chinese: '家', pronunciation: '/həʊm/', level: 'beginner' },
      'learn': { word: 'learn', chinese: '学习', pronunciation: '/lɜːn/', level: 'beginner' },
      'study': { word: 'study', chinese: '学习', pronunciation: '/ˈstʌdi/', level: 'beginner' },
      'teach': { word: 'teach', chinese: '教学', pronunciation: '/tiːtʃ/', level: 'beginner' },
      'important': { word: 'important', chinese: '重要的', pronunciation: '/ɪmˈpɔːtnt/', level: 'beginner' },
      'different': { word: 'different', chinese: '不同的', pronunciation: '/ˈdɪfrənt/', level: 'beginner' },
      'great': { word: 'great', chinese: '伟大的', pronunciation: '/ɡreɪt/', level: 'beginner' },
      
 
      'technology': { word: 'technology', chinese: '技术', pronunciation: '/tekˈnɒlədʒi/', level: 'intermediate' },
      'business': { word: 'business', chinese: '商业', pronunciation: '/ˈbɪznəs/', level: 'intermediate' },
      'education': { word: 'education', chinese: '教育', pronunciation: '/ˌedʒuˈkeɪʃn/', level: 'intermediate' },
      'development': { word: 'development', chinese: '发展', pronunciation: '/dɪˈveləpmənt/', level: 'intermediate' },
      'community': { word: 'community', chinese: '社区', pronunciation: '/kəˈmjuːnəti/', level: 'intermediate' },
      'environment': { word: 'environment', chinese: '环境', pronunciation: '/ɪnˈvaɪrənmənt/', level: 'intermediate' },
      'experience': { word: 'experience', chinese: '经验', pronunciation: '/ɪkˈspɪəriəns/', level: 'intermediate' },
      'information': { word: 'information', chinese: '信息', pronunciation: '/ˌɪnfəˈmeɪʃn/', level: 'intermediate' },
      'increase': { word: 'increase', chinese: '增加', pronunciation: '/ɪnˈkriːs/', level: 'intermediate' },
      'opportunity': { word: 'opportunity', chinese: '机会', pronunciation: '/ˌɒpəˈtuːnəti/', level: 'intermediate' },
      'create': { word: 'create', chinese: '创造', pronunciation: '/kriˈeɪt/', level: 'intermediate' },
      'improve': { word: 'improve', chinese: '改善', pronunciation: '/ɪmˈpruːv/', level: 'intermediate' },
      'support': { word: 'support', chinese: '支持', pronunciation: '/səˈpɔːt/', level: 'intermediate' },
      'system': { word: 'system', chinese: '系统', pronunciation: '/ˈsɪstəm/', level: 'intermediate' },
      'service': { word: 'service', chinese: '服务', pronunciation: '/ˈsɜːvɪs/', level: 'intermediate' },
      'market': { word: 'market', chinese: '市场', pronunciation: '/ˈmɑːkɪt/', level: 'intermediate' },
      'energy': { word: 'energy', chinese: '能源', pronunciation: '/ˈenədʒi/', level: 'intermediate' },
      'company': { word: 'company', chinese: '公司', pronunciation: '/ˈkʌmpəni/', level: 'intermediate' },
      'project': { word: 'project', chinese: '项目', pronunciation: '/ˈprɒdʒekt/', level: 'intermediate' },
      'process': { word: 'process', chinese: '过程', pronunciation: '/ˈprəʊses/', level: 'intermediate' },
      'build': { word: 'build', chinese: '建造', pronunciation: '/bɪld/', level: 'intermediate' },
      'design': { word: 'design', chinese: '设计', pronunciation: '/dɪˈzaɪn/', level: 'intermediate' },
      'develop': { word: 'develop', chinese: '发展', pronunciation: '/dɪˈveləp/', level: 'intermediate' },
      'research': { word: 'research', chinese: '研究', pronunciation: '/rɪˈsɜːtʃ/', level: 'intermediate' },
      'discover': { word: 'discover', chinese: '发现', pronunciation: '/dɪˈskʌvə/', level: 'intermediate' },
      'explore': { word: 'explore', chinese: '探索', pronunciation: '/ɪkˈsplɔː/', level: 'intermediate' },
      'popular': { word: 'popular', chinese: '受欢迎的', pronunciation: '/ˈpɒpjələ/', level: 'intermediate' },
      'successful': { word: 'successful', chinese: '成功的', pronunciation: '/səkˈsesfl/', level: 'intermediate' },
      'effective': { word: 'effective', chinese: '有效的', pronunciation: '/ɪˈfektɪv/', level: 'intermediate' },
      
       
      'innovation': { word: 'innovation', chinese: '创新', pronunciation: '/ˌɪnəˈveɪʃn/', level: 'advanced' },
      'sustainable': { word: 'sustainable', chinese: '可持续的', pronunciation: '/səˈsteɪnəbl/', level: 'advanced' },
      'artificial': { word: 'artificial', chinese: '人工的', pronunciation: '/ˌɑːtɪˈfɪʃl/', level: 'advanced' },
      'intelligence': { word: 'intelligence', chinese: '智能', pronunciation: '/ɪnˈtelɪdʒəns/', level: 'advanced' },
      'implementation': { word: 'implementation', chinese: '实施', pronunciation: '/ˌɪmplɪmenˈteɪʃn/', level: 'advanced' },
      'collaboration': { word: 'collaboration', chinese: '合作', pronunciation: '/kəˌlæbəˈreɪʃn/', level: 'advanced' },
      'infrastructure': { word: 'infrastructure', chinese: '基础设施', pronunciation: '/ˈɪnfrəstrʌktʃə/', level: 'advanced' },
      'methodology': { word: 'methodology', chinese: '方法论', pronunciation: '/ˌmeθəˈdɒlədʒi/', level: 'advanced' },
      'optimization': { word: 'optimization', chinese: '优化', pronunciation: '/ˌɒptɪmaɪˈzeɪʃn/', level: 'advanced' },
      'comprehensive': { word: 'comprehensive', chinese: '全面的', pronunciation: '/ˌkɒmprɪˈhensɪv/', level: 'advanced' },
      'sophisticated': { word: 'sophisticated', chinese: '复杂的', pronunciation: '/səˈfɪstɪkeɪtɪd/', level: 'advanced' },
      'revolutionary': { word: 'revolutionary', chinese: '革命性的', pronunciation: '/ˌrevəˈluːʃənəri/', level: 'advanced' },
      'analyze': { word: 'analyze', chinese: '分析', pronunciation: '/ˈænəlaɪz/', level: 'advanced' },
      'significant': { word: 'significant', chinese: '重要的', pronunciation: '/sɪɡˈnɪfɪkənt/', level: 'advanced' },
      'essential': { word: 'essential', chinese: '必要的', pronunciation: '/ɪˈsenʃl/', level: 'advanced' }
    };
    
    const foundWords = [];
    const lowerText = text.toLowerCase();
    
   
    const beginnerWords = [];
    const intermediateWords = [];
    const advancedWords = [];
    
    Object.keys(learningWords).forEach(key => {
      if (lowerText.includes(key)) {
        const word = learningWords[key];
        switch(word.level) {
          case 'beginner':
            beginnerWords.push(word);
            break;
          case 'intermediate':
            intermediateWords.push(word);
            break;
          case 'advanced':
            advancedWords.push(word);
            break;
        }
      }
    });
    
  
    const selectedWords = [];

    if (beginnerWords.length > 0) {
      selectedWords.push(...beginnerWords.slice(0, 2));
    }
  
    if (intermediateWords.length > 0 && selectedWords.length < 4) {
      selectedWords.push(...intermediateWords.slice(0, 2));
    }
   
    if (advancedWords.length > 0 && selectedWords.length < 5) {
      selectedWords.push(...advancedWords.slice(0, 1));
    }

    const remainingSlots = 5 - selectedWords.length;
    if (remainingSlots > 0) {
      const allRemaining = [...beginnerWords.slice(2), ...intermediateWords.slice(2), ...advancedWords.slice(1)];
      selectedWords.push(...allRemaining.slice(0, remainingSlots));
    }
    
    return selectedWords.slice(0, 5); 
  };


  const getMockWeatherData = () => ({
    current: {
      name: location?.city || 'Your City',
      main: {
        temp: 22,
        feels_like: 25,
        humidity: 65,
        pressure: 1013
      },
      weather: [{
        main: 'Clear',
        description: '晴朗',
        icon: '01d'
      }],
      wind: {
        speed: 3.2
      },
      visibility: 10000
    },
    forecast: []
  });


  const getDefaultNewsData = () => [
    {
      id: 'default_1',
      title: 'New Technology Helps People Learn Better',
      subtitle: 'Researchers find effective ways to improve learning',
      content: 'Scientists have discovered new technology that helps people learn more effectively. The new system uses artificial intelligence to create personalized learning experiences. This development could help students around the world improve their education. The technology is easy to use and makes learning more fun for everyone.',
      category: 'Education & Tech',
      readTime: '3 min read',
      publishTime: '2 hours ago',
      source: 'Education Today',
      keyWords: [
        { word: 'new', chinese: '新的', pronunciation: '/njuː/', level: 'beginner' },
        { word: 'technology', chinese: '技术', pronunciation: '/tekˈnɒlədʒi/', level: 'intermediate' },
        { word: 'people', chinese: '人们', pronunciation: '/ˈpiːpl/', level: 'beginner' },
        { word: 'effective', chinese: '有效的', pronunciation: '/ɪˈfektɪv/', level: 'intermediate' },
        { word: 'artificial', chinese: '人工的', pronunciation: '/ˌɑːtɪˈfɪʃl/', level: 'advanced' }
      ]
    },
    {
      id: 'default_2',
      title: 'Good Food and Health: What You Need to Know',
      subtitle: 'Simple tips for better health through nutrition',
      content: 'Eating good food is important for your health. New research shows that people who eat healthy food feel better and work more effectively. The study found that families who make time to eat together are happier. Experts help people learn about nutrition and how to create healthy meals at home.',
      category: 'Health & Lifestyle',
      readTime: '4 min read',
      publishTime: '5 hours ago',
      source: 'Health News',
      keyWords: [
        { word: 'good', chinese: '好的', pronunciation: '/ɡʊd/', level: 'beginner' },
        { word: 'food', chinese: '食物', pronunciation: '/fuːd/', level: 'beginner' },
        { word: 'health', chinese: '健康', pronunciation: '/helθ/', level: 'beginner' },
        { word: 'research', chinese: '研究', pronunciation: '/rɪˈsɜːtʃ/', level: 'intermediate' },
        { word: 'nutrition', chinese: '营养', pronunciation: '/njuˈtrɪʃn/', level: 'intermediate' }
      ]
    }
  ];

 
  const weatherVocabulary = [
    { word: "sunny", chinese: "晴朗的", pronunciation: "/ˈsʌni/", example: "It's a sunny day today.", level: "beginner" },
    { word: "cloudy", chinese: "多云的", pronunciation: "/ˈklaʊdi/", example: "The sky is cloudy this morning.", level: "beginner" },
    { word: "rainy", chinese: "下雨的", pronunciation: "/ˈreɪni/", example: "Don't forget your umbrella on rainy days.", level: "beginner" },
    { word: "windy", chinese: "有风的", pronunciation: "/ˈwɪndi/", example: "It's too windy to fly a kite.", level: "beginner" },
    { word: "foggy", chinese: "有雾的", pronunciation: "/ˈfɒɡi/", example: "Driving is dangerous in foggy weather.", level: "intermediate" },
    { word: "humidity", chinese: "湿度", pronunciation: "/hjuːˈmɪdəti/", example: "The humidity is very high today.", level: "intermediate" },
    { word: "temperature", chinese: "温度", pronunciation: "/ˈtemprətʃə/", example: "Check the temperature before going out.", level: "intermediate" },
    { word: "forecast", chinese: "预报", pronunciation: "/ˈfɔːkɑːst/", example: "The weather forecast says it will rain tomorrow.", level: "intermediate" }
  ];

  
  const playAudio = async (text) => {
    try {
      setIsLoading(true);
      await ttsService.speakEnglish(text);
    } catch (error) {
      Alert.alert('Error', 'Audio playback failed');
    } finally {
      setIsLoading(false);
    }
  };

  
  const learnWord = (wordData) => {
    const wordObject = {
      name: wordData.word,
      chineseName: wordData.chinese,
      pronunciation: wordData.pronunciation,
      definition: `Learning vocabulary: ${wordData.word}`,
      chineseDefinition: `学习词汇：${wordData.chinese}`,
      category: "Learning",
      examples: [wordData.example || `Example with ${wordData.word}.`],
      source: "News Learning",
      confidence: 1,
      timestamp: new Date().toISOString(),
      type: "noun"
    };

    navigation.navigate('WordDictionary', { 
      word: wordObject,
      mode: 'learning' 
    });
  };


  const getWeatherIcon = (weatherCode) => {
    const iconMap = {
      '01d': 'wb-sunny',
      '01n': 'brightness-2',
      '02d': 'wb-cloudy',
      '02n': 'wb-cloudy',
      '03d': 'cloud',
      '03n': 'cloud',
      '04d': 'cloud',
      '04n': 'cloud',
      '09d': 'grain',
      '09n': 'grain',
      '10d': 'grain',
      '10n': 'grain',
      '11d': 'flash-on',
      '11n': 'flash-on',
      '13d': 'ac-unit',
      '13n': 'ac-unit',
      '50d': 'visibility',
      '50n': 'visibility',
    };
    
    return iconMap[weatherCode] || 'help';
  };


  const TabSelector = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tab, selectedTab === 'location' && styles.activeTab]}
        onPress={() => setSelectedTab('location')}
      >
        <MaterialIcons 
          name="location-on" 
          size={20} 
          color={selectedTab === 'location' ? 'white' : '#6B7280'} 
        />
        <Text style={[styles.tabText, selectedTab === 'location' && styles.activeTabText]}>
          Local Weather
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, selectedTab === 'news' && styles.activeTab]}
        onPress={() => setSelectedTab('news')}
      >
        <MaterialIcons 
          name="article" 
          size={20} 
          color={selectedTab === 'news' ? 'white' : '#6B7280'} 
        />
        <Text style={[styles.tabText, selectedTab === 'news' && styles.activeTabText]}>
          News English
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, selectedTab === 'weather' && styles.activeTab]}
        onPress={() => setSelectedTab('weather')}
      >
        <MaterialIcons 
          name="school" 
          size={20} 
          color={selectedTab === 'weather' ? 'white' : '#6B7280'} 
        />
        <Text style={[styles.tabText, selectedTab === 'weather' && styles.activeTabText]}>
          Vocabulary Learning
        </Text>
      </TouchableOpacity>
    </View>
  );


  const LocationWeatherTab = () => (
    <ScrollView 
      style={styles.content} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refreshData}
          colors={['#5D5CDE']}
          tintColor="#5D5CDE"
        />
      }
    >
      {!locationPermission ? (
        <View style={styles.permissionContainer}>
          <MaterialIcons name="location-off" size={48} color="#6B7280" />
          <Text style={styles.permissionTitle}>Location Permission Required</Text>
          <Text style={styles.permissionText}>
            To get local weather information, we need access to your location
          </Text>
          <TouchableOpacity 
            style={styles.enableLocationButton}
            onPress={requestLocationPermission}
          >
            <MaterialIcons name="location-on" size={20} color="white" />
            <Text style={styles.enableLocationText}>Enable Location Services</Text>
          </TouchableOpacity>
        </View>
      ) : !weatherData ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5D5CDE" />
          <Text style={styles.loadingText}>Getting weather data...</Text>
        </View>
      ) : (
        <>
        
          <View style={styles.locationCard}>
            <View style={styles.locationHeader}>
              <MaterialIcons name="location-on" size={20} color="#5D5CDE" />
              <Text style={styles.locationTitle}>Current Location</Text>
              <TouchableOpacity onPress={refreshData} disabled={refreshing}>
                <MaterialIcons 
                  name="refresh" 
                  size={20} 
                  color={refreshing ? "#9CA3AF" : "#5D5CDE"} 
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.locationText}>
              {location?.city}, {location?.region}, {location?.country}
            </Text>
          </View>

        
          <View style={styles.currentWeatherCard}>
            <View style={styles.currentWeatherHeader}>
              <Text style={styles.currentWeatherTitle}>Current Weather</Text>
              <TouchableOpacity 
                onPress={() => playAudio(`Current weather in ${location?.city}. ${weatherData.current.weather[0].description}. Temperature ${Math.round(weatherData.current.main.temp)} degrees Celsius.`)}
              >
                <MaterialIcons name="volume-up" size={20} color="#5D5CDE" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.currentWeatherMain}>
              <View style={styles.weatherIconContainer}>
                <MaterialIcons 
                  name={getWeatherIcon(weatherData.current.weather[0].icon)} 
                  size={64} 
                  color="#5D5CDE" 
                />
                <Text style={styles.weatherDescription}>
                  {weatherData.current.weather[0].description}
                </Text>
              </View>
              
              <View style={styles.temperatureContainer}>
                <Text style={styles.temperature}>
                  {Math.round(weatherData.current.main.temp)}°C
                </Text>
                <Text style={styles.feelsLike}>
                  Feels like {Math.round(weatherData.current.main.feels_like)}°C
                </Text>
              </View>
            </View>

            <View style={styles.weatherDetails}>
              <View style={styles.weatherDetailItem}>
                <MaterialIcons name="opacity" size={16} color="#6B7280" />
                <Text style={styles.weatherDetailLabel}>Humidity</Text>
                <Text style={styles.weatherDetailValue}>{weatherData.current.main.humidity}%</Text>
              </View>
              
              <View style={styles.weatherDetailItem}>
                <MaterialIcons name="air" size={16} color="#6B7280" />
                <Text style={styles.weatherDetailLabel}>Wind Speed</Text>
                <Text style={styles.weatherDetailValue}>{weatherData.current.wind.speed} m/s</Text>
              </View>
              
              <View style={styles.weatherDetailItem}>
                <MaterialIcons name="compress" size={16} color="#6B7280" />
                <Text style={styles.weatherDetailLabel}>Pressure</Text>
                <Text style={styles.weatherDetailValue}>{weatherData.current.main.pressure} hPa</Text>
              </View>
            </View>
          </View>

    
          <View style={styles.weatherVocabSection}>
            <Text style={styles.sectionTitle}>🎓 Related Vocabulary Learning</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {weatherVocabulary.slice(0, 4).map((item, index) => (
                <TouchableOpacity 
                  key={index}
                  style={styles.miniVocabCard}
                  onPress={() => learnWord(item)}
                >
                  <Text style={styles.miniVocabWord}>{item.word}</Text>
                  <Text style={styles.miniVocabChinese}>{item.chinese}</Text>
               
                  {item.level && (
                    <View style={[styles.miniLevelBadge, 
                      item.level === 'beginner' && styles.levelBeginner,
                      item.level === 'intermediate' && styles.levelIntermediate,
                      item.level === 'advanced' && styles.levelAdvanced
                    ]}>
                      <Text style={styles.miniLevelText}>
                        {item.level === 'beginner' ? 'Basic' : 
                         item.level === 'intermediate' ? 'Inter' : 'Adv'}
                      </Text>
                    </View>
                  )}
                  <TouchableOpacity 
                    style={styles.miniPlayButton}
                    onPress={() => playAudio(item.word)}
                  >
                    <MaterialIcons name="volume-up" size={16} color="#5D5CDE" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </>
      )}
    </ScrollView>
  );

 
  const LocalNewsTab = () => (
    <ScrollView 
      style={styles.content} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refreshData}
          colors={['#5D5CDE']}
          tintColor="#5D5CDE"
        />
      }
    >
      <View style={styles.sectionHeader}>
        <MaterialIcons name="article" size={24} color="#5D5CDE" />
        <Text style={styles.sectionTitle}>English News Learning</Text>
      </View>
      
      <Text style={styles.sectionDescription}>
        Learn practical vocabulary through latest English news and improve reading comprehension
      </Text>

      {newsData.length === 0 ? (
        <View style={styles.noNewsContainer}>
          <MaterialIcons name="article" size={48} color="#D1D5DB" />
          <Text style={styles.noNewsTitle}>No News Available</Text>
          <Text style={styles.noNewsText}>
            {isLoading ? 'Fetching news data...' : 'Unable to fetch relevant news at the moment'}
          </Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchNewsData}
          >
            <MaterialIcons name="refresh" size={20} color="#5D5CDE" />
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        newsData.map((article) => (
          <NewsCard key={article.id} article={article} />
        ))
      )}
    </ScrollView>
  );

  
  const WeatherVocabTab = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.sectionHeader}>
        <MaterialIcons name="school" size={24} color="#5D5CDE" />
        <Text style={styles.sectionTitle}>Weather-Related Vocabulary Learning</Text>
      </View>

      {weatherVocabulary.map((item, index) => (
        <View key={index} style={styles.vocabCard}>
          <View style={styles.vocabHeader}>
            <View style={styles.vocabInfo}>
              <View style={styles.vocabWordHeader}>
                <Text style={styles.vocabWord}>{item.word}</Text>
                
                {item.level && (
                  <View style={[styles.levelBadge, 
                    item.level === 'beginner' && styles.levelBeginner,
                    item.level === 'intermediate' && styles.levelIntermediate,
                    item.level === 'advanced' && styles.levelAdvanced
                  ]}>
                    <Text style={styles.levelText}>
                      {item.level === 'beginner' ? 'Basic' : 
                       item.level === 'intermediate' ? 'Intermediate' : 'Advanced'}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.vocabChinese}>{item.chinese}</Text>
              <Text style={styles.vocabPronunciation}>{item.pronunciation}</Text>
            </View>
            
            <View style={styles.vocabActions}>
              <TouchableOpacity 
                style={styles.playButton}
                onPress={() => playAudio(item.word)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <MaterialIcons name="volume-up" size={20} color="white" />
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.learnButton}
                onPress={() => learnWord(item)}
              >
                <MaterialIcons name="book" size={20} color="#5D5CDE" />
              </TouchableOpacity>
            </View>
          </View>
          
          <Text style={styles.vocabExample}>Example: {item.example}</Text>
        </View>
      ))}
    </ScrollView>
  );

 
  const NewsCard = ({ article }) => (
    <TouchableOpacity 
      style={styles.newsCard}
      onPress={() => setSelectedArticle(article)}
    >
      <View style={styles.newsHeader}>
        <View style={styles.newsMeta}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{article.category}</Text>
          </View>
          <Text style={styles.readTime}>{article.readTime}</Text>
        </View>
        <Text style={styles.publishTime}>{article.publishTime}</Text>
      </View>
      
      <Text style={styles.newsTitle}>{article.title}</Text>
      <Text style={styles.newsSubtitle}>{article.subtitle}</Text>
      
      <View style={styles.newsFooter}>
        <Text style={styles.newsSource}>{article.source}</Text>
        <View style={styles.newsActions}>
          <MaterialIcons name="play-arrow" size={16} color="#5D5CDE" />
          <Text style={styles.readMoreText}>Read Full Article</Text>
        </View>
      </View>
      
     
      {article.keyWords && article.keyWords.length > 0 && (
        <View style={styles.keyWordsPreview}>
          <Text style={styles.keyWordsPreviewLabel}>Learn Vocabulary:</Text>
          <View style={styles.keyWordsPreviewList}>
            {article.keyWords.slice(0, 3).map((word, index) => (
              <View key={index} style={styles.keyWordPreviewTag}>
                <Text style={styles.keyWordPreviewText}>{word.word}</Text>
               
                {word.level && (
                  <View style={[styles.levelDot, 
                    word.level === 'beginner' && styles.levelBeginner,
                    word.level === 'intermediate' && styles.levelIntermediate,
                    word.level === 'advanced' && styles.levelAdvanced
                  ]} />
                )}
              </View>
            ))}
            {article.keyWords.length > 3 && (
              <Text style={styles.moreKeyWords}>+{article.keyWords.length - 3}</Text>
            )}
          </View>
        </View>
      )}
    </TouchableOpacity>
  );

  
  const NewsDetailView = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.newsDetailHeader}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => setSelectedArticle(null)}
        >
          <MaterialIcons name="arrow-back" size={24} color="#5D5CDE" />
          <Text style={styles.backButtonText}>Back to List</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.playArticleButton}
          onPress={() => playAudio(selectedArticle.content)}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <MaterialIcons name="play-arrow" size={20} color="white" />
          )}
          <Text style={styles.playArticleText}>Play Full Article</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.articleContainer}>
        <View style={styles.articleMeta}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{selectedArticle.category}</Text>
          </View>
          <Text style={styles.articleDate}>{selectedArticle.publishTime}</Text>
        </View>
        
        <Text style={styles.articleTitle}>{selectedArticle.title}</Text>
        <Text style={styles.articleSubtitle}>{selectedArticle.subtitle}</Text>
        
        <View style={styles.articleStats}>
          <Text style={styles.readTime}>{selectedArticle.readTime}</Text>
          <Text style={styles.wordCount}>{selectedArticle.content.split(' ').length} words</Text>
        </View>
        
        <Text style={styles.articleContent}>{selectedArticle.content}</Text>
        
        <Text style={styles.sourceText}>Source: {selectedArticle.source}</Text>
      </View>

     
      {selectedArticle.keyWords && selectedArticle.keyWords.length > 0 && (
        <View style={styles.keyWordsSection}>
          <Text style={styles.keyWordsTitle}>📚 Key Vocabulary Learning</Text>
          {selectedArticle.keyWords.map((word, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.keyWordCard}
              onPress={() => learnWord(word)}
            >
              <View style={styles.keyWordInfo}>
                <View style={styles.keyWordHeader}>
                  <Text style={styles.keyWordText}>{word.word}</Text>
                
                  {word.level && (
                    <View style={[styles.levelBadge, 
                      word.level === 'beginner' && styles.levelBeginner,
                      word.level === 'intermediate' && styles.levelIntermediate,
                      word.level === 'advanced' && styles.levelAdvanced
                    ]}>
                      <Text style={styles.levelText}>
                        {word.level === 'beginner' ? 'Basic' : 
                         word.level === 'intermediate' ? 'Intermediate' : 'Advanced'}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={styles.keyWordChinese}>{word.chinese}</Text>
                <Text style={styles.keyWordPronunciation}>{word.pronunciation}</Text>
              </View>
              
              <View style={styles.keyWordActions}>
                <TouchableOpacity 
                  style={styles.keyWordPlayButton}
                  onPress={() => playAudio(word.word)}
                >
                  <MaterialIcons name="volume-up" size={16} color="#5D5CDE" />
                </TouchableOpacity>
                <MaterialIcons name="arrow-forward" size={16} color="#6B7280" />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#5D5CDE" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contextual Learning</Text>
        <TouchableOpacity onPress={refreshData} disabled={refreshing}>
          <MaterialIcons 
            name="refresh" 
            size={24} 
            color={refreshing ? "#9CA3AF" : "#5D5CDE"} 
          />
        </TouchableOpacity>
      </View>

      {selectedArticle ? (
        <NewsDetailView />
      ) : (
        <>
          <TabSelector />
          {selectedTab === 'location' && <LocationWeatherTab />}
          {selectedTab === 'news' && <LocalNewsTab />}
          {selectedTab === 'weather' && <WeatherVocabTab />}
        </>
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
  tabContainer: {
    flexDirection: 'row',
    margin: 20,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  activeTab: {
    backgroundColor: '#5D5CDE',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabText: {
    color: 'white',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  // 权限相关样式
  permissionContainer: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: 'white',
    borderRadius: 16,
    marginTop: 20,
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  permissionText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  enableLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5D5CDE',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  enableLocationText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // 位置卡片样式
  locationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  locationText: {
    fontSize: 14,
    color: '#6B7280',
  },
  // 当前天气样式
  currentWeatherCard: {
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
  currentWeatherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  currentWeatherTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
  },
  currentWeatherMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  weatherIconContainer: {
    alignItems: 'center',
  },
  weatherDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  temperatureContainer: {
    alignItems: 'center',
  },
  temperature: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#5D5CDE',
  },
  feelsLike: {
    fontSize: 14,
    color: '#6B7280',
  },
  weatherDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },
  weatherDetailItem: {
    alignItems: 'center',
    gap: 4,
  },
  weatherDetailLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  weatherDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  // 迷你词汇卡片
  weatherVocabSection: {
    marginBottom: 20,
  },
  miniVocabCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    alignItems: 'center',
    width: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  miniVocabWord: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#5D5CDE',
    marginBottom: 4,
  },
  miniVocabChinese: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  miniPlayButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
  },
  // 🆕 迷你难度级别标签
  miniLevelBadge: {
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginBottom: 6,
  },
  miniLevelText: {
    color: 'white',
    fontSize: 8,
    fontWeight: '600',
  },
  // 无新闻状态
  noNewsContainer: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: 'white',
    borderRadius: 16,
    marginTop: 20,
  },
  noNewsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 12,
  },
  noNewsText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  retryButtonText: {
    fontSize: 14,
    color: '#5D5CDE',
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#6B7280',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
    lineHeight: 20,
  },
  // 词汇卡片样式
  vocabCard: {
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
  vocabHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  vocabInfo: {
    flex: 1,
  },
  // 🆕 词汇头部样式
  vocabWordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  vocabWord: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5D5CDE',
  },
  vocabChinese: {
    fontSize: 16,
    color: '#374151',
    marginTop: 2,
  },
  vocabPronunciation: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#6B7280',
    marginTop: 2,
  },
  vocabActions: {
    flexDirection: 'row',
    gap: 8,
  },
  playButton: {
    backgroundColor: '#5D5CDE',
    borderRadius: 20,
    padding: 8,
  },
  learnButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    padding: 8,
  },
  vocabExample: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 8,
  },
  // 🆕 难度级别标签样式
  levelBadge: {
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  levelBeginner: {
    backgroundColor: '#10B981',
  },
  levelIntermediate: {
    backgroundColor: '#F59E0B',
  },
  levelAdvanced: {
    backgroundColor: '#EF4444',
  },
  levelText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  // 🆕 关键词头部
  keyWordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  // 🆕 难度级别颜色点
  levelDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 4,
  },
  // 新闻卡片样式
  newsCard: {
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
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  newsMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryBadge: {
    backgroundColor: '#5D5CDE',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  categoryText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  readTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  publishTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  newsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
    lineHeight: 24,
  },
  newsSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  newsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  newsSource: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  newsActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  readMoreText: {
    fontSize: 12,
    color: '#5D5CDE',
    fontWeight: '600',
  },
  // 🆕 关键词预览样式
  keyWordsPreview: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  keyWordsPreviewLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 8,
  },
  keyWordsPreviewList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  keyWordPreviewTag: {
    backgroundColor: '#E0E7FF',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  keyWordPreviewText: {
    fontSize: 11,
    color: '#5D5CDE',
    fontWeight: '500',
  },
  moreKeyWords: {
    fontSize: 11,
    color: '#9CA3AF',
    fontStyle: 'italic',
    alignSelf: 'center',
  },
  // 新闻详情页样式
  newsDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#5D5CDE',
    fontWeight: '600',
  },
  playArticleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5D5CDE',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  playArticleText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  articleContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  articleMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  articleDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  articleTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
    lineHeight: 32,
  },
  articleSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 24,
  },
  articleStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  wordCount: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  articleContent: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 26,
    marginBottom: 20,
  },
  sourceText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
    textAlign: 'right',
  },
  // 关键词学习样式
  keyWordsSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  keyWordsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 16,
  },
  keyWordCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#5D5CDE',
  },
  keyWordInfo: {
    flex: 1,
  },
  keyWordText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#5D5CDE',
  },
  keyWordChinese: {
    fontSize: 14,
    color: '#374151',
    marginTop: 2,
  },
  keyWordPronunciation: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#6B7280',
    marginTop: 2,
  },
  keyWordActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  keyWordPlayButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    padding: 6,
  },
});
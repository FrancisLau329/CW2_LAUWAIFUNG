import LocationService from './LocationService';
import WeatherService from './WeatherService';
import NewsService from './NewsService';

class ContextualLearningService {
  constructor() {
    this.locationService = new LocationService();
    this.weatherService = new WeatherService();
    this.newsService = new NewsService();
    
    // 🆕 添加缓存机制
    this.cache = {
      location: null,
      weather: null,
      news: null,
      timestamp: null
    };
    
    // 缓存有效期（5分钟）
    this.CACHE_DURATION = 5 * 60 * 1000;
    
    // 位置缓存有效期（10分钟，位置变化较少）
    this.LOCATION_CACHE_DURATION = 10 * 60 * 1000;
  }

  // 🚀 新增：快速加载方法 - 优先使用缓存，并行加载
  async getContextualLearningFast() {
    try {
      console.log('⚡ Loading contextual learning data quickly...');
      const startTime = Date.now();
      
      // 1. 检查是否有有效缓存
      if (this.isCacheValid()) {
        console.log('📦 Using cached data');
        const cachedData = this.getCachedData();
        // 后台更新数据
        this.refreshDataInBackground();
        return cachedData;
      }
      
      // 2. 并行加载最重要的数据
      const [locationResult, weatherResult] = await Promise.allSettled([
        this.getLocationDataFast(),
        this.getWeatherDataFast()
      ]);
      
      const location = locationResult.status === 'fulfilled' ? locationResult.value : null;
      const weather = weatherResult.status === 'fulfilled' ? weatherResult.value : this.getDefaultWeatherData();
      
      console.log(`⚡ Basic data loading completed: ${Date.now() - startTime}ms`);
      
      // 3. 立即返回基础数据，新闻数据稍后获取
      const quickData = {
        weather: weather,
        location: location,
        news: this.getDefaultNewsData(), // 先返回默认数据
        timestamp: new Date().toISOString(),
        isPartial: true // 标记为部分数据
      };
      
      // 4. 后台加载新闻数据
      this.loadNewsInBackground().then(newsData => {
        const completeData = {
          ...quickData,
          news: newsData,
          isPartial: false
        };
        
        // 更新缓存
        this.updateCache(completeData);
        
        // 如果有回调，通知UI更新
        if (this.onDataUpdated) {
          this.onDataUpdated(completeData);
        }
      });
      
      return quickData;
      
    } catch (error) {
      console.error('Fast loading failed:', error);
      return this.getDefaultCompleteData();
    }
  }

  // 🚀 优化：快速位置获取
  async getLocationDataFast() {
    try {
      // 优先使用缓存的位置
      if (this.cache.location && this.isLocationCacheValid()) {
        console.log('📍 Using cached location');
        return this.cache.location;
      }
      
      const startTime = Date.now();
      
      // 获取GPS位置
      const location = await this.locationService.getCurrentLocation();
      console.log(`📍 GPS positioning completed: ${Date.now() - startTime}ms`);
      
      // 先返回带有临时地址的位置数据
      const locationData = {
        ...location,
        address: {
          city: 'Resolving...',
          region: 'Resolving...',
          country: 'Resolving...',
          full: 'Address resolving...'
        }
      };
      
      // 后台解析地址
      this.resolveAddressInBackground(location.latitude, location.longitude);
      
      return locationData;
    } catch (error) {
      console.error('Fast location retrieval failed:', error);
      return null;
    }
  }

  // 🆕 后台地址解析
  async resolveAddressInBackground(latitude, longitude) {
    try {
      const address = await this.locationService.getAddressFromCoordinates(latitude, longitude);
      
      // 更新位置缓存
      if (this.cache.location) {
        this.cache.location.address = address;
        console.log('📍 Address resolution completed:', address.city);
        
        // 通知UI更新
        if (this.onLocationUpdated) {
          this.onLocationUpdated(this.cache.location);
        }
      }
    } catch (error) {
      console.error('Background address resolution failed:', error);
    }
  }

  // 🚀 优化：快速天气获取
  async getWeatherDataFast() {
    try {
      // 优先使用缓存
      if (this.cache.weather && this.isWeatherCacheValid()) {
        console.log('🌤️ Using cached weather');
        return this.cache.weather;
      }
      
      const location = await this.getLocationDataFast();
      if (!location) {
        return this.getDefaultWeatherData();
      }
      
      const startTime = Date.now();
      
      // 只获取当前天气，预报稍后获取
      const currentWeather = await this.weatherService.getCurrentWeather(
        location.latitude, 
        location.longitude
      );
      
      console.log(`🌤️ Current weather retrieval completed: ${Date.now() - startTime}ms`);
      
      let learningContent = null;
      if (currentWeather) {
        learningContent = this.weatherService.generateWeatherLearningContent(currentWeather);
      }
      
      const weatherData = {
        weatherData: currentWeather || this.weatherService.getMockWeatherData(),
        forecast: null, // 稍后获取
        learning: learningContent || this.weatherService.getDefaultLearningContent()
      };
      
      // 后台获取预报
      this.loadForecastInBackground(location, weatherData);
      
      return weatherData;
    } catch (error) {
      console.error('Fast weather retrieval failed:', error);
      return this.getDefaultWeatherData();
    }
  }

  // 🆕 后台获取天气预报
  async loadForecastInBackground(location, weatherData) {
    try {
      const forecast = await this.weatherService.getWeatherForecast(
        location.latitude, 
        location.longitude
      );
      
      if (this.cache.weather) {
        this.cache.weather.forecast = forecast || this.weatherService.getMockForecastData();
        
        if (this.onWeatherUpdated) {
          this.onWeatherUpdated(this.cache.weather);
        }
      }
    } catch (error) {
      console.error('Background forecast retrieval failed:', error);
    }
  }

  // 🆕 后台加载新闻
  async loadNewsInBackground() {
    try {
      console.log('📰 Loading news data in background...');
      const location = this.cache.location;
      
      // 只获取最重要的新闻，减少加载时间
      const [topNews] = await Promise.allSettled([
        this.newsService.getTopHeadlinesAdvanced({
          country: 'us',
          category: 'general',
          pageSize: 5 // 减少数量
        })
      ]);

      const topNewsResult = topNews.status === 'fulfilled' ? topNews.value : [];
      
      const newsData = {
        topNews: Array.isArray(topNewsResult) ? topNewsResult : [],
        local: [], // 稍后加载
        tech: [], // 稍后加载
        stats: {
          totalCategories: 7,
          supportedCountries: 54,
          apiAvailable: true,
          apiStatus: 'Active',
          lastUpdate: new Date().toISOString()
        }
      };
      
      // 继续后台加载其他新闻
      this.loadAdditionalNewsInBackground(location, newsData);
      
      return newsData;
    } catch (error) {
      console.error('Background news loading failed:', error);
      return this.getDefaultNewsData();
    }
  }

  // 🆕 后台加载额外新闻
  async loadAdditionalNewsInBackground(location, existingNews) {
    try {
      const [localNews, techNews] = await Promise.allSettled([
        location ? this.newsService.getLocalNewsAdvanced(location, {
          sortBy: 'publishedAt',
          pageSize: 3
        }) : Promise.resolve([]),
        this.newsService.getTechNewsForLearning()
      ]);

      const localNewsResult = localNews.status === 'fulfilled' ? localNews.value : [];
      const techNewsResult = techNews.status === 'fulfilled' ? techNews.value : [];
      
      const completeNews = {
        ...existingNews,
        local: Array.isArray(localNewsResult) ? localNewsResult : [],
        tech: Array.isArray(techNewsResult) ? techNewsResult.slice(0, 2) : []
      };
      
      // 更新缓存中的新闻数据
      if (this.cache.news) {
        this.cache.news = completeNews;
      }
      
      if (this.onNewsUpdated) {
        this.onNewsUpdated(completeNews);
      }
    } catch (error) {
      console.error('Background additional news loading failed:', error);
    }
  }

  // 🆕 后台刷新所有数据
  async refreshDataInBackground() {
    try {
      console.log('🔄 Refreshing data in background...');
      const freshData = await this.getContextualLearningData();
      this.updateCache(freshData);
      
      if (this.onDataUpdated) {
        this.onDataUpdated(freshData);
      }
    } catch (error) {
      console.error('Background refresh failed:', error);
    }
  }

  // 🆕 缓存管理方法
  isCacheValid() {
    return this.cache.timestamp && 
           (Date.now() - this.cache.timestamp) < this.CACHE_DURATION &&
           this.cache.location && 
           this.cache.weather;
  }

  isLocationCacheValid() {
    return this.cache.location && 
           this.cache.timestamp && 
           (Date.now() - this.cache.timestamp) < this.LOCATION_CACHE_DURATION;
  }

  isWeatherCacheValid() {
    return this.cache.weather && 
           this.cache.timestamp && 
           (Date.now() - this.cache.timestamp) < this.CACHE_DURATION;
  }

  getCachedData() {
    return {
      weather: this.cache.weather,
      news: this.cache.news || this.getDefaultNewsData(),
      location: this.cache.location,
      timestamp: new Date().toISOString(),
      fromCache: true
    };
  }

  updateCache(data) {
    this.cache = {
      location: data.location,
      weather: data.weather,
      news: data.news,
      timestamp: Date.now()
    };
  }

  // 🆕 获取默认完整数据
  getDefaultCompleteData() {
    return {
      weather: this.getDefaultWeatherData(),
      news: this.getDefaultNewsData(),
      location: {
        latitude: 22.346151,
        longitude: 114.189330,
        accuracy: 100,
        timestamp: Date.now(),
        isDefault: true,
        address: {
          city: '黃大仙',
          region: '九龍',
          country: '中國香港特別行政區',
          full: '黃大仙, 九龍, 中國香港特別行政區'
        }
      },
      timestamp: new Date().toISOString(),
      isError: false,
      isDefault: true
    };
  }

  // 🆕 设置更新回调
  setUpdateCallbacks(callbacks) {
    this.onDataUpdated = callbacks?.onDataUpdated;
    this.onLocationUpdated = callbacks?.onLocationUpdated;
    this.onWeatherUpdated = callbacks?.onWeatherUpdated;
    this.onNewsUpdated = callbacks?.onNewsUpdated;
  }

  // 🆕 清除缓存
  clearCache() {
    this.cache = {
      location: null,
      weather: null,
      news: null,
      timestamp: null
    };
    console.log('🗑️ Cache cleared');
  }

  // 🆕 获取缓存状态
  getCacheStatus() {
    return {
      hasCache: !!this.cache.timestamp,
      isValid: this.isCacheValid(),
      age: this.cache.timestamp ? Date.now() - this.cache.timestamp : 0,
      ageInMinutes: this.cache.timestamp ? Math.floor((Date.now() - this.cache.timestamp) / (1000 * 60)) : 0,
      location: !!this.cache.location,
      weather: !!this.cache.weather,
      news: !!this.cache.news
    };
  }

  // 🆕 预加载数据（可在应用启动时调用）
  async preloadData() {
    try {
      console.log('🚀 Preloading data...');
      const data = await this.getContextualLearningFast();
      console.log('✅ Preloading completed');
      return data;
    } catch (error) {
      console.error('Preloading failed:', error);
      return null;
    }
  }

  // 🔧 修改原有方法使用快速加载
  async getContextualLearning() {
    return this.getContextualLearningFast();
  }

  // 獲取所有情境化學習內容（原有方法，保持兼容性）
  async getContextualLearningData() {
    try {
      console.log('🌍 Starting to get contextual learning content...');
      
      const [weatherData, newsData] = await Promise.allSettled([
        this.getWeatherData(),
        this.getNewsData()
      ]);

      // 處理天氣數據結果
      const weatherResult = weatherData.status === 'fulfilled' && weatherData.value 
        ? weatherData.value 
        : this.getDefaultWeatherData();

      // 處理新聞數據結果
      const newsResult = newsData.status === 'fulfilled' && newsData.value 
        ? newsData.value 
        : this.getDefaultNewsData();

      console.log('✅ Data retrieval completed');
      
      // 確保返回的對象結構正確
      const result = {
        weather: weatherResult || this.getDefaultWeatherData(),
        news: newsResult || this.getDefaultNewsData(),
        location: await this.getLocationData(),
        timestamp: new Date().toISOString()
      };

      console.log('📦 Returning contextual learning data:', {
        hasWeather: !!result.weather,
        hasNews: !!result.news,
        hasLocation: !!result.location
      });

      return result;
    } catch (error) {
      console.error('Failed to get contextual learning content:', error);
      
      // 返回默認數據確保應用正常運行
      return {
        weather: this.getDefaultWeatherData(),
        news: this.getDefaultNewsData(),
        location: null,
        timestamp: new Date().toISOString(),
        isError: true
      };
    }
  }

  // 添加另一個可能被調用的方法名
  async getContextualData() {
    return this.getContextualLearningFast();
  }

  // 添加簡化版本的獲取方法
  async getWeatherLearning() {
    try {
      const weatherData = await this.getWeatherData();
      return weatherData;
    } catch (error) {
      console.error('Failed to get weather learning data:', error);
      return this.getDefaultWeatherData();
    }
  }

  // 添加新聞學習方法
  async getNewsLearning() {
    try {
      const newsData = await this.getNewsData();
      return newsData;
    } catch (error) {
      console.error('Failed to get news learning data:', error);
      return this.getDefaultNewsData();
    }
  }

  // 獲取位置數據
  async getLocationData() {
    try {
      const location = await this.locationService.getCurrentLocation();
      const address = await this.locationService.getAddressFromCoordinates(
        location.latitude, 
        location.longitude
      );
      
      const locationData = {
        ...location,
        address
      };
      
      console.log('📍 Location data:', locationData);
      return locationData;
    } catch (error) {
      console.error('Failed to get location:', error);
      return null;
    }
  }

  // 獲取天氣數據
  async getWeatherData() {
    try {
      const location = await this.getLocationData();
      if (!location) {
        throw new Error('Unable to get location information');
      }
      
      const [currentWeather, forecast] = await Promise.all([
        this.weatherService.getCurrentWeather(location.latitude, location.longitude),
        this.weatherService.getWeatherForecast(location.latitude, location.longitude)
      ]);

      // 確保currentWeather存在才生成學習內容
      let learningContent = null;
      if (currentWeather) {
        learningContent = this.weatherService.generateWeatherLearningContent(currentWeather);
      }
      
      const weatherData = {
        weatherData: currentWeather || this.weatherService.getMockWeatherData(),
        forecast: forecast || this.weatherService.getMockForecastData(),
        learning: learningContent || this.weatherService.getDefaultLearningContent()
      };
      
      console.log('🌤️ Weather data:', weatherData.weatherData);
      
      return weatherData;
    } catch (error) {
      console.error('Failed to get weather:', error);
      return this.getDefaultWeatherData();
    }
  }

  // 獲取新聞數據 - 增强版
  async getNewsData() {
    try {
      const location = await this.getLocationData();
      
      const [topNews, localNews, techNews] = await Promise.allSettled([
        this.newsService.getTopHeadlinesAdvanced({
          country: 'us',
          category: 'general',
          pageSize: 10
        }),
        location ? this.newsService.getLocalNewsAdvanced(location, {
          sortBy: 'publishedAt',
          pageSize: 5
        }) : Promise.resolve([]),
        this.newsService.getTechNewsForLearning() // 添加科技新聞
      ]);

      const topNewsResult = topNews.status === 'fulfilled' ? topNews.value : [];
      const localNewsResult = localNews.status === 'fulfilled' ? localNews.value : [];
      const techNewsResult = techNews.status === 'fulfilled' ? techNews.value : [];
      
      const newsData = {
        topNews: Array.isArray(topNewsResult) ? topNewsResult : [],
        local: Array.isArray(localNewsResult) ? localNewsResult : [],
        tech: Array.isArray(techNewsResult) ? techNewsResult.slice(0, 3) : [], // 科技新聞
        stats: await this.newsService.getNewsStats() // 新聞統計
      };
      
      console.log('📰 News data:', {
        topNews: newsData.topNews.length,
        local: newsData.local.length,
        tech: newsData.tech.length
      });
      
      return newsData;
    } catch (error) {
      console.error('Failed to get news:', error);
      return this.getDefaultNewsData();
    }
  }

  // 默認天氣數據
  getDefaultWeatherData() {
    const mockWeather = this.weatherService.getMockWeatherData();
    const mockForecast = this.weatherService.getMockForecastData();
    const defaultLearning = this.weatherService.getDefaultLearningContent();
    
    return {
      weatherData: mockWeather,
      forecast: mockForecast,
      learning: defaultLearning
    };
  }

  // 默認新聞數據
  getDefaultNewsData() {
    return {
      topNews: [
        {
          id: 'default-1',
          title: 'Weather Learning with Technology',
          description: 'Learning English through contextual weather information.',
          category: 'Education',
          isLocal: false,
          vocabulary: [
            {
              word: 'technology',
              chinese: '科技',
              level: 'beginner',
              category: 'Technology'
            },
            {
              word: 'learning',
              chinese: '學習',
              level: 'beginner',
              category: 'Education'
            }
          ]
        },
        {
          id: 'default-2',
          title: 'Language Learning Apps Grow Popular',
          description: 'Mobile applications for language learning see increased usage.',
          category: 'Technology',
          isLocal: false,
          vocabulary: [
            {
              word: 'mobile',
              chinese: '移動的',
              level: 'beginner',
              category: 'Technology'
            },
            {
              word: 'application',
              chinese: '應用程序',
              level: 'intermediate',
              category: 'Technology'
            }
          ]
        }
      ],
      local: [],
      tech: [],
      stats: {
        totalCategories: 7,
        supportedCountries: 54,
        apiAvailable: false,
        apiStatus: 'Mock Data',
        lastUpdate: new Date().toISOString()
      }
    };
  }

  // 生成基於情境的學習建議
  generateContextualRecommendations(weatherData, newsData, location) {
    const recommendations = [];
    
    try {
      // 基於天氣的學習建議
      if (weatherData && weatherData.weatherData) {
        const weather = weatherData.weatherData;
        
        if (weather.main === 'Rain') {
          recommendations.push({
            type: 'weather',
            title: 'Rainy Day Learning',
            suggestion: 'Perfect time for indoor English study! Learn weather-related vocabulary.',
            vocabulary: ['umbrella', 'raincoat', 'indoor', 'cozy', 'study']
          });
        } else if (weather.main === 'Clear') {
          recommendations.push({
            type: 'weather',
            title: 'Sunny Day Activities',
            suggestion: 'Great weather for outdoor vocabulary practice!',
            vocabulary: ['sunshine', 'outdoor', 'bright', 'activity', 'fresh air']
          });
        }
      }

      // 基於位置的學習建議
      if (location && location.address) {
        recommendations.push({
          type: 'location',
          title: 'Local Area Vocabulary',
          suggestion: `Learn English words related to ${location.address.city}`,
          vocabulary: ['city', 'district', 'neighborhood', 'local', 'area']
        });
      }

      // 基於新聞的學習建議
      if (newsData && newsData.topNews && newsData.topNews.length > 0) {
        recommendations.push({
          type: 'news',
          title: 'Current Events English',
          suggestion: 'Stay updated with English news vocabulary',
          vocabulary: ['current', 'events', 'news', 'headline', 'article']
        });
      }

      // 基於科技新聞的建議
      if (newsData && newsData.tech && newsData.tech.length > 0) {
        recommendations.push({
          type: 'technology',
          title: 'Technology Vocabulary',
          suggestion: 'Learn modern tech terms from current news',
          vocabulary: ['technology', 'digital', 'innovation', 'artificial', 'intelligence']
        });
      }

    } catch (error) {
      console.error('Failed to generate learning suggestions:', error);
    }

    return recommendations.length > 0 ? recommendations : [{
      type: 'default',
      title: 'Daily English Practice',
      suggestion: 'Continue your English learning journey with daily practice!',
      vocabulary: ['practice', 'daily', 'learning', 'english', 'study']
    }];
  }

  // 檢查服務健康狀態
  async checkServiceHealth() {
    const health = {
      location: false,
      weather: false,
      news: false,
      timestamp: new Date().toISOString()
    };

    try {
      // 檢查位置服務
      const location = await this.locationService.getCurrentLocation();
      health.location = !!location;
    } catch (error) {
      console.warn('Location service unavailable:', error.message);
    }

    try {
      // 檢查天氣服務
      const weatherTest = await this.weatherService.testAPIConnection();
      health.weather = weatherTest;
    } catch (error) {
      console.warn('Weather service unavailable:', error.message);
    }

    try {
      // 檢查新聞服務
      const newsTest = await this.newsService.testAPIConnection();
      health.news = newsTest.success;
    } catch (error) {
      console.warn('News service unavailable:', error.message);
    }

    console.log('🏥 Service health check:', health);
    return health;
  }

  // 添加可能被調用的其他方法名
  async loadContextualData() {
    return this.getContextualLearningFast();
  }

  async initialize() {
    console.log('🚀 Initializing contextual learning service...');
    return this.checkServiceHealth();
  }

  // 添加靜態方法支持
  static async getInstance() {
    return new ContextualLearningService();
  }

  // 獲取學習統計
  async getLearningStats() {
    try {
      const [weatherData, newsData, healthCheck] = await Promise.all([
        this.getWeatherData(),
        this.getNewsData(),
        this.checkServiceHealth()
      ]);

      const stats = {
        totalVocabulary: 0,
        categoriesCovered: new Set(),
        servicesActive: 0,
        dataFreshness: new Date(),
        recommendations: []
      };

      // 統計天氣詞彙
      if (weatherData?.learning?.vocabulary) {
        stats.totalVocabulary += weatherData.learning.vocabulary.length;
        weatherData.learning.vocabulary.forEach(word => {
          if (word.category) stats.categoriesCovered.add(word.category);
        });
      }

      // 統計新聞詞彙
      if (newsData?.topNews) {
        newsData.topNews.forEach(article => {
          if (article.vocabulary) {
            stats.totalVocabulary += article.vocabulary.length;
            article.vocabulary.forEach(word => {
              if (word.category) stats.categoriesCovered.add(word.category);
            });
          }
        });
      }

      // 檢查服務狀態
      stats.servicesActive = Object.values(healthCheck).filter(status => status === true).length;
      stats.categoriesCovered = Array.from(stats.categoriesCovered);

      console.log('📊 Learning statistics:', stats);
      return stats;
    } catch (error) {
      console.error('Failed to get learning statistics:', error);
      return {
        totalVocabulary: 0,
        categoriesCovered: [],
        servicesActive: 0,
        dataFreshness: new Date(),
        recommendations: []
      };
    }
  }

  // 獲取個性化學習建議
  async getPersonalizedRecommendations() {
    try {
      const [weatherData, newsData, location] = await Promise.all([
        this.getWeatherData(),
        this.getNewsData(),
        this.getLocationData()
      ]);

      return this.generateContextualRecommendations(weatherData, newsData, location);
    } catch (error) {
      console.error('Failed to get personalized recommendations:', error);
      return [{
        type: 'default',
        title: 'Daily English Practice',
        suggestion: 'Keep practicing English every day!',
        vocabulary: ['practice', 'daily', 'study', 'improve', 'learn']
      }];
    }
  }

  // 測試所有服務連接
  async testAllServices() {
    console.log('🧪 Testing all service connections...');
    
    const results = {
      location: { success: false, error: null },
      weather: { success: false, error: null },
      news: { success: false, error: null }
    };

    // 測試位置服務
    try {
      const location = await this.locationService.getCurrentLocation();
      results.location.success = !!location;
    } catch (error) {
      results.location.error = error.message;
    }

    // 測試天氣服務
    try {
      const weatherTest = await this.weatherService.testAPIConnection();
      results.weather.success = weatherTest;
    } catch (error) {
      results.weather.error = error.message;
    }

    // 測試新聞服務
    try {
      const newsTest = await this.newsService.testAPIConnection();
      results.news.success = newsTest.success;
      results.news.error = newsTest.error;
    } catch (error) {
      results.news.error = error.message;
    }

    console.log('🧪 Service test results:', results);
    return results;
  }
}

export default ContextualLearningService;
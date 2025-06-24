import axios from 'axios';

class WeatherService {
  constructor() {
    // ✅ Using your new API key
    this.API_KEY = '66494bfe24904b9d59b94693030dade2';
    this.BASE_URL = 'https://api.openweathermap.org/data/2.5';
    
    console.log('🌤️ Weather service initialized, new API key set');
  }

  // Test API connection
  async testAPIConnection() {
    try {
      console.log('🧪 Testing new OpenWeather API key...');
      const testUrl = `${this.BASE_URL}/weather?q=London,uk&APPID=${this.API_KEY}&units=metric`;
      
      const response = await axios.get(testUrl);
      console.log('✅ API test successful! Status:', response.status);
      console.log('🌤️ Test data:', response.data.name, response.data.main.temp + '°C');
      return true;
    } catch (error) {
      console.error('❌ API test failed:', error.response?.status, error.response?.data);
      return false;
    }
  }

  // Get current weather by coordinates
  async getCurrentWeather(latitude, longitude) {
    try {
      console.log(`🌤️ Requesting weather data: lat=${latitude}, lon=${longitude}`);
      console.log(`🔑 Using API key: ${this.API_KEY}`);
      
      const response = await axios.get(`${this.BASE_URL}/weather`, {
        params: {
          lat: latitude,
          lon: longitude,
          appid: this.API_KEY,
          units: 'metric',
          lang: 'en'
        }
      });

      console.log('✅ Weather API response successful!');
      console.log('🌤️ Weather data:', response.data.name, response.data.weather[0].description, response.data.main.temp + '°C');
      
      const weather = response.data;
      return this.processWeatherData(weather);
    } catch (error) {
      console.error('🌤️ Failed to get weather:', error.response?.status || 'Unknown', error.response?.data?.message || error.message);
      
      if (error.response?.status === 401) {
        console.warn('🔑 API authentication failed - key may not be activated yet');
        console.warn('⏰ Please wait a few hours for API key activation');
      } else if (error.response?.status === 429) {
        console.warn('📊 API call limit exceeded - free plan allows 1000 calls per day');
      }
      
      // Return mock data when API fails
      return this.getMockWeatherData();
    }
  }

  // Get 5-day weather forecast
  async getWeatherForecast(latitude, longitude) {
    try {
      console.log(`🌤️ Requesting 5-day weather forecast: lat=${latitude}, lon=${longitude}`);
      
      // Free plan uses 5-day/3-hour forecast
      const response = await axios.get(`${this.BASE_URL}/forecast`, {
        params: {
          lat: latitude,
          lon: longitude,
          appid: this.API_KEY,
          units: 'metric',
          lang: 'en'
        }
      });

      console.log('✅ Weather forecast API response successful!');
      const forecast = response.data;
      return {
        city: forecast.city.name,
        country: forecast.city.country,
        forecast: this.processForecastData(forecast.list)
      };
    } catch (error) {
      console.error('🌤️ Failed to get weather forecast:', error.response?.status || 'Unknown', error.response?.data?.message || error.message);
      return this.getMockForecastData();
    }
  }

  // Process weather data
  processWeatherData(weather) {
    return {
      temperature: Math.round(weather.main.temp),
      feelsLike: Math.round(weather.main.feels_like),
      humidity: weather.main.humidity,
      pressure: weather.main.pressure,
      visibility: weather.visibility,
      windSpeed: weather.wind?.speed || 0,
      windDirection: weather.wind?.deg || 0,
      description: weather.weather[0].description,
      main: weather.weather[0].main,
      icon: weather.weather[0].icon,
      sunrise: new Date(weather.sys.sunrise * 1000),
      sunset: new Date(weather.sys.sunset * 1000),
      location: {
        name: weather.name,
        country: weather.sys.country
      },
      isSimulated: false
    };
  }

  // Process forecast data (take one representative data per day)
  processForecastData(forecastList) {
    const dailyData = {};
    
    forecastList.forEach(item => {
      const date = new Date(item.dt * 1000).toDateString();
      
      // Only keep the first forecast of each day (usually 12pm)
      if (!dailyData[date]) {
        dailyData[date] = {
          date: new Date(item.dt * 1000),
          temperature: Math.round(item.main.temp),
          description: item.weather[0].description,
          main: item.weather[0].main,
          icon: item.weather[0].icon,
          humidity: item.main.humidity,
          windSpeed: item.wind?.speed || 0
        };
      }
    });
    
    return Object.values(dailyData).slice(0, 5); // Return 5-day forecast
  }

  // Mock weather data
  getMockWeatherData() {
    console.log('🎭 Using mock weather data (API key may not be activated yet)');
    return {
      temperature: 26,
      feelsLike: 29,
      humidity: 68,
      pressure: 1015,
      visibility: 10000,
      windSpeed: 2.1,
      windDirection: 90,
      description: 'partly cloudy',
      main: 'Clouds',
      icon: '02d',
      sunrise: new Date(),
      sunset: new Date(),
      location: {
        name: '黃大仙',
        country: 'HK'
      },
      isSimulated: true
    };
  }

  // Mock forecast data
  getMockForecastData() {
    console.log('🎭 Using mock forecast data');
    const today = new Date();
    const forecast = [];
    
    for (let i = 1; i <= 5; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      forecast.push({
        date,
        temperature: Math.round(24 + Math.random() * 6), // 24-30 degrees
        description: ['partly cloudy', 'sunny', 'light rain', 'cloudy', 'clear sky'][Math.floor(Math.random() * 5)],
        main: ['Clouds', 'Clear', 'Rain', 'Clouds', 'Clear'][Math.floor(Math.random() * 5)],
        icon: ['02d', '01d', '10d', '03d', '01d'][Math.floor(Math.random() * 5)],
        humidity: Math.round(60 + Math.random() * 20),
        windSpeed: Math.round((1 + Math.random() * 3) * 10) / 10
      });
    }
    
    return {
      city: '黃大仙',
      country: 'HK',
      forecast
    };
  }

  // Generate weather learning content
  generateWeatherLearningContent(weatherData) {
    try {
      console.log('📚 Generating weather learning content...');
      
      const weatherCondition = weatherData.main.toLowerCase();
      const temperature = weatherData.temperature;
      const description = weatherData.description;
      
      // Basic weather vocabulary
      const weatherVocabulary = {
        'clear': ['sunny', 'bright', 'cloudless', 'blue sky', 'sunshine'],
        'clouds': ['cloudy', 'overcast', 'grey sky', 'partly cloudy', 'scattered clouds'],
        'rain': ['rainy', 'drizzle', 'shower', 'precipitation', 'wet'],
        'snow': ['snowy', 'blizzard', 'snowfall', 'white', 'freezing'],
        'thunderstorm': ['stormy', 'thunder', 'lightning', 'heavy rain', 'windy'],
        'mist': ['foggy', 'misty', 'hazy', 'low visibility', 'damp'],
        'drizzle': ['light rain', 'sprinkle', 'mist', 'fine rain', 'gentle rain']
      };

      // Temperature-related vocabulary
      const temperatureVocabulary = [];
      if (temperature < 10) {
        temperatureVocabulary.push('cold', 'chilly', 'freezing', 'winter coat', 'warm clothes');
      } else if (temperature < 20) {
        temperatureVocabulary.push('cool', 'mild', 'light jacket', 'comfortable', 'pleasant');
      } else if (temperature < 30) {
        temperatureVocabulary.push('warm', 'nice', 'spring weather', 't-shirt', 'comfortable');
      } else {
        temperatureVocabulary.push('hot', 'sweltering', 'summer heat', 'shorts', 'air conditioning');
      }

      // Activity suggestion vocabulary
      const activityVocabulary = [];
      if (weatherCondition.includes('rain')) {
        activityVocabulary.push('umbrella', 'indoor activities', 'staying home', 'waterproof jacket', 'raincoat');
      } else if (weatherCondition.includes('clear') || weatherCondition.includes('sun')) {
        activityVocabulary.push('outdoor sports', 'picnic', 'sunglasses', 'beach', 'hiking');
      } else if (weatherCondition.includes('cloud')) {
        activityVocabulary.push('walking', 'sightseeing', 'photography', 'light jacket', 'outdoor activities');
      }

      // Generate learning cards
      const learningCards = [];
      
      // Current weather description card
      learningCards.push({
        id: 'current-weather',
        type: 'weather_description',
        title: 'Current Weather',
        english: `It's ${description} today`,
        chinese: `今天${this.translateWeatherToChinese(description)}`,
        pronunciation: '/ɪts ' + this.getWeatherPronunciation(description) + ' təˈdeɪ/',
        category: 'Weather Description',
        difficulty: 'easy'
      });

      // Temperature description card
      learningCards.push({
        id: 'temperature',
        type: 'temperature',
        title: 'Temperature',
        english: `The temperature is ${temperature} degrees Celsius`,
        chinese: `溫度是攝氏${temperature}度`,
        pronunciation: `/ðə ˈtɛmpərɪʧər ɪz ${temperature} dɪˈgriz ˈsɛlsiəs/`,
        category: 'Weather Measurement',
        difficulty: 'medium'
      });

      // Add related vocabulary
      const currentWeatherWords = weatherVocabulary[weatherCondition] || ['weather', 'climate', 'condition'];
      currentWeatherWords.slice(0, 3).forEach((word, index) => {
        learningCards.push({
          id: `weather-vocab-${index}`,
          type: 'vocabulary',
          title: 'Weather Vocabulary',
          english: word,
          chinese: this.translateWeatherToChinese(word),
          pronunciation: this.getWeatherPronunciation(word),
          category: 'Weather Vocabulary',
          difficulty: 'easy'
        });
      });

      // Add temperature-related vocabulary
      temperatureVocabulary.slice(0, 2).forEach((word, index) => {
        learningCards.push({
          id: `temp-vocab-${index}`,
          type: 'vocabulary',
          title: 'Temperature Vocabulary',
          english: word,
          chinese: this.translateWeatherToChinese(word),
          pronunciation: this.getWeatherPronunciation(word),
          category: 'Temperature',
          difficulty: 'easy'
        });
      });

      // Generate dialogue practice
      const dialogues = [
        {
          id: 'weather-chat',
          type: 'dialogue',
          title: 'Weather Conversation',
          conversation: [
            {
              speaker: 'A',
              english: 'How\'s the weather today?',
              chinese: '今天天氣怎麼樣？'
            },
            {
              speaker: 'B',
              english: `It's ${description} and ${temperature} degrees.`,
              chinese: `${this.translateWeatherToChinese(description)}，${temperature}度。`
            },
            {
              speaker: 'A',
              english: weatherCondition.includes('rain') ? 'Don\'t forget your umbrella!' : 'Perfect for outdoor activities!',
              chinese: weatherCondition.includes('rain') ? '別忘了帶傘！' : '很適合戶外活動！'
            }
          ],
          category: 'Daily Conversation',
          difficulty: 'medium'
        }
      ];

      console.log('✅ Weather learning content generation completed, total', learningCards.length, 'learning cards');
      
      return {
        vocabulary: learningCards,
        dialogues,
        weatherInfo: {
          condition: weatherCondition,
          temperature,
          description,
          isRealData: !weatherData.isSimulated
        }
      };
    } catch (error) {
      console.error('❌ Failed to generate learning content:', error);
      return this.getDefaultLearningContent();
    }
  }

  // Translate weather vocabulary to Chinese
  translateWeatherToChinese(word) {
    const translations = {
      'sunny': '晴朗',
      'cloudy': '多雲',
      'partly cloudy': '局部多雲',
      'overcast': '陰天',
      'rainy': '下雨',
      'light rain': '小雨',
      'heavy rain': '大雨',
      'drizzle': '毛毛雨',
      'snow': '下雪',
      'foggy': '有霧',
      'windy': '有風',
      'hot': '炎熱',
      'warm': '溫暖',
      'cool': '涼爽',
      'cold': '寒冷',
      'mild': '溫和',
      'freezing': '冰凍',
      'bright': '明亮',
      'clear sky': '晴空',
      'blue sky': '藍天',
      'grey sky': '灰天',
      'umbrella': '雨傘',
      'raincoat': '雨衣',
      'sunglasses': '太陽眼鏡',
      'jacket': '外套',
      't-shirt': 'T恤'
    };
    
    return translations[word.toLowerCase()] || word;
  }

  // Get weather vocabulary pronunciation
  getWeatherPronunciation(word) {
    const pronunciations = {
      'sunny': '/ˈsʌni/',
      'cloudy': '/ˈklaʊdi/',
      'rainy': '/ˈreɪni/',
      'windy': '/ˈwɪndi/',
      'hot': '/hɒt/',
      'cold': '/koʊld/',
      'warm': '/wɔrm/',
      'cool': '/kul/',
      'weather': '/ˈwɛðər/',
      'temperature': '/ˈtɛmpərɪʧər/'
    };
    
    return pronunciations[word.toLowerCase()] || `/${word}/`;
  }

  // Default learning content
  getDefaultLearningContent() {
    return {
      vocabulary: [
        {
          id: 'default-weather',
          type: 'vocabulary',
          title: 'Basic Weather',
          english: 'weather',
          chinese: '天氣',
          pronunciation: '/ˈwɛðər/',
          category: 'Weather',
          difficulty: 'easy'
        }
      ],
      dialogues: [],
      weatherInfo: {
        condition: 'unknown',
        temperature: 25,
        description: 'pleasant weather',
        isRealData: false
      }
    };
  }

  // Get Material Icons name corresponding to weather icon
  getWeatherIcon(condition) {
    const iconMap = {
      'Clear': 'wb-sunny',
      'Clouds': 'wb-cloudy',
      'Rain': 'umbrella',
      'Drizzle': 'grain',
      'Thunderstorm': 'flash-on',
      'Snow': 'ac-unit',
      'Mist': 'blur-on',
      'Fog': 'blur-on',
      'Haze': 'blur-on'
    };
    
    return iconMap[condition] || 'wb-sunny';
  }
}

export default WeatherService;
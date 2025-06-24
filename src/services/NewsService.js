import axios from 'axios';

class NewsService {
  constructor() {
   
    this.API_KEY = '';
    this.BASE_URL = 'https://newsapi.org/v2';
  }


  async getTopHeadlines(country = 'us', category = 'general') {
    try {
     
      if (!this.API_KEY || this.API_KEY === 'YOUR_NEWS_API_KEY_HERE') {
        console.warn('📰 NewsAPI key not set, using mock data');
        return this.getMockNews();
      }

      const response = await axios.get(`${this.BASE_URL}/top-headlines`, {
        params: {
          country: this.getCountryCode(country),
          category,
          apiKey: this.API_KEY,
          pageSize: 10
        }
      });

      const articles = response.data.articles;
      return this.processNewsData(articles, false); 
    } catch (error) {
      console.error('📰 Failed to get news:', error.response?.status, error.response?.data?.message);
      
      // Provide different handling based on error type
      if (error.response?.status === 401) {
        console.warn('🔑 NewsAPI authentication failed, please check API key');
      } else if (error.response?.status === 429) {
        console.warn('📊 NewsAPI quota exhausted, try again later today');
      }
      
    
      return this.getMockNews();
    }
  }


  async getTopHeadlinesAdvanced(options = {}) {
    try {
      if (!this.API_KEY || this.API_KEY === 'YOUR_NEWS_API_KEY_HERE') {
        console.warn('📰 NewsAPI key not set, using mock data');
        return this.getMockNews();
      }

      console.log('📰 Getting advanced headlines:', options);

      const response = await axios.get(`${this.BASE_URL}/top-headlines`, {
        params: {
          country: options.country || 'us',
          category: options.category || 'general',
          sources: options.sources, 
          q: options.query, 
          apiKey: this.API_KEY,
          pageSize: options.pageSize || 20
        }
      });

      const articles = response.data.articles;
      console.log('✅ Got headlines:', articles.length, 'articles');
      return this.processNewsData(articles, false);
    } catch (error) {
      console.error('📰 Failed to get advanced headlines:', error.response?.status, error.response?.data?.message);
      
      if (error.response?.status === 401) {
        console.warn('🔑 NewsAPI authentication failed, please check API key');
      } else if (error.response?.status === 429) {
        console.warn('📊 NewsAPI quota exhausted, try again later today');
      }
      
      return this.getMockNews();
    }
  }

  
  async getLocalNews(location) {
    try {
      // Check API key
      if (!this.API_KEY || this.API_KEY === 'YOUR_NEWS_API_KEY_HERE') {
        console.warn('📰 NewsAPI key not set, using mock local news');
        return this.getMockLocalNews(location);
      }

      const query = location.address?.city || location.address?.region || 'Hong Kong';
      console.log('🌍 Searching local news:', query);
      
      const response = await axios.get(`${this.BASE_URL}/everything`, {
        params: {
          q: query,
          sortBy: 'publishedAt',
          language: 'en',
          apiKey: this.API_KEY,
          pageSize: 5
        }
      });

      const articles = response.data.articles;
      return this.processNewsData(articles, true);
    } catch (error) {
      console.error('📰 Failed to get local news:', error.response?.status, error.response?.data?.message);
      return this.getMockLocalNews(location);
    }
  }

 
  async getLocalNewsAdvanced(location, options = {}) {
    try {
      if (!this.API_KEY || this.API_KEY === 'YOUR_NEWS_API_KEY_HERE') {
        console.warn('📰 NewsAPI key not set, using mock local news');
        return this.getMockLocalNews(location);
      }

      const query = location.address?.city || location.address?.region || 'Hong Kong';
      
      // Use date range to get news from last 7 days
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - 7);
      const fromDateString = fromDate.toISOString().split('T')[0];
      
      console.log('🌍 Searching local news (advanced):', {
        query,
        from: fromDateString,
        sortBy: options.sortBy || 'publishedAt'
      });
      
      const response = await axios.get(`${this.BASE_URL}/everything`, {
        params: {
          q: `"${query}" OR "${query} news" OR "${query} local"`, 
          from: fromDateString, 
          sortBy: options.sortBy || 'publishedAt', 
          language: 'en',
          apiKey: this.API_KEY,
          pageSize: options.pageSize || 10,
          domains: options.localDomains || this.getLocalNewsDomains(location) 
        }
      });

      console.log('📰 Got local news:', response.data.articles.length, 'articles');
      const articles = response.data.articles;
      return this.processNewsData(articles, true);
    } catch (error) {
      console.error('📰 Failed to get advanced local news:', error.response?.status, error.response?.data?.message);
      return this.getMockLocalNews(location);
    }
  }

  
  getLocalNewsDomains(location) {
    const city = location?.address?.city?.toLowerCase();
    const country = location?.address?.country?.toLowerCase();
    
    // Hong Kong local news domains
    if (city?.includes('香港') || city?.includes('hong kong') || country?.includes('hong kong')) {
      return 'scmp.com,hk01.com,thestandard.com.hk,news.rthk.hk';
    }
    
    // Taiwan local news domains
    if (country?.includes('taiwan') || country?.includes('台灣')) {
      return 'taipeitimes.com,focustaiwan.tw,chinapost.com.tw';
    }
    
    // Singapore local news domains
    if (city?.includes('singapore') || city?.includes('新加坡')) {
      return 'straitstimes.com,channelnewsasia.com,todayonline.com';
    }
    
    // Default to major English news sources
    return 'reuters.com,bbc.com,cnn.com,associated-press.com';
  }

 
  async searchNewsByTopic(topic, options = {}) {
    try {
      if (!this.API_KEY || this.API_KEY === 'YOUR_NEWS_API_KEY_HERE') {
        console.warn('📰 NewsAPI key not set, using mock data');
        return this.getMockNewsByTopic(topic);
      }

     
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - (options.daysBack || 30));
      const fromDateString = fromDate.toISOString().split('T')[0];

      console.log('🔍 Searching news by topic:', {
        topic,
        from: fromDateString,
        sortBy: options.sortBy || 'popularity'
      });

      const response = await axios.get(`${this.BASE_URL}/everything`, {
        params: {
          q: topic,
          from: fromDateString,
          sortBy: options.sortBy || 'popularity', 
          language: options.language || 'en',
          domains: options.domains, 
          excludeDomains: options.excludeDomains, 
          apiKey: this.API_KEY,
          pageSize: options.pageSize || 15
        }
      });

      const articles = response.data.articles;
      console.log('🔍 Found news by topic:', articles.length, 'articles');
      return this.processNewsData(articles, false);
    } catch (error) {
      console.error('🔍 Failed to search news by topic:', error.response?.status, error.response?.data?.message);
      return this.getMockNewsByTopic(topic);
    }
  }

  async getTechNewsForLearning() {
    return this.searchNewsByTopic('technology OR AI OR "artificial intelligence" OR startup OR innovation', {
      sortBy: 'popularity',
      daysBack: 7,
      pageSize: 10,
      domains: 'techcrunch.com,arstechnica.com,theverge.com,wired.com,engadget.com'
    });
  }

  async getBusinessNewsForLearning() {
    return this.searchNewsByTopic('business OR economy OR market OR finance OR investment', {
      sortBy: 'popularity',
      daysBack: 7,
      pageSize: 10,
      domains: 'bloomberg.com,reuters.com,wsj.com,ft.com,cnbc.com'
    });
  }

  async getEnvironmentNewsForLearning() {
    return this.searchNewsByTopic('climate OR environment OR sustainability OR "renewable energy" OR pollution', {
      sortBy: 'popularity',
      daysBack: 14,
      pageSize: 8,
      domains: 'bbc.com,nationalgeographic.com,theguardian.com'
    });
  }
  

  processNewsData(articles, isLocal = false) {
    return articles
      .filter(article => article.title && article.description)
      .map(article => ({
        id: article.url || Math.random().toString(),
        title: article.title,
        description: article.description,
        url: article.url,
        urlToImage: article.urlToImage,
        publishedAt: new Date(article.publishedAt),
        source: article.source.name,
        isLocal: isLocal, // Local news identifier
        category: this.categorizeNews(article.title, article.description), 
        vocabulary: this.extractAdvancedVocabulary(article),
        keyWords: this.extractKeyWords(article.title + ' ' + article.description), 
        keyPhrases: this.extractKeyPhrases(article)
      }));
  }

  extractAdvancedVocabulary(article) {
    const text = `${article.title} ${article.description}`.toLowerCase();
    const vocabulary = [];


    const newsVocabulary = {
  
      'government': {
        chinese: '政府',
        category: 'Politics',
        difficulty: 'intermediate',
        pronunciation: '/ˈɡʌvərnmənt/',
        definition: 'The system by which a state or community is governed'
      },
      'policy': {
        chinese: '政策',
        category: 'Politics',
        difficulty: 'intermediate',
        pronunciation: '/ˈpɑːləsi/',
        definition: 'A course or principle of action adopted by a government'
      },
      'election': {
        chinese: '選舉',
        category: 'Politics',
        difficulty: 'intermediate',
        pronunciation: '/ɪˈlekʃn/',
        definition: 'A formal process of selecting a person for public office'
      },
      'democracy': {
        chinese: '民主',
        category: 'Politics',
        difficulty: 'advanced',
        pronunciation: '/dɪˈmɑːkrəsi/',
        definition: 'A system of government by the whole population'
      },
      
      // Economic vocabulary
      'economy': {
        chinese: '經濟',
        category: 'Business',
        difficulty: 'intermediate', 
        pronunciation: '/ɪˈkɑːnəmi/',
        definition: 'The state of a country in terms of production and consumption'
      },
      'business': {
        chinese: '商業',
        category: 'Business',
        difficulty: 'beginner',
        pronunciation: '/ˈbɪznəs/',
        definition: 'Commercial enterprise, especially as a means of livelihood'
      },
      'investment': {
        chinese: '投資',
        category: 'Business',
        difficulty: 'intermediate',
        pronunciation: '/ɪnˈvestmənt/',
        definition: 'The action of investing money for profit'
      },
      'market': {
        chinese: '市場',
        category: 'Business',
        difficulty: 'beginner',
        pronunciation: '/ˈmɑrkɪt/',
        definition: 'An area or arena in which commercial dealings are conducted'
      },
      'inflation': {
        chinese: '通脹',
        category: 'Business',
        difficulty: 'advanced',
        pronunciation: '/ɪnˈfleɪʃn/',
        definition: 'A general increase in prices and fall in purchasing value'
      },
      'financial': {
        chinese: '金融的',
        category: 'Business',
        difficulty: 'intermediate',
        pronunciation: '/faɪˈnænʃəl/',
        definition: 'Relating to money or how money is managed'
      },
      
      // Technology vocabulary
      'technology': {
        chinese: '科技',
        category: 'Technology',
        difficulty: 'beginner',
        pronunciation: '/tekˈnɑːlədʒi/',
        definition: 'The application of scientific knowledge for practical purposes'
      },
      'artificial': {
        chinese: '人工的',
        category: 'Technology',
        difficulty: 'intermediate',
        pronunciation: '/ˌɑːrtɪˈfɪʃl/',
        definition: 'Made or produced by human beings rather than occurring naturally'
      },
      'intelligence': {
        chinese: '智能',
        category: 'Technology',
        difficulty: 'intermediate',
        pronunciation: '/ɪnˈtelɪdʒəns/',
        definition: 'The ability to acquire and apply knowledge and skills'
      },
      'digital': {
        chinese: '數字的',
        category: 'Technology',
        difficulty: 'intermediate',
        pronunciation: '/ˈdɪdʒɪtəl/',
        definition: 'Relating to computer technology'
      },
      'innovation': {
        chinese: '創新',
        category: 'Technology',
        difficulty: 'advanced',
        pronunciation: '/ˌɪnəˈveɪʃən/',
        definition: 'The introduction of new ideas, methods, or things'
      },
      'algorithm': {
        chinese: '算法',
        category: 'Technology',
        difficulty: 'advanced',
        pronunciation: '/ˈælɡərɪðəm/',
        definition: 'A process or set of rules to be followed in calculations'
      },
      
      // Environment vocabulary
      'environment': {
        chinese: '環境',
        category: 'Environment',
        difficulty: 'intermediate',
        pronunciation: '/ɪnˈvaɪrənmənt/',
        definition: 'The surroundings in which an organism operates'
      },
      'climate': {
        chinese: '氣候',
        category: 'Environment',
        difficulty: 'intermediate',
        pronunciation: '/ˈklaɪmət/',
        definition: 'The weather conditions in an area over a long period'
      },
      'pollution': {
        chinese: '污染',
        category: 'Environment',
        difficulty: 'intermediate',
        pronunciation: '/pəˈluʃən/',
        definition: 'The presence of harmful substances in the environment'
      },
      'sustainable': {
        chinese: '可持續的',
        category: 'Environment',
        difficulty: 'advanced',
        pronunciation: '/səˈsteɪnəbl/',
        definition: 'Able to be maintained at a certain rate or level'
      },
      'renewable': {
        chinese: '可再生的',
        category: 'Environment',
        difficulty: 'advanced',
        pronunciation: '/rɪˈnuːəbəl/',
        definition: 'A source of energy that is not depleted when used'
      },
      
      // Health vocabulary
      'health': {
        chinese: '健康',
        category: 'Health',
        difficulty: 'beginner',
        pronunciation: '/helθ/',
        definition: 'The state of being free from illness or injury'
      },
      'medical': {
        chinese: '醫療的',
        category: 'Health',
        difficulty: 'intermediate',
        pronunciation: '/ˈmedɪkl/',
        definition: 'Relating to the science or practice of medicine'
      },
      'treatment': {
        chinese: '治療',
        category: 'Health',
        difficulty: 'intermediate',
        pronunciation: '/ˈtriːtmənt/',
        definition: 'The management and care of a patient to combat disease'
      },
      'vaccine': {
        chinese: '疫苗',
        category: 'Health',
        difficulty: 'intermediate',
        pronunciation: '/vækˈsiːn/',
        definition: 'A substance used to stimulate immunity against disease'
      },
      'pandemic': {
        chinese: '大流行',
        category: 'Health',
        difficulty: 'advanced',
        pronunciation: '/pænˈdemɪk/',
        definition: 'A disease prevalent over a whole country or the world'
      },
      
      // Education vocabulary
      'education': {
        chinese: '教育',
        category: 'Education',
        difficulty: 'beginner',
        pronunciation: '/ˌedʒuˈkeɪʃən/',
        definition: 'The process of receiving or giving systematic instruction'
      },
      'research': {
        chinese: '研究',
        category: 'Science',
        difficulty: 'intermediate',
        pronunciation: '/rɪˈsɜːrtʃ/',
        definition: 'The systematic investigation into a subject'
      },
      'university': {
        chinese: '大學',
        category: 'Education',
        difficulty: 'beginner',
        pronunciation: '/ˌjuːnɪˈvɜːrsəti/',
        definition: 'An institution of higher education and research'
      },
      
      // Social vocabulary
      'society': {
        chinese: '社會',
        category: 'Social',
        difficulty: 'intermediate',
        pronunciation: '/səˈsaɪəti/',
        definition: 'The community of people living in a particular region'
      },
      'community': {
        chinese: '社區',
        category: 'Social',
        difficulty: 'beginner',
        pronunciation: '/kəˈmjuːnəti/',
        definition: 'A group of people living in the same place'
      },
      'development': {
        chinese: '發展',
        category: 'Social',
        difficulty: 'intermediate',
        pronunciation: '/dɪˈveləpmənt/',
        definition: 'The process of developing or being developed'
      },
      'international': {
        chinese: '國際的',
        category: 'Politics',
        difficulty: 'intermediate',
        pronunciation: '/ˌɪntərˈnæʃənəl/',
        definition: 'Existing between or involving two or more countries'
      },
      'culture': {
        chinese: '文化',
        category: 'Social',
        difficulty: 'intermediate',
        pronunciation: '/ˈkʌltʃər/',
        definition: 'The ideas and social behavior of a particular people'
      }
    };

    // Check if news text contains these vocabulary words
    Object.entries(newsVocabulary).forEach(([word, info]) => {
      if (text.includes(word) && !vocabulary.find(v => v.word === word)) {
        vocabulary.push({
          word,
          chinese: info.chinese,
          category: info.category,
          level: info.difficulty, // Use level instead of difficulty for consistency
          pronunciation: info.pronunciation,
          definition: info.definition,
          context: 'News',
          example: this.generateExampleFromNews(word, article)
        });
      }
    });

    return vocabulary.slice(0, 5); // Return maximum 5 vocabulary words
  }

  // Extract keywords
  extractKeyWords(text) {
    if (!text) return [];
    
    // Remove common stop words
    const stopWords = ['the', 'is', 'at', 'which', 'on', 'and', 'a', 'to', 'as', 'are', 'was', 'will', 'be', 'has', 'have', 'had', 'been', 'for', 'of', 'with', 'in', 'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'among', 'but', 'or', 'an', 'this', 'that', 'these', 'those'];
    
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.includes(word));
    
    // Count word frequency
    const wordCount = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });
    
    // Sort by frequency and return top 5
    return Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word);
  }

  // Auto-categorize news
  categorizeNews(title, description) {
    const text = (title + ' ' + description).toLowerCase();
    
    if (text.includes('government') || text.includes('election') || text.includes('politics') || text.includes('president')) {
      return 'Politics';
    } else if (text.includes('economy') || text.includes('business') || text.includes('market') || text.includes('financial')) {
      return 'Business';
    } else if (text.includes('technology') || text.includes('tech') || text.includes('AI') || text.includes('digital')) {
      return 'Technology';
    } else if (text.includes('health') || text.includes('medical') || text.includes('hospital') || text.includes('doctor')) {
      return 'Health';
    } else if (text.includes('environment') || text.includes('climate') || text.includes('weather') || text.includes('pollution')) {
      return 'Environment';
    } else if (text.includes('education') || text.includes('school') || text.includes('university') || text.includes('student')) {
      return 'Education';
    } else if (text.includes('sports') || text.includes('game') || text.includes('match') || text.includes('team')) {
      return 'Sports';
    } else {
      return 'General';
    }
  }

  // Generate examples from news
  generateExampleFromNews(word, article) {
    const title = article.title.toLowerCase();
    if (title.includes(word)) {
      return article.title;
    }
    const description = article.description.toLowerCase();
    if (description.includes(word)) {
      // Find sentence containing the word
      const sentences = article.description.split(/[.!?]+/);
      const sentenceWithWord = sentences.find(sentence => 
        sentence.toLowerCase().includes(word)
      );
      if (sentenceWithWord) {
        return sentenceWithWord.trim() + '.';
      }
    }
    return `The ${word} news is important to follow.`;
  }

  // Extract key phrases
  extractKeyPhrases(article) {
    const text = `${article.title} ${article.description}`;
    const phrases = [];

    // Common news phrases
    const commonPhrases = [
      'breaking news',
      'according to',
      'it is reported that',
      'experts say',
      'in recent years',
      'as a result',
      'on the other hand',
      'furthermore',
      'meanwhile',
      'however',
      'in addition',
      'for example'
    ];

    commonPhrases.forEach(phrase => {
      if (text.toLowerCase().includes(phrase)) {
        phrases.push({
          phrase,
          chinese: this.translatePhrase(phrase),
          usage: 'News reporting'
        });
      }
    });

    return phrases.slice(0, 3); // Return maximum 3 phrases
  }

  // Translate phrases
  translatePhrase(phrase) {
    const translations = {
      'breaking news': '突發新聞',
      'according to': '根據',
      'it is reported that': '據報導',
      'experts say': '專家表示',
      'in recent years': '近年來',
      'as a result': '因此',
      'on the other hand': '另一方面',
      'furthermore': '此外',
      'meanwhile': '與此同時',
      'however': '然而',
      'in addition': '另外',
      'for example': '例如'
    };
    return translations[phrase] || phrase;
  }

  // Get country code
  getCountryCode(country) {
    const countryCodes = {
      'taiwan': 'tw',
      'china': 'cn',
      'usa': 'us',
      'uk': 'gb',
      'japan': 'jp',
      'korea': 'kr',
      'hong kong': 'hk'
    };
    return countryCodes[country.toLowerCase()] || 'us';
  }

  // Enhanced: Test API connection and quota
  async testAPIConnection() {
    try {
      console.log('🧪 Testing NewsAPI connection...');
      
      // Use simple query to test API
      const response = await axios.get(`${this.BASE_URL}/everything`, {
        params: {
          q: 'test',
          pageSize: 1,
          apiKey: this.API_KEY
        }
      });

      console.log('✅ NewsAPI connection successful:', {
        status: response.status,
        totalResults: response.data.totalResults,
        articlesReturned: response.data.articles.length
      });

      return {
        success: true,
        totalResults: response.data.totalResults,
        quotaUsed: true // NewsAPI doesn't directly provide quota information
      };
    } catch (error) {
      console.error('❌ NewsAPI connection failed:', error.response?.status, error.response?.data);
      
      let errorMessage = 'Unknown error';
      if (error.response?.status === 401) {
        errorMessage = 'Invalid API key';
      } else if (error.response?.status === 429) {
        errorMessage = 'API quota exceeded';
      } else if (error.response?.status === 426) {
        errorMessage = 'Upgrade required';
      }

      return {
        success: false,
        error: errorMessage,
        status: error.response?.status
      };
    }
  }

  // Get news statistics
  async getNewsStats() {
    try {
      const stats = {
        totalCategories: 7,
        supportedCountries: 54,
        apiCallsToday: 'Not available', // NewsAPI doesn't provide this information
        lastUpdate: new Date().toISOString()
      };

      // Test if API is available
      const testResult = await this.testAPIConnection();
      stats.apiAvailable = testResult.success;
      stats.apiStatus = testResult.success ? 'Active' : testResult.error;

      return stats;
    } catch (error) {
      console.error('📊 Failed to get news statistics:', error);
      return {
        totalCategories: 7,
        supportedCountries: 54,
        apiAvailable: false,
        apiStatus: 'Error',
        lastUpdate: new Date().toISOString()
      };
    }
  }

  // Enhanced: Mock news data (used when API fails)
  getMockNews() {
    return [
      {
        id: 'mock-1',
        title: 'Technology Advances in Artificial Intelligence Transform Education',
        description: 'Scientists develop new AI technology that can help students learn languages more effectively. The artificial intelligence system uses machine learning to adapt to individual learning styles.',
        source: 'Tech News Daily',
        publishedAt: new Date(),
        isLocal: false,
        category: 'Technology',
        vocabulary: [
          {
            word: 'technology',
            chinese: '科技',
            category: 'Technology',
            level: 'beginner',
            pronunciation: '/tekˈnɑːlədʒi/',
            definition: 'The application of scientific knowledge for practical purposes',
            context: 'News',
            example: 'Technology advances in artificial intelligence transform education.'
          },
          {
            word: 'artificial',
            chinese: '人工的',
            category: 'Technology',
            level: 'intermediate',
            pronunciation: '/ˌɑːrtɪˈfɪʃl/',
            definition: 'Made or produced by human beings rather than occurring naturally',
            context: 'News',
            example: 'The artificial intelligence system uses machine learning.'
          }
        ],
        keyWords: ['technology', 'artificial', 'intelligence', 'education', 'students'],
        keyPhrases: [
          {
            phrase: 'according to experts',
            chinese: '據專家表示',
            usage: 'News reporting'
          }
        ]
      },
      {
        id: 'mock-2',
        title: 'Climate Change Research Shows Alarming Environmental Trends',
        description: 'Recent research indicates that climate change is affecting global weather patterns significantly. Environmental scientists warn that immediate action is needed to address pollution and sustainable development.',
        source: 'Environmental Science Today',
        publishedAt: new Date(),
        isLocal: false,
        category: 'Environment',
        vocabulary: [
          {
            word: 'climate',
            chinese: '氣候',
            category: 'Environment',
            level: 'intermediate',
            pronunciation: '/ˈklaɪmət/',
            definition: 'The weather conditions in an area over a long period',
            context: 'News',
            example: 'Climate change research shows alarming environmental trends.'
          },
          {
            word: 'environment',
            chinese: '環境',
            category: 'Environment',
            level: 'intermediate',
            pronunciation: '/ɪnˈvaɪrənmənt/',
            definition: 'The surroundings in which an organism operates',
            context: 'News',
            example: 'Environmental scientists warn about climate change.'
          }
        ],
        keyWords: ['climate', 'research', 'environmental', 'pollution', 'sustainable'],
        keyPhrases: [
          {
            phrase: 'research indicates',
            chinese: '研究表明',
            usage: 'Academic reporting'
          }
        ]
      },
      {
        id: 'mock-3',
        title: 'Global Economy Shows Signs of Recovery After Recent Challenges',
        description: 'Economic analysts report positive trends in international markets. Business leaders express optimism about investment opportunities and financial growth in the coming months.',
        source: 'Business Weekly',
        publishedAt: new Date(),
        isLocal: false,
        category: 'Business',
        vocabulary: [
          {
            word: 'economy',
            chinese: '經濟',
            category: 'Business',
            level: 'intermediate',
            pronunciation: '/ɪˈkɑːnəmi/',
            definition: 'The state of a country in terms of production and consumption',
            context: 'News',
            example: 'Global economy shows signs of recovery.'
          }
        ],
        keyWords: ['economy', 'recovery', 'business', 'investment', 'financial'],
        keyPhrases: []
      }
    ];
  }

  // Enhanced: Mock local news
  getMockLocalNews(location) {
    const cityName = location?.address?.city || '香港';
    
    return [
      {
        id: 'local-mock-1',
        title: `${cityName} Launches New Public Transportation Digital Payment System`,
        description: `The ${cityName} government has implemented an advanced digital payment system for public transportation. This technology aims to improve passenger convenience and reduce waiting times at stations throughout the city.`,
        source: `${cityName} Transport Authority`,
        publishedAt: new Date(),
        isLocal: true,
        category: 'Technology',
        vocabulary: [
          {
            word: 'implemented',
            chinese: '實施',
            category: 'Business',
            level: 'advanced',
            pronunciation: '/ˈɪmplɪmentɪd/',
            definition: 'Put a decision or plan into effect',
            context: 'Local News',
            example: `The ${cityName} government has implemented an advanced digital payment system.`
          },
          {
            word: 'convenience',
            chinese: '便利',
            category: 'General',
            level: 'intermediate',
            pronunciation: '/kənˈviːniəns/',
            definition: 'The state of being able to proceed with something easily',
            context: 'Local News',
            example: 'This technology aims to improve passenger convenience.'
          }
        ],
        keyWords: ['digital', 'payment', 'transportation', 'convenience', 'technology'],
        keyPhrases: []
      },
      {
        id: 'local-mock-2',
        title: `${cityName} Weather Service Issues Partly Cloudy Forecast for Weekend`,
        description: `Local meteorologists report partly cloudy weather conditions expected this weekend in ${cityName}. Residents are advised to prepare for variable temperatures and possible light rain in the evening.`,
        source: `${cityName} Weather Service`,
        publishedAt: new Date(),
        isLocal: true,
        category: 'Environment',
        vocabulary: [
          {
            word: 'meteorologists',
            chinese: '氣象學家',
            category: 'Science',
            level: 'advanced',
            pronunciation: '/ˌmiːtiəˈrɑːlədʒɪsts/',
            definition: 'Scientists who study weather patterns and atmospheric conditions',
            context: 'Local News',
            example: 'Local meteorologists report partly cloudy weather conditions.'
          },
          {
            word: 'residents',
            chinese: '居民',
            category: 'Social',
            level: 'intermediate',
            pronunciation: '/ˈrezɪdənts/',
            definition: 'People who live in a particular place',
            context: 'Local News',
            example: 'Residents are advised to prepare for variable temperatures.'
          }
        ],
        keyWords: ['weather', 'cloudy', 'temperatures', 'residents', 'forecast'],
        keyPhrases: []
      }
    ];
  }

  // Mock news data by topic
  getMockNewsByTopic(topic) {
    const topicNews = {
      'technology': [
        {
          id: 'tech-mock-1',
          title: 'Breakthrough in Artificial Intelligence Revolutionizes Language Learning',
          description: 'New AI technology promises to transform how students acquire foreign languages through personalized adaptive learning systems.',
          source: 'Tech Innovation Daily',
          category: 'Technology',
          isLocal: false
        }
      ],
      'business': [
        {
          id: 'business-mock-1',
          title: 'Global Markets Show Strong Performance in Technology Sector',
          description: 'International investors show confidence in technology companies as digital transformation accelerates across industries.',
          source: 'Business Today',
          category: 'Business',
          isLocal: false
        }
      ],
      'environment': [
        {
          id: 'env-mock-1',
          title: 'Renewable Energy Projects Gain Momentum Worldwide',
          description: 'Sustainable energy initiatives receive increased funding as governments prioritize environmental protection and climate action.',
          source: 'Environmental Times',
          category: 'Environment',
          isLocal: false
        }
      ]
    };

    const mockArticles = topicNews[topic.toLowerCase()] || topicNews['technology'];
    return this.processNewsData(mockArticles, false);
  }

  // Generate news learning content
  generateNewsLearningContent(newsArticles) {
    const allVocabulary = [];
    const allPhrases = [];
    const categories = new Set();

    newsArticles.forEach(article => {
      if (article.vocabulary) {
        allVocabulary.push(...article.vocabulary);
      }
      if (article.keyPhrases) {
        allPhrases.push(...article.keyPhrases);
      }
      if (article.category) {
        categories.add(article.category);
      }
    });

    return {
      vocabulary: allVocabulary.slice(0, 8), // Maximum 8 vocabulary words
      phrases: allPhrases.slice(0, 5), // Maximum 5 phrases
      categories: Array.from(categories),
      articles: newsArticles.slice(0, 3), // Maximum 3 articles
      learningTips: this.generateLearningTips(allVocabulary, categories)
    };
  }

  // Enhanced: Generate learning tips
  generateLearningTips(vocabulary, categories) {
    const tips = [
      'Reading news is a great way to improve your English',
      'Learning news vocabulary helps understand current events',
      'Try reading one English news article daily',
      'Pay attention to common phrases and expressions in news'
    ];

    if (vocabulary.some(word => word.level === 'advanced')) {
      tips.push('Challenge yourself with advanced vocabulary');
    }

    if (categories.has('Technology')) {
      tips.push('Tech news contains many modern English words');
    }

    if (categories.has('Business')) {
      tips.push('Business news helps learn professional English');
    }

    return tips.slice(0, 5);
  }
}

export default NewsService;

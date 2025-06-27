import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import DictionaryService from './DictionaryService';

class ImageRecognitionAPI {
  constructor() {
  
    this.API_KEY = 'acc_a4f47b919fb9fdf';
    this.API_SECRET = '85f753fd7fd2ce2be9bbcdee6ace7391';
    this.BASE_URL = 'https://api.imagga.com/v2';
    
 
    this.AUTH_HEADER = 'Basic YWNjX2E0ZjQ3YjkxOWZiOWZkZjo4NWY3NTNmZDdmZDJjZTJiZTliYmNkZWU2YWNlNzM5MQ==';
    

    this.dictionary = new DictionaryService();
  }

  
  async imageToBase64(imageUri) {
    try {
      const fileInfo = await FileSystem.getInfoAsync(imageUri);
      console.log('File info:', fileInfo);
      
      if (!fileInfo.exists) {
        throw new Error('Image file does not exist');
      }

      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      if (!base64 || base64.length < 100) {
        throw new Error('Image conversion failed or file too small');
      }
      
      return base64;
    } catch (error) {
      console.error('Image conversion error:', error);
      throw new Error(`Image processing failed: ${error.message}`);
    }
  }

  // Upload image using URL method
  async uploadImageToImgur(imageUri) {
    try {
      const base64Image = await this.imageToBase64(imageUri);
      
      const response = await axios.post(
        'https://api.imgur.com/3/image',
        {
          image: base64Image,
          type: 'base64'
        },
        {
          headers: {
            'Authorization': 'Client-ID 546c25a59c58ad7',
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data && response.data.data && response.data.data.link) {
        return response.data.data.link;
      } else {
        throw new Error('Image upload failed');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    }
  }

  async recognizeImageByUrl(imageUrl) {
    try {
      console.log('Recognizing image using URL:', imageUrl);

      const response = await axios.get(
        `${this.BASE_URL}/tags?image_url=${encodeURIComponent(imageUrl)}`,
        {
          headers: {
            'Authorization': this.AUTH_HEADER
          },
          timeout: 30000
        }
      );

      console.log('API response status:', response.status);

      if (response.data && response.data.result && response.data.result.tags) {
        return response.data.result.tags;
      } else {
        throw new Error('API response format incorrect');
      }
    } catch (error) {
      console.error('API call error:', error);
      throw this.handleAPIError(error);
    }
  }


  async recognizeImageByBase64(imageUri) {
    try {
      console.log('Recognizing image using base64:', imageUri);
      
      const base64Image = await this.imageToBase64(imageUri);
      console.log('Image conversion completed, size:', base64Image.length);

      const requestData = {
        image_base64: base64Image
      };

      const response = await axios.post(
        `${this.BASE_URL}/tags`,
        requestData,
        {
          headers: {
            'Authorization': this.AUTH_HEADER,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      console.log('API response status:', response.status);

      if (response.data && response.data.result && response.data.result.tags) {
        return response.data.result.tags;
      } else {
        throw new Error('API response format incorrect');
      }
    } catch (error) {
      console.error('base64 API call error:', error);
      throw this.handleAPIError(error);
    }
  }

  // Main recognition method
  async recognizeImage(imageUri) {
    try {
      console.log('Starting image recognition, trying URL method...');
      
      try {
        const imageUrl = await this.uploadImageToImgur(imageUri);
        console.log('Image upload successful:', imageUrl);
        
        const tags = await this.recognizeImageByUrl(imageUrl);
        return this.processAPIResponse(tags, imageUri);
      } catch (urlError) {
        console.log('URL method failed, trying base64 method...', urlError.message);
        
        const tags = await this.recognizeImageByBase64(imageUri);
        return this.processAPIResponse(tags, imageUri);
      }
    } catch (error) {
      console.error('All recognition methods failed:', error);
      throw this.handleAPIError(error);
    }
  }

  processAPIResponse(tags, imageUri) {
    console.log('Processing API response, tag count:', tags.length);
    
    if (!tags || tags.length === 0) {
      throw new Error('No objects recognized');
    }

    const bestTag = tags[0];
    const tagName = bestTag.tag.en;
    const confidence = bestTag.confidence / 100;

    console.log('Best recognition result:', tagName, 'confidence:', confidence);

    const topTags = tags.slice(0, 5).map(tag => ({
      name: tag.tag.en,
      confidence: Math.round(tag.confidence)
    }));

    // Use dictionary service to get detailed information
    const wordInfo = this.dictionary.getWordInfo(tagName);
    
    console.log('✅ Dictionary search result:', {
      word: tagName,
      found: wordInfo.found,
      chinese: wordInfo.chinese,
      definition: wordInfo.definition
    });

    return {
      name: this.capitalizeFirst(tagName),
      chineseName: wordInfo.chinese,
      definition: wordInfo.definition,
      chineseDefinition: wordInfo.chineseDefinition,
      pronunciation: wordInfo.pronunciation,
      category: wordInfo.category,
      difficulty: wordInfo.difficulty,
      examples: wordInfo.examples,
      chineseExamples: wordInfo.chineseExamples,
      usageNote: wordInfo.usageNote,
      synonyms: wordInfo.synonyms,
      confidence: confidence,
      timestamp: new Date(),
      imageUri: imageUri,
      id: Date.now(),
      apiResponse: topTags,
      rawTags: topTags.map(tag => `${tag.name} (${tag.confidence}%)`),
      source: 'Imagga API + Dictionary',
      dictionaryMatch: wordInfo.found
    };
  }

  // Handle API errors
  handleAPIError(error) {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.status?.text || error.message;
      
      switch (status) {
        case 401:
          return new Error('API authentication failed, please check API key');
        case 403:
          return new Error('Insufficient API permissions or quota exhausted');
        case 429:
          return new Error('API call limit exceeded, please try again later');
        case 400:
          return new Error(`Request format error: ${message}`);
        default:
          return new Error(`API error (${status}): ${message}`);
      }
    } else if (error.request) {
      return new Error('Network connection failed, please check network connection');
    } else {
      return new Error(`Recognition error: ${error.message}`);
    }
  }

  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }


  async testConnection() {
    try {
      console.log('Testing API connection...');
      const response = await axios.get(`${this.BASE_URL}/usage`, {
        headers: {
          'Authorization': this.AUTH_HEADER
        },
        timeout: 10000
      });
      console.log('API connection successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('API connection test failed:', error);
      throw this.handleAPIError(error);
    }
  }
}

export default ImageRecognitionAPI;

import SQLite from 'react-native-sqlite-storage';
import uuid from 'react-native-uuid';

class DatabaseService {
  constructor() {
    this.db = null;
    this.isInitialized = false;
  }

  // Initialize database
  async initialize() {
    try {
      this.db = await SQLite.openDatabase({
        name: 'VocabLensDB.db',
        location: 'default',
      });

      await this.createTables();
      this.isInitialized = true;
      console.log('✅ Local database initialized');
      return true;
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      return false;
    }
  }

  // Create all tables
  async createTables() {
    const tables = [
      // Users table
      `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        firebase_uid TEXT UNIQUE,
        email TEXT,
        display_name TEXT,
        avatar_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_sync DATETIME
      )`,

      // Favorites table
      `CREATE TABLE IF NOT EXISTS favorites (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        word_name TEXT,
        chinese_name TEXT,
        pronunciation TEXT,
        definition TEXT,
        chinese_definition TEXT,
        category TEXT,
        difficulty TEXT,
        examples TEXT,
        chinese_examples TEXT,
        usage_note TEXT,
        synonyms TEXT,
        image_uri TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`,

      // Learning history
      `CREATE TABLE IF NOT EXISTS learning_history (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        word_name TEXT,
        chinese_name TEXT,
        action_type TEXT,
        score INTEGER,
        time_spent INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`,

      // Practice results
      `CREATE TABLE IF NOT EXISTS practice_results (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        word_name TEXT,
        question_type TEXT,
        score INTEGER,
        correct_answer TEXT,
        user_answer TEXT,
        time_taken INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`,

      // User preferences
      `CREATE TABLE IF NOT EXISTS user_preferences (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        language TEXT DEFAULT 'en-US',
        voice_speed REAL DEFAULT 0.8,
        pronunciation_strict BOOLEAN DEFAULT 0,
        daily_goal INTEGER DEFAULT 10,
        notifications_enabled BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`
    ];

    for (const table of tables) {
      await this.db.executeSql(table);
    }
  }

  // User operations
  async createUser(userData) {
    try {
      const userId = uuid.v4();
      const query = `
        INSERT INTO users (id, firebase_uid, email, display_name, avatar_url)
        VALUES (?, ?, ?, ?, ?)
      `;
      
      await this.db.executeSql(query, [
        userId,
        userData.firebaseUid,
        userData.email,
        userData.displayName,
        userData.avatarUrl || null
      ]);

      // Create default preferences
      await this.createUserPreferences(userId);
      
      return userId;
    } catch (error) {
      console.error('Failed to create user:', error);
      throw error;
    }
  }

  async getUserByFirebaseUid(firebaseUid) {
    try {
      const query = 'SELECT * FROM users WHERE firebase_uid = ?';
      const [results] = await this.db.executeSql(query, [firebaseUid]);
      
      if (results.rows.length > 0) {
        return results.rows.item(0);
      }
      return null;
    } catch (error) {
      console.error('Failed to get user:', error);
      return null;
    }
  }

  // Favorites operations
  async addFavorite(userId, wordData) {
    try {
      const favoriteId = uuid.v4();
      const query = `
        INSERT INTO favorites (
          id, user_id, word_name, chinese_name, pronunciation, definition,
          chinese_definition, category, difficulty, examples, chinese_examples,
          usage_note, synonyms, image_uri
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await this.db.executeSql(query, [
        favoriteId,
        userId,
        wordData.name,
        wordData.chineseName,
        wordData.pronunciation,
        wordData.definition,
        wordData.chineseDefinition,
        wordData.category,
        wordData.difficulty,
        JSON.stringify(wordData.examples || []),
        JSON.stringify(wordData.chineseExamples || []),
        wordData.usageNote,
        JSON.stringify(wordData.synonyms || []),
        wordData.imageUri
      ]);

      return favoriteId;
    } catch (error) {
      console.error('Failed to add favorite:', error);
      throw error;
    }
  }

  async getFavorites(userId) {
    try {
      const query = 'SELECT * FROM favorites WHERE user_id = ? ORDER BY created_at DESC';
      const [results] = await this.db.executeSql(query, [userId]);
      
      const favorites = [];
      for (let i = 0; i < results.rows.length; i++) {
        const row = results.rows.item(i);
        favorites.push({
          ...row,
          examples: JSON.parse(row.examples || '[]'),
          chineseExamples: JSON.parse(row.chinese_examples || '[]'),
          synonyms: JSON.parse(row.synonyms || '[]')
        });
      }
      
      return favorites;
    } catch (error) {
      console.error('Failed to get favorites:', error);
      return [];
    }
  }

  async removeFavorite(userId, wordName) {
    try {
      const query = 'DELETE FROM favorites WHERE user_id = ? AND word_name = ?';
      await this.db.executeSql(query, [userId, wordName]);
      return true;
    } catch (error) {
      console.error('Failed to remove favorite:', error);
      return false;
    }
  }

  async isFavorite(userId, wordName) {
    try {
      const query = 'SELECT id FROM favorites WHERE user_id = ? AND word_name = ?';
      const [results] = await this.db.executeSql(query, [userId, wordName]);
      return results.rows.length > 0;
    } catch (error) {
      console.error('Failed to check favorite:', error);
      return false;
    }
  }

  // Learning history operations
  async addLearningHistory(userId, historyData) {
    try {
      const historyId = uuid.v4();
      const query = `
        INSERT INTO learning_history (
          id, user_id, word_name, chinese_name, action_type, score, time_spent
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      await this.db.executeSql(query, [
        historyId,
        userId,
        historyData.wordName,
        historyData.chineseName,
        historyData.actionType,
        historyData.score || 0,
        historyData.timeSpent || 0
      ]);

      return historyId;
    } catch (error) {
      console.error('Failed to add learning history:', error);
      throw error;
    }
  }

  async getLearningHistory(userId, limit = 50) {
    try {
      const query = `
        SELECT * FROM learning_history 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT ?
      `;
      const [results] = await this.db.executeSql(query, [userId, limit]);
      
      const history = [];
      for (let i = 0; i < results.rows.length; i++) {
        history.push(results.rows.item(i));
      }
      
      return history;
    } catch (error) {
      console.error('Failed to get learning history:', error);
      return [];
    }
  }

  // Practice results operations
  async addPracticeResult(userId, resultData) {
    try {
      const resultId = uuid.v4();
      const query = `
        INSERT INTO practice_results (
          id, user_id, word_name, question_type, score, correct_answer,
          user_answer, time_taken
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await this.db.executeSql(query, [
        resultId,
        userId,
        resultData.wordName,
        resultData.questionType,
        resultData.score,
        resultData.correctAnswer,
        resultData.userAnswer,
        resultData.timeTaken || 0
      ]);

      return resultId;
    } catch (error) {
      console.error('Failed to add practice result:', error);
      throw error;
    }
  }

  // User preferences operations
  async createUserPreferences(userId) {
    try {
      const prefId = uuid.v4();
      const query = `
        INSERT INTO user_preferences (id, user_id)
        VALUES (?, ?)
      `;
      
      await this.db.executeSql(query, [prefId, userId]);
      return prefId;
    } catch (error) {
      console.error('Failed to create user preferences:', error);
      throw error;
    }
  }

  async getUserPreferences(userId) {
    try {
      const query = 'SELECT * FROM user_preferences WHERE user_id = ?';
      const [results] = await this.db.executeSql(query, [userId]);
      
      if (results.rows.length > 0) {
        return results.rows.item(0);
      }
      return null;
    } catch (error) {
      console.error('Failed to get user preferences:', error);
      return null;
    }
  }

  async updateUserPreferences(userId, preferences) {
    try {
      const query = `
        UPDATE user_preferences 
        SET language = ?, voice_speed = ?, pronunciation_strict = ?,
            daily_goal = ?, notifications_enabled = ?, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `;
      
      await this.db.executeSql(query, [
        preferences.language,
        preferences.voiceSpeed,
        preferences.pronunciationStrict ? 1 : 0,
        preferences.dailyGoal,
        preferences.notificationsEnabled ? 1 : 0,
        userId
      ]);
      
      return true;
    } catch (error) {
      console.error('Failed to update user preferences:', error);
      return false;
    }
  }

  // Statistics
  async getUserStats(userId) {
    try {
      const queries = [
        'SELECT COUNT(*) as total_favorites FROM favorites WHERE user_id = ?',
        'SELECT COUNT(*) as total_practices FROM practice_results WHERE user_id = ?',
        'SELECT AVG(score) as avg_score FROM practice_results WHERE user_id = ?',
        'SELECT COUNT(*) as words_learned FROM learning_history WHERE user_id = ? AND action_type = "completed"'
      ];

      const results = await Promise.all(
        queries.map(query => this.db.executeSql(query, [userId]))
      );

      return {
        totalFavorites: results[0][0].rows.item(0).total_favorites,
        totalPractices: results[1][0].rows.item(0).total_practices,
        averageScore: results[2][0].rows.item(0).avg_score || 0,
        wordsLearned: results[3][0].rows.item(0).words_learned
      };
    } catch (error) {
      console.error('Failed to get user stats:', error);
      return {
        totalFavorites: 0,
        totalPractices: 0,
        averageScore: 0,
        wordsLearned: 0
      };
    }
  }

  // Cleanup and maintenance
  async clearUserData(userId) {
    try {
      const tables = ['favorites', 'learning_history', 'practice_results', 'user_preferences'];
      
      for (const table of tables) {
        await this.db.executeSql(`DELETE FROM ${table} WHERE user_id = ?`, [userId]);
      }
      
      await this.db.executeSql('DELETE FROM users WHERE id = ?', [userId]);
      return true;
    } catch (error) {
      console.error('Failed to clear user data:', error);
      return false;
    }
  }
}

export default new DatabaseService();
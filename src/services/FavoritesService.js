import AsyncStorage from '@react-native-async-storage/async-storage';

class FavoritesService {
  constructor() {
    this.FAVORITES_KEY = 'vocablens_favorites';
  }

  // Get all favorites
  async getFavorites() {
    try {
      const favoritesJson = await AsyncStorage.getItem(this.FAVORITES_KEY);
      return favoritesJson ? JSON.parse(favoritesJson) : [];
    } catch (error) {
      console.error('Failed to get favorites list:', error);
      return [];
    }
  }

  // Add to favorites
  async addToFavorites(objectData) {
    try {
      const favorites = await this.getFavorites();
      
      // Check if already favorited
      const isAlreadyFavorited = favorites.some(fav => fav.name === objectData.name);
      
      if (isAlreadyFavorited) {
        throw new Error('Item already in favorites');
      }

      // Add favorite timestamp
      const favoriteItem = {
        ...objectData,
        favoritedAt: new Date().toISOString(),
        favoriteId: Date.now()
      };

      favorites.unshift(favoriteItem); // Add to beginning
      
      // Limit favorites count (maximum 100)
      const limitedFavorites = favorites.slice(0, 100);
      
      await AsyncStorage.setItem(this.FAVORITES_KEY, JSON.stringify(limitedFavorites));
      
      return {
        success: true,
        message: `"${objectData.name}" added to favorites`,
        totalFavorites: limitedFavorites.length
      };
    } catch (error) {
      console.error('Failed to add favorite:', error);
      throw error;
    }
  }

  // Remove from favorites
  async removeFromFavorites(objectName) {
    try {
      const favorites = await this.getFavorites();
      const updatedFavorites = favorites.filter(fav => fav.name !== objectName);
      
      await AsyncStorage.setItem(this.FAVORITES_KEY, JSON.stringify(updatedFavorites));
      
      return {
        success: true,
        message: `"${objectName}" removed from favorites`,
        totalFavorites: updatedFavorites.length
      };
    } catch (error) {
      console.error('Failed to remove favorite:', error);
      throw error;
    }
  }

  // Check if favorited
  async isFavorited(objectName) {
    try {
      const favorites = await this.getFavorites();
      return favorites.some(fav => fav.name === objectName);
    } catch (error) {
      console.error('Failed to check favorite status:', error);
      return false;
    }
  }

  // Clear all favorites
  async clearAllFavorites() {
    try {
      await AsyncStorage.removeItem(this.FAVORITES_KEY);
      return { success: true, message: 'Favorites cleared' };
    } catch (error) {
      console.error('Failed to clear favorites:', error);
      throw error;
    }
  }

  // Search favorites
  async searchFavorites(query) {
    try {
      const favorites = await this.getFavorites();
      const lowercaseQuery = query.toLowerCase();
      
      return favorites.filter(fav => 
        fav.name.toLowerCase().includes(lowercaseQuery) ||
        fav.chineseName.toLowerCase().includes(lowercaseQuery) ||
        fav.category.toLowerCase().includes(lowercaseQuery)
      );
    } catch (error) {
      console.error('Failed to search favorites:', error);
      return [];
    }
  }
}

export default FavoritesService;
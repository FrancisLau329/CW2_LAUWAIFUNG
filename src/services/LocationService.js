import * as Location from 'expo-location';

class LocationService {
  constructor() {
    this.lastKnownLocation = null;
    this.locationWatchId = null;
  }

  // Request location permission
  async requestLocationPermission() {
    try {
      console.log('📍 Requesting location permission...');
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        throw new Error('Location permission denied');
      }
      
      console.log('✅ Location permission granted');
      return true;
    } catch (error) {
      console.error('❌ Failed to request location permission:', error);
      throw error;
    }
  }

  // Get current location
  async getCurrentLocation() {
    try {
      console.log('📍 Starting to get current location...');
      
      // Ensure permission is granted
      await this.requestLocationPermission();
      
      // Get location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 10000,
        maximumAge: 60000, // 1 minute cache
      });
      
      const locationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        timestamp: location.timestamp,
      };
      
      console.log('Location obtained successfully:', locationData);
      this.lastKnownLocation = locationData;
      
      return locationData;
    } catch (error) {
      console.error('Failed to get location:', error);
      
      // If cached location exists, return cache
      if (this.lastKnownLocation) {
        console.log('🔄 Using cached location data');
        return this.lastKnownLocation;
      }
      
      // Return default location of Wong Tai Sin, Hong Kong
      console.log('🎯 Using default location (Wong Tai Sin, Hong Kong)');
      return {
        latitude: 22.346151,
        longitude: 114.189330,
        accuracy: 100,
        timestamp: Date.now(),
        isDefault: true
      };
    }
  }

  // Add missing address resolution method
  async getAddressFromCoordinates(latitude, longitude) {
    try {
      console.log(`🏠 Resolving address: lat=${latitude}, lon=${longitude}`);
      
      // Use Expo Location's reverse geocoding
      const reverseGeocodeResults = await Location.reverseGeocodeAsync({
        latitude,
        longitude
      });
      
      if (reverseGeocodeResults && reverseGeocodeResults.length > 0) {
        const address = reverseGeocodeResults[0];
        
        const formattedAddress = {
          city: address.city || address.district || address.subregion || 'Unknown City',
          region: address.region || address.subregion || 'Unknown Region',
          country: address.country || 'Unknown Country',
          full: this.formatFullAddress(address)
        };
        
        console.log('✅ Address resolution successful:', formattedAddress);
        return formattedAddress;
      } else {
        throw new Error('Unable to resolve address');
      }
    } catch (error) {
      console.error('❌ Address resolution failed:', error);
      
      // Return default address based on coordinates
      return this.getDefaultAddressForCoordinates(latitude, longitude);
    }
  }

  // Format complete address
  formatFullAddress(address) {
    const parts = [];
    
    if (address.streetNumber) parts.push(address.streetNumber);
    if (address.street) parts.push(address.street);
    if (address.district) parts.push(address.district);
    if (address.city) parts.push(address.city);
    if (address.region) parts.push(address.region);
    if (address.country) parts.push(address.country);
    
    return parts.length > 0 ? parts.join(', ') : 'Unknown Address';
  }

  // Return default address based on coordinates
  getDefaultAddressForCoordinates(latitude, longitude) {
    // Simple geographical region determination
    if (latitude >= 22.0 && latitude <= 23.0 && longitude >= 113.8 && longitude <= 114.5) {
      // Hong Kong area
      if (latitude >= 22.3 && latitude <= 22.4 && longitude >= 114.15 && longitude <= 114.25) {
        return {
          city: '黃大仙',
          region: '九龍',
          country: '中國香港特別行政區',
          full: '黃大仙, 九龍, 中國香港特別行政區'
        };
      } else {
        return {
          city: '香港',
          region: '香港',
          country: '中國香港特別行政區',
          full: '香港, 中國香港特別行政區'
        };
      }
    } else {
      // Other locations
      return {
        city: 'Unknown City',
        region: 'Unknown Region',
        country: 'Unknown Country',
        full: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
      };
    }
  }

  // Add address caching functionality
  async getAddressFromCoordinatesWithCache(latitude, longitude) {
    const cacheKey = `${latitude.toFixed(3)}_${longitude.toFixed(3)}`;
    
    // Check if there's cached address
    if (this.addressCache && this.addressCache[cacheKey]) {
      console.log('🔄 Using cached address data');
      return this.addressCache[cacheKey];
    }
    
    // Get new address
    const address = await this.getAddressFromCoordinates(latitude, longitude);
    
    // Cache address
    if (!this.addressCache) {
      this.addressCache = {};
    }
    this.addressCache[cacheKey] = address;
    
    return address;
  }

  // Combined method to get location and address
  async getLocationWithAddress() {
    try {
      const location = await this.getCurrentLocation();
      const address = await this.getAddressFromCoordinates(location.latitude, location.longitude);
      
      return {
        ...location,
        address
      };
    } catch (error) {
      console.error('Failed to get location and address:', error);
      
      // Return default Hong Kong location and address
      return {
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
      };
    }
  }

  // Check location permission status
  async checkLocationPermission() {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Failed to check location permission:', error);
      return false;
    }
  }

  // Start location monitoring
  async startLocationWatch(callback) {
    try {
      await this.requestLocationPermission();
      
      this.locationWatchId = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000, // Update every 5 seconds
          distanceInterval: 10, // Update when moved 10 meters
        },
        (location) => {
          const locationData = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy,
            timestamp: location.timestamp,
          };
          
          this.lastKnownLocation = locationData;
          if (callback) callback(locationData);
        }
      );
      
      console.log('✅ Location monitoring started');
      return true;
    } catch (error) {
      console.error('Failed to start location monitoring:', error);
      return false;
    }
  }

  // Stop location monitoring
  stopLocationWatch() {
    if (this.locationWatchId) {
      this.locationWatchId.remove();
      this.locationWatchId = null;
      console.log('🛑 Location monitoring stopped');
    }
  }

  // Calculate distance between two points (kilometers)
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius (kilometers)
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance;
  }

  // Convert degrees to radians
  deg2rad(deg) {
    return deg * (Math.PI/180);
  }

  // Check if within specified area
  isWithinArea(latitude, longitude, centerLat, centerLon, radiusKm) {
    const distance = this.calculateDistance(latitude, longitude, centerLat, centerLon);
    return distance <= radiusKm;
  }

  // Clean up resources
  cleanup() {
    this.stopLocationWatch();
    this.lastKnownLocation = null;
    this.addressCache = null;
  }

  // Get location permission status description
  async getLocationPermissionStatus() {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      
      const statusDescriptions = {
        'granted': 'Granted',
        'denied': 'Denied',
        'undetermined': 'Undetermined'
      };
      
      return {
        status,
        description: statusDescriptions[status] || 'Unknown Status',
        canUseLocation: status === 'granted'
      };
    } catch (error) {
      console.error('Failed to get permission status:', error);
      return {
        status: 'error',
        description: 'Failed to get status',
        canUseLocation: false
      };
    }
  }
}

export default LocationService;
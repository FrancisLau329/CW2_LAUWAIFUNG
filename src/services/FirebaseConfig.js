import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

class FirebaseConfig {
  constructor() {
    this.auth = auth();
    this.firestore = firestore();
  }

  // Initialize Firebase
  initialize() {
    console.log('🔥 Firebase initialized');
    return true;
  }

  // Get current user
  getCurrentUser() {
    return this.auth.currentUser;
  }

  // Check authentication state
  onAuthStateChanged(callback) {
    return this.auth.onAuthStateChanged(callback);
  }
}

export default new FirebaseConfig();
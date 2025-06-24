import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import DatabaseService from './DatabaseService';

class AuthService {
  constructor() {
    this.currentUser = null;
    this.currentLocalUser = null;
  }

  // Initialize auth service
  async initialize() {
    try {
      await DatabaseService.initialize();
      
      // Listen for auth state changes
      auth().onAuthStateChanged(this.onAuthStateChanged.bind(this));
      
      console.log('✅ Auth service initialized');
      return true;
    } catch (error) {
      console.error('❌ Auth service initialization failed:', error);
      return false;
    }
  }

  // Handle auth state changes
  async onAuthStateChanged(user) {
    this.currentUser = user;
    
    if (user) {
      // User signed in, get or create local user
      this.currentLocalUser = await this.getOrCreateLocalUser(user);
      console.log('✅ User signed in:', user.email);
    } else {
      // User signed out
      this.currentLocalUser = null;
      console.log('👋 User signed out');
    }
  }

  // Get or create local user
  async getOrCreateLocalUser(firebaseUser) {
    try {
      let localUser = await DatabaseService.getUserByFirebaseUid(firebaseUser.uid);
      
      if (!localUser) {
        // Create new local user
        const userId = await DatabaseService.createUser({
          firebaseUid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          avatarUrl: firebaseUser.photoURL
        });
        
        localUser = await DatabaseService.getUserByFirebaseUid(firebaseUser.uid);
        console.log('✅ Created new local user:', userId);
      }
      
      return localUser;
    } catch (error) {
      console.error('Failed to get or create local user:', error);
      return null;
    }
  }

  // Sign up with email and password
  async signUp(email, password, displayName) {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      
      // Update profile
      await userCredential.user.updateProfile({
        displayName: displayName
      });

      // Sync to Firestore
      await this.syncUserToFirestore(userCredential.user);
      
      return {
        success: true,
        user: userCredential.user
      };
    } catch (error) {
      console.error('Sign up failed:', error);
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  // Sign in with email and password
  async signIn(email, password) {
    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      
      return {
        success: true,
        user: userCredential.user
      };
    } catch (error) {
      console.error('Sign in failed:', error);
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  // Sign out
  async signOut() {
    try {
      await auth().signOut();
      return { success: true };
    } catch (error) {
      console.error('Sign out failed:', error);
      return {
        success: false,
        error: 'Failed to sign out'
      };
    }
  }

  // Reset password
  async resetPassword(email) {
    try {
      await auth().sendPasswordResetEmail(email);
      return {
        success: true,
        message: 'Password reset email sent'
      };
    } catch (error) {
      console.error('Password reset failed:', error);
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Get current local user
  getCurrentLocalUser() {
    return this.currentLocalUser;
  }

  // Check if user is signed in
  isSignedIn() {
    return !!this.currentUser;
  }

  // Sync user to Firestore
  async syncUserToFirestore(user) {
    try {
      const userDoc = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: firestore.FieldValue.serverTimestamp(),
        lastSignIn: firestore.FieldValue.serverTimestamp()
      };

      await firestore().collection('users').doc(user.uid).set(userDoc, { merge: true });
      console.log('✅ User synced to Firestore');
    } catch (error) {
      console.error('Failed to sync user to Firestore:', error);
    }
  }

  // Get error message
  getErrorMessage(errorCode) {
    const errorMessages = {
      'auth/email-already-in-use': 'This email is already registered',
      'auth/weak-password': 'Password should be at least 6 characters',
      'auth/invalid-email': 'Invalid email address',
      'auth/user-not-found': 'No account found with this email',
      'auth/wrong-password': 'Incorrect password',
      'auth/too-many-requests': 'Too many failed attempts. Try again later',
      'auth/network-request-failed': 'Network error. Check your connection'
    };

    return errorMessages[errorCode] || 'An error occurred. Please try again';
  }
}

export default new AuthService();
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';


import { AuthProvider, AuthContext } from './src/context/AuthContext';
import { DataProvider } from './src/context/DataContext';


import AuthScreen from './src/screens/AuthScreen';
import HomeScreen from './src/screens/HomeScreen';
import CameraScreen from './src/screens/CameraScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import PracticeScreen from './src/screens/PracticeScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import DictionaryScreen from './src/screens/DictionaryScreen';
import WordDictionaryScreen from './src/screens/WordDictionaryScreen';
import WeatherLearningScreen from './src/screens/WeatherLearningScreen';
import VoicePracticeScreen from './src/screens/VoicePracticeScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();


const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <MaterialIcons name="school" size={60} color="white" />
    <ActivityIndicator size="large" color="white" style={{ marginTop: 20 }} />
    <Text style={styles.loadingText}>VocabLens...</Text>
  </View>
);


const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Camera':
              iconName = 'camera';
              break;
            case 'Dictionary':
              iconName = 'book';
              break;
            case 'Profile':
              iconName = 'person';
              break;
          }
          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#5D5CDE',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'HOME' }} />
      <Tab.Screen name="Camera" component={CameraScreen} options={{ title: 'AI-Camera' }} />
      <Tab.Screen name="Dictionary" component={DictionaryScreen} options={{ title: 'Dictionary' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
};


const AppNavigator = () => {
  const { isAuthenticated, isLoading } = React.useContext(AuthContext);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" backgroundColor="#5D5CDE" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthScreen} />
        ) : (
          <React.Fragment>
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen 
              name="Practice" 
              component={PracticeScreen}
              options={{
                headerShown: false,
                gestureEnabled: true,
              }}
            />
            <Stack.Screen 
              name="Favorites" 
              component={FavoritesScreen}
              options={{
                headerShown: false,
                gestureEnabled: true,
              }}
            />
            <Stack.Screen 
              name="History" 
              component={HistoryScreen}
              options={{
                headerShown: false,
                gestureEnabled: true,
              }}
            />
            <Stack.Screen 
              name="WeatherLearning" 
              component={WeatherLearningScreen}
              options={{
                headerShown: false,
                gestureEnabled: true,
              }}
            />
            <Stack.Screen 
              name="WordDictionary" 
              component={WordDictionaryScreen}
              options={{
                title: 'Dictionary',
                headerShown: false,
                gestureEnabled: true,
              }}
            />
            <Stack.Screen 
              name="VoicePractice" 
              component={VoicePracticeScreen}
              options={{
                headerShown: false,
                gestureEnabled: true,
              }}
            />
          </React.Fragment>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppNavigator />
      </DataProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#5D5CDE',
  },
  loadingText: {
    fontSize: 18,
    color: 'white',
    fontWeight: '600',
    marginTop: 16,
  },
});
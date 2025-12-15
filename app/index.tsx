import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function SplashScreen() {
  useEffect(() => {
    // Auto-navigate after 3 seconds for demo purposes
    const timer = setTimeout(() => {
      // Uncomment this line to auto-navigate
      // router.push('/language');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient
      colors={['#F4A896', '#F7B8A8']}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>Mubaku</Text>
          <Text style={styles.logoSubtext}>STYLE</Text>
        </View>
        
        <Text style={styles.tagline}>Book Your Look.</Text>
        
        <TouchableOpacity 
          style={styles.getStartedButton}
          onPress={() => router.push('/login' as any)}
        >
          <Text style={styles.getStartedText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 2,
  },
  logoSubtext: {
    fontSize: 24,
    fontWeight: '300',
    color: 'white',
    letterSpacing: 4,
    marginTop: -5,
  },
  tagline: {
    fontSize: 20,
    color: 'white',
    marginBottom: 60,
    fontWeight: '300',
  },
  getStartedButton: {
    backgroundColor: 'white',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  getStartedText: {
    color: '#2D1A46',
    fontSize: 18,
    fontWeight: '600',
  },
});
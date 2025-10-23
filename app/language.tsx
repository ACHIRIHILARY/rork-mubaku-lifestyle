import { router } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';

export default function LanguageScreen() {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
  ];

  const handleContinue = () => {
    if (selectedLanguage) {
      router.push('/login');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Choose Your Language</Text>
        <Text style={styles.subtitle}>Select your preferred language to continue</Text>

        <View style={styles.languageContainer}>
          {languages.map((language) => (
            <TouchableOpacity
              key={language.code}
              style={[
                styles.languageCard,
                selectedLanguage === language.code && styles.selectedCard
              ]}
              onPress={() => setSelectedLanguage(language.code)}
            >
              <Text style={styles.flag}>{language.flag}</Text>
              <Text style={[
                styles.languageName,
                selectedLanguage === language.code && styles.selectedText
              ]}>
                {language.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedLanguage && styles.disabledButton
          ]}
          onPress={handleContinue}
          disabled={!selectedLanguage}
        >
          <Text style={styles.continueText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4A896',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginBottom: 60,
    opacity: 0.9,
  },
  languageContainer: {
    gap: 16,
    marginBottom: 60,
  },
  languageCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedCard: {
    backgroundColor: '#2D1A46',
  },
  flag: {
    fontSize: 24,
    marginRight: 16,
  },
  languageName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D1A46',
  },
  selectedText: {
    color: 'white',
  },
  continueButton: {
    backgroundColor: '#2D1A46',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  continueText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});
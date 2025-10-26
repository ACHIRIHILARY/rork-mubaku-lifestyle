import { router } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';

export default function RoleSelectionScreen() {
  const [selectedRole, setSelectedRole] = useState<string>('');

  const roles = [
    {
      id: 'client',
      title: 'Client',
      description: 'Book beauty services from professional agents',
      icon: '👤',
      route: '/client-profile-setup'
    },
    {
      id: 'agent',
      title: 'Service Agent',
      description: 'Offer your beauty services to clients',
      icon: '💼',
      route: '/agent-profile-setup'
    }
  ];

  const handleContinue = () => {
    const selectedRoleData = roles.find(role => role.id === selectedRole);
    if (selectedRoleData) {
      router.push(selectedRoleData.route as any);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft color="white" size={24} />
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Choose Your Role</Text>
          <Text style={styles.subtitle}>How would you like to use Mubaku Lifestyle?</Text>
        </View>

        <View style={styles.rolesContainer}>
          {roles.map((role) => (
            <TouchableOpacity
              key={role.id}
              style={[
                styles.roleCard,
                selectedRole === role.id && styles.selectedCard
              ]}
              onPress={() => setSelectedRole(role.id)}
            >
              <Text style={styles.roleIcon}>{role.icon}</Text>
              <Text style={[
                styles.roleTitle,
                selectedRole === role.id && styles.selectedText
              ]}>
                {role.title}
              </Text>
              <Text style={[
                styles.roleDescription,
                selectedRole === role.id && styles.selectedDescriptionText
              ]}>
                {role.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedRole && styles.disabledButton
          ]}
          onPress={handleContinue}
          disabled={!selectedRole}
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
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  backButton: {
    padding: 8,
    alignSelf: 'flex-start',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    opacity: 0.9,
  },
  rolesContainer: {
    gap: 20,
    marginBottom: 60,
  },
  roleCard: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8,
  },
  selectedCard: {
    backgroundColor: '#2D1A46',
  },
  roleIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  roleTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2D1A46',
    marginBottom: 8,
  },
  selectedText: {
    color: 'white',
  },
  roleDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  selectedDescriptionText: {
    color: 'rgba(255, 255, 255, 0.8)',
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
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Menu, Zap } from 'lucide-react-native';

interface StickyHeaderProps {
  onMenuPress?: () => void;
  onCTAPress?: () => void;
  brandName?: string;
}

export default function StickyHeader({
  onMenuPress,
  onCTAPress,
  brandName = 'Rork'
}: StickyHeaderProps) {
  return (
    <View style={styles.container}>
      {/* Left: Hamburger Menu */}
      <TouchableOpacity
        style={styles.menuButton}
        onPress={onMenuPress}
        accessibilityLabel="Open menu"
      >
        <Menu color="#2D1A46" size={24} />
      </TouchableOpacity>

      {/* Center: Brand Wordmark */}
      <View style={styles.brandContainer}>
        <Text style={styles.brandText}>{brandName}</Text>
      </View>

      {/* Right: CTA Button */}
      <TouchableOpacity
        style={styles.ctaButton}
        onPress={onCTAPress}
        accessibilityLabel="Call to action"
      >
        <Zap color="white" size={20} />
        <Text style={styles.ctaText}>Book Now</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  menuButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  brandContainer: {
    flex: 1,
    alignItems: 'center',
  },
  brandText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D1A46',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4A896',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  ctaText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

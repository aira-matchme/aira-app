import React from 'react';
import { View, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

export const NotificationMockup = ({ children }: { children?: React.ReactNode }) => {
  return (
    <View style={styles.screen}>
      <View style={styles.phoneShadow}>
        <View style={styles.phoneContainer}>
          {/* Phone background gradient */}
          <LinearGradient
            colors={[
              'rgba(255,255,255,0.85)',
              'rgba(255,255,255,0.6)',
              'rgba(255,255,255,0)',
            ]}
            locations={[0, 0.55, 1]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.phoneInner}
          >
            {children}
          </LinearGradient>

          {/* Bottom dark fade */}
          <LinearGradient
            colors={[
              'rgba(0,0,0,0)',
              'rgba(0,0,0,0.12)',
            ]}
            locations={[0, 1]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.bottomFade}
            pointerEvents="none"
          />
        </View>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: '#1A1A1A', // dark app background
      justifyContent: 'center',
      alignItems: 'center',
    },
  
    phoneShadow: {
      shadowOpacity: 0.5,
      shadowRadius: 40,
      shadowOffset: { width: 0, height: 24 },
    },
  
    phoneContainer: {
      width: 283,
      height: 653,
      borderRadius: 56,
      borderWidth: 2,
      borderColor: 'rgba(255,255,255,0.5)',
      backgroundColor: '#FFFFFF',
      overflow: 'hidden',
    },
  
    phoneInner: {
      flex: 1,
      paddingTop: 8, // exact Figma padding
    },
  
    bottomFade: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: 180, // controls fade strength
    },
  });
  
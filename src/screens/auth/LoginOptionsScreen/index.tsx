import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ReusableBottomSheet } from '../../../components/BottomSheet';
import type { AuthStackParamList } from '../../../navigation/types';
import { styles } from './styles';

type LoginOptionsNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'LoginOptions'>;

const GoogleIcon = () => (
  <View style={styles.iconContainer}>
    <Text style={styles.iconText}>G</Text>
  </View>
);

const AppleIcon = () => (
  <View style={styles.iconContainer}>
    <Text style={styles.iconText}>🍎</Text>
  </View>
);

const EmailIcon = () => (
  <View style={styles.iconContainer}>
    <Text style={styles.iconText}>✉</Text>
  </View>
);

export const LoginOptionsScreen: React.FC = () => {
  const navigation = useNavigation<LoginOptionsNavigationProp>();
  const [isOpen, setIsOpen] = useState(true);

  const handleGoogleLogin = () => {
    console.log('Google login');
    setIsOpen(false);
  };

  const handleAppleLogin = () => {
    console.log('Apple login');
    setIsOpen(false);
  };

  const handleEmailLogin = () => {
    setIsOpen(false);
    navigation.navigate('Login');
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      navigation.goBack();
    }, 300);
  };

  return (
    <ReusableBottomSheet
      isOpen={isOpen}
      onClose={handleClose}
      snapPoints={['50%', '60%']}
      showDragHandle={true}
      showCloseButton={true}
      enablePanDownToClose={true}
    >
      <View style={styles.titleContainer}>
        <Text style={styles.title}>
          Welcome to <Text style={styles.titleGradient}>aira</Text>
        </Text>
        <Text style={styles.subtitle}>
          Choose a method to login
        </Text>
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleGoogleLogin}
          activeOpacity={0.8}
        >
          <GoogleIcon />
          <Text style={styles.buttonText}>Continue With Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleAppleLogin}
          activeOpacity={0.8}
        >
          <AppleIcon />
          <Text style={styles.buttonText}>Continue With Apple</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleEmailLogin}
          activeOpacity={0.8}
        >
          <EmailIcon />
          <Text style={styles.buttonText}>Continue With Email</Text>
        </TouchableOpacity>
      </View>
    </ReusableBottomSheet>
  );
};


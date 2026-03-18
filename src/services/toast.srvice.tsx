import React from 'react';
import Toast, {
  BaseToast,
  ErrorToast,
  type ToastConfig,
} from 'react-native-toast-message';

export const showErrorToast = (message: string) => {
  Toast.show({
    type: 'error',
    text1: 'Error',
    text2: message,
  });
};

export const showSuccessToast = (message: string) => {
  Toast.show({
    type: 'success',
    text1: 'Success',
    text2: message,
  });
};

export const toastConfig: ToastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{
        backgroundColor: '#111111',
        borderLeftWidth: 0,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 8,
      }}
      contentContainerStyle={{ paddingHorizontal: 16 }}
      text1Style={{
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
      }}
      text2Style={{
        color: '#E0E0E0',
        fontSize: 12,
      }}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      style={{
        backgroundColor: '#2D0000',
        borderLeftWidth: 0,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 8,
      }}
      text1Style={{
        color: '#FFEBEB',
        fontSize: 14,
        fontWeight: '600',
      }}
      text2Style={{
        color: '#FFD1D1',
        fontSize: 12,
      }}
    />
  ),
};


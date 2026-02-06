declare module '@react-native-google-signin/google-signin' {
  import type { NativeModule } from 'react-native';

  export interface User {
    id?: string;
    name?: string;
    email?: string;
    givenName?: string;
    familyName?: string;
    photo?: string;
  }

  export interface UserInfo {
    user: User;
    idToken?: string;
    serverAuthCode?: string;
  }

  export interface PlayServicesOptions {
    showPlayServicesUpdateDialog?: boolean;
  }

  export interface ConfigureParams {
    webClientId?: string;
    iosClientId?: string;
    offlineAccess?: boolean;
    forceCodeForRefreshToken?: boolean;
  }

  export const statusCodes: {
    SIGN_IN_CANCELLED: string;
    IN_PROGRESS: string;
    PLAY_SERVICES_NOT_AVAILABLE: string;
  };

  export class GoogleSigninClass implements NativeModule {
    configure(config: ConfigureParams): void;
    hasPlayServices(options?: PlayServicesOptions): Promise<boolean>;
    signIn(): Promise<UserInfo>;
    signOut(): Promise<void>;
    revokeAccess(): Promise<void>;
  }

  export const GoogleSignin: GoogleSigninClass;
}



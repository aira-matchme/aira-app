export const endpoints = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
    sendOtp: '/auth/send-otp',
    verifyOtp: '/auth/verify-otp',
    resendOtp: '/auth/resend-otp',
    socialLogin: '/auth/social-login',
    liveness: '/auth/liveness-check',
    googleLogin: '/auth/google',
    appleLogin: '/auth/apple',
  },
  user: {
    profile: '/auth/profile',
    update: '/user/update',
    editProfile: '/auth/profile',
    self: '/auth/self',
    selfie: '/auth/selfie',
    uploadPhotos: '/auth/gallery',
  },
  question: {
    getQuestions: '/questions',
    answerQuestion: '/questions/answers',
  },
};
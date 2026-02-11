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
  },
  user: {
    profile: '/auth/profile',
    update: '/user/update',
    editProfile: '/auth/profile',
    self: '/auth/self',
    selfie: '/auth/selfie',
  },
  question: {
    getQuestions: '/questions',
    answerQuestion: '/questions/answers',
  },
};
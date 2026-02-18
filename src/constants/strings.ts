// String constants for the application
// All user-facing strings should be defined here to avoid hardcoding

export const STRINGS = {
  GENERAL: {
    ERROR_TRY_AGAIN: 'Something went wrong. Please try again.',
  },
  // Email Login Screen
  EMAIL_LOGIN: {
    TITLE: 'Enter your email',
    SUBTITLE: "You'll get an verification OTP on this email",
    PLACEHOLDER: 'Enter your email',
    CONTINUE: 'Continue',
    LOST_ACCESS: 'Lost access to your email?',
    ERROR_INCORRECT_EMAIL: 'Incorrect email address',
  },

  // Lost Access Email Screen
  LOST_ACCESS_EMAIL: {
    TITLE: 'Lost access to email?',
    SUBTITLE:
      'If you no longer have access to your registered email, you can update it securely.',
    REGISTERED_EMAIL_LABEL: 'Registered email (old email)',
    REGISTERED_EMAIL_PLACEHOLDER: 'Registered email (old email)',
    PHONE_NUMBER_LABEL: 'Phone number',
    PHONE_NUMBER_PLACEHOLDER: 'Phone number',
    NEW_EMAIL_LABEL: 'New email address',
    NEW_EMAIL_PLACEHOLDER: 'New email address',
    CONTINUE: 'Continue',
    ERROR_REQUIRED: 'This field is required',
    ERROR_INVALID_EMAIL: 'Please enter a valid email address',
    ERROR_INVALID_PHONE: 'Please enter a valid phone number',
  },

  // Login Options Screen
  LOGIN_OPTIONS: {
    TITLE: 'Welcome to',
    TITLE_APP_NAME: 'aira',
    SUBTITLE: 'Choose a method to login',
    CONTINUE_WITH_GOOGLE: 'Continue With Google',
    CONTINUE_WITH_APPLE: 'Continue With Apple',
    CONTINUE_WITH_EMAIL: 'Continue With Email',
  },

  // Welcome Screen
  WELCOME: {
    GET_STARTED: 'Get Started',
  },

  // OTP Verification Screen
  OTP_VERIFICATION: {
    TITLE_LINE_1: 'Enter the verification',
    TITLE_LINE_2: 'OTP sent to your email',
    SUBTITLE_PREFIX: 'Code sent to',
    VERIFY: 'Verify',
    VERIFYING: 'Verifying',
    VERIFIED: 'Verified',
    RESEND_OTP_IN: 'Resend OTP in',
    RESEND_OTP: 'Resend OTP',
    ERROR_REQUIRED: 'OTP is required',
    ERROR_INVALID_LENGTH: 'OTP must be 4 digits',
    ERROR_INVALID_OTP: 'Incorrect OTP',
  },

  // Enable Notifications Screen
  ENABLE_NOTIFICATIONS: {
    TITLE: 'Stay in the loop',
    SUBTITLE:
      'Aira uses notifications to keep you updated on matches, messages, and meaningful moments - without unnecessary noise.',
    PRIMARY_CTA: 'Enable Notifications',
    SECONDARY_CTA: 'May Be Later',
  },

  // Enable Location Screen
  ENABLE_LOCATION: {
    TITLE: 'Find people near to you',
    SUBTITLE:
      'AIRA uses your location to show matches within your state - so connections feel more relevant and real. We don’t track precise movement.',
    PRIMARY_CTA: 'Allow Location Access',
    SECONDARY_CTA: 'May Be Later',
  },
  // Profile Intro Screen
  PROFILE_INTRO: {
    TITLE: "Let's find the right connection!",
    SUBTITLE:
      'Answer a few questions to get started\nyou can change your preferences anytime.',
    PRIMARY_CTA: 'Start setup',
    SECONDARY_CTA: '',
  },

  // Profile Setup Screens
  PROFILE_SETUP: {
    COMMON: {
      CONTINUE: 'Next',
    },
    NAME: {
      TITLE: 'What should we call you?',
      SUBTITLE: 'This is how your name will appear on your profile.',
      PLACEHOLDER: 'Enter your user name',
    },
    DOB: {
      TITLE: "When's your birthday?",
      SUBTITLE:
        'Used to show age on your profile and improve match relevance.',
      ERROR_MIN_AGE: 'You must be at least 18 years old',
    },
    GENDER: {
      TITLE: 'What best describes you?',
      SUBTITLE:
        'This helps us personalize your experience. You can change it anytime.',
      OPTIONS: {
        MAN: 'Man',
        WOMAN: 'Woman',
        PREFER_NOT_TO_SAY: 'Other',
      },
    },
    HEIGHT: {
      TITLE: 'How tall are you?',
      SUBTITLE:
        'This helps us fine-tune compatibility and profile balance. You can update it anytime.',
      PLACEHOLDER: 'Enter your height',
      UNIT_CM: 'cm',
      UNIT_FT: 'ft',
    },
    EDUCATION: {
      TITLE: "What's your highest level of education?",
      SUBTITLE: 'Helps us suggest more aligned profiles.',
      OPTIONS: {
        PHD: 'PhD/ Dr',
        MASTER: 'Master or equivalent',
        A_LEVEL: 'A level or equivalent',
        GCSE: 'GCSE or equivalent',
        OTHER: 'Other',
      },
    },
    EMPLOYMENT: {
      TITLE: "What's your current employment status?",
      SUBTITLE: 'Used to understand lifestyle compatibility.',
      OPTIONS: {
        EMPLOYED: 'Employed',
        SELF_EMPLOYED: 'Self-employed',
        UNEMPLOYED: 'Unemployed',
        STUDENT: 'Student',
     NOT_WORKING: 'Not currently working',
     PREFER_NOT_TO_SAY: 'Prefer not to say',
      },
    },
    FINAL: {
      TITLE: "What's your income range?",
      SUBTITLE: 'We only use ranges. Exact numbers are never shown.',
      SUBTITLE_SECONDARY: '(Range $20,000 - $500,000)',
      OPTIONS: {
        BETWEEN_20000_AND_30000: '$20k - $30k',
        BETWEEN_30000_AND_40000: '$30k - $40k',
        BETWEEN_40000_AND_50000: '$40k - $50k',
        OVER_50000: '$50k+',
        PREFER_NOT_TO_SAY: 'Prefer not to say',
      },
      PLACEHOLDER: 'Enter your income range',
    },
    PINCODE: {
      TITLE: "Let's find people around you",
      SUBTITLE: "We use this to prioritize nearby matches.",
      PLACEHOLDER: 'Enter your pincode',
    },
    FACE_VERIFICATION: {
      TITLE: 'Quick face\nverification',
      DESCRIPTION: 'Your selfie is used only for verification and isn\'t shown on your profile.',
      BULLET_1: 'Your verification selfie is securely stored',
      BULLET_2: "It's never shared with other users",
      BULLET_3: 'You can re-verify anytime from settings',
      BUTTON: 'Start Verification',
      PERMISSION_TITLE: '"Aira" Would Like to Access Your Camera',
      PERMISSION_DESCRIPTION: 'Aira uses your camera to verify your identity and ensure account security. Your selfie is only used for verification and is never shared.',
    },
    VIDEO_VERIFICATION: {
      TITLE: 'Quick video\nverification',
      DESCRIPTION: 'Your video is used only for verification and isn\'t shown on your profile.',
      BULLET_1: 'Your verification video is securely stored',
      BULLET_2: "It's never shared with other users",
      BULLET_3: 'You can re-verify anytime from settings',
      BUTTON: 'Start Verification',
      PERMISSION_TITLE: '"Aira" Would Like to Access Your Camera',
      PERMISSION_DESCRIPTION: 'Aira uses your camera to verify your identity with a short video. Your video is only used for verification and is never shared.',
    },
    SELFIE_CAMERA: {
      TITLE: 'Selfie verification',
      SUBTITLE: 'Keep your face within the frame',
      TIP_1: 'Make sure your face is well lit',
      TIP_2: 'Hold still for a moment',
      BUTTON: 'Take Photo',
      VERIFYING_TITLE: 'Verifying your selfie',
      VERIFYING_SUBTITLE: 'Please wait while we verify your identity',
      VERIFIED_TITLE: "You're verified",
      VERIFIED_SUBTITLE: 'Your identity has been successfully verified.',
      CONTINUE: 'Continue',
    },
    PROFILE_PHOTOS: {
      TITLE: 'Show different sides of you',
      BULLET_1: 'First photo will be your profile picture',
      BULLET_2: 'Min. 2 Required',
      BULLET_3: 'Tap to edit, drag to reorder',
      CONTINUE: 'Continue',
      MATCHES_TIP: 'Profiles with more photos get 5x more matches.',
      CHOOSE_ACTION_TITLE: 'Choose An Action',
      CAMERA: 'Camera',
      GALLERY: 'Gallery',
      CAMERA_PERMISSION_TITLE: 'AIRA Would Like To Access The Camera',
      CAMERA_PERMISSION_DESCRIPTION:
        'AIRA uses the camera to take photos and videos for profile verification. These can be managed in Settings.',
      PHOTOS_PERMISSION_TITLE: 'AIRA Would Like To Access Your Photos',
      PHOTOS_PERMISSION_DESCRIPTION:
        'AIRA uses your photos to let you upload images to your profile. These can be managed in Settings.',
      ALLOW: 'Allow',
    },
  },
  ONBOARDING_QUESTIONS: {
    PRIMARY_INTENT: {
      TITLE: 'You are dating\nprimarily to..',
      STEP_LABEL: '1/10',
      OPTIONS: {
        LIFE_PARTNER: 'Find a life partner',
        BUILD_COMMITMENT: 'Build toward commitment',
        SEE_WHERE_THINGS_GO: 'See where things go',
        ENJOY_CONNECTION: 'Enjoy connection',
        KEEP_CASUAL: 'Keep things casual',
      },
      PRIMARY_CTA: 'Next',
    },
  },
  ONBOARDING_MULTI_QUESTIONS: {
    CONNECTION_GOALS: {
      TITLE: 'What are you open to?\nSelect all that apply.',
      STEP_LABEL: '2/10',
      OPTIONS: {
        LONG_TERM: 'Long-term relationship',
        MARRIAGE: 'Open to marriage',
        COMPANIONSHIP: 'Meaningful companionship',
        CASUAL: 'Something casual',
        FRIENDSHIP: 'Friendship that may grow',
      },
      PRIMARY_CTA: 'Next',
      HELPER_TEXT: 'You can choose more than one option.',
    },
  },
  ONBOARDING_CARD_QUESTIONS: {
    RELATIONSHIP_PRIORITY: {
      TITLE: 'What matters more to\nyou in a relationship?',
      STEP_LABEL: '2/8',
      OPTIONS: {
        EMOTIONAL_CONNECTION: 'Emotional connection',
        TRUST_STABILITY: 'Trust and stability',
        SHARED_GOALS: 'Shared Goals',
        PASSION_EXCITEMENT: 'Passion and excitement',
      },
      PRIMARY_CTA: 'Next',
    },
  },
  ONBOARDING_BOOLEAN_QUESTIONS: {
    WEEKEND_IDEAL: {
      TITLE: 'After a long week, your\nideal weekend is..',
      STEP_LABEL: '1/10',
      YES_LABEL: 'Yes',
      NO_LABEL: 'No',
      PRIMARY_CTA: 'Next',
      SKIP: 'Skip',
    },
  },
  ONBOARDING_PHOTO_QUESTIONS: {
    PHOTO_VIBES: {
      TITLE: 'Which vibe feels\nmost like you?',
      STEP_LABEL: '3/10',
      PRIMARY_CTA: 'Next',
      HELPER_TEXT: 'Pick the photo that best matches your everyday vibe.',
      OPTIONS: {
        CALM_GROUNDED: 'Calm & grounded',
        ADVENTUROUS: 'Adventurous & outgoing',
        CREATIVE: 'Creative & expressive',
        SOCIAL: 'Social & energetic',
      },
    },
  },
  ONBOARDING_INTRO: {
    TITLE: 'Help us personalize your matches',
    DESCRIPTION: 'Our AI uses these answers to understand compatibility beyond profiles - values, mindset, and lifestyle.',
    TIME_ESTIMATE: 'Time estimate (2–3 minutes)',
    PRIMARY_CTA: "Let's begin",
    PRIVACY_NOTE: 'Your answers stay private and only improve your matches.',
  },
  PREFERENCES: {
    FINE_TUNE_TITLE: 'Fine-tune your matches.',
    FINE_TUNE_SUBTITLE: 'Make quick changes - you can always adjust more later.',
    CANCEL: 'Cancel',
    SAVE: 'Save',
    AGE_YEARS: (val: number) => `${val} yrs`,
    HEIGHT_CM: (val: number) => `${val} cm`,
    DISTANCE_MILES: (val: number) => `${val} miles`,
  },
} as const;


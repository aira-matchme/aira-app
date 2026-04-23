// String constants for the application
// All user-facing strings should be defined here to avoid hardcoding

export const STRINGS = {
  GENERAL: {
    ERROR_TRY_AGAIN: 'Something went wrong. Please try again.',
    NO_INTERNET_TITLE: 'No internet connection',
    NO_INTERNET_MESSAGE:
      'Please check your Wi-Fi or mobile data and try again.',
  },

  /** Android in-app update sheet — Figma node 3557-13281 (single CTA; no Remind me later). */
  APP_UPDATE: {
    TITLE: 'Update available',
    MESSAGE:
      'A new version of Aira is ready with improvements and fixes. Update now to get the latest experience.',
    CTA: 'Update now',
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

  /** App tab walkthrough — Home + main tabs (Figma frames 517–573). */
  DASHBOARD_WALKTHROUGH: {
    WELCOME_TITLE: 'Welcome to Aira',
    WELCOME_BODY:
      'Discover, connect, and explore profiles around you.',
    /** Legacy: title + body (walkthrough UI uses STEP_*_TITLE / TAB separately). */
    WELCOME_COPILOT: `Welcome to Aira\n\nDiscover, connect, and explore profiles around you.`,
    GET_STARTED: 'Get Started',
    NEXT: 'Next',
    SKIP: 'Skip',
    PREVIOUS: 'Back',
    STEP_PROFILE_TITLE: 'Your Profile',
    STEP_PROFILE_TAB:
      'Manage your profile, preferences, and showcase your personality.',
    STEP_LIKES_TITLE: 'Your Liked Profiles',
    STEP_LIKES_TAB:
      "Here you can find all the profiles you've liked. Explore them anytime when you feel ready to connect.",
    STEP_AI_TITLE: 'Talk to Aira AI',
    STEP_AI_TAB:
      "Hi, use this with one of its kind to get smart and helpful advice on effective matching, relationship advice and much more. To get Aira's help quickly, just tap the AI button and start a conversation instantly.",
    STEP_CHAT_TITLE: 'Chat with Matches',
    STEP_CHAT_TAB:
      'Chat with your matches anytime and get to know each other better. Share conversations, share your thoughts, and build a real connection. Just open a chat and start talking instantly.',
    STEP_HOME_TITLE: 'Home',
    STEP_HOME_TAB:
      'Explore profiles, discover new people, and find your next match right from home. Whenever you swipe through cards, you can find someone who matches your vibe — take your time, and pull down on the list anytime to refresh your matches.',
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
    ERROR_INVALID_LENGTH: 'OTP must be 6 digits',
    ERROR_INVALID_OTP: 'Incorrect OTP',
    ERROR_DEVICE_TOKEN:
      'Please enable notifications so we can process your OTP request. Allow notifications for Aira in Settings, then tap Verify again.',
  },

  // Enable Notifications Screen
  ENABLE_NOTIFICATIONS: {
    TITLE: 'Stay in the loop',
    SUBTITLE:
      'Aira uses notifications to keep you updated on matches, messages, and meaningful moments - without unnecessary noise.',
    PRIMARY_CTA: 'Enable Notifications',
    SECONDARY_CTA: 'May Be Later',
    SHEET_TITLE: 'Aira would like to send you notifications',
    SHEET_DESCRIPTION:
      'Notifications may include alerts, sounds, and icon badges. These can be configured in Settings.',
    SHEET_ALLOW: 'Allow',
    SHEET_DONT_ALLOW: "Don't Allow",
  },

  // Profile Intro Screen
  PROFILE_INTRO: {
    TITLE: "Let's find the right connection!",
    SUBTITLE:
      'Answer a few questions to get started\nyou can change your preferences anytime.',
    PRIMARY_CTA: 'Start setup',
    SECONDARY_CTA: '',
  },

  /** Profile tab: logout confirmation bottom sheet (Figma 3202-15209) */
  PROFILE_TAB: {
    LOGOUT_TITLE: 'Leaving so soon?',
    LOGOUT_MESSAGE:
      'Your matches and conversations will be right here when you return',
    STAY: 'Stay',
    LOGOUT: 'Logout',
    DELETE_ACCOUNT: 'Delete Account',
    DELETE_ACCOUNT_TITLE: 'Delete account?',
    DELETE_ACCOUNT_MESSAGE:
      'This action is permanent. Your profile, matches, and conversations will be removed.',
    DELETE_REASON_PLACEHOLDER: 'Tell us why you are leaving...',
    CANCEL: 'Keep Account',
    DELETE: 'Delete Account',
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
        'This helps us personalize your experience.',
      OPTIONS: {
        MAN: 'Man',
        WOMAN: 'Woman',
        PREFER_NOT_TO_SAY: 'Other',
      },
    },
    BODY_TYPE: {
      TITLE: 'Select your body type',
      SUBTITLE: 'How would you describe your body type?',
    },
    HEIGHT: {
      TITLE: 'How tall are you?',
      SUBTITLE:
        'This helps us fine-tune compatibility and profile balance.',
      PLACEHOLDER: 'Enter your height',
      UNIT_CM: 'cm',
      UNIT_FT: 'ft',
    },
    EDUCATION: {
      TITLE: "What's your highest level of education?",
      SUBTITLE: 'Helps us suggest more aligned profiles.',
      OPTIONS: {
        PHD: 'PhD/ Dr',
        MASTER: 'Master or above',
        DEGREE: 'Degree or above',
        A_LEVEL: 'A level or above',
        GCSE: 'GCSE or above',
        ANY: 'Any',
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
      },
    },
    FINAL: {
      TITLE: "What's your income range?",
      SUBTITLE: 'We only use ranges. Exact numbers are never shown.',
      SUBTITLE_SECONDARY: '(Shown in £ thousands)',
      OPTIONS: {
        RANGE_0_20: '£0k - £20k',
        BETWEEN_20000_AND_30000: '£20k - £30k',
        BETWEEN_30000_AND_40000: '£30k - £40k',
        BETWEEN_40000_AND_50000: '£40k - £50k',
        OVER_50000: '£50k+',
      },
      PLACEHOLDER: 'Enter your income range',
    },
    MARITAL: {
      TITLE: "What's your Marital status?",
      SUBTITLE: "What's your relationship status?",
      OPTIONS: {
        NEVER_MARRIED: 'Never Married',
        DIVORCED: 'Divorced',
        WIDOWED: 'Widowed',
        SEPARATED: 'Separated',
      },
    },
    CHILDREN: {
      TITLE: 'Do you have children?',
      SUBTITLE:
        'This information helps match you with people who align with your lifestyle and future plans.',
      OPTIONS: {
        NO: 'No',
        ONE: '1 Child',
        TWO: '2 Children',
        THREE_OR_MORE: '3 or more',
      },
    },
    INTERESTS: {
      TITLE: 'What do you enjoy doing?',
      SUBTITLE: 'Choose at least 2 from each section.',
      SELECTED_COUNT: (current: number, min: number) => `${current}/${min} selected`,
    },
    PINCODE: {
      TITLE: "Let's find people around you",
      SUBTITLE: "We use this to prioritize nearby matches.",
      PLACEHOLDER: 'Enter your pincode',
      ERROR_NOT_FOUND: "We couldn't find this postcode. Please check it and try again.",
    },
    FACE_VERIFICATION: {
      TITLE: 'Quick face\nverification',
      DESCRIPTION: 'Your selfie is used only for verification and isn\'t shown on your profile.',
      BULLET_1: 'Your verification selfie is securely stored',
      BULLET_2: "It's never shared with other users",
      BUTTON: 'Start Verification',
      PERMISSION_TITLE: 'Aira Would Like to Access Your Camera',
      PERMISSION_DESCRIPTION: 'Aira uses your camera to verify your identity and ensure account security. Your selfie is only used for verification and is never shared.',
      CAMERA_DENIED_TITLE: 'Camera access is turned off',
      CAMERA_DENIED_MESSAGE:
        'To continue, allow camera access for Aira in Settings. You can turn it on and return here.',
      OPEN_SETTINGS: 'Open Settings',
      CAMERA_DENIED_CANCEL: 'Not now',
    },
    VIDEO_VERIFICATION: {
      TITLE: 'Quick video\nverification',
      DESCRIPTION: 'Your video is used only for verification and isn\'t shown on your profile.',
      BULLET_1: 'Your verification video is securely stored',
      BULLET_2: "It's never shared with other users",
      BUTTON: 'Start Verification',
      PERMISSION_TITLE: 'Aira Would Like to Access Your Camera',
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
      DONT_ALLOW: "Don't Allow",
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
  PREFERENCES_START: {
    TITLE: "Let's shape your matches",
    DESCRIPTION:
      'Set your preferences to get started. You can fine-tune them anytime.',
    PRIMARY_CTA: 'Proceed',
  },
  /** Reference image taste test — Figma 3339:6759 */
  REFERENCE_IMAGE_INTRO: {
    TITLE: "Now let's see what you're drawn to",
    SUBTITLE:
      "You'll be shown pairs of photos. Just tap the one that appeals to you more — there's no right answer.",
    PRIMARY_CTA: 'Start',
  },
  PREFERENCES_GENDER: {
    TITLE: 'Who would you like to meet?',
    SUBTITLE: 'Select one option.',
    MAN: 'Man',
    WOMAN: 'Woman',
  },
  PREFERENCES_AGE: {
    TITLE: 'What age range feels right?',
    SUBTITLE: 'You can adjust this anytime.',
  },
  PREFERENCES_HEIGHT: {
    TITLE: 'Is height important to you?',
    SUBTITLE: 'Set your preferred range.',
  },
  PREFERENCES_DISTANCE: {
    TITLE: 'How far should we search?',
    SUBTITLE: "We'll prioritize matches within this distance.",
  },
  PREFERENCES_EDUCATION: {
    TITLE: 'Education preference',
    SUBTITLE:
      "What is the minimum education level you'd like matches to have? We'll show people at that level or higher.",
    PHD_DR: 'PhD/ Dr',
    MASTER: 'Master or above',
    DEGREE_OR_ABOVE: 'Degree or above',
    A_LEVEL_OR_ABOVE: 'A level or above',
    GCSE_OR_ABOVE: 'GCSE or above',
    ANY: 'Any',
  },
  PREFERENCES_EMPLOYMENT: {
    TITLE: 'Employment preference',
    SUBTITLE: 'Choose what aligns with you.',
    EMPLOYED: 'Employed',
    SELF_EMPLOYED: 'Self-employed',
    STUDENT: 'Student',
    UNEMPLOYED: 'Unemployed',
    PREFER_NOT_TO_SAY: 'Prefer not to say',
  },
  PREFERENCES_INCOME: {
    TITLE: 'Income preference',
    SUBTITLE: 'Optional - only if this matters to you.',
    RANGE_0_20: 'Any income',
    RANGE_20_30: '£20k or greater',
    RANGE_30_40: '£30k or greater',
    RANGE_40_50: '£40k or greater',
    ABOVE_50: '£50k or greater',
  },
  PREFERENCES_RELIGION: {
    TITLE: 'Religious preference',
    SUBTITLE: 'Select all the religions you are comfortable matching with.',
  },
  PREFERENCES_MARITAL_STATUS: {
    TITLE: 'Marital status preference',
    SUBTITLE: "Select what you're comfortable with.",
    NEVER_MARRIED: 'Never Married',
    DIVORCED: 'Divorced',
    WIDOWED: 'Widowed',
    SEPARATED: 'Separated',
  },
  PREFERENCES_BODY_TYPE: {
    TITLE: 'Body type preference',
    SUBTITLE: 'Arrange these options in order of your preference. You can change this anytime.',
    HOW_IT_WORKS: 'How it works: Drag to reorder from most preferred (1) to least preferred (5).',
    TONED: 'Toned',
    SLIM: 'Slim',
    MEDIUM: 'Medium',
    CURVY: 'Curvy',
    PLUS_SIZED: 'Plus-sized',
  },
  PREFERENCES_SUMMARY: {
    TITLE: "Let's shape your matches",
    SUBTITLE: "We've set a few preferences to get you started. You can fine-tune them anytime.",
    SUBTITLE_NOTE: "(You're always in control — these can be changed anytime)",
    GET_STARTED: 'Get Started',
    LABEL_GENDER: 'Gender',
    LABEL_AGE: 'Age',
    LABEL_HEIGHT: 'Height',
    LABEL_DISTANCE: 'Distance Within',
    LABEL_EDUCATION: 'Education',
    LABEL_EMPLOYMENT: 'Employment',
    LABEL_INCOME: 'Income',
    LABEL_RELIGION: 'Religion',
    LABEL_MARITAL_STATUS: 'Marital Status',
    LABEL_BODY_TYPE: 'Body type',
    REQUIRED: 'Required',
  },
  REFERENCE_IMAGE_PREFERENCE: {
    TITLE: 'Which of these do you find more attractive?',
    SIMILAR_IMAGES_HINT:
      'These images may look very similar or almost identical. Please tap the one you find most attractive.',
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
  LIKES: {
    TITLE: 'Liked Profiles',
    SUBTITLE: "Profiles you've saved to explore when the moment feels right",
    EMPTY_TITLE: 'Nobody here yet',
    EMPTY_DESCRIPTION:
      'Your liked profiles live here. Time to head back and find someone interesting.',
  },
  BLOCKED_USERS: {
    MENU: 'Blocked',
    TITLE: 'Blocked',
    SECTION_TITLE: 'Blocked profiles',
    NOTE:
      "Note: Blocked users can't see your profile, send messages, or find you on Aira.",
    EMPTY: 'You haven’t blocked anyone.',
    UNBLOCK: 'Unblock',
    UNBLOCKED: 'User unblocked.',
    UNBLOCK_FAILED: 'Could not unblock. Try again.',
    LOAD_ERROR: 'Could not load the list. Try again.',
  },
  NOTIFICATIONS: {
    TITLE: 'Notifications',
    TAB_ALL: 'All',
    TAB_UNREAD: 'Unread',
    EMPTY_ALL: 'No notifications yet.',
    EMPTY_UNREAD: "You're all caught up.",
    LOAD_ERROR: 'Could not load notifications. Try again.',
    OPEN_CHAT_FAILED: 'Could not open this chat. Try again from Messages.',
    MATCH_OPEN_FAILED: 'Could not open this profile.',
    /** Relative timestamps — match Figma 2586-6121 copy */
    TIME_ONE_MIN_AGO: '1 min ago',
    TIME_N_MINS_AGO: '{n} mins ago',
    TIME_ONE_HOUR_AGO: '1 hour ago',
    TIME_N_HOURS_AGO: '{n} hours ago',
  },
  CHAT: {
    TITLE: 'Messages',
    TAB_CHATS: 'Chats',
    TAB_REQUESTS: 'Requests',
    EMPTY_MESSAGE: 'People who message you will show up here',
    REQUESTS_EMPTY_MESSAGE: 'Message requests will show up here',
    PREVIEW_HEY: 'Hey there!',
    DRAFT_PREFIX: 'Draft:',
    DRAFT_PREVIEW: 'He',
    /** Chat list when the last message is a photo and there is no caption */
    LAST_MESSAGE_PHOTO: 'Photo',
    JUST_NOW: 'Just Now',
    YESTERDAY: 'Yesterday',
    PIN_CHAT: 'Pin Chat',
    UNPIN_CHAT: 'Unpin Chat',
    REPLY: 'Reply',
    REPLYING_TO: 'Replying to',
    YOU: 'You',
    DELETE: 'Delete',
    DELETE_MESSAGE_TITLE: 'Delete This Message?',
    DELETE_MESSAGE_DESCRIPTION: 'This message will be removed from your conversation.',
    CANCEL: 'Cancel',
    START_CHAT_PLACEHOLDER: 'Start chat..',
    INSERT: 'Insert',
    ASK_AIRA: 'Ask AIRA',
    GENERATING_REPLIES: 'Generating replies..',
    TODAY: 'Today',
    SENT_MSG: 'Hey there!',
    RECEIVED_MSG: 'Hello!',
    TIME_8_12: '8:12 pm',
    TIME_8_13: '8:13 pm',
    TIME_8_15: '8:15 pm',
    ATTACH_CAMERA: 'Camera',
    ATTACH_GALLERY: 'Gallery',
    ATTACH_FILES: 'Files',
    GIF_BUTTON: 'GIF',
    GIF_PICKER_TITLE: 'Search GIFs',
    GIF_PICKER_SEARCH_PLACEHOLDER: 'Search Tenor…',
    GIF_PICKER_ERROR: 'Could not load GIFs. Try again.',
    GIF_PICKER_NO_KEY:
      'Add TENOR_API_KEY to your .env file (see Google Tenor API quickstart).',
    GIF_PICKER_EMPTY: 'No GIFs found',
    VOICE_DURATION: (min: number, sec: number) => `${min}:${sec.toString().padStart(2, '0')}`,
    BLOCK: 'Block',
    REPORT: 'Report',
    ACCEPT: 'Accept',
    DECLINE: 'Decline',
    BLOCK_AND_REPORT: 'Block & Report',
    BLOCK_SUCCESS:
      'Blocked. They can no longer message you or see your profile.',
    BLOCK_FAILED: 'Could not block this person. Try again.',
    REPORT_SUBMITTED:
      'Report sent. Our team will review it. You will not see case updates here for privacy reasons.',
    REPORT_FAILED: 'Could not send your report. Try again.',
    BLOCK_REPORT_SUBMITTED:
      'They have been blocked and your report was sent. Our team will review it.',
    BLOCK_REPORT_FAILED: 'Could not block and report. Try again.',
    LOADING_MESSAGES: 'Loading messages...',
    TYPING_INDICATOR: 'typing...',
    MICROPHONE_PERMISSION_TITLE: 'AIRA Would Like To Access The Microphone',
    MICROPHONE_PERMISSION_DESCRIPTION:
      'AIRA uses the microphone to record and send voice messages in chat. These can be managed in Settings.',
  },
} as const;


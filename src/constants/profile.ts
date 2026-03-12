/**
 * Profile module constants.
 * Use these across onboarding, edit-profile, and other profile-related screens.
 */

import { STRINGS } from './strings';

// ─── Religion (edit profile API: christian, judaism, islam, hinduism, buddhism, sikhism, agnostic, other, no_religion) ───
export const RELIGION_API_VALUES = [
  'christian',
  'judaism',
  'islam',
  'hinduism',
  'buddhism',
  'sikhism',
  'agnostic',
  'other',
  'no_religion',
] as const;

export type ReligionApiValue = (typeof RELIGION_API_VALUES)[number];

export const RELIGION_OPTIONS: { key: ReligionApiValue; label: string }[] = [
  { key: 'christian', label: 'Christian' },
  { key: 'judaism', label: 'Judaism' },
  { key: 'islam', label: 'Islam' },
  { key: 'hinduism', label: 'Hinduism' },
  { key: 'buddhism', label: 'Buddhism' },
  { key: 'sikhism', label: 'Sikhism' },
  { key: 'agnostic', label: 'Agnostic' },
  { key: 'other', label: 'Other' },
  { key: 'no_religion', label: 'No Religion' },
];

// ─── Gender (edit profile API: male, female, other) ───
export const GENDERS = ['male', 'female', 'other'] as const;

export type GenderApiValue = (typeof GENDERS)[number];

export const GENDER_OPTIONS: { key: GenderApiValue; label: string }[] = [
  { key: 'male', label: STRINGS.PROFILE_SETUP.GENDER.OPTIONS.MAN },
  { key: 'female', label: STRINGS.PROFILE_SETUP.GENDER.OPTIONS.WOMAN },
];

// ─── Education (keys are backend values) ───
export const EDUCATION_OPTIONS: { key: string; label: string }[] = [
  { key: 'phd_dr', label: STRINGS.PROFILE_SETUP.EDUCATION.OPTIONS.PHD },
  { key: 'masters_or_equivalent', label: STRINGS.PROFILE_SETUP.EDUCATION.OPTIONS.MASTER },
  { key: 'degree_or_equivalent', label: STRINGS.PROFILE_SETUP.EDUCATION.OPTIONS.A_LEVEL },
  { key: 'gcse_or_equivalent', label: STRINGS.PROFILE_SETUP.EDUCATION.OPTIONS.GCSE },
  { key: 'other', label: STRINGS.PROFILE_SETUP.EDUCATION.OPTIONS.OTHER },
];

// ─── Employment (keys are backend values) ───
export const EMPLOYMENT_OPTIONS: { key: string; label: string }[] = [
  { key: 'employed', label: STRINGS.PROFILE_SETUP.EMPLOYMENT.OPTIONS.EMPLOYED },
  { key: 'self_employed', label: STRINGS.PROFILE_SETUP.EMPLOYMENT.OPTIONS.SELF_EMPLOYED },
  { key: 'student', label: STRINGS.PROFILE_SETUP.EMPLOYMENT.OPTIONS.STUDENT },
  { key: 'unemployed', label: STRINGS.PROFILE_SETUP.EMPLOYMENT.OPTIONS.NOT_WORKING },
  { key: 'prefer_not_to_say', label: STRINGS.PROFILE_SETUP.EMPLOYMENT.OPTIONS.PREFER_NOT_TO_SAY },
];

// ─── Income (keys are backend values) ───
export const INCOME_OPTIONS: { key: string; label: string }[] = [
  { key: 'eur_20k_30k', label: STRINGS.PROFILE_SETUP.FINAL.OPTIONS.BETWEEN_20000_AND_30000 },
  { key: 'eur_30k_40k', label: STRINGS.PROFILE_SETUP.FINAL.OPTIONS.BETWEEN_30000_AND_40000 },
  { key: 'eur_40k_50k', label: STRINGS.PROFILE_SETUP.FINAL.OPTIONS.BETWEEN_40000_AND_50000 },
  { key: 'eur_50k_plus', label: STRINGS.PROFILE_SETUP.FINAL.OPTIONS.OVER_50000 },
  { key: 'prefer_not_to_say', label: STRINGS.PROFILE_SETUP.EMPLOYMENT.OPTIONS.PREFER_NOT_TO_SAY },
];

// ─── DOB picker ───
export const DOB_MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export const DOB_DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

export const DOB_YEARS = Array.from(
  { length: 100 },
  (_, i) => new Date().getFullYear() - 18 - i
);

// ─── Marital status (after religion, before pincode) ───
export const MARITAL_API_VALUES = [
  'never_married',
  'divorced',
  'widowed',
  'separated',
] as const;

export type MaritalApiValue = (typeof MARITAL_API_VALUES)[number];

export const MARITAL_OPTIONS: { key: MaritalApiValue; label: string }[] = [
  { key: 'never_married', label: 'Never Married' },
  { key: 'divorced', label: 'Divorced' },
  { key: 'widowed', label: 'Widowed' },
  { key: 'separated', label: 'Separated' },
];

// ─── Children (after marital status, before pincode) ───
export const CHILDREN_API_VALUES = [
  'no',
  '1_child',
  '2_children',
  '3_or_more',
] as const;

export type ChildrenApiValue = (typeof CHILDREN_API_VALUES)[number];

export const CHILDREN_OPTIONS: { key: ChildrenApiValue; label: string }[] = [
  { key: 'no', label: 'No' },
  { key: '1_child', label: '1 Child' },
  { key: '2_children', label: '2 Children' },
  { key: '3_or_more', label: '3 or more' },
];

// ─── Ethnicity (after children – optional) ───
export type EthnicityGroup = 'White' | 'Black' | 'Brown' | 'Asian';

export type EthnicityOption = {
  key: string;
  label: string;
  groups: EthnicityGroup[];
};

export const ETHNICITY_OPTIONS: EthnicityOption[] = [
  // Asian / Brown
  { key: 'indian_subcontinent', label: 'Indian Subcontinent', groups: ['Brown'] },
  { key: 'chinese', label: 'Chinese', groups: ['Asian'] },
  { key: 'arab', label: 'Arab', groups: ['Brown'] },
  { key: 'any_other_asian', label: 'Any other Asian background', groups: ['Asian'] },

  // Black, Black British, Caribbean or African
  { key: 'caribbean', label: 'Caribbean', groups: ['Black'] },
  { key: 'african', label: 'African', groups: ['Black'] },
  { key: 'other_black', label: 'Any other Black, Black British, or Caribbean background', groups: ['Black'] },

  // Mixed or multiple ethnic groups
  { key: 'white_black_caribbean', label: 'White and Black Caribbean', groups: ['White', 'Black'] },
  { key: 'white_black_african', label: 'White and Black African', groups: ['White', 'Black'] },
  { key: 'white_asian', label: 'White and Asian', groups: ['White', 'Brown', 'Asian'] },
  { key: 'other_mixed', label: 'Any other Mixed or multiple ethnic background', groups: ['White', 'Black', 'Brown', 'Asian'] },

  // White
  { key: 'white_british', label: 'English, Welsh, Scottish, Northern Irish or British', groups: ['White'] },
  { key: 'white_irish', label: 'Irish', groups: ['White'] },
  { key: 'gypsy_traveller', label: 'Gypsy or Irish Traveller', groups: ['White'] },
  { key: 'roma', label: 'Roma', groups: ['White'] },
  { key: 'other_white', label: 'Any other White background', groups: ['White'] },
];

// ─── Interests / Hobbies (after children, before pincode) ───
export type InterestOption = { key: string; label: string };

export type InterestCategory = {
  id: string;
  label: string;
  options: InterestOption[];
};

export const INTEREST_CATEGORIES: InterestCategory[] = [
  {
    id: 'sports_fitness',
    label: 'Sports & Fitness',
    options: [
      { key: 'gym_fitness', label: 'Gym / Fitness' },
      { key: 'running', label: 'Running' },
      { key: 'walking_rambling', label: 'Walking / Rambling' },
      { key: 'hiking', label: 'Hiking' },
      { key: 'cycling', label: 'Cycling' },
      { key: 'swimming', label: 'Swimming' },
      { key: 'yoga_pilates', label: 'Yoga / Pilates' },
      { key: 'football', label: 'Football' },
      { key: 'rugby', label: 'Rugby' },
      { key: 'cricket', label: 'Cricket' },
      { key: 'tennis', label: 'Tennis' },
      { key: 'badminton', label: 'Badminton' },
      { key: 'golf', label: 'Golf' },
      { key: 'horse_riding', label: 'Horse Riding' },
      { key: 'boxing_martial_arts', label: 'Boxing / Martial arts' },
      { key: 'climbing_bouldering', label: 'Climbing / Bouldering' },
      { key: 'crossfit', label: 'CrossFit' },
      { key: 'home_workouts', label: 'Home workouts' },
      { key: 'watching_sports', label: 'Watching sports' },
    ],
  },
  {
    id: 'social_lifestyle',
    label: 'Social & Lifestyle',
    options: [
      { key: 'going_to_the_pub', label: 'Going to the pub' },
      { key: 'clubbing_bars', label: 'Clubbing / Bars' },
      { key: 'craft_beer', label: 'Craft beer' },
      { key: 'wine_tasting', label: 'Wine tasting' },
      { key: 'cocktail_bars', label: 'Cocktail bars' },
      { key: 'brunch', label: 'Brunch' },
      { key: 'coffee_shops', label: 'Coffee shops' },
      { key: 'sunday_roast', label: 'Sunday roast' },
      { key: 'eating_out', label: 'Eating out' },
      { key: 'street_food_markets', label: 'Street food markets' },
      { key: 'board_game_nights', label: 'Board game nights' },
      { key: 'quiz_nights', label: 'Quiz nights' },
      { key: 'house_parties', label: 'House parties' },
      { key: 'festivals', label: 'Festivals' },
      { key: 'comedy_nights', label: 'Comedy nights' },
    ],
  },
  {
    id: 'gaming_digital',
    label: 'Gaming & Digital Culture',
    options: [
      { key: 'video_gaming', label: 'Video gaming' },
      { key: 'pc_gaming', label: 'PC gaming' },
      { key: 'console_gaming', label: 'Console gaming' },
      { key: 'mobile_games', label: 'Mobile games' },
      { key: 'esports', label: 'Esports' },
      { key: 'streaming_twitch_youtube', label: 'Streaming (Twitch/YouTube)' },
      { key: 'anime', label: 'Anime' },
      { key: 'manga', label: 'Manga' },
      { key: 'tech_gadgets', label: 'Tech & gadgets' },
      { key: 'coding_programming', label: 'Coding / programming' },
    ],
  },
  {
    id: 'travel_outdoors',
    label: 'Travel & Outdoors',
    options: [
      { key: 'travelling_abroad', label: 'Travelling abroad' },
      { key: 'city_breaks', label: 'City breaks' },
      { key: 'road_trips', label: 'Road trips' },
      { key: 'backpacking', label: 'Backpacking' },
      { key: 'staycations_uk_travel', label: 'Staycations (UK travel)' },
      { key: 'camping', label: 'Camping' },
      { key: 'glamping', label: 'Glamping' },
      { key: 'beach_trips', label: 'Beach trips' },
      { key: 'national_parks', label: 'National parks' },
      { key: 'photography', label: 'Photography' },
      { key: 'van_life', label: 'Van life' },
    ],
  },
  {
    id: 'food_cooking',
    label: 'Food & Cooking',
    options: [
      { key: 'cooking', label: 'Cooking' },
      { key: 'baking', label: 'Baking' },
      { key: 'vegan_food', label: 'Vegan food' },
      { key: 'vegetarian_food', label: 'Vegetarian food' },
      { key: 'bbqs', label: 'BBQs' },
      { key: 'fine_dining', label: 'Fine dining' },
      { key: 'coffee_culture', label: 'Coffee culture' },
      { key: 'food_markets', label: 'Food markets' },
    ],
  },
  {
    id: 'creative_arts',
    label: 'Creative & Arts',
    options: [
      { key: 'photography', label: 'Photography' },
      { key: 'drawing_painting', label: 'Drawing / painting' },
      { key: 'writing', label: 'Writing' },
      { key: 'poetry', label: 'Poetry' },
      { key: 'blogging', label: 'Blogging' },
      { key: 'content_creation', label: 'Content creation' },
      { key: 'fashion', label: 'Fashion' },
      { key: 'interior_design', label: 'Interior design' },
      { key: 'diy_projects', label: 'DIY projects' },
      { key: 'crafts', label: 'Crafts' },
      { key: 'playing_an_instrument', label: 'Playing an instrument' },
      { key: 'singing', label: 'Singing' },
    ],
  },
  {
    id: 'personal_growth',
    label: 'Personal Growth & Lifestyle',
    options: [
      { key: 'reading', label: 'Reading' },
      { key: 'self_development', label: 'Self-development' },
      { key: 'meditation', label: 'Meditation' },
      { key: 'mindfulness', label: 'Mindfulness' },
      { key: 'journaling', label: 'Journaling' },
      { key: 'psychology', label: 'Psychology' },
      { key: 'learning_languages', label: 'Learning languages' },
      { key: 'studying', label: 'Studying' },
      { key: 'entrepreneurship', label: 'Entrepreneurship' },
      { key: 'investing', label: 'Investing' },
    ],
  },
  {
    id: 'animals_home_life',
    label: 'Animals & Home Life',
    options: [
      { key: 'dogs', label: 'Dogs' },
      { key: 'cats', label: 'Cats' },
      { key: 'pets', label: 'Pets' },
      { key: 'animal_welfare', label: 'Animal welfare' },
      { key: 'gardening', label: 'Gardening' },
      { key: 'houseplants', label: 'Houseplants' },
      { key: 'home_improvement', label: 'Home improvement' },
    ],
  },
  {
    id: 'values_community',
    label: 'Values & Community',
    options: [
      { key: 'volunteering', label: 'Volunteering' },
      { key: 'charity_work', label: 'Charity work' },
      { key: 'sustainability', label: 'Sustainability' },
      { key: 'environmentalism', label: 'Environmentalism' },
      { key: 'spirituality', label: 'Spirituality' },
      { key: 'religion_faith', label: 'Religion/Faith' },
      { key: 'politics_discussions', label: 'Politics discussions' },
    ],
  },
  {
    id: 'communication_actions',
    label: 'Communication & Actions',
    options: [
      { key: 'deep_conversations', label: 'Deep conversations' },
      { key: 'sarcasm_banter', label: 'Sarcasm & banter' },
      { key: 'memes', label: 'Memes' },
      { key: 'early_mornings', label: 'Early mornings' },
      { key: 'night_owl', label: 'Night owl' },
      { key: 'cosy_nights_in', label: 'Cosy nights in' },
      { key: 'spontaneous_adventures', label: 'Spontaneous adventures' },
      { key: 'planning_everything', label: 'Planning everything' },
      { key: 'trying_new_things', label: 'Trying new things' },
    ],
  },
  {
    id: 'music_entertainment',
    label: 'Music & Entertainment',
    options: [
      { key: 'concerts', label: 'Concerts' },
      { key: 'festivals', label: 'Festivals' },
      { key: 'indie_music', label: 'Indie music' },
      { key: 'pop_music', label: 'Pop music' },
      { key: 'rock_music', label: 'Rock music' },
      { key: 'electronic_dance', label: 'Electronic / Dance' },
      { key: 'hip_hop_rnb', label: 'Hip hop / R&B' },
      { key: 'jazz_blues', label: 'Jazz / Blues' },
      { key: 'classical_music', label: 'Classical music' },
      { key: 'asian_music', label: 'Asian (Bollywood, Kpop etc)' },
      { key: 'musicals', label: 'Musicals' },
      { key: 'theatre', label: 'Theatre' },
      { key: 'cinema', label: 'Cinema' },
      { key: 'tv_series_bingeing', label: 'TV series bingeing' },
      { key: 'documentaries', label: 'Documentaries' },
      { key: 'podcasts', label: 'Podcasts' },
    ],
  },
];

// ─── Pincode / Postcode ───
export const UK_POSTCODE_REGEX = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;

/** Map interest key -> label for display (e.g. in Edit Profile). */
export const INTEREST_KEY_TO_LABEL: Record<string, string> = INTEREST_CATEGORIES.reduce(
  (acc, cat) => {
    cat.options.forEach((opt) => {
      acc[opt.key] = opt.label;
    });
    return acc;
  },
  {} as Record<string, string>
);

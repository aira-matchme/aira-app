import React, { useEffect, useState, useMemo, useRef } from 'react';
import { View, Text, StatusBar, ActivityIndicator, ScrollView, Image, TouchableOpacity, Platform, StyleSheet, Modal, TouchableWithoutFeedback, Alert, TextInput } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

import { styles } from './styles';
import { colors } from '../../theme';
import { apiClient } from '../../services/api/client';
import { endpoints } from '../../services/api/endpoints';
import type { RootStackParamList } from '../../navigation/types';
import { LocationPinIcon } from '../../assets/icons/common/LocationPinIcon';
import { MoreHorizIcon } from '../../assets/icons/common/MoreHorizIcon';
import { ForwardArrowIcon } from '../../assets/icons/common/ForwardArrowIcon';
import { ToggleChatHeartIcon } from '../../assets/icons/home/ToggleChatHeartIcon';
import { ToggleHeartIcon } from '../../assets/icons/home/ToggleHeartIcon';
import { CloseIcon } from '../../assets/icons/common/CloseIcon';
import { BlockIcon } from '../../assets/icons/common/BlockIcon';
import { ReportIcon } from '../../assets/icons/common/ReportIcon';
import { ReusableBottomSheet } from '../../components/BottomSheet';
import { GradientText } from '../../components/GradientText';
import { TabChatIcon } from '../../assets/icons/tabs/TabChatIcon';
import { TabAICenterIcon } from '../../assets/icons/tabs/TabAICenterIcon';
import { postAIMessagesApi, blockUserApi, reportUserApi } from '../../modules/chat/api';
import { EssentialBulletIcon } from '../../assets/icons/match/EssentialBulletIcon';
import { GenderEssentialIcon } from '../../assets/icons/match/GenderEssentialIcon';
import { HeightEssentialIcon } from '../../assets/icons/match/HeightEssentialIcon';
import { LocationEssentialIcon } from '../../assets/icons/match/LocationEssentialIcon';
import { AgeEssentialIcon } from '../../assets/icons/match/AgeEssentialIcon';
import { OccupationEssentialIcon } from '../../assets/icons/match/OccupationEssentialIcon';
import { EducationEssentialIcon } from '../../assets/icons/match/EducationEssentialIcon';
import { InsightsTabIcon } from '../../assets/icons/match/InsightsTabIcon';
import { InterestChipCheckIcon } from '../../assets/icons/common/InterestChipCheckIcon';

type MatchDetailsRoute = RouteProp<RootStackParamList, 'MatchDetails'>;

type MatchDetailsResponse = {
  statusCode?: number;
  message?: string;
  data?: any;
};

type PersonalityType = 'anchor' | 'explorer' | 'nurturer' | 'achiever' | 'free_spirit';

type PersonalityCopy = {
  title: string;
  subtitle: string;
  youAreBoth: string;
  whyYouWorkTitle: string;
  whyYouWorkBody: string;
  whatYouBringTitle: string;
  whatYouBringBody: string;
  challengesTitle: string;
  challengesBody: string;
  growthTitle: string;
  growthBody: string;
};

const REPORT_REASONS: { value: string; label: string }[] = [
  { value: 'inappropriate_messages', label: 'Inappropriate messages' },
  { value: 'fake_or_spam', label: 'Fake or spam account' },
  { value: 'harassment_or_bullying', label: 'Harassment or bullying' },
  { value: 'offensive_profile', label: 'Offensive profile content' },
  { value: 'underage_user', label: 'Underage user' },
  { value: 'something_else', label: "It's something else" },
];

const PERSONALITY_CONFIG: Record<string, PersonalityCopy> = {
  // Anchor + Anchor (example from user text)
  'anchor-anchor': {
    title: 'Anchor matches with Anchor',
    subtitle: 'Extremely stable, but must actively create novelty.',
    youAreBoth: 'You are both Anchors. You each value loyalty, trust, and emotional reliability, preferring steady and dependable relationships.',
    whyYouWorkTitle: 'Why you work',
    whyYouWorkBody:
      'You naturally understand each other’s need for security and commitment, creating a deeply stable and supportive partnership.',
    whatYouBringTitle: 'What you bring each other',
    whatYouBringBody: 'Deep trust and reliability with strong foundations for long-term commitment.',
    challengesTitle: 'Potential challenges',
    challengesBody: 'Comfort replacing excitement and resistance to change over time.',
    growthTitle: 'Growth opportunity',
    growthBody: 'Actively creating novelty, shared adventures, and emotional expression.',
  },
  // Explorer + Nurturer
  'explorer-nurturer': {
    title: 'Explorer matches with Nurturer',
    subtitle: 'Emotional depth plus discovery.',
    youAreBoth:
      'You are an Explorer. You see relationships as shared journeys, valuing growth, curiosity, and new experiences. Your match is a Nurturer who prioritises emotional connection and understanding, creating warmth and emotional closeness.',
    whyYouWorkTitle: 'Why you work',
    whyYouWorkBody:
      'You help expand their world while they deepen emotional connection, creating a relationship that feels both exciting and emotionally fulfilling.',
    whatYouBringTitle: 'What you bring each other',
    whatYouBringBody:
      'Explorer brings growth and perspective. Nurturer provides emotional grounding. Explorer helps Nurturer expand outward; Nurturer helps Explorer go deeper emotionally.',
    challengesTitle: 'Potential challenges',
    challengesBody: 'Explorer may unintentionally overwhelm, while Nurturer may need more reassurance.',
    growthTitle: 'Growth opportunity',
    growthBody: 'Balancing emotional safety with exploration so both feel secure while still growing.',
  },
  // Explorer + Achiever
  'explorer-achiever': {
    title: 'Explorer matches with Achiever',
    subtitle: 'Growth-focused power couple.',
    youAreBoth:
      'You are an Explorer. You see relationships as shared journeys, valuing growth, curiosity, and new experiences, and you feel happiest with partners who explore life alongside you. Your match is an Achiever who values progress, ambition, and building a meaningful future together.',
    whyYouWorkTitle: 'Why you work',
    whyYouWorkBody:
      'You inspire creativity and possibility, while they provide direction and momentum — forming a partnership driven by growth.',
    whatYouBringTitle: 'What you bring each other',
    whatYouBringBody:
      'Shared forward momentum, intellectual and personal stimulation, and a highly motivating partnership.',
    challengesTitle: 'Potential challenges',
    challengesBody:
      'Constant movement without emotional pause, and the risk of competition or comparison between you.',
    growthTitle: 'Growth opportunity',
    growthBody: 'Celebrating progress while staying emotionally present with each other.',
  },
  // Explorer + Free Spirit
  'explorer-free_spirit': {
    title: 'Explorer matches with Free Spirit',
    subtitle: 'High excitement and creativity; risk of instability.',
    youAreBoth:
      'You are an Explorer. You see relationships as shared journeys, valuing growth, curiosity, and new experiences, and you feel happiest with partners who explore life alongside you. Your match is a Free Spirit who embraces authenticity, spontaneity, and emotional freedom.',
    whyYouWorkTitle: 'Why you work',
    whyYouWorkBody:
      'Together, you create an adventurous and expressive relationship where curiosity and individuality thrive.',
    whatYouBringTitle: 'What you bring each other',
    whatYouBringBody:
      'Creativity, spontaneity, and novelty with high emotional and experiential chemistry.',
    challengesTitle: 'Potential challenges',
    challengesBody:
      'Lack of structure or consistency and difficulty defining a clear long-term direction.',
    growthTitle: 'Growth opportunity',
    growthBody: 'Building intentional anchors and shared agreements within your freedom.',
  },
  // Nurturer + Anchor
  'nurturer-anchor': {
    title: 'Nurturer matches with Anchor',
    subtitle: 'Deep emotional safety and loyalty.',
    youAreBoth:
      'You are a Nurturer who builds relationships through empathy, care, and emotional understanding, creating warmth and deep emotional connection. Your match is an Anchor who brings reliability and emotional security into relationships, valuing trust, loyalty, and long-term commitment.',
    whyYouWorkTitle: 'Why you work',
    whyYouWorkBody:
      'You provide emotional depth while they provide grounding. Together, you create a relationship built on trust, comfort, and genuine emotional support.',
    whatYouBringTitle: 'What you bring each other',
    whatYouBringBody:
      'Anchor provides stability and reassurance. Nurturer provides emotional warmth and understanding. Together you create one of the safest emotional environments, with Anchor helping Nurturer feel protected and Nurturer helping Anchor express emotions more openly.',
    challengesTitle: 'Potential challenges',
    challengesBody:
      'The relationship may become overly comfort-based, difficult conversations may be avoided to keep peace, and emotional dependency can form over time.',
    growthTitle: 'Growth opportunity',
    growthBody:
      'Learning to introduce novelty and independent growth while maintaining emotional closeness.',
  },
  // Nurturer + Explorer
  'nurturer-explorer': {
    title: 'Nurturer matches with Explorer',
    subtitle: 'Emotional grounding for adventurous partner.',
    youAreBoth:
      'You are a Nurturer who prioritises emotional connection and understanding, creating warmth and emotional closeness. Your match is an Explorer who sees relationships as shared journeys, valuing growth, curiosity, and new experiences and bringing excitement and discovery into love.',
    whyYouWorkTitle: 'Why you work',
    whyYouWorkBody:
      'They help expand your world while you deepen emotional connection, creating a relationship that feels both exciting and emotionally fulfilling.',
    whatYouBringTitle: 'What you bring each other',
    whatYouBringBody:
      'Explorer brings growth and perspective, while Nurturer provides emotional grounding. Explorer helps Nurturer expand outward; Nurturer helps Explorer go deeper emotionally.',
    challengesTitle: 'Potential challenges',
    challengesBody:
      'Explorer may unintentionally overwhelm at times, and Nurturer may need extra reassurance.',
    growthTitle: 'Growth opportunity',
    growthBody: 'Balancing emotional safety with exploration so both partners feel secure and inspired.',
  },
  // Nurturer + Nurturer
  'nurturer-nurturer': {
    title: 'Nurturer matches with Nurturer',
    subtitle: 'Extremely empathetic but must avoid over-giving.',
    youAreBoth:
      'You are both Nurturers who prioritise empathy, emotional understanding, and care in relationships.',
    whyYouWorkTitle: 'Why you work',
    whyYouWorkBody:
      'You instinctively understand each other’s emotional needs, creating deep intimacy and mutual support.',
    whatYouBringTitle: 'What you bring each other',
    whatYouBringBody: 'Deep empathy and emotional understanding for one another.',
    challengesTitle: 'Potential challenges',
    challengesBody: 'A tendency toward over-giving, emotional merging, or losing individual needs.',
    growthTitle: 'Growth opportunity',
    growthBody: 'Maintaining individuality and healthy boundaries while staying deeply connected.',
  },
  // Nurturer + Achiever
  'nurturer-achiever': {
    title: 'Nurturer matches with Achiever',
    subtitle: 'Emotional support meets ambition.',
    youAreBoth:
      'You are a Nurturer who builds connection through empathy, emotional care, and understanding. Your match is an Achiever who expresses love through effort, support, and building a strong future together.',
    whyYouWorkTitle: 'Why you work',
    whyYouWorkBody:
      'You bring emotional warmth while they provide structure and direction, creating balance between heart and ambition.',
    whatYouBringTitle: 'What you bring each other',
    whatYouBringBody:
      'Emotional support meets ambition, with Nurturer humanising Achiever’s drive and helping them stay connected to feelings.',
    challengesTitle: 'Potential challenges',
    challengesBody:
      'Nurturer may sometimes feel emotionally overlooked, while Achiever may feel pressured or emotionally overwhelmed.',
    growthTitle: 'Growth opportunity',
    growthBody: 'Learning each other’s love languages so both care and ambition feel seen and valued.',
  },
  // Nurturer + Free Spirit
  'nurturer-free_spirit': {
    title: 'Nurturer matches with Free Spirit',
    subtitle: 'Creative emotional connection but needs reassurance.',
    youAreBoth:
      'You are a Nurturer who values emotional closeness and meaningful connection. Your match is a Free Spirit who prioritises authenticity and individuality, bringing creativity into relationships.',
    whyYouWorkTitle: 'Why you work',
    whyYouWorkBody:
      'You create emotional safety while they encourage openness and self-expression, forming a deeply authentic bond.',
    whatYouBringTitle: 'What you bring each other',
    whatYouBringBody:
      'Emotional creativity and deep authenticity, with a safe space for genuine expression.',
    challengesTitle: 'Potential challenges',
    challengesBody: 'Nurturer often seeks reassurance, while Free Spirit strongly values autonomy.',
    growthTitle: 'Growth opportunity',
    growthBody: 'Balancing emotional closeness with independence so both partners feel free and loved.',
  },
  // Achiever + Anchor
  'achiever-anchor': {
    title: 'Achiever matches with Anchor',
    subtitle: 'Structured, future-focused partnership.',
    youAreBoth:
      'You are an Achiever who approaches relationships with ambition and purpose, valuing growth, progress, and shared goals. Your match is an Anchor who brings reliability and emotional security into relationships, valuing trust, loyalty, and long-term commitment.',
    whyYouWorkTitle: 'Why you work',
    whyYouWorkBody:
      'You bring momentum and vision while they stabilise. Together, you naturally build something meaningful and long-lasting.',
    whatYouBringTitle: 'What you bring each other',
    whatYouBringBody:
      'Shared long-term thinking, with Anchor stabilising Achiever’s ambition and Achiever motivating progress and future planning — often leading to strong life partnerships.',
    challengesTitle: 'Potential challenges',
    challengesBody:
      'Emotional expression may take a back seat to responsibilities, and the relationship can drift toward being practical rather than romantic.',
    growthTitle: 'Growth opportunity',
    growthBody: 'Prioritising emotional connection and intimacy alongside goals and achievements.',
  },
  // Achiever + Explorer
  'achiever-explorer': {
    title: 'Achiever matches with Explorer',
    subtitle: 'Growth-driven and inspiring.',
    youAreBoth:
      'You are an Achiever who approaches relationships with ambition and purpose, valuing growth, progress, and shared goals. Your match is an Explorer who sees relationships as shared journeys, valuing growth, curiosity, and new experiences, and bringing excitement and discovery into love.',
    whyYouWorkTitle: 'Why you work',
    whyYouWorkBody:
      'They inspire creativity and possibility, while you provide direction and momentum — together you form a partnership driven by growth.',
    whatYouBringTitle: 'What you bring each other',
    whatYouBringBody:
      'Shared forward momentum, intellectual and personal stimulation, and a highly motivating partnership.',
    challengesTitle: 'Potential challenges',
    challengesBody:
      'Constant movement without emotional pause, and the risk of competition or comparison between you.',
    growthTitle: 'Growth opportunity',
    growthBody: 'Celebrating progress while staying emotionally present and connected with each other.',
  },
  // Achiever + Nurturer
  'achiever-nurturer': {
    title: 'Achiever matches with Nurturer',
    subtitle: 'Balanced emotional and practical support.',
    youAreBoth:
      'You are an Achiever who approaches relationships with ambition and purpose, valuing growth, progress, and shared goals. Your match is a Nurturer who builds connection through empathy, emotional care, and understanding.',
    whyYouWorkTitle: 'Why you work',
    whyYouWorkBody:
      'They bring emotional warmth while you provide structure and direction, creating balance between heart and ambition.',
    whatYouBringTitle: 'What you bring each other',
    whatYouBringBody:
      'Emotional support meets ambition, with the Nurturer humanising the Achiever’s drive and helping it feel more emotionally grounded.',
    challengesTitle: 'Potential challenges',
    challengesBody:
      'Nurturer may at times feel emotionally overlooked, while Achiever may feel pressured or emotionally overloaded.',
    growthTitle: 'Growth opportunity',
    growthBody: 'Learning each other’s love languages so both emotional care and ambition feel seen.',
  },
  // Achiever + Achiever
  'achiever-achiever': {
    title: 'Achiever matches with Achiever',
    subtitle: 'Powerful but must prioritise emotional connection.',
    youAreBoth:
      'You are both Achievers who approach relationships with ambition, intention, and forward momentum.',
    whyYouWorkTitle: 'Why you work',
    whyYouWorkBody:
      'You share motivation and vision, naturally supporting each other’s goals while building a strong partnership.',
    whatYouBringTitle: 'What you bring each other',
    whatYouBringBody:
      'Mutual ambition, respect, and high-performing partnership energy that can accomplish a great deal together.',
    challengesTitle: 'Potential challenges',
    challengesBody:
      'Emotional intimacy can be neglected, and the relationship may start to feel like a project or performance.',
    growthTitle: 'Growth opportunity',
    growthBody: 'Making space for vulnerability and emotional connection beyond shared goals.',
  },
  // Achiever + Free Spirit
  'achiever-free_spirit': {
    title: 'Achiever matches with Free Spirit',
    subtitle: 'Passionate but requires flexibility.',
    youAreBoth:
      'You are an Achiever who values growth, purpose, and building a meaningful future. Your match is a Free Spirit who values authenticity and emotional freedom, bringing creativity and spontaneity into the relationship.',
    whyYouWorkTitle: 'Why you work',
    whyYouWorkBody:
      'You provide direction while they bring inspiration, helping the relationship feel both purposeful and alive.',
    whatYouBringTitle: 'What you bring each other',
    whatYouBringBody: 'Vision meets creativity, and structure meets inspiration.',
    challengesTitle: 'Potential challenges',
    challengesBody: 'Achiever seeks clear direction, while Free Spirit can resist pressure or rigidity.',
    growthTitle: 'Growth opportunity',
    growthBody: 'Allowing flexibility within shared goals so both purpose and freedom can thrive.',
  },
  // Free Spirit + Anchor
  'free_spirit-anchor': {
    title: 'Free Spirit matches with Anchor',
    subtitle: 'Stability vs freedom dynamic.',
    youAreBoth:
      'You are a Free Spirit who values authenticity, independence, and self-expression, bringing creativity and spontaneity into love. Your match is an Anchor who brings reliability and emotional security into relationships, valuing trust, loyalty, and long-term commitment.',
    whyYouWorkTitle: 'Why you work',
    whyYouWorkBody:
      'Their stability helps you feel safe to be yourself, while your spontaneity encourages them to embrace new emotional experiences.',
    whatYouBringTitle: 'What you bring each other',
    whatYouBringBody:
      'Anchor creates safety, while Free Spirit introduces emotional freedom and creativity, often creating strong attraction through contrast.',
    challengesTitle: 'Potential challenges',
    challengesBody:
      'Anchor naturally seeks predictability and clear structure, while Free Spirit can resist limitation or feeling boxed in.',
    growthTitle: 'Growth opportunity',
    growthBody: 'Redefining commitment as chosen freedom rather than restriction for both partners.',
  },
  // Free Spirit + Explorer
  'free_spirit-explorer': {
    title: 'Free Spirit matches with Explorer',
    subtitle: 'Highly dynamic and exciting.',
    youAreBoth:
      'You are a Free Spirit who values authenticity, independence, and self-expression, bringing creativity and spontaneity into love. Your match is an Explorer who sees relationships as shared journeys, valuing growth, curiosity, and new experiences, and bringing excitement and discovery into love.',
    whyYouWorkTitle: 'Why you work',
    whyYouWorkBody:
      'Together, you create an adventurous and expressive relationship where curiosity and individuality thrive.',
    whatYouBringTitle: 'What you bring each other',
    whatYouBringBody:
      'Creativity, spontaneity, and novelty with high emotional and experiential chemistry between you.',
    challengesTitle: 'Potential challenges',
    challengesBody:
      'Lack of structure or consistency and difficulty defining a clear long-term direction together.',
    growthTitle: 'Growth opportunity',
    growthBody: 'Building intentional anchors within your shared freedom so the connection can last.',
  },
  // Free Spirit + Nurturer
  'free_spirit-nurturer': {
    title: 'Free Spirit matches with Nurturer',
    subtitle: 'Emotional creativity and warmth.',
    youAreBoth:
      'You are a Free Spirit who values authenticity, independence, and self-expression, bringing creativity and spontaneity into love. Your match is a Nurturer who values emotional closeness and meaningful connection.',
    whyYouWorkTitle: 'Why you work',
    whyYouWorkBody:
      'They create emotional safety while you encourage openness and self-expression, forming a deeply authentic bond.',
    whatYouBringTitle: 'What you bring each other',
    whatYouBringBody:
      'Emotional creativity and deep authenticity, along with a safe space for genuine expression.',
    challengesTitle: 'Potential challenges',
    challengesBody: 'Nurturer often seeks reassurance, while Free Spirit strongly values autonomy.',
    growthTitle: 'Growth opportunity',
    growthBody: 'Balancing emotional closeness with independence so both partners feel free and secure.',
  },
  // Free Spirit + Achiever
  'free_spirit-achiever': {
    title: 'Free Spirit matches with Achiever',
    subtitle: 'Inspiration meets structure.',
    youAreBoth:
      'You are a Free Spirit who values authenticity, independence, and self-expression, bringing creativity and spontaneity into love. Your match is an Achiever who approaches relationships with ambition and purpose, valuing growth, progress, and shared goals.',
    whyYouWorkTitle: 'Why you work',
    whyYouWorkBody:
      'They provide direction while you bring inspiration, helping the relationship feel both purposeful and alive.',
    whatYouBringTitle: 'What you bring each other',
    whatYouBringBody: 'Vision meets creativity, and structure meets inspiration.',
    challengesTitle: 'Potential challenges',
    challengesBody: 'Achiever seeks clear direction, while Free Spirit often resists pressure or rigidity.',
    growthTitle: 'Growth opportunity',
    growthBody: 'Allowing flexibility within shared goals so that both freedom and ambition can thrive.',
  },
  // Free Spirit + Free Spirit
  'free_spirit-free_spirit': {
    title: 'Free Spirit matches with Free Spirit',
    subtitle: 'Deep authenticity but needs grounding.',
    youAreBoth:
      'You are both Free Spirits who value authenticity, individuality, and emotional freedom.',
    whyYouWorkTitle: 'Why you work',
    whyYouWorkBody:
      'You give each other space to be fully yourselves, creating a relationship built on honesty, creativity, and mutual acceptance.',
    whatYouBringTitle: 'What you bring each other',
    whatYouBringBody:
      'Authenticity, emotional freedom, and a highly expressive, creatively charged connection.',
    challengesTitle: 'Potential challenges',
    challengesBody: 'Lack of stability or planning can make it hard to build long-term grounding.',
    growthTitle: 'Growth opportunity',
    growthBody: 'Choosing commitment and shared direction without losing individuality.',
  },
};

const getPersonalityKey = (finder?: PersonalityType, user?: PersonalityType) => {
  if (!finder || !user) return undefined;
  return `${finder}-${user}`;
};

export const MatchDetailsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<MatchDetailsRoute>();
  const { userId } = route.params;
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'basics' | 'insights'>('basics');
  const [isAtBottom, setIsAtBottom] = useState(false);
  const isAtBottomRef = useRef(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showFirstMovePopup, setShowFirstMovePopup] = useState(false);
  const [firstMoveStep, setFirstMoveStep] = useState<'choose' | 'sent'>('choose');
  const [firstMoveLoading, setFirstMoveLoading] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [blockLoading, setBlockLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [showReportBlockSheet, setShowReportBlockSheet] = useState(false);
  const [selectedReportReason, setSelectedReportReason] = useState<string | null>(null);
  const [reportMessageInput, setReportMessageInput] = useState('');
  const [reportBlockSubmitting, setReportBlockSubmitting] = useState(false);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const url = endpoints.matches.getMatchDetails.replace('{id}', userId);
      const { data } = await apiClient.get<MatchDetailsResponse>(url);
      const nextDetails = data?.data ?? null;
      setDetails(nextDetails);
      // Backend may send current liked status in `isLiked`.
      // Keep UI in sync with backend on initial load.
      const likedValue =
        nextDetails?.isLiked ?? nextDetails?.liked ?? nextDetails?.match?.isLiked ?? false;
      setIsLiked(Boolean(likedValue));
    } catch {
      setDetails(null);
      setIsLiked(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [userId]);

  const handleLike = async () => {
    try {
      await apiClient.post(endpoints.matches.addLike, { likedUserId: userId });
      setIsLiked(true);
    } catch {
      // keep state on failure
    }
  };

  const handleUnlike = async () => {
    try {
      await apiClient.post(endpoints.matches.removeLike, {
        likedUserId: userId,
      });
      setIsLiked(false);
    } catch {
      // keep state on failure
    }
  };

  const profile = details?.profile;

  const name = profile?.name ?? 'Match';

  /** Gallery photos from API, sorted by order */
  const galleryPhotos = useMemo(() => {
    const list = profile?.galleryPhotos ?? [];
    return [...list].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [profile?.galleryPhotos]);

  const distanceLabel = useMemo(() => {
    const miles = details?.distanceMiles;
    const km = details?.distanceKm;
    if (miles != null && miles >= 0) return `${Math.round(miles)} mi away`;
    if (km != null && km >= 0) return `${Math.round(km)} km away`;
    return 'Nearby';
  }, [details?.distanceMiles, details?.distanceKm]);

  const formatGender = (gender?: string) => {
    if (!gender) return 'Women';
    if (gender.toLowerCase() === 'female') return 'Women';
    if (gender.toLowerCase() === 'male') return 'Men';
    return gender;
  };

  const formatHeight = (heightCm?: number) => {
    if (!heightCm) return '152cm';
    return `${Math.round(heightCm)}cm`;
  };

  const formatCity = (city?: string) => {
    if (!city) return 'Barmingham, United Kingdom';
    // Backend sends just city, Figma shows "City, Country" – keep it simple for now
    return city;
  };

  const formatEmployment = (employmentStatus?: string) => {
    if (!employmentStatus) return 'Self-employed';
    switch (employmentStatus) {
      case 'self_employed':
        return 'Self-employed';
      case 'student':
        return 'Student';
      case 'unemployed':
        return 'Not currently working';
      case 'full_time':
        return 'Full-time';
      case 'part_time':
        return 'Part-time';
      default:
        return employmentStatus.replace(/_/g, ' ');
    }
  };

  const formatEducation = (level?: string) => {
    if (!level) return 'PhD/ Dr';
    switch (level) {
      case 'phd_or_doctorate':
        return 'PhD/ Dr';
      case 'masters_or_above':
        return 'Masters or equivalent';
      case 'bachelors_or_equivalent':
        return 'Bachelors or equivalent';
      case 'high_school_or_equivalent':
        return 'High school or equivalent';
      default:
        return level.replace(/_/g, ' ');
    }
  };

  const essentials = useMemo(
    () => [
      { id: 'gender', label: formatGender(profile?.gender) },
      { id: 'height', label: formatHeight(profile?.heightCm) },
      {
        id: 'location',
        label: formatCity(profile?.city),
      },
      {
        id: 'age',
        label: profile?.age ? `${profile.age} yrs` : '21 yrs',
      },
      {
        id: 'occupation',
        label: formatEmployment(profile?.career?.employmentStatus),
      },
      {
        id: 'education',
        label: formatEducation(profile?.education?.level),
      },
    ],
    [profile],
  );

  const interests: string[] = useMemo(() => {
    const hobbies = profile?.hobbies;
    if (Array.isArray(hobbies) && hobbies.length > 0) {
      return hobbies.map((hobby: string) =>
        hobby
          .split('_')
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(' '),
      );
    }
    return ['Pets', 'Fashion', 'Travelling', 'Gym', 'Foodie', 'Gamer', 'Photography'];
  }, [profile?.hobbies]);

  const personalityKey = getPersonalityKey(
    details?.primaryPersonality?.matchFinder as PersonalityType | undefined,
    details?.primaryPersonality?.matchUser as PersonalityType | undefined,
  );

  const personalityCopy = personalityKey ? PERSONALITY_CONFIG[personalityKey] : undefined;

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!details) {
    return (
      <View style={styles.loader}>
        <Text>Unable to load match details.</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.background.base}
        translucent={Platform.OS === 'android'}
      />

      <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'top']}>
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <TouchableOpacity
            style={styles.headerPill}
            activeOpacity={0.8}
            onPress={() => navigation.goBack()}
          >
            <View style={styles.headerIconBackContainer}>
              <ForwardArrowIcon size={20} color={colors.black} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerPill}
            activeOpacity={0.8}
            onPress={() => {
              if (blockLoading || reportLoading) return;
              setShowMoreOptions(true);
            }}
          >
            <MoreHorizIcon size={20} color={colors.black} />
          </TouchableOpacity>
        </View>

        <View style={styles.scrollBody}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          bounces
          scrollEventThrottle={16}
          onScroll={(event) => {
            const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
            const distanceFromBottom =
              contentSize.height - (contentOffset.y + layoutMeasurement.height);
            // Hysteresis: avoids flicker when the user scrolls near the end zone.
            const showThreshold = 56;
            const hideThreshold = 112;
            const next = isAtBottomRef.current
              ? distanceFromBottom <= hideThreshold
              : distanceFromBottom <= showThreshold;
            if (next !== isAtBottomRef.current) {
              isAtBottomRef.current = next;
              setIsAtBottom(next);
            }
          }}
        >
          <View style={styles.nameSection}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{name}</Text>
              {/* <View style={styles.verifyDot} /> */}
            </View>

            <View style={styles.distanceRow}>
              <LocationPinIcon size={16} color={colors.neutral[600]} />
              <Text style={styles.distanceText}>{distanceLabel}</Text>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.photosRow}
          >
            {(galleryPhotos.length > 0 ? galleryPhotos : [null, null, null, null]).slice(0, 6).map((photo: any, index: number) => (
              <View key={photo?.id ?? index} style={styles.photoCard}>
                {photo?.url ? (
                  <Image source={{ uri: photo.url }} style={styles.photoImage} resizeMode="cover" />
                ) : (
                  <View style={styles.photoPlaceholder} />
                )}
              </View>
            ))}
          </ScrollView>

          <View style={styles.segmentWrapper}>
            <View style={styles.segmentBackground}>
             
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setActiveTab('basics')}
                style={styles.segmentInactiveContainer}
              >
                <LinearGradient
                  colors={
                    activeTab === 'basics'
                      ? (colors.gradients.primary.colors as any)
                      : [colors.neutral[50], colors.neutral[50]]
                  }
                  start={colors.gradients.primary.start}
                  end={colors.gradients.primary.end}
                  style={styles.segmentActive}
                >
                  <Text
                    style={
                      activeTab === 'basics'
                        ? styles.segmentActiveText
                        : styles.segmentInactiveText
                    }
                  >
                    Basics
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setActiveTab('insights')}
                style={styles.segmentInactiveContainer}
              >
                <LinearGradient
                  colors={
                    activeTab === 'insights'
                      ? (colors.gradients.primary.colors as any)
                      : [colors.neutral[50], colors.neutral[50]]
                  }
                  start={colors.gradients.primary.start}
                  end={colors.gradients.primary.end}
                  style={styles.segmentActive}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', columnGap: 6 }}>
                    <InsightsTabIcon size={18} active={activeTab === 'insights'} />
                    <Text
                      style={
                        activeTab === 'insights'
                          ? styles.segmentActiveText
                          : styles.segmentInactiveText
                      }
                    >
                      Insights
                    </Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>

            </View>
          </View>

          {activeTab === 'basics' ? (
            <View style={styles.cardsWrapper}>
              <View style={styles.cardEssentials}>
                <Text style={styles.cardTitle}>Essentials</Text>

                {essentials.map((item, index) => {
                  const showGenderIcon = item.id === 'gender';
                  const showHeightIcon = item.id === 'height';
                  const showLocationIcon = item.id === 'location';
                  const showAgeIcon = item.id === 'age';
                  const showOccupationIcon = item.id === 'occupation';
                  const showEducationIcon = item.id === 'education';

                  return (
                    <View
                      key={item.id}
                      style={[
                        styles.essentialRow,
                        index === essentials.length - 1 ? styles.essentialRowLast : null,
                      ]}
                    >
                      {showGenderIcon ? (
                        <GenderEssentialIcon size={20} />
                      ) : showHeightIcon ? (
                        <HeightEssentialIcon size={20} />
                      ) : showLocationIcon ? (
                        <LocationEssentialIcon size={20} />
                      ) : showAgeIcon ? (
                        <AgeEssentialIcon size={20} />
                      ) : showOccupationIcon ? (
                        <OccupationEssentialIcon size={20} />
                      ) : showEducationIcon ? (
                        <EducationEssentialIcon size={20} />
                      ) : (
                        <EssentialBulletIcon />
                      )}
                      <Text style={styles.essentialText}>{item.label}</Text>
                    </View>
                  );
                })}
              </View>

              <View style={styles.cardInterests}>
                <Text style={styles.cardTitle}>Interests</Text>
                <View style={styles.interestsWrap}>
                  {interests.map((interest) => (
                    <View key={interest} style={styles.interestChip}>
                      <Text style={styles.interestChipText}>{interest}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.cardsWrapper}>
              {personalityCopy && (
                <View style={styles.cardInsights}>
                  <Text style={styles.cardTitle}>{personalityCopy.title}</Text>
                  <Text style={styles.personalitySubtitle}>{personalityCopy.subtitle}</Text>
                  <Text style={styles.personalityBody}>{personalityCopy.youAreBoth}</Text>

                  <Text style={styles.personalitySectionTitle}>{personalityCopy.whyYouWorkTitle}</Text>
                  <Text style={styles.personalityBody}>{personalityCopy.whyYouWorkBody}</Text>

                  <Text style={styles.personalitySectionTitle}>
                    {personalityCopy.whatYouBringTitle}
                  </Text>
                  <Text style={styles.personalityBody}>{personalityCopy.whatYouBringBody}</Text>

                  <Text style={styles.personalitySectionTitle}>
                    {personalityCopy.challengesTitle}
                  </Text>
                  <Text style={styles.personalityBody}>{personalityCopy.challengesBody}</Text>

                  <Text style={styles.personalitySectionTitle}>{personalityCopy.growthTitle}</Text>
                  <Text style={styles.personalityBody}>{personalityCopy.growthBody}</Text>
                </View>
              )}

              <View style={styles.cardInsights}>
                <Text style={styles.cardTitle}>You both enjoy</Text>
                <View style={styles.interestsWrap}>
                  {(details?.commonInterest ?? []).map((interestKey: string) => {
                    const label = interestKey
                      .split('_')
                      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                      .join(' ');
                    return (
                      <View key={interestKey} style={styles.insightChip}>
                        <Text style={styles.insightChipText}>{label}</Text>
                      </View>
                    );
                  })}
                  {(!details?.commonInterest || details.commonInterest.length === 0) && (
                    <Text style={styles.insightEmptyText}>
                      Once you have more in common, they will appear here.
                    </Text>
                  )}
                </View>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={styles.reportContainer}
            activeOpacity={0.8}
            onPress={() => {
              setSelectedReportReason(null);
              setReportMessageInput('');
              setShowReportBlockSheet(true);
            }}
          >
            <Text style={styles.reportText}>Report &amp; Block</Text>
          </TouchableOpacity>
        </ScrollView>

        {isAtBottom && (
          <View
            pointerEvents="box-none"
            style={[
              styles.bottomNavWrapper,
              { paddingBottom: insets.bottom + 12 },
            ]}
          >
            <View style={styles.bottomNav}>
              <TouchableOpacity
                style={styles.bottomChatButton}
                activeOpacity={0.8}
                onPress={() => {
                  setFirstMoveStep('choose');
                  setShowFirstMovePopup(true);
                }}
              >
                <LinearGradient
                  colors={colors.gradients.primary.colors as any}
                  start={colors.gradients.primary.start}
                  end={colors.gradients.primary.end}
                  style={StyleSheet.absoluteFill}
                />
                <ToggleChatHeartIcon size={28} color={colors.white} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.bottomLikeButton}
                activeOpacity={0.8}
                onPress={() => (isLiked ? handleUnlike() : handleLike())}
              >
                <View
                  style={[
                    StyleSheet.absoluteFill,
                    { backgroundColor: isLiked ? 'rgba(0,0,0,0.2)' : 'white', borderRadius: 32 },
                  ]}
                />
                {isLiked ? (
                  <CloseIcon size={24} color={colors.white} />
                ) : (
                  <ToggleHeartIcon size={28} color={colors.primary.purple} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
        </View>
      </SafeAreaView>

      <Modal
        visible={showMoreOptions}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (blockLoading || reportLoading) return;
          setShowMoreOptions(false);
        }}
      >
        <TouchableWithoutFeedback
          onPress={() => {
            if (blockLoading || reportLoading) return;
            setShowMoreOptions(false);
          }}
        >
          <View style={styles.matchOptionsBackdrop}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.matchOptionsPopup}>
                {/* <Text style={styles.matchOptionsTitle}>{name}</Text> */}

                <TouchableOpacity
                  style={styles.matchOptionsItem}
                  activeOpacity={0.8}
                  disabled={blockLoading}
                  onPress={async () => {
                    if (blockLoading) return;
                    try {
                      setBlockLoading(true);
                      const res = await blockUserApi({ blockUserId: userId, type: 'block' });
                      const apiMessage =
                        (res as any)?.data?.message ??
                        (res as any)?.message ??
                        'User blocked successfully.';
                      setShowMoreOptions(false);
                      Alert.alert('Blocked', apiMessage.toString());
                      navigation.goBack();
                    } catch (e: any) {
                      const errMessage =
                        e?.response?.data?.message ??
                        e?.message ??
                        'Could not block this user. Please try again.';
                      Alert.alert('Error', errMessage.toString());
                    } finally {
                      setBlockLoading(false);
                    }
                  }}
                >
                  <View style={styles.matchOptionsIconWrap}>
                    {blockLoading ? (
                      <ActivityIndicator size="small" color={colors.black} />
                    ) : (
                      <BlockIcon size={20} color={colors.black} />
                    )}
                  </View>
                  <Text style={styles.matchOptionsLabel}>
                    {blockLoading ? 'Blocking…' : 'Block'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.matchOptionsItem}
                  activeOpacity={0.8}
                  disabled={reportLoading}
                  onPress={async () => {
                    if (reportLoading) return;
                    try {
                      setReportLoading(true);
                      const res = await reportUserApi({
                        reportedAgainst: userId,
                        reportMessage: 'Reported from match details',
                      });
                      const apiMessage =
                        (res as any)?.data?.message ??
                        (res as any)?.message ??
                        'Report submitted successfully.';
                      setShowMoreOptions(false);
                      Alert.alert('Reported', apiMessage.toString());
                      navigation.goBack();
                    } catch (e: any) {
                      const errMessage =
                        e?.response?.data?.message ??
                        e?.message ??
                        'Could not submit report. Please try again.';
                      Alert.alert('Error', errMessage.toString());
                    } finally {
                      setReportLoading(false);
                    }
                  }}
                >
                  <View style={[styles.matchOptionsIconWrap, styles.matchOptionsIconWrapReport]}>
                    {reportLoading ? (
                      <ActivityIndicator size="small" color={colors.black} />
                    ) : (
                      <ReportIcon size={20} color={colors.black} />
                    )}
                  </View>
                  <Text style={styles.matchOptionsLabelReport}>
                    {reportLoading ? 'Reporting…' : 'Report'}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <ReusableBottomSheet
        isOpen={showReportBlockSheet}
        onClose={() => {
          if (reportBlockSubmitting) return;
          setShowReportBlockSheet(false);
          setReportMessageInput('');
          setSelectedReportReason(null);
        }}
        snapPoints={['90%']}
        showDragHandle
        showCloseButton={false}
        enablePanDownToClose={!reportBlockSubmitting}
        scrollEnabled={false}
      >
        <View style={reportSheetStyles.content}>
          <View style={reportSheetStyles.iconWrap}>
            <ReportIcon size={40} color={colors.primary.purple} />
          </View>
          <Text style={reportSheetStyles.title}>Why Report {name}?</Text>
          <View style={reportSheetStyles.reasonsWrap}>
            {REPORT_REASONS.map((reason) => {
              const selected = selectedReportReason === reason.value;
              return (
                <TouchableOpacity
                  key={reason.value}
                  style={[reportSheetStyles.reasonRow, selected && reportSheetStyles.reasonRowSelected]}
                  onPress={() => setSelectedReportReason(reason.value)}
                  activeOpacity={0.7}
                  disabled={reportBlockSubmitting}
                >
                  <View style={[reportSheetStyles.reasonCheck, selected && reportSheetStyles.reasonCheckSelected]}>
                    {selected && <InterestChipCheckIcon size={12} color={colors.white} />}
                  </View>
                  <Text style={[reportSheetStyles.reasonLabel, selected && reportSheetStyles.reasonLabelSelected]}>
                    {reason.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <TextInput
            style={reportSheetStyles.optionalInput}
            placeholder="Tell us the reason.. (optional)"
            placeholderTextColor={colors.neutral[500]}
            value={reportMessageInput}
            onChangeText={setReportMessageInput}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            editable={!reportBlockSubmitting}
          />
          <View style={reportSheetStyles.buttonRow}>
            <TouchableOpacity
              style={reportSheetStyles.cancelButton}
              onPress={() => {
                setShowReportBlockSheet(false);
                setReportMessageInput('');
                setSelectedReportReason(null);
              }}
              disabled={reportBlockSubmitting}
              activeOpacity={0.8}
            >
              <Text style={reportSheetStyles.cancelButtonLabel}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={reportSheetStyles.submitButton}
              onPress={async () => {
                if (!selectedReportReason) return;
                const reasonLabel =
                  REPORT_REASONS.find((r) => r.value === selectedReportReason)?.label ?? selectedReportReason;
                const reportMessage = reportMessageInput.trim()
                  ? `${reasonLabel}\n${reportMessageInput.trim()}`
                  : reasonLabel;
                try {
                  setReportBlockSubmitting(true);
                  const res = await apiClient.post(endpoints.chat.blockreportUser, {
                    targetUserId: userId,
                    reportMessage,
                  });
                  const apiMessage =
                    (res as any)?.data?.message ??
                    (res as any)?.message ??
                    'Report submitted and user blocked successfully.';
                  setShowReportBlockSheet(false);
                  setReportMessageInput('');
                  setSelectedReportReason(null);
                  Alert.alert('Done', apiMessage.toString());
                  navigation.goBack();
                } catch (e: any) {
                  const errMessage =
                    e?.response?.data?.message ??
                    e?.message ??
                    'Could not submit report. Please try again.';
                  Alert.alert('Error', errMessage.toString());
                } finally {
                  setReportBlockSubmitting(false);
                }
              }}
              disabled={reportBlockSubmitting || !selectedReportReason}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={colors.gradients.primary.colors as any}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={reportSheetStyles.submitButtonGradient}
              >
                {reportBlockSubmitting ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text style={reportSheetStyles.submitButtonLabel}>Submit</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </ReusableBottomSheet>

      <ReusableBottomSheet
        isOpen={showFirstMovePopup}
        onClose={() => setShowFirstMovePopup(false)}
        snapPoints={firstMoveStep === 'sent' ? ['30%'] : ['48%']}
        showDragHandle
        showCloseButton={false}
        enablePanDownToClose
        scrollEnabled={false}
      >
        {firstMoveStep === 'choose' ? (
          <View style={styles.firstMoveSheet}>
            <View style={styles.firstMoveHeader}>
              <View style={styles.firstMoveIconWrap}>
                <LinearGradient
                  colors={[colors.primary.purple, colors.secondary.lavender]}
                  style={StyleSheet.absoluteFill}
                />
                <ToggleChatHeartIcon color={colors.white} size={30} />
              </View>
              <View style={styles.firstMoveTextBlock}>
                <Text style={styles.firstMoveTitle}>Make your first move</Text>
                <Text style={styles.firstMoveSubtitle}>Your vibe, your call.</Text>
              </View>
            </View>
            <View style={styles.firstMoveButtonsRow}>
              <TouchableOpacity
                style={[styles.firstMoveButton, styles.firstMoveButtonSay]}
                activeOpacity={0.8}
                onPress={() => {
                  setShowFirstMovePopup(false);
                  navigation.navigate('Chat', {
                    screen: 'ChatDetail',
                    params: {
                      chatId: userId,
                      name,
                      avatar: galleryPhotos[0]?.url ? { uri: galleryPhotos[0].url } : undefined,
                      isRequest: false,
                      otherUserId: userId,
                    },
                  });
                }}
              >
                <View style={styles.firstMoveButtonIcon}>
                  <TabChatIcon color={colors.primary.purple} width={24} height={24} />
                </View>
                <Text style={styles.firstMoveButtonText}>Say it in your words</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.firstMoveButton, styles.firstMoveButtonAira]}
                activeOpacity={0.8}
                disabled={firstMoveLoading}
                onPress={async () => {
                  if (firstMoveLoading) return;
                  try {
                    setFirstMoveLoading(true);
                    await postAIMessagesApi({ receiverId: userId });
                    setFirstMoveStep('sent');
                  } finally {
                    setFirstMoveLoading(false);
                  }
                }}
              >
                <View style={styles.firstMoveButtonIcon}>
                  <TabAICenterIcon width={44} height={44} />
                </View>
                <View style={{ alignItems: 'center', gap: 0 }}>
                  <GradientText
                    style={{ fontSize: 16, fontWeight: '500' }}
                    colors={[colors.primary.purpleLight, colors.primary.purple]}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                  >
                    Let Aira break
                  </GradientText>
                  <GradientText
                    style={{ fontSize: 16, fontWeight: '500' }}
                    colors={[colors.primary.purpleLight, colors.primary.purple]}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                  >
                    the ice
                  </GradientText>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={[styles.firstMoveSheet, { paddingTop: 8, paddingBottom: 16, gap: 10 }]}>
            <View style={[styles.firstMoveHeader, { gap: 16 }]}>
              <View
                style={[
                  styles.firstMoveIconWrap,
                  {
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    backgroundColor: colors.primary[50],
                  },
                ]}
              >
                <ForwardArrowIcon size={24} color={colors.primary.purple} />
              </View>
              <View style={styles.firstMoveTextBlock}>
                <Text style={[styles.firstMoveTitle, { fontSize: 18, lineHeight: 24 }]}>
                  Request sent
                </Text>
                <Text style={[styles.firstMoveSubtitle, { fontSize: 12, lineHeight: 16 }]}>
                  Waiting for {name} to respond. You'll get notified when they do.
                </Text>
              </View>
            </View>
          </View>
        )}
      </ReusableBottomSheet>
    </View>
  );
};

const reportSheetStyles = StyleSheet.create({
  content: {
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 32,
    flex: 1,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '500',
    color: colors.black,
    textAlign: 'center',
    marginBottom: 16,
  },
  reasonsWrap: {
    marginBottom: 16,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.neutral[100],
    marginBottom: 8,
    gap: 8,
  },
  reasonRowSelected: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[50],
  },
  reasonCheck: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.neutral[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  reasonCheckSelected: {
    backgroundColor: colors.primary.purple,
    borderColor: colors.primary.purple,
  },
  reasonLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.neutral[800],
    flex: 1,
  },
  reasonLabelSelected: {
    color: colors.primary.purple,
  },
  optionalInput: {
    borderWidth: 1,
    borderColor: colors.neutral[100],
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    fontSize: 16,
    color: colors.neutral[900],
    minHeight: 88,
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelButton: {
    flex: 1,
    height: 54,
    borderRadius: 100,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.black,
  },
  submitButton: {
    flex: 1,
    height: 54,
    borderRadius: 100,
    overflow: 'hidden',
  },
  submitButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.white,
  },
});


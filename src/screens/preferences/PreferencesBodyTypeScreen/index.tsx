import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  Image,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import DraggableFlatList, {
  ScaleDecorator,
  RenderItemParams,
} from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Button } from '../../../components/Button';
import { ProfileScreenGradient } from '../../../components/ProfileScreenGradient';
import { BackArrowIcon } from '../../../assets/icons/common/BackArrowIcon';
import { DragHandleIcon } from '../../../assets/icons/common/DragHandleIcon';
import { STRINGS } from '../../../constants/strings';
import type { AuthStackParamList } from '../../../navigation/types';
import { usePreferencesStore } from '../../../store/preferences.store';
import {
  buildEditPreferencePayload,
  patchEditPreference,
} from '../../../modules/preferences/api';
import { styles } from './styles';

export type BodyTypeId =
  | 'mesomorph'
  | 'ectomorph'
  | 'medium_build'
  | 'endomorph'
  | 'thick_build';

export type BodyTypeItem = {
  id: BodyTypeId;
  label: string;
  image: number;
};

const BODY_TYPE_OPTIONS: BodyTypeItem[] = [
  { id: 'mesomorph', label: STRINGS.PREFERENCES_BODY_TYPE.TONED, image: require('../../../assets/images/bodytypes/bodytype_toned.png') },
  { id: 'ectomorph', label: STRINGS.PREFERENCES_BODY_TYPE.SLIM, image: require('../../../assets/images/bodytypes/bodytype_slim.png') },
  { id: 'medium_build', label: STRINGS.PREFERENCES_BODY_TYPE.MEDIUM, image: require('../../../assets/images/bodytypes/bodytype_medium.png') },
  { id: 'endomorph', label: STRINGS.PREFERENCES_BODY_TYPE.CURVY, image: require('../../../assets/images/bodytypes/bodytype_curvy.png') },
  { id: 'thick_build', label: STRINGS.PREFERENCES_BODY_TYPE.PLUS_SIZED, image: require('../../../assets/images/bodytypes/bodytype_plus.png') },
];

function getOrderFromStore(stored: string[]): BodyTypeItem[] {
  if (!stored.length) return [...BODY_TYPE_OPTIONS];
  const byId = new Map(BODY_TYPE_OPTIONS.map((o) => [o.id, o]));
  const ordered: BodyTypeItem[] = [];
  for (const id of stored) {
    const item = byId.get(id as BodyTypeId);
    if (item) ordered.push(item);
  }
  const remaining = BODY_TYPE_OPTIONS.filter((o) => !stored.includes(o.id));
  return [...ordered, ...remaining];
}

type NavProp = NativeStackNavigationProp<AuthStackParamList, 'PreferencesBodyType'>;
type RouteProps = RouteProp<AuthStackParamList, 'PreferencesBodyType'>;

export const PreferencesBodyTypeScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteProps>();
  const openedEditFromSummary = usePreferencesStore((s) => s.openedEditFromSummary);
  const returnToSummary = (route.params?.returnToSummary ?? false) || openedEditFromSummary;
  const preferredBodyTypes = usePreferencesStore((s) => s.preferredBodyTypes);
  const setPreferredBodyTypes = usePreferencesStore((s) => s.setPreferredBodyTypes);
  const setOpenedEditFromSummary = usePreferencesStore((s) => s.setOpenedEditFromSummary);

  const [data, setData] = useState<BodyTypeItem[]>(() =>
    getOrderFromStore(preferredBodyTypes)
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setData(getOrderFromStore(preferredBodyTypes));
  }, [preferredBodyTypes]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSave = async () => {
    const orderedIds = data.map((item) => item.id);
    setPreferredBodyTypes(orderedIds);
    setSaving(true);
    try {
      const payload = buildEditPreferencePayload(usePreferencesStore.getState());
      await patchEditPreference(payload);
      if (returnToSummary) {
        setOpenedEditFromSummary(false);
        navigation.goBack();
      } else {
        navigation.navigate('PreferencesSummary');
      }
    } catch {
      setSaving(false);
    } finally {
      setSaving(false);
    }
  };

  const renderItem = useCallback(
    ({ item, drag, isActive }: RenderItemParams<BodyTypeItem>) => (
      <ScaleDecorator activeScale={1.02}>
        <Pressable
          onLongPress={drag}
          disabled={isActive}
          style={[styles.row, isActive && styles.rowActive]}
        >
          <View style={styles.rowImageWrap}>
            <Image source={item.image} style={styles.rowImageImg} resizeMode="contain" />
          </View>
          <Text style={styles.rowLabel} numberOfLines={1}>
            {item.label}
          </Text>
          <View style={styles.dragHandle} pointerEvents="none">
            <DragHandleIcon size={24} color="#1A1A1A" />
          </View>
        </Pressable>
      </ScaleDecorator>
    ),
    []
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <View style={styles.wrapper}>
        <ProfileScreenGradient />
        <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
        <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'top']}>
          <View style={styles.headerContainer}>
            <TouchableOpacity
              onPress={handleBack}
              style={styles.backButton}
              activeOpacity={0.7}
              accessibilityLabel="Go back"
            >
              <BackArrowIcon size={48} backgroundColor="#FFFFFF" strokeColor="#000000" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={styles.title}>{STRINGS.PREFERENCES_BODY_TYPE.TITLE}</Text>
            <Text style={styles.subtitle}>{STRINGS.PREFERENCES_BODY_TYPE.SUBTITLE}</Text>
            <View style={styles.howItWorks}>
              <Text style={styles.howItWorksText}>
                {STRINGS.PREFERENCES_BODY_TYPE.HOW_IT_WORKS}
              </Text>
            </View>

            <DraggableFlatList
              data={data}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              onDragEnd={({ data: newData }) => setData(newData)}
              contentContainerStyle={styles.listContent}
            />
          </View>

          <View style={styles.actions}>
            <Button
              title={STRINGS.PREFERENCES.SAVE}
              onPress={handleSave}
              variant="primary"
              style={styles.primaryButton}
              disabled={saving}
            />
          </View>
        </SafeAreaView>
      </View>
    </GestureHandlerRootView>
  );
};

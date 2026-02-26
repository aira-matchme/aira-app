import React from 'react';
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '../../../components/Button';
import { BackArrowIcon } from '../../../assets/icons/common/BackArrowIcon';
import { STRINGS } from '../../../constants/strings';
import { useProfileStore } from '../../../store/profile.store';
import type { AuthStackParamList } from '../../../navigation/types';
import { CHILDREN_OPTIONS } from '../../../constants/profile';
import { styles } from './styles';
import { ProfileScreenGradient } from '../../../components/ProfileScreenGradient';

type NavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'BasicDetailsChildren'
>;

const CURRENT_STEP = 10;

const childrenSchema = z.object({
  children: z.string().min(1),
});

type ChildrenFormData = z.infer<typeof childrenSchema>;

export const BasicDetailsChildrenScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { children, setChildren, setCurrentStep } = useProfileStore();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { isValid },
  } = useForm<ChildrenFormData>({
    resolver: zodResolver(childrenSchema),
    mode: 'onChange',
    defaultValues: {
      children: children || '',
    },
  });

  const onSubmit = (data: ChildrenFormData) => {
    setChildren(data.children);
    setCurrentStep(CURRENT_STEP + 1);
    navigation.navigate('BasicDetailsInterests');
  };

  return (
    <View style={styles.wrapper}>
      <ProfileScreenGradient />
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'top']}>
        <View style={styles.content}>
        <View style={{ paddingBottom: 16}}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <BackArrowIcon size={48} />
          </TouchableOpacity>
        </View>
         
          <View style={styles.header}>
            <Text style={styles.title}>
              {STRINGS.PROFILE_SETUP.CHILDREN.TITLE}
            </Text>
            <Text style={styles.subtitle}>
              {STRINGS.PROFILE_SETUP.CHILDREN.SUBTITLE}
            </Text>
          </View>

          <ScrollView
            contentContainerStyle={styles.optionsScrollContainer}
            showsVerticalScrollIndicator={false}
            style={styles.optionsScrollView}
          >
            <Controller
              control={control}
              name="children"
              render={({ field: { value } }) => (
                <View style={styles.optionsContainer}>
                  {CHILDREN_OPTIONS.map((option) => {
                    const selected = value === option.key;
                    return (
                      <TouchableOpacity
                        key={option.key}
                        style={[
                          styles.option,
                          selected && styles.optionSelected,
                        ]}
                        activeOpacity={0.8}
                        onPress={() =>
                          setValue('children', option.key, {
                            shouldValidate: true,
                          })
                        }
                      >
                        <Text
                          style={[
                            styles.optionText,
                            selected && styles.optionTextSelected,
                          ]}
                        >
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            />
          </ScrollView>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title={STRINGS.PROFILE_SETUP.COMMON.CONTINUE}
            onPress={handleSubmit(onSubmit)}
            variant="primary"
            disabled={!isValid}
            style={styles.button}
          />
        </View>
      </SafeAreaView>
    </View>
  );
};

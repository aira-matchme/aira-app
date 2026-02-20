import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ReusableBottomSheet } from './BottomSheet';
import { ActionSheetCameraIcon } from '../assets/icons/common/ActionSheetCameraIcon';
import { ActionSheetGalleryIcon } from '../assets/icons/common/ActionSheetGalleryIcon';
import { ActionSheetFileIcon } from '../assets/icons/common/ActionSheetFileIcon';
import { STRINGS } from '../constants/strings';
import { colors, typography } from '../theme';

const ICON_SIZE = 32;
const OPTION_SIZE = 96;

export type AttachmentOption = 'camera' | 'gallery' | 'files';

interface AttachmentOptionsBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (option: AttachmentOption) => void;
}

export const AttachmentOptionsBottomSheet: React.FC<AttachmentOptionsBottomSheetProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const handlePress = (option: AttachmentOption) => {
    onSelect(option);
    onClose();
  };

  return (
    <ReusableBottomSheet
      isOpen={isOpen}
      onClose={onClose}
      snapPoints={['28%']}
      showDragHandle={true}
      showCloseButton={false}
      enablePanDownToClose={true}
      scrollEnabled={false}
    >
      <View style={styles.row}>
        <TouchableOpacity
          style={styles.option}
          onPress={() => handlePress('camera')}
          activeOpacity={0.7}
        >
          <View style={styles.iconWrap}>
            <ActionSheetCameraIcon size={ICON_SIZE} color={colors.primary.purple} />
          </View>
          <Text style={styles.label}>{STRINGS.CHAT.ATTACH_CAMERA}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.option}
          onPress={() => handlePress('gallery')}
          activeOpacity={0.7}
        >
          <View style={styles.iconWrap}>
            <ActionSheetGalleryIcon size={ICON_SIZE} color={colors.primary.purple} />
          </View>
          <Text style={styles.label}>{STRINGS.CHAT.ATTACH_GALLERY}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.option}
          onPress={() => handlePress('files')}
          activeOpacity={0.7}
        >
          <View style={styles.iconWrap}>
            <ActionSheetFileIcon size={ICON_SIZE} color={colors.primary.purple} />
          </View>
          <Text style={styles.label}>{STRINGS.CHAT.ATTACH_FILES}</Text>
        </TouchableOpacity>
      </View>
    </ReusableBottomSheet>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    paddingVertical: 24,
    paddingHorizontal: 8,
  },
  option: {
    alignItems: 'center',
    width: OPTION_SIZE,
  },
  iconWrap: {
    width: OPTION_SIZE,
    height: OPTION_SIZE,
    borderRadius: 16,
    backgroundColor: '#F2F2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    ...typography.bodyMedium,
    fontSize: 14,
    fontWeight: '500',
    color: colors.black,
  },
});

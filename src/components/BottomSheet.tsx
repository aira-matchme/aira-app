import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  PanResponder,
  Platform,
  ScrollView,
  Keyboard,
} from 'react-native';
import { colors, spacing } from '../theme';
import { CloseIcon } from '../assets/icons/common/CloseIcon';

interface BottomSheetProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  snapPoints?: (string | number)[];
  showDragHandle?: boolean;
  showCloseButton?: boolean;
  enablePanDownToClose?: boolean;
  backgroundStyle?: object;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const ReusableBottomSheet: React.FC<BottomSheetProps> = ({
  children,
  isOpen,
  onClose,
  snapPoints = ['50%'],
  showDragHandle = true,
  showCloseButton = true,
  enablePanDownToClose = true,
  backgroundStyle,
}) => {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const panY = useRef(new Animated.Value(0)).current;
  const lastGestureDy = useRef(0);
  const keyboardShift = useRef(new Animated.Value(0)).current;

  // Calculate snap point height (use first snap point)
  const getSnapPointHeight = () => {
    const snapPoint = snapPoints[0];
    if (typeof snapPoint === 'string' && snapPoint.includes('%')) {
      const percentage = parseFloat(snapPoint) / 100;
      return SCREEN_HEIGHT * percentage;
    }
    return typeof snapPoint === 'number' ? snapPoint : SCREEN_HEIGHT * 0.6;
  };

  const sheetHeight = getSnapPointHeight();
  const CLOSE_THRESHOLD = sheetHeight * 0.3; // Close if dragged down 30% of sheet height
  const VELOCITY_THRESHOLD = 0.5; // Close if velocity is high enough

  // Pan responder for drag-to-close gesture
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false, // Never capture on start - let buttons work
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to downward gestures with significant movement
        // This allows buttons to work (taps have small movement) but still allows dragging
        return enablePanDownToClose && gestureState.dy > 15 && Math.abs(gestureState.dx) < Math.abs(gestureState.dy);
      },
      onPanResponderGrant: () => {
        // Stop any ongoing animations
        slideAnim.stopAnimation();
        panY.setValue(0);
        lastGestureDy.current = 0;
      },
      onPanResponderMove: (_, gestureState) => {
        // Only allow dragging down
        if (gestureState.dy > 0) {
          panY.setValue(gestureState.dy);
          lastGestureDy.current = gestureState.dy;

          // Update backdrop opacity based on drag
          const dragProgress = Math.min(gestureState.dy / sheetHeight, 1);
          backdropOpacity.setValue(1 - dragProgress * 0.5);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const shouldClose =
          gestureState.dy > CLOSE_THRESHOLD || gestureState.vy > VELOCITY_THRESHOLD;

        if (shouldClose) {
          // Close the sheet
          Animated.parallel([
            Animated.timing(panY, {
              toValue: sheetHeight,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(backdropOpacity, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start(() => {
            panY.setValue(0);
            onClose();
          });
        } else {
          // Snap back to original position
          Animated.parallel([
            Animated.spring(panY, {
              toValue: 0,
              useNativeDriver: true,
              tension: 65,
              friction: 11,
            }),
            Animated.spring(backdropOpacity, {
              toValue: 1,
              useNativeDriver: true,
              tension: 65,
              friction: 11,
            }),
          ]).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (isOpen) {
      // Stop any ongoing animations first
      slideAnim.stopAnimation();
      backdropOpacity.stopAnimation();

      // Open animation - only animate transform and opacity (can use native driver)
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Stop any ongoing animations first
      slideAnim.stopAnimation();
      backdropOpacity.stopAnimation();

      // Close animation - only animate transform and opacity (can use native driver)
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isOpen, slideAnim, backdropOpacity]);

  useEffect(() => {
    if (!isOpen || Platform.OS !== 'ios') {
      keyboardShift.setValue(0);
      return;
    }
  
    const MIN_TOP_SPACE = 80;
    let lastShift = 0;
  
    const subscription = Keyboard.addListener(
      'keyboardWillChangeFrame',
      (event) => {
        const screenY = event.endCoordinates.screenY;
        const keyboardHeight = SCREEN_HEIGHT - screenY;
  
        if (keyboardHeight <= 0) {
          // Keyboard closing
          Animated.timing(keyboardShift, {
            toValue: 0,
            duration: event.duration ?? 250,
            useNativeDriver: true,
          }).start();
          lastShift = 0;
          return;
        }
  
        let shift = -keyboardHeight;
        const maxNegativeShift = -(SCREEN_HEIGHT - sheetHeight - MIN_TOP_SPACE);
        shift = Math.max(shift, maxNegativeShift);
  
        // 🔥 PREVENT MICRO-FLICKER
        if (Math.abs(shift - lastShift) < 6) {
          return;
        }
  
        lastShift = shift;
  
        Animated.timing(keyboardShift, {
          toValue: shift,
          duration: event.duration ?? 250,
          useNativeDriver: true,
        }).start();
      }
    );
  
    return () => subscription.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, sheetHeight]);
  

  if (!isOpen) {
    return null;
  }

  return (
    <Modal
      transparent
      visible={isOpen}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.modalContainer}>
        {/* Backdrop */}
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View
            style={[
              styles.backdrop,
              {
                opacity: backdropOpacity,
              },
            ]}
          />
        </TouchableWithoutFeedback>

        {/* Bottom Sheet */}
        <Animated.View
          style={[
            styles.bottomSheetContainer,
            {
              height: sheetHeight,
            },
            backgroundStyle,
            {
              transform: [
                {
                  translateY:
                    Platform.OS === 'ios' ? keyboardShift : 0,
                },
              ],
              
            },
          ]}
        >
          <Animated.View
            style={[
              styles.bottomSheetContent,
              {
                transform: [
                  {
                    translateY: Animated.add(slideAnim, panY),
                  },
                ],
              },
            ]}
            {...(enablePanDownToClose ? panResponder.panHandlers : {})}
          >
            {/* Drag Handle */}
            {showDragHandle && (
              <View style={styles.dragHandleContainer}>
                <View style={styles.dragHandle} />
              </View>
            )}

            {/* Close Button */}
            {showCloseButton && (
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <CloseIcon size={24} color={colors.neutral[300]} />
              </TouchableOpacity>
            )}

            {/* Content */}
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={[
                styles.scrollViewContent,
                Platform.OS === 'android' && { paddingBottom: 300 },
              ]}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              showsVerticalScrollIndicator={false}
              bounces={false}
              nestedScrollEnabled={true}
            >
              <View style={styles.contentContainer} pointerEvents="box-none">
                {children}
              </View>
            </ScrollView>
          </Animated.View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  bottomSheetContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden', // Ensure content doesn't overflow rounded corners
  },
  bottomSheetContent: {
    flex: 1,
    width: '100%',
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  dragHandle: {
    width: 30,
    height: 4,
    backgroundColor: colors.neutral[300],
    borderRadius: 100,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
  },
  closeButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 24,
    height: 24,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

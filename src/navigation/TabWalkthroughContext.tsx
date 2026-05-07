import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { STRINGS } from '../constants/strings';
import { colors } from '../theme';
import { markAppTourCompleted } from '../services/appTour/markAppTourCompleted';

const w = STRINGS.DASHBOARD_WALKTHROUGH;

export type TabWalkthroughStepId =
  | 'tab_profile'
  | 'tab_likes'
  | 'tab_ai'
  | 'tab_chat'
  | 'tab_home';

const STEP_ORDER: TabWalkthroughStepId[] = [
  'tab_profile',
  'tab_likes',
  'tab_ai',
  'tab_chat',
  'tab_home',
];

const STEP_COPY: Record<TabWalkthroughStepId, { title: string; body: string }> = {
  tab_profile: { title: w.STEP_PROFILE_TITLE, body: w.STEP_PROFILE_TAB },
  tab_likes: { title: w.STEP_LIKES_TITLE, body: w.STEP_LIKES_TAB },
  tab_ai: { title: w.STEP_AI_TITLE, body: w.STEP_AI_TAB },
  tab_chat: { title: w.STEP_CHAT_TITLE, body: w.STEP_CHAT_TAB },
  tab_home: { title: w.STEP_HOME_TITLE, body: w.STEP_HOME_TAB },
};

type HoleRect = { x: number; y: number; width: number; height: number };

type TabWalkthroughContextValue = {
  /** Tour overlay visible (tab bar steps). */
  active: boolean;
  /** True while any tab tour step is showing — used to keep Match tab bar visible. */
  visibleForTabBar: boolean;
  setTargetRef: (id: TabWalkthroughStepId, node: View | null) => void;
  measureTargetFromNode: (id: TabWalkthroughStepId, node: View | null) => void;
  /** Active tour target id (for measuring views). */
  currentStepId: TabWalkthroughStepId | null;
  /** Pushes window rect for the active step when tab cells lay out. */
  updateHoleFromGeometry: (id: TabWalkthroughStepId, rect: HoleRect | null) => void;
  /** First step is Profile (same as previous `start('tab_profile')`). */
  startFromProfile: () => void;
  skip: () => void;
  goNext: () => void;
  goPrev: () => void;
};

const TabWalkthroughContext = createContext<TabWalkthroughContextValue | null>(null);

async function finalizeWalkthrough() {
  try {
    await markAppTourCompleted();
  } catch {
    // Retry next session if network fails; user can complete tour again from welcome.
  }
}

const HOLE_VISUAL_PADDING = 0;

/** Padding is 0 so the cutout matches the measured tab (no outer frame from inflation). Then clamp to the screen. */
function clampHole(hole: HoleRect, sw: number, sh: number): HoleRect | null {
  const inflated: HoleRect = {
    x: hole.x - HOLE_VISUAL_PADDING,
    y: hole.y - HOLE_VISUAL_PADDING,
    width: hole.width + HOLE_VISUAL_PADDING * 2,
    height: hole.height + HOLE_VISUAL_PADDING * 2,
  };
  const x = Math.max(0, Math.min(inflated.x, sw - 1));
  const y = Math.max(0, Math.min(inflated.y, sh - 1));
  const width = Math.max(0, Math.min(inflated.width, sw - x));
  const height = Math.max(0, Math.min(inflated.height, sh - y));
  if (width < 2 || height < 2) {
    return null;
  }
  return { x, y, width, height };
}

function TabWalkthroughOverlay({
  active,
  stepIndex,
  hole,
  overlayRootRef,
  overlaySize,
  targetsRef,
  onSkip,
  onNext,
  updateHole,
}: {
  active: boolean;
  stepIndex: number;
  hole: HoleRect | null;
  overlayRootRef: React.MutableRefObject<View | null>;
  overlaySize: { width: number; height: number };
  targetsRef: React.MutableRefObject<Partial<Record<TabWalkthroughStepId, View | null>>>;
  onSkip: () => void;
  onNext: () => void;
  updateHole: (rect: HoleRect | null) => void;
}) {
  const { width: sw, height: sh } = overlaySize;
  const insets = useSafeAreaInsets();
  const [tooltipCardHeight, setTooltipCardHeight] = useState(0);
  const holeClamped = useMemo(
    () => (hole != null ? clampHole(hole, sw, sh) : null),
    [hole, sw, sh]
  );

  const stepId = STEP_ORDER[stepIndex];
  const copy = stepId ? STEP_COPY[stepId] : null;

  const remeasure = useCallback(() => {
    if (!active || !stepId) {
      updateHole(null);
      return;
    }
    const node = targetsRef.current[stepId];
    const root = overlayRootRef.current;
    if (!node || !root) {
      updateHole(null);
      return;
    }
    requestAnimationFrame(() => {
      node.measureLayout(
        root as never,
        (x, y, width, height) => {
          if (width <= 0 || height <= 0) {
            updateHole(null);
            return;
          }
          updateHole({ x, y, width, height });
        },
        () => {
          updateHole(null);
        }
      );
    });
  }, [active, overlayRootRef, stepId, targetsRef, updateHole]);

  useEffect(() => {
    if (!active || sw <= 0 || sh <= 0) {
      updateHole(null);
      return;
    }
    remeasure();
  }, [active, remeasure, sh, stepIndex, sw, updateHole]);

  const tooltipGeometry = useMemo(() => {
    const compact = sw <= 360 || sh <= 700;
    const sideGutter = compact ? 10 : 12;
    const cardWidth = Math.min(compact ? 360 : 420, Math.max(280, sw - sideGutter * 2));
    const holeCx = holeClamped != null ? holeClamped.x + holeClamped.width / 2 : sw / 2;
    const left = Math.max(sideGutter, Math.min(sw - sideGutter - cardWidth, holeCx - cardWidth / 2));
    const minBottom = insets.bottom + (compact ? 6 : 10);
    const preferredBottom = holeClamped != null ? Math.max(minBottom, sh - holeClamped.y + 24) : minBottom + 24;
    const maxBottom =
      tooltipCardHeight > 0
        ? Math.max(minBottom, sh - insets.top - tooltipCardHeight - (compact ? 14 : 20) - 24)
        : Number.POSITIVE_INFINITY;
    const bottom = Math.max(minBottom, Math.min(preferredBottom, maxBottom));
    const tailLeft = Math.max(18, Math.min(cardWidth - 42, holeCx - left - 12));
    return { left, width: cardWidth, bottom, tailLeft, compact };
  }, [holeClamped, insets.bottom, insets.top, sh, sw, tooltipCardHeight]);

  if (!active || !copy || sw <= 0 || sh <= 0) {
    return null;
  }

  return (
    <View style={[styles.overlayRoot, { width: sw, height: sh }]} pointerEvents="box-none">
      <View
        pointerEvents="auto"
        style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.48)' }]}
      />
      <View
        pointerEvents="box-none"
        style={[
          styles.tooltipWrap,
          {
            left: tooltipGeometry.left,
            width: tooltipGeometry.width,
            bottom: tooltipGeometry.bottom,
          },
        ]}
      >
        <View
          style={[styles.tooltipCard, tooltipGeometry.compact && styles.tooltipCardCompact]}
          pointerEvents="auto"
          onLayout={(e) => setTooltipCardHeight(e.nativeEvent.layout.height)}
        >
          <Text style={[styles.tooltipTitle, tooltipGeometry.compact && styles.tooltipTitleCompact]}>
            {copy.title}
          </Text>
          <Text style={[styles.tooltipBody, tooltipGeometry.compact && styles.tooltipBodyCompact]}>
            {copy.body}
          </Text>
          <View style={styles.tooltipBar}>
            <View style={[styles.actionColumn, styles.actionColumnLeft]} />
            <View style={[styles.actionColumn, styles.actionColumnCenter]}>
              <TouchableOpacity
                onPress={onNext}
                activeOpacity={0.85}
                style={[styles.primaryWrap, tooltipGeometry.compact && styles.primaryWrapCompact]}
              >
                <LinearGradient
                  colors={[colors.secondary.lavender, colors.primary.purple] as [string, string]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={[styles.primaryBtn, tooltipGeometry.compact && styles.primaryBtnCompact]}
                >
                  <Text
                    allowFontScaling={false}
                    numberOfLines={1}
                    style={[styles.primaryTxt, tooltipGeometry.compact && styles.primaryTxtCompact]}
                  >
                    {w.NEXT}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
            <View style={[styles.actionColumn, styles.actionColumnRight]}>
              <TouchableOpacity onPress={onSkip} hitSlop={8} activeOpacity={0.75}>
                <Text
                  allowFontScaling={false}
                  style={[styles.skipTxt, tooltipGeometry.compact && styles.skipTxtCompact]}
                >
                  {w.SKIP}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View style={[styles.tooltipTail, { left: tooltipGeometry.tailLeft }]} />
      </View>
    </View>
  );
}

export function TabWalkthroughProvider({ children }: { children: React.ReactNode }) {
  const overlayRootRef = useRef<View | null>(null);
  const targetsRef = useRef<Partial<Record<TabWalkthroughStepId, View | null>>>({});
  const stepIndexRef = useRef(0);
  const activeRef = useRef(false);
  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [hole, setHole] = useState<HoleRect | null>(null);
  const [overlaySize, setOverlaySize] = useState({ width: 0, height: 0 });

  const currentStepId = active ? STEP_ORDER[stepIndex] ?? null : null;

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    stepIndexRef.current = stepIndex;
  }, [stepIndex]);

  const setTargetRef = useCallback((id: TabWalkthroughStepId, node: View | null) => {
    targetsRef.current[id] = node;
  }, []);

  const measureTargetFromNode = useCallback(
    (id: TabWalkthroughStepId, node: View | null) => {
      if (!activeRef.current || STEP_ORDER[stepIndexRef.current] !== id) return;
      const root = overlayRootRef.current;
      if (!node || !root) return;
      requestAnimationFrame(() => {
        node.measureLayout(
          root as never,
          (x, y, width, height) => {
            if (width <= 0 || height <= 0) {
              return;
            }
            setHole({ x, y, width, height });
          },
          () => {
            // Keep previous position if one transient measure call fails.
          }
        );
      });
    },
    []
  );

  const updateHoleFromGeometry = useCallback((id: TabWalkthroughStepId, rect: HoleRect | null) => {
    if (!activeRef.current) return;
    if (STEP_ORDER[stepIndexRef.current] !== id) return;
    if (rect != null && rect.width > 0 && rect.height > 0) {
      setHole(rect);
    } else {
      setHole(null);
    }
  }, []);

  useEffect(() => {
    if (!active) {
      setHole(null);
    }
  }, [active]);

  useEffect(() => {
    if (active) {
      setHole(null);
    }
  }, [stepIndex, active]);

  const stop = useCallback(() => {
    stepIndexRef.current = 0;
    setHole(null);
    setActive(false);
    setStepIndex(0);
  }, []);

  const skip = useCallback(() => {
    void finalizeWalkthrough();
    stop();
  }, [stop]);

  const goNext = useCallback(() => {
    const i = stepIndexRef.current;
    if (i >= STEP_ORDER.length - 1) {
      void finalizeWalkthrough();
      stop();
      return;
    }
    const next = i + 1;
    stepIndexRef.current = next;
    setStepIndex(next);
  }, [stop]);

  const goPrev = useCallback(() => {
    const next = Math.max(0, stepIndexRef.current - 1);
    stepIndexRef.current = next;
    setStepIndex(next);
  }, []);

  const startFromProfile = useCallback(() => {
    stepIndexRef.current = 0;
    setStepIndex(0);
    setActive(true);
  }, []);

  const onRootLayout = useCallback((event: { nativeEvent: { layout: { width: number; height: number } } }) => {
    const { width, height } = event.nativeEvent.layout;
    if (width <= 0 || height <= 0) return;
    setOverlaySize((prev) =>
      prev.width === width && prev.height === height ? prev : { width, height }
    );
  }, []);

  const value = useMemo<TabWalkthroughContextValue>(
    () => ({
      active,
      visibleForTabBar: active,
      setTargetRef,
      measureTargetFromNode,
      currentStepId,
      updateHoleFromGeometry,
      startFromProfile,
      skip,
      goNext,
      goPrev,
    }),
    [
      active,
      setTargetRef,
      measureTargetFromNode,
      currentStepId,
      updateHoleFromGeometry,
      startFromProfile,
      skip,
      goNext,
      goPrev,
    ]
  );

  return (
    <TabWalkthroughContext.Provider value={value}>
      <View ref={overlayRootRef} style={styles.providerRoot} onLayout={onRootLayout} collapsable={false}>
        {children}
        <TabWalkthroughOverlay
          active={active}
          stepIndex={stepIndex}
          hole={hole}
          overlayRootRef={overlayRootRef}
          overlaySize={overlaySize}
          targetsRef={targetsRef}
          onSkip={skip}
          onNext={goNext}
          updateHole={setHole}
        />
      </View>
    </TabWalkthroughContext.Provider>
  );
}

/** Wrap tab bar targets — reports window geometry on layout so the spotlight tracks the real tab cell. */
export function TabWalkthroughMeasuringView({
  id,
  style,
  children,
}: {
  id: TabWalkthroughStepId;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}) {
  const ctx = useContext(TabWalkthroughContext);
  const hostRef = useRef<View | null>(null);

  const measureAndReport = useCallback(() => {
    if (!ctx?.active || ctx.currentStepId !== id) return;
    const node = hostRef.current;
    if (!node) return;
    ctx.measureTargetFromNode(id, node);
  }, [ctx, id]);

  const onLayout = useCallback(() => {
    measureAndReport();
  }, [measureAndReport]);

  useEffect(() => {
    if (!ctx?.active || ctx.currentStepId !== id) return;
    measureAndReport();
  }, [ctx?.active, ctx?.currentStepId, id, measureAndReport]);

  if (!ctx) {
    return (
      <View style={style} collapsable={false}>
        {children}
      </View>
    );
  }

  return (
    <View
      ref={(n) => {
        hostRef.current = n;
        ctx.setTargetRef(id, n);
      }}
      onLayout={onLayout}
      style={style}
      collapsable={false}
    >
      {children}
    </View>
  );
}

export function useTabWalkthrough(): TabWalkthroughContextValue {
  const ctx = useContext(TabWalkthroughContext);
  if (!ctx) {
    throw new Error('useTabWalkthrough must be used within TabWalkthroughProvider');
  }
  return ctx;
}

const styles = StyleSheet.create({
  providerRoot: {
    flex: 1,
  },
  overlayRoot: {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 9999,
  },
  tooltipWrap: {
    position: 'absolute',
  },
  tooltipCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 18,
    maxWidth: '100%',
  },
  tooltipCardCompact: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
  },
  tooltipTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.neutral[900],
    marginBottom: 10,
    textAlign: 'center',
  },
  tooltipTitleCompact: {
    fontSize: 16,
    marginBottom: 8,
  },
  tooltipBody: {
    fontSize: 15,
    lineHeight: 24,
    color: colors.neutral[700],
    marginBottom: 20,
    textAlign: 'center',
  },
  tooltipBodyCompact: {
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 14,
  },
  tooltipBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  actionColumn: {
    flex: 1,
    minHeight: 32,
    justifyContent: 'center',
  },
  actionColumnLeft: {
    alignItems: 'flex-start',
  },
  actionColumnCenter: {
    alignItems: 'center',
  },
  actionColumnRight: {
    alignItems: 'flex-end',
    paddingRight: 2,
  },
  skipTxt: {
    fontSize: 17,
    fontWeight: '500',
    color: colors.neutral[500],
  },
  skipTxtCompact: {
    fontSize: 16,
  },
  primaryWrap: {
    flexShrink: 0,
    alignSelf: 'center',
    width: 128,
  },
  primaryWrapCompact: {
    width: 112,
  },
  primaryBtn: {
    width: '100%',
    minHeight: 44,
    paddingHorizontal: 0,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnCompact: {
    minHeight: 40,
    paddingHorizontal: 28,
  },
  primaryTxt: {
    fontSize: 16,
    lineHeight: 18,
    fontWeight: '600',
    color: colors.white,
    textAlign: 'center',
    includeFontPadding: false,
  },
  primaryTxtCompact: {
    fontSize: 15,
  },
  tooltipTail: {
    position: 'absolute',
    bottom: -10,
    width: 24,
    height: 24,
    backgroundColor: colors.white,
    borderRadius: 4,
    transform: [{ rotate: '45deg' }],
  },
});

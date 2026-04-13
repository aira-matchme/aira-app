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
  Dimensions,
  InteractionManager,
  Modal,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STRINGS } from '../constants/strings';
import { colors } from '../theme';
import { DASHBOARD_WALKTHROUGH_STORAGE_KEY } from '../constants/dashboardWalkthroughStorage';

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

async function persistWalkthroughDone() {
  await AsyncStorage.setItem(DASHBOARD_WALKTHROUGH_STORAGE_KEY, 'true');
}

/**
 * Android: tab targets are measured with `measureInWindow` in the **application window**
 * coordinate system (origin typically below the status bar). A `Modal` with
 * `transparent` + `statusBarTranslucent` draws from the **physical screen** top, so the
 * spotlight appears shifted up unless we translate Y by the same inset.
 */
function useMeasureWindowToOverlayDY(): number {
  const insets = useSafeAreaInsets();
  return useMemo(() => {
    if (Platform.OS !== 'android') {
      return 0;
    }
    return Math.max(insets.top, StatusBar.currentHeight ?? 0);
  }, [insets.top]);
}

/** Modal + measureInWindow use screen coordinates; canvas must cover full physical screen. */
function useOverlayCanvasSize() {
  const read = useCallback(() => {
    const win = Dimensions.get('window');
    const scr = Dimensions.get('screen');
    return {
      width: Math.max(win.width, scr.width),
      height: Math.max(win.height, scr.height),
    };
  }, []);
  const [dims, setDims] = useState(read);
  useEffect(() => {
    const sub = Dimensions.addEventListener('change', () => {
      setDims(read());
    });
    return () => sub.remove();
  }, [read]);
  return dims;
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
  if (width < 16 || height < 16) {
    return null;
  }
  return { x, y, width, height };
}

function DimmingRects({
  hole,
  sw,
  sh,
  color,
}: {
  hole: HoleRect;
  sw: number;
  sh: number;
  color: string;
}) {
  const { x, y, width, height } = hole;
  return (
    <>
      <View
        pointerEvents="auto"
        style={[styles.dim, { left: 0, top: 0, width: sw, height: y, backgroundColor: color }]}
      />
      <View
        pointerEvents="auto"
        style={[styles.dim, { left: 0, top: y, width: x, height, backgroundColor: color }]}
      />
      <View
        pointerEvents="auto"
        style={[
          styles.dim,
          { left: x + width, top: y, width: sw - x - width, height, backgroundColor: color },
        ]}
      />
      <View
        pointerEvents="auto"
        style={[
          styles.dim,
          { left: 0, top: y + height, width: sw, height: sh - y - height, backgroundColor: color },
        ]}
      />
    </>
  );
}

function TabWalkthroughOverlay({
  active,
  stepIndex,
  hole,
  setHole,
  targetsRef,
  onSkip,
  onNext,
  onPrev,
}: {
  active: boolean;
  stepIndex: number;
  hole: HoleRect | null;
  setHole: React.Dispatch<React.SetStateAction<HoleRect | null>>;
  targetsRef: React.MutableRefObject<Partial<Record<TabWalkthroughStepId, View | null>>>;
  onSkip: () => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  const { width: sw, height: sh } = useOverlayCanvasSize();
  const measureToOverlayDY = useMeasureWindowToOverlayDY();
  const holeForOverlay = useMemo(() => {
    if (hole == null) {
      return null;
    }
    if (measureToOverlayDY === 0) {
      return hole;
    }
    return { ...hole, y: hole.y + measureToOverlayDY };
  }, [hole, measureToOverlayDY]);
  const holeClamped = useMemo(
    () => (holeForOverlay != null ? clampHole(holeForOverlay, sw, sh) : null),
    [holeForOverlay, sw, sh]
  );

  const stepId = STEP_ORDER[stepIndex];
  const copy = stepId ? STEP_COPY[stepId] : null;
  const isFirst = stepIndex <= 0;
  const isLast = stepIndex >= STEP_ORDER.length - 1;

  const remeasure = useCallback(() => {
    if (!active || !stepId) {
      setHole(null);
      return;
    }
    const node = targetsRef.current[stepId];
    if (!node) {
      setHole(null);
      return;
    }
    InteractionManager.runAfterInteractions(() => {
      requestAnimationFrame(() => {
        node.measureInWindow((x, y, width, height) => {
          if (width <= 0 || height <= 0) {
            setHole(null);
            return;
          }
          setHole({ x, y, width, height });
        });
      });
    });
  }, [active, stepId, targetsRef]);

  useEffect(() => {
    if (!active) {
      setHole(null);
      return;
    }
    remeasure();
    const t1 = requestAnimationFrame(() => remeasure());
    const t2 = setTimeout(() => remeasure(), 160);
    const t3 = setTimeout(() => remeasure(), 400);
    const t4 = setTimeout(() => remeasure(), 700);
    return () => {
      cancelAnimationFrame(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [active, stepIndex, remeasure, sw, sh]);

  const tooltipAbove =
    holeClamped != null && holeClamped.y + holeClamped.height > sh * 0.52;

  const tooltipHorizontal = useMemo(() => {
    if (holeClamped == null) {
      return { left: 16 as const, right: 16 as const };
    }
    const cx = holeClamped.x + holeClamped.width / 2;
    const cardW = Math.min(400, sw - 32);
    const left = Math.max(16, Math.min(sw - 16 - cardW, cx - cardW / 2));
    return { left, width: cardW };
  }, [holeClamped, sw]);

  if (!active || !copy) {
    return null;
  }

  return (
    <Modal
      visible
      transparent
      animationType="none"
      statusBarTranslucent
      presentationStyle={Platform.OS === 'ios' ? 'overFullScreen' : undefined}
      onRequestClose={onSkip}
    >
      <View style={[styles.modalRoot, { width: sw, height: sh }]} pointerEvents="box-none">
        {holeClamped != null ? (
          <DimmingRects hole={holeClamped} sw={sw} sh={sh} color="rgba(0,0,0,0.48)" />
        ) : (
          <View
            pointerEvents="auto"
            style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.4)' }]}
          />
        )}
        <View
          pointerEvents="box-none"
          style={[
            styles.tooltipWrap,
            tooltipHorizontal,
            tooltipAbove
              ? {
                  bottom:
                    holeClamped != null
                      ? Math.max(24, sh - holeClamped.y + 12)
                      : Math.max(120, sh * 0.22),
                }
              : {
                  top:
                    holeClamped != null
                      ? holeClamped.y + holeClamped.height + 12
                      : Math.max(120, sh * 0.22),
                },
          ]}
        >
          <View style={styles.tooltipCard} pointerEvents="auto">
            <Text style={styles.tooltipTitle}>{copy.title}</Text>
            <Text style={styles.tooltipBody}>{copy.body}</Text>
            <View style={styles.tooltipBar}>
              <TouchableOpacity onPress={onSkip} hitSlop={8} activeOpacity={0.7}>
                <Text style={styles.skipTxt}>{w.SKIP}</Text>
              </TouchableOpacity>
              <View style={styles.tooltipBarRight}>
                {!isFirst ? (
                  <TouchableOpacity onPress={onPrev} hitSlop={8} activeOpacity={0.7}>
                    <Text style={styles.backTxt}>{w.PREVIOUS}</Text>
                  </TouchableOpacity>
                ) : null}
                <TouchableOpacity
                  onPress={onNext}
                  activeOpacity={0.85}
                  style={styles.primaryWrap}
                >
                  <LinearGradient
                    colors={[colors.secondary.lavender, colors.primary.purple] as [string, string]}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={styles.primaryBtn}
                  >
                    <Text style={styles.primaryTxt}>
                      {isLast ? w.NEXT : isFirst ? w.GET_STARTED : w.NEXT}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function TabWalkthroughProvider({ children }: { children: React.ReactNode }) {
  const targetsRef = useRef<Partial<Record<TabWalkthroughStepId, View | null>>>({});
  const stepIndexRef = useRef(0);
  const activeRef = useRef(false);
  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [hole, setHole] = useState<HoleRect | null>(null);

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
    void persistWalkthroughDone();
    stop();
  }, [stop]);

  const goNext = useCallback(() => {
    const i = stepIndexRef.current;
    if (i >= STEP_ORDER.length - 1) {
      void persistWalkthroughDone();
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

  const value = useMemo<TabWalkthroughContextValue>(
    () => ({
      active,
      visibleForTabBar: active,
      setTargetRef,
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
      {children}
      <TabWalkthroughOverlay
        active={active}
        stepIndex={stepIndex}
        hole={hole}
        setHole={setHole}
        targetsRef={targetsRef}
        onSkip={skip}
        onNext={goNext}
        onPrev={goPrev}
      />
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
    requestAnimationFrame(() => {
      node.measureInWindow((x, y, width, height) => {
        if (width <= 0 || height <= 0) return;
        ctx.updateHoleFromGeometry(id, { x, y, width, height });
      });
    });
  }, [ctx, id]);

  const onLayout = useCallback(() => {
    measureAndReport();
  }, [measureAndReport]);

  useEffect(() => {
    if (!ctx?.active || ctx.currentStepId !== id) return;
    measureAndReport();
    const t = setTimeout(measureAndReport, 80);
    return () => clearTimeout(t);
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
  dim: {
    position: 'absolute',
  },
  modalRoot: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  tooltipWrap: {
    position: 'absolute',
  },
  tooltipCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
    maxWidth: '100%',
  },
  tooltipTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.neutral[900],
    marginBottom: 8,
  },
  tooltipBody: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.neutral[800],
    marginBottom: 4,
  },
  tooltipBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  tooltipBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skipTxt: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.neutral[500],
  },
  backTxt: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.neutral[600],
    marginRight: 10,
  },
  primaryWrap: {
    borderRadius: 100,
    overflow: 'hidden',
    minWidth: 96,
  },
  primaryBtn: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  primaryTxt: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.white,
  },
});

import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { TooltipProps } from 'react-native-copilot';
import { useCopilot } from 'react-native-copilot';
import { colors } from '../theme';
import { STRINGS } from '../constants/strings';

const w = STRINGS.DASHBOARD_WALKTHROUGH;

/**
 * Figma-style tooltip: optional title (first segment before a blank line) + body.
 * Step 1 primary = "Get Started"; middle steps = "Next"; last step = "Next" (ends tour).
 */
export const TabWalkthroughTooltip: React.FC<TooltipProps> = ({ labels }) => {
  const { goToNext, goToPrev, stop, currentStep, isFirstStep, isLastStep } = useCopilot();

  const { title, body } = useMemo(() => {
    const raw = currentStep?.text ?? '';
    const parts = raw.split('\n\n');
    if (parts.length >= 2) {
      return { title: parts[0], body: parts.slice(1).join('\n\n') };
    }
    return { title: '', body: raw };
  }, [currentStep?.text]);

  return (
    <View>
      <View style={styles.descWrap}>
        {title ? <Text style={styles.title}>{title}</Text> : null}
        <Text style={[styles.desc, !title && styles.descSingle]}>{body}</Text>
      </View>
      <View style={styles.bar}>
        <TouchableOpacity onPress={() => void stop()} hitSlop={8}>
          <Text style={styles.skip}>{labels.skip}</Text>
        </TouchableOpacity>
        <View style={styles.barRight}>
          {!isFirstStep ? (
            <TouchableOpacity onPress={() => void goToPrev()} style={styles.backBtn} hitSlop={8}>
              <Text style={styles.backTxt}>{labels.previous}</Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => (isLastStep ? void stop() : void goToNext())}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryTxt}>
              {isLastStep ? w.NEXT : isFirstStep ? w.GET_STARTED : w.NEXT}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  descWrap: {
    paddingHorizontal: 4,
    paddingBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.neutral[900],
    marginBottom: 8,
  },
  desc: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.neutral[800],
  },
  descSingle: {
    marginTop: 0,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  barRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skip: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.neutral[500],
  },
  backBtn: {
    marginRight: 10,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  backTxt: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.neutral[600],
  },
  primaryBtn: {
    backgroundColor: colors.primary.purple,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 100,
    minWidth: 96,
    alignItems: 'center',
  },
  primaryTxt: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.white,
  },
});

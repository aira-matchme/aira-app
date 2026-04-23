import { useState, useEffect, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAiSuggestionsApi } from '../../../modules/chat/api';
import {
  isAiraLimitError,
  getTimeUntilMidnight,
  parseAiraTimeLeft,
  decrementCountdown,
} from '../utils/helpers';

const DONT_SHOW_ASK_AIRA_CONFIRM_KEY = 'dont_show_ask_aira_confirm';

interface UseAiraSuggestionsParams {
  chatId: string | null;
  setInputText: (text: string) => void;
}

interface UseAiraSuggestionsResult {
  askAiraGenerating: boolean;
  generatedReplies: string[] | null;
  askAiraConfirmVisible: boolean;
  setAskAiraConfirmVisible: (v: boolean) => void;
  dontShowAskAiraAgain: boolean;
  setDontShowAskAiraAgain: (v: boolean) => void;
  dontShowAskAiraPersisted: boolean;
  askAiraConfirmLoading: boolean;
  airaLimitReachedVisible: boolean;
  setAiraLimitReachedVisible: (v: boolean) => void;
  airaLimitCountdown: { hours: number; minutes: number; seconds: number };
  airaSuggestionsLimitLeft: number | null;
  airaSuggestionsTotalLimit: number | null;
  selectedReplyIndex: number;
  setSelectedReplyIndex: (i: number) => void;
  setDontShowAskAiraPersisted: (v: boolean) => void;
  setGeneratedReplies: (v: string[] | null) => void;
  requestAiSuggestions: (opts?: { closeConfirmSheetOnStart?: boolean }) => void;
  handleCancelAiSuggestions: () => void;
  handleInsertReply: () => void;
}

export function useAiraSuggestions({
  chatId,
  setInputText,
}: UseAiraSuggestionsParams): UseAiraSuggestionsResult {
  const [askAiraGenerating, setAskAiraGenerating] = useState(false);
  const [generatedReplies, setGeneratedReplies] = useState<string[] | null>(null);
  const [askAiraConfirmVisible, setAskAiraConfirmVisible] = useState(false);
  const [dontShowAskAiraAgain, setDontShowAskAiraAgain] = useState(false);
  const [dontShowAskAiraPersisted, setDontShowAskAiraPersisted] = useState(false);
  const [askAiraConfirmLoading, setAskAiraConfirmLoading] = useState(false);
  const [airaLimitReachedVisible, setAiraLimitReachedVisible] = useState(false);
  const [airaLimitCountdown, setAiraLimitCountdown] = useState({ hours: 23, minutes: 47, seconds: 12 });
  const [airaSuggestionsLimitLeft, setAiraSuggestionsLimitLeft] = useState<number | null>(null);
  const [airaSuggestionsTotalLimit, setAiraSuggestionsTotalLimit] = useState<number | null>(null);
  const [selectedReplyIndex, setSelectedReplyIndex] = useState(0);
  const aiSuggestionsRequestIdRef = useRef(0);

  useEffect(() => {
    AsyncStorage.getItem(DONT_SHOW_ASK_AIRA_CONFIRM_KEY).then((value) => {
      setDontShowAskAiraPersisted(value === 'true');
    });
  }, []);

  useEffect(() => {
    if (!askAiraGenerating) return;
    if (generatedReplies != null || airaLimitReachedVisible) {
      setAskAiraGenerating(false);
    }
  }, [askAiraGenerating, generatedReplies, airaLimitReachedVisible]);

  useEffect(() => {
    if (!airaLimitReachedVisible) return;
    const id = setInterval(() => {
      setAiraLimitCountdown((prev) => decrementCountdown(prev));
    }, 1000);
    return () => clearInterval(id);
  }, [airaLimitReachedVisible]);

  const applyAiSuggestionsResponse = useCallback(
    (
      res: Awaited<ReturnType<typeof getAiSuggestionsApi>>,
      opts?: { closeConfirmSheet?: boolean }
    ) => {
      const list =
        res?.data?.suggestions ??
        (res?.data as { data?: { suggestions?: string[] } } | undefined)?.data?.suggestions ??
        res?.suggestions;
      const meta = res?.data as
        | {
            limitLeft?: number | null;
            totalMessageLimit?: number | null;
            timeLeft?: string | null;
          }
        | undefined;
      const limitLeft = meta?.limitLeft ?? null;
      const totalLimit = meta?.totalMessageLimit ?? null;
      const hasSuggestions = Array.isArray(list) && list.length > 0;
      const isLimitReached = limitLeft != null && limitLeft <= 0;

      setAiraSuggestionsLimitLeft(limitLeft);
      setAiraSuggestionsTotalLimit(totalLimit);

      if (hasSuggestions) {
        setGeneratedReplies(list);
        setSelectedReplyIndex(0);
        setAiraLimitReachedVisible(false);
        if (opts?.closeConfirmSheet) setAskAiraConfirmVisible(false);
        return;
      }

      if (isLimitReached) {
        const countdownFromApi =
          parseAiraTimeLeft(meta?.timeLeft ?? null) ?? getTimeUntilMidnight();
        setAiraLimitCountdown(countdownFromApi);
        setGeneratedReplies(null);
        setAskAiraConfirmVisible(false);
        setAiraLimitReachedVisible(true);
        return;
      }
      setGeneratedReplies(null);
    },
    []
  );

  const requestAiSuggestions = useCallback(
    (opts?: { closeConfirmSheetOnStart?: boolean }) => {
      if (!chatId) return;
      const requestId = ++aiSuggestionsRequestIdRef.current;
      setAskAiraConfirmLoading(true);
      setAskAiraGenerating(true);
      if (opts?.closeConfirmSheetOnStart) {
        setAskAiraConfirmVisible(false);
      }
      getAiSuggestionsApi(chatId)
        .then((res) => {
          if (requestId !== aiSuggestionsRequestIdRef.current) return;
          applyAiSuggestionsResponse(res, { closeConfirmSheet: true });
        })
        .catch((err) => {
          if (requestId !== aiSuggestionsRequestIdRef.current) return;
          if (isAiraLimitError(err)) {
            setAskAiraConfirmVisible(false);
            setAiraLimitCountdown(getTimeUntilMidnight());
            setAiraLimitReachedVisible(true);
          }
        })
        .finally(() => {
          if (requestId !== aiSuggestionsRequestIdRef.current) return;
          setAskAiraConfirmLoading(false);
          setAskAiraGenerating(false);
        });
    },
    [applyAiSuggestionsResponse, chatId]
  );

  const handleCancelAiSuggestions = useCallback(() => {
    aiSuggestionsRequestIdRef.current += 1;
    setAskAiraGenerating(false);
    setAskAiraConfirmLoading(false);
  }, []);

  const handleInsertReply = useCallback(() => {
    if (!generatedReplies?.length || selectedReplyIndex >= generatedReplies.length) return;
    setInputText(generatedReplies[selectedReplyIndex]);
    setGeneratedReplies(null);
    setSelectedReplyIndex(0);
  }, [generatedReplies, selectedReplyIndex, setInputText]);

  return {
    askAiraGenerating,
    generatedReplies,
    askAiraConfirmVisible,
    setAskAiraConfirmVisible,
    dontShowAskAiraAgain,
    setDontShowAskAiraAgain,
    dontShowAskAiraPersisted,
    askAiraConfirmLoading,
    airaLimitReachedVisible,
    setAiraLimitReachedVisible,
    airaLimitCountdown,
    airaSuggestionsLimitLeft,
    airaSuggestionsTotalLimit,
    selectedReplyIndex,
    setSelectedReplyIndex,
    setDontShowAskAiraPersisted,
    setGeneratedReplies,
    requestAiSuggestions,
    handleCancelAiSuggestions,
    handleInsertReply,
  };
}

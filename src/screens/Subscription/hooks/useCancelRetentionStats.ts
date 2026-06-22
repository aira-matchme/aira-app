import { useEffect, useState } from 'react';

import { getAiSuggestionsApi, getChatListApi } from '../../../modules/chat/api';

export type CancelRetentionStats = {
  activeMatches: number;
  unusedAiSuggestions: number;
  isLoading: boolean;
};

/**
 * Loads counts shown on the cancel-retention sheet.
 * Active matches come from the chat list total; unused AI suggestions use the
 * first chat's remaining suggestion quota when available (best-effort until a
 * dedicated endpoint exists).
 */
export function useCancelRetentionStats(enabled: boolean): CancelRetentionStats {
  const [activeMatches, setActiveMatches] = useState(0);
  const [unusedAiSuggestions, setUnusedAiSuggestions] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    const load = async () => {
      setIsLoading(true);

      try {
        const chatRes = await getChatListApi({ page: 1, limit: 1 });
        if (cancelled) return;

        const total =
          chatRes?.data?.meta?.total ?? chatRes?.data?.list?.length ?? 0;
        setActiveMatches(total);

        const firstChatId = chatRes?.data?.list?.[0]?._id;
        if (!firstChatId) {
          setUnusedAiSuggestions(0);
          return;
        }

        try {
          const suggestionsRes = await getAiSuggestionsApi(firstChatId);
          if (cancelled) return;

          const limitLeft = suggestionsRes?.data?.limitLeft;
          setUnusedAiSuggestions(
            typeof limitLeft === 'number' ? Math.max(0, limitLeft) : 0,
          );
        } catch {
          if (!cancelled) setUnusedAiSuggestions(0);
        }
      } catch {
        if (!cancelled) {
          setActiveMatches(0);
          setUnusedAiSuggestions(0);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return { activeMatches, unusedAiSuggestions, isLoading };
}

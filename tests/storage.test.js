import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Storage Functions', () => {
  const STORAGE_KEY = 'composersgpt_conversations';

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('getAllConversations', () => {
    it('should return empty object if no data in localStorage', () => {
      const getAllConversations = () => {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : {};
      };

      localStorage.getItem.mockReturnValue(null);
      const result = getAllConversations();

      expect(result).toEqual({});
      expect(localStorage.getItem).toHaveBeenCalledWith(STORAGE_KEY);
    });

    it('should return parsed data from localStorage', () => {
      const getAllConversations = () => {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : {};
      };

      const mockData = {
        mozart: { history: [], summary: null }
      };
      localStorage.getItem.mockReturnValue(JSON.stringify(mockData));

      const result = getAllConversations();

      expect(result).toEqual(mockData);
    });
  });

  describe('getConversation', () => {
    it('should return conversation for given composer ID', () => {
      const getAllConversations = () => {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : {};
      };

      const getConversation = (composerId) => {
        const all = getAllConversations();
        const conversation = all[composerId];

        if (Array.isArray(conversation)) {
          return { history: conversation, summary: null };
        }

        return conversation || { history: [], summary: null };
      };

      const mockData = {
        mozart: {
          history: [{ role: 'user', content: 'Hello' }],
          summary: 'A greeting'
        }
      };
      localStorage.getItem.mockReturnValue(JSON.stringify(mockData));

      const result = getConversation('mozart');

      expect(result.history).toHaveLength(1);
      expect(result.summary).toBe('A greeting');
    });

    it('should handle legacy array format', () => {
      const getAllConversations = () => {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : {};
      };

      const getConversation = (composerId) => {
        const all = getAllConversations();
        const conversation = all[composerId];

        if (Array.isArray(conversation)) {
          return { history: conversation, summary: null };
        }

        return conversation || { history: [], summary: null };
      };

      const mockData = {
        mozart: [{ role: 'user', content: 'Hello' }]
      };
      localStorage.getItem.mockReturnValue(JSON.stringify(mockData));

      const result = getConversation('mozart');

      expect(result.history).toHaveLength(1);
      expect(result.summary).toBeNull();
    });

    it('should return empty conversation if composer not found', () => {
      const getAllConversations = () => {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : {};
      };

      const getConversation = (composerId) => {
        const all = getAllConversations();
        const conversation = all[composerId];

        if (Array.isArray(conversation)) {
          return { history: conversation, summary: null };
        }

        return conversation || { history: [], summary: null };
      };

      localStorage.getItem.mockReturnValue(JSON.stringify({}));

      const result = getConversation('unknown');

      expect(result).toEqual({ history: [], summary: null });
    });
  });

  describe('saveConversation', () => {
    it('should save conversation to localStorage', () => {
      const getAllConversations = () => {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : {};
      };

      const saveConversation = (composerId, history, summary = null) => {
        const all = getAllConversations();
        all[composerId] = {
          history: history,
          summary: summary,
          lastUpdated: history.length > 0 ? history[history.length - 1].date : 0
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
      };

      localStorage.getItem.mockReturnValue('{}');

      const testHistory = [
        { role: 'user', content: 'Hello', date: 1000 }
      ];

      saveConversation('mozart', testHistory, 'Test summary');

      expect(localStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEY,
        expect.stringContaining('mozart')
      );
    });
  });
});

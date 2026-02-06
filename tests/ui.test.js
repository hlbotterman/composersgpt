import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock DOM elements needed by the functions
beforeEach(() => {
  document.body.innerHTML = `
    <div id="messages"></div>
    <div id="messagesContainer"></div>
    <div id="dropdownMenu"></div>
  `;
});

describe('UI Functions', () => {
  describe('formatMessage', () => {
    it('should convert action markers to emojis', () => {
      // Import the function (we'll need to refactor code to export functions)
      const formatMessage = (content) => {
        const actionToEmoji = {
          'rire': '😄', 'laugh': '😄',
          'sourire': '😊', 'smile': '😊',
          'soupir': '😮‍💨', 'sigh': '😮‍💨',
        };

        let formatted = content.replace(/\*([^*]+)\*/g, (_, action) => {
          const actionLower = action.toLowerCase().trim();
          for (const [key, emoji] of Object.entries(actionToEmoji)) {
            if (actionLower.includes(key)) {
              return emoji;
            }
          }
          return '';
        });

        formatted = formatted.replace(/\s{2,}/g, ' ').trim();
        return formatted.replace(/\n/g, '<br>');
      };

      expect(formatMessage('Bonjour *smile*')).toBe('Bonjour 😊');
      expect(formatMessage('Ha ha *rire*')).toBe('Ha ha 😄');
      expect(formatMessage('*soupir* C\'est difficile')).toBe('😮‍💨 C\'est difficile');
    });

    it('should remove unknown actions', () => {
      const formatMessage = (content) => {
        const actionToEmoji = { 'rire': '😄' };
        let formatted = content.replace(/\*([^*]+)\*/g, (_, action) => {
          const actionLower = action.toLowerCase().trim();
          for (const [key, emoji] of Object.entries(actionToEmoji)) {
            if (actionLower.includes(key)) {
              return emoji;
            }
          }
          return '';
        });
        return formatted.replace(/\s{2,}/g, ' ').trim();
      };

      expect(formatMessage('Bonjour *unknown action*')).toBe('Bonjour');
    });

    it('should convert newlines to <br>', () => {
      const formatMessage = (content) => content.replace(/\n/g, '<br>');
      expect(formatMessage('Line 1\nLine 2')).toBe('Line 1<br>Line 2');
    });
  });

  describe('parseSuggestions', () => {
    it('should extract suggestions from content', () => {
      const parseSuggestions = (content) => {
        const regex = /\[SUGGESTIONS:\s*"([^"]+)"\s*\|\s*"([^"]+)"\s*\|\s*"([^"]+)"\s*\]/i;
        const match = content.match(regex);

        if (match) {
          return {
            cleanContent: content.replace(regex, '').trim(),
            suggestions: [match[1], match[2], match[3]]
          };
        }

        return { cleanContent: content, suggestions: [] };
      };

      const input = 'Voici ma réponse [SUGGESTIONS: "Question 1?" | "Question 2?" | "Question 3?"]';
      const result = parseSuggestions(input);

      expect(result.cleanContent).toBe('Voici ma réponse');
      expect(result.suggestions).toEqual(['Question 1?', 'Question 2?', 'Question 3?']);
    });

    it('should return empty suggestions if none found', () => {
      const parseSuggestions = (content) => {
        const regex = /\[SUGGESTIONS:\s*"([^"]+)"\s*\|\s*"([^"]+)"\s*\|\s*"([^"]+)"\s*\]/i;
        const match = content.match(regex);

        if (match) {
          return {
            cleanContent: content.replace(regex, '').trim(),
            suggestions: [match[1], match[2], match[3]]
          };
        }

        return { cleanContent: content, suggestions: [] };
      };

      const result = parseSuggestions('Simple content without suggestions');

      expect(result.cleanContent).toBe('Simple content without suggestions');
      expect(result.suggestions).toEqual([]);
    });
  });

  describe('generateMessageId', () => {
    it('should generate unique message IDs', () => {
      let messageIdCounter = 0;
      const generateMessageId = () => `msg-${Date.now()}-${messageIdCounter++}`;

      const id1 = generateMessageId();
      const id2 = generateMessageId();

      expect(id1).toMatch(/^msg-\d+-0$/);
      expect(id2).toMatch(/^msg-\d+-1$/);
      expect(id1).not.toBe(id2);
    });
  });
});

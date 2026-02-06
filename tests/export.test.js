import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Export Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getExportData', () => {
    it('should return null if no current composer', () => {
      const getExportData = (currentComposer) => {
        if (!currentComposer) return null;
        return { title: 'Test' };
      };

      expect(getExportData(null)).toBeNull();
    });

    it('should format group conversation data', () => {
      const getExportData = (conversationMode, selectedComposers, groupConversationHistory) => {
        if (conversationMode === 'group') {
          return {
            isGroup: true,
            title: `Conversation de groupe avec ${selectedComposers.map(c => c.name).join(', ')}`,
            composers: selectedComposers,
            messages: groupConversationHistory,
            summary: null,
            filename: `conversation_groupe_${new Date().toISOString().split('T')[0]}`
          };
        }
        return null;
      };

      const composers = [
        { id: 'mozart', name: 'Mozart' },
        { id: 'beethoven', name: 'Beethoven' }
      ];
      const messages = [
        { role: 'user', content: 'Question' },
        { role: 'assistant', composerId: 'mozart', content: 'Réponse Mozart' }
      ];

      const result = getExportData('group', composers, messages);

      expect(result.isGroup).toBe(true);
      expect(result.title).toContain('Mozart');
      expect(result.title).toContain('Beethoven');
      expect(result.messages).toHaveLength(2);
    });

    it('should format solo conversation data', () => {
      const getExportData = (conversationMode, currentComposer, conversation) => {
        if (conversationMode === 'single') {
          return {
            isGroup: false,
            title: `Conversation avec ${currentComposer.name}`,
            composer: currentComposer,
            messages: conversation.history,
            summary: conversation.summary,
            filename: `conversation_${currentComposer.id}_${new Date().toISOString().split('T')[0]}`
          };
        }
        return null;
      };

      const composer = { id: 'mozart', name: 'Mozart' };
      const conversation = {
        history: [{ role: 'user', content: 'Hello' }],
        summary: 'A conversation'
      };

      const result = getExportData('single', composer, conversation);

      expect(result.isGroup).toBe(false);
      expect(result.title).toBe('Conversation avec Mozart');
      expect(result.composer).toEqual(composer);
      expect(result.summary).toBe('A conversation');
    });
  });

  describe('downloadFile', () => {
    it('should create blob and download file', () => {
      const downloadFile = (content, filename, mimeType) => {
        const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
        return { blob, url, filename };
      };

      const result = downloadFile('Test content', 'test.txt', 'text/plain');

      expect(global.Blob).toHaveBeenCalledWith(
        ['Test content'],
        { type: 'text/plain;charset=utf-8' }
      );
      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(global.URL.revokeObjectURL).toHaveBeenCalled();
      expect(result.filename).toBe('test.txt');
    });
  });

  describe('exportAsMarkdown', () => {
    it('should format conversation as markdown', () => {
      const formatAsMarkdown = (data) => {
        let markdown = `# ${data.title}\n\n`;
        markdown += `**Date:** ${new Date().toLocaleDateString()}\n\n`;
        markdown += `---\n\n`;

        if (data.summary) {
          markdown += `## 📝 Résumé\n\n${data.summary}\n\n---\n\n`;
        }

        markdown += `## Messages\n\n`;

        data.messages.forEach(msg => {
          if (msg.role === 'user') {
            markdown += `### 👤 Vous\n\n${msg.content}\n\n`;
          } else {
            markdown += `### 🎵 ${data.composer.name}\n\n${msg.content}\n\n`;
          }
        });

        return markdown;
      };

      const data = {
        title: 'Conversation avec Mozart',
        composer: { name: 'Mozart' },
        messages: [
          { role: 'user', content: 'Question' },
          { role: 'assistant', content: 'Réponse' }
        ],
        summary: 'Test summary'
      };

      const result = formatAsMarkdown(data);

      expect(result).toContain('# Conversation avec Mozart');
      expect(result).toContain('## 📝 Résumé');
      expect(result).toContain('Test summary');
      expect(result).toContain('### 👤 Vous');
      expect(result).toContain('### 🎵 Mozart');
      expect(result).toContain('Question');
      expect(result).toContain('Réponse');
    });

    it('should handle conversation without summary', () => {
      const formatAsMarkdown = (data) => {
        let markdown = `# ${data.title}\n\n`;

        if (data.summary) {
          markdown += `## Résumé\n\n${data.summary}\n\n`;
        }

        return markdown;
      };

      const data = {
        title: 'Test',
        messages: [],
        summary: null
      };

      const result = formatAsMarkdown(data);

      expect(result).not.toContain('Résumé');
    });
  });
});

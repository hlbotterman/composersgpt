// ============================================
// CompositeursGPT — State Variables
// ============================================

// DOM Elements
// New Chat references
let newChatBtn, modalOverlay, newChatModal, closeNewChat, newChatSearchInput, frequentList, modalComposerList;

const sidebar = document.getElementById('sidebar');
const composerList = document.getElementById('composerList');
const chatPanel = document.getElementById('chatPanel');
const emptyState = document.getElementById('emptyState');
const chatSection = document.getElementById('chatSection');
const messagesContainer = document.getElementById('messagesContainer');
const messages = document.getElementById('messages');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const backBtn = document.getElementById('backBtn');
const currentAvatar = document.getElementById('currentAvatar');
const currentName = document.getElementById('currentName');
const currentDates = document.getElementById('currentDates');
const summaryToggle = document.getElementById('summaryToggle');
const summaryPanel = document.getElementById('summaryPanel');
const summaryContent = document.getElementById('summaryContent');
const summaryClose = document.getElementById('summaryClose');
const menuBtn = document.getElementById('menuBtn');
const dropdownMenu = document.getElementById('dropdownMenu');
const exportConversationBtn = document.getElementById('exportConversationBtn');
const clearConversationBtn = document.getElementById('clearConversationBtn');
const currentComposerHeader = document.getElementById('currentComposerHeader');
const profileModal = document.getElementById('profileModal');
const profileOverlay = document.getElementById('profileOverlay');
const profileClose = document.getElementById('profileClose');
const profileAvatar = document.getElementById('profileAvatar');
const profileName = document.getElementById('profileName');
const profileDates = document.getElementById('profileDates');
const profileTags = document.getElementById('profileTags');
const profileDescription = document.getElementById('profileDescription');

// State
let currentComposer = null;
let conversationHistory = [];
let isLoading = false;
let mediaRecorder = null;
let audioChunks = [];
let isRecording = false;

// File Upload State
let attachedFile = null; // { name, content, type }

// Thread/Reply state
let replyToMessage = null; // { id, content, role } - message being replied to
let messageIdCounter = 0;

// Group conversation state
let conversationMode = 'single'; // 'single' | 'group'
let selectedComposers = []; // max 3 composers for group mode
let groupConversationHistory = [];
const MAX_GROUP_COMPOSERS = 3;
const GROUP_STORAGE_KEY = 'composersgpt_group_conversations';

// ============================================
// API Configuration
// ============================================
const MODEL = 'llama-3.3-70b-versatile';
const STORAGE_KEY = 'composersgpt_conversations';

// Support Chat Configuration
export const SUPPORT_CONFIG = {
    // Branding
    websiteName: 'SprintSaaS',
    websiteLogo: null,

    // Admin Info
    adminName: 'Abubakar',
    adminTitle: 'Founder',
    adminAvatar: null, // Optional: '/admin-avatar.png'

    // Messages
    welcomeMessage: '👋 Hi there! How can we help you today?',
    resolvedMessage: 'This conversation has been marked as resolved. If you have any other questions or concerns, don\'t hesitate to reach out again. We\'re here to help!',
};

// Preset Quick Questions
export const PRESET_QUESTIONS = [
    {
        id: 'pricing',
        text: 'What are your pricing plans?',
        icon: '💰',
    },
    {
        id: 'features',
        text: 'What features do you offer?',
        icon: '✨',
    },
    {
        id: 'demo',
        text: 'Can I see a demo?',
        icon: '🎬',
    },
    {
        id: 'support',
        text: 'How does customer support work?',
        icon: '🛟',
    },
    {
        id: 'technical',
        text: 'I have a technical question',
        icon: '⚙️',
    },
    {
        id: 'custom',
        text: 'I have a different question',
        icon: '💬',
    },
];

// Feedback Categories
export const FEEDBACK_CATEGORIES = [
    { value: 'website', label: 'Website Quality' },
    { value: 'service', label: 'Customer Service' },
    { value: 'response', label: 'Response Time' },
    { value: 'solution', label: 'Problem Resolution' },
    { value: 'overall', label: 'Overall Experience' },
];

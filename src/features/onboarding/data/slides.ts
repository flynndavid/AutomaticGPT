export interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export const defaultSlides: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Welcome to Automatic ExpoGPT',
    description: 'Your intelligent assistant powered by advanced AI technology',
    icon: '🚀',
  },
  {
    id: '2',
    title: 'Natural Conversations',
    description: 'Chat naturally and get intelligent responses tailored to your needs',
    icon: '💬',
  },
  {
    id: '3',
    title: 'Ready to Begin',
    description: 'Sign in to start your journey with AI-powered assistance',
    icon: '✨',
  },
];

export interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  image?: any; // Image source
  backgroundColor?: string;
}

export const defaultSlides: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Welcome to MyApp',
    description: 'Your AI-powered assistant for everything',
    backgroundColor: '#3b82f6',
  },
  {
    id: '2',
    title: 'Smart Conversations',
    description: 'Chat naturally with advanced AI technology',
    backgroundColor: '#8b5cf6',
  },
  {
    id: '3',
    title: 'Get Started',
    description: 'Sign up or log in to begin your journey',
    backgroundColor: '#10b981',
  },
];
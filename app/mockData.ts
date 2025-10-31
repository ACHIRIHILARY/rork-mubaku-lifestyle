export interface Agent {
  id: string;
  name: string;
  service: string;
  rating: number;
  price: number;
  image: string;
  experience: string;
  description: string;
  specialty: string[];
}

export interface Service {
  id: string;
  name: string;
  description: string;
  agentId: string;
  duration: number;
  price: number;
}

export interface Notification {
  id: string;
  type: 'booking' | 'payment' | 'system';
  message: string;
  date: string;
  read: boolean;
}

export const mockAgents: Agent[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    service: 'Hair Styling',
    rating: 4.8,
    price: 75,
    image: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400&h=400&fit=crop&crop=face',
    experience: '5 years',
    description: 'Professional hair stylist specializing in modern cuts and color treatments. I love creating unique looks that enhance your natural beauty.',
    specialty: ['Hair Cutting', 'Hair Coloring', 'Styling']
  },
  {
    id: '2',
    name: 'Maria Rodriguez',
    service: 'Nail Art',
    rating: 4.9,
    price: 45,
    image: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&h=400&fit=crop&crop=face',
    experience: '3 years',
    description: 'Creative nail artist with expertise in intricate designs and gel manicures. Your nails will be a work of art!',
    specialty: ['Nail Art', 'Gel Manicure', 'Pedicure']
  },
  {
    id: '3',
    name: 'Ashley Chen',
    service: 'Makeup',
    rating: 4.7,
    price: 85,
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop&crop=face',
    experience: '4 years',
    description: 'Professional makeup artist for special events, photoshoots, and everyday glam. I specialize in natural and dramatic looks.',
    specialty: ['Bridal Makeup', 'Event Makeup', 'Photoshoot']
  },
  {
    id: '4',
    name: 'Jennifer Williams',
    service: 'Hair Styling',
    rating: 4.6,
    price: 65,
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
    experience: '6 years',
    description: 'Experienced hair stylist with a passion for creating beautiful, healthy hair. Specializing in cuts, colors, and treatments.',
    specialty: ['Hair Cutting', 'Hair Treatment', 'Styling']
  }
];

export const mockServices: Service[] = [
  {
    id: '1',
    name: 'Haircut & Style',
    description: 'Professional haircut with styling',
    agentId: '1',
    duration: 90,
    price: 75
  },
  {
    id: '2',
    name: 'Gel Manicure',
    description: 'Long-lasting gel manicure with nail art',
    agentId: '2',
    duration: 60,
    price: 45
  },
  {
    id: '3',
    name: 'Bridal Makeup',
    description: 'Complete bridal makeup package',
    agentId: '3',
    duration: 120,
    price: 85
  }
];

export const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'booking',
    message: 'Your appointment with Sarah Johnson is confirmed for tomorrow at 2:00 PM',
    date: '2024-01-15T10:30:00Z',
    read: false
  },
  {
    id: '2',
    type: 'payment',
    message: 'Payment of $75 processed successfully',
    date: '2024-01-14T15:45:00Z',
    read: true
  },
  {
    id: '3',
    type: 'system',
    message: 'Welcome to Mubaku Lifestyle! Complete your profile to get started.',
    date: '2024-01-13T09:00:00Z',
    read: true
  }
];

export const categories = [
  {
    id: '1',
    name: 'Hair',
    icon: '✂️',
    color: 'bg-purple'
  },
  {
    id: '2',
    name: 'Nails',
    icon: '💅',
    color: 'bg-peach'
  },
  {
    id: '3',
    name: 'Makeup',
    icon: '💄',
    color: 'bg-purple-light'
  }
];

export default function MockDataPlaceholder() {
  return null;
}
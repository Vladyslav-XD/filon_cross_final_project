export interface Recipe {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  isFavorite: boolean;
  ingredients?: string[];
  instructions?: string;
  duration?: string;
  category?: string;
}

export const MOCK_SAVED_RECIPES: Recipe[] = [
  {
    id: '1',
    title: 'Virgin Mojito',
    subtitle: 'Refreshing Mint & Lime',
    imageUrl: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?q=80&w=600&auto=format&fit=crop',
    isFavorite: true,
    ingredients: ['Mint leaves', 'Lime juice', 'Sugar syrup', 'Soda water', 'Ice'],
    instructions: 'Muddle mint and lime juice. Add sugar syrup and ice. Top with soda water.',
    duration: '5 min',
  },
  {
    id: '2',
    title: 'Orange Sunshine',
    subtitle: 'Bright Citrus Blend',
    imageUrl: 'https://images.unsplash.com/photo-1600271886742-f049cd451b66?q=80&w=600&auto=format&fit=crop',
    isFavorite: false,
    ingredients: ['Orange juice', 'Lemon juice', 'Grenadine', 'Ice'],
    instructions: 'Mix orange and lemon juice. Pour over ice. Slowly add grenadine.',
    duration: '3 min',
  },
  {
    id: '3',
    title: 'Tropical Sunrise',
    subtitle: 'Mango & Passion Fruit',
    imageUrl: 'https://images.unsplash.com/photo-1600271886742-f049cd451b66?q=80&w=600&auto=format&fit=crop',
    isFavorite: true,
    ingredients: ['Mango puree', 'Passion fruit juice', 'Soda water', 'Ice'],
    instructions: 'Mix puree and juice. Serve over ice and top with soda water.',
    duration: '4 min',
  },
];

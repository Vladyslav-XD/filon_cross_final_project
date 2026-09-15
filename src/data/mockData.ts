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

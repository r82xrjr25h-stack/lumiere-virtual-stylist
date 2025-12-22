
export enum OutfitOccasion {
  CASUAL = 'Casual',
  BUSINESS = 'Business',
  NIGHT_OUT = 'Night Out'
}

export interface Outfit {
  id: string;
  occasion: OutfitOccasion;
  imageUrl: string;
  description: string;
}

export interface StylistState {
  originalImage: string | null;
  outfits: Outfit[];
  isGenerating: boolean;
  error: string | null;
}

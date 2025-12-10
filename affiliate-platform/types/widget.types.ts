export interface Quiz {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  imageUrl: string;
  questionCount: number;
  categoryId: string;
  categoryName: string;
  subcategoryId?: string;
  subcategoryName?: string;
  subcategoryLevelId?: string;
  subcategoryLevelName?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  createdAt: string;
  slug: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
}

export interface SubcategoryLevel {
  id: string;
  name: string;
  slug: string;
  subcategoryId: string;
}

export interface QuizFilters {
  categoryId?: string;
  subcategoryId?: string;
  subcategoryLevelId?: string;
  keyword?: string;
  limit?: number;
  offset?: number;
}

export interface QuizzesResponse {
  data: Quiz[];
  total: number;
  limit: number;
  offset: number;
}

export type WidgetLayout = 'single' | 'grid' | 'list';
export type WidgetSize = 'small' | 'medium' | 'large';

export interface WidgetTheme {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  buttonColor: string;
  buttonTextColor: string;
  borderRadius: number;
  fontSize: WidgetSize;
}

export interface WidgetConfig {
  id?: string;
  name: string;
  layout: WidgetLayout;
  selectedQuizIds: string[];
  theme: WidgetTheme;
  filters?: QuizFilters;
  createdAt?: string;
  updatedAt?: string;
}

export const DEFAULT_THEME: WidgetTheme = {
  primaryColor: '#3b82f6',
  secondaryColor: '#8b5cf6',
  backgroundColor: '#ffffff',
  textColor: '#1f2937',
  buttonColor: '#3b82f6',
  buttonTextColor: '#ffffff',
  borderRadius: 8,
  fontSize: 'medium',
};

export interface EmbedParams {
  quizIds?: string[];
  categoryId?: string;
  subcategoryId?: string;
  subcategoryLevelId?: string;
  layout?: WidgetLayout;
  theme?: string;
  limit?: number;
}

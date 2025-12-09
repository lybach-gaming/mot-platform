import {
  Category,
  Quiz,
  Subcategory,
  SubcategoryLevel,
} from '@/types/widget.types';

export const MOCK_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'History', slug: 'history' },
  { id: 'cat-2', name: 'Science', slug: 'science' },
  { id: 'cat-3', name: 'Geography', slug: 'geography' },
  { id: 'cat-4', name: 'Entertainment', slug: 'entertainment' },
  { id: 'cat-5', name: 'Sports', slug: 'sports' },
];

export const MOCK_SUBCATEGORIES: Subcategory[] = [
  {
    id: 'sub-1',
    name: 'World War II',
    slug: 'world-war-ii',
    categoryId: 'cat-1',
  },
  {
    id: 'sub-2',
    name: 'Ancient History',
    slug: 'ancient-history',
    categoryId: 'cat-1',
  },
  { id: 'sub-3', name: 'Physics', slug: 'physics', categoryId: 'cat-2' },
  { id: 'sub-4', name: 'Biology', slug: 'biology', categoryId: 'cat-2' },
  { id: 'sub-5', name: 'Countries', slug: 'countries', categoryId: 'cat-3' },
  { id: 'sub-6', name: 'Movies', slug: 'movies', categoryId: 'cat-4' },
  { id: 'sub-7', name: 'Football', slug: 'football', categoryId: 'cat-5' },
];

export const MOCK_LEVELS: SubcategoryLevel[] = [
  { id: 'lvl-1', name: 'Beginner', slug: 'beginner', subcategoryId: 'sub-1' },
  { id: 'lvl-2', name: 'Advanced', slug: 'advanced', subcategoryId: 'sub-1' },
  { id: 'lvl-3', name: 'Expert', slug: 'expert', subcategoryId: 'sub-3' },
];

export const MOCK_QUIZZES: Quiz[] = [
  {
    id: 'quiz-1',
    title: 'World War II: European Theater',
    description:
      'Test your knowledge about the major battles and events of WWII in Europe',
    shortDescription: 'Major battles and events of WWII in Europe',
    imageUrl:
      'https://images.unsplash.com/photo-1565106430482-8f6e74349ca1?w=800&h=600&fit=crop',
    questionCount: 15,
    categoryId: 'cat-1',
    categoryName: 'History',
    subcategoryId: 'sub-1',
    subcategoryName: 'World War II',
    subcategoryLevelId: 'lvl-1',
    subcategoryLevelName: 'Beginner',
    difficulty: 'medium',
    createdAt: '2025-01-15',
    slug: 'wwii-european-theater',
  },
  {
    id: 'quiz-2',
    title: 'Ancient Rome: Rise and Fall',
    description:
      'Explore the fascinating history of the Roman Empire from its founding to its decline',
    shortDescription: 'The Roman Empire history',
    imageUrl:
      'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&h=600&fit=crop',
    questionCount: 20,
    categoryId: 'cat-1',
    categoryName: 'History',
    subcategoryId: 'sub-2',
    subcategoryName: 'Ancient History',
    difficulty: 'hard',
    createdAt: '2025-01-14',
    slug: 'ancient-rome',
  },
  {
    id: 'quiz-3',
    title: 'Quantum Physics Basics',
    description:
      'Understanding the fundamentals of quantum mechanics and particle physics',
    shortDescription: 'Quantum mechanics fundamentals',
    imageUrl:
      'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=600&fit=crop',
    questionCount: 12,
    categoryId: 'cat-2',
    categoryName: 'Science',
    subcategoryId: 'sub-3',
    subcategoryName: 'Physics',
    subcategoryLevelId: 'lvl-3',
    subcategoryLevelName: 'Expert',
    difficulty: 'hard',
    createdAt: '2025-01-13',
    slug: 'quantum-physics-basics',
  },
  {
    id: 'quiz-4',
    title: 'Human Body Systems',
    description:
      'Learn about the major systems of the human body and how they work together',
    shortDescription: 'Major human body systems',
    imageUrl:
      'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=800&h=600&fit=crop',
    questionCount: 18,
    categoryId: 'cat-2',
    categoryName: 'Science',
    subcategoryId: 'sub-4',
    subcategoryName: 'Biology',
    difficulty: 'easy',
    createdAt: '2025-01-12',
    slug: 'human-body-systems',
  },
  {
    id: 'quiz-5',
    title: 'European Capitals',
    description: 'Can you name all the capital cities of European countries?',
    shortDescription: 'Capital cities of Europe',
    imageUrl:
      'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&h=600&fit=crop',
    questionCount: 25,
    categoryId: 'cat-3',
    categoryName: 'Geography',
    subcategoryId: 'sub-5',
    subcategoryName: 'Countries',
    difficulty: 'medium',
    createdAt: '2025-01-11',
    slug: 'european-capitals',
  },
  {
    id: 'quiz-6',
    title: 'Classic Hollywood Movies',
    description:
      'Test your knowledge of iconic films from the golden age of cinema',
    shortDescription: 'Golden age cinema trivia',
    imageUrl:
      'https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=800&h=600&fit=crop',
    questionCount: 16,
    categoryId: 'cat-4',
    categoryName: 'Entertainment',
    subcategoryId: 'sub-6',
    subcategoryName: 'Movies',
    difficulty: 'medium',
    createdAt: '2025-01-10',
    slug: 'classic-hollywood',
  },
  {
    id: 'quiz-7',
    title: 'FIFA World Cup History',
    description: 'How well do you know the history of the FIFA World Cup?',
    shortDescription: 'World Cup trivia',
    imageUrl:
      'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&h=600&fit=crop',
    questionCount: 22,
    categoryId: 'cat-5',
    categoryName: 'Sports',
    subcategoryId: 'sub-7',
    subcategoryName: 'Football',
    difficulty: 'medium',
    createdAt: '2025-01-09',
    slug: 'world-cup-history',
  },
  {
    id: 'quiz-8',
    title: 'The Viking Age',
    description:
      'Explore the history, culture, and conquests of the Norse Vikings',
    shortDescription: 'Norse Viking history',
    imageUrl:
      'https://images.unsplash.com/photo-1604928378730-fef1f9e5b137?w=800&h=600&fit=crop',
    questionCount: 14,
    categoryId: 'cat-1',
    categoryName: 'History',
    subcategoryId: 'sub-2',
    subcategoryName: 'Ancient History',
    difficulty: 'medium',
    createdAt: '2025-01-08',
    slug: 'viking-age',
  },
];

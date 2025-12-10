import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  WidgetConfig,
  WidgetTheme,
  DEFAULT_THEME,
  Quiz,
} from '@/types/widget.types';

interface WidgetStore {
  // Current widget being configured
  currentConfig: WidgetConfig;

  // Selected quizzes for preview
  selectedQuizzes: Quiz[];

  // Saved widget configurations
  savedConfigs: WidgetConfig[];

  // Actions
  setLayout: (layout: WidgetConfig['layout']) => void;
  setTheme: (theme: Partial<WidgetTheme>) => void;
  setSelectedQuizIds: (quizIds: string[]) => void;
  setSelectedQuizzes: (quizzes: Quiz[]) => void;
  toggleQuizSelection: (quizId: string, quiz: Quiz) => void;
  clearSelection: () => void;

  // Config management
  saveConfig: (name: string) => void;
  loadConfig: (configId: string) => void;
  deleteConfig: (configId: string) => void;
  resetConfig: () => void;
  updateConfigName: (name: string) => void;
}

const DEFAULT_CONFIG: WidgetConfig = {
  name: 'Untitled Widget',
  layout: 'grid',
  selectedQuizIds: [],
  theme: DEFAULT_THEME,
};

export const useWidgetStore = create<WidgetStore>()(
  persist(
    (set, get) => ({
      currentConfig: DEFAULT_CONFIG,
      selectedQuizzes: [],
      savedConfigs: [],

      setLayout: (layout) =>
        set((state) => ({
          currentConfig: {
            ...state.currentConfig,
            layout,
          },
        })),

      setTheme: (themeUpdates) =>
        set((state) => ({
          currentConfig: {
            ...state.currentConfig,
            theme: {
              ...state.currentConfig.theme,
              ...themeUpdates,
            },
          },
        })),

      setSelectedQuizIds: (quizIds) =>
        set((state) => {
          // Keep any already-loaded quizzes that match the new ids
          const existingQuizzes = state.selectedQuizzes.filter((q) =>
            quizIds.includes(q.id)
          );

          // Determine which ids are missing from the currently loaded quizzes
          const missingIds = quizIds.filter(
            (id) => !existingQuizzes.some((q) => q.id === id)
          );

          // Create lightweight placeholder quiz objects for missing ids so
          // selectedQuizzes and currentConfig.selectedQuizIds remain consistent.
          // Optionally, you can trigger an async loader after this set to
          // fetch real quiz data and replace placeholders.
          const placeholders = missingIds.map<Quiz>((id) => ({
            id,
            title: 'Loading...',
            description: '',
            shortDescription: '',
            imageUrl: '',
            questionCount: 0,
            categoryId: '',
            categoryName: '',
            createdAt: new Date().toISOString(),
            slug: id,
          }));

          const newSelectedQuizzes = [...existingQuizzes, ...placeholders];

          return {
            currentConfig: {
              ...state.currentConfig,
              selectedQuizIds: quizIds,
            },
            selectedQuizzes: newSelectedQuizzes,
          };
        }),

      /**
       * Atomic setter: sets the full Quiz objects and derives selectedQuizIds
       * from them so `currentConfig.selectedQuizIds` and `selectedQuizzes`
       * remain consistent. Prefer this over calling the two setters
       * independently.
       */
      setSelectedQuizzes: (quizzes) =>
        set((state) => ({
          selectedQuizzes: quizzes,
          currentConfig: {
            ...state.currentConfig,
            selectedQuizIds: quizzes.map((q) => q.id),
          },
        })),

      toggleQuizSelection: (quizId, quiz) =>
        set((state) => {
          const isSelected =
            state.currentConfig.selectedQuizIds.includes(quizId);
          const isSingleLayout = state.currentConfig.layout === 'single';

          let newSelectedIds: string[];
          let newSelectedQuizzes: Quiz[];

          if (isSingleLayout) {
            // Single layout: replace selection
            newSelectedIds = [quizId];
            newSelectedQuizzes = [quiz];
          } else {
            // Multiple layouts: toggle selection
            if (isSelected) {
              newSelectedIds = state.currentConfig.selectedQuizIds.filter(
                (id) => id !== quizId
              );
              newSelectedQuizzes = state.selectedQuizzes.filter(
                (q) => q.id !== quizId
              );
            } else {
              newSelectedIds = [...state.currentConfig.selectedQuizIds, quizId];
              newSelectedQuizzes = [...state.selectedQuizzes, quiz];
            }
          }

          return {
            currentConfig: {
              ...state.currentConfig,
              selectedQuizIds: newSelectedIds,
            },
            selectedQuizzes: newSelectedQuizzes,
          };
        }),

      clearSelection: () =>
        set((state) => ({
          currentConfig: {
            ...state.currentConfig,
            selectedQuizIds: [],
          },
          selectedQuizzes: [],
        })),

      saveConfig: (name) =>
        set((state) => {
          const newConfig: WidgetConfig = {
            ...state.currentConfig,
            id: `config-${Date.now()}`,
            name,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          return {
            savedConfigs: [...state.savedConfigs, newConfig],
            currentConfig: newConfig,
          };
        }),

      loadConfig: (configId) =>
        set((state) => {
          const config = state.savedConfigs.find((c) => c.id === configId);
          if (config) {
            return {
              currentConfig: config,
            };
          }
          return state;
        }),

      deleteConfig: (configId) =>
        set((state) => ({
          savedConfigs: state.savedConfigs.filter((c) => c.id !== configId),
        })),

      resetConfig: () =>
        set({
          currentConfig: DEFAULT_CONFIG,
          selectedQuizzes: [],
        }),

      updateConfigName: (name) =>
        set((state) => ({
          savedConfigs: state.currentConfig.id
            ? state.savedConfigs.map((c) =>
                c.id === state.currentConfig.id ? { ...c, name } : c
              )
            : state.savedConfigs,
          currentConfig: {
            ...state.currentConfig,
            name,
            updatedAt: new Date().toISOString(),
          },
        })),
    }),
    {
      name: 'widget-config-storage',
      partialize: (state) => ({
        savedConfigs: state.savedConfigs,
      }),
    }
  )
);

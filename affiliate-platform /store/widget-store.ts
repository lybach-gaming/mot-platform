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
        set((state) => ({
          currentConfig: {
            ...state.currentConfig,
            selectedQuizIds: quizIds,
          },
        })),

      setSelectedQuizzes: (quizzes) =>
        set({
          selectedQuizzes: quizzes,
        }),

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
          currentConfig: {
            ...state.currentConfig,
            name,
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

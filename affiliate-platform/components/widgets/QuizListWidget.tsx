import { Quiz, WidgetTheme, WidgetLayout } from '@/types/widget.types';
import QuizCard from './QuizCard';

interface QuizListWidgetProps {
  quizzes: Quiz[];
  theme?: WidgetTheme;
  layout: WidgetLayout;
  onTakeQuiz?: (quizId: string) => void;
}

export default function QuizListWidget({
  quizzes,
  theme,
  layout,
  onTakeQuiz,
}: QuizListWidgetProps) {
  if (quizzes.length === 0) {
    return (
      <div className="flex justify-center items-center p-4 text-muted-foreground">
        No quizzes available
      </div>
    );
  }

  const layoutClass =
    layout === 'grid'
      ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
      : 'flex flex-col gap-4';

  return (
    <div className="p-4 bg-muted/30 rounded-lg">
      <div className={layoutClass}>
        {quizzes.map((quiz) => (
          <QuizCard
            key={quiz.id}
            quiz={quiz}
            theme={theme}
            size={theme?.fontSize || 'medium'}
            onTakeQuiz={onTakeQuiz}
          />
        ))}
      </div>
    </div>
  );
}

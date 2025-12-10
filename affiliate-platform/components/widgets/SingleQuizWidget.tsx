import { Quiz, WidgetTheme } from '@/types/widget.types';
import QuizCard from './QuizCard';

interface SingleQuizWidgetProps {
  quiz: Quiz;
  theme?: WidgetTheme;
  onTakeQuiz?: (quizId: string) => void;
}

export default function SingleQuizWidget({
  quiz,
  theme,
  onTakeQuiz,
}: SingleQuizWidgetProps) {
  return (
    <div className="flex justify-center items-center p-4">
      <QuizCard
        quiz={quiz}
        theme={theme}
        size={theme?.fontSize || 'medium'}
        onTakeQuiz={onTakeQuiz}
      />
    </div>
  );
}

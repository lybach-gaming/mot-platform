import { Quiz, WidgetTheme } from '@/types/widget.types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

interface QuizCardProps {
  quiz: Quiz;
  theme?: WidgetTheme;
  size?: 'small' | 'medium' | 'large';
  onTakeQuiz?: (quizId: string) => void;
}

const sizeClasses = {
  small: {
    card: 'max-w-xs',
    image: 'h-12 w-12',
    title: 'text-sm',
    description: 'text-xs',
    button: 'text-xs h-8',
  },
  medium: {
    card: 'max-w-sm',
    image: 'h-16 w-16',
    title: 'text-base',
    description: 'text-sm',
    button: 'text-sm h-9',
  },
  large: {
    card: 'max-w-md',
    image: 'h-20 w-20',
    title: 'text-lg',
    description: 'text-base',
    button: 'text-base h-10',
  },
};

export default function QuizCard({
  quiz,
  theme,
  size = 'medium',
  onTakeQuiz,
}: QuizCardProps) {
  const sizeClass = sizeClasses[size];

  const cardStyle = theme
    ? {
        backgroundColor: theme.backgroundColor,
        color: theme.textColor,
        borderRadius: `${theme.borderRadius}px`,
      }
    : {};

  const buttonStyle = theme
    ? {
        backgroundColor: theme.buttonColor,
        color: theme.buttonTextColor,
      }
    : {};

  const handleClick = () => {
    if (onTakeQuiz) {
      onTakeQuiz(quiz.id);
    } else {
      window.open(`/quiz/${quiz.slug}`, '_blank');
    }
  };

  return (
    <Card
      className={`overflow-hidden transition-all hover:shadow-lg ${sizeClass.card} rounded-xl border-border`}
      style={cardStyle}
    >
      <div className="relative flex justify-center pt-4">
        <Image
          src="/half-logo.png"
          alt="Quiz Logo"
          width={80}
          height={80}
          className={`object-contain rounded-full ${sizeClass.image}`}
        />
        <div className="absolute top-0 right-2">
          <Badge variant="secondary" className="font-semibold text-xs">
            {quiz.questionCount} questions
          </Badge>
        </div>
      </div>

      <CardHeader className="pb-3 text-center">
        <CardTitle className={`line-clamp-2 ${sizeClass.title}`}>
          {quiz.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="pb-3 text-center">
        <CardDescription
          className={`line-clamp-2 ${sizeClass.description}`}
          style={theme ? { color: theme.textColor, opacity: 0.7 } : {}}
        >
          {quiz.shortDescription}
        </CardDescription>
      </CardContent>

      <CardFooter className="justify-center">
        <Button
          onClick={handleClick}
          className={`w-full rounded-full ${sizeClass.button}`}
          style={buttonStyle}
        >
          Play the quiz
        </Button>
      </CardFooter>
    </Card>
  );
}

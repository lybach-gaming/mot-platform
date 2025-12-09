'use client';

import { useWidgetStore } from '@/store/widget-store';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import { DEFAULT_THEME, WidgetTheme } from '@/types/widget.types';
import QuizCard from '../QuizCard';

const SAMPLE_QUIZ = {
  id: 'preview-123',
  title: 'What Type of Thinker Are You?',
  description:
    'A fun quiz to discover your thinking style and cognitive preferences.',
  shortDescription: 'Discover your unique thinking style in just 2 minutes!',
  imageUrl: '/half-logo.png',
  questionCount: 12,
  categoryId: '1',
  categoryName: 'Personality',
  createdAt: new Date().toISOString(),
  slug: 'what-type-of-thinker-are-you',
};

export default function ThemeCustomizer() {
  const { currentConfig, setTheme, setLayout } = useWidgetStore();
  const theme = currentConfig.theme;

  const handleColorChange = (key: keyof WidgetTheme, value: string) => {
    setTheme({ [key]: value } as Partial<WidgetTheme>);
  };

  const handleResetTheme = () => {
    setTheme(DEFAULT_THEME);
  };

  const previewSize =
    theme.fontSize === 'large'
      ? 'large'
      : theme.fontSize === 'small'
      ? 'small'
      : 'medium';

  return (
    <div className="space-y-6">
      {/* Layout Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Widget Layout</CardTitle>
          <CardDescription>
            Choose how quizzes will be displayed
          </CardDescription>
        </CardHeader>
        <CardContent className="flex w-full gap-10">
          <div className="space-y-2">
            <Label htmlFor="layout">Layout Type</Label>
            <Select
              value={currentConfig.layout}
              onValueChange={(value) => setLayout(value as any)}
            >
              <SelectTrigger id="layout">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single Quiz</SelectItem>
                <SelectItem value="grid">Grid Layout</SelectItem>
                <SelectItem value="list">List Layout</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {currentConfig.layout === 'single'
                ? 'Display one quiz prominently with a detailed card'
                : currentConfig.layout === 'grid'
                ? 'Display multiple quizzes in a responsive grid'
                : 'Display multiple quizzes in a vertical list'}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="size">Widget Size</Label>
            <Select
              value={theme.fontSize}
              onValueChange={(value: any) => setTheme({ fontSize: value })}
            >
              <SelectTrigger id="size">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Adjust the overall size of quiz cards and text
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Color Scheme + Live Preview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Color Scheme</CardTitle>
              <CardDescription>
                Customize colors to match your brand
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleResetTheme}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
              {/* Primary Color */}
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Primary</Label>
                <div className="flex gap-1">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={theme.primaryColor}
                    onChange={(e) =>
                      handleColorChange('primaryColor', e.target.value)
                    }
                    className="w-12 h-10 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={theme.primaryColor}
                    onChange={(e) =>
                      handleColorChange('primaryColor', e.target.value)
                    }
                    className="flex-1 font-mono text-xs"
                  />
                </div>
              </div>

              {/* Secondary Color */}
              <div className="space-y-2">
                <Label htmlFor="secondaryColor">Secondary</Label>
                <div className="flex gap-1">
                  <Input
                    id="secondaryColor"
                    type="color"
                    value={theme.secondaryColor}
                    onChange={(e) =>
                      handleColorChange('secondaryColor', e.target.value)
                    }
                    className="w-12 h-10 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={theme.secondaryColor}
                    onChange={(e) =>
                      handleColorChange('secondaryColor', e.target.value)
                    }
                    className="flex-1 font-mono text-xs"
                  />
                </div>
              </div>

              {/* Background Color */}
              <div className="space-y-2">
                <Label htmlFor="backgroundColor">Background</Label>
                <div className="flex gap-1">
                  <Input
                    id="backgroundColor"
                    type="color"
                    value={theme.backgroundColor}
                    onChange={(e) =>
                      handleColorChange('backgroundColor', e.target.value)
                    }
                    className="w-12 h-10 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={theme.backgroundColor}
                    onChange={(e) =>
                      handleColorChange('backgroundColor', e.target.value)
                    }
                    className="flex-1 font-mono text-xs"
                  />
                </div>
              </div>

              {/* Text Color */}
              <div className="space-y-2">
                <Label htmlFor="textColor">Text</Label>
                <div className="flex gap-1">
                  <Input
                    id="textColor"
                    type="color"
                    value={theme.textColor}
                    onChange={(e) =>
                      handleColorChange('textColor', e.target.value)
                    }
                    className="w-12 h-10 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={theme.textColor}
                    onChange={(e) =>
                      handleColorChange('textColor', e.target.value)
                    }
                    className="flex-1 font-mono text-xs"
                  />
                </div>
              </div>

              {/* Button Color */}
              <div className="space-y-2">
                <Label htmlFor="buttonColor">Button BG</Label>
                <div className="flex gap-1">
                  <Input
                    id="buttonColor"
                    type="color"
                    value={theme.buttonColor}
                    onChange={(e) =>
                      handleColorChange('buttonColor', e.target.value)
                    }
                    className="w-12 h-10 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={theme.buttonColor}
                    onChange={(e) =>
                      handleColorChange('buttonColor', e.target.value)
                    }
                    className="flex-1 font-mono text-xs"
                  />
                </div>
              </div>

              {/* Button Text Color */}
              <div className="space-y-2">
                <Label htmlFor="buttonTextColor">Button Text</Label>
                <div className="flex gap-1">
                  <Input
                    id="buttonTextColor"
                    type="color"
                    value={theme.buttonTextColor}
                    onChange={(e) =>
                      handleColorChange('buttonTextColor', e.target.value)
                    }
                    className="w-12 h-10 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={theme.buttonTextColor}
                    onChange={(e) =>
                      handleColorChange('buttonTextColor', e.target.value)
                    }
                    className="flex-1 font-mono text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Live Preview */}
            <div className="flex flex-col items-center justify-center">
              <div className="text-sm font-medium text-muted-foreground mb-3">
                Live Preview
              </div>
              <div className="scale-75 lg:scale-90 origin-top">
                <QuizCard
                  quiz={SAMPLE_QUIZ}
                  theme={theme}
                  size={previewSize}
                  onTakeQuiz={() => {}}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

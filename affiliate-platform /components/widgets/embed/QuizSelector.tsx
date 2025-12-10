'use client';

import { useState, useEffect, useMemo } from 'react';
import { useWidgetStore } from '@/store/widget-store';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, X, Check } from 'lucide-react';
import Image from 'next/image';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

import {
  MOCK_CATEGORIES,
  MOCK_SUBCATEGORIES,
  MOCK_LEVELS,
  MOCK_QUIZZES,
} from '@/data/quizMockData';

export default function QuizSelector() {
  const {
    currentConfig,
    selectedQuizzes,
    toggleQuizSelection,
    clearSelection,
  } = useWidgetStore();

  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [keyword, setKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const quizzesPerPage = 15;
  const isSingleLayout = currentConfig.layout === 'single';

  const filteredSubcategories = useMemo(() => {
    if (!selectedCategory) return [];
    return MOCK_SUBCATEGORIES.filter(
      (sub) => sub.categoryId === selectedCategory
    );
  }, [selectedCategory]);

  const filteredLevels = useMemo(() => {
    if (!selectedSubcategory) return [];
    return MOCK_LEVELS.filter(
      (lvl) => lvl.subcategoryId === selectedSubcategory
    );
  }, [selectedSubcategory]);

  const filteredQuizzes = useMemo(() => {
    let result = [...MOCK_QUIZZES];

    if (selectedCategory)
      result = result.filter((q) => q.categoryId === selectedCategory);
    if (selectedSubcategory)
      result = result.filter((q) => q.subcategoryId === selectedSubcategory);
    if (selectedLevel)
      result = result.filter((q) => q.subcategoryLevelId === selectedLevel);

    if (keyword) {
      const searchTerm = keyword.toLowerCase();
      result = result.filter(
        (q) =>
          q.title.toLowerCase().includes(searchTerm) ||
          q.description.toLowerCase().includes(searchTerm) ||
          q.shortDescription.toLowerCase().includes(searchTerm)
      );
    }

    return result;
  }, [selectedCategory, selectedSubcategory, selectedLevel, keyword]);

  useEffect(() => {
    setSelectedSubcategory('');
    setSelectedLevel('');
  }, [selectedCategory]);

  useEffect(() => {
    setSelectedLevel('');
  }, [selectedSubcategory]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredQuizzes.length]);

  const handleClearFilters = () => {
    setSelectedCategory('');
    setSelectedSubcategory('');
    setSelectedLevel('');
    setKeyword('');
  };

  const handleQuizClick = (quizId: string) => {
    const quiz = MOCK_QUIZZES.find((q) => q.id === quizId);
    if (!quiz) {
      console.error(`Quiz with ID ${quizId} not found.`);
      return;
    }

    if (isSingleLayout) {
      if (currentConfig.selectedQuizIds.includes(quizId)) {
        clearSelection();
      } else {
        clearSelection();
        toggleQuizSelection(quizId, quiz);
      }
    } else {
      toggleQuizSelection(quizId, quiz);
    }
  };

  const isQuizSelected = (quizId: string) =>
    currentConfig.selectedQuizIds.includes(quizId);

  const totalPages = Math.ceil(filteredQuizzes.length / quizzesPerPage);
  const paginatedQuizzes = filteredQuizzes.slice(
    (currentPage - 1) * quizzesPerPage,
    currentPage * quizzesPerPage
  );

  return (
    <div className="space-y-6">
      {/* Filters Card */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter Quizzes</CardTitle>
          <CardDescription>
            {isSingleLayout
              ? 'Select one quiz to display in your widget'
              : 'Select multiple quizzes to display in your widget'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Keyword Search */}
          <div className="space-y-2">
            <Label htmlFor="keyword">Search by keyword</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="keyword"
                placeholder="Search quiz titles or descriptions..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Category */}
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={selectedCategory || 'all'}
                onValueChange={(value) =>
                  setSelectedCategory(value === 'all' ? '' : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {MOCK_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subcategory */}
            {selectedCategory && filteredSubcategories.length > 0 && (
              <div className="space-y-2">
                <Label>Subcategory</Label>
                <Select
                  value={selectedSubcategory || 'all'}
                  onValueChange={(value) =>
                    setSelectedSubcategory(value === 'all' ? '' : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All subcategories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All subcategories</SelectItem>
                    {filteredSubcategories.map((sub) => (
                      <SelectItem key={sub.id} value={sub.id}>
                        {sub.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Level */}
            {selectedSubcategory && filteredLevels.length > 0 && (
              <div className="space-y-2">
                <Label>Subcategory Level</Label>
                <Select
                  value={selectedLevel || 'all'}
                  onValueChange={(value) =>
                    setSelectedLevel(value === 'all' ? '' : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Subcategory-levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subcategory-levels</SelectItem>
                    {filteredLevels.map((lvl) => (
                      <SelectItem key={lvl.id} value={lvl.id}>
                        {lvl.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="w-full flex items-end justify-end">
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="w-auto"
            >
              <X className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quiz Results */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Available Quizzes</CardTitle>
              <CardDescription>
                {filteredQuizzes.length} quizzes found
                {selectedQuizzes.length > 0 &&
                  ` • ${selectedQuizzes.length} selected`}
              </CardDescription>
            </div>
            {selectedQuizzes.length > 0 && (
              <Button variant="outline" size="sm" onClick={clearSelection}>
                Deselect All ({selectedQuizzes.length})
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {filteredQuizzes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No quizzes found. Try adjusting your filters.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {paginatedQuizzes.map((quiz) => {
                  const selected = isQuizSelected(quiz.id);
                  return (
                    <div
                      key={quiz.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleQuizClick(quiz.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleQuizClick(quiz.id);
                        }
                      }}
                      className="cursor-pointer transition-all hover:scale-105"
                      aria-label={`${selected ? 'Deselect' : 'Select'} quiz: ${
                        quiz.title
                      }`}
                    >
                      <Card
                        className={`overflow-hidden rounded-lg transition-all hover:shadow-lg h-full flex flex-col border-2 ${
                          selected
                            ? ' shadow-lg ring-2 ring-accent ring-offset-2'
                            : 'border-border hover:border-accent/50'
                        }`}
                      >
                        <div className="relative flex justify-center pt-4 pb-2">
                          <Image
                            src="/half-logo.png"
                            alt="Quiz Logo"
                            width={80}
                            height={80}
                            className="object-contain h-16 w-16 drop-shadow"
                          />
                          <div className="absolute top-2 right-2">
                            <Badge variant="secondary" className="text-xs">
                              {quiz.questionCount} Qs
                            </Badge>
                          </div>
                          {selected && (
                            <div className="absolute top-2 left-2 bg-accent rounded-full p-1">
                              <Check className="h-4 w-4 text-primary-foreground" />
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col flex-1 px-4 pb-4">
                          <h4 className="font-semibold text-sm line-clamp-2 mb-2">
                            {quiz.title}
                          </h4>
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-grow">
                            {quiz.shortDescription}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="outline" className="text-xs">
                              {quiz.categoryName}
                            </Badge>
                            {quiz.subcategoryName && (
                              <Badge variant="outline" className="text-xs">
                                {quiz.subcategoryName}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </Card>
                    </div>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="mt-6">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage > 1)
                              setCurrentPage(currentPage - 1);
                          }}
                          aria-disabled={currentPage === 1}
                          className={
                            currentPage === 1
                              ? 'pointer-events-none opacity-50'
                              : ''
                          }
                        />
                      </PaginationItem>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <PaginationItem key={page}>
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                setCurrentPage(page);
                              }}
                              isActive={currentPage === page}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        )
                      )}

                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage < totalPages)
                              setCurrentPage(currentPage + 1);
                          }}
                          aria-disabled={currentPage === totalPages}
                          className={
                            currentPage === totalPages
                              ? 'pointer-events-none opacity-50'
                              : ''
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Selected Summary */}
      {selectedQuizzes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Selected Quizzes ({selectedQuizzes.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {selectedQuizzes.map((quiz) => (
                <Badge
                  key={quiz.id}
                  variant="secondary"
                  className="text-sm py-1.5 pr-1 pl-3"
                >
                  {quiz.title}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleQuizSelection(quiz.id, quiz);
                    }}
                    className="ml-2 hover:text-destructive transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

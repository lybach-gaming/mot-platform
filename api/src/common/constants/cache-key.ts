export enum CacheKey {
  // Common
  Setting = 'setting:',
  WebSetting = 'web_setting:',

  /* Dashboard */
  // [Admin]
  AdminDashboardCounts = 'admin:dashboard:counts',
  AdminDashboardUserStats = 'admin:dashboard:user_stats:', // + filterType (day, week, month)

  /* Category */
  // [Admin]
  AdminCategoryList = 'admin:category:list:',
  AdminCategoryDetail = 'admin:category:detail:',

  // [User]
  UserCategory = 'user:category:',
  UserCategoryList = 'user:category:list:', // User get list categories
  UserCategoryDetail = 'user:category:detail:',

  /* Subcategory */
  // [Admin]
  AdminSubcategoryList = 'admin:subcategory:list:',
  AdminSubcategoryDetail = 'admin:subcategory:detail:',

  // [User]
  UserSubcategory = 'user:subcategory:',
  UserSubcategoryList = 'user:subcategory:list:', // User get list subcategories in category
  UserSubcategoryDetail = 'user:subcategory:detail:',

  /* Subcategory Level */
  // [Admin]
  AdminSubcategoryLevelList = 'admin:subcategory_level:list:',
  AdminSubcategoryLevelDetail = 'admin:subcategory_level:detail:',

  // [User]
  UserSubcategoryLevel = 'user:subcategory_level:',
  UserSubcategoryLevelList = 'user:subcategory_level:list:', // User get list subcategory levels in subcategory
  UserSubcategoryLevelDetail = 'user:subcategory_level:detail:',

  /* Quiz */
  // [Admin]
  AdminQuizList = 'admin:quiz:list:',
  AdminQuizDetail = 'admin:quiz:detail:',

  // [User]
  UserQuiz = 'user:quiz:',
  UserQuizList = 'user:quiz:list:', // User get list quizzes in subcategory level
  UserQuizDetail = 'user:quiz:detail:',
  UserSearchQuizzes = 'user:quiz:search:', // User search quizzes
  UserMoreQuizzes = 'user:quiz:more_quizzes:', // User get more quizzes
  UserQuizRules = 'user:quiz:rules:', // User get Quiz rules
  UserPopularQuizzes = 'user:quiz:popular_quizzes:', // User get popular quizzes

  /* Question */
  // [Admin]
  AdminQuestionList = 'admin:question:list:',
  AdminQuestionDetail = 'admin:question:detail:',

  // [User]
  UserQuestion = 'user:question:',
  UserQuestionList = 'user:question:list:', // User get list questions in quiz
  UserQuestionDetail = 'user:question:detail:',
}

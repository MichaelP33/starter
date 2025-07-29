import { Suspense } from 'react'
import { Category } from '../types/notion'
import { getOrganizedContent } from '../lib/notion-api'

// Category styling mapping
const categoryStyles = {
  'Programming Fundamentals': {
    color: 'from-blue-500 to-cyan-500',
    iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-500',
    hoverGradient: 'hover:bg-gradient-to-br hover:from-blue-100/80 hover:via-cyan-100/60 hover:to-teal-100/60',
    isActive: false,
  },
  'Software Architecture & Design': {
    color: 'from-purple-500 to-indigo-500',
    iconBg: 'bg-gradient-to-br from-purple-500 to-indigo-500',
    hoverGradient: 'hover:bg-gradient-to-br hover:from-purple-100/80 hover:via-indigo-100/60 hover:to-blue-100/60',
    isActive: false,
  },
  'Web Development': {
    color: 'from-green-500 to-emerald-500',
    iconBg: 'bg-gradient-to-br from-green-500 to-emerald-500',
    hoverGradient: 'hover:bg-gradient-to-br hover:from-green-100/80 hover:via-emerald-100/60 hover:to-teal-100/60',
    isActive: false,
  },
  'Databases & Data Management': {
    color: 'from-orange-500 to-red-500',
    iconBg: 'bg-gradient-to-br from-orange-500 to-red-500',
    hoverGradient: 'hover:bg-gradient-to-br hover:from-orange-100/80 hover:via-red-100/60 hover:to-pink-100/60',
    isActive: false,
  },
  'Testing & Quality Assurance': {
    color: 'from-rose-500 to-pink-500',
    iconBg: 'bg-gradient-to-br from-rose-500 to-pink-500',
    hoverGradient: 'hover:bg-gradient-to-br hover:from-rose-100/80 hover:via-pink-100/60 hover:via-purple-100/50 hover:to-indigo-100/60',
    isActive: false,
  },
}

// Category icons mapping
const categoryIcons = {
  'Programming Fundamentals': '🧱',
  'Software Architecture & Design': '🏗️',
  'Web Development': '🌐',
  'Databases & Data Management': '🗄️',
  'Testing & Quality Assurance': '🧪',
  'DevOps & Deployment': '🚀',
}

// Mock data fallback for when Notion API fails
const mockCategories: Category[] = [
  {
    name: 'Programming Fundamentals',
    description: 'Core programming concepts and language basics',
    progress: { completed: 3, total: 8 },
    topics: [
      {
        name: 'Programming Languages & Paradigms',
        progress: { completed: 2, total: 4 },
        articles: [
          { name: 'Compiled Languages', learningStatus: 'Confident', confidenceRating: 4 },
          { name: 'Interpreted Languages', learningStatus: 'Learning', confidenceRating: 2 },
          { name: 'Object-Oriented Programming', learningStatus: 'Not started', confidenceRating: 0 },
          { name: 'Functional Programming', learningStatus: 'Not started', confidenceRating: 0 },
        ]
      },
      {
        name: 'Data Structures & Algorithms',
        progress: { completed: 1, total: 4 },
        articles: [
          { name: 'Arrays and Lists', learningStatus: 'Confident', confidenceRating: 4 },
          { name: 'Trees and Graphs', learningStatus: 'Not started', confidenceRating: 0 },
          { name: 'Sorting Algorithms', learningStatus: 'Not started', confidenceRating: 0 },
          { name: 'Search Algorithms', learningStatus: 'Not started', confidenceRating: 0 },
        ]
      }
    ]
  },
  {
    name: 'Software Architecture & Design',
    description: 'System design patterns and architectural principles',
    progress: { completed: 1, total: 6 },
    topics: [
      {
        name: 'Design Patterns',
        progress: { completed: 1, total: 3 },
        articles: [
          { name: 'Singleton Pattern', learningStatus: 'Learning', confidenceRating: 2 },
          { name: 'Factory Pattern', learningStatus: 'Not started', confidenceRating: 0 },
          { name: 'Observer Pattern', learningStatus: 'Not started', confidenceRating: 0 },
        ]
      },
      {
        name: 'System Architecture',
        progress: { completed: 0, total: 3 },
        articles: [
          { name: 'Microservices', learningStatus: 'Not started', confidenceRating: 0 },
          { name: 'Monolithic Architecture', learningStatus: 'Not started', confidenceRating: 0 },
          { name: 'Event-Driven Architecture', learningStatus: 'Not started', confidenceRating: 0 },
        ]
      }
    ]
  },
  {
    name: 'Web Development',
    description: 'Frontend and backend web technologies',
    progress: { completed: 2, total: 5 },
    topics: [
      {
        name: 'Frontend Frameworks',
        progress: { completed: 2, total: 3 },
        articles: [
          { name: 'React Fundamentals', learningStatus: 'Confident', confidenceRating: 4 },
          { name: 'Next.js', learningStatus: 'Learning', confidenceRating: 3 },
          { name: 'Vue.js', learningStatus: 'Not started', confidenceRating: 0 },
        ]
      },
      {
        name: 'Backend Development',
        progress: { completed: 0, total: 2 },
        articles: [
          { name: 'RESTful APIs', learningStatus: 'Not started', confidenceRating: 0 },
          { name: 'GraphQL', learningStatus: 'Not started', confidenceRating: 0 },
        ]
      }
    ]
  }
]

// Calculate proficiency based on learning status
function calculateProficiency(articles: Array<{ learningStatus: string, confidenceRating?: number }>): number {
  if (articles.length === 0) return 0
  
  const statusWeights = {
    'Confident': 4,
    'Learning': 2,
    'Not started': 0,
  }
  
  const totalScore = articles.reduce((acc, article) => {
    const weight = statusWeights[article.learningStatus as keyof typeof statusWeights] || 0
    return acc + weight
  }, 0)
  
  return Math.round((totalScore / (articles.length * 4)) * 100)
}

export default async function HomePage() {
  // Fetch categories from Notion
  let categories: Category[] = []
  let totalArticles = 0
  let overallProficiency = 0

  try {
    categories = await getOrganizedContent()
    totalArticles = categories.reduce((acc, cat) => acc + cat.progress.total, 0)
    
    // Calculate overall proficiency based on learning status mapping
    const allArticles = categories.flatMap(cat => cat.topics.flatMap(topic => topic.articles))
    overallProficiency = calculateProficiency(allArticles)
  } catch (error) {
    console.error('Error fetching categories:', error)
    // Fallback to mock data
    categories = mockCategories
    totalArticles = categories.reduce((acc, cat) => acc + cat.progress.total, 0)
    const allArticles = categories.flatMap(cat => cat.topics.flatMap(topic => topic.articles))
    overallProficiency = calculateProficiency(allArticles)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 relative overflow-hidden">
      {/* Cursor-style background gradients */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-50/40 via-pink-50/30 via-orange-50/20 via-green-50/30 to-cyan-50/40" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(139,92,246,0.08),rgba(255,255,255,0))]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_80%_120%,rgba(14,165,233,0.06),rgba(255,255,255,0))]" />
      
      <div className="relative">
        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/60 border-b border-gray-200/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 bg-clip-text text-transparent">
                  Software Development Learning
                </h1>
                <p className="text-gray-600 mt-1">Master the fundamentals through structured learning</p>
              </div>
              
              {/* Stats */}
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{totalArticles}</div>
                  <div className="text-sm text-gray-600">Articles</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{overallProficiency}%</div>
                  <div className="text-sm text-gray-600">Proficiency</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => {
              const style = categoryStyles[category.name as keyof typeof categoryStyles] || categoryStyles['Programming Fundamentals']
              const icon = categoryIcons[category.name as keyof typeof categoryIcons] || '📚'
              const completedPercentage = category.progress.total > 0 
                ? Math.round((category.progress.completed / category.progress.total) * 100) 
                : 0

              return (
                <div
                  key={category.name}
                  className={`group relative bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 transition-all duration-300 ${style.hoverGradient} hover:shadow-xl hover:shadow-gray-200/50 hover:scale-[1.02] cursor-pointer`}
                >
                  {/* Category Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl ${style.iconBg} flex items-center justify-center text-white text-xl font-bold shadow-lg`}>
                      {icon}
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        {category.progress.completed}/{category.progress.total}
                      </div>
                      <div className="text-sm text-gray-600">Articles</div>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-gray-800">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                    {category.description}
                  </p>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Progress</span>
                      <span>{completedPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${style.color} transition-all duration-500 ease-out`}
                        style={{ width: `${completedPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Topics Preview */}
                  <div className="space-y-2">
                    {category.topics.slice(0, 2).map((topic) => (
                      <div key={topic.name} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700 truncate">{topic.name}</span>
                        <span className="text-gray-500 ml-2 flex-shrink-0">
                          {topic.progress.completed}/{topic.progress.total}
                        </span>
                      </div>
                    ))}
                    {category.topics.length > 2 && (
                      <div className="text-sm text-gray-500">
                        +{category.topics.length - 2} more topics
                      </div>
                    )}
                  </div>

                  {/* Hover Indicator */}
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Quick Stats */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 text-center border border-gray-200/50">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {categories.reduce((acc, cat) => acc + cat.progress.completed, 0)}
              </div>
              <div className="text-gray-600 text-sm">Completed</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 text-center border border-gray-200/50">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {categories.reduce((acc, cat) => acc + (cat.progress.total - cat.progress.completed), 0)}
              </div>
              <div className="text-gray-600 text-sm">Remaining</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 text-center border border-gray-200/50">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {categories.length}
              </div>
              <div className="text-gray-600 text-sm">Categories</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 text-center border border-gray-200/50">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {categories.reduce((acc, cat) => acc + cat.topics.length, 0)}
              </div>
              <div className="text-gray-600 text-sm">Topics</div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Target, 
  BookOpen, 
  Calendar, 
  TrendingUp, 
  Award, 
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  Star
} from "lucide-react";

interface ReadingGoal {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  unit: 'books' | 'pages' | 'hours';
  deadline: string;
  category?: string;
  status: 'active' | 'completed' | 'paused';
  created_at: string;
}

interface BookProgress {
  id: string;
  book_title: string;
  author: string;
  total_pages: number;
  current_page: number;
  status: 'reading' | 'completed' | 'paused';
  started_date: string;
  completed_date?: string;
  rating?: number;
  notes?: string;
}

const ReadingTracker = () => {
  const { toast } = useToast();
  const [goals, setGoals] = useState<ReadingGoal[]>([
    {
      id: '1',
      title: '2024 Reading Challenge',
      description: 'Read 24 books this year',
      target: 24,
      current: 12,
      unit: 'books',
      deadline: '2024-12-31',
      status: 'active',
      created_at: '2024-01-01'
    },
    {
      id: '2',
      title: 'Technical Learning',
      description: 'Read 5 computer science books',
      target: 5,
      current: 3,
      unit: 'books',
      deadline: '2024-06-30',
      category: 'Computer Science',
      status: 'active',
      created_at: '2024-01-15'
    },
    {
      id: '3',
      title: 'Daily Reading Habit',
      description: 'Read 30 minutes every day',
      target: 182,
      current: 95,
      unit: 'hours',
      deadline: '2024-12-31',
      status: 'active',
      created_at: '2024-01-01'
    }
  ]);

  const [currentBooks, setCurrentBooks] = useState<BookProgress[]>([
    {
      id: '1',
      book_title: 'Clean Code',
      author: 'Robert C. Martin',
      total_pages: 464,
      current_page: 230,
      status: 'reading',
      started_date: '2024-01-20',
      notes: 'Great insights on writing maintainable code'
    },
    {
      id: '2',
      book_title: 'The Pragmatic Programmer',
      author: 'David Thomas',
      total_pages: 352,
      current_page: 352,
      status: 'completed',
      started_date: '2024-01-01',
      completed_date: '2024-01-15',
      rating: 5,
      notes: 'Excellent book for software development practices'
    }
  ]);

  const [showNewGoal, setShowNewGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    target: '',
    unit: 'books' as 'books' | 'pages' | 'hours',
    deadline: '',
    category: ''
  });

  const handleCreateGoal = () => {
    if (!newGoal.title || !newGoal.target || !newGoal.deadline) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    const goal: ReadingGoal = {
      id: Date.now().toString(),
      title: newGoal.title,
      description: newGoal.description,
      target: parseInt(newGoal.target),
      current: 0,
      unit: newGoal.unit,
      deadline: newGoal.deadline,
      category: newGoal.category || undefined,
      status: 'active',
      created_at: new Date().toISOString().split('T')[0]
    };

    setGoals(prev => [...prev, goal]);
    setNewGoal({
      title: '',
      description: '',
      target: '',
      unit: 'books',
      deadline: '',
      category: ''
    });
    setShowNewGoal(false);

    toast({
      title: "Goal Created",
      description: "Your reading goal has been created successfully!",
      duration: 3000,
    });
  };

  const updateGoalProgress = (goalId: string, increment: number) => {
    setGoals(prev => prev.map(goal => {
      if (goal.id === goalId) {
        const newCurrent = Math.max(0, goal.current + increment);
        const updated = { ...goal, current: newCurrent };
        
        if (newCurrent >= goal.target && goal.status === 'active') {
          updated.status = 'completed';
          toast({
            title: "🎉 Goal Completed!",
            description: `Congratulations! You've completed "${goal.title}"`,
            duration: 5000,
          });
        }
        
        return updated;
      }
      return goal;
    }));
  };

  const updateBookProgress = (bookId: string, newPage: number) => {
    setCurrentBooks(prev => prev.map(book => {
      if (book.id === bookId) {
        const updated = { ...book, current_page: newPage };
        
        if (newPage >= book.total_pages && book.status === 'reading') {
          updated.status = 'completed';
          updated.completed_date = new Date().toISOString().split('T')[0];
          
          // Update reading goals
          updateGoalProgress('1', 1); // Update yearly reading goal
          
          toast({
            title: "📚 Book Completed!",
            description: `Congratulations on finishing "${book.book_title}"!`,
            duration: 5000,
          });
        }
        
        return updated;
      }
      return book;
    }));
  };

  const getGoalProgress = (goal: ReadingGoal) => {
    return Math.min(100, (goal.current / goal.target) * 100);
  };

  const getBookProgress = (book: BookProgress) => {
    return Math.min(100, (book.current_page / book.total_pages) * 100);
  };

  const getDaysRemaining = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const getMotivationalMessage = () => {
    const completedGoals = goals.filter(g => g.status === 'completed').length;
    const totalBooks = goals.find(g => g.id === '1')?.current || 0;
    
    if (completedGoals >= 2) return "🏆 Amazing progress! You're a reading champion!";
    if (totalBooks >= 10) return "📚 Great job! You're building an excellent reading habit!";
    if (totalBooks >= 5) return "🌟 Keep it up! You're doing wonderfully!";
    return "📖 Every page brings you closer to your goals!";
  };

  return (
    <div className="space-y-6">
      {/* Header with Motivational Message */}
      <Card className="bg-gradient-to-r from-red-600 to-purple-700 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Reading Progress</h2>
              <p className="text-red-100">{getMotivationalMessage()}</p>
            </div>
            <Target className="h-12 w-12 text-red-200" />
          </div>
        </CardContent>
      </Card>

      {/* Reading Goals */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Reading Goals
            </CardTitle>
            <Button 
              onClick={() => setShowNewGoal(true)}
              className="bg-red-600 hover:bg-red-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Goal
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* New Goal Form */}
          {showNewGoal && (
            <Card className="mb-6 border-2 border-red-200">
              <CardHeader>
                <CardTitle className="text-lg">Create New Reading Goal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Goal Title *</label>
                    <Input
                      placeholder="e.g., Summer Reading Challenge"
                      value={newGoal.title}
                      onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <Input
                      placeholder="e.g., Fiction, Science, etc."
                      value={newGoal.category}
                      onChange={(e) => setNewGoal(prev => ({ ...prev, category: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <Input
                    placeholder="Describe your reading goal"
                    value={newGoal.description}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Target *</label>
                    <Input
                      type="number"
                      placeholder="e.g., 12"
                      value={newGoal.target}
                      onChange={(e) => setNewGoal(prev => ({ ...prev, target: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Unit *</label>
                    <select 
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      value={newGoal.unit}
                      onChange={(e) => setNewGoal(prev => ({ ...prev, unit: e.target.value as any }))}
                    >
                      <option value="books">Books</option>
                      <option value="pages">Pages</option>
                      <option value="hours">Hours</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Deadline *</label>
                    <Input
                      type="date"
                      value={newGoal.deadline}
                      onChange={(e) => setNewGoal(prev => ({ ...prev, deadline: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleCreateGoal} className="bg-red-600 hover:bg-red-700">
                    Create Goal
                  </Button>
                  <Button variant="outline" onClick={() => setShowNewGoal(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Goals List */}
          <div className="space-y-4">
            {goals.map((goal) => (
              <Card key={goal.id} className={`${goal.status === 'completed' ? 'border-green-200 bg-green-50' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold flex items-center gap-2">
                        {goal.title}
                        {goal.status === 'completed' && <CheckCircle className="h-4 w-4 text-green-600" />}
                        {goal.category && <Badge variant="secondary">{goal.category}</Badge>}
                      </h3>
                      <p className="text-sm text-gray-600">{goal.description}</p>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {getDaysRemaining(goal.deadline)} days left
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{goal.current} of {goal.target} {goal.unit}</span>
                      <span>{Math.round(getGoalProgress(goal))}%</span>
                    </div>
                    <Progress value={getGoalProgress(goal)} className="h-2" />
                  </div>

                  {goal.status === 'active' && (
                    <div className="flex gap-2 mt-3">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => updateGoalProgress(goal.id, 1)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add 1
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => updateGoalProgress(goal.id, -1)}
                        disabled={goal.current <= 0}
                      >
                        Remove 1
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Currently Reading */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Currently Reading
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {currentBooks.map((book) => (
              <Card key={book.id} className={`${book.status === 'completed' ? 'border-green-200 bg-green-50' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold flex items-center gap-2">
                        {book.book_title}
                        {book.status === 'completed' && <CheckCircle className="h-4 w-4 text-green-600" />}
                      </h3>
                      <p className="text-sm text-gray-600">by {book.author}</p>
                      {book.rating && (
                        <div className="flex items-center gap-1 mt-1">
                          {renderStars(book.rating)}
                        </div>
                      )}
                    </div>
                    <Badge variant={book.status === 'completed' ? 'default' : 'secondary'}>
                      {book.status}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Page {book.current_page} of {book.total_pages}</span>
                      <span>{Math.round(getBookProgress(book))}%</span>
                    </div>
                    <Progress value={getBookProgress(book)} className="h-2" />
                  </div>

                  {book.notes && (
                    <p className="text-sm text-gray-600 mt-2 italic">"{book.notes}"</p>
                  )}

                  {book.status === 'reading' && (
                    <div className="flex gap-2 mt-3">
                      <Input
                        type="number"
                        placeholder="Page number"
                        className="w-32"
                        min="0"
                        max={book.total_pages}
                        onBlur={(e) => {
                          const page = parseInt(e.target.value);
                          if (page >= 0 && page <= book.total_pages) {
                            updateBookProgress(book.id, page);
                          }
                        }}
                      />
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => updateBookProgress(book.id, Math.min(book.total_pages, book.current_page + 10))}
                      >
                        +10 pages
                      </Button>
                    </div>
                  )}

                  <div className="text-xs text-gray-500 mt-2">
                    Started: {book.started_date}
                    {book.completed_date && ` • Completed: ${book.completed_date}`}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reading Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Reading Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">12</div>
              <div className="text-sm text-gray-600">Books Read This Year</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">95</div>
              <div className="text-sm text-gray-600">Hours Read</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">4.2</div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">7</div>
              <div className="text-sm text-gray-600">Day Streak</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReadingTracker;

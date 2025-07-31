import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X } from "lucide-react";

interface SearchFilters {
  query: string;
  category: string;
  author: string;
  year: string;
  availability: string;
}

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  onClear: () => void;
}

const AdvancedSearch = ({ onSearch, onClear }: AdvancedSearchProps) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: '',
    author: '',
    year: '',
    availability: ''
  });

  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    'Computer Science',
    'Software Engineering',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'Literature',
    'History',
    'Philosophy',
    'Business',
    'Engineering',
    'Medicine'
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => (currentYear - i).toString());

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleClear = () => {
    setFilters({
      query: '',
      category: '',
      author: '',
      year: '',
      availability: ''
    });
    onClear();
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => value.trim() !== '').length;
  };

  return (
    <Card className="w-full mb-6">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="h-5 w-5" />
            Advanced Search
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary" className="ml-1">
                {getActiveFiltersCount()}
              </Badge>
            )}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Main Search Bar */}
        <div className="flex gap-2">
          <Input
            placeholder="Search books, authors, ISBN..."
            value={filters.query}
            onChange={(e) => handleFilterChange('query', e.target.value)}
            className="flex-1"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} className="bg-red-600 hover:bg-red-700">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
          {getActiveFiltersCount() > 0 && (
            <Button variant="outline" onClick={handleClear}>
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Category</label>
              <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Author Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Author</label>
              <Input
                placeholder="Author name"
                value={filters.author}
                onChange={(e) => handleFilterChange('author', e.target.value)}
              />
            </div>

            {/* Publication Year Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Publication Year</label>
              <Select value={filters.year} onValueChange={(value) => handleFilterChange('year', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Any Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any Year</SelectItem>
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Availability Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Availability</label>
              <Select value={filters.availability} onValueChange={(value) => handleFilterChange('availability', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Books" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Books</SelectItem>
                  <SelectItem value="available">Available Only</SelectItem>
                  <SelectItem value="borrowed">Currently Borrowed</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {getActiveFiltersCount() > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            <span className="text-sm text-gray-600">Active filters:</span>
            {filters.query && (
              <Badge variant="outline" className="flex items-center gap-1">
                Query: "{filters.query}"
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleFilterChange('query', '')}
                />
              </Badge>
            )}
            {filters.category && (
              <Badge variant="outline" className="flex items-center gap-1">
                Category: {filters.category}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleFilterChange('category', '')}
                />
              </Badge>
            )}
            {filters.author && (
              <Badge variant="outline" className="flex items-center gap-1">
                Author: {filters.author}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleFilterChange('author', '')}
                />
              </Badge>
            )}
            {filters.year && (
              <Badge variant="outline" className="flex items-center gap-1">
                Year: {filters.year}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleFilterChange('year', '')}
                />
              </Badge>
            )}
            {filters.availability && (
              <Badge variant="outline" className="flex items-center gap-1">
                Status: {filters.availability}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleFilterChange('availability', '')}
                />
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdvancedSearch;

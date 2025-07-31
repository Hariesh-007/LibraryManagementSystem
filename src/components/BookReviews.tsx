import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, ThumbsUp, ThumbsDown, Flag, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Review {
  id: string;
  user_name: string;
  user_avatar?: string;
  rating: number;
  title: string;
  content: string;
  date: string;
  helpful_count: number;
  verified_purchase: boolean;
  user_voted?: 'up' | 'down' | null;
}

interface BookReviewsProps {
  bookId: string;
  bookTitle: string;
  averageRating: number;
  totalReviews: number;
}

const BookReviews = ({ bookId, bookTitle, averageRating, totalReviews }: BookReviewsProps) => {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: '1',
      user_name: 'Alex Johnson',
      rating: 5,
      title: 'Excellent comprehensive guide',
      content: 'This book covers algorithms in great detail with clear explanations and practical examples. The pseudocode is easy to follow and the mathematical proofs are well-explained. Highly recommended for computer science students.',
      date: '2024-01-15',
      helpful_count: 23,
      verified_purchase: true,
      user_voted: null
    },
    {
      id: '2',
      user_name: 'Sarah Chen',
      rating: 4,
      title: 'Great reference book',
      content: 'Very thorough coverage of algorithms and data structures. Can be quite dense at times, but that\'s expected for a comprehensive textbook. The exercises are challenging and helpful.',
      date: '2024-01-10',
      helpful_count: 15,
      verified_purchase: true,
      user_voted: null
    },
    {
      id: '3',
      user_name: 'Mike Rodriguez',
      rating: 3,
      title: 'Good but heavy',
      content: 'Solid content but can be overwhelming for beginners. Better suited for intermediate to advanced students. The writing style is academic and sometimes hard to follow.',
      date: '2024-01-05',
      helpful_count: 8,
      verified_purchase: false,
      user_voted: null
    }
  ]);

  const [newReview, setNewReview] = useState({
    rating: 0,
    title: '',
    content: ''
  });

  const [showReviewForm, setShowReviewForm] = useState(false);

  const renderStars = (rating: number, interactive = false, onStarClick?: (rating: number) => void) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-5 w-5 ${
          index < rating 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
        onClick={() => interactive && onStarClick?.(index + 1)}
      />
    ));
  };

  const handleSubmitReview = () => {
    if (newReview.rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please provide a rating for your review.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    if (newReview.title.trim() === '' || newReview.content.trim() === '') {
      toast({
        title: "Review Content Required",
        description: "Please provide both a title and review content.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    const review: Review = {
      id: Date.now().toString(),
      user_name: 'Demo Student',
      rating: newReview.rating,
      title: newReview.title,
      content: newReview.content,
      date: new Date().toISOString().split('T')[0],
      helpful_count: 0,
      verified_purchase: true,
      user_voted: null
    };

    setReviews(prev => [review, ...prev]);
    setNewReview({ rating: 0, title: '', content: '' });
    setShowReviewForm(false);

    toast({
      title: "Review Submitted",
      description: "Thank you for your review! It has been added successfully.",
      duration: 3000,
    });
  };

  const handleVote = (reviewId: string, voteType: 'up' | 'down') => {
    setReviews(prev => prev.map(review => {
      if (review.id === reviewId) {
        const wasVotedUp = review.user_voted === 'up';
        const wasVotedDown = review.user_voted === 'down';
        
        let newHelpfulCount = review.helpful_count;
        let newUserVoted: 'up' | 'down' | null = voteType;

        if (voteType === 'up') {
          if (wasVotedUp) {
            newHelpfulCount -= 1;
            newUserVoted = null;
          } else if (wasVotedDown) {
            newHelpfulCount += 2;
          } else {
            newHelpfulCount += 1;
          }
        } else {
          if (wasVotedDown) {
            newHelpfulCount += 1;
            newUserVoted = null;
          } else if (wasVotedUp) {
            newHelpfulCount -= 2;
          } else {
            newHelpfulCount -= 1;
          }
        }

        return {
          ...review,
          helpful_count: Math.max(0, newHelpfulCount),
          user_voted: newUserVoted
        };
      }
      return review;
    }));
  };

  const getRatingDistribution = () => {
    const distribution = [0, 0, 0, 0, 0];
    reviews.forEach(review => {
      distribution[review.rating - 1]++;
    });
    return distribution.reverse();
  };

  const ratingDistribution = getRatingDistribution();

  return (
    <div className="space-y-6">
      {/* Overall Rating Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Customer Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Average Rating */}
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {averageRating.toFixed(1)}
              </div>
              <div className="flex justify-center mb-2">
                {renderStars(Math.floor(averageRating))}
              </div>
              <p className="text-gray-600">{totalReviews} reviews</p>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((star, index) => (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-sm font-medium w-8">{star} ★</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{ 
                        width: `${totalReviews > 0 ? (ratingDistribution[index] / totalReviews) * 100 : 0}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-8">
                    {ratingDistribution[index]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Write Review Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Reviews ({reviews.length})</h3>
        <Button 
          onClick={() => setShowReviewForm(!showReviewForm)}
          className="bg-red-600 hover:bg-red-700"
        >
          Write a Review
        </Button>
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <Card>
          <CardHeader>
            <CardTitle>Write Your Review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Rating
              </label>
              <div className="flex gap-1">
                {renderStars(newReview.rating, true, (rating) => 
                  setNewReview(prev => ({ ...prev, rating }))
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review Title
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Summarize your review in a few words"
                value={newReview.title}
                onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Review
              </label>
              <Textarea
                placeholder="Share your thoughts about this book..."
                value={newReview.content}
                onChange={(e) => setNewReview(prev => ({ ...prev, content: e.target.value }))}
                rows={4}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSubmitReview} className="bg-red-600 hover:bg-red-700">
                Submit Review
              </Button>
              <Button variant="outline" onClick={() => setShowReviewForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Avatar>
                  <AvatarImage src={review.user_avatar} />
                  <AvatarFallback>
                    {review.user_name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{review.user_name}</span>
                    {review.verified_purchase && (
                      <Badge variant="secondary" className="text-xs">
                        Verified Reader
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {renderStars(review.rating)}
                    <span className="text-sm text-gray-600">{review.date}</span>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">{review.title}</h4>
                    <p className="text-gray-700">{review.content}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">
                      Was this helpful?
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`p-2 ${
                          review.user_voted === 'up' ? 'text-green-600 bg-green-50' : ''
                        }`}
                        onClick={() => handleVote(review.id, 'up')}
                      >
                        <ThumbsUp className="h-4 w-4" />
                      </Button>
                      <span className="text-sm text-gray-600">
                        {review.helpful_count}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`p-2 ${
                          review.user_voted === 'down' ? 'text-red-600 bg-red-50' : ''
                        }`}
                        onClick={() => handleVote(review.id, 'down')}
                      >
                        <ThumbsDown className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="p-2 ml-4">
                        <Flag className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BookReviews;

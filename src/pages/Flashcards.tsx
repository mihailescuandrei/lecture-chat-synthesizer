
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Loader2, BookOpen } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import BackgroundGradient from "@/components/ui/BackgroundGradient";

interface Flashcard {
  id?: number;
  question: string;
  answer: string;
  lecture_id?: number;
}

const Flashcards = () => {
  const { courseId, lectureId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());
  const queryClient = useQueryClient();

  // First query to fetch flashcards from the database
  const { data: savedFlashcards, isLoading: isLoadingSaved } = useQuery({
    queryKey: ['saved-flashcards', lectureId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('flashcards')
        .select('*')
        .eq('lecture_id', parseInt(lectureId!))
        .order('id');

      if (error) {
        console.error('Error fetching saved flashcards:', error);
        throw error;
      }
      return data as Flashcard[];
    }
  });

  // Second query to generate flashcards if none exist
  const { data: generatedFlashcards, isLoading: isGenerating, refetch: regenerateFlashcards } = useQuery({
    queryKey: ['generated-flashcards', lectureId],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('generate-flashcards', {
        body: {
          lectureId: parseInt(lectureId!),
          count: 6
        }
      });
      if (error) {
        console.error('Error generating flashcards:', error);
        throw error;
      }
      return data.flashcards as Flashcard[];
    },
    enabled: false, // Don't run this query automatically
    meta: {
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to generate flashcards. Please try again.",
          variant: "destructive"
        });
      }
    }
  });

  // Mutation to save flashcards to the database
  const saveFlashcardsMutation = useMutation({
    mutationFn: async (flashcards: Flashcard[]) => {
      const preparedFlashcards = flashcards.map(card => ({
        lecture_id: parseInt(lectureId!),
        question: card.question,
        answer: card.answer
      }));

      const { data, error } = await supabase
        .from('flashcards')
        .insert(preparedFlashcards)
        .select();

      if (error) {
        console.error('Error saving flashcards:', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-flashcards', lectureId] });
      toast({
        title: "Success",
        description: "Flashcards saved successfully!"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save flashcards. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Check if we need to generate flashcards
  useEffect(() => {
    if (savedFlashcards && savedFlashcards.length === 0) {
      regenerateFlashcards();
    }
  }, [savedFlashcards, regenerateFlashcards]);

  // Save generated flashcards to database
  useEffect(() => {
    if (generatedFlashcards && generatedFlashcards.length > 0 && !isGenerating) {
      saveFlashcardsMutation.mutate(generatedFlashcards);
    }
  }, [generatedFlashcards, isGenerating]);

  const handleCardClick = (index: number) => {
    setFlippedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const generateMoreFlashcards = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-flashcards', {
        body: {
          lectureId: parseInt(lectureId!),
          count: 3
        }
      });
      if (error) throw error;
      
      // Save the new flashcards directly
      saveFlashcardsMutation.mutate(data.flashcards);
      
      toast({
        title: "Success",
        description: "Generated new flashcards successfully!"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate more flashcards. Please try again.",
        variant: "destructive"
      });
    }
  };

  const isLoading = isLoadingSaved || isGenerating || saveFlashcardsMutation.isPending;

  if (isLoading) {
    return <BackgroundGradient>
        <div className="container mx-auto p-4">
          <div className="max-w-4xl mx-auto text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading flashcards...</p>
          </div>
        </div>
      </BackgroundGradient>;
  }

  return <BackgroundGradient>
      <div className="container mx-auto p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-start space-x-4 mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate(`/course/${courseId}/lecture/${lectureId}`)} 
              className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-md flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Lecture
            </Button>
            
            <div className="flex items-center gap-2 text-2xl font-bold">
              <BookOpen className="w-6 h-6 text-purple-500" />
              <span className="text-purple-500">Flashcards</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {savedFlashcards && savedFlashcards.map((flashcard, index) => (
              <div key={flashcard.id} className="perspective-1000 cursor-pointer" onClick={() => handleCardClick(index)}>
                <div className={`relative w-full h-64 transition-transform duration-500 transform-style-3d ${flippedCards.has(index) ? 'rotate-y-180' : ''}`}>
                  <Card className="absolute w-full h-full p-6 flex items-center justify-center text-center backface-hidden bg-white/90 backdrop-blur-sm border border-purple-200/30 shadow-md">
                    <p className="text-lg font-medium text-gray-800">{flashcard.question}</p>
                  </Card>
                  <Card className="absolute w-full h-full p-6 flex items-center justify-center text-center bg-gradient-to-br from-purple-50 to-indigo-50 rotate-y-180 backface-hidden border border-purple-200/30 shadow-md">
                    <p className="text-lg text-gray-800">{flashcard.answer}</p>
                  </Card>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center">
            <Button 
              onClick={generateMoreFlashcards} 
              className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-medium px-6 py-2 rounded-md shadow-md"
            >
              Generate More Flashcards
            </Button>
          </div>
        </div>
      </div>
    </BackgroundGradient>;
};

export default Flashcards;

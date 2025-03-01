
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import StoryQuiz from "../StoryQuiz";
import StoryFailDialog from "../StoryFailDialog";
import { MAX_SCORE } from "@/utils/scoreUtils";

interface QuizHandlerProps {
  currentSegmentData: {
    id: string;
    questions: any[];
  };
  questionIndex: number;
  lectureId: string | undefined;
  courseId: string | undefined;
  currentScore: number;
  onCorrectAnswer: () => void;
  onWrongAnswer: () => void;
  onContinue: () => void;
}

const QuizHandler = ({
  currentSegmentData,
  questionIndex,
  lectureId,
  courseId,
  currentScore,
  onCorrectAnswer,
  onWrongAnswer,
  onContinue
}: QuizHandlerProps) => {
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());
  const [showFailDialog, setShowFailDialog] = useState(false);
  const [failedQuestions, setFailedQuestions] = useState<Set<number>>(new Set());
  const { toast } = useToast();

  const handleCorrectAnswer = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error('Authentication error:', authError);
        toast({
          title: "Authentication Error",
          description: "Please make sure you're logged in to save progress.",
          variant: "destructive",
        });
        return;
      }

      if (!lectureId) return;
      const segmentNumber = parseInt(currentSegmentData.id.split('_')[1]);
      const quizNumber = questionIndex + 1;

      const { error } = await supabase
        .from('quiz_progress')
        .upsert({
          user_id: user.id,
          lecture_id: parseInt(lectureId),
          segment_number: segmentNumber,
          quiz_number: quizNumber,
          quiz_score: 5,
          completed_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,lecture_id,segment_number,quiz_number'
        });

      if (error) {
        console.error('Error saving quiz progress:', error);
        throw error;
      }

      toast({
        title: "🎯 Correct!",
        description: `+5 points earned!`,
      });

      // Remove from failed questions if it was there
      if (failedQuestions.has(questionIndex)) {
        const updatedFailedQuestions = new Set(failedQuestions);
        updatedFailedQuestions.delete(questionIndex);
        setFailedQuestions(updatedFailedQuestions);
      }

      if (quizNumber === 2) {
        // Check if there are any failed questions that need to be retaken
        if (failedQuestions.size > 0) {
          setShowFailDialog(true);
        } else {
          onCorrectAnswer();
          toast({
            title: "🌟 Node Complete!",
            description: "Great job! You've mastered this node.",
          });
        }
      } else {
        handleContinue();
      }

    } catch (error) {
      console.error('Error in handleCorrectAnswer:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleWrongAnswer = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error('Authentication error:', authError);
        return;
      }

      if (!lectureId) return;
      const segmentNumber = parseInt(currentSegmentData.id.split('_')[1]);
      const quizNumber = questionIndex + 1;

      const { error } = await supabase
        .from('quiz_progress')
        .upsert({
          user_id: user.id,
          lecture_id: parseInt(lectureId),
          segment_number: segmentNumber,
          quiz_number: quizNumber,
          quiz_score: 0,
          completed_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,lecture_id,segment_number,quiz_number'
        });

      if (error) {
        console.error('Error saving quiz progress:', error);
        throw error;
      }

      // Add to failed questions set
      setFailedQuestions(prev => new Set([...prev, questionIndex]));
      
      setAnsweredQuestions(prev => new Set([...prev, questionIndex]));
      onWrongAnswer();
      toast({
        title: "Keep trying!",
        description: "Don't worry, mistakes help us learn.",
        variant: "destructive"
      });
      handleContinue();
    } catch (error) {
      console.error('Error in handleWrongAnswer:', error);
    }
  };

  const handleContinue = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    onContinue();
  };

  const handleRetakeFailedQuestions = () => {
    setShowFailDialog(false);
    // Logic to go back to the first failed question will be handled by parent component
    onWrongAnswer();
  };

  return (
    <>
      <StoryQuiz
        question={currentSegmentData.questions[questionIndex]}
        onCorrectAnswer={handleCorrectAnswer}
        onWrongAnswer={handleWrongAnswer}
        isAnswered={answeredQuestions.has(questionIndex)}
      />

      <StoryFailDialog
        isOpen={showFailDialog}
        onClose={() => setShowFailDialog(false)}
        onRestart={handleRetakeFailedQuestions}
        courseId={courseId || ""}
        score={currentScore}
        hasFailedQuestions={failedQuestions.size > 0}
      />
    </>
  );
};

export default QuizHandler;

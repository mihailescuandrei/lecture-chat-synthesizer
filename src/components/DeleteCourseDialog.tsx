
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Trash2 } from "lucide-react";

interface DeleteCourseDialogProps {
  courseId: number;
  courseTitle: string;
}

export function DeleteCourseDialog({ courseId, courseTitle }: DeleteCourseDialogProps) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      console.log('Deleting course:', courseId);
      
      // Get all lectures for this course
      const { data: lectures, error: lecturesQueryError } = await supabase
        .from('lectures')
        .select('id')
        .eq('course_id', courseId);

      if (lecturesQueryError) throw lecturesQueryError;

      // Delete related content for each lecture
      if (lectures && lectures.length > 0) {
        const lectureIds = lectures.map(lecture => lecture.id);
        
        // Delete generated quizzes first (this is the constraint causing the error)
        const { error: quizzesError } = await supabase
          .from('generated_quizzes')
          .delete()
          .in('lecture_id', lectureIds);

        if (quizzesError) throw quizzesError;
        
        // Delete quiz progress
        const { error: quizProgressError } = await supabase
          .from('quiz_progress')
          .delete()
          .in('lecture_id', lectureIds);

        if (quizProgressError) throw quizProgressError;

        // Delete user progress
        const { error: userProgressError } = await supabase
          .from('user_progress')
          .delete()
          .in('lecture_id', lectureIds);

        if (userProgressError) throw userProgressError;

        // Delete flashcards
        const { error: flashcardsError } = await supabase
          .from('flashcards')
          .delete()
          .in('lecture_id', lectureIds);

        if (flashcardsError) throw flashcardsError;

        // Delete lecture highlights
        const { error: highlightsError } = await supabase
          .from('lecture_highlights')
          .delete()
          .in('lecture_id', lectureIds);

        if (highlightsError) throw highlightsError;

        // Delete segments content
        const { error: segmentsError } = await supabase
          .from('segments_content')
          .delete()
          .in('lecture_id', lectureIds);

        if (segmentsError) throw segmentsError;

        // Delete AI configs
        const { error: configError } = await supabase
          .from('lecture_ai_configs')
          .delete()
          .in('lecture_id', lectureIds);

        if (configError) throw configError;

        // Delete segments info
        const { error: segmentInfoError } = await supabase
          .from('lecture_segments')
          .delete()
          .in('lecture_id', lectureIds);

        if (segmentInfoError) throw segmentInfoError;

        // Delete study plans
        const { error: studyPlansError } = await supabase
          .from('study_plans')
          .delete()
          .in('lecture_id', lectureIds);

        if (studyPlansError) throw studyPlansError;

        // Delete all lectures
        const { error: lecturesError } = await supabase
          .from('lectures')
          .delete()
          .eq('course_id', courseId);

        if (lecturesError) throw lecturesError;
      }

      // Finally delete the course
      const { error: courseError } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);

      if (courseError) throw courseError;

      toast({
        title: "Success",
        description: "Course and all its content deleted successfully",
      });
      
      queryClient.invalidateQueries({ queryKey: ['uploaded-courses'] });
      setOpen(false);
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: "Error",
        description: "Failed to delete course: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="icon">
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Course</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{courseTitle}"? This will also delete all lectures and related content. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-4 mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

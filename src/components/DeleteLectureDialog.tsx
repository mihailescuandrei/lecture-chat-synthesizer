
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Trash2 } from "lucide-react";

interface DeleteLectureDialogProps {
  lectureId: number;
  lectureTitle: string;
  courseId: number;
}

export function DeleteLectureDialog({ lectureId, lectureTitle, courseId }: DeleteLectureDialogProps) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      console.log('Deleting lecture:', lectureId);
      
      // First get the PDF path for this lecture
      const mode = window.location.href.includes('professor-course') ? 'professor' : 'student';
      const tableName = mode === 'professor' ? 'professor_lectures' : 'lectures';
      
      const { data: lectureData, error: fetchError } = await supabase
        .from(tableName)
        .select('pdf_path')
        .eq('id', lectureId)
        .single();
      
      if (fetchError) {
        console.error('Error fetching lecture PDF path:', fetchError);
        throw fetchError;
      }
      
      // Step 1: Check for stored podcast audio files and delete them if they exist
      const { data: podcastData, error: podcastFetchError } = await supabase
        .from('lecture_podcast')
        .select('stored_audio_path')
        .eq('lecture_id', lectureId)
        .single();
        
      if (podcastFetchError && podcastFetchError.code !== 'PGRST116') {
        console.error('Error fetching podcast data:', podcastFetchError);
        // Continue with deletion anyway
      } else if (podcastData && podcastData.stored_audio_path) {
        console.log('Deleting stored podcast audio file:', podcastData.stored_audio_path);
        const { error: storageError } = await supabase
          .storage
          .from('podcast_audio')
          .remove([podcastData.stored_audio_path]);
          
        if (storageError) {
          console.log('Error deleting podcast audio file (continuing):', storageError);
          // Continue with deletion even if file removal fails
        }
      }
      
      // Step 2: Delete lecture podcast records first (this fixes the foreign key constraint error)
      const { error: podcastError } = await supabase
        .from('lecture_podcast')
        .delete()
        .eq('lecture_id', lectureId);
        
      if (podcastError && !podcastError.message.includes('no rows')) {
        console.error('Error deleting lecture podcast:', podcastError);
        throw podcastError;
      }
      
      // Delete quiz progress
      const { error: quizError } = await supabase
        .from('quiz_progress')
        .delete()
        .eq('lecture_id', lectureId);

      if (quizError) {
        console.error('Error deleting quiz progress:', quizError);
        throw quizError;
      }

      // Delete user progress
      const { error: userProgressError } = await supabase
        .from('user_progress')
        .delete()
        .eq('lecture_id', lectureId);

      if (userProgressError) {
        console.error('Error deleting user progress:', userProgressError);
        throw userProgressError;
      }

      // Delete any segments content
      const { error: segmentsError } = await supabase
        .from('segments_content')
        .delete()
        .eq('lecture_id', lectureId);

      if (segmentsError) {
        console.error('Error deleting segments:', segmentsError);
        throw segmentsError;
      }

      // Delete any AI configs
      const { error: configError } = await supabase
        .from('lecture_ai_configs')
        .delete()
        .eq('lecture_id', lectureId);

      if (configError) {
        console.error('Error deleting AI configs:', configError);
        throw configError;
      }

      // Delete segments info
      const { error: segmentInfoError } = await supabase
        .from('lecture_segments')
        .delete()
        .eq('lecture_id', lectureId);

      if (segmentInfoError) {
        console.error('Error deleting segment info:', segmentInfoError);
        throw segmentInfoError;
      }

      // Delete study plans
      const { error: studyPlansError } = await supabase
        .from('study_plans')
        .delete()
        .eq('lecture_id', lectureId);

      if (studyPlansError) {
        console.error('Error deleting study plans:', studyPlansError);
        throw studyPlansError;
      }

      // Finally delete the lecture
      const { error: lectureError } = await supabase
        .from(tableName)
        .delete()
        .eq('id', lectureId);

      if (lectureError) {
        console.error('Error deleting lecture:', lectureError);
        throw lectureError;
      }

      // Delete the PDF file from storage if it exists
      if (lectureData?.pdf_path) {
        const { error: storageError } = await supabase
          .storage
          .from('lecture_pdfs')
          .remove([lectureData.pdf_path]);
        
        if (storageError) {
          console.error('Error deleting PDF from storage:', storageError);
          // Don't throw here, as the lecture is already deleted
          toast({
            title: "Warning",
            description: "Lecture deleted but PDF file removal failed",
            variant: "default",
          });
        }
      }

      toast({
        title: "Success",
        description: "Lecture deleted successfully",
      });
      
      // Determine the appropriate query key based on mode
      const queryKey = mode === 'professor' 
        ? ['professor-lectures', courseId] 
        : ['lectures', courseId];
        
      queryClient.invalidateQueries({ queryKey });
      setOpen(false);
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: "Error",
        description: "Failed to delete lecture: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="destructive" 
          size="icon" 
          className="bg-red-500/90 hover:bg-red-600/90"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-slate-900/95 backdrop-blur-md border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-white">Delete Lecture</DialogTitle>
        </DialogHeader>
        <div className="text-slate-300 mt-2">
          Are you sure you want to delete "{lectureTitle}"? This action cannot be undone.
        </div>
        <div className="flex justify-end gap-4 mt-4">
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)}
            className="bg-transparent text-white border-slate-700 hover:bg-slate-800"
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-500/90 hover:bg-red-600/90 text-white"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}


import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AIProfessorLoading from "./AIProfessorLoading";
import { FileUploadForm } from "./file-upload/FileUploadForm";
import { useLectureUpload } from "./file-upload/useLectureUpload";

interface FileUploadProps {
  courseId?: string;
  onClose: () => void;
  mode?: 'student' | 'professor';
}

const FileUpload = ({ courseId, onClose, mode = 'student' }: FileUploadProps) => {
  const {
    file,
    setFile,
    title,
    setTitle,
    isUploading,
    showAIProfessor,
    currentLectureId,
    handleUpload
  } = useLectureUpload(onClose, courseId, mode);

  if (showAIProfessor && currentLectureId && courseId) {
    return <AIProfessorLoading 
      lectureId={currentLectureId} 
      courseId={parseInt(courseId)} 
    />;
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-slate-900/95 backdrop-blur-md border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-white">Upload New Lecture</DialogTitle>
        </DialogHeader>
        
        <FileUploadForm
          title={title}
          setTitle={setTitle}
          file={file}
          setFile={setFile}
          onUpload={handleUpload}
          isUploading={isUploading}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};

export default FileUpload;


import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, BookOpen, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BackgroundGradient from "@/components/ui/BackgroundGradient";
import { useGenerateResources } from "@/hooks/useGenerateResources";
import { toast } from "@/components/ui/use-toast";
import ReactMarkdown from 'react-markdown';
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Resources = () => {
  const {
    courseId,
    lectureId
  } = useParams();
  const navigate = useNavigate();
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null);
  
  console.log('Resources page params:', {
    courseId,
    lectureId
  });

  // Parse the lecture ID from URL params
  const numericLectureId = lectureId ? parseInt(lectureId) : null;

  // Fetch only the basic segment information we need
  const {
    data: segments,
    isLoading: segmentsLoading,
    error: segmentsError
  } = useQuery({
    queryKey: ['segments-basic', numericLectureId],
    queryFn: async () => {
      if (!numericLectureId) {
        throw new Error('Invalid lecture ID');
      }
      const {
        data,
        error
      } = await supabase.from('lecture_segments').select('id, title, segment_description, lecture_id').eq('lecture_id', numericLectureId).order('sequence_number');
      if (error) {
        console.error('Error fetching segments:', error);
        throw error;
      }
      return data;
    },
    enabled: !!numericLectureId
  });

  // Get the selected segment
  const selectedSegment = selectedSegmentId && segments ? segments.find(s => s.id.toString() === selectedSegmentId) : null;

  // Get resources for the selected segment
  const {
    data: resourcesContent,
    isLoading: resourcesLoading,
    error: resourcesError
  } = useGenerateResources(selectedSegment);
  
  console.log('Selected segment:', selectedSegment);
  console.log('Resources content:', resourcesContent);
  
  if (segmentsError) {
    console.error('Error loading segments:', segmentsError);
    toast({
      title: "Error loading segments",
      description: "Please try again later",
      variant: "destructive"
    });
  }
  
  return <div className="relative min-h-screen">
      <BackgroundGradient>
        <div className="relative p-8">
          <div className="max-w-[1400px] mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <Button variant="ghost" onClick={() => navigate(`/course/${courseId}`)} className="gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white border-none">
                <ArrowLeft className="w-4 h-4" />
                Back to Lectures
              </Button>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <span className="bg-gradient-to-r from-purple-500 to-indigo-600 bg-clip-text text-transparent">
                  <BookOpen className="w-5 h-5 inline mr-1" />
                  Additional Resources
                </span>
              </h1>
            </div>

            {segmentsLoading ? <div className="flex justify-center items-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-black" />
              </div> : !segments ? <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardContent className="p-6">
                  <p className="text-center text-black/80">
                    No segments found
                  </p>
                </CardContent>
              </Card> : <div className="grid grid-cols-1 md:grid-cols-[350px,1fr] gap-8">
                {/* Left column - Segment cards */}
                <div className="space-y-4">
                  {segments.map(segment => <Card key={segment.id} className={`transition-all duration-300 bg-white/10 backdrop-blur-md border border-black/20 hover:shadow-xl hover:bg-white/20 cursor-pointer shadow-md ${selectedSegmentId === segment.id.toString() ? 'ring-2 ring-black' : ''}`} onClick={() => setSelectedSegmentId(segment.id.toString())}>
                      <CardHeader>
                        <CardTitle className="text-lg text-black">
                          {segment.title}
                        </CardTitle>
                      </CardHeader>
                    </Card>)}
                </div>

                {/* Right column - Selected segment content */}
                <div className="min-h-[calc(100vh-200px)]">
                  {!selectedSegmentId ? <div className="h-full flex items-center justify-center text-black/60">
                      Select a segment to view its resources
                    </div> : resourcesLoading ? <Card className="h-full bg-white/10 backdrop-blur-md border border-black/20 shadow-md">
                      <CardContent className="h-full flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-black" />
                      </CardContent>
                    </Card> : resourcesError ? <Card className="h-full bg-white/10 backdrop-blur-md border border-black/20 shadow-md">
                      <CardContent className="h-full flex items-center justify-center">
                        <p className="text-red-500">Error loading resources. Please try again.</p>
                      </CardContent>
                    </Card> : <Card className="bg-white/10 backdrop-blur-md border border-black/20 shadow-md">
                      <CardHeader className="border-b border-white/20">
                        <CardTitle className="text-xl text-black">
                          {selectedSegment?.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="prose prose-lg prose-slate max-w-none">
                          <ReactMarkdown components={{
                      h2: ({
                        children
                      }) => <h2 className="text-lg font-semibold text-black/80 border-b border-black/10 pb-2 mb-4">
                                  {children}
                                </h2>,
                      a: ({
                        children,
                        href
                      }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 transition-colors no-underline hover:underline">
                                  {children}
                                </a>,
                      li: ({
                        children
                      }) => <li className="mb-4 text-black/80">
                                  {children}
                                </li>
                    }}>
                            {resourcesContent}
                          </ReactMarkdown>
                        </div>
                      </CardContent>
                    </Card>}
                </div>
              </div>}
          </div>
        </div>
      </BackgroundGradient>
    </div>;
};

export default Resources;

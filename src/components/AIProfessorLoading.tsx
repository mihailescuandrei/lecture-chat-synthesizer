
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { TypeAnimation } from 'react-type-animation';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

interface Segment {
  title: string;
  sequence_number: number;
  segment_description: string;
}

interface Position {
  left: string;
  top: string;
}

interface AIProfessorLoadingProps {
  lectureId: number;
  courseId: number;
}

const titlePositions = [
  { left: '20%', top: '12%' },
  { left: '80%', top: '25%' },
  { left: '20%', top: '38%' },
  { left: '80%', top: '51%' },
  { left: '20%', top: '64%' },
  { left: '80%', top: '77%' },
  { left: '20%', top: '90%' },
  { left: '80%', top: '90%' },
];

const descriptionPositions = [
  { left: '55%', top: '12%' },
  { left: '45%', top: '25%' },
  { left: '55%', top: '38%' },
  { left: '45%', top: '51%' },
  { left: '55%', top: '64%' },
  { left: '45%', top: '77%' },
  { left: '55%', top: '90%' },
  { left: '45%', top: '90%' },
];

const getDescriptionPath = (start: Position, end: Position) => {
  const startX = parseFloat(start.left.replace('%', ''));
  const startY = parseFloat(start.top.replace('%', ''));
  const endX = parseFloat(end.left.replace('%', ''));
  const endY = parseFloat(end.top.replace('%', ''));
  
  const dx = endX - startX;
  const dy = endY - startY;
  const angle = Math.atan2(dy, dx);
  
  const titleBoxWidth = 8;
  const descBoxWidth = 12;
  
  const startPointX = startX + (titleBoxWidth * Math.cos(angle));
  const startPointY = startY + (titleBoxWidth * Math.sin(angle));
  const endPointX = endX - (descBoxWidth * Math.cos(angle));
  const endPointY = endY - (descBoxWidth * Math.sin(angle));
  
  return {
    path: `M ${startPointX} ${startPointY} L ${endPointX} ${endPointY}`,
    angle: Math.atan2(endPointY - startPointY, endPointX - startPointX) * 180 / Math.PI
  };
};

const getConnectionPath = (start: Position, end: Position) => {
  const startX = parseFloat(start.left.replace('%', ''));
  const startY = parseFloat(start.top.replace('%', '')) + 4;
  const endX = parseFloat(end.left.replace('%', ''));
  const endY = parseFloat(end.top.replace('%', '')) - 4;
  
  const dx = endX - startX;
  const dy = endY - startY;
  
  const cp1x = startX + dx * 0.1;
  const cp1y = startY + dy * 0.8;
  const cp2x = startX + dx * 0.9;
  const cp2y = startY + dy * 0.2;
  
  return `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`;
};

const AIProfessorLoading = ({ lectureId, courseId }: AIProfessorLoadingProps) => {
  const navigate = useNavigate();
  const baseDelay = 897;

  const { data, error } = useQuery({
    queryKey: ['lecture-segments', lectureId],
    queryFn: async () => {      
      const { data, error } = await supabase
        .from('lecture_segments')
        .select('title, sequence_number, segment_description')
        .eq('lecture_id', lectureId)
        .order('sequence_number');

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.log("No segments found for lecture:", lectureId);
        return [];
      }

      return data as Segment[];
    },
    refetchInterval: (query) => {
      if (!query.state.data || query.state.data.length === 0) {
        return 2000;
      }
      return false;
    },
    retry: 3,
  });

  useEffect(() => {
    if (data && data.length > 0) {
      const totalDelay = getDescriptionDelay(data.length - 1) + baseDelay;
      const timer = setTimeout(() => {
        navigate(`/course/${courseId}/lecture/${lectureId}/story/nodes`);
      }, totalDelay);
      
      return () => clearTimeout(timer);
    }
  }, [data, navigate, courseId, lectureId]);

  if (error) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-rose-600 to-red-500 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-white max-w-md mx-auto shadow-2xl">
          <h3 className="text-xl font-semibold mb-2">Error Loading Content</h3>
          <p className="opacity-90">Unable to load lecture segments. Please try again later.</p>
        </div>
      </div>
    );
  }

  const displayedSegments = data && data.length > 0 ? data.slice(0, titlePositions.length) : Array(titlePositions.length).fill({ title: '', sequence_number: 0, segment_description: '' });

  const getEmptyBoxDelay = (index: number) => index * (baseDelay * 2);
  const getConnectorDelay = (index: number) => (index * (baseDelay * 2)) + baseDelay;
  const getTitleDelay = (index: number) => (titlePositions.length * (baseDelay * 2)) + (index * baseDelay * 3);
  const getDescriptionDelay = (index: number) => {
    const lastTitleDelay = getTitleDelay(titlePositions.length - 1);
    const titleTypingDuration = baseDelay * 2;
    return lastTitleDelay + titleTypingDuration + (index * baseDelay * 2);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-emerald-600 to-teal-500">
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-emerald-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse-slow" />
        <div className="absolute top-0 right-20 w-96 h-96 bg-teal-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse-slow" />
        <div className="absolute bottom-20 left-1/3 w-96 h-96 bg-green-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse-slow" />
        
        <svg 
          className="w-full h-full absolute inset-0" 
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          viewBox="0 0 100 100"
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="6"
              markerHeight="6"
              refX="5.5"
              refY="3"
              orient="auto"
              fill="#ea384c"
            >
              <path d="M 0 0 L 6 3 L 0 6 z" />
            </marker>
          </defs>
          
          {displayedSegments.slice(0, -1).map((_, index) => (
            <path
              key={`connection-${index}`}
              d={getConnectionPath(titlePositions[index], titlePositions[index + 1])}
              className="opacity-0 animate-fade-in"
              style={{ animationDelay: `${getConnectorDelay(index)}ms` }}
              stroke="#0F172A"
              strokeOpacity="0.8"
              strokeWidth="0.5"
              strokeDasharray="2 2"
              fill="none"
            />
          ))}
          
          {displayedSegments.map((_, index) => {
            const { path } = getDescriptionPath(titlePositions[index], descriptionPositions[index]);
            return (
              <path
                key={`description-connection-${index}`}
                d={path}
                className="opacity-0 animate-fade-in"
                style={{ animationDelay: `${getDescriptionDelay(index)}ms` }}
                stroke="#ea384c"
                strokeOpacity="0.8"
                strokeWidth="0.5"
                fill="none"
                markerEnd="url(#arrowhead)"
              />
            );
          })}
        </svg>
      </div>
      
      <div className="relative z-10 min-h-screen">
        <div className="w-full flex justify-center pt-8">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
        
        <div className="absolute inset-0">
          {displayedSegments.map((segment, index) => {
            const boxDelay = getEmptyBoxDelay(index);
            const textDelay = getTitleDelay(index);
            
            return (
              <div
                key={`title-box-${index}`}
                style={{
                  position: 'absolute',
                  left: titlePositions[index].left,
                  top: titlePositions[index].top,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <div
                  className="opacity-0 animate-fade-in"
                  style={{ animationDelay: `${boxDelay}ms` }}
                >
                  <div className="min-w-[160px] h-[48px] bg-slate-900 backdrop-blur-md rounded-lg border border-white/20 hover:border-white/30 transition-colors shadow-xl hover:shadow-2xl flex items-center justify-center px-6 py-3">
                    <div 
                      className="opacity-0 animate-fade-in text-white text-sm font-medium"
                      style={{ animationDelay: `${textDelay}ms` }}
                    >
                      {segment.title}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {displayedSegments.map((segment, index) => (
            <div
              key={`description-box-${index}`}
              style={{
                position: 'absolute',
                left: descriptionPositions[index].left,
                top: descriptionPositions[index].top,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div
                className="opacity-0 animate-fade-in"
                style={{ animationDelay: `${getDescriptionDelay(index)}ms` }}
              >
                <div className="max-w-xs bg-[#ea384c] backdrop-blur-md rounded-lg border border-[#ea384c] hover:border-[#ea384c]/80 transition-colors shadow-xl hover:shadow-2xl p-4">
                  <div className="text-white text-xs">
                    {segment.segment_description}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIProfessorLoading;

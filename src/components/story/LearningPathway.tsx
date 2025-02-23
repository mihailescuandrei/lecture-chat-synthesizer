import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Lock, CheckCircle2, Circle, Star, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useParams } from "react-router-dom";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

interface LessonNode {
  id: string;
  title: string;
  type: "concept" | "quiz" | "challenge";
  difficulty: "beginner" | "intermediate" | "advanced";
  prerequisites: string[];
  points: number;
  description: string;
}

interface LearningPathwayProps {
  nodes: LessonNode[];
  completedNodes: Set<string>;
  currentNode: string | null;
  onNodeSelect: (nodeId: string) => void;
}

// Define a more specific type for our user progress payload
interface UserProgressPayload {
  new: {
    segment_number: number;
    score: number;
  };
  old: {
    segment_number: number;
    score: number;
  } | null;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
}

const LearningPathway = ({
  nodes,
  completedNodes,
  currentNode,
  onNodeSelect
}: LearningPathwayProps) => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [nodeProgress, setNodeProgress] = useState<{
    [key: string]: number;
  }>({});
  const {
    toast
  } = useToast();
  const {
    lectureId
  } = useParams();

  useEffect(() => {
    const fetchUserProgress = async () => {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user || !lectureId) return;
      const {
        data: progress
      } = await supabase.from('user_progress').select('segment_number, score').eq('user_id', user.id).eq('lecture_id', parseInt(lectureId)).order('created_at', {
        ascending: false
      });
      if (progress) {
        const progressMap: {
          [key: string]: number;
        } = {};
        progress.forEach(p => {
          progressMap[`segment_${p.segment_number}`] = p.score || 0;
        });
        setNodeProgress(progressMap);
      }
    };
    fetchUserProgress();

    // Subscribe to real-time updates with proper typing
    const channel = supabase.channel('user-progress-updates').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'user_progress',
      filter: `lecture_id=eq.${lectureId}`
    }, (payload: RealtimePostgresChangesPayload<any>) => {
      const data = payload.new as {
        segment_number: number;
        score: number;
      } | null;
      if (data && typeof data.segment_number === 'number' && typeof data.score === 'number') {
        const segmentKey = `segment_${data.segment_number}`;
        setNodeProgress(prev => ({
          ...prev,
          [segmentKey]: data.score
        }));
      }
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [lectureId]);

  const isNodeAvailable = (node: LessonNode) => {
    if (node.prerequisites.length === 0) return true;
    return node.prerequisites.every(prereq => {
      const prereqScore = nodeProgress[prereq] || 0;
      // Node is only available if the prerequisite node has been completed (score >= 10)
      return prereqScore >= 10;
    });
  };

  const getNodeStatus = (node: LessonNode) => {
    const nodeScore = nodeProgress[node.id] || 0;
    if (nodeScore >= 10) return "completed";
    if (isNodeAvailable(node)) return "available";
    return "locked";
  };

  const handleNodeClick = async (node: LessonNode) => {
    const status = getNodeStatus(node);
    if (status === "locked") {
      const prerequisiteNodes = node.prerequisites.map(prereq => {
        const prereqNode = nodes.find(n => n.id === prereq);
        return prereqNode?.title || prereq;
      });
      toast({
        title: "Node Locked",
        description: `Complete ${prerequisiteNodes.join(", ")} first to unlock this node. You need 10 XP in each prerequisite node.`,
        variant: "destructive"
      });
      return;
    }
    onNodeSelect(node.id);
  };

  return <div className="relative w-full min-h-[600px] p-8">
    <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 to-teal-500/10 rounded-lg"></div>
    
    <div className="relative">
      <div className="flex flex-col items-center space-y-6">
        {nodes.map((node, index) => {
          const status = getNodeStatus(node);
          const isActive = currentNode === node.id;
          const isHovered = hoveredNode === node.id;
          const currentScore = nodeProgress[node.id] || 0;

          return (
            <motion.div 
              key={node.id} 
              className="w-full max-w-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.button
                      onClick={() => handleNodeClick(node)}
                      onMouseEnter={() => setHoveredNode(node.id)}
                      onMouseLeave={() => setHoveredNode(null)}
                      className={cn(
                        "w-full p-4 rounded-lg shadow-lg transition-all duration-300",
                        "flex items-center justify-between",
                        "relative overflow-hidden",
                        status === "locked" 
                          ? "bg-gray-800/50 cursor-not-allowed" 
                          : "hover:scale-105 hover:shadow-xl",
                        status === "completed" 
                          ? "bg-yellow-600/30 border-2 border-yellow-400/70"
                          : "",
                        status === "available" 
                          ? "bg-yellow-500/20 border-2 border-yellow-300/50" 
                          : "",
                        isActive 
                          ? "ring-4 ring-yellow-400 ring-offset-2 ring-offset-emerald-900"
                          : ""
                      )}
                      whileHover={status !== "locked" ? { scale: 1.05 } : {}}
                      whileTap={status !== "locked" ? { scale: 0.95 } : {}}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-20"></div>
                      
                      <div className="flex items-center space-x-4">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center",
                          "transition-all duration-300",
                          status === "completed" ? "bg-yellow-500/80" : "",
                          status === "available" ? "bg-yellow-400/60" : "",
                          status === "locked" ? "bg-gray-700" : "",
                          isActive ? "ring-2 ring-yellow-400" : ""
                        )}>
                          {status === "locked" ? <Lock className="w-4 h-4 text-gray-400" /> : status === "completed" ? <CheckCircle2 className="w-4 h-4 text-emerald-900" /> : <Circle className="w-4 h-4 text-emerald-900" />}
                        </div>
                        
                        <div className="text-left">
                          <h3 className="font-semibold text-lg text-white">{node.title}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={cn(
                              "text-xs px-2 py-1 rounded-full",
                              "backdrop-blur-sm",
                              node.difficulty === "beginner" ? "bg-green-500/20 text-green-200" : "",
                              node.difficulty === "intermediate" ? "bg-yellow-500/20 text-yellow-200" : "",
                              node.difficulty === "advanced" ? "bg-red-500/20 text-red-200" : ""
                            )}>
                              {node.difficulty}
                            </span>
                            <div className="flex items-center space-x-1">
                              <motion.div 
                                className="flex items-center space-x-1"
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 0.3 }}
                                key={currentScore}
                              >
                                <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                                <span className="text-sm text-yellow-200">{currentScore}/10</span>
                              </motion.div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  </TooltipTrigger>
                  <TooltipContent 
                    side="right" 
                    className="max-w-[300px] p-4 bg-gray-900/90 border-emerald-500/20"
                  >
                    <div className="space-y-2">
                      <p className="font-semibold text-white">{node.title}</p>
                      <p className="text-sm text-yellow-200">{node.description}</p>
                      {status === "locked" && node.prerequisites.length > 0 && (
                        <div className="text-sm text-red-300">
                          <p className="font-semibold">Prerequisites:</p>
                          <ul className="list-disc list-inside">
                            {node.prerequisites.map(prereq => {
                              const prereqNode = nodes.find(n => n.id === prereq);
                              const prereqScore = nodeProgress[prereq] || 0;
                              return (
                                <li key={prereq}>
                                  {prereqNode?.title || prereq} ({prereqScore}/10 XP)
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {index < nodes.length - 1 && (
                <motion.div 
                  className="h-8 w-0.5 bg-yellow-400/50 mx-auto my-2"
                  initial={{ height: 0 }}
                  animate={{ height: 32 }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  </div>;
};

export default LearningPathway;

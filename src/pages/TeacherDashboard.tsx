import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, GraduationCap, ChevronDown, User } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
const TeacherDashboard = () => {
  const navigate = useNavigate();
  const {
    user,
    loading
  } = useAuth();
  const {
    toast
  } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);
  const handleSignOut = async () => {
    try {
      const {
        error
      } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  const switchToStudentMode = async () => {
    try {
      const {
        error
      } = await supabase.auth.updateUser({
        data: {
          account_type: 'student'
        }
      });
      if (error) throw error;
      toast({
        title: "Mode changed",
        description: "Switched to student mode successfully"
      });
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Error switching modes",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-500 to-violet-600">
      Loading...
    </div>;
  }
  return <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-500 to-violet-600">
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        
        <div className="absolute top-0 left-0 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/50 via-transparent to-transparent"></div>
      </div>

      <div className="relative p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-white">Professor Dashboard</h1>
            
            <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 border-white/20 text-white">
                  <User className="w-4 h-4" />
                  Account
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-white/95 backdrop-blur-sm z-50">
                <DropdownMenuItem onClick={switchToStudentMode} className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Switch to Student Mode</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-12">
            <Card className="group hover:shadow-2xl transition-all duration-300 cursor-pointer bg-white/10 backdrop-blur-md border-white/20 hover:scale-[1.02] hover:bg-white/20" onClick={() => navigate('/professor-courses')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white group-hover:text-white/90 font-bold">
                  <GraduationCap className="w-6 h-6" />
                  Manage Professor Courses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/80 font-extrabold">
                  View and manage all your professor courses
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>;
};
export default TeacherDashboard;
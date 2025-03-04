
export type Database = {
  public: {
    Tables: {
      segments_content: {
        Row: {
          id: number;
          lecture_id: number | null;
          sequence_number: number;
          theory_slide_1: string;
          theory_slide_2: string;
          quiz_1_type: string;
          quiz_1_question: string;
          quiz_1_options: string[] | null;
          quiz_1_correct_answer: string;
          quiz_1_explanation: string;
          quiz_2_type: string;
          quiz_2_question: string;
          quiz_2_correct_answer: boolean;
          quiz_2_explanation: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          lecture_id?: number | null;
          sequence_number: number;
          theory_slide_1?: string;
          theory_slide_2?: string;
          quiz_1_type?: string;
          quiz_1_question?: string;
          quiz_1_options?: string[] | null;
          quiz_1_correct_answer?: string;
          quiz_1_explanation?: string;
          quiz_2_type?: string;
          quiz_2_question?: string;
          quiz_2_correct_answer?: boolean;
          quiz_2_explanation?: string;
        };
      };
    };
  };
};

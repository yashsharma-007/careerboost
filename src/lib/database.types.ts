export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: 'student' | 'recruiter' | 'admin'
          bio: string | null
          skills: string[] | null
          education: Json[] | null
          work_experience: Json[] | null
          achievements: Json[] | null
          location: string | null
          website: string | null
          social_links: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'student' | 'recruiter' | 'admin'
          bio?: string | null
          skills?: string[] | null
          education?: Json[] | null
          work_experience?: Json[] | null
          achievements?: Json[] | null
          location?: string | null
          website?: string | null
          social_links?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'student' | 'recruiter' | 'admin'
          bio?: string | null
          skills?: string[] | null
          education?: Json[] | null
          work_experience?: Json[] | null
          achievements?: Json[] | null
          location?: string | null
          website?: string | null
          social_links?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      jobs: {
        Row: {
          id: string
          title: string
          company: string
          location: string
          description: string
          requirements: string[] | null
          responsibilities: string[] | null
          job_type: 'full-time' | 'part-time' | 'contract' | 'internship'
          work_mode: 'remote' | 'on-site' | 'hybrid'
          salary_range: Json | null
          skills_required: string[] | null
          experience_level: string | null
          posted_by: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          company: string
          location: string
          description: string
          requirements?: string[] | null
          responsibilities?: string[] | null
          job_type: 'full-time' | 'part-time' | 'contract' | 'internship'
          work_mode: 'remote' | 'on-site' | 'hybrid'
          salary_range?: Json | null
          skills_required?: string[] | null
          experience_level?: string | null
          posted_by?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          company?: string
          location?: string
          description?: string
          requirements?: string[] | null
          responsibilities?: string[] | null
          job_type?: 'full-time' | 'part-time' | 'contract' | 'internship'
          work_mode?: 'remote' | 'on-site' | 'hybrid'
          salary_range?: Json | null
          skills_required?: string[] | null
          experience_level?: string | null
          posted_by?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      job_applications: {
        Row: {
          id: string
          job_id: string
          user_id: string
          resume_id: string | null
          cover_letter: string | null
          status: 'applied' | 'reviewing' | 'interview' | 'rejected' | 'accepted'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          job_id: string
          user_id: string
          resume_id?: string | null
          cover_letter?: string | null
          status?: 'applied' | 'reviewing' | 'interview' | 'rejected' | 'accepted'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          job_id?: string
          user_id?: string
          resume_id?: string | null
          cover_letter?: string | null
          status?: 'applied' | 'reviewing' | 'interview' | 'rejected' | 'accepted'
          created_at?: string
          updated_at?: string
        }
      }
      job_wishlist: {
        Row: {
          id: string
          job_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          job_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          job_id?: string
          user_id?: string
          created_at?: string
        }
      }
      courses: {
        Row: {
          id: string
          title: string
          description: string
          category: string
          image_url: string | null
          instructor: string
          duration: string
          level: 'beginner' | 'intermediate' | 'advanced' | null
          skills_covered: string[] | null
          modules: Json[] | null
          created_by: string | null
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          category: string
          image_url?: string | null
          instructor: string
          duration: string
          level?: 'beginner' | 'intermediate' | 'advanced' | null
          skills_covered?: string[] | null
          modules?: Json[] | null
          created_by?: string | null
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          category?: string
          image_url?: string | null
          instructor?: string
          duration?: string
          level?: 'beginner' | 'intermediate' | 'advanced' | null
          skills_covered?: string[] | null
          modules?: Json[] | null
          created_by?: string | null
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_courses: {
        Row: {
          id: string
          user_id: string
          course_id: string
          progress: number
          completed_modules: number[] | null
          is_completed: boolean
          started_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          course_id: string
          progress?: number
          completed_modules?: number[] | null
          is_completed?: boolean
          started_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string
          progress?: number
          completed_modules?: number[] | null
          is_completed?: boolean
          started_at?: string
          completed_at?: string | null
        }
      }
      roadmaps: {
        Row: {
          id: string
          title: string
          description: string
          category: string
          image_url: string | null
          created_by: string | null
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          category: string
          image_url?: string | null
          created_by?: string | null
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          category?: string
          image_url?: string | null
          created_by?: string | null
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      roadmap_steps: {
        Row: {
          id: string
          roadmap_id: string
          title: string
          description: string
          order_index: number
          resources: Json[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          roadmap_id: string
          title: string
          description: string
          order_index: number
          resources?: Json[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          roadmap_id?: string
          title?: string
          description?: string
          order_index?: number
          resources?: Json[] | null
          created_at?: string
          updated_at?: string
        }
      }
      resumes: {
        Row: {
          id: string
          user_id: string
          title: string
          template: string
          content: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          template: string
          content: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          template?: string
          content?: Json
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          due_date: string | null
          priority: 'low' | 'medium' | 'high' | null
          status: 'pending' | 'in-progress' | 'completed'
          category: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          due_date?: string | null
          priority?: 'low' | 'medium' | 'high' | null
          status?: 'pending' | 'in-progress' | 'completed'
          category?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          due_date?: string | null
          priority?: 'low' | 'medium' | 'high' | null
          status?: 'pending' | 'in-progress' | 'completed'
          category?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      coding_contests: {
        Row: {
          id: string
          title: string
          description: string
          start_time: string
          end_time: string
          difficulty: 'easy' | 'medium' | 'hard' | null
          created_by: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          start_time: string
          end_time: string
          difficulty?: 'easy' | 'medium' | 'hard' | null
          created_by?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          start_time?: string
          end_time?: string
          difficulty?: 'easy' | 'medium' | 'hard' | null
          created_by?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      contest_problems: {
        Row: {
          id: string
          contest_id: string
          title: string
          description: string
          difficulty: 'easy' | 'medium' | 'hard' | null
          points: number
          test_cases: Json
          solution: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          contest_id: string
          title: string
          description: string
          difficulty?: 'easy' | 'medium' | 'hard' | null
          points: number
          test_cases: Json
          solution?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          contest_id?: string
          title?: string
          description?: string
          difficulty?: 'easy' | 'medium' | 'hard' | null
          points?: number
          test_cases?: Json
          solution?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      contest_submissions: {
        Row: {
          id: string
          problem_id: string
          user_id: string
          code: string
          language: string
          status: 'pending' | 'accepted' | 'wrong_answer' | 'time_limit_exceeded' | 'runtime_error'
          score: number
          execution_time: number | null
          created_at: string
        }
        Insert: {
          id?: string
          problem_id: string
          user_id: string
          code: string
          language: string
          status?: 'pending' | 'accepted' | 'wrong_answer' | 'time_limit_exceeded' | 'runtime_error'
          score?: number
          execution_time?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          problem_id?: string
          user_id?: string
          code?: string
          language?: string
          status?: 'pending' | 'accepted' | 'wrong_answer' | 'time_limit_exceeded' | 'runtime_error'
          score?: number
          execution_time?: number | null
          created_at?: string
        }
      }
      interview_questions: {
        Row: {
          id: string
          category: string
          question: string
          answer: string | null
          difficulty: 'easy' | 'medium' | 'hard' | null
          tags: string[] | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category: string
          question: string
          answer?: string | null
          difficulty?: 'easy' | 'medium' | 'hard' | null
          tags?: string[] | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category?: string
          question?: string
          answer?: string | null
          difficulty?: 'easy' | 'medium' | 'hard' | null
          tags?: string[] | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      forum_posts: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          category: string
          tags: string[] | null
          is_pinned: boolean
          view_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content: string
          category: string
          tags?: string[] | null
          is_pinned?: boolean
          view_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string
          category?: string
          tags?: string[] | null
          is_pinned?: boolean
          view_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      forum_comments: {
        Row: {
          id: string
          post_id: string
          user_id: string
          content: string
          parent_id: string | null
          is_solution: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          content: string
          parent_id?: string | null
          is_solution?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          content?: string
          parent_id?: string | null
          is_solution?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      forum_votes: {
        Row: {
          id: string
          user_id: string
          post_id: string | null
          comment_id: string | null
          vote_type: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          post_id?: string | null
          comment_id?: string | null
          vote_type: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          post_id?: string | null
          comment_id?: string | null
          vote_type?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
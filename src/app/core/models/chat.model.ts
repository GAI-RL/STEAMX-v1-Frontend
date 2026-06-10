// Figure/image data for assistant responses
export interface ChatFigure {
  image_path?: string;
  caption?: string;
  image_base64?: string;
  imageUrl?: string;
}

// A chat conversation - Updated to match new backend schema
export interface ChatSession {
  id: string;
  title: string;
  subject_id: string;      // NEW: ID of the subject (Physics, Math, etc.)
  grade_id: string;        // NEW: ID of the grade (9,10,11,12)
  total_qa_pairs: number;  // NEW: Number of Q&A pairs in this session
  status: string;          // NEW: active, archived, deleted
  created_at: string;
  updated_at: string;
}

// A single Q&A pair in chat (one row = prompt + response)
export interface ChatMessage {
  id: string;
  session_id: string;
  prompt: string;          // The user's question (was 'content' for role='user')
  response: string;        // The AI's answer (was 'content' for role='assistant')
  response_version: number; // For regenerate feature
  created_at: string;
  updated_at: string;
  figures?: ChatFigure[];   // For images in responses
}

// When user sends a message - Updated for new schema
export interface SendMessageRequest {
  session_id: string;
  prompt: string;          // Changed from 'question' to 'prompt'
}

// Backend's response - Updated for new schema
export interface SendMessageResponse {
  message_id: string;      // NEW: ID of the saved Q&A pair
  session_id: string;
  prompt: string;          // Changed from 'question' to 'prompt'
  response: string;        // Changed from 'answer' to 'response'
  response_version: number; // NEW
  created_at: string;
  figures?: ChatFigure[];
}

// For creating a new session
export interface CreateSessionRequest {
  subject_id: string;
  grade_id: string;
}

// Alias for compatibility
export type Message = ChatMessage;
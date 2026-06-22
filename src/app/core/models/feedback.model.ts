// User submits feedback
export interface Feedback {
  rating: number;
  comment: string;
}

export interface ContactFormPayload {
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  topic: string;
  institution?: string;
  subject_line?: string;
  message: string;
}

// Backend confirms receipt
export interface FeedbackResponse {
  message: string;
}
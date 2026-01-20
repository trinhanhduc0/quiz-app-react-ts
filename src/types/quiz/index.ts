import { MatchItem, MatchOption, OrderItem } from '../question';

// Define types that match the backend Go structures
export interface FillInTheBlank {
  id: string;
  correct_submission: string;
}

export interface OptionSubmission {
  id: string;
}

export interface QuestionSubmission {
  question_id: string;
  type: string;
  fill_in_the_blank?: FillInTheBlank[];
  options?: OptionSubmission[];
  match_items?: MatchItem[];
  match_option?: MatchOption[];
  order_items?: OrderItem[];
}

export interface TestSubmission {
  test_id: string;
  class_id: string;
  author_mail: string;

  question_submission: Record<string, { type: string; submission: any }>;
}

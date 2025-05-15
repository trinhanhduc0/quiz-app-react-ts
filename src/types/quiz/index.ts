import { MatchItem, MatchOption, OrderItem } from '../question';

// Define types that match the backend Go structures
export interface FillInTheBlank {
  id: string;
  correct_answer: string;
}

export interface OptionAnswer {
  id: string;
}

export interface QuestionAnswer {
  question_id: string;
  type: string;
  fill_in_the_blank?: FillInTheBlank[];
  options?: OptionAnswer[];
  match_items?: MatchItem;
  match_option?: MatchOption;
  order_items?: OrderItem;
}

export interface TestAnswer {
  test_id: string;
  class_id: string;
  author_mail: string;

  question_answer: Record<string, { type: string; answer: any }>;
}

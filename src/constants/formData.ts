import {
  FillInTheBlank,
  MatchItem,
  MatchOption,
  Metadata,
  Option,
  OrderItem,
  QuestionContent,
} from '~/types/question';

export interface QuestionFormData {
  _id: string;
  type: 'multiple_choice' | 'multi_select' | 'fill_in_the_blank' | 'match' | 'ordering' | string; // định nghĩa lại các loại câu hỏi
  score: number;
  question_content: QuestionContent;
  options: Option[]; // dùng cho multiple_choice, multi_select
  fill_in_the_blanks: FillInTheBlank[]; // chỉ dùng cho fill_in_the_blank
  order_items: OrderItem[]; // chỉ dùng cho ordering question
  match_items: MatchItem[]; // chỉ dùng cho match choice
  match_options: MatchOption[]; // chỉ dùng cho match choice
  metadata: Metadata; // bổ sung metadata (author, v.v.)
  tags: string[];
  suggestion?: string[];
  created_at?: string;
  updated_at?: string;
  correct_map?: Record<string, string> | any[];
}

export const INITIAL_FORM_DATA: QuestionFormData = {
  _id: '',
  type: 'multiple_choice',
  score: 1,
  question_content: {
    text: '',
    image_url: '',
    audio_url: '',
    video_url: '',
  },
  options: [],
  fill_in_the_blanks: [],
  order_items: [],
  match_items: [],
  match_options: [],
  metadata: {
    author: '',
  },
  tags: [],
  created_at: '',
  updated_at: '',
};

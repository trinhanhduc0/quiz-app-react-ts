import { Level } from "~/components/level/LevelComponent";
import { Topic } from "~/components/topic/TopicComponent";

export interface Question {
  _id: string;
  type?: string;
  question_content: QuestionContent;
  metadata: Metadata;
  tags?: string[];
  score?: number;
  created_at?: string; // ISO string from Go's time.Time
  updated_at?: string;
  suggestion?: string[];

  // Polymorphic fields
  options?: Option[]; // for multiple_choice
  fill_in_the_blanks?: FillInTheBlank[]; // for fill_in_the_blank
  order_items?: OrderItem[]; // for ordering_question
  match_items?: MatchItem[]; // for match_choice
  match_options?: MatchOption[]; // for match_choice
  correct_map?: Record<string, string> | any[]; // e.g. for match/map-based validation
  level?: Level | null
  topic?: Topic | null
}

export interface Text {
  text: string;
  is_math: boolean;
}

export interface Option {
  id?: string;
  text: Text;
  imageurl?: string;
  iscorrect?: boolean;
}

export interface QuestionContent {
  content: Text;
  file_url: string;
}

export interface Metadata {
  author: string;
}

export interface MultipleChoiceSubmissionOption {
  id?: string; // primitive.ObjectID
  text?: Text;
  image_url?: string;
  iscorrect?: boolean;
}

export interface FillInTheBlank {
  id?: string;
  text_before?: Text;
  text_after?: Text;

  blank?: string;
  correct_submission?: string;
}

export interface OrderItem {
  id?: string;
  text: Text;
  order?: number;
}

export interface MatchItem {
  id?: string;
  text: Text;
}

export interface MatchOption {
  id?: string;
  text: Text;
  match_id?: string;
}

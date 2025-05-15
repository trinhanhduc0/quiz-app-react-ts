export interface Question {
  _id: string;
  type?: string;
  question_content: QuestionContent;
  metadata?: Metadata;
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
}

export interface QuestionContent {
  text?: string;
  image_url?: string;
  video_url?: string;
  audio_url?: string;
}

export interface Metadata {
  author?: string;
}

export interface Option {
  id?: string; // primitive.ObjectID
  text?: string;
  image_url?: string;
  iscorrect?: boolean;
}

export interface FillInTheBlank {
  id?: string;
  text_before?: string;
  blank?: string;
  correct_answer?: string;
  text_after?: string;
}

export interface OrderItem {
  id?: string;
  text?: string;
  order?: number;
}

export interface MatchItem {
  id?: string;
  text?: string;
}

export interface MatchOption {
  id?: string;
  text?: string;
  match_id?: string;
}

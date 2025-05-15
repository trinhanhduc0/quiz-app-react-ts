import { OrderItem, MatchItem, MatchOption, FillInTheBlank, Option } from '~/types/question';

// Question types constants
export const QUESTION_TYPES = {
  SINGLE: 'single_choice_question',
  MULTIPLE: 'multiple_choice_question',
  MATCH: 'match_choice_question',
  ORDER: 'order_question',
  FILL: 'fill_in_the_blank',
  FILE: 'file_upload_question',
};

export const TYPE_STYLES = {
  [QUESTION_TYPES.ORDER]: { bgColor: 'bg-orange-500', label: 'ORDER' },
  [QUESTION_TYPES.MULTIPLE]: { bgColor: 'bg-orange-300', label: 'MULTIPLE' },
  [QUESTION_TYPES.FILL]: { bgColor: 'bg-blue-500', label: 'FILL' },
  [QUESTION_TYPES.MATCH]: { bgColor: 'bg-green-500', label: 'MATCH' },
  [QUESTION_TYPES.SINGLE]: { bgColor: 'bg-purple-500', label: 'SINGLE' },
};

export const TYPE_SPECIFIC_FIELDS = {
  [QUESTION_TYPES.SINGLE]: {
    options: [{ text: '', image_url: '', is_correct: false }] as Option[],
    metadata: {},
    suggestion: '',
  },
  [QUESTION_TYPES.MULTIPLE]: {
    options: [{ text: '', image_url: '', is_correct: false }] as Option[],
    metadata: {},
    suggestion: '',
  },
  [QUESTION_TYPES.MATCH]: {
    match_options: [] as MatchOption[],
    match_items: [] as MatchItem[],
    metadata: {},
    suggestion: '',
  },
  [QUESTION_TYPES.ORDER]: {
    options: [] as OrderItem[], // Ensure it's typed as OrderItem[]
    metadata: {},
    suggestion: '',
  },
  [QUESTION_TYPES.FILL]: {
    fill_in_the_blanks: [
      {
        id: '', // added missing id property
        text_before: '',
        blank: '_____',
        text_after: '',
        correct_answer: '',
      },
    ] as FillInTheBlank[], // Ensure it's typed as FillInTheBlank[]
    metadata: {},
    suggestion: '',
  },
  [QUESTION_TYPES.FILE]: {
    metadata: {},
    suggestion: '',
  },
};

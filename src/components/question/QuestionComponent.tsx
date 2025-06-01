import type React from 'react';
import FillInTheBlankQuestion from './fill/Fill';
import MultipleChoiceQuestion from './Multiple/Multiple';
import OrderQuestion from './Order/Order';
import SingleChoiceQuestion from './single/Single';
import { FillInTheBlank, MatchItem, MatchOption, OrderItem, Question } from '~/types/question';
import MatchQuestion from './Match/Match';
import { useEffect } from 'react';
// import MatchQuestion from './Match/Match';

export type FillInTheBlankAnswer = { [key: string]: string }; // Câu hỏi điền vào chỗ trống, ví dụ: { "67f805c2523b149f092198e8": "ngôn ngữ" }

export type MultipleChoiceAnswer = string[]; // Câu hỏi trắc nghiệm nhiều lựa chọn, chỉ lưu id của đáp án đúng

export type OrderAnswer = string[]; // Câu hỏi sắp xếp, lưu danh sách id của các lựa chọn

export type MatchAnswer = Record<string, string[] | null>; // { optionId: matchid | null }

// Định nghĩa chung cho các kiểu câu hỏi
export type Answer =
  | {
      type: 'fill_in_the_blank';
      answer: FillInTheBlankAnswer;
      id: string;
      fill_in_the_blanks: FillInTheBlank[];
    }
  | {
      type: 'single_choice_question';
      answer: MultipleChoiceAnswer;
      id: string;
      fill_in_the_blanks?: any[];
      options: any[];
    }
  | {
      type: 'multiple_choice_question';
      answer: MultipleChoiceAnswer;
      id: string;
      options?: any[];
    }
  | {
      type: 'order_question';
      answer: OrderAnswer;
      id: string;
      order_items?: OrderItem[];
    }
  | {
      type: 'match_choice_question';
      answer: MatchAnswer;
      id: string;
      match_items: MatchItem[];
      match_options: MatchOption[];
    };

// Define shared props
interface QuestionBaseProps {
  question: Question; // You can replace `any` with a proper `Question` type/interface
  author: string;
  onAnswerChange: (answer: Answer) => void;
  answer: Answer | null;
  isDone: boolean;
  showAnswer: boolean;
}

const QuestionComponent: React.FC<QuestionBaseProps> = ({
  question,
  author,
  onAnswerChange,
  answer,
  isDone,
  showAnswer,
}) => {
  const handleAnswerChange = (questionType: string, updatedAnswer: any) => {
    // Create the properly typed Answer object based on question type
    let typedAnswer: Answer;
    console.log(updatedAnswer);
    switch (questionType) {
      case 'fill_in_the_blank':
        typedAnswer = {
          type: 'fill_in_the_blank',
          answer: updatedAnswer.answer || {}, // Use the simple key-value map
          id: question._id,
          fill_in_the_blanks: updatedAnswer.fill_in_the_blank || [], // Use the array format for API
        };
        break;
      case 'multiple_choice_question':
        typedAnswer = {
          type: 'multiple_choice_question',
          answer: updatedAnswer.answer || '', // Use the simple string ID
          id: question._id,
          options: updatedAnswer.options || [], // Use the array of option objects
        };
        break;
      case 'order_question':
        typedAnswer = {
          type: 'order_question',
          answer: updatedAnswer.answer || [], // Use the array of IDs
          id: question._id,
          order_items: updatedAnswer.order_items || [], // Use the array of option objects
        };
        break;
      case 'match_choice_question':
        typedAnswer = {
          type: 'match_choice_question', // Ensure 'type' is set
          answer: updatedAnswer.answer || {}, // Use the simple key-value map
          id: question._id,
          match_items: updatedAnswer.match_items || [], // Use the array format for API
          match_options: updatedAnswer.match_options || [], // Use the array of option objects
        };
        break;
      case 'single_choice_question':
        typedAnswer = {
          type: 'single_choice_question',
          answer: updatedAnswer.answer || '', // Use the simple string ID
          id: question._id,
          options: updatedAnswer.options || [], // Use the array of option objects
        };
        break;
      default:
        console.error('Unsupported question type');
        return;
    }

    onAnswerChange(typedAnswer);
  };

  const renderQuestion = () => {
    const handleAnswerUpdate = (updatedAnswer: any) => {
      question.type && handleAnswerChange(question.type, updatedAnswer);
    };

    // Extract the answer data based on question type
    const getTypedAnswer = (type: string) => {
      if (!answer) return null;

      // Ensure answer type matches the expected type
      if (answer.type === type) {
        return answer.answer;
      }

      return null;
    };

    switch (question.type) {
      case 'fill_in_the_blank':
        return (
          <FillInTheBlankQuestion
            question={question}
            onAnswerChange={handleAnswerUpdate}
            answer={getTypedAnswer('fill_in_the_blank') as FillInTheBlankAnswer}
            isDone={isDone || showAnswer}
            showAnswer={showAnswer}
          />
        );
      case 'single_choice_question':
        return (
          <SingleChoiceQuestion
            question={question}
            onAnswerChange={handleAnswerUpdate}
            answer={getTypedAnswer('single_choice_question') as MultipleChoiceAnswer}
            author={author ?? ''}
            isDone={isDone || showAnswer}
            showAnswer={showAnswer}
          />
        );
      case 'multiple_choice_question':
        return (
          <MultipleChoiceQuestion
            question={question}
            author={author}
            onAnswerChange={handleAnswerUpdate}
            answer={getTypedAnswer('multiple_choice_question') as MultipleChoiceAnswer}
            isDone={isDone || showAnswer}
            showAnswer={showAnswer}
          />
        );
      case 'order_question':
        return (
          <OrderQuestion
            order_items={question.order_items as OrderItem[]}
            onAnswerChange={handleAnswerUpdate}
            answer={getTypedAnswer('order_question') as OrderAnswer}
            isDone={isDone || showAnswer}
            showAnswer={showAnswer}
          />
        );

      case 'match_choice_question':
        return (
          <MatchQuestion
            match_items={question.match_items as MatchItem[]}
            match_options={question.match_options as MatchOption[]}
            onAnswerChange={handleAnswerUpdate}
            answer={getTypedAnswer('match_choice_question') as MatchAnswer}
            isDone={isDone || showAnswer}
            showAnswer={showAnswer}
          />
        );
      default:
        return <div className="text-center text-red-500">Unsupported question type</div>;
    }
  };

  console.log(question, answer)

  return (
    <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl mx-auto my-4">
      <div className="bg-gray-100 p-4 rounded-lg">{renderQuestion()}</div>
    </div>
  );
};

export default QuestionComponent;

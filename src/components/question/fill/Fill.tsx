'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import type { FillInTheBlankAnswer } from '../QuestionComponent';
import { FillInTheBlank, Question } from '~/types/question';

interface FillItem {
  id: string;
  text_before: string;
  text_after: string;
  blank?: string;
  correct_answer?: string;
}

interface Props {
  question: Question;
  onAnswerChange: (answerData: any) => void;
  answer?: FillInTheBlankAnswer;
  isDone: boolean;
  showAnswer: boolean;
}

const FillInTheBlankQuestion: React.FC<Props> = ({
  question,
  onAnswerChange,
  answer,
  isDone,
  showAnswer,
}) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    const initialAnswers: Record<string, string> = {};

    // Ensure answer is properly typed
    if (answer) {
      Object.entries(answer).forEach(([id, value]) => {
        initialAnswers[id] = value || '';
      });
    }

    setAnswers(initialAnswers);
  }, [answer]);

  const handleInputChange = (id: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    console.log(answers);
    // Avoid unnecessary re-renders if the value is not changing
    if (answers[id] === value) return;

    const updatedAnswers = { ...answers, [id]: value };
    setAnswers(updatedAnswers);

    // Create fill_in_the_blank array for API format
    const fillInTheBlankArray = Object.entries(updatedAnswers).map(([key, val]) => ({
      id: key,
      correct_answer: val,
    }));

    // Notify the parent component about the change with a flat structure
    onAnswerChange({
      answer: updatedAnswers, // This is the simple key-value map for the component
      fill_in_the_blank: fillInTheBlankArray, // This is the array format for the API
    });
  };

  const calculateInputWidth = (text = '') => {
    const characterWidth = 10;
    return Math.max(80, text.length * characterWidth);
  };

  const getInputValue = (item: FillInTheBlank): string => {
    console.log(item);
    if (showAnswer) {
      return item.correct_answer || '';
    }

    if (isDone) {
      return answers[`${item.id}`] || '';
    }

    return answers[`${item.id}`] || '';
  };

  return (
    <div className="max-w-full bg-white rounded-lg shadow-lg border border-gray-300 p-4">
      <h2 className="text-xl font-bold text-blue-600 mb-4">
        Câu hỏi: {question.question_content?.text || 'Không có nội dung'}
      </h2>

      <div className="text-gray-800 lg:text-lg sm:text-sm flex flex-wrap items-center gap-2">
        {question.fill_in_the_blanks?.map((item) => (
          <span key={item.id} className="flex items-center flex-wrap">
            <span className="text-gray-700">{item.text_before}</span>
            <input
              type="text"
              placeholder={item.blank}
              value={getInputValue(item)}
              maxLength={30}
              onChange={isDone ? undefined : (e) => handleInputChange(item.id as string, e)}
              disabled={isDone}
              className="mx-1 p-1 border border-blue-300 rounded-md focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
              style={{
                minWidth: '80px',
                maxWidth: '200px',
                width: `${calculateInputWidth(getInputValue(item)) + 20}px`,
              }}
            />
            <span className="text-gray-700">{item.text_after}</span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default FillInTheBlankQuestion;

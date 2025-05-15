'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import OptionImage from '~/components/image/OptionImage';
import type { MultipleChoiceAnswer } from '../QuestionComponent';
import { Option, Question } from '~/types/question';

interface Props {
  question: Question;
  author?: string;
  onAnswerChange: (answerData: any) => void;
  answer?: MultipleChoiceAnswer;
  isDone: boolean;
  showAnswer: boolean;
}

const MultipleChoiceQuestion: React.FC<Props> = ({
  question,
  author,
  onAnswerChange,
  answer,
  isDone,
  showAnswer,
}) => {
  const [selectedValues, setSelectedValues] = useState<string[]>([]);

  const handleCheckboxChange = (optionId: string) => {
    if (isDone) return;

    const newSelectedValues = selectedValues.includes(optionId)
      ? selectedValues.filter((id) => id !== optionId)
      : [...selectedValues, optionId];

    setSelectedValues(newSelectedValues);

    // Create the options array for API format
    const options = newSelectedValues.map((id) => ({ id }));

    // For multiple choice, we'll use the first selected option as the answer
    const answerValue = newSelectedValues;

    console.log(newSelectedValues, options);
    // Notify the parent component about the change with a flat structure
    onAnswerChange({
      answer: answerValue, // This is the simple string ID
      options: options, // This is the array format for the API
    });
  };

  const isChecked = (option: Option) => {
    console.log(option);
    if (showAnswer) {
      return option.iscorrect;
    }
    return answer?.includes(option.id as string);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-xl">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        Câu hỏi: {question.question_content?.text || 'Không có nội dung'}
      </h2>

      <div className="space-y-6">
        {question.options?.map((option) => {
          const isSelected = selectedValues.includes(option.id as string);
          const isCorrect = option.iscorrect;
          const highlight =
            showAnswer && isCorrect
              ? 'border-green-500 bg-green-50'
              : !showAnswer && isSelected
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-blue-500';

          return (
            <label
              key={option.id}
              className={`flex items-center p-2 border rounded-lg transition-all duration-300 cursor-pointer ${highlight} ${
                isDone ? 'cursor-not-allowed opacity-70' : ''
              }`}
            >
              <input
                type="checkbox"
                value={option.id}
                checked={isChecked(option)}
                onChange={() => handleCheckboxChange(option.id as string)}
                disabled={isDone}
                className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-4"
              />
              <div className="flex flex-col sm:flex-row items-center w-full gap-4">
                <span className="flex-1 text-gray-800 text-lg font-medium text-center sm:text-left">
                  {option.text}
                </span>
                {option.image_url && (
                  <OptionImage
                    imageUrl={option.image_url}
                    email={author}
                    width={80}
                    className="rounded-lg shadow-sm h-24 w-24 object-cover sm:ml-4"
                  />
                )}
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default MultipleChoiceQuestion;

'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import OptionImage from '~/components/image/OptionImage';
import type { MultipleChoiceAnswer } from '../QuestionComponent';
import { Option, Question } from '~/types/question';

interface Props {
  question: Question;
  author: string;
  onAnswerChange: (answerData: any) => void;
  answer?: MultipleChoiceAnswer;
  isDone: boolean;
  showAnswer: boolean;
}

const SingleChoiceQuestion: React.FC<Props> = ({
  question,
  author,
  onAnswerChange,
  answer,
  isDone,
  showAnswer,
}) => {
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);

  useEffect(() => {
    if (answer) {
      setSelectedChoice(answer);
    } else {
      setSelectedChoice(null);
    }
  }, [answer]);

  const handleOptionChange = (optionId: string) => {
    if (isDone) return;

    setSelectedChoice(optionId);

    const options = [{ id: optionId }];

    onAnswerChange({
      answer: optionId,
      options: options,
    });
  };

  const getOptionClass = (option: Option) => {
    if (showAnswer) {
      return option.iscorrect
        ? 'border-blue-500 bg-blue-50'
        : 'border-gray-300 hover:border-blue-500';
    }

    return selectedChoice === option.id
      ? 'border-blue-500 bg-blue-50'
      : 'border-gray-300 hover:border-blue-500';
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-xl">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        Câu hỏi: {question.question_content.text}
      </h2>

      {question.question_content.image_url && (
        <div className="flex justify-center mb-6">
          <OptionImage
            imageUrl={question.question_content.image_url}
            email={author}
            width={200}
            className="rounded-lg shadow-lg"
          />
        </div>
      )}

      <div className="space-y-6">
        {question.options?.map((option) => (
          <label
            key={option.id}
            className={`flex items-center p-2 border rounded-lg transition-all duration-300 cursor-pointer ${getOptionClass(
              option,
            )} ${isDone ? 'cursor-not-allowed opacity-70' : ''}`}
          >
            <input
              type="radio"
              value={option.id}
              checked={showAnswer ? !!option.iscorrect : selectedChoice === option.id}
              onChange={() => handleOptionChange(option.id as string)}
              disabled={isDone}
              className="h-5 w-5 text-blue-600 border-gray-300 rounded-full focus:ring-blue-500 mr-4"
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
        ))}
      </div>
    </div>
  );
};

export default SingleChoiceQuestion;

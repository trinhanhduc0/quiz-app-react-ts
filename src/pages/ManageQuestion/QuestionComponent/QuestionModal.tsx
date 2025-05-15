import React, { useCallback } from 'react';
import { QUESTION_TYPES, TYPE_SPECIFIC_FIELDS } from '~/constants/questionTypes';
import FillInTheBlankEditor from './QFill';
import MatchChoiceEditor from './QMatch';
import OrderQuestionEditor from './QOrder';
import MultipleChoiceQuestionUploader from './QMultiple';
import TagsInput from './TagInput';
import { QuestionFormData } from './types';
import QuestionMultiUploader from './QMultiple';
import { FillInTheBlank, MatchItem, MatchOption } from '~/types/question';
import QuestionSingleForm, { QuestionSingleFormProps } from './QSingle';

type QuestionType = keyof typeof QUESTION_TYPES;

interface QuestionContent {
  text?: string;
  image_url?: string;
}

interface QuestionModalProps {
  isEditing: boolean;
  formData: QuestionFormData;
  setFormData: React.Dispatch<React.SetStateAction<QuestionFormData>>;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  handleCancel: () => void;
  isMobile: boolean;
  isTablet: boolean;
  isModalOpen: boolean;
  allTags: string[];
}

const QUESTION_TYPE_OPTIONS = {
  single_type: {
    type: QUESTION_TYPES.SINGLE,
    text: 'Single Choice',
  },
  multiple_type: {
    type: QUESTION_TYPES.MULTIPLE,
    text: 'Multiple Choice',
  },
  order_type: {
    type: QUESTION_TYPES.ORDER,
    text: 'Order',
  },
  fill_type: {
    type: QUESTION_TYPES.FILL,
    text: 'Fill in the blank',
  },
  match_type: {
    type: QUESTION_TYPES.MATCH,
    text: 'Match',
  },
};

const QuestionModal: React.FC<QuestionModalProps> = ({
  isEditing,
  formData,
  setFormData,
  handleSubmit,
  handleCancel,
  isMobile,
  isTablet,
}) => {
  const handleTypeChange = useCallback(
    (type: QuestionType) => {
      setFormData((prev) => {
        const updatedData = {
          ...prev,
          type,
          match_options: TYPE_SPECIFIC_FIELDS[type]?.match_options || [],
          match_items: TYPE_SPECIFIC_FIELDS[type]?.match_items || [],
          options: TYPE_SPECIFIC_FIELDS[type]?.options || [],
          fill_in_the_blanks: TYPE_SPECIFIC_FIELDS[type]?.fill_in_the_blanks || [],
        };

        // If it's an 'ORDER' question type, ensure order_items is correct
        if (type === QUESTION_TYPES.ORDER) {
          updatedData.order_items = updatedData.order_items.map((item) => ({
            ...item,
            order: item.order || 0, // Add default 'order' property if it's missing
          }));
        }
        return updatedData;
      });
    },
    [setFormData],
  );

  const updateQuestionContent = useCallback(
    (text: string) => {
      setFormData((prev) => ({
        ...prev,
        question_content: { ...prev.question_content, text },
      }));
    },
    [setFormData],
  );

  const updateQuestionImageUrl = useCallback(
    (image_url: string) => {
      setFormData((prev) => ({
        ...prev,
        question_content: { ...prev.question_content, image_url },
      }));
    },
    [setFormData],
  );

  const updateFillItems = (items: FillInTheBlank[]) => {
    setFormData((prev) => ({ ...prev, fill_in_the_blanks: items }));
    console.log(formData);
  };

  const updateScore = (score: string) => setFormData((prev) => ({ ...prev, score: Number(score) }));

  const renderEditorByType = useCallback(() => {
    switch (formData.type) {
      case QUESTION_TYPES.SINGLE: {
        const commonProps: QuestionSingleFormProps = {
          formData,
          setFormData,
          imageUrl: formData.question_content?.image_url ?? '',
          onChange: updateQuestionImageUrl,
        };
        return <QuestionSingleForm {...commonProps} />;
      }
      case QUESTION_TYPES.MULTIPLE:
        const commonProps: QuestionSingleFormProps = {
          formData,
          setFormData,
          imageUrl: formData.question_content?.image_url ?? '',
          onChange: updateQuestionImageUrl,
        };
        return <QuestionMultiUploader {...commonProps} />;
      case QUESTION_TYPES.FILL:
        return (
          <FillInTheBlankEditor
            fill_in_the_blanks={formData.fill_in_the_blanks ?? []}
            onChange={updateFillItems}
          />
        );
      case QUESTION_TYPES.ORDER:
        return (
          <OrderQuestionEditor options={formData.order_items ?? []} onChange={updateOderItems} />
        );
      case QUESTION_TYPES.MATCH:
        return (
          <MatchChoiceEditor
            match_items={formData.match_items}
            match_options={formData.match_options}
            onChangeOptions={updateMatchOptions}
            onChangeItems={updateMatchItems}
          />
        );

      default:
        return null;
    }
  }, [
    formData.type,
    formData.question_content?.image_url,
    formData.fill_in_the_blanks,
    formData.options,
    setFormData,
    updateQuestionImageUrl,
    updateFillItems,
  ]);

  const updateMatchOptions = (options: MatchOption[]) =>
    setFormData((prev) => ({ ...prev, match_options: options }));

  const updateMatchItems = (items: MatchItem[]) =>
    setFormData((prev) => ({ ...prev, match_items: items }));

  const updateOderItems = (items: any[]) =>
    setFormData((prev) => ({ ...prev, order_items: items }));

  const modalWidth = isMobile ? 'w-full' : isTablet ? 'max-w-4xl' : 'max-w-3xl';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div
        className={`relative bg-white rounded-lg shadow-lg w-full ${modalWidth} max-h-screen overflow-y-auto p-6`}
      >
        <h3 className="text-2xl font-semibold text-green-700 mb-4 text-center">
          {isEditing ? 'Chỉnh sửa câu hỏi' : 'Thêm câu hỏi mới'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Question Text */}

          <div>
            <label className="block text-sm font-medium text-gray-700">Nội dung câu hỏi</label>
            <textarea
              value={formData.question_content?.text || ''}
              onChange={(e) => updateQuestionContent(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 h-24 resize-y"
              placeholder="Nhập câu hỏi tại đây..."
              required
            />
          </div>

          {/* Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Loại câu hỏi</label>
              <select
                value={formData.type}
                onChange={(e) => handleTypeChange(e.target.value as QuestionType)}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                required
              >
                <option value="" defaultChecked>
                  Select Type
                </option>
                {Object.keys(QUESTION_TYPE_OPTIONS).map((key) => (
                  <option
                    key={key}
                    value={QUESTION_TYPE_OPTIONS[key as keyof typeof QUESTION_TYPE_OPTIONS].type}
                  >
                    {QUESTION_TYPE_OPTIONS[key as keyof typeof QUESTION_TYPE_OPTIONS].text}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Thẻ</label>
              <TagsInput formData={formData} setFormData={setFormData} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Điểm</label>
              <input
                type="number"
                min="0"
                value={formData.score}
                onChange={(e) => updateScore(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                required
              />
            </div>
          </div>

          {/* Editor theo loại */}
          {formData.type && renderEditorByType()}

          <div className="flex justify-end gap-4 pt-4 border-t border-gray-300 mt-6">
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
            >
              {isEditing ? 'Cập nhật' : 'Tạo mới'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuestionModal;

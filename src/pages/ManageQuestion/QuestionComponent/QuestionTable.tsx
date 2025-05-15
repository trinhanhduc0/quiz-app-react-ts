import React, { useState, useCallback, useMemo, FormEvent, ChangeEvent } from 'react';
import { Plus } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { useMediaQuery } from 'react-responsive';
import { createQuestion, updateQuestion, deleteQuestion } from '~/redux/question/questionSlice';

import SearchBar from './SearchBar';
import TagFilter from './TagFilter';
import QuestionList from './QuestionList';
import QuestionModal from './QuestionModal';

import { AppDispatch } from '~/redux/store';
import { FillInTheBlank, Metadata, Option, Question, QuestionContent } from '~/types/question';
import { INITIAL_FORM_DATA } from '~/constants/formData';

import { QuestionFormData } from '~/constants/formData'; // hoặc đường dẫn tương ứng
import { TestFormData } from '~/pages/ManageTest/ManageTestModal';

interface QuestionTableProps {
  questions: Question[];
  loadMore?: () => void;
  formData?: QuestionFormData;
  setFormData?: React.Dispatch<React.SetStateAction<Partial<QuestionFormData>>>;
  selectable?: boolean;
  formDataTest?: TestFormData;
  setFormDataTest?: React.Dispatch<React.SetStateAction<TestFormData>>;
}

const QuestionTable: React.FC<QuestionTableProps> = ({
  questions,
  loadMore,
  formData,
  setFormData,
  selectable = false,
  formDataTest,
  setFormDataTest,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1023 });

  const [searchText, setSearchText] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionFormData | null>(null);

  const [internalFormData, setInternalFormData] = useState<QuestionFormData>({
    ...INITIAL_FORM_DATA,
  });

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showTagFilter, setShowTagFilter] = useState<boolean>(false);

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const toggleQuestionSelection = useCallback(
    (questionId: string) => {
      const selectedIds = formDataTest?.question_ids || [];
      const updated = selectedIds.includes(questionId)
        ? selectedIds.filter((id) => id !== questionId)
        : [...selectedIds, questionId];

      setFormDataTest && setFormDataTest((prev: any) => ({
        ...prev,
        question_ids: updated,
      }));
      console.log(formDataTest);
    },
    [formDataTest?.question_ids, setFormDataTest],
  );

  const handleOpenModal = useCallback(
    (question: QuestionFormData | null = null) => {
      setIsEditing(!!question);
      setCurrentQuestion(question);
      setInternalFormData(question ? { ...question } : { ...INITIAL_FORM_DATA });
      setIsModalOpen(true);
    },
    [isModalOpen],
  );

  const handleDelete = useCallback(
    async (questionId: string) => {
      if (confirm('Are you sure you want to delete this question?')) {
        await dispatch(deleteQuestion(questionId));
      }
    },
    [dispatch],
  );

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      const action = isEditing
        ? updateQuestion({ ...internalFormData, _id: currentQuestion?._id! })
        : createQuestion(internalFormData);

      try {
        await dispatch(action);
        setIsModalOpen(false);
        setCurrentQuestion(null);
      } catch (err) {
        console.error('Error saving question:', err);
      }
    },
    [dispatch, isEditing, internalFormData, currentQuestion],
  );

  const toggleTagSelection = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }, []);

  const clearTagFilter = () => setSelectedTags([]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    questions.forEach((q) => q.tags?.forEach((tag) => tags.add(tag)));
    return Array.from(tags).sort();
  }, [questions]);

  const filteredData = useMemo(() => {
    const lowerText = searchText.toLowerCase();
    return questions.filter((q) => {
      const matchesText =
        q.question_content?.text?.toLowerCase().includes(lowerText) ||
        q.tags?.some((tag) => tag.toLowerCase().includes(lowerText));
      const matchesTags =
        selectedTags.length === 0 || q.tags?.some((tag) => selectedTags.includes(tag));
      return matchesText && matchesTags;
    });
  }, [questions, searchText, selectedTags]);

  return (
    <div className="space-y-4">
      <div className="flex gap-4 flex-col sm:flex-row justify-between">
        <SearchBar
          searchText={searchText}
          handleSearch={handleSearch}
          showTagFilter={showTagFilter}
          setShowTagFilter={setShowTagFilter}
          selectedTags={selectedTags}
        />
        {loadMore && (
          <div className="flex justify-center mt-4">
            <button
              onClick={loadMore}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
            >
              Load More
            </button>
          </div>
        )}
      </div>

      {showTagFilter && (
        <TagFilter
          allTags={allTags}
          selectedTags={selectedTags}
          toggleTagSelection={toggleTagSelection}
          clearTagFilter={clearTagFilter}
          setShowTagFilter={setShowTagFilter}
        />
      )}

      {selectedTags.length > 0 && !showTagFilter && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-500">Filtered by:</span>
          {selectedTags.map((tag) => (
            <div
              key={tag}
              className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs flex items-center gap-1"
            >
              #{tag}
              <button onClick={() => toggleTagSelection(tag)} className="hover:text-blue-600">
                ×
              </button>
            </div>
          ))}
          <button onClick={clearTagFilter} className="text-xs text-blue-600 hover:text-blue-800">
            Clear all
          </button>
        </div>
      )}

      <div className="flex justify-between mb-6">
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          <Plus className="h-5 w-5" /> Add Question
        </button>
      </div>

      <QuestionList
        filteredData={filteredData}
        questions={questions}
        handleOpenModalQuestion={handleOpenModal}
        handleDelete={handleDelete}
        toggleTagSelection={toggleTagSelection}
        selectedTags={selectedTags}
        selectable={selectable}
        selectedQuestionIds={formDataTest?.question_ids || []}
        toggleQuestionSelection={toggleQuestionSelection}
      />

      {isModalOpen && (
        <QuestionModal
          isModalOpen={isModalOpen}
          isEditing={isEditing}
          formData={internalFormData}
          setFormData={setInternalFormData}
          handleSubmit={handleSubmit}
          handleCancel={() => setIsModalOpen(false)}
          isMobile={isMobile}
          isTablet={isTablet}
          allTags={allTags}
        />
      )}
    </div>
  );
};

export default QuestionTable;

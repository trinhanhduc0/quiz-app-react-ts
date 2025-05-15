import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTests, createTest, saveTest, deleteTest } from '~/redux/test/testSlice';
import { fetchQuestions, incrementPage } from '~/redux/question/questionSlice';
import { RootState, AppDispatch } from '~/redux/store'; // cần import types store

import { Plus, Trash2, Filter, X, Check } from 'lucide-react';
import { NavigateFunction, useNavigate } from 'react-router-dom';

import TestTable from './TestTable';
import TagFilterComponent from './components/TagFilterComponent';
import ManageTestModal, { TestFormData } from './ManageTestModal';

// Các type cần định nghĩa
interface TestType {
  _id: string;
  test_name: string;
  descript?: string;
  duration_minutes: number;
  start_time?: string;
  end_time?: string;
  is_test: boolean;
  tags: string[];
  question_ids: string[];
  allowed_users: string[];
}

interface QuestionType {
  _id: string;
  content: string;
  [key: string]: any;
}

const initValue: TestFormData = {
  _id: '',
  test_name: '',
  descript: '',
  duration_minutes: 0,
  start_time: '',
  end_time: '',
  is_test: false,
  tags: [],
  question_ids: [],
};

function ManageTest() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate: NavigateFunction = useNavigate();

  const { questionsByPage, hasMoreQuestions, statusQuestion, errorQuestion } = useSelector(
    (state: RootState) => state.questions,
  );
  const { allTests, status, error } = useSelector((state: RootState) => state.tests);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [activeTagFilters, setActiveTagFilters] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('test-info');
  const [formData, setFormData] = useState<TestFormData>(initValue);

  const availableTags = useMemo(() => {
    if (!allTests) return [];
    const tagSet = new Set<string>();
    allTests.forEach((test) => {
      if (Array.isArray(test.tags)) {
        test.tags.forEach((tag) => tagSet.add(tag));
      }
    });
    return Array.from(tagSet);
  }, [allTests]);

  const filteredTests = useMemo(() => {
    if (!allTests) return [];
    if (activeTagFilters.length === 0) return allTests;

    return allTests.filter((test) => {
      if (!Array.isArray(test.tags)) return false;
      return activeTagFilters.some((filterTag) => test.tags.includes(filterTag));
    });
  }, [allTests, activeTagFilters]);

  const fetchData = useCallback(async () => {
    try {
      await dispatch(fetchTests({ navigate }));
      await dispatch(fetchQuestions({ navigate }));
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to fetch data');
    }
  }, [dispatch, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  const handleOpenModal = (testData: TestFormData | null = null) => {
    setIsEditing(!!testData);
    if (testData) {
      setFormData({
        ...testData,
        start_time: testData.start_time || '',
        end_time: testData.end_time || '',
      });
    } else {
      setFormData({ ...initValue, _id: '' });
    }
    setActiveTab('test-info');
    setIsModalOpen(true);
  };

  const handleCancel = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!formData.test_name || formData.duration_minutes <= 0) {
      alert('Please fill in all required fields.');
      return;
    }

    const values: TestFormData = {
      ...formData,
      start_time: formData.start_time ? new Date(formData.start_time).toISOString() : '',
      end_time: formData.end_time ? new Date(formData.end_time).toISOString() : '',
    };

    try {
      if (isEditing) {
        await dispatch(saveTest({ values, navigate }));
        alert('Test updated successfully!');
      } else {
        await dispatch(createTest({ values, navigate }));
        alert('Test created successfully!');
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving test:', error);
      alert('Error saving test');
    }
  }, [dispatch, isEditing, formData, navigate]);

  const handleDelete = useCallback(
    (testId: string) => {
      if (window.confirm('Are you sure you want to delete this test?')) {
        dispatch(deleteTest({ _id: testId, navigate }))
          .then(() => alert('Test deleted successfully!'))
          .catch(() => alert('Error deleting test!'));
        setIsModalOpen(false);
      }
    },
    [dispatch, navigate],
  );

  const handleTagFilter = useCallback((tag: string) => {
    setActiveTagFilters((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }, []);

  const clearAllFilters = useCallback(() => {
    setActiveTagFilters([]);
  }, []);

  const loadMore = useCallback(async () => {
    if (hasMoreQuestions && statusQuestion !== 'loading') {
      await dispatch(incrementPage());
      await dispatch(fetchQuestions({ navigate }));
    }
  }, [hasMoreQuestions, statusQuestion, dispatch, navigate]);

  const toggleFilterPanel = () => {
    setIsFilterOpen((prev) => !prev);
  };

  if (status === 'loading') return <div className="text-center p-4">Loading...</div>;
  if (status === 'failed')
    return <div className="text-center p-4 text-red-500">Error: {error}</div>;
  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-4 border-b-4 border-blue-500 pb-2">
        Manage Tests
      </h2>

      {/* Filter section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            <button
              onClick={toggleFilterPanel}
              className="flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-2 rounded hover:bg-blue-100 transition"
            >
              <Filter className="h-4 w-4" />
              {isFilterOpen ? 'Hide Filters' : 'Show Filters'}
            </button>

            {activeTagFilters.length > 0 && (
              <button
                onClick={clearAllFilters}
                className="ml-2 flex items-center gap-1 text-sm text-gray-500 hover:text-red-500"
              >
                <X className="h-3 w-3" /> Clear all filters
              </button>
            )}
          </div>

          <div className="flex justify-between mb-6">
            <button
              onClick={() => handleOpenModal(null)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
            >
              <Plus className="h-5 w-5" /> Add Test
            </button>
          </div>
        </div>

        {isFilterOpen && (
          <TagFilterComponent
            availableTags={availableTags}
            activeTagFilters={activeTagFilters}
            onTagClick={handleTagFilter}
          />
        )}
      </div>

      <TestTable tests={filteredTests} onEdit={handleOpenModal} onFilterByTag={handleTagFilter} />

      {isModalOpen && (
        <ManageTestModal
          isEditing={isEditing}
          onClose={handleCancel}
          onSubmit={handleSubmit}
          onDelete={handleDelete}
          formData={formData}
          setFormData={setFormData}
          questions={questionsByPage}
          loadMore={loadMore}
          selectable={false}
        />
      )}
    </div>
  );
}

export default ManageTest;

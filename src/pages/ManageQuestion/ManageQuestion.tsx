import React, { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchQuestions, incrementPage } from '~/redux/question/questionSlice';
import QuestionTable from './QuestionComponent/QuestionTable';
import { AppDispatch, RootState } from '~/redux/store';

const ManageQuestion: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { questionsByPage, hasMoreQuestions, statusQuestion, errorQuestion } = useSelector(
    (state: RootState) => state.questions,
  );

  useEffect(() => {
    dispatch(fetchQuestions({ navigate }));
  }, [dispatch, navigate]);

  const loadMore = useCallback(async () => {
    if (hasMoreQuestions && statusQuestion !== 'loading') {
      await dispatch(incrementPage());
      await dispatch(fetchQuestions({ navigate }));
    }
  }, [dispatch, hasMoreQuestions, statusQuestion, navigate]);

  const renderContent = () => {
    if (statusQuestion === 'loading') {
      return <p className="text-center text-gray-500 py-6">Loading questions...</p>;
    }

    if (statusQuestion === 'failed') {
      return (
        <p className="text-center text-red-500 py-6">Failed to load questions: {errorQuestion}</p>
      );
    }

    return <QuestionTable questions={Object.values(questionsByPage).flat()}  />;
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-4 border-b-4 border-blue-600 pb-2">
          Manage Questions
        </h2>
        {renderContent()}
      </div>
    </div>
  );
};

export default ManageQuestion;

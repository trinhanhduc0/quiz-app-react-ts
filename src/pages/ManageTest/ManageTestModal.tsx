import React, { useState } from 'react';
import { X, Trash2, Check } from 'lucide-react';
import TestInfoForm from './components/TestInfoForm';
import TestTagsToggle from './components/TestTagsToggle';
import TestScheduleForm from './components/TestScheduleForm';
import QuestionTable from '../ManageQuestion/QuestionComponent/QuestionTable';

// Type định nghĩa cho dữ liệu bài test
export interface TestFormData {
  _id: string;
  test_name: string;
  descript: string;
  duration_minutes: number;
  start_time: string;
  end_time: string;
  is_test: boolean;
  tags: string[];
  question_ids: string[];
}

// Props riêng cho SelectableQuestionTable
interface SelectableQuestionTableProps {
  questions: Record<string, any[]>;
  loadMore: () => void;
  formData: TestFormData;
  setFormData: React.Dispatch<React.SetStateAction<TestFormData>>;
  selectable?: boolean;
}

const SelectableQuestionTable: React.FC<SelectableQuestionTableProps> = ({
  questions,
  loadMore,
  formData,
  setFormData,
  selectable,
}) => {
  return (
    <QuestionTable
      questions={Object.values(questions).flat() || []}
      loadMore={loadMore}
      formDataTest={formData}
      setFormDataTest={setFormData}
      selectable={selectable}
    />
  );
};

// Props cho component chính
interface ManageTestModalProps {
  isEditing: boolean;
  onClose: () => void;
  onSubmit: () => void;
  onDelete: (id: string) => void;
  formData: TestFormData;
  setFormData: React.Dispatch<React.SetStateAction<TestFormData>>;
  questions: Record<string, any[]>; // You can replace `any` with your `Question` type
  loadMore: () => void;
  selectable?: boolean;
}

const ManageTestModal: React.FC<ManageTestModalProps> = ({
  isEditing,
  onClose,
  onSubmit,
  onDelete,
  formData,
  setFormData,
  questions,
  loadMore,
  selectable,
}) => {
  console.log(typeof setFormData);
  const [activeTab, setActiveTab] = useState<string>('test-info');
  console.log(formData);
  const tabs = [
    { id: 'test-info', label: 'Test Info' },
    { id: 'schedule', label: 'Schedule' },
    { id: 'tags', label: 'Tags' },
    { id: 'questions', label: 'Questions' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="fixed bottom-0 bg-white rounded-t-lg w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-b">
          <h3 className="text-lg font-semibold text-gray-800">
            {isEditing ? 'Edit Test' : 'Add Test'}
          </h3>
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b overflow-x-auto h-[80px]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`px-4 py-3 font-medium text-sm flex-shrink-0 transition-colors focus:outline-none ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-4 flex-grow">
          {activeTab === 'test-info' && (
            <TestInfoForm formData={formData} setFormData={setFormData} />
          )}
          {activeTab === 'schedule' && (
            <TestScheduleForm formData={formData} setFormData={setFormData} />
          )}
          {activeTab === 'tags' && <TestTagsToggle formData={formData} setFormData={setFormData} />}
          {activeTab === 'questions' && (
            <SelectableQuestionTable
              questions={questions}
              loadMore={loadMore}
              formData={formData}
              setFormData={setFormData}
              selectable={selectable}
            />
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-4 py-3 flex justify-between items-center border-t">
          {isEditing && formData._id && (
            <button
              onClick={() => onDelete(formData._id)}
              className="flex items-center gap-1 text-red-600 hover:text-red-800 text-sm"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          )}
          <button
            onClick={onSubmit}
            className="ml-auto bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
          >
            <Check className="h-4 w-4" />
            {isEditing ? 'Update Test' : 'Create Test'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageTestModal;

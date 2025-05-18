import React, { useState, useEffect, useCallback, FormEvent, ChangeEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  fetchClasses,
  createClass,
  saveClass,
  deleteClass,
  createCode,
} from '~/redux/class/classSlice';
import ClassList from './DataTable/Datatable';
import ClassCodeComponent from './ClassCodeComponent';
import TestManagement from './TestManager/TestManager';
import { X } from 'lucide-react';
import type { RootState, AppDispatch } from '~/redux/store';
import { TestFormData } from '../ManageTest/ManageTestModal';

interface Code {
  _id?: string;
  minute?: number;
  test_id?: string;
}

export interface ClassFormData {
  _id?: string;
  class_name: string;
  is_public: boolean;
  tags: string[];
  test_id: string[];
  students_accept: string[];
  students_wait: string[];
  test: TestFormData[];
}

const defaultCode: Code = {
  _id: '',
  minute: 0,
  test_id: '',
};

const defaultFormData: ClassFormData = {
  class_name: '',
  is_public: false,
  tags: [],
  test_id: [],
  students_accept: [],
  students_wait: [],
  test: [],
};

function ManageClass() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [, forceUpdate] = useState({});

  const { allClass, status, error } = useSelector((state: RootState) => state.classes);

  const [newStudent, setNewStudent] = useState<string>('');
  const [allTest, setAllTest] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('class-info');

  const [formData, setFormData] = useState<ClassFormData>(defaultFormData);

  useEffect(() => {
    fetchData();
  }, [dispatch]);

  const fetchData = useCallback(async () => {
    const res = await dispatch(fetchClasses({ navigate }));
  }, []);

  const handleCreateCode = useCallback(
    async (_id: string, minute: number, test_id: string) => {
      try {
        const response = await createCode({ _id, minute, test_id });
        console.log('Generated code:', response);
      } catch (error) {
        console.error('Failed to generate code:', error);
      }
    },
    [dispatch],
  );

  const handleAddClass = useCallback(() => {
    setIsEditing(false);
    setFormData(defaultFormData);
    setIsModalOpen(true);
  }, []);

  const handleEditClass = useCallback((classData: ClassFormData) => {
    setIsEditing(true);
    setFormData({
      ...classData,
      students_accept: classData.students_accept || [],
      students_wait: classData.students_wait || [],
    });
    setIsModalOpen(true);
  }, []);

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      try {
        const action = isEditing ? saveClass : createClass;
        console.log(formData);
        await dispatch(action({ values: formData }));
        alert(isEditing ? 'Class updated successfully!' : 'Class created successfully!');
        setIsModalOpen(false);
      } catch (error) {
        console.error('Error saving class:', error);
        alert('Error saving class');
      }
    },
    [dispatch, isEditing, formData],
  );

  const handleDelete = useCallback(
    async (values: { _id?: string }) => {
      if (!values._id) return;

      const confirm = window.confirm(
        'Are you sure you want to delete this class? This action cannot be undone.',
      );
      if (!confirm) return;

      try {
        await dispatch(deleteClass({ _id: values._id })).unwrap();
        alert('Class deleted successfully!');
      } catch (error) {
        console.error('Error deleting class:', error);
        alert('Error deleting class!');
      } finally {
        setIsModalOpen(false);
      }
    },
    [dispatch],
  );

  const updateStudentList = useCallback(
    (email: string, fromList: keyof ClassFormData, toList: keyof ClassFormData) => {
      setFormData((prev) => ({
        ...prev,
        [fromList]: (prev[fromList] as string[]).filter((e) => e !== email),
        [toList]: [...new Set([...(prev[toList] as string[]), email])],
      }));
      forceUpdate({});
    },
    [],
  );

  const handleApproveStudent = useCallback(
    (email: string) => updateStudentList(email, 'students_wait', 'students_accept'),
    [updateStudentList],
  );

  const handleRemoveAcceptedStudent = useCallback(
    (email: string) => updateStudentList(email, 'students_accept', 'students_wait'),
    [updateStudentList],
  );

  const handleAddStudent = useCallback(() => {
    const email = newStudent.trim();
    if (email && !formData.students_accept.includes(email)) {
      setFormData((prev) => ({
        ...prev,
        students_accept: [...prev.students_accept, email],
      }));
      setNewStudent('');
    } else if (email) {
      alert('Student already exists in the accepted list.');
    }
  }, [newStudent, formData.students_accept]);

  const setTestIds = useCallback((testIds: string[]) => {
    setFormData((prev) => ({ ...prev, test_id: testIds }));
  }, []);

  if (status === 'loading') return <p className="text-center">Loading...</p>;
  if (status === 'failed') return <p className="text-center text-red-600">Error: {error}</p>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-semibold text-gray-800  border-b-2 border-indigo-500 pb-2 mb-6">
        Manage Class
      </h2>

      {allClass && allClass.length !== 0 && <ClassList data={allClass} onClick={handleEditClass} />}

      <div className="mt-4">
        <button
          onClick={handleAddClass}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-all duration-200 flex items-center gap-2"
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          Add Class
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 h-auto">
          <div className="absolute bottom-0 bg-white rounded-lg w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-around border-b border-gray-300 sticky top-0 bg-white z-10">
              {['class-info', 'tests', 'students'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm font-medium ${
                    activeTab === tab
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-700 border-b-2 border-transparent hover:border-gray-300'
                  }`}
                >
                  {tab.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 align-text-bottom"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4">
              {activeTab === 'class-info' && (
                <div className="space-y-4">
                  {isEditing && (
                    <ClassCodeComponent _id={formData._id ?? ''} test_id={formData.test_id ?? ''} />
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Class Name</label>
                    <input
                      type="text"
                      value={formData.class_name}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setFormData({ ...formData, class_name: e.target.value })
                      }
                      placeholder="Enter class name"
                      required
                      maxLength={30}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Public</label>
                    <input
                      type="checkbox"
                      checked={formData.is_public}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setFormData({
                          ...formData,
                          is_public: e.target.checked,
                        })
                      }
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'tests' && (
                <TestManagement formData={formData} setFormData={setFormData} navigate={navigate} />
              )}

              {activeTab === 'students' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Accepted Students
                    </label>
                    <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                      {formData.students_accept.map((email) => (
                        <div
                          key={email}
                          className="flex justify-between items-center p-2 bg-gray-100 rounded-md"
                        >
                          <span>{email}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveAcceptedStudent(email)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Waiting Students
                    </label>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {formData.students_wait.map((email) => (
                        <div
                          key={email}
                          className="flex justify-between items-center p-2 bg-gray-100 rounded-md"
                        >
                          <span>{email}</span>
                          <button
                            type="button"
                            onClick={() => handleApproveStudent(email)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Approve
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-around gap-2 border-t pt-4 sticky bottom-0 bg-white py-5">
              {isEditing && (
                <button
                  type="button"
                  onClick={() => handleDelete({ _id: formData._id })}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
                >
                  Delete
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageClass;

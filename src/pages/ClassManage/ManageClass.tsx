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
import ClassList from './DataTable/ClassList';
import ClassCodeComponent from './ClassCodeComponent';
import TestManagement from './TestManager/TestManager';
import { Check, CirclePlus, FileText, Info, Tag, Tags, Trash, Users, X } from 'lucide-react';
import type { RootState, AppDispatch } from '~/redux/store';
import { TestFormData } from '../TestManage/ManageTestModal';
import { toast } from 'react-toastify';
import ManageClassList from './DataTable/ManageClassList';
import TagManagement from './component/TagManagement';
import { ClassTabs } from './component/ClassTab';
import { useTranslation } from 'react-i18next';

interface Code {
  _id?: string;
  minute?: number;
  test_id?: string;
}

export interface StudentInfo {
  email_id: string;
  email: string;
}

export interface ClassFormData {
  _id?: string;
  class_name: string;
  is_public: boolean;
  tags: string[];
  test_id: string[];
  students_accept: StudentInfo[];
  students_wait: StudentInfo[];
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
  const { t } = useTranslation();
  const [, forceUpdate] = useState({});

  const { allClass, status, error } = useSelector((state: RootState) => state.classes);

  const [newStudent, setNewStudent] = useState<string>('');
  const [allTest, setAllTest] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formData, setFormData] = useState<ClassFormData>(defaultFormData);
  const [activeTab, setActiveTab] = useState<
    'class-info' | 'tests' | 'tags' | 'students'
  >('class-info');



  const TAB_CONFIG = {
    'class-info': {
      icon: <Info size={18} />,
      label: t('manageClass.class_info'),
    },
    tests: {
      icon: <FileText size={18} />,
      label: t('manageClass.tests'),
    },
    tags: {
      icon: <Tag size={18} />,
      label: t('manageClass.tags'),
    },
    students: {
      icon: <Users size={18} />,
      label: t('manageClass.students'),
    },
  } as const;
  type TabKey = keyof typeof TAB_CONFIG;


  {
    <ClassTabs
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      formData={formData}
    />
  }



  useEffect(() => {
    fetchData();
  }, [dispatch]);

  const fetchData = useCallback(async () => {
    await dispatch(fetchClasses({ navigate }));
  }, []);


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
        await dispatch(action({ values: formData })).unwrap();
        toast.success(isEditing ? t('success') : t('manageClass.add_class') + ' ' + t('success'));
        setIsModalOpen(false);
      } catch (error) {
        console.error('Lỗi khi lưu lớp học:', error);
        toast.error(t('error'));
      }
    },
    [dispatch, isEditing, formData, t],
  );

  const handleDelete = useCallback(
    async (values: { _id?: string }) => {
      if (!values._id) return;
      const confirmed = window.confirm(t('confirm_.delete_class'));
      if (!confirmed) return;

      try {
        await dispatch(deleteClass({ _id: values._id })).unwrap();
        toast.success(t('delete') + ' ' + t('success'));
      } catch (error) {
        console.error('Lỗi khi xóa lớp học:', error);
        toast.error(t('error'));
      } finally {
        setIsModalOpen(false);
      }
    },
    [dispatch, t],
  );

  const updateStudentList = useCallback(
    (
      student: StudentInfo,
      fromList: 'students_wait' | 'students_accept',
      toList: 'students_wait' | 'students_accept',
    ) => {
      setFormData((prev) => {
        const from = prev[fromList];
        const to = prev[toList];

        return {
          ...prev,
          [fromList]: from.filter((s) => s.email !== student.email),
          [toList]: to.some((s) => s.email === student.email)
            ? to
            : [...to, student],
        };
      });
    },
    [],
  );


  const handleApproveStudent = useCallback(
    (student: StudentInfo) =>
      updateStudentList(student, 'students_wait', 'students_accept'),
    [updateStudentList],
  );

  const handleRemoveAcceptedStudent = useCallback(
    (student: StudentInfo) =>
      updateStudentList(student, 'students_accept', 'students_wait'),
    [updateStudentList],
  );
  const handleAddStudent = useCallback(() => {
    const email = newStudent.trim();
    if (!email) return;

    const exists = formData.students_accept.some(
      (s) => s.email === email,
    );

    if (exists) {
      toast.warning(t('error'));
      return;
    }

    const newStudentInfo: StudentInfo = {
      email,
      email_id: crypto.randomUUID(), // hoặc '' nếu backend generate
    };

    setFormData((prev) => ({
      ...prev,
      students_accept: [...prev.students_accept, newStudentInfo],
    }));

    setNewStudent('');
  }, [newStudent, formData.students_accept, t]);

  if (status === 'loading') return <p className="text-center">{t('loading')}</p>;
  if (status === 'failed') return <p className="text-center text-red-600">{t('error')}: {error}</p>;

  return (
    <div className="max-w-5xl mx-auto p-6">


      {allClass?.length > 0 && <ManageClassList data={allClass} onClick={handleEditClass} />}

      <div className="mt-4">
        <button
          onClick={handleAddClass}
          className="text-black px-4 py-2 rounded-md hover:bg-blue-700 hover:text-white flex items-center gap-2"
        >

          <CirclePlus />
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50 p-4">
          <div className="relative bg-white rounded-lg w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-around border-b border-gray-300 sticky top-0 bg-white z-10">
              <ClassTabs
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                formData={formData}
              />
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 p-2"
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
                    <label className="block text-sm font-medium text-gray-700">{t('manageClass.class_name')}</label>
                    <input
                      type="text"
                      value={formData.class_name}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, class_name: e.target.value }))
                      }
                      maxLength={30}
                      placeholder={t('manageClass.enter_class_name')}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">{t('manageClass.public')}</label>
                    <input
                      type="checkbox"
                      checked={formData.is_public}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, is_public: e.target.checked }))
                      }
                      className="h-4 w-4"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'tests' && (
                <TestManagement formData={formData} setFormData={setFormData} navigate={navigate} />
              )}

              {activeTab === "tags" && (
                <TagManagement
                  tags={formData.tags}
                  onAddTag={(tag) =>
                    setFormData((prev) => ({
                      ...prev,
                      tags: prev.tags.includes(tag)
                        ? prev.tags
                        : [...prev.tags, tag],
                    }))
                  }
                  onRemoveTag={(tag) =>
                    setFormData((prev) => ({
                      ...prev,
                      tags: prev.tags.filter((t) => t !== tag),
                    }))
                  }
                />
              )}


              {activeTab === 'students' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      {t('manageClass.accepted_students')}
                    </label>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {formData.students_accept.map((student) => (
                        <div
                          key={student.email_id}
                          className="flex justify-between items-center p-2 bg-gray-100 rounded-md"
                        >
                          <span>{student.email}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveAcceptedStudent(student)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            {t('manageClass.remove')}
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 flex gap-2">
                      <input
                        type="email"
                        value={newStudent}
                        onChange={(e) => setNewStudent(e.target.value)}
                        placeholder={t('manageClass.enter_email')}
                        className="flex-1 p-2 border border-gray-300 rounded-md"
                      />
                      <button
                        type="button"
                        onClick={handleAddStudent}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md"
                      >
                        {t('manageClass.add')}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      {t('manageClass.waiting_students')}
                    </label>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {formData.students_wait.map((student) => (
                        <div
                          key={student.email_id}
                          className="flex justify-between items-center p-2 bg-gray-100 rounded-md"
                        >
                          <span>{student.email}</span>
                          <button
                            type="button"
                            onClick={() => handleApproveStudent(student)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            {t('manageClass.approve')}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 p-4 border-t bg-white sticky bottom-0">
              {isEditing && (
                <button
                  type="button"
                  onClick={() => handleDelete({ _id: formData._id })}
                  className="bg-red-600 text-white px-4 py-2 rounded-md"
                >
                  <Trash />
                </button>
              )}
              <button
                type="submit"
                onClick={handleSubmit}
                className="bg-blue-600 text-white px-4 py-2 rounded-md"
              >
                <Check className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageClass;

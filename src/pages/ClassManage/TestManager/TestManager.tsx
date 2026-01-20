import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ManageTestModal, { TestFormData, UserSubmit } from '../../TestManage/ManageTestModal';
import { fetchTests, createTest, deleteTest, saveTest, resetTest } from '~/redux/test/testSlice';
import { fetchQuestions, incrementPage } from '~/redux/question/questionSlice';
import { generateObjectId } from '~/utils/objectId';
import { RootState, AppDispatch } from '~/redux/store'; // đảm bảo bạn có các định nghĩa này
import { NavigateFunction } from 'react-router-dom';
import { ClassFormData } from '../ManageClass';
import { toast } from 'react-toastify';
import UserSubmitComponent from './UserSubmitComponent';
import { CirclePlus, RefreshCcwDot } from 'lucide-react';
import { apiCallPost } from '~/services/apiCallService';
import API_ENDPOINTS from '~/config';

interface Test {
  _id: string;
  test_name: string;
  descript: string;
  duration_minutes: number;
  start_time: string;
  end_time: string;
  is_test: boolean;
  tags: string[];
  question_ids: string[];
  user_submit: UserSubmit[]
}

interface Props {
  formData: ClassFormData;
  setFormData: React.Dispatch<React.SetStateAction<ClassFormData>>;
  navigate: NavigateFunction;
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
  matrix_exam: [],
  test_score: 0,
  user_submit: [],
};

export default function TestManagement({ formData, setFormData, navigate }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const { allTests } = useSelector((state: RootState) => state.tests);
  const { questionsByPage, hasMoreQuestions, statusQuestion } = useSelector(
    (state: RootState) => state.questions,
  );
  const [formTestData, setFormTestData] = useState<TestFormData>(initValue);
  const [selectedTestForSubmit, setSelectedTestForSubmit] =
    useState<TestFormData | null>(null);

  const [cachedTests, setCachedTests] = useState<Test[]>([]);
  const [isTestSelected, setIsTestSelected] = useState(false);
  const [selectedTag, setSelectedTag] = useState('');
  const [isOpenTestModel, setIsOpenTestModel] = useState(false);
  const [isOpenUserSubmit, setIsOpenUserSubmit] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [userSubmit, setUserSubmit] = useState(false);
  const tags: string[] = [
    ...new Set([
      ...allTests.flatMap((test) => test.tags || []),
      ...(formData.test ?? []).flatMap((test) => test.tags || []),
    ]),
  ].filter(Boolean);

  const handleOpenUserSubmit = (test: TestFormData) => {
    setSelectedTestForSubmit(test);
    setIsOpenUserSubmit(true);
  };
  const handleShowSubmission = (test: TestFormData) => {
    setFormData((prev) => ({
      ...prev,
      test: prev.test.map((t) =>
        t._id === test._id
          ? {
            ...t,
            is_test: !t.is_test, // 👈 chỉnh phần bạn cần
          }
          : t
      ),
    }))
  }

  const handleSynchronous = async (test: TestFormData) => {
    const data = { test_id: test._id, class_id: formData._id }
    await apiCallPost(API_ENDPOINTS.RESET_TEST, data, navigate)
    toast.success("Đã đồng bộ dữ liệu bài thi")
  }


  const handleOpenModal = (testData?: TestFormData | null, hasUserSubmit?: boolean) => {
    setUserSubmit(hasUserSubmit ?? false)
    setIsEditing(!!testData);
    if (testData) {
      const matchedTest = formData.test.find((test) => test._id === testData._id);
      setFormTestData(matchedTest ? { ...initValue, ...matchedTest } : { ...initValue, ...testData });
      setIsTestSelected(!!matchedTest);
    } else {
      setFormTestData({ ...initValue });
      setIsTestSelected(false);
    }
    setIsOpenTestModel(true);
  };

  const handleSubmit = async () => {
    const isValid = formTestData.test_name && formTestData.duration_minutes > 0;
    if (!isValid) {
      toast.error('Vui lòng điền đầy đủ thông tin bài kiểm tra.');
      return;
    }

    const updatedTest: TestFormData = {
      ...formTestData,
      _id: formTestData._id || generateObjectId(),
      start_time: formTestData.start_time ? new Date(formTestData.start_time).toISOString() : '',
      end_time: formTestData.end_time ? new Date(formTestData.end_time).toISOString() : '',
    };

    try {
      if (isTestSelected) {
        setFormData((prev) => ({
          ...prev,
          test: prev.test.map((t) => (t._id === updatedTest._id ? updatedTest : t)),
          test_id: prev.test_id.includes(updatedTest._id)
            ? prev.test_id
            : [...prev.test_id, updatedTest._id],
        }));
        toast.success(isEditing ? 'Đã cập nhật bài kiểm tra lớp!' : 'Đã thêm bài kiểm tra lớp!');
        dispatch(resetTest({
          values: {
            class_id: formData._id ?? "",
            test_id: updatedTest._id,  // thay bằng test_id thực tế
          },
          navigate
        }));
      } else {
        if (isEditing) {
          await dispatch(saveTest({ values: updatedTest, navigate }));
          toast.success('Đã cập nhật bài kiểm tra hệ thống!');
        } else {
          await dispatch(createTest({ values: updatedTest, navigate }));
          toast.success('Đã tạo bài kiểm tra mới!');
        }
      }

      setIsOpenTestModel(false);
      setFormTestData(initValue);
    } catch (error) {
      console.error('Lỗi khi lưu bài kiểm tra:', error);
      toast.error('Có lỗi xảy ra khi lưu bài kiểm tra');
    }
  };

  const finalFilteredTests = Array.from(
    new Map([...allTests, ...formData?.test].map((test) => [test._id, test])).values(),
  ).filter((test) => !selectedTag || test.tags?.includes(selectedTag));

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

  const handleDeleteTest = (id: string) => {
    if (!window.confirm('Are you sure you want to delete this test?')) return;

    const isInAllTests = allTests.some((test) => test._id === id);

    if (isInAllTests) {
      dispatch(deleteTest({ _id: id, navigate }))
        .then(() => alert('Test deleted successfully!'))
        .catch(() => alert('Error deleting test!'));
    } else {
      alert('Test removed from selection.');
    }

    const removedTest = formData.test?.find((t) => t._id === id);
    if (removedTest && !cachedTests.some((t) => t._id === id)) {
      setCachedTests((prev) => [...prev, removedTest]);
    }

    setFormData((prev) => ({
      ...prev,
      test: (prev.test || []).filter((test) => test._id !== id),
      test_id: (prev.test_id || []).filter((_id) => _id !== id),
    }));
  };
  const handleToggleSelectTest = (test: TestFormData) => {
    const isSelected = formData.test_id.includes(test._id);

    // ✅ clone test + đảm bảo user_submit luôn là []
    const clonedTest: TestFormData = {
      ...test,
      user_submit: test.user_submit ?? [],
    };

    setFormData((prev) => ({
      ...prev,
      test_id: isSelected
        ? prev.test_id.filter((id) => id !== test._id)
        : [...prev.test_id, test._id],

      test: isSelected
        ? prev.test.filter((t) => t._id !== test._id)
        : [...prev.test, clonedTest],
    }));
  };


  return (
    <div className="max-w-3xl mx-auto p-2 bg-white shadow-md rounded-lg">
      {isOpenTestModel && (
        <ManageTestModal
          questions={questionsByPage}
          onClose={() => setIsOpenTestModel(false)}
          onSubmit={userSubmit ? () => { setIsOpenTestModel(false) } : handleSubmit}
          formData={formTestData}
          setFormData={setFormTestData}
          isEditing={isEditing}
          selectable={true}
          onDelete={handleDeleteTest}
        />
      )}

      {isOpenUserSubmit && selectedTestForSubmit && formData._id && (
        <UserSubmitComponent
          classID={formData._id}
          testID={selectedTestForSubmit._id}
          testName={selectedTestForSubmit.test_name}
          userSubmits={selectedTestForSubmit.user_submit}
          onClose={() => {
            setIsOpenUserSubmit(false);
            setSelectedTestForSubmit(null);
          }}
        />
      )}


      {/* Bộ lọc theo tag */}
      <div className="mb-4 flex gap-2 flex-wrap">
        {['', ...tags].map((tag) => (
          <button
            key={tag || 'all'}
            onClick={() => setSelectedTag(tag)}
            className={`px-3 py-1 text-sm font-medium rounded-md transition ${selectedTag === tag
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
          >
            {tag || 'Tất cả'}
          </button>
        ))}
      </div>

      {/* Danh sách bài kiểm tra */}
      <div className="space-y-4 max-h-[400px] overflow-y-auto">
        {finalFilteredTests.length === 0 ? (
          <p className="text-gray-500 text-center">Không có bài kiểm tra nào.</p>
        ) : (
          finalFilteredTests.map((test) => {
            const isSelected = formData.test_id.includes(test._id);
            const hasUserSubmit = (test.user_submit?.length ?? 0) > 0;

            return (
              <>
                <div
                  key={test._id}
                  className="border rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition"
                >
                  {/* ===== HEADER ===== */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{test.test_name}</h3>

                    <div className="flex gap-2">
                      {isSelected && (
                        <span className="px-2 py-0.5 text-xs rounded bg-blue-100 text-blue-700">
                          Đã chọn
                        </span>
                      )}

                      {hasUserSubmit && (
                        <span className="px-2 py-0.5 text-xs rounded bg-orange-100 text-orange-700">
                          Đã có bài nộp
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ===== TAGS ===== */}
                  {test.tags?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {test.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 text-xs bg-gray-100 rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* ===== TOGGLE HIỂN THỊ KẾT QUẢ ===== */}
                  {hasUserSubmit && (
                    <div className="mt-4 flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Hiển thị kết quả cho học sinh</p>
                        <p className="text-xs text-gray-500">
                          Cho phép học sinh xem điểm và đáp án
                        </p>
                      </div>

                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={!test.is_test}
                          onChange={() => handleShowSubmission(test)}
                        />
                        <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-indigo-500 transition" />
                        <div className="absolute left-1 top-0.5 w-5 h-5 bg-white rounded-full peer-checked:translate-x-5 transition" />
                      </label>
                    </div>
                  )}

                  {/* ===== ACTIONS ===== */}
                  <div className="mt-4 flex justify-end gap-2">
                    {/* Chọn / Bỏ chọn */}
                    {!hasUserSubmit && (
                      <button
                        onClick={() => handleToggleSelectTest(test)}
                        className={`px-3 py-1.5 text-sm rounded-md text-white
          ${isSelected ? 'bg-yellow-500' : 'bg-blue-500 hover:bg-blue-600'}
        `}
                      >
                        {isSelected ? 'Bỏ chọn' : 'Chọn'}
                      </button>
                    )}

                    {/* Xem kết quả */}
                    {hasUserSubmit && (
                      <button
                        onClick={() => handleOpenUserSubmit(test)}
                        className="px-3 py-1.5 text-sm bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
                      >
                        📊 Xem kết quả
                      </button>
                    )}

                    {/* Sửa / Xem thông tin */}
                    {isSelected && (
                      <button
                        onClick={() => handleOpenModal(test, hasUserSubmit)}
                        className="px-3 py-1.5 text-sm bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
                      >
                        {hasUserSubmit ? 'Xem thông tin' : 'Sửa'}
                      </button>
                    )}

                    {/* Reset */}
                    {isSelected && (
                      <button
                        onClick={() => handleSynchronous(test)}
                        title="Reset bài kiểm tra"
                        className="px-3 py-1.5 bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                      >
                        <RefreshCcwDot size={16} />
                      </button>
                    )}

                    {/* Xóa */}
                    {
                      // !hasUserSubmit && 
                      (
                        <button
                          onClick={() => handleDeleteTest(test._id)}
                          className="px-3 py-1.5 text-sm bg-red-500 text-white rounded-md hover:bg-red-600"
                        >
                          Xóa
                        </button>
                      )}
                  </div>
                </div>

              </>
            );

          })

        )}
        {/* ADD NEW TEST */}
        <div className="flex justify-center items-center w-full">
          <button
            onClick={() => handleOpenModal()}
            className="w-full flex justify-center align-center px-4 py-2 text-black text-sm rounded-md hover:bg-indigo-600 hover:text-white transition "
          >
            <CirclePlus />
          </button>
        </div>
      </div>
    </div >
  );
}

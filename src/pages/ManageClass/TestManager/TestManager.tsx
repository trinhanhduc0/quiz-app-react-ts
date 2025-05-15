import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ManageTestModal, { TestFormData } from '../../ManageTest/ManageTestModal';
import { fetchTests, createTest, deleteTest, saveTest } from '~/redux/test/testSlice';
import { fetchQuestions, incrementPage } from '~/redux/question/questionSlice';
import { generateObjectId } from '~/utils/objectId';
import { RootState, AppDispatch } from '~/redux/store'; // đảm bảo bạn có các định nghĩa này
import { NavigateFunction } from 'react-router-dom';
import { ClassFormData } from '../ManageClass';

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
};

export default function TestManagement({ formData, setFormData, navigate }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const { allTests } = useSelector((state: RootState) => state.tests);
  const { questionsByPage, hasMoreQuestions, statusQuestion } = useSelector(
    (state: RootState) => state.questions,
  );

  const [formTestData, setFormTestData] = useState<TestFormData>(initValue);
  const [cachedTests, setCachedTests] = useState<Test[]>([]);
  const [isTestSelected, setIsTestSelected] = useState(false);
  const [selectedTag, setSelectedTag] = useState('');
  const [isOpenTestModel, setIsOpenTestModel] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const tags: string[] = [
    ...new Set([
      ...allTests.flatMap((test) => test.tags || []),
      // ...formData.test.flatMap((test) => test.tags || []),
    ]),
  ].filter(Boolean);

  //Không biết làm như thế nào, bây giờ muốn sửa luôn vào formData nhưng nếu qua setFormTestData thì không được, hãy tối ưu hóa và clean code đi

  // const handleOpenModal = (testData?: TestFormData | null) => {
  //   setIsEditing(!!testData);
  //   const matchedTest = formData.test.find((test) => test._id === testData?._id);
  //   setIsTestSelected(!!matchedTest);
  //   const newTest: TestFormData = matchedTest ? matchedTest : { ...initValue, _id: '' };
  //   setFormTestData(newTest);
  //   setIsOpenTestModel(true);
  // };
  const handleOpenModal = (testData?: TestFormData | null) => {
    setIsEditing(!!testData);
    if (testData) {
      const matchedTest = formData.test.find((test) => test._id === testData._id);
      setFormTestData(matchedTest ? { ...matchedTest } : { ...testData });
      setIsTestSelected(!!matchedTest);
    } else {
      setFormTestData({ ...initValue });
      setIsTestSelected(false);
    }
    setIsOpenTestModel(true);
  };

  const handleSubmit = async () => {
    const isValid = formTestData.test_name && formTestData.duration_minutes > 0;
    if (!isValid) return alert('Vui lòng điền đầy đủ thông tin bài kiểm tra.');

    const updatedTest: TestFormData = {
      ...formTestData,
      _id: formTestData._id || generateObjectId(),
      start_time: formTestData.start_time ? new Date(formTestData.start_time).toISOString() : '',
      end_time: formTestData.end_time ? new Date(formTestData.end_time).toISOString() : '',
    };

    try {
      if (isTestSelected) {
        // chỉnh local test trong formData
        setFormData((prev) => ({
          ...prev,
          test: prev.test.map((t) => (t._id === updatedTest._id ? updatedTest : t)),
          test_id: prev.test_id.includes(updatedTest._id)
            ? prev.test_id
            : [...prev.test_id, updatedTest._id],
        }));
        alert(isEditing ? 'Đã cập nhật bài kiểm tra lớp!' : 'Đã thêm bài kiểm tra lớp!');
      } else {
        if (isEditing) {
          await dispatch(saveTest({ values: updatedTest, navigate }));
          alert('Đã cập nhật bài kiểm tra hệ thống!');
        } else {
          await dispatch(createTest({ values: updatedTest, navigate }));
          alert('Đã tạo bài kiểm tra mới!');
        }
      }
      setIsOpenTestModel(false);
      setFormTestData(initValue);
    } catch (error) {
      console.error('Lỗi khi lưu bài kiểm tra:', error);
      alert('Có lỗi xảy ra khi lưu bài kiểm tra');
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

  const loadMore = useCallback(async () => {
    if (hasMoreQuestions && statusQuestion !== 'loading') {
      await dispatch(incrementPage());
      await dispatch(fetchQuestions({ navigate }));
    }
  }, [hasMoreQuestions, statusQuestion, dispatch, navigate]);

  // const handleSubmit = useCallback(async () => {
  //   const isValid = formTestData.test_name && formTestData.duration_minutes > 0;
  //   if (!isValid) return alert('Vui lòng điền đầy đủ thông tin bài kiểm tra.');

  //   const values: TestFormData = {
  //     ...formTestData,
  //     start_time: formTestData.start_time ? new Date(formTestData.start_time).toISOString() : '',
  //     end_time: formTestData.end_time ? new Date(formTestData.end_time).toISOString() : '',
  //   };

  //   // Đảm bảo giá trị _id là hợp lệ
  //   const testToSave = { ...values, _id: formTestData._id || generateObjectId() };

  //   try {
  //     if (isEditing) {
  //       await dispatch(saveTest({ values: testToSave, navigate }));
  //       alert('Đã cập nhật bài kiểm tra!');
  //     } else {
  //       await dispatch(createTest({ values: testToSave, navigate }));
  //       alert('Đã tạo bài kiểm tra!');
  //     }
  //     setIsOpenTestModel(false);
  //     setFormTestData(initValue);
  //   } catch (error) {
  //     console.error('Lỗi khi lưu bài kiểm tra:', error);
  //     alert('Có lỗi xảy ra khi lưu bài kiểm tra');
  //   }
  // }, [dispatch, isEditing, formTestData, navigate]);

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

    setFormData((prev) => ({
      ...prev,
      test_id: isSelected
        ? prev.test_id.filter((id) => id !== test._id)
        : [...prev.test_id, test._id],
      test: isSelected ? prev.test.filter((t) => t._id !== test._id) : [...prev.test, test],
    }));
  };
  // const convertTestToFormData = (test: Test): TestFormData => ({
  //   _id: test._id,
  //   test_name: test.test_name,
  //   descript: test.descript,
  //   duration_minutes: test.duration_minutes,
  //   start_time: test.start_time,
  //   end_time: test.end_time,
  //   is_test: test.is_test,
  //   tags: test.tags,
  //   question_ids: test.question_ids,
  // });

  return (
    <div className="max-w-3xl mx-auto p-2 bg-white shadow-md rounded-lg">
      <div className="flex justify-end items-center mb-4">
        <button
          onClick={() => handleOpenModal(initValue)}
          className="px-4 py-2 text-white text-sm rounded-md hover:bg-indigo-600 transition bg-indigo-500"
        >
          ➕
        </button>
      </div>

      {isOpenTestModel && (
        <ManageTestModal
          questions={questionsByPage}
          onClose={() => setIsOpenTestModel(false)}
          onSubmit={handleSubmit}
          formData={formTestData}
          setFormData={setFormTestData}
          loadMore={loadMore}
          isEditing={isEditing}
          selectable={true}
          onDelete={handleDeleteTest}
        />
      )}

      {/* Bộ lọc theo tag */}
      <div className="mb-4 flex gap-2 flex-wrap">
        {['', ...tags].map((tag) => (
          <button
            key={tag || 'all'}
            onClick={() => setSelectedTag(tag)}
            className={`px-3 py-1 text-sm font-medium rounded-md transition ${
              selectedTag === tag
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
            return (
              <div
                key={test._id}
                className={`border p-4 rounded-md shadow-sm relative ${
                  isSelected ? 'bg-blue-50 border-blue-400' : 'bg-gray-50'
                } transition-all`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">{test.test_name}</h3>
                  {isSelected && (
                    <span className="text-sm text-green-600 font-semibold">✅ Đã chọn</span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{test.descript}</p>
                <p className="text-sm text-gray-600">
                  ⏳ {test.duration_minutes} phút | 🏷{' '}
                  {test.tags?.map((tag: string) => (
                    <span
                      key={tag}
                      className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded mr-1"
                    >
                      {tag}
                    </span>
                  ))}
                </p>
                <p className="text-sm text-gray-600">
                  📅 {new Date(test.start_time).toLocaleDateString()} -{' '}
                  {new Date(test.end_time).toLocaleDateString()}
                </p>
                <div className="mt-3 flex justify-end gap-2">
                  <button
                    onClick={() => handleToggleSelectTest(test)}
                    className={`px-3 py-1 text-sm rounded-md transition ${
                      isSelected
                        ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    {isSelected ? 'Bỏ chọn' : 'Chọn'}
                  </button>
                  {isSelected && (
                    <button
                      onClick={() => handleOpenModal(test)}
                      className="px-3 py-1 text-sm bg-green-500 text-white rounded-md hover:bg-green-600"
                    >
                      Sửa
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteTest(test._id)}
                    className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

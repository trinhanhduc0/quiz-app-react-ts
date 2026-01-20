import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API_ENDPOINTS from '~/config';
import { apiCallPost } from '~/services/apiCallService';
import { useTranslation } from 'react-i18next';
import { BookOpen, Clock, CheckCircle2, PlayCircle } from 'lucide-react';
import JoinClass from '~/components/joinClass/JoinClass';
import MatrixExamView from './component/MatrixExamView';
import { MatrixExamData } from '../TestManage/ManageTestModal';

interface DashboardClass {
  class_id: string;
  class_name: string;
  author_mail: string;
  tests: {
    test_id: string;
    test_name: string;
    start_time: string;
    end_time: string;
    duration_minutes: number;
    matrix_exam: MatrixExamData[]
    is_test: boolean;

    hasSubmitted: boolean;
  }[];
}


const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [classes, setClasses] = useState<DashboardClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [isJoinClassOpen, setIsJoinClassOpen] = useState(false);
  const [confirmTest, setConfirmTest] = useState<{
    class_id: string;
    author_mail: string;
    test_id: string;
    test_name: string;
    start_time: string;
    end_time: string;
    duration_minutes: number;
  } | null>(null);

  useEffect(() => {
    apiCallPost<DashboardClass[]>(API_ENDPOINTS.STUDENT_CLASSES, {}, navigate)
      .then(setClasses)
      .finally(() => setLoading(false));
  }, []);
  if (loading) {
    return <div className="text-center mt-20 text-gray-500">{t('dashboard.loading')}</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {classes.length > 0 ?
        classes.map(cls => (
          <div key={cls.class_id} className="mb-10">
            {/* CLASS HEADER */}
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="text-indigo-600" />
              <h2 className="text-2xl font-semibold">{cls.class_name}</h2>
              <span className="text-sm text-gray-500">
                ({t('dashboard.teacher')}: {cls.author_mail})
              </span>
            </div>

            {/* TEST LIST */}
            <div className="grid md:grid-cols-2 gap-4">
              {cls.tests && cls.tests.map(test => {
                const now = Date.now();
                const start = new Date(test.start_time).getTime();
                const end = new Date(test.end_time).getTime();

                const isActive = now >= start && now <= end;
                const isExpired = now > end;

                return (
                  <div
                    key={test.test_id}
                    className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold mb-1">
                          📝 {test.test_name}
                        </h3>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Clock size={14} />
                          {new Date(test.start_time).toLocaleString()} –{' '}
                          {new Date(test.end_time).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          ⏱ {t('dashboard.duration')}: {test.duration_minutes} {t('dashboard.minutes')}
                        </p>


                      </div>

                      {/* STATUS */}
                      {test.hasSubmitted ? (
                        <span className="flex items-center gap-1 text-green-600 font-medium">
                          <CheckCircle2 size={18} /> {t('dashboard.submitted')}
                        </span>
                      ) : isExpired ? (
                        <span className="text-red-500 font-medium">{t('dashboard.closed')}</span>
                      ) : isActive ? (
                        <span className="text-blue-600 font-medium">{t('dashboard.open')}</span>
                      ) : (
                        <span className="text-gray-500 font-medium">{t('dashboard.not_open')}</span>
                      )}
                    </div>
                    {confirmTest && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                        <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-lg">
                          <h2 className="text-xl font-semibold mb-4">
                            📝 Xác nhận làm bài
                          </h2>

                          <div className="space-y-2 text-sm text-gray-700">
                            <p>
                              <strong>Bài thi:</strong> {confirmTest.test_name}
                            </p>
                            <p>
                              <strong>Thời gian làm:</strong>{' '}
                              {confirmTest.duration_minutes} phút
                            </p>
                            <p>
                              <strong>Mở từ:</strong>{' '}
                              {new Date(confirmTest.start_time).toLocaleString()}
                            </p>
                            <p>
                              <strong>Kết thúc:</strong>{' '}
                              {new Date(confirmTest.end_time).toLocaleString()}
                            </p>
                          </div>

                          <div className="mt-4 p-3 bg-yellow-50 text-yellow-700 text-sm rounded">
                            ⚠️ Lưu ý:
                            <ul className="list-disc ml-5 mt-1">
                              <li>Bài thi chỉ được làm một lần</li>
                              <li>Thoát trang có thể bị tính là nộp bài</li>
                            </ul>
                          </div>
                          <MatrixExamView data={test.matrix_exam} />

                          <div className="mt-6 flex justify-end gap-3">
                            <button
                              onClick={() => setConfirmTest(null)}
                              className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                            >
                              Huỷ
                            </button>

                            <button
                              onClick={() => {
                                navigate(
                                  `/do-test/${confirmTest.author_mail}/${confirmTest.test_id}/${confirmTest.class_id}`,
                                );
                              }}
                              className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
                            >
                              ✅ Xác nhận
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ACTION */}
                    <div className="mt-4 flex justify-end">
                      {test.hasSubmitted ? (
                        <button
                          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                          onClick={() =>
                            navigate(`/do-test/${cls.author_mail}/${test.test_id}/${cls.class_id}`)
                          }
                        >
                          <PlayCircle size={18} /> {t('dashboard.review')}
                        </button>
                      ) : isActive ? (
                        <button
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                          onClick={() =>
                            setConfirmTest({
                              class_id: cls.class_id,
                              author_mail: cls.author_mail,
                              test_id: test.test_id,
                              test_name: test.test_name,
                              start_time: test.start_time,
                              end_time: test.end_time,
                              duration_minutes: test.duration_minutes,
                            })
                          }
                        >
                          <PlayCircle size={18} /> {t('dashboard.take_exam')}
                        </button>
                      ) : (
                        <button
                          disabled
                          className="px-4 py-2 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed"
                        >
                          {t('dashboard.not_available')}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        )) : <h1 className='text-center'>
          BẮT ĐẦU THAM GIA LỚP HỌC MỚI NÀO
        </h1>}
      {/* JOIN CLASS BUTTON */}
      <div className="mt-12 flex justify-center">
        <button
          onClick={() => setIsJoinClassOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-100 text-white rounded-xl shadow hover:bg-indigo-200 transition"
        >
          ➕
        </button>
      </div>

      <JoinClass
        isOpen={isJoinClassOpen}
        onClose={() => setIsJoinClassOpen(false)}
        onJoined={() => {
          setIsJoinClassOpen(false);
          setLoading(true);
          apiCallPost<DashboardClass[]>(API_ENDPOINTS.STUDENT_CLASSES, navigate)
            .then(setClasses)
            .finally(() => setLoading(false));
        }}
      />
    </div>
  );

};

export default Dashboard;

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import API_ENDPOINTS from '~/config';
import JoinClass from '~/components/joinClass/JoinClass';
import { apiCallGet } from '~/services/apiCallService';
import { useTranslation } from 'react-i18next';

// Define type for class item
interface ClassItem {
  _id: string;
  class_name: string;
  author_mail: string;
  tags: string[];
  test_id: string[]; // hoặc test_id: any[] nếu chưa rõ
}

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [isJoinClassOpen, setIsJoinClassOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchClasses = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiCallGet<ClassItem[]>(API_ENDPOINTS.STUDENT_CLASSES, navigate);
      setClasses(response);
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const handleClassClick = (classId: string, author: string, testIds: string[]) => {
    navigate(`/list-test/${classId}/${author}`, {
      state: { test_ids: testIds },
    });
  };

  return (
    <div className="dashboard mx-auto px-4 py-6 bg-gradient-to-r">
      <div className="joinClass mb-6">
        <button
          onClick={() => setIsJoinClassOpen(true)}
          className="open-join-class-button bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300 py-2 px-4 rounded-lg shadow-lg transform hover:scale-105"
          
        >
          {t('dashboard.join_class')}
        </button>

        <JoinClass isOpen={isJoinClassOpen} onRequestClose={() => setIsJoinClassOpen(false)} />
      </div>

      {loading ? (
        <div className="text-center text-gray-500">Loading...</div>
      ) : classes.length > 0 ? (
        <div className="class-list grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((classItem) => (
            <div
              key={classItem._id}
              className="class-card bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 cursor-pointer"
              onClick={() =>
                handleClassClick(classItem._id, classItem.author_mail, classItem.test_id)
              }
            >
              <h2 className="class-title text-xl font-semibold text-gray-900 mb-4 hover:text-blue-600 transition-colors duration-300">
                {classItem.class_name}
              </h2>
              <div className="class-details text-gray-700">
                <p className="mb-2">
                  <strong>{t('dashboard.author')}:</strong> {classItem.author_mail}
                </p>
                <p>
                  <strong>{t('dashboard.tags')}:</strong> {classItem.tags.join(', ')}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-classes text-center text-gray-600">{t('dashboard.no_classes')}</p>
      )}
    </div>
  );
};

export default Dashboard;

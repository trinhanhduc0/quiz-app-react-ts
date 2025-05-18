import { Users, Hourglass, ClipboardList } from 'lucide-react';
import { ClassFormData } from '../ManageClass';

export type ClassData = {
  _id: string;
  class_name: string;
  tags: string[];
  is_public: boolean;
  students_accept?: string[]; // hoặc type cụ thể
  students_wait?: string[];
  test_id?: string[]; // hoặc object[] nếu chứa chi tiết bài test
};

interface ClassCardProps {
  classData: ClassFormData;
  onClick: () => void;
}

const ClassCard: React.FC<ClassCardProps> = ({ classData, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="w-64 h-auto m-3 p-4 bg-purple-500 hover:bg-purple-800 cursor-pointer rounded-2xl shadow-lg transition-transform transform hover:scale-105 flex flex-col justify-between"
    >
      {/* Tên lớp học */}
      <h2 className="text-xl font-semibold text-white text-center mb-2 truncate">
        {classData.class_name}
      </h2>

      {/* Tags */}
      <div className="flex flex-wrap justify-center gap-2 max-h-16 overflow-y-auto scrollbar-thin">
        {classData.tags.map((tag, idx) => (
          <span key={idx} className="text-xs text-white bg-purple-600 px-2 py-0.5 rounded-full">
            #{tag}
          </span>
        ))}
      </div>

      {/* Thông tin số lượng */}
      <div className="space-y-2 mt-4">
        <div className="flex items-center justify-between text-white text-sm">
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {classData.students_accept?.length || 0} chấp nhận
          </span>
          <span className="flex items-center gap-1">
            <Hourglass className="w-4 h-4" />
            {classData.students_wait?.length || 0} chờ duyệt
          </span>
        </div>
        <div className="flex items-center text-white gap-1 text-sm">
          <ClipboardList className="w-4 h-4" />
          {classData.test_id?.length || 0} bài kiểm tra
        </div>
      </div>
    </div>
  );
};

interface ClassListProps {
  data: ClassFormData[];
  onClick: (classData: ClassFormData) => void;
}

const ClassList: React.FC<ClassListProps> = ({ data, onClick }) => {
  return (
    <div className="flex flex-wrap justify-center">
      {data.map((classData) => (
        <ClassCard key={classData._id} classData={classData} onClick={() => onClick(classData)} />
      ))}
    </div>
  );
};

export default ClassList;

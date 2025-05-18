import { MinusCircle, Plus, Upload, X } from 'lucide-react';
import ImageManage from '~/components/image/ImageManager';
import { useState, useCallback } from 'react';
import type { QuestionFormData } from './types';

export interface QuestionSingleFormProps {
  formData: QuestionFormData;
  setFormData: React.Dispatch<React.SetStateAction<QuestionFormData>>;
  imageUrl: string;
  onChange: (fileName: string) => void;
}

export default function QuestionSingleForm({
  formData,
  setFormData,
  imageUrl,
  onChange,
}: QuestionSingleFormProps) {
  const [isModalImageOpen, setIsModalImageOpen] = useState(false);
  const [isQuestionImageOpen, setIsQuestionImageOpen] = useState<number | null>(null);

  const handleSelectImage = useCallback(
    (fileName: string) => {
      onChange(fileName);
      setIsModalImageOpen(false);
    },
    [onChange],
  );

  return (
    <>
      <div className="space-y-4">
        {/* Upload ảnh câu hỏi */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Question Image</label>
          <div className="flex items-center gap-2">
            <input
              value={imageUrl}
              disabled
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              placeholder="Upload Question Image"
            />
            <button
              type="button"
              onClick={() => onChange('')}
              className="text-red-500 hover:text-red-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsModalImageOpen(true)}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
        >
          <Upload className="h-5 w-5" /> Upload Question Image
        </button>
        <ImageManage
          isOpen={isModalImageOpen}
          onClose={() => setIsModalImageOpen(false)}
          onSelectImage={handleSelectImage}
        />
      </div>

      {/* Danh sách option */}
      <div className="space-y-4 mt-6">
        {formData.options?.map((option, index) => (
          <div key={index} className="border rounded-md p-4 space-y-2">
            <textarea
              value={option.text}
              onChange={(e) => {
                const newOptions = formData.options.map((opt, i) =>
                  i === index ? { ...opt, text: e.target.value } : opt,
                );
                setFormData({ ...formData, options: newOptions });
              }}
              className="block w-full border border-gray-300 rounded-md p-2 h-20 resize-y"
              placeholder="Option text"
              required
            />

            {/* Image URL */}
            <div className="flex items-center gap-2">
              <input
                value={option.image_url}
                disabled
                className="block w-full border border-gray-300 rounded-md p-2"
                placeholder="Image URL"
              />
              <button
                type="button"
                onClick={() => {
                  const newOptions = [...formData.options];
                  newOptions[index].image_url = '';
                  setFormData({ ...formData, options: newOptions });
                }}
                className="text-red-500 hover:text-red-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Upload ảnh */}
            <button
              type="button"
              onClick={() => setIsQuestionImageOpen(index)}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
            >
              <Upload className="h-5 w-5" /> Upload Option Image
            </button>
            <ImageManage
              isOpen={isQuestionImageOpen === index}
              onClose={() => setIsQuestionImageOpen(null)}
              onSelectImage={(fileName: string) => {
                const newOptions = [...formData.options];
                newOptions[index] = { ...newOptions[index], image_url: fileName };
                setFormData({ ...formData, options: newOptions });
                setIsQuestionImageOpen(null);
              }}
            />

            {/* Chọn đáp án đúng */}
            <div className="flex items-center gap-2">
              <input
                type="radio"
                name="correct-option"
                checked={option.iscorrect}
                onChange={() => {
                  const newOptions = formData.options.map((opt, i) => ({
                    ...opt,
                    iscorrect: i === index,
                  }));
                  setFormData({ ...formData, options: newOptions });
                }}
                className="h-4 w-4"
              />
              <label className="text-sm text-gray-700">Correct</label>
            </div>

            {/* Xóa option */}
            <button
              type="button"
              onClick={() => {
                const newOptions = formData.options.filter((_, i) => i !== index);
                setFormData({ ...formData, options: newOptions });
              }}
              className="flex items-center gap-2 text-red-500 hover:text-red-700"
            >
              <MinusCircle className="h-5 w-5" /> Remove
            </button>
          </div>
        ))}

        {/* Thêm option */}
        <button
          type="button"
          onClick={() =>
            setFormData({
              ...formData,
              options: [...formData.options, { text: '', image_url: '', iscorrect: false }],
            })
          }
          className="flex items-center gap-2 border border-dashed border-blue-500 text-blue-500 px-4 py-2 rounded-md w-full hover:bg-blue-50"
        >
          <Plus className="h-5 w-5" /> Add Option
        </button>
      </div>
    </>
  );
}

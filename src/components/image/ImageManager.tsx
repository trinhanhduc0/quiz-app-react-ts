import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCallGet, apiUploadImage } from '~/services/apiCallService';
import API_ENDPOINTS from '~/config';
import ImageComponent from './Image';

interface ImageItem {
  filename: string;
  content: string;
}

interface ImageManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (url: string) => void;
}

const ImageManager: React.FC<ImageManagerProps> = ({ isOpen, onClose, onSelectImage }) => {
  const [listImage, setListImage] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      const cached = localStorage.getItem('cachedImages');
      if (cached) {
        setListImage(JSON.parse(cached));
        setLoading(false);
      }
      fetchListImage();
    }
  }, [isOpen]);

  const fetchListImage = async () => {
    try {
      setLoading(true);
      const res = await apiCallGet<ImageItem[]>(API_ENDPOINTS.GETIMAGEFILES, navigate);
      if (res) {
        setListImage(res);
        localStorage.setItem('cachedImages', JSON.stringify(res));
      }
    } catch (error) {
      alert('Failed to fetch images.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await apiUploadImage(API_ENDPOINTS.UPLOAD_IMAGE, formData, navigate);
      if (res.ok) {
        const responseText = await res.text();
        alert(responseText || 'Image uploaded successfully');
        await fetchListImage();
      } else {
        const errorText = await res.text();
        throw new Error(errorText || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      alert(error.message || 'Failed to upload image');
    }
  };

  const handleImageSelect = (imageUrl: string) => {
    onSelectImage(imageUrl);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Manage Images</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition">
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Upload Button */}
        <div className="mb-6">
          <label
            htmlFor="image-upload"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition cursor-pointer"
          >
            Upload Image
          </label>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
          />
        </div>

        {/* Image List */}
        {loading ? (
          <p className="text-center text-gray-500">Loading images...</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {listImage.length > 0 ? (
              listImage.map((item) => (
                <div
                  key={item.filename}
                  onClick={() => handleImageSelect(item.filename)}
                  className="flex justify-center items-center cursor-pointer hover:opacity-80 transition"
                >
                  <ImageComponent width={80} src={item.content} />
                </div>
              ))
            ) : (
              <p className="col-span-full text-center text-gray-500">No images available</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageManager;

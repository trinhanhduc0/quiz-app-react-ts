import React, { useState } from 'react';
import {
  Download,
  RotateCcw,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  ZoomIn,
  ZoomOut,
  RefreshCw,
} from 'lucide-react';

interface ImageComponentProps {
  src: string;
  width?: number | string;
  className?: string;
}

interface TransformState {
  scale: number;
  rotate: number;
  flipX: boolean;
  flipY: boolean;
}

const onDownload = (imgUrl: string) => {
  fetch(imgUrl)
    .then((response) => response.blob())
    .then((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'image.png';
      document.body.appendChild(link);
      link.click();
      URL.revokeObjectURL(url);
      link.remove();
    });
};

const ImageComponent: React.FC<ImageComponentProps> = ({ src, width, className }) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [transform, setTransform] = useState<TransformState>({
    scale: 1,
    rotate: 0,
    flipX: false,
    flipY: false,
  });

  const handleZoomIn = () => {
    if (transform.scale < 5) {
      setTransform((prev) => ({ ...prev, scale: prev.scale + 0.5 }));
    }
  };

  const handleZoomOut = () => {
    if (transform.scale > 0.5) {
      setTransform((prev) => ({ ...prev, scale: prev.scale - 0.5 }));
    }
  };

  const handleRotateLeft = () => {
    setTransform((prev) => ({ ...prev, rotate: prev.rotate - 90 }));
  };

  const handleRotateRight = () => {
    setTransform((prev) => ({ ...prev, rotate: prev.rotate + 90 }));
  };

  const handleFlipX = () => {
    setTransform((prev) => ({ ...prev, flipX: !prev.flipX }));
  };

  const handleFlipY = () => {
    setTransform((prev) => ({ ...prev, flipY: !prev.flipY }));
  };

  const handleReset = () => {
    setTransform({ scale: 1, rotate: 0, flipX: false, flipY: false });
  };

  const imageStyle: React.CSSProperties = {
    transform: `
      scale(${transform.scale})
      rotate(${transform.rotate}deg)
      scaleX(${transform.flipX ? -1 : 1})
      scaleY(${transform.flipY ? -1 : 1})
    `,
    transition: 'transform 0.3s ease',
  };

  return (
    <>
      <img
        src={src}
        alt="Previewable"
        width={width}
        height="100%"
        className={className + 'rounded-[10%] cursor-pointer'}
        onClick={() => setIsPreviewOpen(true)}
      />

      {isPreviewOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative bg-white rounded-lg p-4 max-w-[90vw] max-h-[90vh] overflow-auto">
            <img
              src={src}
              alt="Preview"
              className="max-w-full max-h-[70vh] object-contain"
              style={imageStyle}
            />
            <div className="flex gap-4 mt-4 justify-center flex-wrap">
              <button
                onClick={() => onDownload(src)}
                className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition"
              >
                <Download className="h-5 w-5" />
              </button>
              <button
                onClick={handleFlipY}
                className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition"
              >
                <FlipVertical className="h-5 w-5" />
              </button>
              <button
                onClick={handleFlipX}
                className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition"
              >
                <FlipHorizontal className="h-5 w-5" />
              </button>
              <button
                onClick={handleRotateLeft}
                className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition"
              >
                <RotateCcw className="h-5 w-5" />
              </button>
              <button
                onClick={handleRotateRight}
                className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition"
              >
                <RotateCw className="h-5 w-5" />
              </button>
              <button
                onClick={handleZoomOut}
                disabled={transform.scale <= 0.5}
                className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 disabled:opacity-50 transition"
              >
                <ZoomOut className="h-5 w-5" />
              </button>
              <button
                onClick={handleZoomIn}
                disabled={transform.scale >= 5}
                className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 disabled:opacity-50 transition"
              >
                <ZoomIn className="h-5 w-5" />
              </button>
              <button
                onClick={handleReset}
                className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
            </div>
            <button
              onClick={() => setIsPreviewOpen(false)}
              className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition"
            >
              <svg
                className="h-5 w-5"
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
        </div>
      )}
    </>
  );
};

export default ImageComponent;

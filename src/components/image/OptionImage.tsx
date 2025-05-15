import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API_ENDPOINTS from '~/config';
import TokenService from '~/services/TokenService';
import Image from './Image';

interface OptionImageProps {
  imageUrl: string;
  email?: string;
  width?: number;
  height?: string;
  className?: string;
}

const OptionImage: React.FC<OptionImageProps> = ({
  imageUrl,
  email,
  width = 100,
  height = 'auto',
  className = '',
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchImage = async () => {
    try {
      const cachedImage = sessionStorage.getItem(imageUrl);
      if (cachedImage) {
        setImageSrc(cachedImage);
        return;
      }

      const response = await fetch(API_ENDPOINTS.IMAGE, {
        method: 'POST',
        headers: {
          Authorization: TokenService.getToken() ?? '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filename: imageUrl }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          navigate('/login');
        }
        throw new Error('Failed to fetch image');
      }

      const blob = await response.blob();
      const reader = new FileReader();

      reader.onloadend = () => {
        const base64data = reader.result as string;
        sessionStorage.setItem(imageUrl, base64data);
        setImageSrc(base64data);
      };

      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('Error fetching image:', error);
    }
  };

  useEffect(() => {
    if (imageUrl) {
      fetchImage();
    }
  }, [imageUrl]);

  return imageSrc ? (
    <Image src={imageSrc} width={width} className={className} />
  ) : (
    <div className={`flex items-center justify-center ${className}`}>
      <p className="text-gray-500 italic">Loading image...</p>
    </div>
  );
};

export default OptionImage;

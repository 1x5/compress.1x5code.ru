import React, { useEffect, useState } from 'react';
import ProgressBar from './ProgressBar';
import { formatFileSize } from '../utils/imageCompressor';

// Максимальное допустимое разрешение по ширине
const MAX_WIDTH = 1680;

const ImagePreview = ({ file, progress, status, compressedSize }) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [compressedDimensions, setCompressedDimensions] = useState(null);
  const isOversize = dimensions.width > MAX_WIDTH;

  // Вычисляем сжатые размеры в эффекте при изменении статуса или компонента
  useEffect(() => {
    if (dimensions.width > MAX_WIDTH && status === 'completed') {
      const aspectRatio = dimensions.width / dimensions.height;
      const newWidth = MAX_WIDTH;
      const newHeight = Math.round(newWidth / aspectRatio);
      
      setCompressedDimensions({
        width: newWidth,
        height: newHeight
      });
    }
  }, [dimensions, status]);

  useEffect(() => {
    // Создаем preview URL для изображения
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Получаем размеры изображения
    const img = new Image();
    img.onload = () => {
      setDimensions({
        width: img.width,
        height: img.height
      });
    };
    img.src = objectUrl;

    // Очищаем URL при размонтировании компонента
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  // Отображаем прогресс только если статус "в процессе" или "завершено"
  const showProgress = status === 'processing' || status === 'completed';

  return (
    <div className="preview-item">
      <div className="preview-image-container">
        {previewUrl && (
          <img 
            src={previewUrl} 
            alt={file.name} 
            className="preview-image" 
          />
        )}
      </div>
      <div className="preview-details">
        <div className="preview-filename">{file.name}</div>
        <div className="image-info">
          <div className={`image-dimensions ${isOversize ? 'oversize' : ''}`}>
            {dimensions.width}
            {compressedDimensions && status === 'completed' && (
              <span className="compressed-dimensions">
                {" → "}{compressedDimensions.width}
              </span>
            )}
          </div>
          <div className="file-size-info">
            {formatFileSize(file.size)}
            {status === 'completed' && compressedSize && (
              <span className="compressed-size">
                {" → "}{formatFileSize(compressedSize)}
              </span>
            )}
          </div>
        </div>
        {showProgress && (
          <ProgressBar 
            progress={progress} 
            status={status} 
          />
        )}
        {status === 'error' && (
          <div className="error">Ошибка при обработке файла</div>
        )}
      </div>
    </div>
  );
};

export default ImagePreview; 
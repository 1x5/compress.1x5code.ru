import React from 'react';
import { formatFileSize } from '../utils/imageCompressor';

const FileInfo = ({ originalSize, compressedSize }) => {
  const compressionRatio = compressedSize && originalSize 
    ? Math.round((1 - compressedSize / originalSize) * 100) 
    : 0;

  return (
    <div className="file-info">
      <span>Оригинал: {formatFileSize(originalSize)}</span>
      {compressedSize ? (
        <span>
          Сжатый: {formatFileSize(compressedSize)} 
          {compressionRatio > 0 && ` (-${compressionRatio}%)`}
        </span>
      ) : (
        <span>Обработка...</span>
      )}
    </div>
  );
};

export default FileInfo; 
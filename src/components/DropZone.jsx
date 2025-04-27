import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

const SUPPORTED_FORMATS = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
  'image/tiff',
  'image/bmp',
  'image/gif',
  'image/svg+xml',
  'image/avif'
];

// Допустим, что RAW файлы могут иметь различные MIME-типы в зависимости от производителя камеры
const RAW_FORMATS = [
  'image/x-canon-cr2',
  'image/x-canon-cr3',
  'image/x-nikon-nef',
  'image/x-sony-arw',
  'image/x-adobe-dng',
  'image/x-olympus-orf',
  'image/x-panasonic-rw2',
  'image/x-fuji-raf',
  'image/x-pentax-pef'
];

const DropZone = ({ onDrop }) => {
  const onDropAccepted = useCallback((acceptedFiles) => {
    onDrop(acceptedFiles);
  }, [onDrop]);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject
  } = useDropzone({
    onDropAccepted,
    accept: {
      'image/*': [...SUPPORTED_FORMATS, ...RAW_FORMATS]
    },
    multiple: true
  });

  return (
    <div 
      {...getRootProps()} 
      className={`dropzone ${isDragActive ? 'dropzone-active' : ''}`}
    >
      <input {...getInputProps()} />
      {isDragReject ? (
        <p>Неподдерживаемый формат файла</p>
      ) : isDragActive ? (
        <p>Отпустите для загрузки файлов...</p>
      ) : (
        <>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="48" 
            height="48" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="#30a46c" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            style={{ marginBottom: '1rem' }}
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          <p>Перетащите изображения сюда или нажмите для выбора</p>
          <p className="dropzone-formats">
            Поддерживаемые форматы: JPG, PNG, WebP, HEIC, RAW, GIF, SVG, TIFF, BMP, AVIF
          </p>
          <div className="dropzone-button">Выбрать файлы</div>
        </>
      )}
    </div>
  );
};

export default DropZone; 
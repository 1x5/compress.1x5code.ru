import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import ImagePreview from './components/ImagePreview';
import { processQueue } from './utils/imageCompressor';

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

const App = () => {
  // Состояние для хранения информации о файлах
  const [fileStates, setFileStates] = useState({});

  // Обработчик загрузки файлов
  const handleDrop = useCallback((acceptedFiles) => {
    // Создаем начальное состояние для каждого файла
    const newFileStates = {};
    
    acceptedFiles.forEach(file => {
      newFileStates[file.name] = {
        file,
        progress: 0,
        status: 'queued',
        compressedSize: null
      };
    });

    // Обновляем состояние
    setFileStates(prev => ({
      ...prev,
      ...newFileStates
    }));

    // Запускаем обработку файлов
    processQueue(acceptedFiles, {
      // Обновление прогресса для конкретного файла
      onFileProgress: (fileName, progress) => {
        setFileStates(prev => ({
          ...prev,
          [fileName]: {
            ...prev[fileName],
            progress,
            status: 'processing'
          }
        }));
      },
      // Обработка завершения сжатия файла
      onFileComplete: (fileName, compressedSize) => {
        setFileStates(prev => ({
          ...prev,
          [fileName]: {
            ...prev[fileName],
            progress: 100,
            status: 'completed',
            compressedSize
          }
        }));
      },
      // Обработка ошибок
      onFileError: (fileName) => {
        setFileStates(prev => ({
          ...prev,
          [fileName]: {
            ...prev[fileName],
            progress: 0,
            status: 'error'
          }
        }));
      }
    });
  }, []);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject
  } = useDropzone({
    onDrop: handleDrop,
    accept: {
      'image/*': [...SUPPORTED_FORMATS, ...RAW_FORMATS]
    },
    multiple: true,
    noClick: !!Object.keys(fileStates).length // Отключаем клик, если уже есть файлы
  });

  return (
    <div {...getRootProps()} className={`container ${isDragActive ? 'dropzone-active' : ''}`}>
      <input {...getInputProps()} />
      
      {isDragReject ? (
        <div className="upload-message reject">
          <p>Неподдерживаемый формат файла</p>
        </div>
      ) : isDragActive ? (
        <div className="upload-message active">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="64" 
            height="64" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="#30a46c" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          <p>Отпустите для загрузки файлов...</p>
        </div>
      ) : (
        <div className="content-wrapper">
          {Object.keys(fileStates).length === 0 ? (
            <div className="upload-prompt">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="64" 
                height="64" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="#30a46c" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              <p>Перетащите изображения сюда или нажмите для выбора</p>
              <p className="formats-info">
                Поддерживаемые форматы: JPG, PNG, WebP, HEIC, RAW, GIF, SVG, TIFF, BMP, AVIF
              </p>
              <div className="dropzone-button">Выбрать файлы</div>
            </div>
          ) : (
            <div className="preview-container">
              {Object.entries(fileStates).map(([fileName, state]) => (
                <ImagePreview
                  key={fileName}
                  file={state.file}
                  progress={state.progress}
                  status={state.status}
                  compressedSize={state.compressedSize}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default App; 
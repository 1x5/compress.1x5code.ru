import imageCompression from 'browser-image-compression';
import { saveAs } from 'file-saver';
import heic2any from 'heic2any';
import JSZip from 'jszip';

// Максимальное допустимое разрешение по ширине
const MAX_WIDTH = 1680;

/**
 * Форматирует размер файла в человекочитаемый вид
 * @param {number} bytes - Размер в байтах
 * @returns {string} Форматированный размер (например, "1.5 MB")
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Преобразует HEIC формат в JPEG
 * @param {File} file - HEIC файл
 * @returns {Promise<Blob>} JPEG Blob
 */
const convertHeicToJpeg = async (file) => {
  try {
    const blob = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.9
    });
    
    return new File([blob], file.name.replace(/\.heic$/, '.jpg'), { 
      type: 'image/jpeg' 
    });
  } catch (error) {
    console.error('Error converting HEIC to JPEG:', error);
    throw error;
  }
};

/**
 * Проверяет, является ли файл HEIC/HEIF форматом
 */
const isHeic = (file) => {
  return file.type === 'image/heic' || 
         file.type === 'image/heif' ||
         /\.heic$/i.test(file.name) ||
         /\.heif$/i.test(file.name);
};

/**
 * Оптимизирует опции сжатия в зависимости от формата и размера файла
 */
const getCompressionOptions = (file) => {
  // Базовые опции
  const options = {
    maxSizeMB: 1, // Максимальный размер после сжатия
    useWebWorker: true,
    maxWidthOrHeight: MAX_WIDTH, // Максимальная ширина
    preserveExif: false, // Не сохраняем метаданные
  };

  // Настройка качества в зависимости от формата
  if (file.type === 'image/png' || file.type === 'image/svg+xml') {
    options.maxSizeMB = 2; // Для PNG и SVG меньше сжимаем
  } else if (file.type === 'image/gif') {
    options.maxSizeMB = 3; // GIF плохо сжимаются, особенно анимированные
  } else if (file.type === 'image/webp') {
    options.maxSizeMB = 0.8; // WebP хорошо сжимается
  }

  // Если файл меньше 100KB, не сжимаем сильно
  if (file.size < 100 * 1024) {
    options.maxSizeMB = Math.max(file.size / (1024 * 1024) * 0.9, 0.1);
  }

  return options;
};

/**
 * Сжимает изображение
 * @param {File} file - Исходный файл изображения
 * @param {Function} onProgress - Колбэк для отслеживания прогресса
 * @returns {Promise<{file, originalSize, compressedSize, compressedFile}>}
 */
export const compressImage = async (file, onProgress) => {
  try {
    // Handle HEIC/HEIF files
    if (isHeic(file)) {
      file = await convertHeicToJpeg(file);
    }

    // Get compression options based on the file
    const options = getCompressionOptions(file);
    
    // Process image compression
    const compressedFile = await imageCompression(file, {
      ...options,
      onProgress,
    });

    // Check if image is oversized
    const img = new Image();
    const imageUrl = URL.createObjectURL(compressedFile);
    
    return new Promise((resolve, reject) => {
      img.onload = () => {
        // Add isOversized flag for images wider than 1680px
        const isOversized = img.width > 1680;
        URL.revokeObjectURL(imageUrl);
        resolve({
          file: compressedFile,
          isOversized,
          dimensions: {
            width: img.width,
            height: img.height
          }
        });
      };
      
      img.onerror = (error) => {
        URL.revokeObjectURL(imageUrl);
        reject(error);
      };
      
      img.src = imageUrl;
    });
  } catch (error) {
    console.error("Error compressing image:", error);
    throw error;
  }
};

/**
 * Создает zip-архив из файлов
 * @param {Array<File>} files - Массив файлов для добавления в архив
 * @param {string} zipName - Имя архива
 * @returns {Promise<Blob>} - Blob с архивом
 */
const createZipArchive = async (files) => {
  const zip = new JSZip();
  
  // Добавляем файлы в архив
  files.forEach((file) => {
    const fileName = file.name;
    zip.file(fileName, file);
  });
  
  // Создаем архив
  const blob = await zip.generateAsync({ 
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: {
      level: 6
    }
  }, (metadata) => {
    // Тут можно добавить обработку прогресса создания архива
    console.log(`Zip progress: ${metadata.percent.toFixed(2)}%`);
  });
  
  return blob;
};

/**
 * Получает имя для zip архива на основе текущей даты
 */
const getZipFileName = () => {
  const now = new Date();
  const datePart = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const timePart = now.toTimeString().split(' ')[0].replace(/:/g, '.'); // HH.MM.SS
  
  return `compressed_images_${datePart}_${timePart}.zip`;
};

/**
 * Обрабатывает очередь изображений
 * @param {Array<File>} files - Массив файлов для обработки
 * @param {Object} options - Настройки обработки
 * @param {Function} onFileProgress - Колбэк для отслеживания прогресса по каждому файлу
 * @param {Function} onFileComplete - Колбэк при завершении обработки файла
 * @param {Function} onFileError - Колбэк при ошибке обработки файла
 */
export const processQueue = async (
  files, 
  { 
    onFileProgress, 
    onFileComplete, 
    onFileError 
  }
) => {
  const compressedFiles = [];
  
  // Обрабатываем каждый файл по очереди
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    try {
      // Отправляем прогресс начала обработки
      onFileProgress(file.name, 0);
      
      // Сжимаем изображение с отслеживанием прогресса
      const compressResult = await compressImage(
        file,
        (progress) => {
          // Обновляем прогресс для текущего файла
          onFileProgress(file.name, progress);
        }
      );
      
      // Создаем результат
      const compressedFile = compressResult.file;
      
      // Добавляем сжатый файл в массив
      compressedFiles.push(compressedFile);
      
      // Уведомляем о завершении
      onFileComplete(file.name, compressedFile.size);
    } catch (error) {
      console.error(`Error processing ${file.name}:`, error);
      onFileError(file.name);
    }
  }
  
  // Если есть обработанные файлы
  if (compressedFiles.length > 0) {
    if (compressedFiles.length === 1) {
      // Если только один файл, скачиваем его напрямую
      saveAs(compressedFiles[0], compressedFiles[0].name);
    } else {
      // Если больше одного файла, создаем архив
      try {
        const zipBlob = await createZipArchive(compressedFiles);
        const zipFileName = getZipFileName();
        
        // Скачиваем архив
        saveAs(zipBlob, zipFileName);
      } catch (error) {
        console.error('Error creating zip archive:', error);
        
        // В случае ошибки, скачиваем файлы по отдельности
        compressedFiles.forEach(file => {
          saveAs(file, file.name);
        });
      }
    }
  }
}; 
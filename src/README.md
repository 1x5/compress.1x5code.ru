# Исходный код (src)

В этой директории содержится весь исходный код React-приложения:

## Структура директории

- **components/** - Компоненты React, формирующие интерфейс приложения
- **utils/** - Утилиты и вспомогательные функции
- **App.jsx** - Главный компонент приложения
- **index.js** - Точка входа React-приложения
- **styles.css** - Глобальные стили приложения

## Особенности архитектуры

### App.jsx
Основной компонент, который:
- Объединяет все остальные компоненты
- Управляет состоянием приложения
- Координирует процесс загрузки и обработки изображений
- Организует пользовательский интерфейс
- Реализует функциональность drag-and-drop на всей странице
- Обрабатывает различные состояния загрузки файлов

### index.js
Точка входа, которая:
- Подключает React к DOM
- Инициализирует глобальные стили
- Настраивает рендеринг приложения
- Подключает необходимые полифиллы для поддержки разных браузеров

### styles.css
Глобальные стили, включающие:
- Основные настройки шрифтов и цветовой схемы
- Адаптивный дизайн для различных устройств
- Сброс стандартных стилей браузера
- Общие классы и утилиты для стилизации
- Темная тема оформления
- Отзывчивый grid-layout для предпросмотра изображений
- Анимации и эффекты для улучшения пользовательского опыта

## Поток данных

1. Пользователь загружает изображения через общую область drag-and-drop
2. App.jsx получает файлы и обновляет состояние
3. Файлы отображаются в компонентах ImagePreview
4. Утилита imageCompressor.js обрабатывает файлы
5. ProgressBar показывает прогресс обработки для каждого файла
6. FileInfo отображает информацию о сжатии
7. По завершении обработки:
   - Если обработан один файл, он автоматически скачивается
   - Если обработано несколько файлов, они упаковываются в ZIP-архив и скачиваются

## Технические особенности
- Используется функциональный подход с React Hooks
- Компоненты разделены по принципу единой ответственности
- Утилиты изолированы от UI-логики для лучшей тестируемости
- Асинхронная обработка нескольких файлов с отображением прогресса
- Объединение обработанных файлов в архив 
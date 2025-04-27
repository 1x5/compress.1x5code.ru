import React from 'react';

const ProgressBar = ({ progress, status }) => {
  // Убедимся, что progress всегда от 0 до 100
  const safeProgress = Math.min(Math.max(0, progress || 0), 100);
  
  // Определение класса для полосы в зависимости от статуса
  let statusClass = '';
  if (status === 'processing') {
    statusClass = 'processing';
  } else if (status === 'completed') {
    statusClass = 'completed';
  } else if (status === 'error') {
    statusClass = 'error';
  }

  return (
    <div className="progress-container">
      <div 
        className={`progress-bar ${statusClass}`} 
        style={{ width: `${safeProgress}%` }}
      />
    </div>
  );
};

export default ProgressBar; 
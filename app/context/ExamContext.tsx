import React, { createContext, useState, useContext } from 'react';

const ExamContext = createContext<any>(null);

export const ExamProvider = ({ children }: { children: React.ReactNode }) => {
  const [history, setHistory] = useState<any[]>([]);
  const [violations, setViolations] = useState<any[]>([]);

  const addHistory = (examData: any) => {
    setHistory((prev) => [examData, ...prev]);
  };

  const addViolation = (violationData: any) => {
    setViolations((prev) => [violationData, ...prev]);
  };

  return (
    <ExamContext.Provider value={{ history, addHistory, violations, addViolation }}>
      {children}
    </ExamContext.Provider>
  );
};

export const useExam = () => useContext(ExamContext);
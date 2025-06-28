import React, { createContext, useState, useCallback } from 'react';

interface StudyUpdateContextType {
  lastUpdate: number;
  triggerUpdate: () => void;
}

const StudyUpdateContext = createContext<StudyUpdateContextType | undefined>(undefined);

export const StudyUpdateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  const triggerUpdate = useCallback(() => {
    setLastUpdate(prevUpdate => {
      const newTimestamp = Date.now();
      console.log('[StudyUpdate] triggerUpdate called, updating from', prevUpdate, 'to', newTimestamp);
      return newTimestamp;
    });
  }, []);

  return <StudyUpdateContext.Provider value={{ lastUpdate, triggerUpdate }}>{children}</StudyUpdateContext.Provider>;
};

export { StudyUpdateContext };

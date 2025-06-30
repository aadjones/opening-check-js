import { useContext } from 'react';
import { StudyUpdateContext } from './StudyUpdateContext';

export function useStudyUpdate() {
  const ctx = useContext(StudyUpdateContext);
  if (!ctx) throw new Error('useStudyUpdate must be used within a StudyUpdateProvider');
  console.log('[StudyUpdate] useStudyUpdate called, lastUpdate:', ctx.lastUpdate);
  return ctx.lastUpdate;
}

export function useTriggerStudyUpdate() {
  const ctx = useContext(StudyUpdateContext);
  if (!ctx) throw new Error('useTriggerStudyUpdate must be used within a StudyUpdateProvider');
  console.log('[StudyUpdate] useTriggerStudyUpdate called, triggerUpdate function available');
  return ctx.triggerUpdate;
}

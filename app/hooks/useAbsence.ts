// hooks/useAbsence.ts
import { useState, useCallback } from 'react';
import { absenceService } from '@/lib/absence';
import { AbsenceRequest, AbsenceResponse } from '@/lib/types';

export const useAbsence = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const executeService = useCallback(async <T>(
    serviceCall: () => Promise<T>
  ): Promise<T> => {
    setLoading(true);
    setError(null);
    try {
      const result = await serviceCall();
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createAbsences = useCallback((request: AbsenceRequest) => 
    executeService(() => absenceService.createAbsences(request)), 
    [executeService]
  );

  const getAbsencesByStudent = useCallback((studentId: string) => 
    executeService(() => absenceService.getAbsencesByStudent(studentId)), 
    [executeService]
  );

  const getAbsencesByModule = useCallback((moduleId: string) => 
    executeService(() => absenceService.getAbsencesByModule(moduleId)), 
    [executeService]
  );

  const getAbsencesByStudentAndModule = useCallback((studentId: string, moduleId: string) => 
    executeService(() => absenceService.getAbsencesByStudentAndModule(studentId, moduleId)), 
    [executeService]
  );

  const getAbsencesByDate = useCallback((date: string) => 
    executeService(() => absenceService.getAbsencesByDate(date)), 
    [executeService]
  );

  const getAbsencesByModuleAndDate = useCallback((moduleId: string, date: string) => 
    executeService(() => absenceService.getAbsencesByModuleAndDate(moduleId, date)), 
    [executeService]
  );

  const getAbsenceById = useCallback((absenceId: string) => 
    executeService(() => absenceService.getAbsenceById(absenceId)), 
    [executeService]
  );

  const updateAbsence = useCallback((absenceId: string, request: AbsenceRequest) => 
    executeService(() => absenceService.updateAbsence(absenceId, request)), 
    [executeService]
  );

  const deleteAbsence = useCallback((absenceId: string) => 
    executeService(() => absenceService.deleteAbsence(absenceId)), 
    [executeService]
  );

  const getAllAbsences = useCallback(() => 
    executeService(() => absenceService.getAllAbsences()), 
    [executeService]
  );

  return {
    loading,
    error,
    clearError,
    createAbsences,
    getAbsencesByStudent,
    getAbsencesByModule,
    getAbsencesByStudentAndModule,
    getAbsencesByDate,
    getAbsencesByModuleAndDate,
    getAbsenceById,
    updateAbsence,
    deleteAbsence,
    getAllAbsences,
  };
};
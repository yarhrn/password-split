import { decodePartFromBase64, reconstruct, type Part } from '@root/ssss/shamir';
import { isLeft, isRight } from '@root/ssss/either';
import { create } from 'zustand';

export interface PartWithUI {
  part: Part;
  id: string;
  source: 'manual' | 'file';
  fileName?: string;
}

export type ReconstructResult = 'SUCCESS' | 'ERROR' | 'INSUFFICIENT_PARTS';

export type ReconstructorStore = {
  parts: PartWithUI[];
  currentPartInput: string;
  reconstructedPassword?: string;
  error?: string;
  threshold?: number;
  schemeId?: string;

  setCurrentPartInput: (input: string) => void;
  addManualPart: () => boolean;
  addFilePart: (content: string, fileName: string) => boolean;
  removePart: (id: string) => void;
  clearAll: () => void;
  reconstruct: () => Promise<ReconstructResult>;
};

export const useReconstructorStore = create<ReconstructorStore>()((set, get) => {
  const validateAndAddPart = (base64Content: string, source: 'manual' | 'file', fileName?: string): boolean => {
    const state = get();

    try {
      const decodedPart = decodePartFromBase64(base64Content);

      if (state.schemeId === undefined) {
        set({
          schemeId: decodedPart.metadata.schemeId,
          threshold: decodedPart.metadata.threshold,
          error: undefined,
        });
      } else if (decodedPart.metadata.schemeId !== state.schemeId) {
        set({ error: 'This part belongs to a different scheme. All parts must be from the same password split.' });
        return false;
      }

      const isDuplicate = state.parts.some(partWithUI => {
        return partWithUI.part.position === decodedPart.position;
      });

      if (isDuplicate) {
        set({ error: 'This part position has already been added.' });
        return false;
      }

      const newPartWithUI: PartWithUI = {
        part: decodedPart,
        id: crypto.randomUUID(),
        source,
        fileName,
      };

      set({
        parts: [...state.parts, newPartWithUI],
        error: undefined,
      });
      return true;
    } catch (error) {
      set({ error: `Invalid part format: ${(error as Error).message}` });
      return false;
    }
  };

  return {
    parts: [],
    currentPartInput: '',

    setCurrentPartInput: (input: string) => {
      set({ currentPartInput: input });
    },

    addManualPart: () => {
      const { currentPartInput } = get();
      if (!currentPartInput.trim()) return false;

      const success = validateAndAddPart(currentPartInput.trim(), 'manual');
      if (success) {
        set({ currentPartInput: '' });
      }
      return success;
    },

    addFilePart: (content: string, fileName: string) => {
      const success = validateAndAddPart(content.trim(), 'file', fileName);
      if (!success) {
        const { error } = get();
        if (error?.includes('Invalid part format:')) {
          set({ error: `Invalid part in file "${fileName}": ${error.replace('Invalid part format: ', '')}` });
        }
      }
      return success;
    },

    removePart: (id: string) => {
      const { parts } = get();
      const filtered = parts.filter(partWithUI => partWithUI.id !== id);

      if (filtered.length === 0) {
        set({
          parts: filtered,
          schemeId: undefined,
          threshold: undefined,
          reconstructedPassword: undefined,
          error: undefined,
        });
      } else {
        set({ parts: filtered });
      }
    },

    clearAll: () => {
      set({
        parts: [],
        currentPartInput: '',
        reconstructedPassword: undefined,
        error: undefined,
        threshold: undefined,
        schemeId: undefined,
      });
    },

    reconstruct: async () => {
      const { parts } = get();
      set({ error: undefined });

      try {
        const inputParts = parts.map(partWithUI => partWithUI.part);
        const result = await reconstruct(inputParts);

        if (isLeft(result)) {
          set({
            error: result.value.error,
            reconstructedPassword: undefined,
          });
          return 'ERROR';
        }

        if (isRight(result)) {
          set({ reconstructedPassword: result.value.secret });
          return 'SUCCESS';
        }

        return 'ERROR';
      } catch (error) {
        set({
          error: (error as Error).message,
          reconstructedPassword: undefined,
        });
        return 'ERROR';
      }
    },
  };
});

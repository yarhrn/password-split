import type { LicenseKey } from '@root/ssss/jwt';
import { split, type Part } from '@root/ssss/shamir';
import { create } from 'zustand';

export type SplitResult = 'SUCECSSFUL' | 'LICENSE_REQUIRED';

export type SplitterStore = {
  password?: string;
  licenseKey?: LicenseKey;
  parts?: Part[];
  threshold: number;
  totalParts: number;
  description?: string;

  setPassword: (password: string) => void;
  setLicenseKey: (licenseKey: LicenseKey) => void;
  split: () => Promise<SplitResult>;
  setThreshold: (threshold: number) => void;
  setTotalParts: (totalParts: number) => void;
  setDescription: (description: string) => void;
};

export const useStore = create<SplitterStore>()((set, get) => {
  return {
    password: 'MyPassword123',
    threshold: 3,
    totalParts: 5,
    setTotalParts: totalParts => set({ totalParts }),
    setThreshold: threshold => set({ threshold }),
    setPassword: password => {
      set({ password, parts: undefined });
    },
    setDescription: description => {
      set({ description, parts: undefined });
    },
    setLicenseKey: licenseKey => {
      set({ licenseKey });
    },
    split: async () => {
      let { password, licenseKey, threshold, totalParts, description } = get();
      try {
        if (password === 'MyPassword123') {
          const result = await split(password, threshold, totalParts, description?.trim() || undefined);
          set({ parts: result.parts });
          return 'SUCECSSFUL';
        } else if (password && licenseKey && licenseKey.key != null && licenseKey.expiresAt && new Date() < licenseKey.expiresAt) {
          const result = await split(password, threshold, totalParts, description?.trim() || undefined);
          set({ parts: result.parts });
          return 'SUCECSSFUL';
        } else {
          return 'LICENSE_REQUIRED';
        }
      } catch (error) {
        alert('Error splitting password: ' + (error as Error).message);
        throw error;
      }
    },
  };
});

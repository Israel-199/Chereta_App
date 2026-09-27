import { create } from "zustand";
import { persist } from "zustand/middleware";
import { zustandStorage } from "./storage";
import { getProfile } from "../api/auth";
import { useNotificationStore } from "./notificationStore";
import { translations } from "../translations";

type AuthState = {
  token: string | null;
  setToken: (t: string) => void;
  clearToken: () => void;

  language: string;
  setLanguage: (lang: string) => void;

  loading: boolean;
  setLoading: (val: boolean) => void;

  profile: any | null;
  myEqubs: any[];
  attachments: any[]; 
  setProfile: (p: any) => void;
  setMyEqubs: (eqs: any[]) => void;
  setAttachments: (atts: any[]) => void;

  preloadData: () => Promise<void>;
  quickCheckStatus: () => Promise<void>;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      setToken: (t) => set({ token: t, profile: null, myEqubs: [], attachments: [] }),
      clearToken: () => set({ token: null, profile: null, myEqubs: [], attachments: [] }),

      language: "English",
      setLanguage: (lang) => set({ language: lang }),

      loading: false,
      setLoading: (val) => set({ loading: val }),

      profile: null,
      myEqubs: [],
      attachments: [],
      setProfile: (p) => set({ profile: p }),
      setMyEqubs: (eqs) => set({ myEqubs: eqs }),
      setAttachments: (atts) => set({ attachments: atts }),

      preloadData: async () => {
        const token = get().token;
        if (!token) return;
        try {
          const profile = await getProfile();
          set({
            profile,
            myEqubs: [],
            attachments: profile?.attachments || [],
          });
        } catch (err: any) {
          const status = err?.response?.status;
          if (status !== 401) {
            console.warn("Preload error:", err?.message || err);
          }
        }
      },
      quickCheckStatus: async () => {
        const token = get().token;
        if (!token) return;
        try {
          const profile = await getProfile();
          const current = get().profile;
          const language = get().language;

          if (profile.status !== current?.status || profile.idStatus !== current?.idStatus) {
             if (current?.idStatus === 'PENDING' && (profile.idStatus === 'VERIFIED' || profile.idStatus === 'REJECTED')) {
                const t = translations[language] || translations.English;
                const title = profile.idStatus === 'VERIFIED' ? t.verificationVerified : t.verificationRejected;
                const message = profile.idStatus === 'VERIFIED' ? t.kycVerifiedNotify : t.kycRejectedNotify;

                useNotificationStore.getState().addNotification({
                  title,
                  message,
                  type: 'KYC_UPDATE'
                });
             }

             set({ profile });
          }
        } catch (err) {
        }
      },

    }),
    {
      name: "auth-storage",
      storage: zustandStorage,
      partialize: (state) => ({
        token: state.token,
        language: state.language,
        profile: state.profile,
      }),
    },
  ),
);

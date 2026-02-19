import { create } from 'zustand';
import { fetchOrderTemplates, saveOrderTemplate as saveOrderTemplateApi } from '@/services';
import type { OrderTemplate, TemplateField } from '@/types';

interface OrderTemplateState {
  templates: OrderTemplate[];
  selectedTemplate?: OrderTemplate;
  loading: boolean;
  error: string | null;
  setTemplates: (templates: OrderTemplate[]) => void;
  loadTemplates: () => Promise<void>;
  selectTemplate: (template?: OrderTemplate) => void;
  updateFields: (fields: TemplateField[]) => void;
  saveTemplate: () => Promise<void>;
}

export const useOrderTemplateStore = create<OrderTemplateState>((set, get) => ({
  templates: [],
  selectedTemplate: undefined,
  loading: false,
  error: null,

  setTemplates: (templates: OrderTemplate[]) => set({ templates }),

  loadTemplates: async () => {
    set({ loading: true, error: null });
    try {
      const templates = await fetchOrderTemplates();
      set({ templates });
    } catch (e: unknown) {
      set({ error: (e as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  selectTemplate: (template?: OrderTemplate) => set({ selectedTemplate: template }),

  updateFields: (fields: TemplateField[]) =>
    set((state) => ({
      selectedTemplate: state.selectedTemplate
        ? { ...state.selectedTemplate, fields }
        : undefined,
    })),

  saveTemplate: async () => {
    const { selectedTemplate } = get();
    if (!selectedTemplate) return;
    set({ loading: true, error: null });
    try {
      const saved = await saveOrderTemplateApi(selectedTemplate);
      set((state) => ({
        templates: state.templates.map((t) =>
          t.templateId === saved.templateId ? saved : t
        ),
        selectedTemplate: saved,
      }));
    } catch (e: unknown) {
      set({ error: (e as Error).message });
    } finally {
      set({ loading: false });
    }
  },
}));

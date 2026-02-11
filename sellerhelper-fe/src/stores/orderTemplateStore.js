import { create } from 'zustand';
import { fetchOrderTemplates, saveOrderTemplate as saveOrderTemplateApi } from '@/services';

/**
 * 발주서 템플릿 필드
 * @typedef {Object} TemplateField
 * @property {string} fieldKey
 * @property {string} fieldLabel
 * @property {boolean} enabled
 * @property {boolean} required
 * @property {number} order
 */
/**
 * 발주서 템플릿
 * @typedef {Object} OrderTemplateItem
 * @property {number} templateId
 * @property {number} vendorId
 * @property {string} templateName
 * @property {boolean} isDefault
 * @property {TemplateField[]} fields
 */
/**
 * @typedef {Object} OrderTemplateState
 * @property {OrderTemplateItem[]} templates
 * @property {OrderTemplateItem|undefined} selectedTemplate
 * @property {boolean} loading
 * @property {string|null} error
 * @property {function(OrderTemplateItem[]): void} setTemplates
 * @property {function(): Promise<void>} loadTemplates
 * @property {function(OrderTemplateItem): void} selectTemplate
 * @property {function(TemplateField[]): void} updateFields
 * @property {function(): Promise<void>} saveTemplate
 */
/** @type {import('zustand').UseBoundStore<import('zustand').StoreApi<OrderTemplateState>>} */
export const useOrderTemplateStore = create((set, get) => ({
  templates: [],
  selectedTemplate: undefined,
  loading: false,
  error: null,

  setTemplates: (templates) => set({ templates }),

  loadTemplates: async () => {
    set({ loading: true, error: null });
    try {
      const templates = await fetchOrderTemplates();
      set({ templates });
    } catch (e) {
      set({ error: e.message });
    } finally {
      set({ loading: false });
    }
  },

  selectTemplate: (template) => set({ selectedTemplate: template }),

  updateFields: (fields) =>
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
    } catch (e) {
      set({ error: e.message });
    } finally {
      set({ loading: false });
    }
  },
}));

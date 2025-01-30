// store.js
import { create } from 'zustand';
import { v4 as uuid } from 'uuid';

export const useStore = create((set) => ({
  components: [],
  selectedComponent: null,
  addComponent: (component) =>
    set((state) => ({ components: [...state.components, component] })),
  updateComponentPosition: (id, x, y) =>
    set((state) => ({
      components: state.components.map((comp) =>
        comp.id === id ? { ...comp, x, y } : comp
      ),
    })),
  // Add nested component logic here
}));

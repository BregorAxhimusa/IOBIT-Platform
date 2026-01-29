import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavoritesState {
  favorites: string[];
  addFavorite: (symbol: string) => void;
  removeFavorite: (symbol: string) => void;
  toggleFavorite: (symbol: string) => void;
  isFavorite: (symbol: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],

      addFavorite: (symbol) =>
        set((state) => {
          if (!state.favorites.includes(symbol)) {
            return { favorites: [...state.favorites, symbol] };
          }
          return state;
        }),

      removeFavorite: (symbol) =>
        set((state) => ({
          favorites: state.favorites.filter((s) => s !== symbol),
        })),

      toggleFavorite: (symbol) => {
        const state = get();
        if (state.favorites.includes(symbol)) {
          state.removeFavorite(symbol);
        } else {
          state.addFavorite(symbol);
        }
      },

      isFavorite: (symbol) => {
        return get().favorites.includes(symbol);
      },
    }),
    {
      name: 'iobit-favorites',
    }
  )
);

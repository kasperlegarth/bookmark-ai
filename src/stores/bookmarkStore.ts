import { defineStore } from 'pinia';
import type { Bookmark } from '@/types/Bookmark';

export const useBookmarkStore = defineStore('bookmarkStore', {
  state: () => {
    const bookmarks = localStorage.getItem('bookmarks');
    return {
      bookmarks: bookmarks ? JSON.parse(bookmarks) : [] as Bookmark[],
    };
  },
  getters: {
    getBookmarkById: (state) => (id: number) => state.bookmarks.find((bookmark: { id: number; }) => bookmark.id === id),
  },
  actions: {
    addBookmark(bookmark: Bookmark) {
      this.bookmarks.push(bookmark);
      localStorage.setItem('bookmarks', JSON.stringify(this.bookmarks));
    },
    removeBookmarkById(bookmarkId: number) {
      this.bookmarks = this.bookmarks.filter((bookmark: { id: number; }) => bookmark.id !== bookmarkId);
      localStorage.setItem('bookmarks', JSON.stringify(this.bookmarks));
    },
    updateBookmarkById(bookmarkId: number, updatedBookmark: Partial<Bookmark>) {
      const index = this.bookmarks.findIndex((bookmark: { id: number; }) => bookmark.id === bookmarkId);
      if (index !== -1) {
      this.bookmarks[index] = { ...this.bookmarks[index], ...updatedBookmark };
      localStorage.setItem('bookmarks', JSON.stringify(this.bookmarks));
      }
    }
  },
});

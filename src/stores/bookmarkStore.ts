import { defineStore } from 'pinia';
import type { Bookmark } from '@/types/Bookmark';
import bookmarksData from '@/data/bookmarks.json';

export const useBookmarkStore = defineStore('bookmarkStore', {
  state: () => {
    const bookmarks = localStorage.getItem('bookmarks');
    return {
      bookmarks: bookmarks ? JSON.parse(bookmarks) : (import.meta.env.MODE === 'development' ? bookmarksData : [] as Bookmark[]),
    };
  },
  getters: {
    getBookmarkById: (state) => (id: number) => state.bookmarks.find((bookmark: { id: number; }) => bookmark.id === id),
    totalBookmarks: (state) => state.bookmarks.length,
    allTags: (state) => {
      const tags = new Set<string>();
      state.bookmarks.forEach((bookmark: Bookmark) => {
        bookmark.tags.forEach((tag: string) => tags.add(tag));
      });
      return Array.from(tags).sort();
    }
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

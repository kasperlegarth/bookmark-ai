import { defineStore } from 'pinia';
import type { Bookmark } from '@/types/Bookmark';
import bookmarksData from '@/data/bookmarks.json';
import type { Tag } from '@/types/Tag';

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
    allTags: (state): Tag[] => {
      const tagCounts: { [key: string]: number } = {};
      state.bookmarks.forEach((bookmark: Bookmark) => {
        bookmark.tags.forEach((tag: Tag) => {
          const tagLabel = typeof tag === 'string' ? tag : tag.label;
          if (tagCounts[tagLabel]) {
            tagCounts[tagLabel]++;
          } else {
            tagCounts[tagLabel] = 1;
          }
        });
      });
      return Object.keys(tagCounts)
        .map(tag => ({
          value: tag.toLocaleLowerCase().replace(' ', '-'),
          label: tag,
          count: tagCounts[tag],
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
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

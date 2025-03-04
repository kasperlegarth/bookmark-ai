<script setup lang="ts">
// Imports
import { Filter } from "lucide-vue-next"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import {
  Pagination,
  PaginationEllipsis,
  PaginationList,
  PaginationListItem,
  PaginationNext,
  PaginationPrev,
} from '@/components/ui/pagination'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Settings from '@/components/Settings.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import BookmarkList from '@/components/BookmarkList.vue'
import BookmarkForm from '@/components/BookmarkForm.vue'
import { useBookmarkStore } from '@/stores/bookmarkStore';
import { computed, ref } from 'vue';
import type { Bookmark } from "./types/Bookmark"

// State and Variables
const bookmarkStore = useBookmarkStore();
const pageSize = ref(10);
const currentPage = ref(1);
const step = ref(1);
const mode = ref<'add' | 'edit'>('add');
const dialogOpen = ref(false);
const editId = ref(0);
const url = ref('');
const siteName = ref('');
const description = ref('');
const tags = ref<string[]>([]);
const searchQuery = ref('');

// Methods
function addBookmark() {
  if(step.value === 1) {
    step.value = 2;
  } else {
    if(mode.value === 'edit') {
      bookmarkStore.updateBookmarkById(editId.value, {
        url: url.value,
        site: siteName.value,
        description: description.value,
        tags: tags.value,
      });
    } else {
      bookmarkStore.addBookmark({
        id: bookmarkStore.bookmarks.length ? Math.max(...bookmarkStore.bookmarks.map((b: { id: number }) => b.id)) + 1 : 1,
        url: url.value,
        site: siteName.value,
        description: description.value,
        tags: tags.value, 
      });
    }
    step.value = 1;
    dialogOpen.value = false;
  }

  resetForm();
}

function resetForm() {
  url.value = '';
  siteName.value = '';
  description.value = '';
  tags.value = [];
  step.value = 1;
  mode.value = 'add';
}

function editBookmark(bookmarkId: number) {
  const bookmark = bookmarkStore.getBookmarkById(bookmarkId); 
  
  if(!bookmark) {
    return;
  }

  mode.value = 'edit';
  editId.value = bookmarkId;
  url.value = bookmark.url;
  siteName.value = bookmark.site;
  description.value = bookmark.description;
  tags.value = bookmark.tags.join(', ');
  step.value = 2;
  dialogOpen.value = true;
}

const searchedBookmarks = computed(() => {
  if (searchQuery.value === '') {
    return bookmarkStore.bookmarks;
  }

  const query = searchQuery.value.toLowerCase();
  const queryWords = query.split(' ');

  return bookmarkStore.bookmarks
    .map((bookmark: Bookmark) => {
      let score = 0;

      // Check for exact match
      if (bookmark.site.toLowerCase().includes(query)) {
        score += 10;
      }

      if (bookmark.description.toLowerCase().includes(query)) {
        score += 5;
      }

      // Check for word matches
      queryWords.forEach(word => {
        const siteMatches = bookmark.site.toLowerCase().split(word).length - 1;
        const descriptionMatches = bookmark.description.toLowerCase().split(word).length - 1;
        score += siteMatches * 3;
        score += descriptionMatches * 1;
      });

      return { ...bookmark, score };
    })
    .filter((bookmark: { score: number }) => bookmark.score > 0)
    .sort((a: { score: number }, b: { score: number }) => b.score - a.score);
});

</script>

<template>
  <Card>
    <CardHeader>
      <div class="flex flex-row items-end">
        <div class="w-3/4">
          <CardTitle class="text-2xl font-bold tracking-tight">Bookmark AI</CardTitle>
          <CardDescription class="text-md text-muted-foreground">AI-powered bookmark manager</CardDescription>
        </div>
        <div class="w-1/4 flex justify-end">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <ThemeToggle />
              </TooltipTrigger>
              <TooltipContent>
                <p>Theme</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Settings />
              </TooltipTrigger>
              <TooltipContent>
                <p>Settings</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <div class="flex flex-row items-end mt-4">
        <div class="w-3/4">
          <div className="flex w-full max-w-sm items-center space-x-2">
            <Input type="search" v-model="searchQuery" placeholder="Search for boomark" class="text-sm" />
            <Button class="text-sm">
              <Filter />
              Filter
            </Button>
          </div>
        </div>
        <div class="w-1/4 flex justify-end">
          <BookmarkForm
            :dialogOpen="dialogOpen"
            :mode="mode"
            :step="step"
            :url="url"
            :siteName="siteName"
            :description="description"
            :tags="tags"
            :editId="editId"
            @addBookmark="addBookmark"
            @resetForm="resetForm"
          />
        </div>
      </div>
      <div v-if="searchedBookmarks.length > 0" class="flex flex-row mt-6">
        <BookmarkList :headers="['Site', 'Description', 'Tags']" :rows="searchedBookmarks" :page="currentPage" :pageSize="pageSize" :searchQuery="searchQuery"
          @edit="editBookmark" />
      </div>
      <div v-else class="flex flex-col items-center text-center w-full">
        <p class="text-lg text-muted-foreground">No bookmarks found</p>
      </div>
    </CardContent>
    <CardFooter v-if="searchedBookmarks.length > 10">
      <Pagination v-slot="{ page }" :items-per-page="pageSize" :sibling-count="1" show-edges :total="searchedBookmarks.length">
        <PaginationList v-slot="{ items }" class="flex item-center gap-1">
          <PaginationPrev @click="currentPage = currentPage - 1" />

          <template v-for="(item, index) in items">
            <PaginationListItem v-if="item.type === 'page'" :key="index" :value="item.value" as-child>
              <Button @click="currentPage = item.value" class="w-10 h-10 p-0" :variant="item.value === page ? 'default' : 'outline'">
                {{ item.value }}
              </Button>
            </PaginationListItem>
            <PaginationEllipsis v-else :key="item.type" :index="index" />
          </template>

          <PaginationNext @click="currentPage = currentPage + 1" />
        </PaginationList>
      </Pagination>
      <div class="flex justify-end ml-auto w-48 items-center">
        <div class="text-sm flex-shrink-0 flex-grow-0 mr-4">Items per page:</div>
        <Select v-model="pageSize">
          <SelectTrigger>
            <SelectValue>{{ pageSize }}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Items per page</SelectLabel>
              <SelectItem :value="10">10</SelectItem>
              <SelectItem :value="25">25</SelectItem>
              <SelectItem :value="50">50</SelectItem>
              <SelectItem :value="100">100</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </CardFooter>
  </Card>
</template>

<style lang="scss">
.expand-reveal {
  height: 0;
  overflow: hidden;
  transition: height 0.3s ease-in-out;

  &.expanded {
    height: max-content;
  }
}
</style>
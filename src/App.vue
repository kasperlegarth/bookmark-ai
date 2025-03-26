<script setup lang="ts">
// Imports
import { Calendar, ChevronLeft, ChevronRight, Filter, X } from "lucide-vue-next"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from '@/components/ui/separator'
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogClose, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Pagination, PaginationEllipsis, PaginationList, PaginationListItem, PaginationNext, PaginationPrev } from '@/components/ui/pagination'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Combobox, ComboboxAnchor, ComboboxEmpty, ComboboxGroup, ComboboxInput, ComboboxItem, ComboboxList } from '@/components/ui/combobox'
import { Toaster } from '@/components/ui/toast';
import Settings from '@/components/Settings.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import BookmarkList from '@/components/BookmarkList.vue'
import BookmarkForm from '@/components/BookmarkForm.vue'
import { useBookmarkStore } from '@/stores/bookmarkStore';
import { type Ref, computed, ref, watch } from 'vue';
import type { Bookmark } from "./types/Bookmark"
import type { Tag } from "./types/Tag"
import { cn } from '@/lib/utils'

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

import {
  RangeCalendarCell,
  RangeCalendarCellTrigger,
  RangeCalendarGrid,
  RangeCalendarGridBody,
  RangeCalendarGridHead,
  RangeCalendarGridRow,
  RangeCalendarHeadCell,
} from '@/components/ui/range-calendar'

import {
  CalendarDate,
  type DateValue,
  isEqualMonth,
  today,
  getLocalTimeZone,
  toCalendarDate
} from '@internationalized/date'

import { type DateRange, RangeCalendarRoot, useDateFormatter } from 'reka-ui'
import { createMonth, type Grid, toDate } from 'reka-ui/date'

const bookmarkDateRange = ref({
  start: undefined,
  end: undefined,
}) as Ref<DateRange>

const locale = ref('en-US')
const formatter = useDateFormatter(locale.value)

const placeholder = bookmarkDateRange.value.start ? ref(bookmarkDateRange.value.start) : ref(today(getLocalTimeZone())) as Ref<DateValue>
const secondMonthPlaceholder = bookmarkDateRange.value.end ? ref(bookmarkDateRange.value.end) : ref(today(getLocalTimeZone())) as Ref<DateValue>

const firstMonth = ref(
  createMonth({
    dateObj: toCalendarDate(placeholder.value.subtract({ months: 1 })),
    locale: locale.value,
    fixedWeeks: true,
    weekStartsOn: 0,
  }),
) as Ref<Grid<DateValue>>

const secondMonth = ref(
  createMonth({
    dateObj: toCalendarDate(secondMonthPlaceholder.value),
    locale: locale.value,
    fixedWeeks: true,
    weekStartsOn: 0,
  }),
) as Ref<Grid<DateValue>>

function updateMonth(reference: 'first' | 'second', months: number) {
  if (reference === 'first') {
    placeholder.value = placeholder.value.add({ months })
  }
  else {
    secondMonthPlaceholder.value = secondMonthPlaceholder.value.add({
      months,
    })
  }
}

watch(placeholder, (_placeholder) => {
  firstMonth.value = createMonth({
    dateObj: toCalendarDate(_placeholder),
    weekStartsOn: 0,
    fixedWeeks: false,
    locale: locale.value,
  })
  if (isEqualMonth(toCalendarDate(secondMonthPlaceholder.value), toCalendarDate(_placeholder))) {
    secondMonthPlaceholder.value = secondMonthPlaceholder.value.add({
      months: 1,
    })
  }
})

watch(secondMonthPlaceholder, (_secondMonthPlaceholder) => {
  secondMonth.value = createMonth({
    dateObj: toCalendarDate(_secondMonthPlaceholder),
    weekStartsOn: 0,
    fixedWeeks: false,
    locale: locale.value,
  })
  if (isEqualMonth(toCalendarDate(_secondMonthPlaceholder), toCalendarDate(placeholder.value)))
    placeholder.value = placeholder.value.subtract({ months: 1 })
})

// State and Variables
const bookmarkStore = useBookmarkStore();
const allTags = bookmarkStore.allTags
const pageSize = ref(10);
const currentPage = ref(1);
const step = ref(1);
const mode = ref<'add' | 'edit'>('add');
const dialogOpen = ref(false);
const editId = ref(0);
const url = ref('');
const siteName = ref('');
const description = ref('');
const tags = ref<Tag[]>([]);
const searchQuery = ref('');
const filterDialogOpen = ref(false);
const dialogTagsToShow = ref(10);

watch(filterDialogOpen, (newVal) => {
  if (!newVal) {
    dialogTagsToShow.value = 10;
  }
});

// Methods
function addBookmark() {
  if (step.value === 1) {
    step.value = 2;
  } else {
    if (mode.value === 'edit') {
      bookmarkStore.updateBookmarkById(editId.value, {
        url: url.value,
        site: siteName.value,
        description: description.value,
        tags: tags.value.map(tag => ({ value: tag.value.toLowerCase().replace(' ', '-'), label: tag.label, count: 0 })),
      });
    } else {
      bookmarkStore.addBookmark({
        id: bookmarkStore.bookmarks.length ? Math.max(...bookmarkStore.bookmarks.map((b: { id: number }) => b.id)) + 1 : 1,
        url: url.value,
        site: siteName.value,
        description: description.value,
        tags: tags.value.map(tag => ({ value: tag.value.toLowerCase().replace(' ', '-'), label: tag.label, count: 0 })),
        date: new Date().toISOString().split('T')[0],
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

  if (!bookmark) {
    return;
  }

  mode.value = 'edit';
  editId.value = bookmarkId;
  url.value = bookmark.url;
  siteName.value = bookmark.site;
  description.value = bookmark.description;
  tags.value = bookmark.tags;
  step.value = 2;
  dialogOpen.value = true;
}

/**
 * Creates a new tag object from a given string.
 * @param tagLabel - The label for the new tag.
 * @returns A new tag object.
 */
function createTag(tagLabel: string): Tag {
  return {
    label: tagLabel,
    value: tagLabel.toLowerCase().replace(/\s+/g, '-'),
    count: 0, // Initialize the count property
  };
}

function removeTag(tag: Tag) {
  pickedTags.value = pickedTags.value.filter(pickedTag => pickedTag.value !== tag.value);
}

const pickedTags = ref<Tag[]>([]);
const filteredTags = computed(() => {
  return allTags.filter(tag => !pickedTags.value.includes(tag));
});

const taggedBookmarks = computed(() => {
  if (pickedTags.value.length === 0) {
    return bookmarkStore.bookmarks;
  }

  return bookmarkStore.bookmarks.filter((bookmark: Bookmark) => {
    return bookmark.tags.some(tag => {
      if (typeof tag === 'string') {
        return pickedTags.value.some(pickedTag => {
          return tag === pickedTag.label;
        });
      }

      return pickedTags.value.some(pickedTag => {
        return tag.value === pickedTag.value;
      });
    });
  });
});

const searchedBookmarks = computed(() => {
  if (searchQuery.value === '') {
    return taggedBookmarks.value;
  }

  const query = searchQuery.value.toLowerCase();
  const queryWords = query.split(' ');

  return taggedBookmarks.value
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
            <Dialog v-model:open="filterDialogOpen">
              <DialogTrigger>
                <Button class="text-sm relative">
                  <Filter />
                  Filter
                  <span v-if="pickedTags.length > 0"
                    class="bg-purple-600 rounded-full w-3 h-3 absolute top-0 right-0 translate-x-1.5 translate-y-[-50%]"></span>
                </Button>
              </DialogTrigger>
              <DialogContent class="sm:max-w-[425px] grid-rows-[auto_minmax(0,1fr)_auto] px-0 max-h-[90dvh]">
                <DialogHeader class="px-6">
                  <DialogTitle>
                    Filter Bookmarks
                  </DialogTitle>
                  <DialogDescription>Narrow you bookmark list by adding filters.</DialogDescription>
                </DialogHeader>
                <div class="px-6 py-4 overflow-y-auto max-h-[calc(90vh-5rem)]">
                  <h2 class="text-md font-semibold">Tags</h2>
                  <p class="text-sm text-muted-foreground">Your bookmark should contain atleast one of the picked tags
                  </p>
                  <div class="flex flex-wrap items-center gap-2 mt-2">
                    <Combobox class="w-full" by="label" v-model="pickedTags" multiple>
                      <ComboboxAnchor class="w-full">
                        <div class="relative w-full max-w-sm items-center">
                          <ComboboxInput :display-value="(val) => val?.label ?? ''" placeholder="Select tags..."
                            class="w-full" />
                        </div>
                      </ComboboxAnchor>

                      <ComboboxList class="w-[--reka-popper-anchor-width] max-h-[300px] overflow-y-auto">
                        <ComboboxEmpty>
                          No tags found.
                        </ComboboxEmpty>

                        <ComboboxGroup>
                          <ComboboxItem v-for="tag in filteredTags" :key="tag.value" :value="tag.label" @select.prevent="(ev) => {
                            if (typeof ev.detail.value === 'string') {
                              const tag = createTag(ev.detail.value);
                              pickedTags.push(tag)
                            }
                          }">
                            {{ tag.label }}
                          </ComboboxItem>
                        </ComboboxGroup>
                      </ComboboxList>
                    </Combobox>
                  </div>
                  <div class="flex flex-wrap items-center gap-2 mt-2">
                    <Badge v-for="tag in pickedTags.slice(0, dialogTagsToShow)" :key="tag.value" @click="removeTag(tag)"
                      variant="outline" class="cursor-pointer user-select-none">{{ tag.label }}
                      <X class="w-3 ml-2" />
                    </Badge>
                    <Separator v-if="dialogTagsToShow <= pickedTags.length" class="my-4 w-full cursor-pointer"
                      label="Show more" @click="dialogTagsToShow += 25" />
                  </div>
                  <h2 class="text-md font-semibold mt-5">Period</h2>
                  <p class="text-sm text-muted-foreground">If you have an idea about when you saved your bookmark, you
                    can narrow it down by picking a date range</p>
                  <div class="flex flex-wrap items-center gap-2 mt-2">
                    <Popover>
                      <PopoverTrigger as-child>
                        <Button variant="outline" :class="cn(
                          'w-full justify-start text-left font-normal',
                          !bookmarkDateRange.start && 'text-muted-foreground',
                        )
                          ">
                          <Calendar class="mr-2 h-4 w-4" />
                          <template v-if="bookmarkDateRange.start">
                            <template v-if="bookmarkDateRange.end">
                              {{
                                formatter.custom(toDate(bookmarkDateRange.start), {
                                  dateStyle: "medium",
                              })
                              }}
                              -
                              {{
                                formatter.custom(toDate(bookmarkDateRange.end), {
                                  dateStyle: "medium",
                              })
                              }}
                            </template>

                            <template v-else>
                              {{
                                formatter.custom(toDate(bookmarkDateRange.start), {
                                  dateStyle: "medium",
                              })
                              }}
                            </template>
                          </template>
                          <template v-else>
                            Pick a date
                          </template>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent class="w-auto p-0">
                        <RangeCalendarRoot v-slot="{ weekDays }" v-model="bookmarkDateRange" v-model:placeholder="placeholder"
                          class="p-3">
                          <div class="flex flex-col gap-y-4 mt-4 sm:flex-row sm:gap-x-4 sm:gap-y-0">
                            <div class="flex flex-col gap-4">
                              <div class="flex items-center justify-between">
                                <button :class="cn(
                                  buttonVariants({ variant: 'outline' }),
                                  'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
                                )
                                  " @click="updateMonth('first', -1)">
                                  <ChevronLeft class="h-4 w-4" />
                                </button>
                                <div :class="cn('text-sm font-medium')">
                                  {{
                                    formatter.fullMonthAndYear(
                                      toDate(firstMonth.value),
                                  )
                                  }}
                                </div>
                                <button :class="cn(
                                  buttonVariants({ variant: 'outline' }),
                                  'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
                                )
                                  " @click="updateMonth('first', 1)">
                                  <ChevronRight class="h-4 w-4" />
                                </button>
                              </div>
                              <RangeCalendarGrid>
                                <RangeCalendarGridHead>
                                  <RangeCalendarGridRow>
                                    <RangeCalendarHeadCell v-for="day in weekDays" :key="day" class="w-full">
                                      {{ day }}
                                    </RangeCalendarHeadCell>
                                  </RangeCalendarGridRow>
                                </RangeCalendarGridHead>
                                <RangeCalendarGridBody>
                                  <RangeCalendarGridRow v-for="(
weekDates, index
                  ) in firstMonth.rows" :key="`weekDate-${index}`" class="mt-2 w-full">
                                    <RangeCalendarCell v-for="weekDate in weekDates" :key="weekDate.toString()"
                                      :date="weekDate">
                                      <RangeCalendarCellTrigger :day="weekDate" :month="firstMonth.value" />
                                    </RangeCalendarCell>
                                  </RangeCalendarGridRow>
                                </RangeCalendarGridBody>
                              </RangeCalendarGrid>
                            </div>
                            <div class="flex flex-col gap-4">
                              <div class="flex items-center justify-between">
                                <button :class="cn(
                                  buttonVariants({ variant: 'outline' }),
                                  'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
                                )
                                  " @click="updateMonth('second', -1)">
                                  <ChevronLeft class="h-4 w-4" />
                                </button>
                                <div :class="cn('text-sm font-medium')">
                                  {{
                                    formatter.fullMonthAndYear(
                                      toDate(secondMonth.value),
                                  )
                                  }}
                                </div>

                                <button :class="cn(
                                  buttonVariants({ variant: 'outline' }),
                                  'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
                                )
                                  " @click="updateMonth('second', 1)">
                                  <ChevronRight class="h-4 w-4" />
                                </button>
                              </div>
                              <RangeCalendarGrid>
                                <RangeCalendarGridHead>
                                  <RangeCalendarGridRow>
                                    <RangeCalendarHeadCell v-for="day in weekDays" :key="day" class="w-full">
                                      {{ day }}
                                    </RangeCalendarHeadCell>
                                  </RangeCalendarGridRow>
                                </RangeCalendarGridHead>
                                <RangeCalendarGridBody>
                                  <RangeCalendarGridRow v-for="(
weekDates, index
                  ) in secondMonth.rows" :key="`weekDate-${index}`" class="mt-2 w-full">
                                    <RangeCalendarCell v-for="weekDate in weekDates" :key="weekDate.toString()"
                                      :date="weekDate">
                                      <RangeCalendarCellTrigger :day="weekDate" :month="secondMonth.value" />
                                    </RangeCalendarCell>
                                  </RangeCalendarGridRow>
                                </RangeCalendarGridBody>
                              </RangeCalendarGrid>
                            </div>
                          </div>
                        </RangeCalendarRoot>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <DialogFooter class=" px-6">
                  <DialogClose as-child>
                    <Button type="button" variant="outline" @click="pickedTags = []">
                      Reset
                    </Button>
                    <Button type="button" variant="default" @click="filterDialogOpen = false">
                      See <strong>{{ searchedBookmarks.length }}</strong> bookmarks
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <div class="w-1/4 flex justify-end">
          <BookmarkForm :dialogOpen="dialogOpen" :mode="mode" :step="step" :url="url" :siteName="siteName"
            :description="description" :tags="tags" :editId="editId" @addBookmark="addBookmark"
            @resetForm="resetForm" />
        </div>
      </div>
      <div v-if="searchedBookmarks.length > 0" class="flex flex-row mt-6">
        <BookmarkList :headers="['Site', 'Description', 'Tags']" :rows="searchedBookmarks" :page="currentPage"
          :pageSize="pageSize" :searchQuery="searchQuery" @edit="editBookmark" />
      </div>
      <div v-else class="flex flex-col items-center text-center w-full">
        <p class="text-lg text-muted-foreground">No bookmarks found</p>
      </div>
    </CardContent>
    <CardFooter v-if="searchedBookmarks.length > 10">
      <Pagination v-slot="{ page }" :items-per-page="pageSize" :sibling-count="1" show-edges
        :total="searchedBookmarks.length">
        <PaginationList v-slot="{ items }" class="flex item-center gap-1">
          <PaginationPrev @click="currentPage = currentPage - 1" />

          <template v-for="(item, index) in items">
            <PaginationListItem v-if="item.type === 'page'" :key="index" :value="item.value" as-child>
              <Button @click="currentPage = item.value" class="w-10 h-10 p-0"
                :variant="item.value === page ? 'default' : 'outline'">
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
  <Toaster />
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
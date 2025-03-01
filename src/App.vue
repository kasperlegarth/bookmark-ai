<script setup lang="ts">
import { Filter, BookmarkPlus } from "lucide-vue-next"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "./components/ui/textarea"
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
  PaginationFirst,
  PaginationLast,
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
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import Settings from '@/components/Settings.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import BookmarkList from '@/components/BookmarkList.vue'
import { useBookmarkStore } from '@/stores/bookmarkStore';

import { ref, nextTick } from 'vue';

const bookmarkStore = useBookmarkStore();

const pageSize = ref(10);
const currentPage = ref(1);

const step = ref(1);
const mode = ref<'add' | 'edit'>('add');
const dialogOpen = ref(false);
const editId = ref(0);
const url = ref('');
const siteName = ref('');;
const description = ref('');
const tags = ref('');

function addBookmark() {
  if(step.value === 1) {
    step.value = 2;
  } else {
    if(mode.value === 'edit') {
      bookmarkStore.updateBookmarkById(editId.value, {
        url: url.value,
        site: siteName.value,
        description: description.value,
        tags: tags.value.split(',').map(tag => tag.trim()), 
      });
    } else {
      bookmarkStore.addBookmark({
        id: bookmarkStore.bookmarks.length ? Math.max(...bookmarkStore.bookmarks.map((b: { id: number }) => b.id)) + 1 : 1,
        url: url.value,
        site: siteName.value,
        description: description.value,
        tags: tags.value.split(',').map(tag => tag.trim()), 
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
  tags.value = '';
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
            <Input type="search" placeholder="Search for boomark" class="text-sm" />
            <Button class="text-sm">
              <Filter />
              Filter
            </Button>
          </div>
        </div>
        <div class="w-1/4 flex justify-end">
          <Form v-slot="{ handleSubmit }" as="">
            <Dialog v-model:open="dialogOpen">
              <DialogTrigger>
                <Button>
                  Add Bookmark
                  <BookmarkPlus />
                </Button>
              </DialogTrigger>
              <DialogContent class="sm:max-w-[425px] grid-rows-[auto_minmax(0,1fr)_auto] px-0 max-h-[90dvh]">
                <DialogHeader class="px-6">
                  <DialogTitle><span v-if="mode == 'add'">Add</span><span v-if="mode == 'edit'">Update</span> Bookmark</DialogTitle>
                  <DialogDescription>Fill in the details to add a new bookmark</DialogDescription>
                </DialogHeader>
                <form id="addForm" @submit="handleSubmit($event, addBookmark)" class="grid gap-4 py-4 px-6 overflow-y-auto">
                  <FormField v-slot="{ componentField }" name="url">
                    <FormItem>
                      <FormLabel for="url">Site URL</FormLabel>
                      <FormControl>
                        <Input id="url" type="text" :defaultValue="url" v-model="url" placeholder="https://example.com" v-bind="componentField" />
                      </FormControl>
                      <FormDescription>
                        Input the url you want to bookmark
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  </FormField>
                  <div class="expand-reveal space-y-4" :class="{ expanded: step === 2 }">
                    <FormField v-slot="{ componentField }" name="siteName">
                      <FormItem>
                        <FormLabel for="site">Site Name</FormLabel>
                        <FormControl>
                          <Input id="site" type="text" :defaultValue="siteName" v-model="siteName" placeholder="Site Name" v-bind="componentField" />
                        </FormControl>
                        <FormDescription>
                          Input a name that helps you remember the site
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    </FormField>
                    <FormField v-slot="{ componentField }" name="description">
                      <FormItem>
                        <FormLabel for="description">Description</FormLabel>
                        <FormControl>
                          <Textarea id="description" type="text" :defaultValue="description" v-model="description" placeholder="Description" v-bind="componentField" />
                        </FormControl>
                        <FormDescription>
                          Input a description for the site
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    </FormField>
                    <FormField v-slot="{ componentField }" name="tags">
                      <FormItem>
                        <FormLabel for="tags">Tags</FormLabel>
                        <FormControl>
                          <Input id="tags" type="text" :defaultValue="tags" v-model="tags" placeholder="Tags" v-bind="componentField" />
                        </FormControl>
                        <FormDescription>
                          Input tags to help you categorize the site
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    </FormField>
                  </div>
                </form>
                <DialogFooter class="px-6">
                  <DialogClose as-child>
                    <Button type="button" @click="resetForm" variant="outline">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="submit" form="addForm">
                    <template v-if="step === 1">Next</template>
                    <template v-if="step === 2"><span v-if="mode == 'add'">Add</span><span v-if="mode == 'edit'">Update</span> Bookmark</template>
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </Form>
        </div>
      </div>
      <div class="flex flex-row mt-6">
        <BookmarkList :headers="['Site', 'Description', 'Tags']" :rows="bookmarkStore.bookmarks" :page="currentPage" :pageSize="pageSize"
          @edit="editBookmark" />
      </div>
    </CardContent>
    <CardFooter>
      <Pagination v-slot="{ page }" :items-per-page="pageSize" :total="bookmarkStore.bookmarks.length">
        <PaginationList v-slot="{ items }" class="flex item-center gap-1">
          <PaginationFirst />
          <PaginationPrev />

          <template v-for="(item, index) in items">
            <PaginationListItem v-if="item.type === 'page'" :key="index" :value="item.value" as-child>
              <Button @click="currentPage = item.value" class="w-10 h-10 p-0" :variant="item.value === page ? 'default' : 'outline'">
                {{ item.value }}
              </Button>
            </PaginationListItem>
            <PaginationEllipsis v-else :key="item.type" :index="index" />
          </template>

          <PaginationNext />
          <PaginationLast />
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
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
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
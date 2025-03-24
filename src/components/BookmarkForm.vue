<script setup lang="ts">
// Imports
import type { Tag } from '@/types/Tag';

import { BookmarkPlus, Check } from "lucide-vue-next"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogClose, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Combobox, ComboboxAnchor, ComboboxEmpty, ComboboxGroup, ComboboxInput, ComboboxItem, ComboboxList } from '@/components/ui/combobox'
import { TagsInput, TagsInputInput, TagsInputItem, TagsInputItemDelete, TagsInputItemText } from '@/components/ui/tags-input'
import { useToast } from '@/components/ui/toast/use-toast'
import { computed, ref, watch } from 'vue'
import { useBookmarkStore } from '@/stores/bookmarkStore'

// Toast utility
const { toast } = useToast()

// Props
const props = defineProps<{
  dialogOpen: boolean,
  mode: 'add' | 'edit',
  step: number,
  url: string,
  siteName: string,
  description: string,
  tags: Tag[],
  editId: number,
  onAddBookmark: () => void,
  onResetForm: () => void
}>()

// State and Variables
const bookmarkStore = useBookmarkStore()
const dialogOpen = ref(props.dialogOpen)
const step = ref(props.step)
const mode = ref(props.mode)
const url = ref(props.url)
const siteName = ref(props.siteName)
const description = ref(props.description)
const tags = ref<Tag[]>(props.tags)
const editId = ref(props.editId)
const isValidUrl = ref(false)
const isFetching = ref(false)
const allTags = bookmarkStore.allTags
let urlValidationTimeout: ReturnType<typeof setTimeout> | null = null

// Tag-related state
const tagsOpen = ref(false)
const newTag = ref('')

// Computed property for filtering tags
const filteredTags = computed(() => {
  return newTag.value ? allTags.filter(tag => tag.label.toLowerCase().includes(newTag.value.toLowerCase())) : allTags
})

// Watchers to sync props with local state
watch(() => props.dialogOpen, (newVal) => {
  dialogOpen.value = newVal
})
watch(() => props.step, (newVal) => {
  step.value = newVal
})
watch(() => props.mode, (newVal) => {
  mode.value = newVal
})
watch(() => props.url, (newVal) => {
  url.value = newVal
})
watch(() => props.siteName, (newVal) => {
  siteName.value = newVal
})
watch(() => props.description, (newVal) => {
  description.value = newVal
})
watch(() => props.tags, (newVal) => {
  tags.value = newVal
})
watch(() => props.editId, (newVal) => {
  editId.value = newVal
})

// Methods

/**
 * Validates the given URL by attempting to fetch it.
 * @param url - The URL to validate.
 * @returns A promise that resolves to a boolean indicating validity.
 */
async function validateUrl(url: string): Promise<boolean> {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url
  }
  isFetching.value = true
  try {
    const response = await fetch(url, { mode: 'no-cors' })
    isValidUrl.value = true
    return response.ok
  } catch (error) {
    console.log('error', error)
    isValidUrl.value = false
    toast({
      title: 'Invalid URL',
      description: 'It looks like the URL you entered is invalid. Please enter a valid URL.',
      variant: 'destructive',
    })
    return false
  } finally {
    isFetching.value = false
  }
}

/**
 * Handles URL input changes and triggers validation after a delay.
 * @param inputUrl - The URL input value.
 */
function handleUrlInput(inputUrl: string) {
  if (urlValidationTimeout) {
    clearTimeout(urlValidationTimeout)
  }
  urlValidationTimeout = setTimeout(() => {
    validateUrl(inputUrl)
  }, 500)
}

/**
 * Adds or updates a bookmark based on the current mode.
 */
async function addBookmark() {
  if (step.value === 1) {
    step.value = 2
  } else {
    if (mode.value === 'edit') {
      bookmarkStore.updateBookmarkById(editId.value, {
        url: url.value,
        site: siteName.value,
        description: description.value,
        tags: tags.value,
      })
    } else {
      bookmarkStore.addBookmark({
        id: bookmarkStore.bookmarks.length ? Math.max(...bookmarkStore.bookmarks.map((b: { id: number }) => b.id)) + 1 : 1,
        url: url.value,
        site: siteName.value,
        description: description.value,
        tags: tags.value,
        date: new Date().toISOString().split('T')[0]
      })
    }
    step.value = 1
    dialogOpen.value = false
  }

  props.onResetForm()
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
</script>

<template>
  <!-- Form and Dialog structure -->
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
          <DialogTitle>
            <span v-if="mode == 'add'">Add</span>
            <span v-if="mode == 'edit'">Update</span> Bookmark
          </DialogTitle>
          <DialogDescription>Fill in the details to add a new bookmark</DialogDescription>
        </DialogHeader>
        <form id="addForm" @submit="handleSubmit($event, addBookmark)" class="grid gap-4 py-4 px-6 overflow-y-auto">
          <!-- URL Input -->
          <FormField v-slot="{ componentField }" name="url">
            <FormItem class="relative">
              <FormLabel for="url">Site URL</FormLabel>
              <FormControl>
                <Input id="url" type="text" :defaultValue="url" v-model="url"
                  @input="handleUrlInput(url)" placeholder="https://example.com" v-bind="componentField" />
                <span v-if="isFetching" class="spinner"></span>
                <Check class="url-check" v-if="!isFetching && isValidUrl" />
              </FormControl>
              <FormDescription>Input the URL you want to bookmark</FormDescription>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Additional Fields -->
          <div class="expand-reveal space-y-4" :class="{ expanded: step === 2 }">
            <!-- Site Name -->
            <FormField v-slot="{ componentField }" name="siteName">
              <FormItem>
                <FormLabel for="site">Site Name</FormLabel>
                <FormControl>
                  <Input id="site" type="text" :defaultValue="siteName" v-model="siteName"
                    placeholder="Site Name" v-bind="componentField" />
                </FormControl>
                <FormDescription>Input a name that helps you remember the site</FormDescription>
                <FormMessage />
              </FormItem>
            </FormField>

            <!-- Description -->
            <FormField v-slot="{ componentField }" name="description">
              <FormItem>
                <FormLabel for="description">Description</FormLabel>
                <FormControl>
                  <Textarea id="description" type="text" :defaultValue="description" v-model="description"
                    placeholder="Description" v-bind="componentField" />
                </FormControl>
                <FormDescription>Input a description for the site</FormDescription>
                <FormMessage />
              </FormItem>
            </FormField>

            <!-- Tags -->
            <FormField name="tags">
              <FormItem>
                <FormLabel for="tags">Tags</FormLabel>
                <FormControl>
                  <Combobox v-model="tags" v-model:open="tagsOpen">
                    <ComboboxAnchor as-child>
                      <TagsInput v-model="tags" class="px-2 gap-2 w-full">
                        <div class="flex gap-2 flex-wrap items-center">
                          <TagsInputItem v-for="item in tags" :key="item.value" :value="item.label">
                            <TagsInputItemText />
                            <TagsInputItemDelete />
                          </TagsInputItem>
                        </div>
                        <ComboboxInput v-model="newTag" as-child>
                          <TagsInputInput placeholder="Add tags..."
                            class="min-w-[200px] w-full p-0 border-none shadow-none focus-visible:ring-0 h-auto"
                            @keydown.enter.prevent="newTag = ''; tagsOpen = false;" @keydown.tab.prevent="tags.push(createTag(newTag)); newTag = ''; tagsOpen = false;" />
                        </ComboboxInput>
                      </TagsInput>
                      <ComboboxList class="w-[--reka-popper-anchor-width] max-h-[300px] overflow-y-auto">
                        <ComboboxEmpty />
                        <ComboboxGroup>
                          <ComboboxItem v-for="tag in filteredTags" :key="tag.value"
                            :value="tag.label" @select.prevent="(ev) => {
                              if (typeof ev.detail.value === 'string') {
                                const tag = createTag(ev.detail.value);
                                newTag = ''
                                tags.push(tag)
                              }
                              if (filteredTags.length === 0) {
                                tagsOpen = false
                              }
                            }">
                            {{ tag.label }}
                          </ComboboxItem>
                        </ComboboxGroup>
                      </ComboboxList>
                    </ComboboxAnchor>
                  </Combobox>
                </FormControl>
                <FormDescription>Input tags to help you categorize the site</FormDescription>
                <FormMessage />
              </FormItem>
            </FormField>
          </div>
        </form>
        <DialogFooter class="px-6">
          <DialogClose as-child>
            <Button type="button" @click="props.onResetForm" variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit" form="addForm" :disabled="!isValidUrl || isFetching">
            <template v-if="step === 1">Next</template>
            <template v-if="step === 2">
              <span v-if="mode == 'add'">Add</span>
              <span v-if="mode == 'edit'">Update</span> Bookmark
            </template>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </Form>
</template>

<style lang="scss">
/* Expandable section styling */
.expand-reveal {
  height: 0;
  overflow: hidden;
  transition: height 0.3s ease-in-out;

  &.expanded {
    overflow: visible;
    height: max-content;
  }
}

/* Spinner styling */
.spinner {
  position: absolute;
  top: 50%;
  right: 0.5rem;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-left-color: var(--primary);
  border-radius: 50%;
  display: inline-block;
  width: 1.25rem;
  height: 1.25rem;
  transform: translateY(-75%);
  animation: spin 1s linear infinite;
}

/* URL check icon styling */
.url-check {
  position: absolute;
  top: 50%;
  right: 0.5rem;
  transform: translateY(-70%);
}

/* Spinner animation */
@keyframes spin {
  to {
    transform: translateY(-75%) rotate(360deg);
  }
}
</style>

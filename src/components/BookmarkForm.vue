<script setup lang="ts">
// Imports
import { BookmarkPlus, Check, ChevronsUpDown, X } from "lucide-vue-next"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogClose, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Combobox, ComboboxAnchor, ComboboxEmpty, ComboboxGroup, ComboboxInput, ComboboxItem, ComboboxList, ComboboxItemIndicator, ComboboxTrigger } from '@/components/ui/combobox'
import { Toaster } from '@/components/ui/toast';
import { useToast } from '@/components/ui/toast/use-toast'

const { toast } = useToast()

import { ref, watch } from 'vue'
import { useBookmarkStore } from '@/stores/bookmarkStore'


// Props
const props = defineProps<{
  dialogOpen: boolean,
  mode: 'add' | 'edit',
  step: number,
  url: string,
  siteName: string,
  description: string,
  tags: string[],
  editId: number,
  onAddBookmark: () => void,
  onResetForm: () => void
}>()

// State and Variables
const bookmarkStore = useBookmarkStore()
const localDialogOpen = ref(props.dialogOpen)
const localStep = ref(props.step)
const localMode = ref(props.mode)
const localUrl = ref(props.url)
const localSiteName = ref(props.siteName)
const localDescription = ref(props.description)
const localTags = ref<string[]>(props.tags)
const localEditId = ref(props.editId)
const isValidUrl = ref(false)
const isFetching = ref(false)
const allTags = bookmarkStore.allTags;
let urlValidationTimeout: ReturnType<typeof setTimeout> | null = null

// Watchers
watch(() => props.dialogOpen, (newVal) => {
  localDialogOpen.value = newVal
})
watch(() => props.step, (newVal) => {
  localStep.value = newVal
})
watch(() => props.mode, (newVal) => {
  localMode.value = newVal
})
watch(() => props.url, (newVal) => {
  localUrl.value = newVal
})
watch(() => props.siteName, (newVal) => {
  localSiteName.value = newVal
})
watch(() => props.description, (newVal) => {
  localDescription.value = newVal
})
watch(() => props.tags, (newVal) => {
  localTags.value = newVal
})
watch(() => props.editId, (newVal) => {
  localEditId.value = newVal
})

// Methods
async function validateUrl(url: string): Promise<boolean> {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  isFetching.value = true;
  try {
    const response = await fetch(url, { mode: 'no-cors' });
    isValidUrl.value = true;
    return response.ok;
  } catch (error) {
    console.log('error', error);
    isValidUrl.value = false;
    console.log(toast)
    toast({
      title: 'Invalid URL',
      description: 'It looks like the URL you entered is invalid. Please enter a valid URL.',
      variant: 'destructive',
    });
    return false;
  } finally {
    isFetching.value = false;
  }
}

function handleUrlInput(url: string) {
  if (urlValidationTimeout) {
    clearTimeout(urlValidationTimeout);
  }
  urlValidationTimeout = setTimeout(() => {
    validateUrl(url);
  }, 500);
}

async function addBookmark() {
  if (localStep.value === 1) {
    localStep.value = 2;
  } else {
    if (localMode.value === 'edit') {
      bookmarkStore.updateBookmarkById(localEditId.value, {
        url: localUrl.value,
        site: localSiteName.value,
        description: localDescription.value,
        tags: localTags.value,
      })
    } else {
      bookmarkStore.addBookmark({
        id: bookmarkStore.bookmarks.length ? Math.max(...bookmarkStore.bookmarks.map((b: { id: number }) => b.id)) + 1 : 1,
        url: localUrl.value,
        site: localSiteName.value,
        description: localDescription.value,
        tags: localTags.value,
      })
    }
    localStep.value = 1
    localDialogOpen.value = false
  }

  props.onResetForm()
}
</script>

<template>
  <Form v-slot="{ handleSubmit }" as="">
    <Dialog v-model:open="localDialogOpen">
      <DialogTrigger>
        <Button>
          Add Bookmark
          <BookmarkPlus />
        </Button>
      </DialogTrigger>
      <DialogContent class="sm:max-w-[425px] grid-rows-[auto_minmax(0,1fr)_auto] px-0 max-h-[90dvh]">
        <DialogHeader class="px-6">
          <DialogTitle><span v-if="localMode == 'add'">Add</span><span v-if="localMode == 'edit'">Update</span> Bookmark
          </DialogTitle>
          <DialogDescription>Fill in the details to add a new bookmark</DialogDescription>
        </DialogHeader>
        <form id="addForm" @submit="handleSubmit($event, addBookmark)" class="grid gap-4 py-4 px-6 overflow-y-auto">
          <FormField v-slot="{ componentField }" name="url">
            <FormItem class="relative">
              <FormLabel for="url">Site URL</FormLabel>
              <FormControl>
                <Input id="url" type="text" :defaultValue="localUrl" v-model="localUrl"
                  @input="handleUrlInput(localUrl)" placeholder="https://example.com" v-bind="componentField" />
                <span v-if="isFetching" class="spinner"></span>
                <Check class="url-check" v-if="!isFetching && isValidUrl" />
              </FormControl>
              <FormDescription>
                Input the url you want to bookmark
              </FormDescription>
              <FormMessage />
            </FormItem>
          </FormField>
          <div class="expand-reveal space-y-4" :class="{ expanded: localStep === 2 }">
            <FormField v-slot="{ componentField }" name="siteName">
              <FormItem>
                <FormLabel for="site">Site Name</FormLabel>
                <FormControl>
                  <Input id="site" type="text" :defaultValue="localSiteName" v-model="localSiteName"
                    placeholder="Site Name" v-bind="componentField" />
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
                  <Textarea id="description" type="text" :defaultValue="localDescription" v-model="localDescription"
                    placeholder="Description" v-bind="componentField" />
                </FormControl>
                <FormDescription>
                  Input a description for the site
                </FormDescription>
                <FormMessage />
              </FormItem>
            </FormField>
            <FormField name="tags">
              <FormItem>
                <FormLabel for="tags">Tags</FormLabel>
                <FormControl>
                  <Combobox multiple v-model="localTags">
                    <FormControl class="relative">
                      <ComboboxAnchor as-child class="w-full">
                        <div class="relative items-center">
                          <ComboboxInput placeholder="Add tags..." />
                          <ComboboxTrigger class="absolute end-0 inset-y-0 flex items-center justify-center px-3">
                            <ChevronsUpDown class="size-4 text-muted-foreground" />
                          </ComboboxTrigger>
                        </div>
                      </ComboboxAnchor>
                    </FormControl>
                    <ComboboxList align="start" body-lock class="dropdown-content-width-full">
                      <ComboboxEmpty>
                        No tags found
                      </ComboboxEmpty>

                      <ComboboxGroup class="overflow-y-auto max-h-[500px]">
                        <ComboboxItem v-for="tag in allTags" :key="tag" :value="tag"
                          @select="() => { localTags = [...localTags, tag]}">
                          {{ tag }}
                          <ComboboxItemIndicator>
                            <Check />
                          </ComboboxItemIndicator>
                        </ComboboxItem>
                      </ComboboxGroup>
                    </ComboboxList>
                  </Combobox>
                </FormControl>
                <FormDescription>
                  Input tags to help you categorize the site
                </FormDescription>
                <FormMessage />
                <div class="flex flex-wrap gap-1">
                  <Badge v-for="tag in localTags" :key="tag" variant="outline" class="flex item-center gap-2 cursor-pointer">{{ tag }} <X class=" w-3" /></Badge>
                </div>
              </FormItem>
            </FormField>
          </div>
        </form>
        <DialogFooter class=" px-6">
          <DialogClose as-child>
            <Button type="button" @click="props.onResetForm" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" form="addForm" :disabled="!isValidUrl || isFetching">
            <template v-if="localStep === 1">Next</template>
            <template v-if="localStep === 2"><span v-if="localMode == 'add'">Add</span><span
                v-if="localMode == 'edit'">Update</span> Bookmark</template>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </Form>
  <Toaster />
</template>

<style lang="scss">
.expand-reveal {
  height: 0;
  overflow: hidden;
  transition: height 0.3s ease-in-out;

  &.expanded {
    overflow: visible;
    height: max-content;
  }
}

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

.url-check {
  position: absolute;
  top: 50%;
  right: 0.5rem;
  transform: translateY(-70%);
}

@keyframes spin {
  to {
    transform: translateY(-75%) rotate(360deg);
  }
}
</style>

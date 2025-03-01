<script lang="ts" setup>
import { computed } from 'vue';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { Ellipsis, Trash, Pencil } from 'lucide-vue-next';
import type { Bookmark } from '@/types/Bookmark';
import { useBookmarkStore } from '@/stores/bookmarkStore';

const bookmarkStore = useBookmarkStore();

const props = defineProps<{
    headers: string[];
    rows: Bookmark[];
    page: number;
    pageSize: number;
}>();

const paginatedRows = computed(() => {
    const start = (props.page - 1) * props.pageSize;
    const end = start + props.pageSize;
    return props.rows.slice(start, end);
});
</script>

<template>
    <table class="table-auto w-full border border-separate border-spacing-0 rounded-lg">
        <thead>
            <tr class="text-left">
                <th v-for="header in headers" class="px-4 py-2">{{ header }}</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="row in paginatedRows" :key="row.id">
                <td class="border-t px-4 py-2 max-w-xs"><a :href="row.url" target="_blank">{{ row.site }}</a></td>
                <td class="border-t px-4 py-2 text-sm max-w-lg">{{ row.description }}</td>
                <td class="border-t px-4 py-2 max-w-xs">
                    <Badge v-for="tag in row.tags" :key="tag" variant="outline" class="m-1">{{ tag }}</Badge>
                </td>
                <td class="border-t text-right px-4 py-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Ellipsis />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Actions</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem @click="$emit('edit', row.id)"
                                class="flex justify-between cursor-pointer">Edit
                                <Pencil />
                            </DropdownMenuItem>
                            <DropdownMenuItem @click="bookmarkStore.removeBookmarkById(row.id)"
                                class="flex justify-between cursor-pointer">Delete
                                <Trash />
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </td>
            </tr>
        </tbody>
    </table>
</template>

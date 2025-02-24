<script setup lang="ts">
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
import Settings from '@/components/Settings.vue'
import Themepicker from '@/components/ThemePicker.vue'
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Bookmark AI</CardTitle>
      <CardDescription>AI-powered bookmark manager</CardDescription>
    </CardHeader>
    <CardContent>
      <div class="flex flex-row items-end">
        <div class="w-3/4">
          <div className="flex w-full max-w-sm items-center space-x-2">
            <Input type="search" placeholder="Search for boomark" />
            <Button><Filter /> Filter</Button>
          </div>
        </div>
        <div class="w-1/4 flex justify-end">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Themepicker />
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
      <div class="flex flex-row">
        <table class="table-auto w-full border rounded-lg">
          <thead>
            <tr>
              <th class="px-4 py-2">Name</th>
              <th class="px-4 py-2">URL</th>
              <th class="px-4 py-2">Tags</th>
              <th class="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="border px-4 py-2">Intro to Vue 3</td>
              <td class="border px-4 py-2">https://v3.vuejs.org/</td>
              <td class="border px-4 py-2">Vue, JavaScript</td>
              <td class="border px-4 py-2">
                <Button>Edit</Button>
                <Button>Delete</Button>
              </td>
            </tr>
            <tr>
              <td class="border px-4 py-2">Intro to Vue 3</td>
              <td class="border px-4 py-2">https://v3.vuejs.org/</td>
              <td class="border px-4 py-2">Vue, JavaScript</td>
              <td class="border px-4 py-2">
                <Button>Edit</Button>
                <Button>Delete</Button>
              </td>
            </tr>
            <tr>
              <td class="border px-4 py-2">Intro to Vue 3</td>
              <td class="border px-4 py-2">https://v3.vuejs.org/</td>
              <td class="border px-4 py-2">Vue, JavaScript</td>
              <td class="border px-4 py-2">
                <Button>Edit</Button>
                <Button>Delete</Button>
              </td>
            </tr>
          </tbody>

        </table>
      </div>
    </CardContent>
  </Card>
</template>

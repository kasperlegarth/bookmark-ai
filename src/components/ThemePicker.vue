<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { Sun, Moon, MonitorCog } from 'lucide-vue-next';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useColorMode } from '@vueuse/core'

const mode = useColorMode({disableTransition: false})
</script>

<template>
<DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="ghost" size="icon">
        <Sun v-if="mode === 'light'" />
        <Moon v-if="mode === 'dark'" />
        <MonitorCog v-if="mode === 'auto'" />
        <span class="sr-only">Toggle theme</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem @click="mode = 'light'">
        <Sun /> Light
      </DropdownMenuItem>
      <DropdownMenuItem @click="mode = 'dark'">
        <Moon /> Dark
      </DropdownMenuItem>
      <DropdownMenuItem @click="mode = 'auto'">
        <MonitorCog /> Auto
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
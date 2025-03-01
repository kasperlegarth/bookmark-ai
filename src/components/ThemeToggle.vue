<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { Sun, Moon } from 'lucide-vue-next';
import { useColorMode } from '@vueuse/core'

const mode = useColorMode({disableTransition: false})

const toggleTheme = () => {
  mode.value = mode.value === 'light' ? 'dark' : 'light';
};
</script>

<template>
<Button variant="ghost" size="icon" @click="toggleTheme">
  <Sun v-if="mode === 'light'" />
  <Moon v-if="mode === 'dark'" />
  <span class="sr-only">Toggle theme</span>
</Button>
</template>
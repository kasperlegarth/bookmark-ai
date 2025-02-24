<script setup lang="ts">
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button';
import Header  from '@/components/Header.vue'
</script>

<template>
  <Header />
  <Input type="search" placeholder="Search for bookmarks" />
  <Button>Search</Button>
</template>

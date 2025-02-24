<script setup lang="ts">
import Settings from './Settings.vue';
import ThemePicker from './ThemePicker.vue';

</script>
<template>
    <header>
        <h1 class="text-3xl">Bookmark AI</h1>
        <div class="header__actions">
            <ThemePicker />
            <Settings />
        </div>
    </header>
</template>
<style lang="scss" scoped>
    header {
        display: flex;
        margin-top: 10rem;
        margin-bottom: 1rem;
        justify-content: space-between;
        
        &__actions {
            display: flex;
            gap: 1rem;
        }
    }
</style>
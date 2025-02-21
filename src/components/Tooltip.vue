<script setup lang="ts">
defineProps({
    x: {
        type: String,
        default: 'left'
    },
    y: {
        type: String,
        default: 'top'
    },
    text: {
        type: String,
        required: true
    }
});

</script>

<template>
    <div class="tooltip" :class="`tooltip--${x} tooltip--${y}`">
        <div class="tooltip__text">{{ text }}</div>
    </div>
</template>

<style scoped lang="scss">
    .tooltip {
        position: absolute;
        z-index: 9999;

        &--left {
            left: 0;
        }

        &--right {
            right: 0;
        }

        &--top {
            bottom: 100%;
        }

        &--bottom {
            top: 100%;
        }

        &--center {
            left: 50%;
            transform: translateX(-50%);
        }

        &__text {
            padding: 6px 12px;
            font-size: .875rem;
            line-height: 1.25rem;
            background-color: var(--color-background);
            color: var(--color-heading);
            border-radius: var(--border-radius);
            border: solid 1px var(--color-border);
        }
    }
</style>
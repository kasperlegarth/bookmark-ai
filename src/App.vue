<script setup lang="ts">
import { ref } from 'vue';

const inputUrl = ref('');

</script>

<template>
  <h1>Bookmark AI</h1>
  <div class="card">
    <div class="card__title">
      <h3>Add new bookmark</h3>
      <p>Here you can save a new bookmark to you collection</p>
    </div>
    <div class="card__content">
      <label for="url">URL</label>
      <div class="form-group">
        <input type="text" id="url" placeholder="www.example.com" v-model="inputUrl" />
        <button class="button button--small">Add</button>
      </div>
      <p class="form-explainer">Type or paste your url, then push the button or hit enter to check if it is valid</p>
    </div>
  </div>
</template>

<style scoped lang="scss">
  h1 {
    color: var(--color-heading);
    margin-bottom: var(--base-padding);
  }
  .card {
    padding: var(--base-padding);
    width: 100%;
    border-radius: var(--border-radius);
    border: solid 1px var(--color-border);

    &__title {
      
      h3 {
        font-size: 1.125rem;
        line-height: 1.725rem;
        font-weight: 500;
        color: var(--color-heading);
      }

      padding-bottom: var(--base-padding);
      margin-bottom: var(--base-padding);
      border-bottom: solid 1px var(--color-border);
    }

    &__content {
      display: flex;
      flex-direction: column;
    }
  }

  .form-group {
    display: flex;

    input {
      flex-grow: 1;
      flex-shrink: 1;
      margin-right: var(--base-padding);
    }

    button {
      flex-grow: 0;
      flex-shrink: 0;
    }
  }

  .form-explainer {
    margin: 8px 0 0;
    font-size: .8rem;
  }

  input {
    font-size: .875rem;
    line-height: 1.25rem;
    color: var(--color-heading);
    padding: 4px 12px;
    height: 2.25rem;
    background-color: transparent;
    border: solid 1px var(--color-border);
    border-radius: var(--border-radius);

    &::placeholder {
      color: var(--color-text);
    }
  }

  .button {
    padding: 8px 16px;
    border-radius: var(--border-radius);
    border: solid 1px var(--color-button-background);
    background-color: var(-color-button-background);
    color: var(--color-button-text);
    font-size: .875rem;
    line-height: 1.25rem;
    font-weight: 500;

    &--small {
      padding: 0 12px;
      font-size: .75rem;
      line-height: 1rem;
    }
  }

  label {
    margin-bottom: 8px;
    font-size: .875rem;
    font-weight: 500;
    color: var(--color-heading);
  }
</style>

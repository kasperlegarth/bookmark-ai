<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import Tooltip from './components/Tooltip.vue';

const inputUrl = ref<string>('');
const isFetching = ref<boolean>(false);
const validationError = ref<boolean>(false);
const bookmarkToEdit = ref<number | null>(null);
const bookmarks = ref([]);

const currentBookmark = computed(() => {
  if(!bookmarkToEdit.value) return null;
  
  const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
  return bookmarks.find((bookmark: { id: number }) => bookmark.id === bookmarkToEdit.value);
  
});

const validateUrl = async() => {
  isFetching.value = true;
  const validUrl = await isValidUrl();
  validationError.value = !validUrl;
  isFetching.value = false;

  if(validUrl) {
    addBookmark();
    inputUrl.value = '';
  }
};

const isValidUrl = async () => {
  let valueToCheck = inputUrl.value;

  if(valueToCheck.indexOf('http') < 0) {
    valueToCheck = `https://${valueToCheck}`;
  }

  try {
    await fetch(valueToCheck, { method: 'HEAD', mode: 'no-cors' });
    return true
  } catch (error) {
    console.error('Error fetching the URL:', error);
    return false;
  }
};

const addBookmark = () => {
  const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
  const newId = bookmarks.length ? bookmarks[bookmarks.length - 1].id + 1 : 1;
  const newBookmark = { id: newId, url: inputUrl.value };
  bookmarks.push(newBookmark);
  localStorage.setItem('bookmarks', JSON.stringify(bookmarks));

  bookmarkToEdit.value = newId;
  reloadBookmarks();
};

const reloadBookmarks = () => {
  bookmarks.value = JSON.parse(localStorage.getItem('bookmarks') || '[]');
};

watch(inputUrl, () => {
  validationError.value = false;
});

onMounted(() => {
  reloadBookmarks();
});
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
        <input type="text" id="url" @keyup.enter="validateUrl" placeholder="www.example.com" v-model="inputUrl" />
        <span v-if="isFetching" class="spinner"></span>
        <button @click="validateUrl" class="button button--small">Add bookmark</button>
        <Tooltip x="left" y="top" v-if="validationError" text="The URL is not valid" />
      </div>
      <p class="form-explainer">Type or paste your url, then push the button or hit enter to check if it is valid</p>
      <div v-if="bookmarkToEdit" class="edit-bookmark">
        <label for="title">Title</label>
        <input type="text" id="title" :value="currentBookmark.url" placeholder="Bookmark title" />
        <p class="form-explainer">You can edit the title of your bookmark</p>
        <label for="description">Description</label>
        <textarea rows="6" id="description" placeholder="Bookmark description" />
        <p class="form-explainer">You can add a description to your bookmark</p>
        <label for="tags">Tags</label>
        <input type="text" id="tags" placeholder="Bookmark tags" />
        <p class="form-explainer">You can add tags to your bookmark</p>
        <button class="button">Save bookmark</button>
      </div>
    </div>
  </div>
  <h2 v-if="bookmarks.length > 0">Your bookmarks</h2>
  <div class="card-list">
    <div v-for="bookmark in bookmarks" :key="bookmark.id" class="card card--inline">
      {{ bookmark.url }}
    </div>
  </div>
</template>

<style scoped lang="scss">
  h1,h2 {
    color: var(--color-heading);
    margin-bottom: var(--base-padding);
  }

  h2 {
    margin-top: var(--base-padding);
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
      border-bottom: solid 1px var(--color-border);
    }

    &__content {
      display: flex;
      flex-direction: column;
    }

    .card-list & {
      margin: 12px 0;
    }
  }

  .form-group {
    display: flex;
    position: relative;

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

  .spinner {
    position: absolute;
    right: 84px;
    top: 50%;
    transform: translateY(-50%);
    width: 16px;
    height: 16px;
    border: 2px solid var(--color-border);
    border-top-color: var(--color-button-background);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .form-explainer {
    margin: 8px 0 0;
    font-size: .8rem;
  }

  input,
  textarea {
    display: block;
    width: 100%;
    font-size: .875rem;
    line-height: 1.25rem;
    font-family: inherit;
    color: var(--color-heading);
    padding: 4px 12px;
    background-color: transparent;
    border: solid 1px var(--color-border);
    border-radius: var(--border-radius);

    &::placeholder {
      color: var(--color-text);
    }
  }

  input {
    height: 2.25rem;
  }

  textarea {
    resize: vertical;
  }

  .button {
    padding: 8px 16px;
    border-radius: var(--border-radius);
    border: solid 1px var(--color-button-background);
    background-color: var(--color-button-background);
    color: var(--color-button-text);
    font-size: .875rem;
    line-height: 1.25rem;
    font-family: inherit;
    font-weight: 600;
    cursor: pointer;
    
    &--small {
      padding: 0 12px;
      font-size: .75rem;
      line-height: 1rem;
    }
  }

  label {
    display: block;
    margin-top: var(--base-padding);
    margin-bottom: 8px;
    font-size: .875rem;
    font-weight: 500;
    color: var(--color-heading);
  }

  .edit-bookmark {
    margin-top: var(--base-padding);
    border-top: solid 1px var(--color-border);
    animation: reveal 0.5s ease-in-out forwards; 
    overflow: hidden;

    .button {
      margin-top: var(--base-padding);
    }
  }

  @keyframes spin {
    0% {
      transform: translateY(-50%) rotate(0deg);
    }
    100% {
      transform: translateY(-50%) rotate(360deg);
    }
  }

  @keyframes reveal {
    from {
      max-height: 0;
    }
    to {
      max-height: 600px;
    }
  }

  
</style>

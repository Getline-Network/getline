<template>
  <div class="purple-button" :class="buttonClass">{{ text }}</div>
</template>

<script>
export default {
  name: 'PurpleButton',
  props: ['text', 'disabled'],
  data() {
    return {
      buttonClass: ''
    }
  },
  watch: {
    disabled() {
      this.buttonClass = (this.disabled ? "pb-disabled" : "");
    }
  }
};
</script>

<style scoped lang="scss">
.purple-button { display: flex; justify-content: center; min-width: 300px; margin: 30px 0; padding: 15px 30px; border-radius: 2px; background-color: var(--purpleish-blue); font-size: 11px; font-weight: 600; color: #ffffff; cursor: pointer; }
.purple-button.pb-disabled { pointer-events: none; opacity: 0.4; }
</style>

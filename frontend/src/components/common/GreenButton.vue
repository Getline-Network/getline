<template>
  <div class="green-button" :class="buttonClass">{{ text }}</div>
</template>

<script>
export default {
  name: 'GreenButton',
  props: ['text', 'disabled'],
  data() {
    return {
      buttonClass: ''
    }
  },
  watch: {
    disabled() {
      this.buttonClass = (this.disabled ? "gb-disabled" : "");
    }
  }
};
</script>

<style scoped lang="scss">
.green-button { display: flex; justify-content: center; min-width: 300px; margin: 30px 0; padding: 15px 30px; border-radius: 2px; background-color: #21ce4c; font-size: 11px; font-weight: 600; color: #ffffff; cursor: pointer; }
.green-button.gb-disabled { pointer-events: none; opacity: 0.4; }
</style>

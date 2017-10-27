<template>
  <div class="user-score" :class="getClass()">{{ value }}</div>
</template>

<script>
export default {
  name: 'UserScore',
  props: ['value'],
  methods: {
    getClass: function getClass() {
      const stylePrefix = 'style-score-';
      const result = stylePrefix + this.value;
      return result.toLowerCase();
    },
  },
};
</script>

<style scoped lang="scss">
.user-score { display: flex; width: 32px; height: 32px; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; color: #ffffff; border-radius: 2px;
  &.style-score-a { background-color: #20be2f; }
  &.style-score-b { background-color: #ffcd00; }
  &.style-score-c { background-color: #ffa438; }
  &.style-score-d { background-color: #e92b2b; }
}
</style>

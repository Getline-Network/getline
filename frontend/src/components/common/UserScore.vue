<template>
  <div @click='goToBlogspotScore' class="user-score" :class="getClass()">{{ value }}</div>
</template>

<script lang="ts">
import { goToBlogspotScore } from '@/router/redirects';

/*
 * Right now it always diplays "?" score
 * In future we will have the score in props
 */
export default {
  name: 'UserScore',
  methods: {
    goToBlogspotScore,
    getClass: function getClass() {
      const stylePrefix = 'style-score-';
      const result = stylePrefix + 'unknown'; // Change 'unknown' to this.value
      return result.toLowerCase();
    },
  },
  data() {
    return {
      value: '?'
    }
  }
};
</script>

<style scoped lang="scss">
.user-score { display: flex; width: 32px; height: 32px; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; color: #ffffff; border-radius: 2px; cursor: pointer;
  &.style-score-a { background-color: #20be2f; }
  &.style-score-b { background-color: #ffcd00; }
  &.style-score-c { background-color: #ffa438; }
  &.style-score-d { background-color: #e92b2b; }
  &.style-score-unknown { background-color: #20be2f; }
}
</style>

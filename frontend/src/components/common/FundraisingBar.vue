<template>
  <div class="fundraising-bar">
    <div class="fb-bar" :style="{ height: barHeight || '12px' }">
      <div class="fb-bar-funded" :style="{ width: percentage + '%' }" />
      <div class="fb-bar-remaining" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'Fundarisingbar',
  props: ['percentage', 'barHeight'],
};
</script>
<style scoped lang="scss">
.fundraising-bar { width: 100%; margin-top: 10px;
  .fb-bar { display: flex; height: 12px; width: 100%; background-color: red;
    .fb-bar-funded { border-radius: 2px; background: #21ce4c; background: -webkit-linear-gradient(-90deg, #21ce4c, #7249f7); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(-90deg,  #21ce4c, #7249f7); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(-90deg,  #21ce4c, #7249f7); /* For Firefox 3.6 to 15 */  background: linear-gradient(-90deg,  #21ce4c, #7249f7); /* Standard syntax */ }
    .fb-bar-remaining { background-color: var(--color-white-smoke); flex-grow: 1; }
  }
}
</style>

<template>
  <div class="dotts"></div>
</template>

<script>
export default {
  name: 'Dotts',
};
</script>
<style scoped lang="scss">
.dotted {
  position: absolute; top: 0; z-index: -1; height: 300px; width: 100%; padding: 2.25em 1.6875em;
  background-image: -webkit-repeating-radial-gradient(center center, rgba(0,0,0,.2), rgba(0,0,0,.2) 1px, transparent 1px, transparent 100%);
  background-image: -moz-repeating-radial-gradient(center center, rgba(0,0,0,.2), rgba(0,0,0,.2) 1px, transparent 1px, transparent 100%);
  background-image: -ms-repeating-radial-gradient(center center, rgba(0,0,0,.2), rgba(0,0,0,.2) 1px, transparent 1px, transparent 100%);
  background-image: repeating-radial-gradient(center center, rgba(0,0,0,.2), rgba(0,0,0,.2) 1px, transparent 1px, transparent 100%);
  -webkit-background-size: 10px 10px; -moz-background-size: 10px 10px; background-size: 10px 10px; opacity: 0.2;
}
</style>

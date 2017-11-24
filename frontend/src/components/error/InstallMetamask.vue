<template>
  <error>
    <span slot="title"> Metamask not found </span>
    <div slot="text">
      <div> Please install metamsk.</div>
      <a href="https://metamask.io/">
        <img class="install-metamask" :src="require('../../assets/download-metamask.png')" />
      </a>
    </div>
  </error>
</template>

<script>
import ErrorPage from './Error';

export default {
  name: 'InstallMetamask',
  components: {
    'error': ErrorPage,
  },
};
</script>

<style scoped lang="scss">
.install-metamask { width: 300px; margin: 20px; }
</style>

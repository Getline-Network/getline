<template>
  <error>
    <span slot="title"> Error - Metamask is locked </span>
    <span slot="text"> Probably your metamask is locked. Please unlock it. </span>
  </error>
</template>


<script>
import ErrorPage from './Error';

export default {
  name: 'UnlockMetamask',
  components: {
    'error': ErrorPage,
  },
};
</script>

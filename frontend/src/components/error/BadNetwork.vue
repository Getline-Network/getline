<template>
  <error>
    <span slot="title"> Error - bad network </span>
    <span slot="text"> Please connect to the Rinkeby network </span>
  </error>
</template>

<script>
import ErrorPage from './Error';

export default {
  name: 'BadNetwork',
  components: {
    'error': ErrorPage,
  },
};
</script>

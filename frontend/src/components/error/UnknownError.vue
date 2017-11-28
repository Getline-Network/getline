<template>
  <error>
    <span slot="title"> Error </span>
    <span slot="text"> Something bad happened. Please try again or contact support </span>
  </error>
</template>

<script>
import ErrorPage from './Error';

export default {
  name: 'UnknownError',
  components: {
    'error': ErrorPage,
  },
};
</script>

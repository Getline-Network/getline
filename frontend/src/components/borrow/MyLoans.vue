<template>
  <div class="my-loans-spinner" v-if="isLoading">
    <spinner />
  </div>
  <div v-else class="my-loans">
    <div class="ml-loans-container">
      <loan-tile v-for="loan in myLoans" :key="loan.shortId" :loan="loan" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'

import Spinner from 'components/common/Spinner.vue';
import MyLoanTile from './my-loan-tile/MyLoanTile.vue';

import { GET_MY_LOANS_ACTION } from 'store/my-loans/actions';
import { StateT } from 'store';


const Component = Vue.extend({
  name: 'MyLoans',
  components: {
    'loan-tile': MyLoanTile,
    'spinner': Spinner,
  },
  created() {
    this.$store.dispatch(GET_MY_LOANS_ACTION);
  },
  computed: mapState({
    myLoans: (state:StateT) => state.myLoans.myLoansList,
    isLoading: (state:StateT) => state.myLoans.isLoading
  })
});
export default Component;
</script>

<style lang="scss" scoped>
.my-loans-spinner { margin-top: 100px; }
.my-loans { width: calc(100% - 200px); min-width: 570px; margin: 50px auto 40px;
  .ml-summary { display: flex; justify-content: center; }
  .ml-loans-container { display: flex; justify-content: center; flex-wrap: wrap; }
}
</style>

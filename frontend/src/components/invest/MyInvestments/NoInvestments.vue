<template>
  <no-elements>
    <span slot="message"> No investments yet </span>
    <span slot="description"> Maecenas lacinia ex at varius viverra. Phasellus bibendum semper quam et malesuada. Morbi ex dolor, pellentesque sed dictum sed, tincidunt ut erat. Integer pulvinar mauris non tempor scelerisque.t </span>
    <svg slot="icon" xmlns="http://www.w3.org/2000/svg" width="50" height="53" viewBox="0 0 50 53">
      <g fill="#B6B6B6" fill-rule="evenodd">
          <path d="M44.993 45.43H5V5.049h40l-.007 40.38zM45 0H5c-2.757 0-5 2.264-5 5.048v40.38c0 2.785 2.243 5.048 5 5.048v2.524h5v-2.524h30v2.524h5v-2.524c2.758 0 5-2.263 5-5.047V5.049C50 2.265 47.758 0 45 0z"/>
          <path d="M15 20.192h2.5v-5.048H15V12.62h22.5v25.238H15v-2.523h2.5v-5.048H15V20.192zm-5 20.19c0 1.396 1.12 2.524 2.5 2.524H40a2.51 2.51 0 0 0 2.5-2.524V10.097c0-1.394-1.117-2.524-2.5-2.524H12.5c-1.38 0-2.5 1.13-2.5 2.524v5.047H7.5v5.048H10v10.095H7.5v5.048H10v5.047z"/>
          <path d="M27.5 22.716c1.38 0 2.5 1.133 2.5 2.523 0 1.391-1.12 2.524-2.5 2.524-1.378 0-2.5-1.133-2.5-2.524 0-1.39 1.122-2.523 2.5-2.523m0 10.095c4.135 0 7.5-3.397 7.5-7.572 0-4.174-3.365-7.571-7.5-7.571S20 21.065 20 25.239c0 4.175 3.365 7.572 7.5 7.572"/>
      </g>
    </svg>
  </no-elements>
</template>

<script>
import NoElements from '../../common/NoElements';

export default {
  name: 'NoInvestments',
  components: {
    'no-elements': NoElements,
  },
};

</script>

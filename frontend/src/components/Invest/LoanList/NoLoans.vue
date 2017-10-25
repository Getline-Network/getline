<template>
  <div class="no-loans-container">
    <div class="no-loans">
      <div class="nl-ico">
        <svg xmlns="http://www.w3.org/2000/svg" width="72" height="60" viewBox="0 0 72 60">
          <path fill="#B6B6B6" fill-rule="evenodd" d="M12 48.003H6v-18h6v18zm57-33a3 3 0 0 1 3 3v30a3 3 0 0 1-3 3H54.354l-2.013 4.023a8.942 8.942 0 0 1-8.046 4.977H24c-.795 0-1.56-.318-2.121-.879l-5.499-5.499c-.42.222-.873.378-1.38.378H3c-1.656 0-3-1.344-3-3v-24c0-1.656 1.344-3 3-3h12c.507 0 .96.156 1.38.381l5.499-5.502A2.992 2.992 0 0 1 24 18.003h15a3 3 0 0 1 3 3v6c0 4.962-4.038 9-9 9h-6v-6h6c1.656 0 3-1.344 3-3v-3H25.242L18 31.245v15.516l7.242 7.242h19.053a2.974 2.974 0 0 0 2.679-1.656l.672-1.344H27c-1.656 0-3-1.344-3-3v-9h6v6h36v-24H45v-6h12.702L53.1 7.335l-10.737 7.668H32.04L52.257.561a3.006 3.006 0 0 1 2.355-.495c.822.171 1.53.675 1.959 1.392l8.127 13.545H69zm-21 24a6 6 0 1 1 0-12 6 6 0 0 1 0 12z"/>
        </svg>
      </div>
      <div class="nl-text-h"> You have no loans yet </div>
      <div class="nl-text-p"> Maecenas lacinia ex at varius viverra. Phasellus bibendum semper quam et malesuada. Morbi ex dolor, pellentesque sed dictum sed, tincidunt ut erat. Integer pulvinar mauris non tempor scelerisque.t </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NoLoans',
};
</script>
<style scoped lang="scss">
.no-loans-container { display: flex; justify-content: center; flex-direction: column; justify-content: space-around; padding: 100px; margin-bottom: 40px; border-radius: 2px; background-color: #ffffff; box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.02);
  .no-loans { align-items: center; display: flex; flex-direction: column;
    .nl-ico { display: flex; align-items: center; justify-content: center; width: 124px; height: 124px; border: solid 2px #eeeeee; border-radius: 50%; }
    .nl-text-h { margin: 30px 0 0 0; font-size: 34px; font-weight: 300; line-height: 1.06; letter-spacing: -0.4px; color: var(--color-black-cod); }
    .nl-text-p { margin: 15px 0 0 0; font-size: 12px; font-weight: 300; line-height: 1.83; text-align: center; color: #858585; }
  }
}
</style>

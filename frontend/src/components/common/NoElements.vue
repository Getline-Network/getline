<template>
  <div class="no-elements-container">
    <div class="no-elements">
      <div class="ne-icon">
        <slot name="icon"></slot>
      </div>
      <div class="ne-text-h">
        <slot name="message"></slot>
      </div>
      <div class="ne-text-p">
        <slot name="description"></slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NoLoans',
};
</script>
<style scoped lang="scss">
.no-elements-container { display: flex; justify-content: center; flex-direction: column; justify-content: space-around; padding: 100px; margin-bottom: 40px; border-radius: 2px; background-color: #ffffff; box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.02);
  .no-elements { align-items: center; display: flex; flex-direction: column;
    .ne-icon { display: flex; align-items: center; justify-content: center; width: 124px; height: 124px; border: solid 2px #eeeeee; border-radius: 50%; }
    .ne-text-h { margin: 30px 0 0 0; font-size: 34px; font-weight: 300; line-height: 1.06; letter-spacing: -0.4px; color: var(--color-black-cod); }
    .ne-text-p { margin: 15px 0 0 0; font-size: 12px; font-weight: 300; line-height: 1.83; text-align: center; color: #858585; }
  }
}
</style>

<template>
  <div class="um-box">
    <div class="um-icon">
      <svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
        width="450.791px" height="450.792px" viewBox="0 0 450.791 450.792" style="enable-background:new 0 0 450.791 450.792;"
        xml:space="preserve">
        <g>
          <path d="M225.395,0C101.113,0,0,101.112,0,225.392c0,124.285,101.113,225.398,225.395,225.398
            c124.282,0,225.396-101.113,225.396-225.398C450.791,101.112,349.677,0,225.395,0z M225.395,428.375
            c-111.927,0-202.981-91.054-202.981-202.983c0-111.924,91.054-202.978,202.981-202.978c111.927,0,202.98,91.054,202.98,202.978
            C428.375,337.322,337.321,428.375,225.395,428.375z M307.132,348.687l-15.354,6.84c-11.584-26.025-37.45-42.835-65.892-42.835
            c-29.326,0-55.505,17.543-66.69,44.674l-15.537-6.402c13.783-33.462,46.063-55.081,82.231-55.081
            C260.959,295.882,292.853,316.61,307.132,348.687z M152.546,192.721c-19.623,0-35.535-15.913-35.535-35.54
            c0-19.628,15.913-35.543,35.535-35.543c19.633,0,35.546,15.915,35.546,35.543C188.092,176.809,172.179,192.721,152.546,192.721z
            M333.825,157.181c0,19.627-15.913,35.54-35.547,35.54c-19.62,0-35.535-15.913-35.535-35.54c0-19.628,15.915-35.543,35.535-35.543
            C317.912,121.638,333.825,137.553,333.825,157.181z"/>
        </g>
      </svg>
    </div>
    <div class="um-title">
      <slot name="title" />
    </div>
    <div class="um-text">
      <slot name="text" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'Error',
};
</script>

<style scoped lang="scss">
.um-box { display: flex; align-items: center; justify-content: center; flex-direction: column; margin: 100px; height: calc(100vh - 300px); min-height: 300px; background-color: white;
  .um-icon { fill: #B6B6B6; height: 50px; width: 50px; margin: 20px; }
  .um-title { font-size: 34px; font-weight: 300; line-height: 1.06; letter-spacing: -0.4px; color: var(--color-black-cod); }
  .um-text{ margin-top: 10px; font-size: 12px; font-weight: 300; line-height: 1.83; text-align: center; color: #858585; }
}
</style>

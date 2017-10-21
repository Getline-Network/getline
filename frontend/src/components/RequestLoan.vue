<template>
  <div class="request-loan-container">
    <div class="rl-title"> Request loan </div>
    <div class="rl-form">
      <div class="rl-amount-and-percentage">
        Amount and percentage
      </div>
      <div class="rl-amount-container">
        <div class="rl-amount">
          <md-input-container>
            <label>AMOUNT</label>
            <md-input v-model="ethAmount" type="number"></md-input>
            <div class="rl-input-right-text">ETH</div>
          </md-input-container>
        </div>
        <div class="rl-token">
            <md-input-container>
              <label>PERCENTAGE</label>
              <md-input type="number" v-model="petcentage"></md-input>
              <div class="rl-input-right-text">%</div>
            </md-input-container>
        </div>
      </div>
      <div class="rl-payback">
          <div> Payback time period </div>
          <div class="rl-payback-time"> 7 DAYS </div>
      </div>
      <div class="rl-description">
        <md-input-container>
          <label>Description</label>
          <md-textarea v-model="description" maxlength="800"></md-textarea>
        </md-input-container>
      </div>
      <div class="rl-metamask">
        <div class="rl-metamask-to-complete"> To complete process you need metamask account </div>
        <div class="rl-metamask-what-is"> What is metamask and how it works <a href="/"> Read here </a> </div>
        <div class="rl-metamask-button-container">
          <div class="rl-metamask-button"> AUTHORIZE METAMASK </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RequestLoan',
  data() {
    return {
      ethAmount: '0.01',
      petcentage: '5',
    };
  },
};
</script>

<style lang="scss" scoped>
.request-loan-container { width: 40%; min-width: 570px; margin: 0 auto;
  .rl-title { margin: 54px 0px 30px 25px; font-size: 28px; line-height: 1; letter-spacing: -0.3px; color: var(--color-black-cod); }
  .rl-form { display: flex; justify-content: center; flex-direction: column; margin-bottom: 40px; border-radius: 2px; background-color: #ffffff; box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.02);
    .rl-input-right-text { margin-top: 7px; font-size: 16px; font-weight: 300; letter-spacing: -0.1px; color: #858585; }
    .rl-amount-and-percentage { padding: 30px; font-size: 18px; font-weight: 600; line-height: 1.22; letter-spacing: -0.2px; color: var(--color-black-cod); }
    .rl-amount-container { display: flex; padding: 0px 30px 30px; border-bottom: 1px solid var(--color-white-smoke);
      .rl-amount { width: 50%; }
      .rl-token { width: 50%; margin-left: 15px}
    }
    .rl-payback { padding: 30px; font-size: 18px; font-weight: 600; line-height: 1.22; letter-spacing: -0.2px; color: var(--color-black-cod); border-bottom: 1px solid var(--color-white-smoke);
      .rl-payback-time { display: flex; justify-content: center; margin: 10px 0px; padding: 11px; border-radius: 2px; background-color: rgba(0, 0, 0, 0); border: solid 2px #eeeeee; font-size: 12px; font-weight: 300; line-height: 1.83 ;color: #858585; }
    }
    .rl-description { padding: 50px 30px; border-bottom: 1px solid var(--color-white-smoke); }
    .rl-metamask { margin:30px;
      .rl-metamask-to-complete { display: flex; justify-content: center; font-size: 18px; font-weight: 300; line-height: 1.22; letter-spacing: -0.2px; color: var(--color-black-cod); }
    }
    .rl-metamask-what-is { display: flex; justify-content: center; font-size: 12px; font-weight: 300; line-height: 1.83; color: #858585;
      a { margin-left: 5px; color: #14b3ff; }
    }
    .rl-metamask-button-container { display: flex; justify-content: center; margin: 30px 0;
      .rl-metamask-button { padding: 15px 30px; border-radius: 2px; background-color: var(--purpleish-blue); font-size: 11px; font-weight: 600; color: #ffffff; }
     }
  }
}
</style>

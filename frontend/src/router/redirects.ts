import Vue from 'vue';
let vue: Vue;

export function bindRedirects(_vue: Vue) {
  vue = _vue;
}

export function goToMainPage(): void {
  vue.$router.push({ path: "/" });
}

export function goToLoan(id): void {
  const path = '/invest/loan/';
  vue.$router.push({ path: path + id });
}

export function goToUnlockMetamaskPage(): void {
  const path = '/error/unlock-metamask/';
  vue.$router.push({ path });
}

export function goToUnsupportedNetworkPage(): void {
  const path = '/error/network/';
  vue.$router.push({ path });
}

export function goToInstallMetamaskPage(): void {
  const path = '/error/install-metamask/';
  vue.$router.push({ path });
}

export function goToErrorPage(): void {
  const path = '/error/unknown/';
  vue.$router.push({ path });
}

export function isErrorPage(): boolean {
  let path = vue.$route.path.split("/");
  return (path && path.length > 0 && path[1] === "error");
}

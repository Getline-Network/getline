export function goToMainPage(): void {
  this.$router.push({ path: "/" });
}

export function goToLoan(id): void {
  const path = '/invest/loan/';
  this.$router.push({ path: path + id });
}

export function goToUnlockMetamaskPage(): void {
  const path = '/error/unlock-metamask/';
  this.$router.push({ path });
}

export function goToUnsupportedNetworkPage(): void {
  const path = '/error/network/';
  this.$router.push({ path });
}

export function goToInstallMetamaskPage(): void {
  const path = '/error/install-metamask/';
  this.$router.push({ path });
}

export function goToErrorPage(): void {
  const path = '/error/unknown/';
  this.$router.push({ path });
}

export function isErrorPage(): boolean {
  let path = this.$route.path.split("/");
  return (path && path.length > 0 && path[1] === "error");
}
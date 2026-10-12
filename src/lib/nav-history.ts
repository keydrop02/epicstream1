let pushedEntries = 0;
let pendingReplaces = 0;

export function markReplace() {
  pendingReplaces += 1;
}

export function registerPathChange() {
  if (pendingReplaces > 0) {
    pendingReplaces -= 1;
    return;
  }
  pushedEntries += 1;
}

export function hasInAppHistory(): boolean {
  return pushedEntries > 0;
}

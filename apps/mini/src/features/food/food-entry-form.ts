export function foodConfirmMode(entryId?: string) {
  return entryId ? 'edit' : 'create';
}

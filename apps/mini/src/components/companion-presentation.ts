export type CompanionVariant = 'sunny' | 'note' | 'complete';

export function companionPresentation(variant: CompanionVariant) {
  return {
    className: `hint--${variant}`,
    name: '序序',
  };
}

import { translateText, type Language } from './translations'

export type GuidedStep = 0 | 1 | 2 | 3 | 4

export function nextGuidedStep(step: GuidedStep, hasStory: boolean): GuidedStep {
  if (step === 0) return 1
  if (step === 1) return hasStory ? 2 : 1
  return step === 4 ? 1 : (step + 1) as GuidedStep
}

export function previousGuidedStep(step: GuidedStep): GuidedStep {
  return Math.max(0, step - 1) as GuidedStep
}

// Native controls and scene frames retain their normal click behavior.
export function isGuidedControl(target: EventTarget | null): boolean {
  return target instanceof Element && Boolean(target.closest(
    'button, a, input, select, textarea, label, summary, [data-guided-controls]',
  ))
}

export function describeGuidedElement(element: HTMLElement, language: Language = 'en'): string {
  const t = (message: string) => translateText(language, message)
  const control = element.matches('label') ? element.querySelector<HTMLElement>('input, select') ?? element : element
  const label = control.getAttribute('aria-label') ||
    (control instanceof HTMLInputElement || control instanceof HTMLSelectElement ? control.labels?.[0]?.querySelector('span')?.textContent : '') || ''
  if (control instanceof HTMLSelectElement)
    return `${label || control.labels?.[0]?.textContent?.trim() || t('Option')}. ${control.selectedOptions[0]?.textContent ?? ''}`
  if (control instanceof HTMLInputElement) {
    const name = label || control.labels?.[0]?.textContent?.trim() || t('Control')
    const value = control.type === 'checkbox' ? t(control.checked ? 'On' : 'Off') : control.getAttribute('aria-valuetext') || control.value
    return `${name}. ${value}`
  }
  return (label || control.innerText || control.textContent || '').trim()
}

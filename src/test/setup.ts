import '@testing-library/jest-dom/vitest';
import { expect } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

// jsdom 29 has no inline style implementation for MathML and throws during
// accessible-name traversal. Use its HTML container's style for visibility;
// browser axe checks still exercise the real MathML accessibility tree.
const computedStyle = window.getComputedStyle.bind(window);
window.getComputedStyle = (element, pseudoElement) => {
  if (element.namespaceURI === 'http://www.w3.org/1998/Math/MathML') {
    const container = element.closest('span');
    if (container) return computedStyle(container, pseudoElement);
  }
  return computedStyle(element, pseudoElement);
};

import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface TextRendererProps {
  content?: string;
  className?: string;
  inline?: boolean;
}

/**
  Normalizes LaTeX math expressions to ensure beautiful fraction rendering.
  Replaces standard \frac with \dfrac (display fraction) when appropriate or ensures displayMode formatting.
 */
function normalizeMathExpr(expr: string): string {
  // Convert \frac to \dfrac for better vertical spacing in inline math unless it's already \dfrac or \cfrac
  return expr.replace(/\\frac\{/g, '\\dfrac{').replace(/−/g, '-');
}

const mathAtom = String.raw`(?:\((?:[^()]|\([^()]*\))*\)|[\p{L}][\p{L}\d]*|\d+(?:[.,]\d+)?)(?:\s*(?:\^|_)\s*(?:\{[^{}]+\}|[\p{L}\d]+))?`;
const mathOperator = String.raw`[+\-−*/×÷=<>≤≥≠]`;
const bareMathPattern = new RegExp(
  String.raw`(?<![\p{L}\d])(${mathAtom}(?:\s*${mathOperator}\s*${mathAtom})*)(?![\p{L}\d])`,
  'gu',
);

// In-memory cache for parsed content and compiled KaTeX HTML strings to eliminate redundant CPU work
const parsedContentCache = new Map<string, Array<{ text: string; isMath: boolean; isBlock: boolean }>>();
const katexHtmlCache = new Map<string, string>();
const MAX_CACHE_SIZE = 1500;

function getCachedKatexHtml(text: string, displayMode: boolean): string {
  const key = `${displayMode ? 'D' : 'I'}:${text}`;
  let html = katexHtmlCache.get(key);
  if (html !== undefined) return html;

  try {
    html = katex.renderToString(text, {
      displayMode,
      throwOnError: false,
    });
  } catch {
    html = '';
  }

  if (katexHtmlCache.size >= MAX_CACHE_SIZE) {
    // Evict oldest entry (simple FIFO approximation for cache bounded size)
    const firstKey = katexHtmlCache.keys().next().value;
    if (firstKey) katexHtmlCache.delete(firstKey);
  }
  katexHtmlCache.set(key, html);
  return html;
}

function parseContentToParts(content: string): Array<{ text: string; isMath: boolean; isBlock: boolean }> {
  const cached = parsedContentCache.get(content);
  if (cached) return cached;

  const parts: Array<{ text: string; isMath: boolean; isBlock: boolean }> = [];
  const regex = /(\$\$.*?\$\$|\$.*?\$|\\\(.*?\\\)|\\\[.*?\\\])/gs;

  let lastIndex = 0;
  let match;

  const tokens: Array<{ text: string; index: number; isDelimitedMath: boolean }> = [];
  while ((match = regex.exec(content)) !== null) {
    tokens.push({ text: match[0], index: match.index, isDelimitedMath: true });
  }
  bareMathPattern.lastIndex = 0;
  while ((match = bareMathPattern.exec(content)) !== null) {
    if (isBareMath(match[0])) {
      tokens.push({ text: match[0], index: match.index, isDelimitedMath: false });
    }
  }
  tokens.sort((left, right) => left.index - right.index);

  for (const token of tokens) {
    if (token.index < lastIndex) continue;

    if (token.index > lastIndex) {
      parts.push({
        text: content.substring(lastIndex, token.index),
        isMath: false,
        isBlock: false,
      });
    }

    const matchedStr = token.text;
    let mathExpr = matchedStr;
    let isBlock = false;

    if (!token.isDelimitedMath) {
      parts.push({
        text: normalizeMathExpr(mathExpr),
        isMath: true,
        isBlock: false,
      });
      lastIndex = token.index + matchedStr.length;
      continue;
    }

    if (matchedStr.startsWith('$$') && matchedStr.endsWith('$$')) {
      mathExpr = matchedStr.slice(2, -2);
      isBlock = true;
    } else if (matchedStr.startsWith('$') && matchedStr.endsWith('$')) {
      mathExpr = matchedStr.slice(1, -1);
    } else if (matchedStr.startsWith('\\(') && matchedStr.endsWith('\\)')) {
      mathExpr = matchedStr.slice(2, -2);
    } else if (matchedStr.startsWith('\\[') && matchedStr.endsWith('\\]')) {
      mathExpr = matchedStr.slice(2, -2);
      isBlock = true;
    }

    parts.push({
      text: normalizeMathExpr(mathExpr),
      isMath: true,
      isBlock,
    });

    lastIndex = token.index + matchedStr.length;
  }

  if (lastIndex < content.length) {
    parts.push({
      text: content.substring(lastIndex),
      isMath: false,
      isBlock: false,
    });
  }

  if (parsedContentCache.size >= MAX_CACHE_SIZE) {
    const firstKey = parsedContentCache.keys().next().value;
    if (firstKey) parsedContentCache.delete(firstKey);
  }
  parsedContentCache.set(content, parts);
  return parts;
}

function isBareMath(expression: string): boolean {
  // If the expression contains LaTeX delimiters, let delimited parsing handle it.
  if (/[$¥\\]/.test(expression)) return false;
  // If the expression contains multiple spaces with words (prose inside parentheses), ignore it.
  if (/\b\p{L}+\s+\p{L}+\b/u.test(expression)) return false;

  if (/[\^_=<>≤≥≠*/×÷]/u.test(expression)) {
    const withoutParentheses = expression.replace(/\([^()]*\)/g, '');
    return !/[\p{L}]{2,}/u.test(withoutParentheses);
  }
  if (!/[+\-−]/u.test(expression)) return false;

  const withoutParentheses = expression.replace(/\([^()]*\)/g, '');
  return !/[\p{L}]{2,}/u.test(withoutParentheses);
}

export const TextRenderer: React.FC<TextRendererProps> = React.memo(({
  content = '',
  className = '',
  inline = false,
}) => {
  if (!content) return null;

  const parts = parseContentToParts(content);

  return (
    <span className={`text-renderer ${className}`}>
      {parts.map((part, index) => {
        if (!part.isMath) {
          return <React.Fragment key={index}>{part.text}</React.Fragment>;
        }

        const displayMode = part.isBlock && !inline;
        const html = getCachedKatexHtml(part.text, displayMode);

        if (!html) {
          return <span key={index} className="text-red-500 font-mono">{part.text}</span>;
        }

        return (
          <span
            key={index}
            className={`math-data-badge ${
              part.isBlock
                ? 'math-data-block'
                : 'math-data-inline'
            }`}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      })}
    </span>
  );
});

import { interests, profile, type InterestId } from './content.ts';

export const MAX_CONTEXT_LENGTH = 500;

export function isInterest(value: string): value is InterestId {
  return interests.some((interest) => interest.id === value);
}

export function createBrief(interestId: InterestId, context = '') {
  const interest =
    interests.find((item) => item.id === interestId) ?? interests[0];
  // The HTML limit counts UTF-16 units. Never leave a split surrogate at its boundary.
  const cleanContext = context
    .toWellFormed()
    .trim()
    .slice(0, MAX_CONTEXT_LENGTH)
    .replace(/[\uD800-\uDBFF]$/, '');
  const body = [
    'Hi Gyula,',
    '',
    `I’d like to ${interest.request}.`,
    ...(cleanContext ? ['', 'A little context:', cleanContext] : []),
    '',
    'Could we discuss a sensible next step?',
  ].join('\n');
  const subject = `Let’s put AI to work — ${interest.short}`;
  return {
    body,
    subject,
    href: `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
  };
}

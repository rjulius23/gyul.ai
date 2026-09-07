/** Hero insights paraphrase the owner's direct answers; team principles express their operating model. */
export const perspectives = [
  {
    id: 'context',
    number: '01',
    label: 'Context',
    position: 'tag-context',
    title: 'Business context before model choice.',
    body: 'Understanding the business goals, go-to-market strategy and product vision matters more to me than which model we use. That context tells us what is worth building—and what a good result actually means.',
  },
  {
    id: 'capability',
    number: '02',
    label: 'Capability',
    position: 'tag-tools',
    title: 'AI-first thinking. Not an add-on.',
    body: 'I want teams to approach problems AI-first. That means designing the work around what AI can do from the start, rather than adding a tool to an unchanged process. The goal is an AI-native way of working.',
  },
  {
    id: 'judgement',
    number: '03',
    label: 'Human judgement',
    position: 'tag-human',
    title: 'Human direction. Agent implementation.',
    body: 'High-level strategy and design taste stay with people. When building a UI, people shape the experience and its details; agents write the code. I step into technical decisions when they affect those higher-level goals.',
  },
] as const;

export const teamPrinciples = [
  {
    title: 'AI-first. End-to-end ownership.',
    body: 'Small teams own the outcome and consider AI from the start. Agents implement bounded slices; people set direction and judge whether the result serves the business.',
  },
  {
    title: 'Business context, made reusable.',
    body: 'Business goals, go-to-market strategy and product vision come before model choice. Carry that context into shared instructions and skills, and improve it as the team learns.',
  },
  {
    title: 'Human taste. Verified implementation.',
    body: 'People shape product decisions and UI details; agents write the code. Automated checks handle routine verification, leaving human attention for choices that affect intent, quality or risk.',
  },
  {
    title: 'Autonomy is earned.',
    body: 'Expand autonomy as checks earn trust. Permissions and CI enforce the boundaries—not prompts. Human attention goes to strategic choices and technical details that change the intended outcome or risk.',
  },
] as const;

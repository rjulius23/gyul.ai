/** Public, generalized statements of approach. Keep personal examples owner-approved. */
export const perspectives = [
  {
    id: 'context',
    number: '01',
    label: 'Context',
    position: 'tag-context',
    title: 'Give agents the whole picture.',
    body: 'I start with a clear outcome, relevant working context and a testable definition of done. What we learn goes back into shared instructions and reusable skills—not another one-off prompt.',
  },
  {
    id: 'capability',
    number: '02',
    label: 'Capability',
    position: 'tag-tools',
    title: 'Build capability, not tool dependency.',
    body: 'AI-native is a team habit, not a software licence. I want small teams to own a result end to end, delegate well-defined work, and build checks that make the next task easier.',
  },
  {
    id: 'judgement',
    number: '03',
    label: 'Human judgement',
    position: 'tag-human',
    title: 'Delegate execution. Keep ownership.',
    body: 'I expect evidence, not “the agent says it works”. People own intent, architecture and risk. Autonomy grows with proven checks and explicit permissions—not with a more confident answer.',
  },
] as const;

export const teamPrinciples = [
  {
    title: 'Small teams. End-to-end ownership.',
    body: 'Capable generalists own the outcome, from a clear specification to delivery. Agents work on small, bounded slices; people resolve ambiguity and make decisions.',
  },
  {
    title: 'Context is part of the system.',
    body: 'Shared instructions, reusable skills and a consistent toolchain improve every run. Feed lessons from reviews and failures back into that context.',
  },
  {
    title: 'Evidence before human review.',
    body: 'Tests and automated checks run before a person reviews intent and risk. Mandatory rules live in permissions and CI—not just in a prompt.',
  },
  {
    title: 'Autonomy is earned.',
    body: 'Automate low-risk work inside clear boundaries. Increase scope as verification earns trust, and keep sensitive changes behind deliberate human approval.',
  },
] as const;

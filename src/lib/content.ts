export const profile = {
  name: 'Gyula Halmos',
  brand: 'gyul.ai',
  email: 'gyula.halmos@gmail.com', // Intentionally public contact from the original website.
  url: 'https://gyul.ai',
  github: 'https://github.com/rjulius23',
  linkedin: 'https://www.linkedin.com/in/gyulahalmos/',
  roleAnnouncement:
    'https://www.linkedin.com/posts/gyulahalmos_some-personal-news-as-part-of-polymarket-activity-7479662391253712896-pQp2',
  title: 'Gyula Halmos — AI consulting, agents & workshops',
  description:
    'Put AI to work. Gyula Halmos helps teams find useful AI opportunities, build agent workflows, and learn by doing. Strategy, practical systems, and hands-on workshops.',
} as const;

export const interests = [
  {
    id: 'strategy',
    label: 'AI strategy & a practical roadmap',
    short: 'Find the opportunity',
    request: 'explore where AI could make a useful difference in our work',
  },
  {
    id: 'systems',
    label: 'Agent workflows & integrations',
    short: 'Build the system',
    request: 'discuss an agent workflow or integration',
  },
  {
    id: 'workshops',
    label: 'A workshop or team hackathon',
    short: 'Enable the team',
    request: 'plan a hands-on AI workshop or team hackathon',
  },
  {
    id: 'speaking',
    label: 'A talk, collaboration, or something else',
    short: 'Start a conversation',
    request: 'discuss a talk, collaboration, or another idea',
  },
] as const;
export type InterestId = (typeof interests)[number]['id'];

export const services = [
  {
    id: 'strategy',
    number: '01',
    eyebrow: 'FIND FOCUS',
    title: 'Start with the right problem.',
    description:
      'Not every workflow needs an agent. Map the work, decision bottlenecks and ownership first—then design a team and a pilot that can prove useful change.',
    deliverables: [
      'Workflow discovery',
      'AI-native team design',
      'Measured pilots',
    ],
  },
  {
    id: 'systems',
    number: '02',
    eyebrow: 'BUILD SOMETHING USEFUL',
    title: 'Connect the dots. Ship the system.',
    description:
      'Bring models, tools, and your real working context together. Design for evaluation, sensible boundaries, and a human in the right places.',
    deliverables: [
      'Agent workflows',
      'MCP & integrations',
      'Evaluation & review',
    ],
  },
  {
    id: 'workshops',
    number: '03',
    eyebrow: 'MAKE IT YOUR TEAM’S',
    title: 'Less slide deck. More doing.',
    description:
      'Build capability that stays after the session. Use real work and ambitious challenges to change how the team delegates, verifies and learns—not just which tools it opens.',
    deliverables: [
      'Hands-on workshops',
      'Skills & context design',
      'Team hackathons',
    ],
  },
] as const;

export const talks = [
  {
    name: 'DevBP #15',
    topic: 'A year of building with AI agents. What changed—and what didn’t.',
    tag: 'AGENT ORCHESTRATION · 2026',
    href: 'https://luma.com/myxm4b4o',
  },
  {
    name: 'Compass AI',
    topic: 'Generative AI for log analysis and agentic networks.',
    tag: 'CONFERENCE SESSION',
    href: 'https://ai.compasstechsummit.com/speaker/gyula-halmos',
  },
  {
    name: 'Brain Bar',
    topic: 'Conversations at the intersection of technology and the future.',
    tag: 'FESTIVAL SPEAKER',
    href: 'https://brainbar.com/en/person/gyula-halmos',
  },
] as const;

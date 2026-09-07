export const stageLabels = [
  'Input',
  'Agent',
  'Human review',
  'Output',
] as const;
export type Step = 0 | 1 | 2 | 3;
export type ScenarioId = 'research' | 'operations' | 'engineering';

export interface StageContent {
  heading: string;
  summary: string;
  bullets: readonly string[];
  artifactTitle: string;
  artifact: string;
}
export interface Scenario {
  id: ScenarioId;
  label: string;
  intent: string;
  stages: readonly [StageContent, StageContent, StageContent, StageContent];
}

// Authored, synthetic examples. No model, account, document, or network connection.
export const scenarios: readonly Scenario[] = [
  {
    id: 'research',
    label: 'Research brief',
    intent: 'Turn scattered notes into a decision-ready brief.',
    stages: [
      {
        heading: 'Start with useful context.',
        summary:
          'A fictional team is exploring better internal knowledge search. The scope is deliberately small.',
        bullets: [
          'Three synthetic source notes',
          'One question to answer',
          'Clear limits on access',
        ],
        artifactTitle: 'source-notes.txt',
        artifact:
          'QUESTION\nHow should we scope a knowledge-search pilot?\n\n[A] People search across several approved documents.\n[B] Restricted content must stay restricted.\n[C] A pilot needs an owner and a baseline.',
      },
      {
        heading: 'Let the agent do the legwork.',
        summary:
          'The illustrative agent organizes the notes into a draft. It carries references forward instead of presenting guesses as facts.',
        bullets: [
          'Group relevant evidence',
          'Keep source references',
          'Flag what is still unknown',
        ],
        artifactTitle: 'draft-brief.md',
        artifact:
          '# Knowledge-search pilot · DRAFT\n\n01  Start with one approved document collection. [A]\n02  Preserve the existing access boundaries. [B]\n03  Name an owner and record a starting baseline. [C]\n\nOPEN QUESTION\nWhich team and document set should go first?',
      },
      {
        heading: 'Keep judgement in human hands.',
        summary:
          'The workflow stops here. A person checks the scope, the evidence, and what should happen next.',
        bullets: [
          'Do the references support the draft?',
          'Are access boundaries explicit?',
          'Has someone agreed to own the pilot?',
        ],
        artifactTitle: 'review-checklist.md',
        artifact:
          'HUMAN REVIEW REQUIRED\n\n□ Check the draft against notes A–C.\n□ Confirm the pilot scope and document access.\n□ Resolve or acknowledge the open question.\n\nThis is an illustrative approval, not a live action.',
      },
      {
        heading: 'Make the next step clear.',
        summary:
          'The sample brief is ready for a conversation—not an automatic rollout. Nothing has been sent or deployed.',
        bullets: [
          'A scoped recommendation',
          'Traceable source notes',
          'An explicit next decision',
        ],
        artifactTitle: 'reviewed-brief.md',
        artifact:
          '# Knowledge-search pilot · SAMPLE REVIEWED\n\nRECOMMENDATION\nTrial a single approved collection with existing\naccess controls. [A, B]\n\nNEXT DECISION\nChoose a pilot owner, team, and baseline. [C]\n\nOUTPUT: a reviewed brief, not a deployed system.',
      },
    ],
  },
  {
    id: 'operations',
    label: 'Operations triage',
    intent: 'Move a request toward the right person—not an unchecked action.',
    stages: [
      {
        heading: 'Give a request some structure.',
        summary:
          'A synthetic access request arrives. The demo uses invented context rather than connecting to an inbox.',
        bullets: [
          'A fictional request',
          'A known routing policy',
          'No account access',
        ],
        artifactTitle: 'incoming-request.txt',
        artifact:
          'REQUEST · SYNTHETIC\nA teammate needs access to a shared reporting tool.\n\nROUTING RULE\nTool ownership determines who reviews access.\n\nBOUNDARY\nThe agent must not grant access.',
      },
      {
        heading: 'Classify. Don’t overreach.',
        summary:
          'The illustrative agent identifies the request type and prepares a handoff. Classification is not permission to execute.',
        bullets: [
          'Identify an access request',
          'Draft the routing rationale',
          'Avoid changing permissions',
        ],
        artifactTitle: 'triage-draft.md',
        artifact:
          'TYPE       Access request\nROUTE      Reporting-tool owner\nREASON     Owner reviews requested permissions\n\nDRAFT NEXT STEP\nAsk the owner to confirm need and access level.\n\nPERMISSION CHANGES: none',
      },
      {
        heading: 'A person owns the decision.',
        summary:
          'The proposed routing waits for review. Real systems also need authorization and audit controls enforced outside the browser.',
        bullets: [
          'Is this the correct owner?',
          'Is the request sufficiently clear?',
          'Should the proposed message be changed?',
        ],
        artifactTitle: 'routing-review.md',
        artifact:
          'HUMAN REVIEW REQUIRED\n\n□ Confirm the routing decision.\n□ Check for missing request context.\n□ Review the proposed next step.\n\nApproval here only advances this local example.',
      },
      {
        heading: 'A handoff, not a hidden action.',
        summary:
          'The example produces a reviewed routing note. It never sends a message or grants access.',
        bullets: [
          'A clear request category',
          'A reviewable next step',
          'No automatic permission changes',
        ],
        artifactTitle: 'handoff-note.md',
        artifact:
          'REVIEWED HANDOFF · SAMPLE\n\nRequest type: access to reporting tool\nProposed recipient: tool owner\nNext step: confirm need and access level\n\nMESSAGES SENT: none\nACCESS GRANTED: none',
      },
    ],
  },
  {
    id: 'engineering',
    label: 'Engineering assist',
    intent: 'Go from a bug report to a reviewable investigation plan.',
    stages: [
      {
        heading: 'Scope the investigation.',
        summary:
          'An invented bug report is the input. No repository is connected and no source files will change.',
        bullets: [
          'A reproducible symptom',
          'An explicit investigation scope',
          'No write access',
        ],
        artifactTitle: 'bug-report.md',
        artifact:
          'BUG · SYNTHETIC\nA settings panel shows stale data after saving.\n\nREPRODUCTION\n1. Open settings.\n2. Change a value and save.\n3. Reopen the panel without reloading.\n\nSCOPE: propose an investigation, not a patch.',
      },
      {
        heading: 'Turn symptoms into hypotheses.',
        summary:
          'The illustrative agent suggests where to look and which tests to add. It does not pretend to have inspected code.',
        bullets: [
          'Separate hypotheses from evidence',
          'Suggest a minimal reproduction',
          'Propose a regression test',
        ],
        artifactTitle: 'investigation-draft.md',
        artifact:
          'HYPOTHESES · NOT VERIFIED\n01  A local cache may outlive the save operation.\n02  The panel may reuse an earlier response.\n\nINVESTIGATE\nTrace save → state update → panel reopen.\n\nTEST TO ADD\nSaved values appear without a full-page reload.',
      },
      {
        heading: 'Review before touching the code.',
        summary:
          'A developer evaluates the hypotheses and decides what to investigate. The draft is not evidence that a bug has been fixed.',
        bullets: [
          'Does the plan match the symptom?',
          'Are assumptions marked as assumptions?',
          'Is the proposed test meaningful?',
        ],
        artifactTitle: 'developer-review.md',
        artifact:
          'DEVELOPER REVIEW REQUIRED\n\n□ Check scope against the bug report.\n□ Validate the proposed investigation.\n□ Decide on the next manual step.\n\nNo source code has been read or modified.',
      },
      {
        heading: 'Leave a reviewable next step.',
        summary:
          'The result is a small investigation brief, with uncertainty intact and a testable next action.',
        bullets: [
          'A bounded investigation',
          'Explicitly unverified hypotheses',
          'A proposed regression test',
        ],
        artifactTitle: 'investigation-plan.md',
        artifact:
          'REVIEWED PLAN · SAMPLE\n\nNEXT ACTION\nInspect the save / cache / reopen lifecycle.\n\nREGRESSION TEST\nReopen the settings panel and verify saved values.\n\nBUG FIXED: not claimed\nFILES CHANGED: none',
      },
    ],
  },
];

export function getScenario(id: ScenarioId): Scenario {
  return scenarios.find((scenario) => scenario.id === id) ?? scenarios[0]!;
}
export function isScenario(value: string): value is ScenarioId {
  return scenarios.some((scenario) => scenario.id === value);
}

export interface WorkflowState {
  scenario: ScenarioId;
  step: Step;
  running: boolean;
  approved: boolean;
}
export type WorkflowAction =
  | { type: 'scenario'; id: ScenarioId }
  | { type: 'run' | 'pause' | 'tick' | 'next' | 'reset' | 'approve' }
  | { type: 'inspect'; step: Step };

export const initialState = (
  scenario: ScenarioId = 'research',
): WorkflowState => ({ scenario, step: 0, running: false, approved: false });

export function transition(
  state: WorkflowState,
  action: WorkflowAction,
): WorkflowState {
  switch (action.type) {
    case 'scenario':
      return initialState(action.id);
    case 'reset':
      return initialState(state.scenario);
    case 'pause':
      return { ...state, running: false };
    case 'run':
      if (state.step === 3)
        return { ...initialState(state.scenario), running: true };
      return { ...state, running: state.step !== 2 || state.approved };
    case 'inspect': {
      const step = action.step === 3 && !state.approved ? 2 : action.step;
      return { ...state, step, running: false };
    }
    case 'approve':
      return state.step === 2
        ? { ...state, step: 3, approved: true, running: false }
        : state;
    case 'tick':
      if (!state.running) return state;
      return advance(state, true);
    case 'next':
      return advance(state, false);
  }
}

function advance(state: WorkflowState, running: boolean): WorkflowState {
  if (state.step === 3 || (state.step === 2 && !state.approved))
    return { ...state, running: false };
  const step = (state.step + 1) as Step;
  return {
    ...state,
    step,
    running: running && step !== 3 && !(step === 2 && !state.approved),
  };
}

export function stateMessage(state: WorkflowState): string {
  if (state.step === 3)
    return 'Sample complete. Nothing was sent or changed outside this page.';
  if (state.step === 2 && !state.approved)
    return 'Waiting for your review. Approve the sample draft to continue.';
  return `${stageLabels[state.step]} · ${state.running ? 'Demo running.' : 'Ready to explore. Use Run demo or Next step.'}`;
}

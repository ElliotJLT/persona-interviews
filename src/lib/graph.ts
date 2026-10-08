import { getResults, listPersonas, getResponse, getOptionIndex } from "./store";

export const FACETS = [
  {
    key: "industry" as const,
    label: "Industry",
    values: ["Technology", "Financial Services", "Venture Capital", "IT Services"],
  },
  {
    key: "seniority" as const,
    label: "Seniority",
    values: ["Executive Level", "Senior Level", "Mid-level"],
  },
  {
    key: "generation" as const,
    label: "Generation",
    values: ["Millennial", "Gen X", "Gen Z"],
  },
];

export type FacetKey = (typeof FACETS)[number]["key"];

export interface GraphNode {
  id: string;
  x: number;
  y: number;
  option: string;
  industry: string;
  seniority: string;
  generation: string;
  /** Set for respondents whose full profile is loaded and interviewable. */
  personaId: string | null;
}

export interface GraphEdge {
  a: number;
  b: number;
  /** True when the edge touches a respondent with a loaded profile. */
  local: boolean;
}

export interface SocietyLayout {
  nodes: GraphNode[];
  edges: GraphEdge[];
  size: number;
}

/** Deterministic PRNG so the society renders identically on server and client. */
function mulberry32(seed: number) {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gaussian(random: () => number): number {
  const u = Math.max(random(), 1e-9);
  const v = random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

const SIZE = 1000;
const CENTRE = SIZE / 2;
const RADIUS = SIZE * 0.46;
const NODE_TOTAL = 250;
/** How many nearest neighbours each respondent is tied to. */
const DEGREE = 2;

/**
 * Positions respondents as one society with communities inside it. Each option
 * pulls its respondents toward a centre of gravity, and the spread is wide
 * enough that the communities overlap rather than separating into islands, so
 * proximity reads as shared opinion rather than as a hard boundary.
 */
export function buildSociety(): SocietyLayout {
  const random = mulberry32(0x5eed_1234);
  const results = getResults();
  const nodes: GraphNode[] = [];

  const claimed = new Map<string, string>();
  for (const persona of listPersonas()) {
    const response = getResponse(persona.id);
    if (response) claimed.set(persona.id, response.choice);
  }
  const pending = [...claimed.entries()];

  results.forEach((result) => {
    const index = getOptionIndex(result.option);
    const angle = (index / results.length) * Math.PI * 2 - Math.PI / 2;
    const gravityX = CENTRE + Math.cos(angle) * RADIUS * 0.54;
    const gravityY = CENTRE + Math.sin(angle) * RADIUS * 0.54;
    const count = Math.max(12, Math.round(result.share * NODE_TOTAL));

    for (let i = 0; i < count; i += 1) {
      let x = 0;
      let y = 0;
      for (let attempt = 0; attempt < 24; attempt += 1) {
        x = gravityX + gaussian(random) * RADIUS * 0.3;
        y = gravityY + gaussian(random) * RADIUS * 0.3;
        const dx = x - CENTRE;
        const dy = y - CENTRE;
        if (dx * dx + dy * dy <= RADIUS * RADIUS) break;
      }
      // Trigonometric results can differ in the last bit between the server
      // runtime and the browser, so coordinates are quantised before render.
      x = Math.round(x * 10) / 10;
      y = Math.round(y * 10) / 10;

      // Give the first node of each community a loaded profile where one is
      // waiting, so interviewable respondents sit inside their own cluster.
      let personaId: string | null = null;
      const match = pending.findIndex(([, choice]) => choice === result.option);
      if (i === Math.floor(count / 3) && match !== -1) {
        personaId = pending[match][0];
        pending.splice(match, 1);
      } else if (i === Math.floor(count / 1.7) && match !== -1) {
        personaId = pending[match][0];
        pending.splice(match, 1);
      }

      // A respondent's industry comes from their own profile where one is
      // loaded, and otherwise from the audience mix, so filtering the
      // population and filtering an interviewable respondent agree.
      const loaded = personaId
        ? listPersonas().find((entry) => entry.id === personaId)
        : undefined;
      const pick = (key: FacetKey, own: string | undefined) => {
        const values = FACETS.find((facet) => facet.key === key)!.values;
        const match = own && values.find((value) => own.startsWith(value));
        return match ?? values[Math.floor(random() * values.length)];
      };
      const industry = pick("industry", loaded?.industry);
      const seniority = pick("seniority", loaded?.seniority);
      const generation = pick("generation", loaded?.generation);

      nodes.push({
        id: `nod_${result.option}_${i}`,
        x,
        y,
        option: result.option,
        industry,
        seniority,
        generation,
        personaId,
      });
    }
  });

  // Tie each respondent to their nearest neighbours so the connections trace
  // the shape of the communities rather than scattering across the disc.
  const seen = new Set<string>();
  const edges: GraphEdge[] = [];

  nodes.forEach((node, i) => {
    const nearest = nodes
      .map((other, j) => {
        const dx = node.x - other.x;
        const dy = node.y - other.y;
        return { j, distance: dx * dx + dy * dy };
      })
      .filter((entry) => entry.j !== i)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, DEGREE);

    for (const { j } of nearest) {
      const key = i < j ? `${i}:${j}` : `${j}:${i}`;
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push({
        a: i,
        b: j,
        local: node.personaId !== null || nodes[j].personaId !== null,
      });
    }
  });

  return { nodes, edges, size: SIZE };
}

export const society = buildSociety();

export function nodeIndexForPersona(personaId: string): number {
  return society.nodes.findIndex((node) => node.personaId === personaId);
}

/**
 * The respondent and the people whose views reach them: direct ties, plus the
 * ties of those ties. Two hops is enough to read as a community rather than a
 * handful of dots.
 */
export function neighbourhood(index: number, hops = 2): Set<number> {
  const members = new Set<number>();
  if (index < 0) return members;

  let frontier = new Set<number>([index]);
  members.add(index);

  for (let hop = 0; hop < hops; hop += 1) {
    const next = new Set<number>();
    for (const edge of society.edges) {
      if (frontier.has(edge.a) && !members.has(edge.b)) next.add(edge.b);
      if (frontier.has(edge.b) && !members.has(edge.a)) next.add(edge.a);
    }
    for (const member of next) members.add(member);
    frontier = next;
  }

  return members;
}

type Point3 = { x: number; y: number; z: number };
export type SignalRing = { points: Point3[]; highlighted: boolean };
export type ProjectedRing = SignalRing & { depth: number };

const subtract = (a: Point3, b: Point3): Point3 => ({
  x: a.x - b.x,
  y: a.y - b.y,
  z: a.z - b.z,
});
const normalize = (p: Point3): Point3 => {
  const length = Math.hypot(p.x, p.y, p.z) || 1;
  return { x: p.x / length, y: p.y / length, z: p.z / length };
};
const cross = (a: Point3, b: Point3): Point3 => ({
  x: a.y * b.z - a.z * b.y,
  y: a.z * b.x - a.x * b.z,
  z: a.x * b.y - a.y * b.x,
});
const center = (t: number): Point3 => ({
  x: (1.65 + 0.62 * Math.cos(3 * t)) * Math.cos(2 * t),
  y: (1.65 + 0.62 * Math.cos(3 * t)) * Math.sin(2 * t),
  z: 0.82 * Math.sin(3 * t),
});

/** Deterministic trefoil tube: one geometry powers static SVG and enhanced Canvas. */
export function createSignalGeometry(count = 144, sides = 28): SignalRing[] {
  return Array.from({ length: count }, (_, ring) => {
    const t = (ring / count) * Math.PI * 2;
    const origin = center(t);
    const tangent = normalize(subtract(center(t + 0.001), origin));
    const normal = normalize(cross(tangent, { x: 0, y: 0, z: 1 }));
    const binormal = cross(tangent, normal);
    const radius = 0.285 + 0.035 * Math.sin(t * 3);
    return {
      highlighted: ring >= count * 0.46 && ring <= count * 0.54,
      points: Array.from({ length: sides }, (_, side) => {
        const a = (side / sides) * Math.PI * 2;
        const u = radius * Math.cos(a);
        const v = radius * Math.sin(a);
        return {
          x: origin.x + normal.x * u + binormal.x * v,
          y: origin.y + normal.y * u + binormal.y * v,
          z: origin.z + normal.z * u + binormal.z * v,
        };
      }),
    };
  });
}

export function projectSignal(
  geometry: SignalRing[],
  rotationX = 0.65,
  rotationY = -0.28,
  rotationZ = -0.3,
): ProjectedRing[] {
  const cx = Math.cos(rotationX),
    sx = Math.sin(rotationX);
  const cy = Math.cos(rotationY),
    sy = Math.sin(rotationY);
  const cz = Math.cos(rotationZ),
    sz = Math.sin(rotationZ);
  return geometry
    .map((ring) => {
      let depth = 0;
      const points = ring.points.map((p) => {
        const y = p.y * cx - p.z * sx,
          z = p.y * sx + p.z * cx;
        const x2 = p.x * cy + z * sy,
          z2 = -p.x * sy + z * cy;
        const x3 = x2 * cz - y * sz,
          y3 = x2 * sz + y * cz;
        const perspective = 5 / (5 - z2 * 0.28);
        depth += z2;
        return {
          x: 300 + x3 * 108 * perspective,
          y: 268 + y3 * 108 * perspective,
          z: z2,
        };
      });
      return {
        points,
        depth: depth / points.length,
        highlighted: ring.highlighted,
      };
    })
    .sort((a, b) => a.depth - b.depth);
}

export function ringStyle(ring: ProjectedRing) {
  const light = Math.max(175, Math.min(243, Math.round(222 + ring.depth * 10)));
  return {
    fill: ring.highlighted
      ? '#e8ef61'
      : `rgb(${light},${light + 1},${light - 4})`,
    stroke: ring.highlighted ? '#777d2f' : '#44483e',
  };
}

export function ringPath(ring: ProjectedRing): string {
  return (
    ring.points
      .map(
        (point, index) =>
          `${index ? 'L' : 'M'}${point.x.toFixed(1)},${point.y.toFixed(1)}`,
      )
      .join(' ') + 'Z'
  );
}

/** Model-space units; x/y run along the ground and z is vertical. */
export type Point3 = readonly [x: number, y: number, z: number];
export type Point2 = Readonly<{ x: number; y: number }>;

const SCALE = 22;
const ORIGIN = { x: 211, y: 153 };

/** One true isometric basis: all three unit axes have equal projected length. */
export function projectHome([x, y, z]: Point3): Point2 {
  return {
    x: ORIGIN.x + (x - y) * (Math.sqrt(3) / 2) * SCALE,
    y: ORIGIN.y + ((x + y) / 2 - z) * SCALE,
  };
}

/** Round only at the SVG boundary; shared vertices serialize identically. */
export function homePath(points: readonly Point3[], close = true): string {
  return (
    points
      .map((point, index) => {
        const { x, y } = projectHome(point);
        return `${index === 0 ? 'M' : 'L'}${x.toFixed(3)} ${y.toFixed(3)}`;
      })
      .join(' ') + (close ? ' Z' : '')
  );
}

export const homeSize = {
  width: 6,
  depth: 4.6,
  eaves: 3.3,
  ridge: 5.3,
} as const;
const { width: w, depth: d, eaves: h, ridge: r } = homeSize;

// Named vertices are reused by both walls and roof: there are no screen-space fixes.
export const homeVertices = {
  backLeft: [0, 0, h],
  backRight: [w, 0, h],
  frontLeft: [0, d, h],
  frontRight: [w, d, h],
  backRidge: [w / 2, 0, r],
  frontRidge: [w / 2, d, r],
  frontLeftBase: [0, d, 0],
  frontRightBase: [w, d, 0],
  backRightBase: [w, 0, 0],
} as const satisfies Record<string, Point3>;
const v = homeVertices;

export const homeFaces = {
  ground: [
    [-1, -1, -0.16],
    [7, -1, -0.16],
    [7, 5.6, -0.16],
    [-1, 5.6, -0.16],
  ],
  groundFront: [
    [-1, 5.6, -0.16],
    [7, 5.6, -0.16],
    [7, 5.6, -0.5],
    [-1, 5.6, -0.5],
  ],
  groundSide: [
    [7, -1, -0.16],
    [7, 5.6, -0.16],
    [7, 5.6, -0.5],
    [7, -1, -0.5],
  ],
  entryPath: [
    [3.15, d, -0.15],
    [4.75, d, -0.15],
    [4.75, 5.6, -0.15],
    [3.15, 5.6, -0.15],
  ],
  sideWall: [v.backRightBase, v.frontRightBase, v.frontRight, v.backRight],
  frontWall: [
    v.frontLeftBase,
    v.frontRightBase,
    v.frontRight,
    v.frontRidge,
    v.frontLeft,
  ],
  farRoof: [v.backLeft, v.backRidge, v.frontRidge, v.frontLeft],
  nearRoof: [v.backRidge, v.backRight, v.frontRight, v.frontRidge],
} as const satisfies Record<string, readonly Point3[]>;

export const homeOpenings = {
  frontWindow: [
    [0.65, d, 1.2],
    [2.3, d, 1.2],
    [2.3, d, 2.35],
    [0.65, d, 2.35],
  ],
  door: [
    [3.3, d, 0],
    [4.65, d, 0],
    [4.65, d, 2.4],
    [3.3, d, 2.4],
  ],
  sideWindowBack: [
    [w, 0.65, 1.2],
    [w, 1.85, 1.2],
    [w, 1.85, 2.35],
    [w, 0.65, 2.35],
  ],
  sideWindowFront: [
    [w, 2.65, 1.2],
    [w, 3.85, 1.2],
    [w, 3.85, 2.35],
    [w, 2.65, 2.35],
  ],
} as const satisfies Record<string, readonly Point3[]>;

export function roofHeight(x: number): number {
  return r - (Math.abs(x - w / 2) / (w / 2)) * (r - h);
}

export const homeDetails = {
  roofSeamOne: [
    [4, 0, roofHeight(4)],
    [4, d, roofHeight(4)],
  ],
  roofSeamTwo: [
    [5, 0, roofHeight(5)],
    [5, d, roofHeight(5)],
  ],
  windowMullion: [
    [1.475, d, 1.2],
    [1.475, d, 2.35],
  ],
  doorHandle: [
    [4.4, d, 1.05],
    [4.4, d, 1.3],
  ],
} as const satisfies Record<string, readonly Point3[]>;

export const homeSensors = {
  context: [0.3, d, 2.75],
  control: [w, 1.1, 2.8],
  comfort: [w, 3.25, 1.775],
} as const satisfies Record<string, Point3>;

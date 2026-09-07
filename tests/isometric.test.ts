import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  homeDetails,
  homeFaces,
  homeOpenings,
  homePath,
  homeSensors,
  homeSize,
  homeVertices,
  projectHome,
  roofHeight,
  type Point3,
} from '../src/lib/isometric.ts';

const near = (actual: number, expected: number) =>
  assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} != ${expected}`);

test('the isometric basis has equal-length axes, 120° separation and vertical z', () => {
  const origin = projectHome([0, 0, 0]);
  const axes = (
    [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ] as const
  ).map((p) => {
    const point = projectHome(p);
    return { x: point.x - origin.x, y: point.y - origin.y };
  });
  for (const axis of axes) near(Math.hypot(axis.x, axis.y), 22);
  for (let i = 0; i < axes.length; i++) {
    for (let j = i + 1; j < axes.length; j++) {
      const a = axes[i]!;
      const b = axes[j]!;
      near((a.x * b.x + a.y * b.y) / (22 * 22), -0.5);
    }
  }
  near(axes[2]!.x, 0);
  assert.ok(axes[2]!.y < 0);
});

test('projection is affine: architectural parallel lines cannot drift apart', () => {
  const a: Point3 = [0.2, 2.8, 1.7];
  const b: Point3 = [6, 4.6, 5.3];
  const midpoint = projectHome([
    (a[0] + b[0]) / 2,
    (a[1] + b[1]) / 2,
    (a[2] + b[2]) / 2,
  ]);
  const pa = projectHome(a);
  const pb = projectHome(b);
  near(midpoint.x, (pa.x + pb.x) / 2);
  near(midpoint.y, (pa.y + pb.y) / 2);
});

test('roof, gable and visible side share the exact ridge/eave/corner vertices', () => {
  const hasEdge = (face: readonly Point3[], a: Point3, b: Point3) =>
    face.some((point, i) => point === a && face[(i + 1) % face.length] === b);
  const sharedEdge = (
    a: readonly Point3[],
    b: readonly Point3[],
    p: Point3,
    q: Point3,
  ) => {
    assert.ok(hasEdge(a, p, q) || hasEdge(a, q, p));
    assert.ok(hasEdge(b, p, q) || hasEdge(b, q, p));
  };
  const v = homeVertices;
  sharedEdge(homeFaces.nearRoof, homeFaces.farRoof, v.backRidge, v.frontRidge);
  sharedEdge(homeFaces.nearRoof, homeFaces.sideWall, v.backRight, v.frontRight);
  sharedEdge(
    homeFaces.nearRoof,
    homeFaces.frontWall,
    v.frontRidge,
    v.frontRight,
  );
  sharedEdge(homeFaces.farRoof, homeFaces.frontWall, v.frontLeft, v.frontRidge);
  sharedEdge(
    homeFaces.frontWall,
    homeFaces.sideWall,
    v.frontRight,
    v.frontRightBase,
  );
});

test('roof vertices and standing seams lie on their real roof planes', () => {
  for (const face of [homeFaces.nearRoof, homeFaces.farRoof]) {
    for (const [x, , z] of face) near(z, roofHeight(x));
  }
  for (const line of [homeDetails.roofSeamOne, homeDetails.roofSeamTwo]) {
    for (const [x, , z] of line) near(z, roofHeight(x));
    near(line[0][0], line[1][0]);
    near(line[0][1], 0);
    near(line[1][1], homeSize.depth);
  }
});

test('openings are rectangular, coplanar with their wall and inside its bounds', () => {
  for (const [name, opening] of Object.entries(homeOpenings)) {
    const front = name === 'frontWindow' || name === 'door';
    const axis = front ? 0 : 1;
    for (const point of opening) {
      near(point[front ? 1 : 0], front ? homeSize.depth : homeSize.width);
      assert.ok(
        point[axis] > 0 &&
          point[axis] < (front ? homeSize.width : homeSize.depth),
      );
      assert.ok(point[2] >= 0 && point[2] < homeSize.eaves);
    }
    near(opening[0][2], opening[1][2]);
    near(opening[2][2], opening[3][2]);
    near(opening[0][axis], opening[3][axis]);
    near(opening[1][axis], opening[2][axis]);
    const [a, b, c, d] = opening.map(projectHome);
    near(a!.x + c!.x, b!.x + d!.x);
    near(a!.y + c!.y, b!.y + d!.y);
  }
  near(homeOpenings.door[0][2], homeVertices.frontRightBase[2]);
});

test('ground, walls and all details project to finite points within the 450×320 canvas', () => {
  const points = [
    ...Object.values(homeFaces).flat(),
    ...Object.values(homeOpenings).flat(),
    ...Object.values(homeDetails).flat(),
    ...Object.values(homeSensors),
  ];
  for (const point of points) {
    const { x, y } = projectHome(point);
    assert.ok(Number.isFinite(x) && Number.isFinite(y));
    assert.ok(x > 35 && x < 415 && y > 35 && y < 310);
  }
});

test('SVG paths serialize deterministically, with explicitly open detail lines', () => {
  assert.equal(homePath(homeFaces.frontWall), homePath(homeFaces.frontWall));
  assert.ok(homePath(homeFaces.frontWall).endsWith(' Z'));
  assert.ok(!homePath(homeDetails.doorHandle, false).includes('Z'));
  assert.ok(!homePath(homeFaces.frontWall).includes('NaN'));
});

test('official self-hosted marks retain their aspect ratio and SVG is passive', () => {
  const svg = readFileSync(
    new URL('../public/brands/craft-agents.svg', import.meta.url),
    'utf8',
  );
  assert.match(svg, /viewBox="0 0 24 24"/);
  assert.match(svg, /#9570BE/);
  assert.match(svg, /translate\(3\.4502, 3\)/);
  assert.doesNotMatch(
    svg,
    /<(?:script|foreignObject|image|use|style|animate|set)\b|\bon\w+\s*=|(?:href|url)\s*[=(]/i,
  );
  const tags = [...svg.matchAll(/<\/?([\w:]+)/g)].map((match) => match[1]);
  assert.ok(tags.every((tag) => ['svg', 'g', 'path'].includes(tag!)));
  const png = readFileSync(
    new URL('../public/brands/yabune-solutions.png', import.meta.url),
  );
  assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  assert.equal(png.readUInt32BE(16), 2941);
  assert.equal(png.readUInt32BE(20), 805);
});

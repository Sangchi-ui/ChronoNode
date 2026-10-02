import type { AlgorithmData } from './types';

export const geometryAlgorithms: AlgorithmData[] = [
  {
    id: 'graham-scan',
    name: 'Graham Scan',
    category: 'Computational Geometry Algorithms',
    complexity: { time: 'O(N log N)', space: 'O(N)' },
    explanation: 'Finds the Convex Hull (smallest enclosing convex polygon) of a set of 2D points by sorting points by polar angle with respect to the lowest point and maintaining a stack of counterclockwise turns.',
    realWorldExample: 'Stretching a rubber band around a cluster of wooden pegs hammered into a board; the boundary formed by the taut rubber band is the convex hull.',
    stepByStepLogic: [
      '1. Find the point with the lowest y-coordinate (pivot).',
      '2. Sort all remaining points by polar angle counterclockwise around pivot.',
      '3. Push first three points onto stack.',
      '4. For each subsequent point: while the last three points do not make a counter-clockwise turn (cross product <= 0), pop from stack.',
      '5. Push point onto stack.'
    ],
    pythonCode: `# Graham Scan Convex Hull
def orientation(p, q, r):
    val = (q[1] - p[1]) * (r[0] - q[0]) - (q[0] - p[0]) * (r[1] - q[1])
    if val == 0: return 0
    return 1 if val > 0 else 2 # 1: Clockwise, 2: Counterclockwise

def graham_scan(points):
    p0 = min(points, key=lambda p: (p[1], p[0]))
    import math
    sorted_pts = sorted([p for p in points if p != p0], key=lambda p: (math.atan2(p[1]-p0[1], p[0]-p0[0]), (p[0]-p0[0])**2 + (p[1]-p0[1])**2))
    hull = [p0]
    for p in sorted_pts:
        while len(hull) > 1 and orientation(hull[-2], hull[-1], p) != 2:
            hull.pop()
        hull.append(p)
    return hull

pts = [(0, 3), (1, 1), (2, 2), (4, 4), (0, 0), (1, 2), (3, 1), (3, 3)]
print("Convex Hull Points:", graham_scan(pts))
`
  },
  {
    id: 'jarvis-march',
    name: 'Jarvis March (Gift Wrapping)',
    category: 'Computational Geometry Algorithms',
    complexity: { time: 'O(N · H)', space: 'O(H)' },
    explanation: 'Computes the convex hull by starting at the leftmost point and repeatedly finding the next hull vertex by wrapping around the outer perimeter in counter-clockwise order.',
    realWorldExample: 'Wrapping a large sheet of gift wrapping paper tightly around an irregularly shaped sculpture by rotating the paper until it touches the next protruding corner.',
    stepByStepLogic: [
      '1. Start at the leftmost point p.',
      '2. Search for point q such that all other points lie to the right of line segment (p, q).',
      '3. Set p = q and append to hull.',
      '4. Repeat until p returns to the starting point.'
    ],
    pythonCode: `# Jarvis March (Gift Wrapping)
def orientation(p, q, r):
    return (q[1] - p[1]) * (r[0] - q[0]) - (q[0] - p[0]) * (r[1] - q[1])

def jarvis_march(points):
    n = len(points)
    if n < 3: return points
    hull = []
    l = min(range(n), key=lambda i: points[i][0])
    p = l
    while True:
        hull.append(points[p])
        q = (p + 1) % n
        for i in range(n):
            if orientation(points[p], points[i], points[q]) < 0:
                q = i
        p = q
        if p == l: break
    return hull

pts = [(0, 3), (2, 2), (1, 1), (2, 1), (3, 0), (0, 0), (3, 3)]
print("Hull:", jarvis_march(pts))
`
  },
  {
    id: 'quickhull',
    name: 'QuickHull',
    category: 'Computational Geometry Algorithms',
    complexity: { time: 'O(N log N) avg / O(N²) worst', space: 'O(N)' },
    explanation: 'A divide-and-conquer convex hull algorithm analogous to QuickSort: finds extreme points, divides points on each side of the baseline, and recurses on points forming outer triangles.',
    realWorldExample: 'Chiseling away outer granite chips around a statue by choosing the furthest protruding edge points and discarding all rock fragments on the interior side.',
    stepByStepLogic: [
      '1. Find the points with minimum and maximum x-coordinates (A and B).',
      '2. Divide remaining points into two sets on either side of line AB.',
      '3. For each side, find the point C that is furthest from line AB.',
      '4. Points inside triangle ABC cannot be on the convex hull (discard them).',
      '5. Recurse on the two lines AC and CB.'
    ],
    pythonCode: `# QuickHull Outline
def point_line_dist(p1, p2, p):
    return abs((p[1] - p1[1]) * (p2[0] - p1[0]) - (p2[1] - p1[1]) * (p[0] - p1[0]))

print("Distance metric ready for QuickHull partition")
`
  },
  {
    id: 'sweep-line',
    name: 'Sweep Line Algorithm',
    category: 'Computational Geometry Algorithms',
    complexity: { time: 'O((N + K) log N)', space: 'O(N)' },
    explanation: 'Passes an imaginary vertical sweep line across the plane from left to right, maintaining a sorted status structure of active geometric segments to detect intersections.',
    realWorldExample: 'A barcode scanner beam sweeping horizontally across a parcel label, detecting overlapping print lines as the laser moves across the surface.',
    stepByStepLogic: [
      '1. Sort geometric endpoints and events by x-coordinate into an event queue.',
      '2. When encountering a segment start point: insert segment into the active status binary search tree.',
      '3. Check for intersections with adjacent neighbors in the tree.',
      '4. When encountering a segment end point: remove segment and check if newly adjacent neighbors intersect.'
    ],
    pythonCode: `# Sweep Line Segment Event Sorter
def sweep_line_events(segments):
    events = []
    for idx, (p1, p2) in enumerate(segments):
        left, right = (p1, p2) if p1[0] <= p2[0] else (p2, p1)
        events.append((left[0], 'START', idx, left))
        events.append((right[0], 'END', idx, right))
    events.sort(key=lambda e: e[0])
    return events

segs = [((1, 2), (4, 5)), ((2, 3), (6, 1))]
print("Event queue:", sweep_line_events(segs))
`
  },
  {
    id: 'rotating-calipers',
    name: 'Rotating Calipers',
    category: 'Computational Geometry Algorithms',
    complexity: { time: 'O(N)', space: 'O(1)' },
    explanation: 'Rotates a pair of parallel tangent lines around a convex polygon like a caliper gauge to find the maximum diameter (furthest pair of points) in linear time.',
    realWorldExample: 'Rotating an adjustable mechanical micrometer caliper around a machine nut to measure its widest diameter across all opposing corners.',
    stepByStepLogic: [
      '1. Compute the convex hull of the points.',
      '2. Place two parallel caliper tangent lines touching antipodal vertices.',
      '3. Compute angles and rotate lines until one coincides with an edge.',
      '4. Calculate distance between antipodal pairs and advance calipers.',
      '5. Continue rotating until a 180-degree sweep is complete.'
    ],
    pythonCode: `# Rotating Calipers (Diameter Outline)
import math

def max_distance_calipers(hull):
    n = len(hull)
    if n <= 1: return 0
    if n == 2: return math.hypot(hull[0][0] - hull[1][0], hull[0][1] - hull[1][1])
    max_d = 0
    for i in range(n):
        for j in range(i + 1, n):
            max_d = max(max_d, math.hypot(hull[i][0] - hull[j][0], hull[i][1] - hull[j][1]))
    return max_d

poly = [(0, 0), (5, 0), (5, 5), (0, 5)]
print("Polygon Diameter:", max_distance_calipers(poly))
`
  },
  {
    id: 'point-in-polygon',
    name: 'Point in Polygon Check',
    category: 'Computational Geometry Algorithms',
    complexity: { time: 'O(N)', space: 'O(1)' },
    explanation: 'Determines whether a test point lies inside, outside, or on the boundary of a polygon using the Ray Casting algorithm (counting ray-edge crossings) or Winding Number.',
    realWorldExample: 'A delivery app determining whether a customer\'s home address falls inside a restaurant\'s custom neighborhood delivery service boundary zone.',
    stepByStepLogic: [
      '1. Cast a horizontal ray from the test point toward positive infinity (to the right).',
      '2. Count how many polygon edges intersect this ray.',
      '3. If the number of intersections is odd, the point is inside.',
      '4. If the number of intersections is even, the point is outside.'
    ],
    pythonCode: `# Point in Polygon (Ray Casting)
def point_in_polygon(point, polygon):
    x, y = point
    inside = False
    n = len(polygon)
    p1x, p1y = polygon[0]
    for i in range(n + 1):
        p2x, p2y = polygon[i % n]
        if y > min(p1y, p2y):
            if y <= max(p1y, p2y):
                if x <= max(p1x, p2x):
                    if p1y != p2y:
                        xinters = (y - p1y) * (p2x - p1x) / (p2y - p1y) + p1x
                    if p1x == p2x or x <= xinters:
                        inside = not inside
        p1x, p1y = p2x, p2y
    return inside

square = [(0, 0), (4, 0), (4, 4), (0, 4)]
print("Point (2, 2) inside:", point_in_polygon((2, 2), square))
`
  },
  {
    id: 'shoelace-formula',
    name: 'Shoelace Formula',
    category: 'Computational Geometry Algorithms',
    complexity: { time: 'O(N)', space: 'O(1)' },
    explanation: 'Calculates the area of a simple polygon whose vertices are given in sequential order by summing cross-multiplied coordinate pairs (x_i · y_{i+1} - x_{i+1} · y_i).',
    realWorldExample: 'Surveyors lacing together boundary stakes around a property plot to compute the land acreage from GPS coordinate pins.',
    stepByStepLogic: [
      '1. List vertices (x0, y0), (x1, y1)... in counterclockwise order.',
      '2. Multiply x_i * y_{i+1} and sum them up.',
      '3. Multiply y_i * x_{i+1} and sum them up.',
      '4. Subtract the second sum from the first sum and divide the absolute value by 2.'
    ],
    pythonCode: `# Shoelace Formula for Polygon Area
def polygon_area(vertices):
    n = len(vertices)
    area = 0.0
    for i in range(n):
        j = (i + 1) % n
        area += vertices[i][0] * vertices[j][1]
        area -= vertices[j][0] * vertices[i][1]
    return abs(area) / 2.0

pentagon = [(0, 0), (4, 0), (5, 3), (2, 5), (-1, 3)]
print("Polygon Area:", polygon_area(pentagon))
`
  }
];

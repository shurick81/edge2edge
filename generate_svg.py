"""Generate export.svg using the same geometry as the 3D scene.

The geometry constants and logic here must stay in sync with geometry.js.
"""
import math

GRID_SIZE = 100
SQUARE_SIZE = 8 / 100
TOTAL_SIZE = GRID_SIZE * SQUARE_SIZE
ORIGIN_X = -TOTAL_SIZE / 2
ORIGIN_Z = -TOTAL_SIZE / 2

BX = ORIGIN_X + TOTAL_SIZE
BZ = ORIGIN_Z

DX = ORIGIN_X
DZ = ORIGIN_Z + TOTAL_SIZE


def transform_vertex(x, z):
    s = (x - ORIGIN_X) / TOTAL_SIZE
    new_x = ORIGIN_X + s * (BX - ORIGIN_X)
    new_z = z + s * (BZ - z)
    return new_x, new_z


def reflect_across_db(x, z):
    lx = BX - DX
    lz = BZ - DZ
    len2 = lx * lx + lz * lz
    px = x - DX
    pz = z - DZ
    dot = (px * lx + pz * lz) / len2
    rx = 2 * (DX + dot * lx) - x
    rz = 2 * (DZ + dot * lz) - z
    return rx, rz


def get_quads():
    quads = []
    for row in range(GRID_SIZE):
        for col in range(GRID_SIZE):
            x0 = ORIGIN_X + col * SQUARE_SIZE
            x1 = ORIGIN_X + (col + 1) * SQUARE_SIZE
            z0 = ORIGIN_Z + row * SQUARE_SIZE
            z1 = ORIGIN_Z + (row + 1) * SQUARE_SIZE

            verts = [
                transform_vertex(x0, z0),
                transform_vertex(x1, z0),
                transform_vertex(x1, z1),
                transform_vertex(x0, z1),
            ]
            is_white = (row + col) % 2 == 0
            quads.append((verts, is_white))

            mirrored = [reflect_across_db(vx, vz) for vx, vz in verts]
            mirrored.reverse()
            quads.append((mirrored, not is_white))
    return quads


def generate_svg():
    svg_size = 800
    padding = 20

    quads = get_quads()

    all_x = [v[0] for q in quads for v in q[0]]
    all_z = [v[1] for q in quads for v in q[0]]
    min_x, max_x = min(all_x), max(all_x)
    min_z, max_z = min(all_z), max(all_z)

    range_x = max_x - min_x
    range_z = max_z - min_z
    scale = (svg_size - 2 * padding) / max(range_x, range_z)

    def to_svg(x, z):
        sx = padding + (x - min_x) * scale
        sy = padding + (z - min_z) * scale
        return f"{sx:.4f},{sy:.4f}"

    polygons = []
    for vertices, is_white in quads:
        points = " ".join(to_svg(x, z) for x, z in vertices)
        fill = "#ffffff" if is_white else "#000000"
        polygons.append(
            f'  <polygon points="{points}" fill="{fill}" stroke="{fill}" stroke-width="0.1"/>'
        )

    return f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="{svg_size}" height="{svg_size}" viewBox="0 0 {svg_size} {svg_size}">
{chr(10).join(polygons)}
</svg>'''


if __name__ == "__main__":
    svg = generate_svg()
    with open("export.svg", "w") as f:
        f.write(svg)
    print("Written export.svg")

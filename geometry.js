const gridSize = 100;
const squareSize = 8 / 100;
const totalSize = gridSize * squareSize;
const originX = -totalSize / 2;
const originZ = -totalSize / 2;

const bx = originX + totalSize;
const bz = originZ;

function transformVertex(x, z) {
    const s = (x - originX) / totalSize;
    const newX = originX + s * (bx - originX);
    const newZ = z + s * (bz - z);
    return [newX, newZ];
}

// D = bottom-left = (originX, originZ + totalSize)
// B = top-right   = (originX + totalSize, originZ)
const dx = originX;
const dz = originZ + totalSize;

// Reflect a point across the line from D to B
function reflectAcrossDB(x, z) {
    // Line direction D -> B
    const lx = bx - dx;
    const lz = bz - dz;
    const len2 = lx * lx + lz * lz;
    // Vector from D to point
    const px = x - dx;
    const pz = z - dz;
    // Project onto line
    const dot = (px * lx + pz * lz) / len2;
    // Reflection
    const rx = 2 * (dx + dot * lx) - x;
    const rz = 2 * (dz + dot * lz) - z;
    return [rx, rz];
}

// Returns array of { vertices: [[x,z], [x,z], [x,z], [x,z]], isWhite: bool }
export function getQuads() {
    const quads = [];
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const x0 = originX + col * squareSize;
            const x1 = originX + (col + 1) * squareSize;
            const z0 = originZ + row * squareSize;
            const z1 = originZ + (row + 1) * squareSize;

            const [tx0z0, tz0z0] = transformVertex(x0, z0);
            const [tx1z0, tz1z0] = transformVertex(x1, z0);
            const [tx1z1, tz1z1] = transformVertex(x1, z1);
            const [tx0z1, tz0z1] = transformVertex(x0, z1);

            // Original quad
            quads.push({
                vertices: [
                    [tx0z0, tz0z0],
                    [tx1z0, tz1z0],
                    [tx1z1, tz1z1],
                    [tx0z1, tz0z1],
                ],
                isWhite: (row + col) % 2 === 0,
            });

            // Mirrored quad across D-B diagonal
            const [mx0, mz0] = reflectAcrossDB(tx0z0, tz0z0);
            const [mx1, mz1] = reflectAcrossDB(tx1z0, tz1z0);
            const [mx2, mz2] = reflectAcrossDB(tx1z1, tz1z1);
            const [mx3, mz3] = reflectAcrossDB(tx0z1, tz0z1);

            quads.push({
                vertices: [
                    [mx3, mz3],
                    [mx2, mz2],
                    [mx1, mz1],
                    [mx0, mz0],
                ],
                isWhite: (row + col) % 2 !== 0,
            });
        }
    }
    return quads;
}

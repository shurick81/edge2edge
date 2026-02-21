import * as THREE from 'three';
import { getQuads } from './geometry.js';

export { getQuads };

export function buildScene() {
    const group = new THREE.Group();

    const whiteMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    const blackMaterial = new THREE.MeshBasicMaterial({ color: 0x111111, side: THREE.DoubleSide });

    const quads = getQuads();

    for (const quad of quads) {
        const [[x0, z0], [x1, z1], [x2, z2], [x3, z3]] = quad.vertices;
        const y = 0;

        const vertices = new Float32Array([
            x0, y, z0,
            x1, y, z1,
            x2, y, z2,
            x0, y, z0,
            x2, y, z2,
            x3, y, z3,
        ]);

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

        const square = new THREE.Mesh(geometry, quad.isWhite ? whiteMaterial : blackMaterial);
        group.add(square);
    }

    function update() {
        group.rotation.y += 0.001;
    }

    return { root: group, update };
}

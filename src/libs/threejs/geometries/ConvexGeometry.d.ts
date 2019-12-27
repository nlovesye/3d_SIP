import {
	BufferGeometry,
	Geometry,
	Vector3
} from '@/libs/threejs/Three.js';

export class ConvexGeometry extends Geometry {

	constructor( points: Vector3[] );

}

export class ConvexBufferGeometry extends BufferGeometry {

	constructor( points: Vector3[] );

}

/**
 * グリッド描画用のクラスです。
 */
class GridSegments extends THREE.LineSegments {

	constructor( minX, minY, maxX, maxY, R = 0.5, N = 10, gridColor = 0x888888 ) {

		const color = new THREE.Color( gridColor );

		const vertices = [], colors = [];

		// 軸の最大値と最小値からグリッドの範囲を算出します。
		const gridMinX = -R * maxX + (1 + R) * minX;
		const gridMaxX = (1 + R) * maxX - R * minX; 
		const gridMinY = -R * maxY + (1 + R) * minY;
		const gridMaxY = (1 + R) * maxY - R * minY;

		// グリッドの本数を算出します。
		const gridsCount = parseInt(N + 2 * R * N);
		// グリッドの幅を算出します。
		const stepX = (gridMaxX - gridMinX) / gridsCount;
		const stepY = (gridMaxY - gridMinY) / gridsCount;

		// Y 軸方向のグリッド線を描画します。
		for (let i = 0, j = 0; i <= gridsCount; i++) {
			let x = gridMinX + stepX * i;
			vertices.push(x, gridMinY, 0, x, gridMaxY, 0);
			color.toArray(colors, j); j += 3;
			color.toArray(colors, j); j += 3;
		}
		// X 軸方向のグリッド線を描画します。
		for (let i = 0, j = colors.length; i <= gridsCount; i++) {
			let y = gridMinY + stepY * i;
			vertices.push(gridMinX, y, 0, gridMaxX, y, 0);
			color.toArray(colors, j); j += 3;
			color.toArray(colors, j); j += 3;
		}

		const geometry = new THREE.BufferGeometry();
		geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
		geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );

		const material = new THREE.LineBasicMaterial( { vertexColors: true, toneMapped: false } );

		super( geometry, material );

		this.type = 'GridSegments';
	}

	dispose() {

		this.geometry.dispose();
		this.material.dispose();

	}

}

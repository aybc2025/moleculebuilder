/**
 * @author q
 * @author zz85
 *
 * OrbitControls
 * - rotates object around target
 * - zooms in/out
 * - pans
 *
 * This set of controls performs orbiting, dollying (zooming), and panning.
 * Unlike TrackballControls, it maintains the "up" direction object.up (+Y by default).
 *
 *    Orbit - left mouse / touch: one-finger move
 *    Zoom/dolly - middle mouse, or mousewheel / touch: two-finger spread or squish
 *    Pan - right mouse, or arrow keys / touch: two-finger move
 *
 */

THREE.OrbitControls = function ( object, domElement ) {

	// The domElement must be an instance of HTMLElement (e.g. document, window)

	if ( domElement === undefined ) {

		console.warn( 'THREE.OrbitControls: The second parameter "domElement" is now mandatory.' );
		domElement = document;

	}

	this.object = object;
	this.domElement = domElement;

	// Set to true to enable mouse or touch control over the camera
	this.enabled = true;

	//
	// public parameters
	//

	this.target = new THREE.Vector3();

	this.minDistance = 0;
	this.maxDistance = Infinity;

	this.minZoom = 0;
	this.maxZoom = Infinity;

	this.minPolarAngle = 0; // radians
	this.maxPolarAngle = Math.PI; // radians

	this.minAzimuthAngle = - Infinity; // radians
	this.maxAzimuthAngle = Infinity; // radians

	this.enableDamping = false;
	this.dampingFactor = 0.05;

	this.enableZoom = true;
	this.zoomSpeed = 1.0;

	this.enableRotate = true;
	this.rotateSpeed = 1.0;

	this.enablePan = true;
	this.panSpeed = 1.0;
	this.screenSpacePanning = true; // if false, pan orthogonal to world-space direction camera.up
	this.keyPanSpeed = 7.0;	// pixels moved per arrow key push

	this.autoRotate = false;
	this.autoRotateSpeed = 2.0; // 30 seconds per orbit when fps is 60

	this.enableKeys = true;

	// Keyboard keys that navigate the view
	this.keys = { LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40 };

	// Mouse buttons that control the camera
	this.mouseButtons = {
		LEFT: THREE.MOUSE.ROTATE,
		MIDDLE: THREE.MOUSE.DOLLY,
		RIGHT: THREE.MOUSE.PAN
	};

	// Touch fingers
	this.touches = {
		ONE: THREE.TOUCH.ROTATE,
		TWO: THREE.TOUCH.DOLLY_PAN
	};

	//
	// internals
	//

	const scope = this;

	const STATE = {
		NONE: - 1,
		ROTATE: 0,
		DOLLY: 1,
		PAN: 2,
		TOUCH_ROTATE: 3,
		TOUCH_PAN: 4,
		TOUCH_DOLLY_PAN: 5
	};

	let state = STATE.NONE;

	const EPS = 0.000001;

	// current position in spherical coordinates
	const spherical = new THREE.Spherical();
	const sphericalDelta = new THREE.Spherical();

	let scale = 1;
	const panOffset = new THREE.Vector3();
	let zoomChanged = false;

	const rotateStart = new THREE.Vector2();
	const rotateEnd = new THREE.Vector2();
	const rotateDelta = new THREE.Vector2();

	const panStart = new THREE.Vector2();
	const panEnd = new THREE.Vector2();
	const panDelta = new THREE.Vector2();

	const dollyStart = new THREE.Vector2();
	const dollyEnd = new THREE.Vector2();
	const dollyDelta = new THREE.Vector2();

	function getAutoRotationAngle() {

		return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;

	}

	function getZoomScale() {

		return Math.pow( 0.95, scope.zoomSpeed );

	}

	function rotateLeft( angle ) {

		sphericalDelta.theta -= angle;

	}

	function rotateUp( angle ) {

		sphericalDelta.phi -= angle;

	}

	const panLeft = ( function () {

		const v = new THREE.Vector3();

		return function panLeft( distance, objectMatrix ) {

			v.setFromMatrixColumn( objectMatrix, 0 ); // get X column of objectMatrix
			v.multiplyScalar( - distance );

			panOffset.add( v );

		};

	}() );

	const panUp = ( function () {

		const v = new THREE.Vector3();

		return function panUp( distance, objectMatrix ) {

			if ( scope.screenSpacePanning === true ) {

				v.setFromMatrixColumn( objectMatrix, 1 );

			} else {

				v.setFromMatrixColumn( objectMatrix, 0 );
				v.crossVectors( scope.object.up, v );

			}

			v.multiplyScalar( distance );

			panOffset.add( v );

		};

	}() );

	// deltaX and deltaY are in pixels; right and down are positive
	const pan = function ( deltaX, deltaY ) {

		const element = scope.domElement;

		if ( scope.object.isPerspectiveCamera ) {

			// perspective
			const position = scope.object.position;
			const offset = new THREE.Vector3();

			offset.copy( position ).sub( scope.target );
			let targetDistance =
				offset.length() * Math.tan( ( scope.object.fov / 2 ) * Math.PI / 180.0 );

			targetDistance *= 2;

			panLeft( 2 * deltaX * targetDistance / element.clientHeight, scope.object.matrix );
			panUp( 2 * deltaY * targetDistance / element.clientHeight, scope.object.matrix );

		} else if ( scope.object.isOrthographicCamera ) {

			// orthographic
			panLeft( deltaX * ( scope.object.right - scope.object.left ) / scope.object.zoom / element.clientWidth, scope.object.matrix );
			panUp( deltaY * ( scope.object.top - scope.object.bottom ) / scope.object.zoom / element.clientHeight, scope.object.matrix );

		} else {

			console.warn( 'THREE.OrbitControls: Unsupported camera type' );
			scope.enablePan = false;

		}

	};

	function dollyOut( dollyScale ) {

		if ( scope.object.isPerspectiveCamera ) {

			scale /= dollyScale;

		} else if ( scope.object.isOrthographicCamera ) {

			scope.object.zoom = Math.max( scope.minZoom, Math.min( scope.maxZoom, scope.object.zoom * dollyScale ) );
			scope.object.updateProjectionMatrix();
			zoomChanged = true;

		} else {

			console.warn( 'THREE.OrbitControls: Unsupported camera type' );
			scope.enableZoom = false;

		}

	}

	function dollyIn( dollyScale ) {

		if ( scope.object.isPerspectiveCamera ) {

			scale *= dollyScale;

		} else if ( scope.object.isOrthographicCamera ) {

			scope.object.zoom = Math.max( scope.minZoom, Math.min( scope.maxZoom, scope.object.zoom / dollyScale ) );
			scope.object.updateProjectionMatrix();
			zoomChanged = true;

		} else {

			console.warn( 'THREE.OrbitControls: Unsupported camera type' );
			scope.enableZoom = false;

		}

	}

	//
	// event callbacks - update the position when the mouse is moved
	//

	function handleMouseDownRotate( event ) {

		rotateStart.set( event.clientX, event.clientY );

	}

	function handleMouseDownDolly( event ) {

		dollyStart.set( event.clientX, event.clientY );

	}

	function handleMouseDownPan( event ) {

		panStart.set( event.clientX, event.clientY );

	}

	function handleMouseMoveRotate( event ) {

		rotateEnd.set( event.clientX, event.clientY );
		rotateDelta.subVectors( rotateEnd, rotateStart ).multiplyScalar( scope.rotateSpeed );

		const element = scope.domElement;

		rotateLeft( 2 * Math.PI * rotateDelta.x / element.clientHeight );
		rotateUp( 2 * Math.PI * rotateDelta.y / element.clientHeight );

		rotateStart.copy( rotateEnd );

		scope.update();

	}

	function handleMouseMoveDolly( event ) {

		dollyEnd.set( event.clientX, event.clientY );

		dollyDelta.subVectors( dollyEnd, dollyStart );

		if ( dollyDelta.y > 0 ) {

			dollyOut( getZoomScale() );

		} else if ( dollyDelta.y < 0 ) {

			dollyIn( getZoomScale() );

		}

		dollyStart.copy( dollyEnd );

		scope.update();

	}

	function handleMouseMovePan( event ) {

		panEnd.set( event.clientX, event.clientY );

		panDelta.subVectors( panEnd, panStart ).multiplyScalar( scope.panSpeed );

		pan( panDelta.x, panDelta.y );

		panStart.copy( panEnd );

		scope.update();

	}

	function handleMouseWheel( event ) {

		if ( event.deltaY < 0 ) {

			dollyIn( getZoomScale() );

		} else if ( event.deltaY > 0 ) {

			dollyOut( getZoomScale() );

		}

		scope.update();

	}

	function handleKeyDown( event ) {

		let needsUpdate = false;

		switch ( event.keyCode ) {

			case scope.keys.UP:
				pan( 0, scope.keyPanSpeed );
				needsUpdate = true;
				break;

			case scope.keys.BOTTOM:
				pan( 0, - scope.keyPanSpeed );
				needsUpdate = true;
				break;

			case scope.keys.LEFT:
				pan( scope.keyPanSpeed, 0 );
				needsUpdate = true;
				break;

			case scope.keys.RIGHT:
				pan( - scope.keyPanSpeed, 0 );
				needsUpdate = true;
				break;

		}

		if ( needsUpdate ) {

			event.preventDefault();
			scope.update();

		}

	}

	function handleTouchStartRotate( event ) {

		if ( event.touches.length == 1 ) {

			rotateStart.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );

		}

	}

	function handleTouchStartPan( event ) {

		if ( event.touches.length == 1 ) {

			panStart.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );

		}

	}

	function handleTouchStartDollyPan( event ) {

		if ( event.touches.length == 2 ) {

			dollyStart.set(
				0.5 * ( event.touches[ 0 ].pageX + event.touches[ 1 ].pageX ),
				0.5 * ( event.touches[ 0 ].pageY + event.touches[ 1 ].pageY )
			);

		}

	}

	function handleTouchMoveRotate( event ) {

		if ( event.touches.length == 1 ) {

			rotateEnd.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
			rotateDelta.subVectors( rotateEnd, rotateStart ).multiplyScalar( scope.rotateSpeed );

			const element = scope.domElement;

			rotateLeft( 2 * Math.PI * rotateDelta.x / element.clientHeight );
			rotateUp( 2 * Math.PI * rotateDelta.y / element.clientHeight );

			rotateStart.copy( rotateEnd );

			scope.update();

		}

	}

	function handleTouchMovePan( event ) {

		if ( event.touches.length == 1 ) {

			panEnd.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );

			panDelta.subVectors( panEnd, panStart ).multiplyScalar( scope.panSpeed );

			pan( panDelta.x, panDelta.y );

			panStart.copy( panEnd );

			scope.update();

		}

	}

	function handleTouchMoveDollyPan( event ) {

		if ( event.touches.length == 2 ) {

			dollyEnd.set(
				0.5 * ( event.touches[ 0 ].pageX + event.touches[ 1 ].pageX ),
				0.5 * ( event.touches[ 0 ].pageY + event.touches[ 1 ].pageY )
			);

			dollyDelta.subVectors( dollyEnd, dollyStart );

			if ( dollyDelta.y > 0 ) {

				dollyOut( getZoomScale() );

			} else if ( dollyDelta.y < 0 ) {

				dollyIn( getZoomScale() );

			}

			dollyStart.copy( dollyEnd );

			scope.update();

		}

	}

	function handleTouchEnd( /*event*/ ) {

		// no-op

	}

	function onMouseDown( event ) {

		if ( scope.enabled === false ) return;

		event.preventDefault();

		switch ( event.button ) {

			case scope.mouseButtons.LEFT:

				if ( scope.enableRotate === false ) return;

				handleMouseDownRotate( event );

				state = STATE.ROTATE;

				break;

			case scope.mouseButtons.MIDDLE:

				if ( scope.enableZoom === false ) return;

				handleMouseDownDolly( event );

				state = STATE.DOLLY;

				break;

			case scope.mouseButtons.RIGHT:

				if ( scope.enablePan === false ) return;

				handleMouseDownPan( event );

				state = STATE.PAN;

				break;

		}

		if ( state !== STATE.NONE ) {

			document.addEventListener( 'mousemove', onMouseMove, false );
			document.addEventListener( 'mouseup', onMouseUp, false );

		}

	}

	function onMouseMove( event ) {

		if ( scope.enabled === false ) return;

		event.preventDefault();

		switch ( state ) {

			case STATE.ROTATE:

				if ( scope.enableRotate === false ) return;

				handleMouseMoveRotate( event );

				break;

			case STATE.DOLLY:

				if ( scope.enableZoom === false ) return;

				handleMouseMoveDolly( event );

				break;

			case STATE.PAN:

				if ( scope.enablePan === false ) return;

				handleMouseMovePan( event );

				break;

		}

	}

	function onMouseUp( /*event*/ ) {

		if ( scope.enabled === false ) return;

		document.removeEventListener( 'mousemove', onMouseMove, false );
		document.removeEventListener( 'mouseup', onMouseUp, false );

		state = STATE.NONE;

	}

	function onMouseWheel( event ) {

		if ( scope.enabled === false || scope.enableZoom === false || state !== STATE.NONE ) return;

		event.preventDefault();
		event.stopPropagation();

		handleMouseWheel( event );

	}

	function onKeyDown( event ) {

		if ( scope.enabled === false || scope.enableKeys === false || scope.enablePan === false ) return;

		handleKeyDown( event );

	}

	function onTouchStart( event ) {

		if ( scope.enabled === false ) return;

		switch ( event.touches.length ) {

			case 1:

				switch ( scope.touches.ONE ) {

					case THREE.TOUCH.ROTATE:

						if ( scope.enableRotate === false ) return;

						handleTouchStartRotate( event );

						state = STATE.TOUCH_ROTATE;

						break;

					case THREE.TOUCH.PAN:

						if ( scope.enablePan === false ) return;

						handleTouchStartPan( event );

						state = STATE.TOUCH_PAN;

						break;

					default:

						state = STATE.NONE;

				}

				break;

			case 2:

				switch ( scope.touches.TWO ) {

					case THREE.TOUCH.DOLLY_PAN:

						if ( scope.enableZoom === false && scope.enablePan === false ) return;

						handleTouchStartDollyPan( event );

						state = STATE.TOUCH_DOLLY_PAN;

						break;

					default:

						state = STATE.NONE;

				}

				break;

			default:

				state = STATE.NONE;

		}

		if ( state !== STATE.NONE ) {

			document.addEventListener( 'touchmove', onTouchMove, false );
			document.addEventListener( 'touchend', onTouchEnd, false );

		}

	}

	function onTouchMove( event ) {

		if ( scope.enabled === false ) return;

		event.preventDefault();
		event.stopPropagation();

		switch ( state ) {

			case STATE.TOUCH_ROTATE:

				if ( scope.enableRotate === false ) return;

				handleTouchMoveRotate( event );

				break;

			case STATE.TOUCH_PAN:

				if ( scope.enablePan === false ) return;

				handleTouchMovePan( event );

				break;

			case STATE.TOUCH_DOLLY_PAN:

				if ( scope.enableZoom === false && scope.enablePan === false ) return;

				handleTouchMoveDollyPan( event );

				break;

			default:

				state = STATE.NONE;

		}

	}

	function onTouchEnd( event ) {

		document.removeEventListener( 'touchmove', onTouchMove, false );
		document.removeEventListener( 'touchend', onTouchEnd, false );

		state = STATE.NONE;

	}

	function onContextMenu( event ) {

		if ( scope.enabled === false ) return;

		event.preventDefault();

	}

	// suppress context menu

	domElement.addEventListener( 'contextmenu', onContextMenu, false );

	// Bind mouse events

	domElement.addEventListener( 'mousedown', onMouseDown, false );
	domElement.addEventListener( 'wheel', onMouseWheel, false );

	// Bind keyboard events

	document.addEventListener( 'keydown', onKeyDown, false );

	// Bind touch events

	domElement.addEventListener( 'touchstart', onTouchStart, false );

	//
	// public API
	//

	this.getPolarAngle = function () {

		return spherical.phi;

	};

	this.getAzimuthalAngle = function () {

		return spherical.theta;

	};

	this.saveState = function () {

		scope.target0 = scope.target.clone();
		scope.position0 = scope.object.position.clone();
		scope.zoom0 = scope.object.zoom;

	};

	this.reset = function () {

		scope.target.copy( scope.target0 );
		scope.object.position.copy( scope.position0 );
		scope.object.zoom = scope.zoom0;

		scope.object.updateProjectionMatrix();
		scope.dispatchEvent( changeEvent );

		scope.update();

		state = STATE.NONE;

	};

	this.update = ( function () {

		const offset = new THREE.Vector3();

		const quat = new THREE.Quaternion().setFromUnitVectors( object.up, new THREE.Vector3( 0, 1, 0 ) );
		const quatInverse = quat.clone().invert();

		const lastPosition = new THREE.Vector3();
		const lastQuaternion = new THREE.Quaternion();

		return function update() {

			const position = scope.object.position;

			offset.copy( position ).sub( scope.target );

			offset.applyQuaternion( quat );

			spherical.setFromVector3( offset );

			if ( scope.autoRotate && state === STATE.NONE ) {

				rotateLeft( getAutoRotationAngle() );

			}

			spherical.theta += sphericalDelta.theta;
			spherical.phi += sphericalDelta.phi;

			spherical.theta = Math.max( scope.minAzimuthAngle, Math.min( scope.maxAzimuthAngle, spherical.theta ) );
			spherical.phi = Math.max( scope.minPolarAngle, Math.min( scope.maxPolarAngle, spherical.phi ) );

			spherical.makeSafe();

			spherical.radius *= scale;

			spherical.radius = Math.max( scope.minDistance, Math.min( scope.maxDistance, spherical.radius ) );

			scope.target.add( panOffset );

			offset.setFromSpherical( spherical );
			offset.applyQuaternion( quatInverse );

			position.copy( scope.target ).add( offset );

			scope.object.lookAt( scope.target );

			if ( scope.enableDamping === true ) {

				sphericalDelta.theta *= 1 - scope.dampingFactor;
				sphericalDelta.phi *= 1 - scope.dampingFactor;

				panOffset.multiplyScalar( 1 - scope.dampingFactor );

			} else {

				sphericalDelta.set( 0, 0, 0 );

				panOffset.set( 0, 0, 0 );

			}

			scale = 1;

			if ( zoomChanged ||
				lastPosition.distanceToSquared( scope.object.position ) > EPS ||
				8 * ( 1 - lastQuaternion.dot( scope.object.quaternion ) ) > EPS ) {

				scope.dispatchEvent( changeEvent );

				lastPosition.copy( scope.object.position );
				lastQuaternion.copy( scope.object.quaternion );
				zoomChanged = false;

				return true;

			}

			return false;

		};

	}() );

	this.dispose = function () {

		domElement.removeEventListener( 'contextmenu', onContextMenu, false );

		domElement.removeEventListener( 'mousedown', onMouseDown, false );
		domElement.removeEventListener( 'wheel', onMouseWheel, false );

		document.removeEventListener( 'keydown', onKeyDown, false );

		domElement.removeEventListener( 'touchstart', onTouchStart, false );

		document.removeEventListener( 'touchmove', onTouchMove, false );
		document.removeEventListener( 'touchend', onTouchEnd, false );

	};

	const changeEvent = { type: 'change' };

};

THREE.OrbitControls.prototype = Object.create( THREE.EventDispatcher.prototype );
THREE.OrbitControls.prototype.constructor = THREE.OrbitControls;

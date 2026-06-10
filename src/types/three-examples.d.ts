declare module 'three/examples/jsm/controls/OrbitControls.js' {
  import { Camera, EventDispatcher, MOUSE, Object3D, TOUCH, Vector3 } from 'three';
  export class OrbitControls extends EventDispatcher {
    constructor(object: Camera, domElement?: HTMLElement);
    object: Camera;
    domElement: HTMLElement | Document;
    enabled: boolean;
    target: Vector3;
    minDistance: number;
    maxDistance: number;
    minZoom: number;
    maxZoom: number;
    minPolarAngle: number;
    maxPolarAngle: number;
    minAzimuthAngle: number;
    maxAzimuthAngle: number;
    enableDamping: boolean;
    dampingFactor: number;
    enableZoom: boolean;
    zoomSpeed: number;
    enableRotate: boolean;
    rotateSpeed: number;
    enablePan: boolean;
    panSpeed: number;
    screenSpacePanning: boolean;
    keyPanSpeed: number;
    autoRotate: boolean;
    autoRotateSpeed: number;
    update(): boolean;
    dispose(): void;
  }
}

declare module 'three/examples/jsm/exporters/GLTFExporter.js' {
  import { Object3D } from 'three';
  export class GLTFExporter {
    parse(
      input: Object3D | Object3D[],
      onDone: (result: ArrayBuffer | object) => void,
      onError: (error: Error) => void,
      options?: object
    ): void;
  }
}

declare module 'three/examples/jsm/exporters/OBJExporter.js' {
  import { Object3D } from 'three';
  export class OBJExporter {
    parse(input: Object3D): string;
  }
}

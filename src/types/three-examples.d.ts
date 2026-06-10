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

declare module 'three/examples/jsm/postprocessing/EffectComposer.js' {
  import { WebGLRenderer, Scene, Camera, Vector2 } from 'three';
  import { Pass } from 'three/examples/jsm/postprocessing/Pass.js';
  export class EffectComposer {
    constructor(renderer: WebGLRenderer, renderTarget?: any);
    addPass(pass: Pass): void;
    render(): void;
    setSize(width: number, height: number): void;
    dispose(): void;
  }
}

declare module 'three/examples/jsm/postprocessing/RenderPass.js' {
  import { Scene, Camera } from 'three';
  import { Pass } from 'three/examples/jsm/postprocessing/Pass.js';
  export class RenderPass extends Pass {
    constructor(scene: Scene, camera: Camera);
  }
}

declare module 'three/examples/jsm/postprocessing/UnrealBloomPass.js' {
  import { Vector2 } from 'three';
  import { Pass } from 'three/examples/jsm/postprocessing/Pass.js';
  export class UnrealBloomPass extends Pass {
    constructor(resolution: Vector2, strength: number, radius: number, threshold: number);
    strength: number;
    radius: number;
    threshold: number;
  }
}

declare module 'three/examples/jsm/postprocessing/Pass.js' {
  export class Pass {
    enabled: boolean;
    needsSwap: boolean;
    renderToScreen: boolean;
    render(renderer: any, writeBuffer: any, readBuffer: any, maskActive: boolean): void;
    setSize(width: number, height: number): void;
  }
}

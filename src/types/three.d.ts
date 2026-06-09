declare module 'three' {
  const THREE: any;
  export = THREE;
}
declare module 'three/addons/exporters/GLTFExporter.js' {
  export class GLTFExporter {
    parseAsync(input: any, options?: any): Promise<any>;
  }
}
declare module 'three/addons/exporters/OBJExporter.js' {
  export class OBJExporter {
    parse(input: any): string;
  }
}
declare module 'imagetracerjs' {
  interface ImageTracerOptions {
    scale?: number;
    ltres?: number;
    qtres?: number;
    pathomit?: number;
    colorsampling?: number;
    numberofcolors?: number;
  }
  export function imagedataToSVG(imageData: ImageData, options?: ImageTracerOptions): string;
  const ImageTracer: {
    imagedataToSVG: (imageData: ImageData, options?: ImageTracerOptions) => string;
  };
  export default ImageTracer;
}

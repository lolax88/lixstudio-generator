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

declare module 'imagetracerjs' {
  interface ImageTracerOptions {
    pathomit?: number;
    qtres?: number;
    colorsampling?: number;
    numberofcolors?: number;
    mincolorratio?: number;
    colorquantcycles?: number;
    blurradius?: number;
    blurdelta?: number;
    ltres?: number;
    strokewidth?: number;
    linefilter?: boolean;
    scale?: number;
    roundcoords?: number;
    desc?: boolean;
    viewbox?: boolean;
  }

  class ImageTracer {
    static imageToSVG(
      url: string,
      callback: (svgString: string) => void,
      options?: ImageTracerOptions
    ): void;
  }

  export default ImageTracer;
}

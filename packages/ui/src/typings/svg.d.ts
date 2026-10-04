declare module "*.svg" {
  interface Svg {
    blurHeight: number;
    blurWidth: number;
    height: number;
    src: string;
    width: number;
  }

  const content: Svg;
  export default content;
}

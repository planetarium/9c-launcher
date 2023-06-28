export = bitgener;
/**
 * @func bitgener
 *
 * Encode data into the specificied barcode type.
 * @param  {String} data             data to encode
 * @param  {String} type             the supported symbology in which data will be encoded
 * @param  {String} output           file path with .svg extension, buffer, stream,
 *                                   string representing svg element
 * @param  {String} encoding         encoding for stream, buffer and file outputs
 * @param  {Boolean} crc             cyclic redundancy check
 * @param  {Boolean} rectangular     rectangular option for datamatrix
 * @param  {Number} padding          the space in pixels around one side of the
 *                                   barcode that will be applied for its 4 sides
 * @param  {Number} width            the width in pixels to fix for the generated image
 * @param  {Number} height           the height in pixels to fix for the generated image
 * @param  {Number} barWidth         the bar width in pixels for 1D barcodes
 * @param  {Number} barHeight        he bar height in pixels for 1D barcodes
 * @param  {Boolean} original1DSize  option to keep the original 1D barcode size
 * @param  {Boolean} original2DSize  option to keep the original 2D barcode size based on width
 * @param  {Boolean} addQuietZone    option to add a quiet zone at the end of 1D barcodes
 * @param  {String} color            the bars color
 * @param  {Number} opacity          the bars opacity
 * @param  {String} bgColor          the background color
 * @param  {Number} bgOpacity        the background opacity
 * @param  {Object} hri              human readable interpretation
 * @param  {Boolean} hri.show        whether to show hri
 * @param  {Number} hri.fontFamily   a generic font name based on cssfontstack.com
 * @param  {Number} hri.fontSize     the font size in pixels
 * @param  {Number} hri.marginTop    the margin size in pixels between the barcode bottom and
 *                                   the hri text
 */
declare function bitgener({
  data,
  type,
  output,
  encoding,
  crc,
  rectangular,
  padding,
  width: w,
  height: h,
  barWidth,
  barHeight,
  original1DSize,
  original2DSize,
  addQuietZone,
  color,
  opacity,
  bgColor,
  bgOpacity,
  hri,
}: any): Promise<{
  width: any;
  height: any;
  density: number;
  type: any;
  data: any;
  hri: string;
  output: any;
  svg: string;
  encoding: any;
}>;

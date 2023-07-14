/*
 * Copyright (c) 2023-2023 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import StringUtil from '../utils/StringUtil';
const ISO_A3_WIDTH: number = 11690;
const ISO_A3_HEIGHT: number = 16540;
const ISO_A4_WIDTH: number = 8268;
const ISO_A4_HEIGHT: number = 11692;
const ISO_A5_WIDTH: number = 5830;
const ISO_A5_HEIGHT: number = 8270;
const ISO_C5_WIDTH: number = 6380;
const ISO_C5_HEIGHT: number = 9020;
const ISO_DL_WIDTH: number = 4330;
const ISO_DL_HEIGHT: number = 8660;
const LEGAL_WIDTH: number = 8500;
const LEGAL_HEIGHT: number = 14000;
const LETTER_WIDTH: number = 4000;
const LETTER_HEIGHT: number = 6000;
const JIS_B4_WIDTH: number = 10119;
const JIS_B4_HEIGHT: number = 14331;
const JIS_B5_WIDTH: number = 7165;
const JIS_B5_HEIGHT: number = 10118;
const PHOTO_5R_WIDTH: number = 5000;
const PHOTO_5R_HEIGHT: number = 7000;
const PHOTO_4R_WIDTH: number = 4000;
const PHOTO_4R_HEIGHT: number = 6000;
const NA_GOVT_LETTER_8IN_WIDTH: number = 8000;
const NA_GOVT_LETTER_8IN_HEIGHT: number = 10000;
const NA_LEDGER_11IN_WIDTH: number = 11000;
const NA_LEDGER_11IN_HEIGHT: number = 17000;
const JPN_HAGAKI_WIDTH: number = 3940;
const JPN_HAGAKI_HEIGHT: number = 5830;
const OM_SDC_PHOTO_WIDTH: number = 3504;
const OM_SDC_PHOTO_HEIGHT: number = 4685;
const OM_CARD_WIDTH: number = 2126;
const OM_CARD_HEIGHT: number = 3386;
const OE_PHOTO_L_WIDTH: number = 3500;
const OE_PHOTO_L_HEIGHT: number = 5000;
const INT_DL_ENVELOPE_WIDTH: number = 4330;
const INT_DL_ENVELOPE_HEIGHT: number = 8660;
const B_TABLOID_L_WIDTH: number = 11000;
const B_TABLOID_L_HEIGHT: number = 17000;

const ISO_A3_WIDTH_MM: number = 297;
const ISO_A3_HEIGHT_MM: number = 420;
const ISO_A4_WIDTH_MM: number = 210;
const ISO_A4_HEIGHT_MM: number = 297;
const ISO_A5_WIDTH_MM: number = 148;
const ISO_A5_HEIGHT_MM: number = 210;
const ISO_C5_WIDTH_MM: number = 162;
const ISO_C5_HEIGHT_MM: number = 229;
const ISO_DL_WIDTH_MM: number = 110;
const ISO_DL_HEIGHT_MM: number = 220;
const LEGAL_WIDTH_MM: number = 216;
const LEGAL_HEIGHT_MM: number = 356;
const LETTER_WIDTH_MM: number = 216;
const LETTER_HEIGHT_MM: number = 279;
const JIS_B4_WIDTH_MM: number = 257;
const JIS_B4_HEIGHT_MM: number = 364;
const JIS_B5_WIDTH_MM: number = 182;
const JIS_B5_HEIGHT_MM: number = 257;
const PHOTO_5R_WIDTH_MM: number = 127;
const PHOTO_5R_HEIGHT_MM: number = 178;
const PHOTO_4R_WIDTH_MM: number = 102;
const PHOTO_4R_HEIGHT_MM: number = 152;
const NA_GOVT_LETTER_8IN_WIDTH_MM: number = 203;
const NA_GOVT_LETTER_8IN_HEIGHT_MM: number = 267;
const NA_LEDGER_11IN_WIDTH_MM: number = 279;
const NA_LEDGER_11IN_HEIGHT_MM: number = 432;
const JPN_HAGAKI_WIDTH_MM: number = 100;
const JPN_HAGAKI_HEIGHT_MM: number = 148;
const OM_SDC_PHOTO_WIDTH_MM: number = 89;
const OM_SDC_PHOTO_HEIGHT_MM: number = 119;
const OM_CARD_WIDTH_MM: number = 54;
const OM_CARD_HEIGHT_MM: number = 86;
const OE_PHOTO_L_WIDTH_MM: number = 89;
const OE_PHOTO_L_HEIGHT_MM: number = 127;
const INT_DL_ENVELOPE_WIDTH_MM: number = 110;
const INT_DL_ENVELOPE_HEIGHT_MM: number = 220;
const B_TABLOID_L_WIDTH_MM: number = 279;
const B_TABLOID_L_HEIGHT_MM: number = 432;

enum MediaSizeCode {
  US_LETTER = 2,
  US_LEGAL = 3,
  B_TABLOID = 6,
  US_GOVERNMENT_LETTER = 7,
  LEDGER = 11,
  ISO_A5 = 25,
  ISO_A4 = 26,
  ISO_A3 = 27,
  JIS_B5 = 45,
  JIS_B4 = 46,
  JPN_HAGAKI_PC = 71,
  INDEX_CARD_4X6 = 74,
  INT_DL_ENVELOPE = 90,
  INDEX_CARD_5X7 = 122,
  ISO_C5 = 183,
  ISO_DL = 184,
  PHOTO_89X119 = 302,
  CARD_54X86 = 303,
  OE_PHOTO_L = 304,
}

export class MediaSize {
  private static readonly PREVIEW_POINTS_IN_INCH = 72;
  private static readonly MILS_PER_INCH:number = 1000;
  public static readonly THREE_HUNDRED_DPI: number = 300;

  public static readonly ISO_A3: MediaSize = new MediaSize(MediaSizeCode.ISO_A3.toString(),
    'iso_a3_297x420mm', 'A3', ISO_A3_WIDTH, ISO_A3_HEIGHT, ISO_A3_WIDTH_MM, ISO_A3_HEIGHT_MM);
  public static readonly ISO_A4: MediaSize = new MediaSize(MediaSizeCode.ISO_A4.toString(),
    'iso_a4_210x297mm', 'A4', ISO_A4_WIDTH, ISO_A4_HEIGHT, ISO_A4_WIDTH_MM, ISO_A4_HEIGHT_MM);
  public static readonly ISO_A5: MediaSize = new MediaSize(MediaSizeCode.ISO_A5.toString(),
    'iso_a5_148x210mm', 'A5', ISO_A5_WIDTH, ISO_A5_HEIGHT, ISO_A5_WIDTH_MM, ISO_A5_HEIGHT_MM);
  public static readonly ISO_C5: MediaSize = new MediaSize(MediaSizeCode.ISO_C5.toString(),
    'iso_c5_162x229mm', StringUtil.getString('ISO_C5'), ISO_C5_WIDTH, ISO_C5_HEIGHT, ISO_C5_WIDTH_MM, ISO_C5_HEIGHT_MM);
  public static readonly ISO_DL: MediaSize = new MediaSize(MediaSizeCode.ISO_DL.toString(),
    'iso_dl_110x220mm', StringUtil.getString('ISO_DL'), ISO_DL_WIDTH, ISO_DL_HEIGHT, ISO_DL_WIDTH_MM, ISO_DL_HEIGHT_MM);
  public static readonly LEGAL: MediaSize = new MediaSize(MediaSizeCode.US_LEGAL.toString(),
    'na_legal_8.5x14in', 'Legal', LEGAL_WIDTH, LEGAL_HEIGHT, LEGAL_WIDTH_MM, LEGAL_HEIGHT_MM);
  public static readonly LETTER: MediaSize = new MediaSize(MediaSizeCode.US_LETTER.toString(),
    'na_letter_8.5x11in', 'Letter', LETTER_WIDTH, LETTER_HEIGHT, LETTER_WIDTH_MM, LETTER_HEIGHT_MM);
  public static readonly JIS_B5: MediaSize = new MediaSize(MediaSizeCode.JIS_B5.toString(),
    'jis_b5_182x257mm', 'B5', JIS_B5_WIDTH, JIS_B5_HEIGHT, JIS_B5_WIDTH_MM, JIS_B5_HEIGHT_MM);
  public static readonly JIS_B4: MediaSize = new MediaSize(MediaSizeCode.JIS_B4.toString(),
    'jis_b4_257x364mm', 'B4', JIS_B4_WIDTH, JIS_B4_HEIGHT, JIS_B4_WIDTH_MM, JIS_B4_HEIGHT_MM);
  public static readonly PHOTO_5x7: MediaSize = new MediaSize(MediaSizeCode.INDEX_CARD_5X7.toString(),
    'na_5x7_5x7in', StringUtil.getString('PHOTO_5x7'), PHOTO_5R_WIDTH, PHOTO_5R_HEIGHT, PHOTO_5R_WIDTH_MM, PHOTO_5R_HEIGHT_MM);
  public static readonly PHOTO_4x6: MediaSize = new MediaSize(MediaSizeCode.INDEX_CARD_4X6.toString(),
    'na_index-4x6_4x6in', StringUtil.getString('PHOTO_4x6'), PHOTO_4R_WIDTH, PHOTO_4R_HEIGHT, PHOTO_4R_WIDTH_MM, PHOTO_4R_HEIGHT_MM);
  public static readonly NA_GOVT_LETTER: MediaSize = new MediaSize(MediaSizeCode.US_GOVERNMENT_LETTER.toString(),
    'na_govt-letter_8x10in', 'NA_GOVT_LETTER', NA_GOVT_LETTER_8IN_WIDTH, NA_GOVT_LETTER_8IN_HEIGHT, NA_GOVT_LETTER_8IN_WIDTH_MM, NA_GOVT_LETTER_8IN_HEIGHT_MM);
  public static readonly NA_LEDGER_11X17: MediaSize = new MediaSize(MediaSizeCode.LEDGER.toString(),
    'na_ledger_11x17in', 'Ledger', NA_LEDGER_11IN_WIDTH, NA_LEDGER_11IN_HEIGHT, NA_LEDGER_11IN_WIDTH_MM, NA_LEDGER_11IN_HEIGHT_MM);
  public static readonly JPN_HAGAKI: MediaSize = new MediaSize(MediaSizeCode.JPN_HAGAKI_PC.toString(),
    'jpn_hagaki_100x148mm', 'JPN_HAGAKI', JPN_HAGAKI_WIDTH, JPN_HAGAKI_HEIGHT, JPN_HAGAKI_WIDTH_MM, JPN_HAGAKI_HEIGHT_MM);
  public static readonly OM_DSC_PHOTO: MediaSize = new MediaSize(MediaSizeCode.PHOTO_89X119.toString(),
    'om_dsc-photo_89x119mm', 'OM_DSC_PHOTO', OM_SDC_PHOTO_WIDTH, OM_SDC_PHOTO_HEIGHT, OM_SDC_PHOTO_WIDTH_MM, OM_SDC_PHOTO_HEIGHT_MM);
  public static readonly OM_CARD: MediaSize = new MediaSize(MediaSizeCode.CARD_54X86.toString(),
    'om_card_54x86mm', 'OM_CARD', OM_CARD_WIDTH, OM_CARD_HEIGHT, OM_CARD_WIDTH_MM, OM_CARD_HEIGHT_MM);
  public static readonly OE_PHOTO_L: MediaSize = new MediaSize(MediaSizeCode.OE_PHOTO_L.toString(),
    'oe_photo-l_3.5x5in', 'OE_PHOTO_L', OE_PHOTO_L_WIDTH, OE_PHOTO_L_HEIGHT, OE_PHOTO_L_WIDTH_MM, OE_PHOTO_L_HEIGHT_MM);
  public static readonly INT_DL_ENVELOPE: MediaSize = new MediaSize(MediaSizeCode.INT_DL_ENVELOPE.toString(),
    "INT_DL_ENVELOPE", "Envelope", INT_DL_ENVELOPE_WIDTH, INT_DL_ENVELOPE_HEIGHT, INT_DL_ENVELOPE_WIDTH_MM, INT_DL_ENVELOPE_HEIGHT_MM);
  public static readonly B_TABLOID: MediaSize = new MediaSize(MediaSizeCode.B_TABLOID.toString(),
    "B_TABLOID", "Tabloid", B_TABLOID_L_WIDTH, B_TABLOID_L_HEIGHT, B_TABLOID_L_WIDTH_MM, B_TABLOID_L_HEIGHT_MM);

  public static readonly sCodeToStringMap: Map<number, MediaSize> = new Map([
    [MediaSizeCode.US_LETTER, MediaSize.LETTER],
    [MediaSizeCode.US_LEGAL, MediaSize.LEGAL],
    [MediaSizeCode.US_GOVERNMENT_LETTER, MediaSize.NA_GOVT_LETTER],
    [MediaSizeCode.LEDGER, MediaSize.NA_LEDGER_11X17],
    [MediaSizeCode.ISO_A5, MediaSize.ISO_A5],
    [MediaSizeCode.ISO_A4, MediaSize.ISO_A4],
    [MediaSizeCode.ISO_A3, MediaSize.ISO_A3],
    [MediaSizeCode.JIS_B5, MediaSize.JIS_B5],
    [MediaSizeCode.JIS_B4, MediaSize.JIS_B4],
    [MediaSizeCode.JPN_HAGAKI_PC, MediaSize.JPN_HAGAKI],
    [MediaSizeCode.INDEX_CARD_4X6, MediaSize.PHOTO_4x6],
    [MediaSizeCode.INDEX_CARD_5X7, MediaSize.PHOTO_5x7],
    [MediaSizeCode.ISO_C5, MediaSize.ISO_C5],
    [MediaSizeCode.ISO_DL, MediaSize.ISO_DL],
    [MediaSizeCode.PHOTO_89X119, MediaSize.OM_DSC_PHOTO],
    [MediaSizeCode.CARD_54X86, MediaSize.OM_CARD],
    [MediaSizeCode.OE_PHOTO_L, MediaSize.OE_PHOTO_L],
    [MediaSizeCode.INT_DL_ENVELOPE, MediaSize.INT_DL_ENVELOPE],
    [MediaSizeCode.B_TABLOID, MediaSize.B_TABLOID]
  ]);

  private _id: string;
  private _name: string;
  private _label: string;
  private _widthMils: number;
  private _heightMils: number;
  private _realWidth: number;
  private _realHeight: number;

  constructor(id: string, name: string, label: string, widthMils: number, heightMils: number, realWidth: number, realHeight: number) {
    this._id = id;
    this._name = name;
    this._widthMils = widthMils;
    this._heightMils = heightMils;
    this._realWidth = realWidth;
    this._realHeight = realHeight;
    this._label = MediaSize.getLabel(label,realWidth,realHeight)
  }

  public static getLabel(label: string, realWidth: number, realHeight: number): string {
    return label+' '+StringUtil.getString('media_size_suffix',realWidth,realHeight)
  }

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get widthMils(): number {
    return this._widthMils;
  }

  get heightMils(): number {
    return this._heightMils;
  }

  get realWidth(): number {
    return this._realWidth;
  }

  get realHeight(): number {
    return this._realHeight;
  }

  get label(): string {
    return this._label;
  }

  set label(label: string ){
    this._label = label;
  }

  /**
   * get pixel by media size
   *
   * @param code media size code
   */
  public getPixelMediaSize(): Size {
    let width = this.convertMilesToPixel(this.widthMils);
    let height = this.convertMilesToPixel(this.heightMils);
    return new Size(width, height);
  }

  private convertMilesToPixel(mils: number): number {
    return Math.round(mils * MediaSize.PREVIEW_POINTS_IN_INCH / MediaSize.MILS_PER_INCH);
  }

  public get300PixelMediaSize() {
    let size = this.getPixelMediaSize();
    let zoom = (MediaSize.THREE_HUNDRED_DPI / MediaSize.PREVIEW_POINTS_IN_INCH).toFixed(2)
    return {
      width: Math.round(size.width * parseFloat(zoom)),
      height: Math.round(size.height * parseFloat(zoom))
    }
  }
}

export class Size {
  private readonly _width: number;
  private readonly _height: number;

  constructor(width: number, height: number) {
    this._width = width;
    this._height = height;
  }

  get width(): number {
    return this._width;
  }

  get height(): number {
    return this._height;
  }
}
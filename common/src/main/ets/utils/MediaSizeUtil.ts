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
import { PrintPageSize } from '../framework/Print';

import { MediaType } from '../model/Constants';
import { MediaSize } from '../model/MediaSize';
import { StringUtil } from './StringUtil';

export class MediaSizeUtil {
  public static readonly defaultSizeCode = 26;

  public static getMediaSizeArrayByCodes(codes: number[]): PrintPageSize[] {
    return codes.map((code) => {
      if (MediaSize.sCodeToStringMap.has(code)) {
        let mediaSize = MediaSize.sCodeToStringMap.get(code);
        let pageSize = new PrintPageSize(code.toString(),mediaSize.name,mediaSize.heightMils,mediaSize.widthMils);
        return pageSize;
      }
      return null;
    });
  }

  public static getDefaultMediaSizeByMediaType(mediaType: number): Array<MediaSize> {
    let list: Array<MediaSize> = new Array<MediaSize>();
    if (mediaType === MediaType.NORMAL) {
      return this.getDocSizeList();
    }
    if (mediaType === MediaType.PHOTO) {
      return this.getPhotoSizeList();
    }
    return list;
  }

  public static getDocSizeList(): Array<MediaSize> {
    let list: Array<MediaSize> = new Array<MediaSize>();
    list.push(MediaSize.ISO_A4);
    list.push(MediaSize.ISO_A5);
    list.push(MediaSize.JIS_B5);
    list.push(MediaSize.ISO_C5);
    list.push(MediaSize.ISO_DL);
    return <Array<MediaSize>>list;
  }

  public static getPhotoSizeList(): Array<MediaSize> {
    let list: Array<MediaSize> = new Array<MediaSize>();
    list.push(MediaSize.ISO_A4);
    list.push(MediaSize.PHOTO_4x6);
    list.push(MediaSize.PHOTO_5x7);
    return <Array<MediaSize>>list;
  }

  public static initMediaSizeArray(mediaSizeArray: Array<MediaSize>): void {
    mediaSizeArray.push(MediaSize.ISO_A4);
    mediaSizeArray.push(MediaSize.ISO_A5);
    mediaSizeArray.push(MediaSize.JIS_B5);
    mediaSizeArray.push(MediaSize.ISO_C5);
    mediaSizeArray.push(MediaSize.ISO_DL);
    mediaSizeArray.push(MediaSize.LETTER);
    mediaSizeArray.push(MediaSize.LEGAL);
    mediaSizeArray.push(MediaSize.PHOTO_4x6);
    mediaSizeArray.push(MediaSize.PHOTO_5x7);
  }

  public static mediaSizeToPageSize(mediaSize: MediaSize): PrintPageSize {
    let pageSize = new PrintPageSize(mediaSize.id, mediaSize.name, mediaSize.widthMils, mediaSize.heightMils);
    return pageSize;
  }

  public static pageSizeToMediaSize(pageSize: PrintPageSize): MediaSize {
    let mediaSize = this.getMediaSizeByCode(Number.parseInt(pageSize.id));
    return mediaSize;
  }

  public static getCodesBySizes(sizes: string[]): number[] {
    let codes: number[] = new Array<number>();
    for (let size of sizes) {
      for (let key of MediaSize.sCodeToStringMap.keys()) {
        if (MediaSize.sCodeToStringMap.get(key).name === size) {
          codes.push(key);
        }
      }
    }
    return codes;
  }

  public static getMediaSizeByCode(code: number): MediaSize {
    let result: boolean = <boolean>MediaSize.sCodeToStringMap.has(code);
    if (result) {
      return MediaSize.sCodeToStringMap.get(code);
    }
    return MediaSize.sCodeToStringMap.get(MediaSizeUtil.defaultSizeCode);
  }

  public static toMediaCode(code: number): number {
    let result: boolean = <boolean>MediaSize.sCodeToStringMap.has(code);
    if (result) {
      return code;
    }
    return 0;
  }

  public static initMediaSizeLabel(): void {
    MediaSize.ISO_A4.label = MediaSize.getLabel(MediaSize.ISO_A4.label,MediaSize.ISO_A4.realWidth,MediaSize.ISO_A4.realHeight);
    MediaSize.ISO_A5.label = MediaSize.getLabel(MediaSize.ISO_A5.label,MediaSize.ISO_A5.realWidth,MediaSize.ISO_A5.realHeight);
    MediaSize.JIS_B5.label = MediaSize.getLabel(MediaSize.JIS_B5.label,MediaSize.JIS_B5.realWidth,MediaSize.JIS_B5.realHeight);
    MediaSize.ISO_C5.label = MediaSize.getLabel(StringUtil.getString('ISO_C5'),MediaSize.ISO_C5.realWidth,MediaSize.ISO_C5.realHeight);
    MediaSize.ISO_DL.label = MediaSize.getLabel(StringUtil.getString('ISO_DL'),MediaSize.ISO_DL.realWidth,MediaSize.ISO_DL.realHeight);
    MediaSize.LETTER.label = MediaSize.getLabel(MediaSize.LETTER.label,MediaSize.LETTER.realWidth,MediaSize.LETTER.realHeight);
    MediaSize.LEGAL.label = MediaSize.getLabel(MediaSize.LEGAL.label,MediaSize.LEGAL.realWidth,MediaSize.LEGAL.realHeight);
    MediaSize.PHOTO_4x6.label = MediaSize.getLabel(StringUtil.getString('PHOTO_4x6'),MediaSize.PHOTO_4x6.realWidth,MediaSize.PHOTO_4x6.realHeight);
    MediaSize.PHOTO_5x7.label = MediaSize.getLabel(StringUtil.getString('PHOTO_5x7'),MediaSize.PHOTO_5x7.realWidth,MediaSize.PHOTO_5x7.realHeight);
  }
}
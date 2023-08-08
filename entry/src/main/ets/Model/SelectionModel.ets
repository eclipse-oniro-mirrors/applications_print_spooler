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

import { PageDirection, PrintQuality, MediaType ,Duplex} from '@ohos/common'
import { Log, MediaSize } from '@ohos/common'

const TAG = '[SelectionModel]:'
export default class SelectionModel {

  public static readonly Add_Printer : SelectionModel = new SelectionModel('index_add_printer'
    ,null,$r('app.string.index_add_printer'))
  public static readonly NO_Printer : SelectionModel = new SelectionModel('index_no_printer_selected'
    ,null,$r('app.string.index_no_printer_selected'))
  public static readonly MediaSize_ISO_A3 : SelectionModel = new SelectionModel('ISO_A3'
    ,MediaSize.ISO_A3,MediaSize.ISO_A3.label)
  public static readonly MediaSize_ISO_A4 : SelectionModel = new SelectionModel('ISO_A4'
    ,MediaSize.ISO_A4,MediaSize.ISO_A4.label)
  public static readonly MediaSize_ISO_A5 : SelectionModel = new SelectionModel('ISO_A5'
    ,MediaSize.ISO_A5,MediaSize.ISO_A5.label)
  public static readonly MediaSize_JIS_B5 : SelectionModel = new SelectionModel('JIS_B5'
    ,MediaSize.JIS_B5,MediaSize.JIS_B5.label)
  public static readonly MediaSize_ISO_C5 : SelectionModel = new SelectionModel('ISO_C5'
    ,MediaSize.ISO_C5,MediaSize.ISO_C5.label)
  public static readonly MediaSize_ISO_DL : SelectionModel = new SelectionModel('ISO_DL'
    ,MediaSize.ISO_DL,MediaSize.ISO_DL.label)
  public static readonly MediaSize_LETTER : SelectionModel = new SelectionModel('LETTER'
    ,MediaSize.LETTER,MediaSize.LETTER.label)
  public static readonly MediaSize_LEGAL : SelectionModel = new SelectionModel('LEGAL'
    ,MediaSize.LEGAL,MediaSize.LEGAL.label)
  public static readonly MediaSize_PHOTO_4x6 : SelectionModel = new SelectionModel('PHOTO_4x6'
    ,MediaSize.PHOTO_4x6,MediaSize.PHOTO_4x6.label)
  public static readonly MediaSize_PHOTO_5x7 : SelectionModel = new SelectionModel('PHOTO_5x7'
    ,MediaSize.PHOTO_5x7,MediaSize.PHOTO_5x7.label)
  public static readonly MediaSize_INT_DL_ENVELOPE : SelectionModel = new SelectionModel('INT_DL_ENVELOPE'
    ,MediaSize.INT_DL_ENVELOPE,MediaSize.INT_DL_ENVELOPE.label)
  public static readonly MediaSize_B_TABLOID : SelectionModel = new SelectionModel('B_TABLOID'
    ,MediaSize.B_TABLOID,MediaSize.B_TABLOID.label)
  public static readonly Direction_AUTO : SelectionModel = new SelectionModel('PageDirection_AUTO'
    ,PageDirection.AUTO,$r('app.string.PageDirection_AUTO'))
  public static readonly Direction_LANDSCAPE : SelectionModel = new SelectionModel('PageDirection_LANDSCAPE'
    ,PageDirection.LANDSCAPE,$r('app.string.PageDirection_LANDSCAPE'))
  public static readonly Direction_VERTICAL : SelectionModel = new SelectionModel('PageDirection_VERTICAL'
    ,PageDirection.VERTICAL,$r('app.string.PageDirection_VERTICAL'))
  public static readonly MediaType_NORMAL : SelectionModel = new SelectionModel('MediaType_NORMAL'
    ,MediaType.NORMAL,$r('app.string.MediaType_NORMAL'))
  public static readonly MediaType_PHOTO : SelectionModel = new SelectionModel('MediaType_PHOTO'
    ,MediaType.PHOTO,$r('app.string.MediaType_PHOTO'))
  public static readonly PrintQuality_BEST : SelectionModel = new SelectionModel('PrintQuality_BEST'
    ,PrintQuality.BEST,$r('app.string.PrintQuality_BEST'))
  public static readonly PrintQuality_STANDARD : SelectionModel = new SelectionModel('PrintQuality_STANDARD'
    ,PrintQuality.STANDARD,$r('app.string.PrintQuality_STANDARD'))
  public static readonly PrintQuality_ECONOMY : SelectionModel = new SelectionModel('PrintQuality_ECONOMY'
    ,PrintQuality.ECONOMY,$r('app.string.PrintQuality_ECONOMY'))
  public static readonly DuplexMode_SINGLE : SelectionModel = new SelectionModel('DuplexMode_ONESIDE'
    ,Duplex.SINGLE,$r('app.string.DuplexMode_ONESIDE'))
  public static readonly DuplexMode_LONG : SelectionModel = new SelectionModel('DuplexMode_LONG'
    ,Duplex.LONG,$r('app.string.DuplexMode_LONG'))
  public static readonly DuplexMode_SHORT : SelectionModel = new SelectionModel('DuplexMode_SHORT'
    ,Duplex.SHORT,$r('app.string.DuplexMode_SHORT'))
  public static MediaSizeSelections :Array<SelectionModel> = undefined;

  name: string // 选项名称
  obj: any // 选项对象
  res:Resource|string

  constructor( name: string,obj: any,res:Resource|string) {
    this.name = name
    this.obj = obj
    this.res = res
  }

  public static getSelectionModelByLabel(label : string){
    if(SelectionModel.MediaSizeSelections === undefined){
      this.initMediaSizeSelections()
    }
    let rtnSelect = undefined;
    SelectionModel.MediaSizeSelections.forEach((selection,index,all) =>{
      if(selection.res === label){
        rtnSelect = selection
      }
    })
    return rtnSelect
  }

  public static initMediaSizeSelections(){
    SelectionModel.MediaSizeSelections = new Array<SelectionModel>()
    SelectionModel.MediaSizeSelections.push(SelectionModel.MediaSize_ISO_A3);
    SelectionModel.MediaSizeSelections.push(SelectionModel.MediaSize_ISO_A4);
    SelectionModel.MediaSizeSelections.push(SelectionModel.MediaSize_ISO_A5);
    SelectionModel.MediaSizeSelections.push(SelectionModel.MediaSize_ISO_C5);
    SelectionModel.MediaSizeSelections.push(SelectionModel.MediaSize_ISO_DL);
    SelectionModel.MediaSizeSelections.push(SelectionModel.MediaSize_JIS_B5);
    SelectionModel.MediaSizeSelections.push(SelectionModel.MediaSize_LEGAL);
    SelectionModel.MediaSizeSelections.push(SelectionModel.MediaSize_LETTER);
    SelectionModel.MediaSizeSelections.push(SelectionModel.MediaSize_PHOTO_4x6);
    SelectionModel.MediaSizeSelections.push(SelectionModel.MediaSize_PHOTO_5x7);
    SelectionModel.MediaSizeSelections.push(SelectionModel.MediaSize_INT_DL_ENVELOPE);
    SelectionModel.MediaSizeSelections.push(SelectionModel.MediaSize_B_TABLOID);
  }
}

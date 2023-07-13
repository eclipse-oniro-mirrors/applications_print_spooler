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

// @ts-ignore
import print from '@ohos.print';
import CheckEmptyUtils, { Log } from '@ohos/common';

const TAG = 'NativeApi';
const ERROR = -1

export class NativeApi {
  private static instance: NativeApi;

  public static getInstance(): NativeApi {
    Log.info(TAG, 'getInstance enter');
    if (this.instance === undefined) {
      this.instance = new NativeApi();
    }
    return this.instance;
  }

  public getCapabilities(uri: string, printerName: string, getCapsCallback: (result) => void): void {
    Log.debug(TAG, 'getCapabilities enter');
    if (print === undefined) {
      Log.error(TAG, 'print is undefined');
      getCapsCallback(ERROR);
      return;
    }
    Log.debug(TAG, 'getCapabilities start');
    print.nativeGetPrinterCapabilities(uri).then((result) => {
      Log.debug(TAG, 'nativeGetCapabilities result: ' + JSON.stringify(result));
      this.setCupsPrinter(uri, this.removeSpaces(printerName));
      getCapsCallback(result);
    }).catch((error) => {
      Log.error(TAG, 'nativeGetCapabilities error: ' + JSON.stringify(error));
      getCapsCallback(ERROR);
    });
    Log.debug(TAG, 'getCapabilities end');
  }

  public setCupsPrinter(uri: string, name: string): void {
    Log.debug(TAG, 'setCupsPrinter enter');
    if (print === undefined) {
      Log.error(TAG, 'print is undefined');
      return;
    }
    print.nativeSetCupsPrinter(uri, name).then((result) => {
      Log.debug(TAG, 'nativeSetCupsPrinter result: ' + JSON.stringify(result));
    }).catch((error) => {
      Log.error(TAG, 'nativeSetCupsPrinter error: ' + JSON.stringify(error));
    });
  }

  private removeSpaces(name: string): string {
    if (CheckEmptyUtils.checkStrIsEmpty(name)) {
      return '';
    }
    return name.replace(/\s+/g, '_');
  }
}
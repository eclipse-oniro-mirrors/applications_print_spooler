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

enum ColorModeCode {
  COLOR_MODE_MONOCHROME = 0,
  COLOR_MODE_COLOR = 1,
  COLOR_MODE_AUTO = 2
}

export class ColorMode {
  public static readonly sCodeToStringMap: Map<number, string> = new Map([
    [ColorModeCode.COLOR_MODE_MONOCHROME, 'monochrome'],
    [ColorModeCode.COLOR_MODE_COLOR, 'color'],
    [ColorModeCode.COLOR_MODE_AUTO, 'auto'],
  ]);

  public static getColorCode(code: number): number {
    if (ColorMode.sCodeToStringMap.has(code)) {
      return code;
    }
    return ColorModeCode.COLOR_MODE_AUTO;
  }
}
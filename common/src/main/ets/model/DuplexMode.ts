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

export enum DuplexModeCode {
  DUPLEX_MODE_ONE_SIDED = 0,
  DUPLEX_MODE_TWO_SIDED_LONG_EDGE = 1,
  DUPLEX_MODE_TWO_SIDED_SHORT_EDGE = 2
}

export class DuplexMode {
  public static readonly sCodeToStringMap: Map<number, string> = new Map([
    [DuplexModeCode.DUPLEX_MODE_ONE_SIDED, 'one-sided'],
    [DuplexModeCode.DUPLEX_MODE_TWO_SIDED_LONG_EDGE, 'two-sided-long-edge'],
    [DuplexModeCode.DUPLEX_MODE_TWO_SIDED_SHORT_EDGE, 'two-sided-short-edge'],
  ]);

  public static getDuplexString(code: number) {
    if (DuplexMode.sCodeToStringMap.has(code)) {
      return DuplexMode.sCodeToStringMap.get(code);
    }
    return DuplexMode.sCodeToStringMap.get(DuplexModeCode.DUPLEX_MODE_ONE_SIDED);
  }
}
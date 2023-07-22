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

export class PrintMargin {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}

export class PrinterRange {
  startPage?: number;
  endPage?: number;
  pages?: Array<number>;
}

export class PreviewAttribute {
  previewRange: PrinterRange;
  result?: string;
}

export class PrintResolution {
  id: string;
  horizontalDpi: number;
  verticalDpi: number;
}

export class PrintPageSize {
  constructor(public id: string, public name: string, public width: number, public height: number) {
    this.id = id;
    this.name = name;
    this.width = width;
    this.height = height;
  }
}

export class PrinterCapability {
  colorMode: number;
  duplexMode: number;
  pageSize: Array<PrintPageSize>;
  resolution?: Array<PrintResolution>;
  minMargin?: PrintMargin;
  option?: string;
}

export class PrinterInfo {
  public printerId: string;
  public printerName: string;
  public printerState: number;
  public printerIcon?: number;
  public description?: string;
  public capability?: PrinterCapability;
  public option?: string;
}

@Observed
export class PrintJob {
  files: Array<string>;
  fdList: Array<number>;
  jobId: string;
  printerId: string;
  jobState: PrintJobState;
  jobSubState: PrintJobSubState;
  copyNumber: number;
  pageRange: PrinterRange;
  isSequential: boolean;
  pageSize: PrintPageSize;
  isLandscape: boolean;
  colorMode: number;
  duplexMode: number;
  margin?: PrintMargin;
  preview?: PreviewAttribute;
  option?: string;
}

export class PrinterExtensionInfo {
  extensionId: string;    // extension id of printer extension
  vendorId: string;       // vendor id of extension
  vendorName: string;     // vendor name
  vendorIcon: number;     // resource id of vendor
  version: string;        // version of current printer extension
}

export enum PrinterState {
  PRINTER_ADDED = 0,
  PRINTER_REMOVED = 1,
  PRINTER_UPDATE_CAP = 2,
  PRINTER_CONNECTED = 3,
  PRINTER_DISCONNECTED = 4,
  PRINTER_RUNNING = 5,
}

export enum PrintJobState {
  PRINT_JOB_PREPARED = 0,
  PRINT_JOB_QUEUED = 1,
  PRINT_JOB_RUNNING = 2,
  PRINT_JOB_BLOCKED = 3,
  PRINT_JOB_COMPLETED = 4,
  PRINT_JOB_CANCELLING = 5,
}

export enum PrintJobSubState {
  PRINT_JOB_COMPLETED_SUCCESS = 0,
  PRINT_JOB_COMPLETED_FAILED = 1,
  PRINT_JOB_COMPLETED_CANCELLED = 2,
  PRINT_JOB_COMPLETED_FILE_CORRUPT = 3,
  PRINT_JOB_BLOCK_OFFLINE = 4,
  PRINT_JOB_BLOCK_BUSY = 5,
  PRINT_JOB_BLOCK_CANCELLED = 6,
  PRINT_JOB_BLOCK_OUT_OF_PAPER = 7,
  PRINT_JOB_BLOCK_OUT_OF_INK = 8,
  PRINT_JOB_BLOCK_OUT_OF_TONER = 9,
  PRINT_JOB_BLOCK_JAMMED = 10,
  PRINT_JOB_BLOCK_DOOR_OPEN = 11,
  PRINT_JOB_BLOCK_SERVICE_REQUEST = 12,
  PRINT_JOB_BLOCK_LOW_ON_INK = 13,
  PRINT_JOB_BLOCK_LOW_ON_TONER = 14,
  PRINT_JOB_BLOCK_REALLY_LOW_ON_INK = 15,
  PRINT_JOB_BLOCK_BAD_CERTIFICATE = 16,

  PRINT_JOB_BLOCK_ACCOUNT_ERROR = 18,
  PRINT_JOB_BLOCK_PRINT_PERMISSION_ERROR = 19,
  PRINT_JOB_BLOCK_PRINT_COLOR_PERMISSION_ERROR = 20,
  PRINT_JOB_BLOCK_NETWORK_ERROR = 21,
  PRINT_JOB_BLOCK_CONNECT_SERVER_ERROR = 22,
  PRINT_JOB_BLOCK_LARGE_FILE_ERROR = 23,
  PRINT_JOB_BLOCK_PARSE_FILE_ERROR = 24,
  PRINT_JOB_BLOCK_FILE_CONVERT_SLOWLY = 25,

  PRINT_JOB_RUNNING_UPLOADING_FILES = 26,
  PRINT_JOB_RUNNING_CONVERTING_FILES = 27,
  PRINT_JOB_BLOCK_UNKNOWN = 99
}

export class MessageEvent<T> {
  data: T;
}

export class PrintJobOptions {
  jobName: string;
  jobNum: number;
  jobDescription: string;
  mediaType: string;
  documentCategory: number;
  printQuality: string;
  printerName: string;
  printerUri: string;
  documentFormat: string;
  files: string[];
}

export enum PrinterFoundType {
  FROM_P2P = 0,
  FROM_EPRINT = 1,
  FROM_LOCAL_NET = 2,
  FROM_USB = 3
}

export enum DateTimeFormat {
  DATE = 0,
  DATE_TIME = 1,
  TIME = 2
}

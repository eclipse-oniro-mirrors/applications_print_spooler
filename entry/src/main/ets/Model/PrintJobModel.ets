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

// @ts-nocheck
import {
  Constants,
  AppCommonEvent,
  AppStorageKeyName
} from '@ohos/common';
import { PrintJob, PrintJobState } from '@ohos/common';
import AppStorageHelper from '../Common/Adapter/AppStorageHelper';
import { Log } from '@ohos/common';
import emitter from '@ohos.events.emitter';

const TAG = '[PrintJobModel]:';

/**
 * PrintJobModel
 */

/**
 * Print Job model
 */
export class PrintJobModel {
  public  mPrintJobs: Array<PrintJob> = [];

  /**
   * reset
   */
  public reset() {
    this.mPrintJobs = [];
    AppStorageHelper.setValue<Array<PrintJob>>(this.mPrintJobs, AppStorageKeyName.JOB_QUEUE_NAME);
  }

  /**
   * remove printJob
   *
   * @param jobId print Job id
   */
  public removePrintJob(jobId: string) {
    this.mPrintJobs = this.mPrintJobs.filter((printJob) => printJob.jobId !== jobId);
    Log.info(TAG, 'remove printJob, jobId = ' + JSON.stringify(jobId));
    AppStorageHelper.setValue<Array<PrintJob>>(this.mPrintJobs, AppStorageKeyName.JOB_QUEUE_NAME);
  }

  /**
   * add printJob
   *
   * @param printJob PrintJob
   * @return true for added
   */
  public addPrintJob(printJob: PrintJob): boolean {
    for (let index = 0; index < this.mPrintJobs.length; index++) {
      if (this.mPrintJobs[index].jobId === printJob.jobId) {
        Log.info(TAG, 'printJob is already exit, printJob = ' + printJob.jobId);
        return false;
      }
    }
    this.mPrintJobs.push(printJob)
    Log.info(TAG, 'add PrintJob, jobId = ' + JSON.stringify(printJob.jobId));
    AppStorageHelper.setValue<Array<PrintJob>>(this.mPrintJobs, AppStorageKeyName.JOB_QUEUE_NAME);
    return true;
  }

  /**
   * update printJob
   *
   * @param index array mPrintJobs index
   * @param index job PrintJob
   * @return true for update
   */
  public updatePrintJob(index: number, job: PrintJob): void {
    Log.info(TAG, 'update job info, jobId =' + JSON.stringify(job.jobId));
    if ((index < 0 || index >= (this.mPrintJobs.length)) || job === undefined) {
      Log.error(TAG, 'invalid param, return');
      return;
    }
    this.mPrintJobs[index].jobFiles = job.jobFiles;
    this.mPrintJobs[index].fdList = job.fdList;
    this.mPrintJobs[index].printerId = job.printerId;
    this.mPrintJobs[index].jobState = job.jobState;
    this.mPrintJobs[index].jobSubState = job.jobSubState;
    this.mPrintJobs[index].copyNumber = job.copyNumber;
    this.mPrintJobs[index].pageRange = job.pageRange;
    this.mPrintJobs[index].isSequential = job.isSequential;
    this.mPrintJobs[index].pageSize = job.pageSize;
    this.mPrintJobs[index].isLandscape = job.isLandscape;
    this.mPrintJobs[index].colorMode = job.colorMode;
    this.mPrintJobs[index].duplexMode = job.duplexMode;
    this.mPrintJobs[index].margin = job.margin;
    this.mPrintJobs[index].preview = job.preview;
    this.mPrintJobs[index].option = job.option;
    AppStorageHelper.setValue<Array<PrintJob>>(this.mPrintJobs, AppStorageKeyName.JOB_QUEUE_NAME);
  }

  /**
   * printJob state change
   *
   * @param jobId  job id
   * @param state job state
   * @param subState job subState
   * @return true for change
   */
  public printJobStateChange(jobId: string, state: number, subState: number): boolean {
    Log.info(TAG, 'printJobStateChange, jobId = ' + JSON.stringify(jobId));
    Log.info(TAG, 'printJobStateChange, PrintJobs.length = ' + this.mPrintJobs.length);
    for (let index = 0; index < this.mPrintJobs.length; index++) {
      if (this.mPrintJobs[index].jobId === jobId) {
        Log.info(TAG, 'printJobStateChanging, jobId = ' + this.mPrintJobs[index].jobId);
        this.mPrintJobs[index].jobState = state;
        this.mPrintJobs[index].jobSubState = subState;
        AppStorageHelper.setValue<Array<PrintJob>>(this.mPrintJobs, AppStorageKeyName.JOB_QUEUE_NAME);
        if (state === PrintJobState.PRINT_JOB_COMPLETED) {
          setTimeout(() => {
            Log.info(TAG, 'show completed job time out, jobId = ' + JSON.stringify(jobId));
            this.removePrintJob(jobId);
            if (this.mPrintJobs.length === 0) {
              let innerEvent = {
                eventId: AppCommonEvent.TERMINATE_JOB_MANAGER_ABILITY_EVENT,
                priority: emitter.EventPriority.HIGH
              }
              emitter.emit(innerEvent);
            } else {
            }
          }, Constants.SHOW_JOB_COMPLETED_TIMEOUT);
        }
      }
    }
    return true
  }
}

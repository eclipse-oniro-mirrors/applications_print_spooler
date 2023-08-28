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
import print from '@ohos.print';
import { Constants, AppCommonEvent, AppStorageKeyName} from '@ohos/common';
import { PrintJobState, PrintJobSubState } from '@ohos/common';
import AppStorageHelper from '../Common/Adapter/AppStorageHelper';
import { Log } from '@ohos/common';
import { PrintJobModel } from '../Model/PrintJobModel';
import { PrintJob } from '../Model/PrintJob';
import FileUtil from '../Common/Utils/FileUtil';
import CheckEmptyUtils from '@ohos/common';

const TAG = '[PrintJobController]:';

/**
 * PrintJobController
 *
 */
export class PrintJobController {
  private mPrintJobModel: PrintJobModel = new PrintJobModel();
  private mJobId: number = 0;

  /**
   * init
   *
   */
  public init(): void {
    Log.info(TAG, 'PrintJobController init');
    AppStorageHelper.createValue<Array<PrintJob>>(this.getModel().mPrintJobs, AppStorageKeyName.JOB_QUEUE_NAME);
    this.registerPrintJobCallback();
  }

  /**
   * on destroy
   */
  public destroy(): void {
    Log.info(TAG, 'PrintJobController destroy');
    this.unregisterPrintJobCallback();
  }

  /**
   * start print
   *
   * @param job print job Info
   */
  public startPrint(job: PrintJob): Promise<boolean> {
    Log.info(TAG, 'startPrint, jobId =' + JSON.stringify(job.jobId));
    let startTime = 'startPrintTime';
    AppStorageHelper.createValue<number>(new Date().getTime(), startTime);
    return new Promise((resolve) => {
      let printJobs: Array<PrintJob> = this.getModel().mPrintJobs;
      for (let index = 0; index < printJobs.length; index++) {
        Log.info(TAG, ' job: ' + printJobs[index].jobId);
        if (printJobs[index].jobId === job.jobId) {
          this.getModel().updatePrintJob(index, job);
          delete job.preview;
          delete job.jobFiles;
          if (printJobs[index].pageRange.pages.length === 0) {
            job.pageRange = {
              startPage: printJobs[index].pageRange.startPage,
              endPage: printJobs[index].pageRange.endPage
            };
          } else {
            job.pageRange = {
              pages: printJobs[index].pageRange.pages
            };
          }
          Log.debug(TAG, 'call startPrintJob');
          print.startPrintJob(job).then((data) => {
            Log.info(TAG, 'start Print success data : ' + JSON.stringify(data));
            resolve(true);
          }).catch((err) => {
            Log.error(TAG, 'failed to start Print because ' + JSON.stringify(err));
            // 任务下发失败
            this.getModel()
              .printJobStateChange(job.jobId, PrintJobState.PRINT_JOB_COMPLETED, PrintJobSubState.PRINT_JOB_COMPLETED_FAILED);
            resolve(false);
          });
        }
      }
    });
  }


  /**
   * cancle Print Job
   *
   * @param jobId job id
   */
  public cancelPrintJob(jobId: string): void {
    Log.info(TAG, 'cancelPrintJob jobId = ' + JSON.stringify(jobId));
    let printJobs = this.getModel().mPrintJobs;
    for (let index = 0; index < printJobs.length; index++) {
      if (printJobs[index].jobId === jobId) {
        print.cancelPrintJob(jobId).then((data) => {
          Log.info(TAG, 'cancel Print success data : ' + JSON.stringify(data));
        }).catch((err) => {
          Log.error(TAG, 'cancel to start Print because ' + JSON.stringify(err));
        });
        if (printJobs[index].jobState === PrintJobState.PRINT_JOB_QUEUED || printJobs[index].jobState === PrintJobState.PRINT_JOB_PREPARED) {
          Log.debug(TAG, 'remove QUEUED PrintJob : ' + JSON.stringify(printJobs[index]));
          setTimeout(() => {
            this.getModel().removePrintJob(jobId);
            if (this.getModel().mPrintJobs.length === 0) {
              Log.info(TAG, 'no job need to show, terminate page');
              let innerEvent = {
                eventId: AppCommonEvent.TERMINATE_JOB_MANAGER_ABILITY_EVENT,
                priority: emitter.EventPriority.HIGH
              };
              emitter.emit(innerEvent);
            }
          }, <number>Constants.SHOW_JOB_COMPLETED_TIMEOUT);
        }
        this.getModel().printJobStateChange(jobId, PrintJobState.PRINT_JOB_CANCELLING, PrintJobSubState.PRINT_JOB_BLOCK_UNKNOWN);
      }
    }
  }

  /**
   * register printJob callback
   */
  private registerPrintJobCallback(): void {
    Log.info(TAG, 'registerPrintJobCallback');
    print.on('jobStateChange', this.onJobStateChanged);
  }

  /**
   * print Job state change callback
   *
   * @param state printJob state
   * @param job printJob
   */
  private onJobStateChanged = (state: print.PrintJobState, job: print.PrintJob): void => {
    if (state === null || job === null) {
      Log.error(TAG, 'device state changed null data');
      return;
    }
    Log.info(TAG, 'on job state changed, state = ' + JSON.stringify(state));
    this.deleteLocalSource(<number>state, <string>job.jobId);
    switch (state) {
      case PrintJobState.PRINT_JOB_PREPARED:
      case PrintJobState.PRINT_JOB_QUEUED:
      case PrintJobState.PRINT_JOB_RUNNING:
      case PrintJobState.PRINT_JOB_BLOCKED:
      case PrintJobState.PRINT_JOB_COMPLETED:
        this.onPrintJobStateChange(job);
        break;
      default:
        break;
    }
  };

  /**
   * deal print Job state change
   *
   * @param job printJob
   */
  private onPrintJobStateChange(job: print.PrintJob): void {
    if (job === null) {
      Log.info(TAG, 'onDeviceVerified for null data.');
      return;
    }
    Log.info(TAG, 'on printJob state change, jobId = ' +
    job.jobId + ' jobState= ' + job.jobState + 'jobSubState = ' + job.jobSubState);
    this.getModel().printJobStateChange(job.jobId, job.jobState, job.jobSubState);
  }

  /**
   * unregister printJob callback
   */
  private unregisterPrintJobCallback(): void {
    Log.info(TAG, 'unregisterDeviceCallback');
    print.off('jobStateChange', (data) => {
      Log.info(TAG, 'off printJobStateChange data : ' + JSON.stringify(data));
    });
  }

  /**
   * create print Job
   *
   * @param jobId printJob id
   * @return job state
   */
  public createPrintJob(jobId: string): number {
    let newJob = new PrintJob([], [], jobId, null, PrintJobState.PRINT_JOB_PREPARED, 0, 0,
      null, false, null, false, 0, 0, null, null, null);
    this.getModel().addPrintJob(newJob);
    Log.info(TAG, 'createPrintJob, jobId = ' + JSON.stringify(jobId));
    return <number>newJob.jobState;
  }

  /**
   * get model
   *
   * @return PrintJobModel
   */
  public getModel(): PrintJobModel {
    return this.mPrintJobModel;
  }

  private async deleteLocalSource(state: number, jobId: string): void {
    Log.debug(TAG, 'jobId: ' + jobId);
    if (state === PrintJobState.PRINT_JOB_COMPLETED) {
      Log.info(TAG, 'delete local source');
      let printJob = this.mPrintJobModel.mPrintJobs.find((job) => {
        return job.jobId === jobId;
      });
      if (printJob === undefined) {
        Log.error(TAG, 'deleteLocalSource printJob is undefined');
        return;
      }
      FileUtil.deleteSource(<string[]>printJob.jobFiles);
    }
  }

  convertToPrintJob(item: print.PrintJob): PrintJob {
    if (!this.isValidPrintJob(item)) {
      Log.info(TAG, `convertToPrintJob invalid job, jobId${item.jobId}}`);
      return null;
    }
    return new PrintJob(item.jobFiles, item.fdList, item.jobId, item.printerId, item.jobState,
      item.jobSubState, item.copyNumber, item.pageRange, item.isSequential, item.pageSize, item.isLandscape,
      item.colorMode, item.duplexMode, item.margin, item.preview, item.option);
  }

  isValidPrintJob(job: print.PrintJob): boolean {
    if (job == null) {
      return false;
    }
    if(CheckEmptyUtils.checkStrIsEmpty(job.printerId) || CheckEmptyUtils.checkStrIsEmpty(job.jobId) ||
    !(job.jobState in PrintJobState) || !(job.jobSubState in PrintJobSubState)){
      return false;
    }
    return true;
  }

  /**
   * queryAllPrintJobs
   */
  async queryAllPrintJobs(printerId?: string): Promise<Array<PrintJob>> {
    return new Promise((resolve) => {
      print.queryAllPrintJobs().then((data) => {
        Log.info(TAG, `queryAllPrintJobs data.length:${data?.length}`);
        let retPrintJobs:Array<PrintJob> = [];
        for (let item of data) {
          let printJob = this.convertToPrintJob(item);
          if (printJob === null) {
            Log.warn(TAG, 'queryAllPrintJobs invalid job.');
            continue;
          }
          if (printerId === undefined || hwPrintJob.printerId === printerId) {
            retPrintJobs.push(printJob);
          }
        }
        Log.info(TAG, `queryAllPrintJobs retPrintJobs.length:${retPrintJobs.length}`);
        resolve(retPrintJobs);
      }).catch((err) => {
        Log.error(TAG, `failed to queryAllPrintJobs Cause:${JSON.stringify(err)}`);
      });
    });
  }
}

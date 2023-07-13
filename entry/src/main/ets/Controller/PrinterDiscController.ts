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
import commonEvent from '@ohos.commonEvent';
import {
  AppCommonEvent,
  PrintErrorCode,
  AppStorageKeyName
} from '../../../../../common/src/main/ets/model/Constants';
import AppStorageHelper from '../Common/Adapter/AppStorageHelper';
import { GlobalThisHelper, GlobalThisStorageKey } from '@ohos/common';
import WifiP2pHelper from '../Common/Adapter/WifiP2pHelper';
import { Log } from '@ohos/common';
import { PrinterDiscModel } from '../Model/PrinterDiscModel';
import emitter from '@ohos.events.emitter';
import StringUtil from '../../../../../common/src/main/ets/utils/StringUtil';
import { requestPermission, checkPermission } from '@ohos/common';
import { PrintJob, PrinterCapability, PrinterInfo, PrinterState } from '@ohos/common';

const TAG = '[PrinterDiscController]:';

/**
 * PrinterDiscController
 */
export class PrinterDiscController {
  private mPrinterDiscModel: PrinterDiscModel = new PrinterDiscModel();
  private eventSubscriber = null;

  /**
   * create print Job
   *
   * @param jobId printJob id
   * @return job state
   */
  public init(): void {
    Log.info(TAG, 'PrinterDiscController init');
    AppStorageHelper.createValue<Array<PrinterInfo>>(this.getModel().mPrinters, AppStorageKeyName.PRINTER_QUEUE_NAME);
    this.registerPrinterCallback();
    this.subscribeCommonEvent();
  }

  /**
   * on destroy
   */
  public destroy(): void {
    Log.info(TAG, 'PrinterDiscController destroy');
    this.unregisterPrinterCallback();
  }

  /**
   * start discovery
   *
   * @param jobId job id
   * @param extensionList extension list
   */
  public startDiscovery(jobId: string, extensionList: Array<string>): void {
    Log.info(TAG, 'startDiscovery, jobId = ' + JSON.stringify(jobId) + ', extensionList ' + JSON.stringify(extensionList));
    this.mPrinterDiscModel.reset();
    print.queryAllPrinterExtensionInfos().then((extensionInfos: object[]) => {
      Log.info(TAG, 'queryExtensionAbilityInfos success : ' + JSON.stringify(extensionInfos));
      print.startDiscoverPrinter(extensionList).then((data) => {
        Log.info(TAG, 'start Discovery success data : ' + JSON.stringify(data));
      }).catch((err) => {
        Log.error(TAG, 'failed to start Discovery because : ' + JSON.stringify(err));
      });
      checkPermission().then((result) => {
        if (!result) {
          let context = GlobalThisHelper.getValue(GlobalThisStorageKey.KEY_MAIN_ABILITY_CONTEXT);
          requestPermission(context, () => {
            print.startDiscoverPrinter(extensionList).then((data) => {
              Log.info(TAG, 'requestPermission, start Discovery success data : ' + JSON.stringify(data));
            }).catch((err) => {
              Log.error(TAG, 'failed to start Discovery because : ' + JSON.stringify(err));
            });
          });
        } else {
          Log.error(TAG, 'has permission, ignore');
        }
      });
    }).catch((error) => {
      Log.error(TAG, 'start discovery fail because :' + JSON.stringify(error));
    });
  }

  /**
   * register printer callback
   */
  private registerPrinterCallback(): void {
    Log.info(TAG, 'registerPrinterCallback');
    print.on('printerStateChange', this.onPrinterStateChanged);
  }

  /**
   * printer state change callback
   *
   * @param state printer state
   * @param info printer info
   */
  private onPrinterStateChanged = (state, info): void => {
    if (state === null || info === null) {
      Log.error(TAG, 'printer state changed state is null or info is null');
      return;
    }

    Log.info(TAG, 'on printer state changed, state = ' + JSON.stringify(state));
    info.toJSON = function (): JSON {
      return {
        // @ts-ignore
        'printerId': StringUtil.splitMac(<string> this.printerId),
        'printerName': StringUtil.encodeCommonString(<string> this.printerName),
        'printerIcon': this.printerIcon,
        'printerState': this.printerState
      };
    };
    Log.info(TAG, 'on printer state changed, info = ' + JSON.stringify(info));
    switch (state) {
      case PrinterState.PRINTER_ADDED:
        this.onPrinterFound(info);
        break;
      case PrinterState.PRINTER_REMOVED:
        this.onPrinterOffline(info);
        break;
      case PrinterState.PRINTER_UPDATE_CAP:
        this.onPrinterUpdateCapability(info);
        break;
      case PrinterState.PRINTER_CONNECTED:
      case PrinterState.PRINTER_DISCONNECTED:
      case PrinterState.PRINTER_RUNNING:
        this.onPrinterStateChange(info);
        break;
      default:
        break;
    }
  };

  /**
   * deal printer offline
   *
   * @param info printer info
   */
  private onPrinterOffline(info: print.PrinterInfo): void {
    if (info === null) {
      Log.error(TAG, 'onPrinterOffline for null info');
      return;
    }
    Log.info(TAG, 'on printer offline, printer = ' + StringUtil.splitMac(<string> info.printerId));
    this.mPrinterDiscModel.removePrinter(<string> info.printerId);
  }

  /**
   * deal printer find
   *
   * @param info printer info
   */
  private onPrinterFound(info: print.PrinterInfo): void {
    Log.info(TAG, 'enter onPrinterFound');
    if (info === null) {
      Log.error(TAG, 'onPrinterFound for null data');
      return;
    }
    let newPrinter = new PrinterInfo();
    newPrinter.printerId = info.printerId;
    newPrinter.printerName = info.printerName;
    newPrinter.printerState = info.printerState;
    newPrinter.printerIcon = info.printerIcon;
    newPrinter.description = info.description;
    newPrinter.capability = info.capability;
    newPrinter.option = info.options;
    let added = this.mPrinterDiscModel.addPrinter(newPrinter);
    Log.info(TAG, 'foundPrinter = ' + StringUtil.encodeCommonString(<string> info.printerName));
  }

  /**
   * find printer
   *
   * @param printerId printerId
   */
  public findPrinter(printerId: string): boolean {
    Log.debug(TAG, 'findPrinter = ' + StringUtil.splitMac(printerId));
    let res: boolean = this.mPrinterDiscModel.findPrinter(printerId);
    return <boolean> res;
  }

  /**
   * deal printer state change
   *
   * @param info printer info
   */
  private onPrinterStateChange(info: print.PrinterInfo): void {
    Log.error(TAG, 'onPrinterStateChange, info = ' + JSON.stringify(info));
    if (info === null) {
      Log.error(TAG, 'onPrinterStateChange for null data');
      return;
    }
    this.mPrinterDiscModel.printerStateChange(<string> info.printerId, <number> info.printerState);
  }

  /**
   * deal printer capability update
   *
   * @param info printer info
   */
  private onPrinterUpdateCapability(info: print.PrinterInfo): void {
    Log.info(TAG, 'onPrinterUpdateCapability, info = ' + JSON.stringify(info));
    if (info === null) {
      Log.error(TAG, 'onPrinterUpdateCapability for null data');
      return;
    }
    this.mPrinterDiscModel.printerUpdateCapability(<string> info.printerId, <PrinterCapability> info.capability,
      <string> info.option, <string> info.description);
  }

  /**
   * stop discovery
   *
   * @param jobId job id
   */
  public stopDiscovery(jobId: string): void {
    Log.info(TAG, 'stopDiscovery');
    print.stopDiscoverPrinter().then((data) => {
      Log.info(TAG, 'stop Discovery success data : ' + JSON.stringify(data));
    }).catch((err) => {
      Log.error(TAG, 'failed to stop Discovery because ' + JSON.stringify(err));
    });
  }

  /**
   * register printer callback
   */
  private unregisterPrinterCallback(): void {
    Log.info(TAG, 'unregisterPrinterCallback');
    print.off('printerStateChange', (data) => {
      console.info('off printerStateChange data : ' + JSON.stringify(data));
    });
  }

  /**
   * connect Printer
   *
   * @param printerId printer id
   */
  public connectPrinter(printer: PrinterInfo): void {
    let printerId: string = printer.printerId;
    Log.debug(TAG, 'connectPrinter printerId = ' + StringUtil.splitMac(printerId));
    print.connectPrinter(printerId).then((data) => {
      Log.debug(TAG, 'start connect Printer success data : ' + JSON.stringify(data));
    }).catch((err) => {
      Log.error(TAG, 'failed to connect Printer because ' + JSON.stringify(err));
      if (err === PrintErrorCode.E_PRINT_INVALID_PRINTER) {
        let innerEvent = {
          eventId: AppCommonEvent.PRINTER_INVALID_EVENT,
          priority: emitter.EventPriority.HIGH
        };
        let eventData = {
          data: {
            'printerId': printerId
          }
        };
        emitter.emit(innerEvent, eventData);
        Log.error(TAG, 'delete invalid printer printerId = ' + JSON.stringify(printerId));
        this.mPrinterDiscModel.removePrinter(printerId);
        this.startDiscovery('', []);
      }
    });
  }

  /**
   * disconnect Printer
   *
   * @param printerId printer id
   */
  public async disconnectPrinter(printerId: string): Promise<void> {
    Log.info(TAG, 'disconnectPrinter');
    await print.disconnectPrinter(printerId).then((data) => {
      Log.info(TAG, 'start disconnect Printer success data : ' + JSON.stringify(data));
    }).catch((err) => {
      Log.error(TAG, 'failed to disconnect Printer because ' + JSON.stringify(err));
    });
  }

  /**
   * query Printer Capability
   *
   * @param printerId printer id
   * @return printer capability
   */
  public async queryPrinterCapability(printerId: string): Promise<void> {
    Log.info(TAG, 'queryPrinterCapability');
    print.queryPrinterCapability(printerId);
  }

  /**
   * get model
   *
   * @return PrinterDiscModel
   */
  public getModel(): PrinterDiscModel {
    return this.mPrinterDiscModel;
  }

  /**
   * subscribe CommonEvent
   */
  public subscribeCommonEvent(): void {
    Log.info(TAG, 'subscribeCommonEvent');
    let subscribeInfo = {
      events: [commonEvent.Support.COMMON_EVENT_WIFI_POWER_STATE],
    };
    commonEvent.createSubscriber(subscribeInfo).then((subscriber) => {
      Log.info(TAG, 'start createSubscriber subscriber : ' + JSON.stringify(subscriber));
      this.eventSubscriber = subscriber;
      commonEvent.subscribe(this.eventSubscriber, (err, commonEventData) => {
        Log.error(TAG, 'subscribe callback : ' + JSON.stringify(commonEventData));
        if (commonEventData.event === commonEvent.Support.COMMON_EVENT_WIFI_POWER_STATE) {
          if (!WifiP2pHelper.checkWifiActive()) {
            Log.error(TAG, 'wifi inactive ');
            this.mPrinterDiscModel.reset();
            let innerEvent = {
              eventId: AppCommonEvent.WLAN_INACTIVE_EVENT,
              priority: emitter.EventPriority.HIGH
            };
            emitter.emit(innerEvent);
          } else {
            let innerEvent = {
              eventId: AppCommonEvent.WLAN_ACTIVE_EVENT,
              priority: emitter.EventPriority.HIGH
            };
            emitter.emit(innerEvent);
          }
        }
      });
    }).catch((err) => {
      Log.error(TAG, 'failed createSubscriber because ' + JSON.stringify(err));
    });
  }
}
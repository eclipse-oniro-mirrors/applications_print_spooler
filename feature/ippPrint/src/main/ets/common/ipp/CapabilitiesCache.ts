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

import wifi from '@ohos.wifi';
import Vector from '@ohos.util.Vector';
import CommonUtils from '../utils/CommonUtils';
import { WIFI_POWER_CLOSED } from '@ohos/common';
import P2PUtils from '../utils/P2pUtils';
import { Log } from '@ohos/common';
import CheckEmptyUtils from '@ohos/common';
import type { PrintServiceAdapter } from '../PrintServiceAdapter';
import type LocalPrinterCapabilities from '../napi/LocalPrinterCapabilities';
import type DiscoveredPrinter from '../discovery/DiscoveredPrinter';
import type { Backend } from '../ipp/Backend';
import type uri from '@ohos.uri';
import socket from '@ohos.net.socket';
import HashMap from '@ohos.util.HashMap';
import HashSet from '@ohos.util.HashSet';
import CommonEventManager from '@ohos.commonEventManager';
import type { WifiListener } from '../model/WifiModel';

const TAG = 'CapabilitiesCache';

export class CapabilitiesCache implements WifiListener {
  private readonly mPrintServiceAdapter: PrintServiceAdapter;
  private readonly mBackend: Backend;
  private readonly requestVector: Vector<Request> = new Vector<Request>();
  private readonly capsCache = new HashMap<string, LocalPrinterCapabilities>();
  private readonly p2pUris = new HashSet<string>();
  private readonly wifiUris = new HashSet<string>();
  private currentRequest: Request;
  private p2pSubscriber;

  constructor(printServiceAdapter: PrintServiceAdapter) {
    this.mPrintServiceAdapter = printServiceAdapter;
    this.mBackend = this.mPrintServiceAdapter.backend;
    this.mPrintServiceAdapter.wifiModel.addListener(this);
  }

  /**
   * request printer caps
   *
   * @param printer
   * @param onLocalPrinterCapabilities
   */
  public async requestCapabilities(printer: DiscoveredPrinter, onLocalPrinterCapabilities: OnLocalPrinterCapabilities): Promise<void> {
    if (CheckEmptyUtils.isEmpty<DiscoveredPrinter>(printer)) {
      Log.error(TAG, 'printer is empty');
      return;
    }
    if (CheckEmptyUtils.isEmpty<uri.URI>(printer.getUri())) {
      Log.error(TAG, 'uri is empty');
      return;
    }
    let uri = printer.getUri();
    let printerId = printer.getId();
    this.isServiceOnline(uri, <string>printerId, (data: uri.URI, printerId: string) => {
      if (CheckEmptyUtils.isEmpty<uri.URI>(data)) {
        onLocalPrinterCapabilities.onCapabilities(null);
        return;
      }
      Log.debug(TAG, 'printerId: ' + printerId);
      for (let key of this.capsCache.keys()) {
        Log.debug(TAG, 'cache key: ' + key);
      }
      if (this.capsCache.hasKey(printerId)) {
        Log.debug(TAG, 'caps cache hit');
        onLocalPrinterCapabilities.onCapabilities(this.capsCache.get(printerId));
      } else {
        Log.debug(TAG, 'caps not in cache, request from printer');
        let request = new Request(this.mBackend, printer.getUri(), printer.getDeviceName(), onLocalPrinterCapabilities);
        this.requestVector.add(request);
        this.startNextRequest();
      }
    });
  }

  public addCapsToCache(printer: DiscoveredPrinter, caps: LocalPrinterCapabilities): void {
    Log.debug(TAG, 'save caps in cache, key: ' + printer.getId());
    let printerId = printer.getId();
    if (P2PUtils.isP2p(printer)) {
      this.p2pUris.add(printerId);
    } else {
      this.wifiUris.add(printerId);
    }
    this.capsCache.set(printerId, caps);
  }

  private async isServiceOnline(uri: uri.URI, printerId: string, callback: (data: uri.URI, printerId: string) => void): Promise<void> {
    Log.info(TAG, `address: ${CommonUtils.getSecurityIp(uri.host)}`);
    let tcp = socket.constructTCPSocketInstance();
    tcp.bind({address: 'localhost'}).then(() => {
      tcp.connect({ address: {address: <string>uri.host, port: parseInt(<string>uri.port), family: 1}, timeout: 3000}).then(() => {
        Log.info(TAG, 'printer is online');
        callback(uri, printerId);
        tcp.close();
      }).catch((error) => {
        Log.error(TAG, 'connect printer failed: ' + JSON.stringify(error));
        callback(null, printerId);
        tcp.close();
      });
    }).catch((error) => {
      Log.error(TAG, 'bind printer failed: ' + JSON.stringify(error));
      callback(null, printerId);
      tcp.close();
    });
  }

  private startNextRequest(): void {
    Log.debug(TAG, 'startNextRequest enter');
    if (this.requestVector.length === 0) {
      Log.error(TAG, 'no active request in requestVector');
      return;
    }
    if (this.currentRequest !== undefined) {
      Log.error(TAG, 'a active request is running, requestVector len: ' + this.requestVector.length);
      return;
    }
    this.currentRequest = this.requestVector.removeByIndex(0);
    if (CheckEmptyUtils.isEmpty<Request>(this.currentRequest)) {
      Log.error(TAG, 'currentRequest is empty');
      return;
    }
    this.currentRequest.start(() => {
      Log.info(TAG, 'Previous request complete, start next request');
      this.currentRequest = undefined;
      this.startNextRequest();
    });
  }

  onConnectionStateChanged(data): void {
    if (data.event === CommonEventManager.Support.COMMON_EVENT_WIFI_POWER_STATE && data.code === WIFI_POWER_CLOSED) {
      Log.debug(TAG, 'wifi close event: ' + JSON.stringify(data));
      for (let wifiUri of this.wifiUris) {
        this.capsCache.remove(wifiUri);
      }
      this.wifiUris.clear();
      for (let p2pUri of this.p2pUris) {
        this.capsCache.remove(p2pUri);
      }
      this.p2pUris.clear();
    } else if (data.event === CommonEventManager.Support.COMMON_EVENT_WIFI_CONN_STATE && data.code === wifi.ConnState.DISCONNECTING) {
      Log.debug(TAG, 'wifi connect state change event: ' + JSON.stringify(data));
      for (let wifiUri of this.wifiUris) {
        this.capsCache.remove(wifiUri);
      }
      this.wifiUris.clear();
    } else if (data.event === CommonEventManager.Support.COMMON_EVENT_WIFI_P2P_CONN_STATE && data.code === wifi.P2pConnectState.DISCONNECTED) {
      Log.debug(TAG, 'p2p connect state change event: ' + JSON.stringify(data));
      for (let p2pUri of this.p2pUris) {
        this.capsCache.remove(p2pUri);
      }
      this.p2pUris.clear();
    }
  }

  public close(): void {
    this.capsCache.clear();
    this.p2pUris.clear();
    this.wifiUris.clear();
    this.mPrintServiceAdapter.wifiModel.removeListener(this);
    CommonEventManager.unsubscribe(this.p2pSubscriber);
  }
}

class Request {
  constructor(private backend: Backend, private uri: uri.URI, private printerName: string, private capsCallback: OnLocalPrinterCapabilities) {
    this.backend = backend;
    this.uri = uri;
    this.printerName = printerName;
    this.capsCallback = capsCallback;
  }

  public start(requestCallback: () => void): void {
    this.backend.getCapabilities(this.uri, this.printerName, this.capsCallback, requestCallback);
  }
}


/**
 * Callback for receiving capabilities
 */
export interface OnLocalPrinterCapabilities {

  /**
  * Called when capabilities are retrieved
  *
  * @param capabilities LocalPrinterCapabilities
  */
  onCapabilities(capabilities: LocalPrinterCapabilities): void;

}
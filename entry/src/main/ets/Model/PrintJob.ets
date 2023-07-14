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
import rpc from '@ohos.rpc';
import { PrintJobState,PrintJobSubState,PrinterRange,PrintPageSize,PrintMargin,PreviewAttribute } from '@ohos/common';

@Observed
export class PrintJob implements rpc.Sequenceable{
    constructor(public jobFiles: string[], public fdList : Array<number>, public jobId : string, public printerId : string,
                public jobState: PrintJobState, public jobSubState : PrintJobSubState, public copyNumber: number, public pageRange: PrinterRange,
                public isSequential : boolean, public pageSize : PrintPageSize, public isLandscape : boolean,
                public colorMode : number, public duplexMode : number, public margin : PrintMargin,
                public preview : PreviewAttribute, public option : string) {
        this.jobFiles = jobFiles
        this.fdList = fdList
        this.jobId = jobId
        this.printerId = printerId
        this.jobState = jobState
        this.jobSubState = jobSubState
        this.copyNumber = copyNumber
        this.pageRange = pageRange
        this.isSequential = isSequential
        this.pageSize = pageSize
        this.isLandscape = isLandscape
        this.colorMode = colorMode
        this.duplexMode = duplexMode
        this.margin = margin
        this.preview = preview
        this.option = option
    }

    /**
     * Marshals this {@code Sequenceable} object into a {@link MessageParcel}.
     */
    marshalling(dataOut: rpc.MessageParcel): boolean {
        dataOut.writeStringArray(this.jobFiles)
        dataOut.writeIntArray(this.fdList)
        dataOut.writeString(this.jobId)
        dataOut.writeString(this.printerId)
        dataOut.writeInt(this.jobState)
        dataOut.writeInt(this.jobSubState)
        dataOut.writeInt(this.copyNumber)
        dataOut.writeSequenceable(this.pageRange)
        dataOut.writeBoolean(this.isSequential)
        dataOut.writeSequenceable(this.pageSize)
        dataOut.writeBoolean(this.isLandscape)
        dataOut.writeInt(this.colorMode)
        dataOut.writeInt(this.duplexMode)
        dataOut.writeSequenceable(this.margin)
        dataOut.writeSequenceable(this.preview)
        dataOut.writeString(this.option)
        return true
    }

    /**
     * Unmarshals this {@code Sequenceable} object from a {@link MessageParcel}.
     */
    unmarshalling(dataIn: rpc.MessageParcel): boolean{
        dataIn.readStringArray(this.jobFiles);
        dataIn.readIntArray(this.fdList);
        this.jobId = dataIn.readString()
        this.printerId = dataIn.readString()
        this.jobState = dataIn.readInt()
        this.jobSubState = dataIn.readInt()
        this.copyNumber = dataIn.readInt()
        dataIn.readSequenceable(this.pageRange)
        this.isSequential = dataIn.readBoolean()
        dataIn.readSequenceable(this.pageSize)
        this.isLandscape = dataIn.readBoolean()
        this.colorMode = dataIn.readInt()
        this.duplexMode = dataIn.readInt()
        dataIn.readSequenceable(this.margin)
        dataIn.readSequenceable(this.preview)
        this.option = dataIn.readString()
        return true
    }

}

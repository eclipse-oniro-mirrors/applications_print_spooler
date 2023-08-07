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
import { PrintJobState, PrintJobSubState } from '@ohos/common';
import { Log } from '@ohos/common';
import StringUtil from '@ohos/common';
import {Constants, AppCommonEvent } from '@ohos/common';
import { GlobalThisHelper, GlobalThisStorageKey} from '@ohos/common';
import CheckEmptyUtils from '@ohos/common';
import emitter from '@ohos.events.emitter';
import PrintAdapter from '../Common/Adapter/PrintAdapter';
import common from '@ohos.app.ability.common';
import { PrintJob }  from '../Model/PrintJob';

const TAG = '[JobManagerPage]'

let jobArray = new Array<PrintJob>()

@Extend(Text) function statusStyle(jobState:number, jobSubState:number){
  .fontSize($r('app.float.font_size_body2'))
  .fontColor(adjustFontColor(jobState, jobSubState))
  .fontWeight(FontWeight.Medium)
  .textOverflow({ overflow: TextOverflow.Ellipsis })
}
function adjustFontColor(jobState:number, jobSubState:number){
  Log.info(TAG,'adjustFontColor,jobState: '+jobState + ',jobSubState:' + jobSubState)
  let color = $r('app.color.text_jobState_running')
  if(jobState === PrintJobState.PRINT_JOB_BLOCKED){
    if (jobSubState === PrintJobSubState.PRINT_JOB_BLOCK_FILE_CONVERT_SLOWLY) {
      color = $r('app.color.text_jobState_completed')
    } else {
      color = $r('app.color.text_jobState_blocked')
    }
  }else if(jobState === PrintJobState.PRINT_JOB_COMPLETED){
    color = $r('app.color.text_jobState_completed')
  }
  return color
}

@Entry
@Component
struct JobManagerPage {
  @State message: string = '当前没有任务';
  @Provide('IsBlocked') isBlocked: boolean = false
  @Provide('BlockedReason') blockedReason: string = Constants.STRING_NONE;
  @Provide('Context') abilityContext : common.UIAbilityContext = undefined;
  @Provide('PrintAdapter') adapter:PrintAdapter = undefined;
  @StorageLink('JobQueue') jobQueue: Array<PrintJob> = new Array();
  private jobId:string = Constants.STRING_NONE;
  build() {
    Column(){
      Column(){
        Text($r('app.string.print_job')).key('JobManagerPage_Text_printJob')
          .fontSize($r('app.float.font_size_headline8'))
          .fontWeight(FontWeight.Medium)
          .maxLines(Constants.NUMBER_1)
          .textOverflow({overflow:TextOverflow.Ellipsis})
      }
      .justifyContent(FlexAlign.Center)
      .alignItems(HorizontalAlign.Start)
      .width($r('app.float.print_job_comp_width'))
      .height($r('app.float.print_job_title_height'))
      .margin({left:$r('app.float.print_job_margin_left'),right:$r('app.float.print_job_margin_right')})
        Row(){
          Image($r('app.media.ic_printer_tips')).key('JobManagerPage_Image_printerTips')
            .width($r('app.float.image_comp_width'))
            .height($r('app.float.image_comp_height'))
            .margin({right:$r('app.float.print_job_tips_image_margin_right')})
          Text(this.blockedReason).key('JobManagerPage_Text_blockedReason')
            .fontSize($r('app.float.font_size_body2'))
            .fontColor($r('app.color.text_block_reason'))
            .fontWeight(FontWeight.Regular)
        }
        .width($r('app.float.print_job_comp_width'))
        .margin({left:$r('app.float.print_job_margin_left'),right:$r('app.float.print_job_margin_right')})
        .visibility(this.isBlocked?Visibility.Visible:Visibility.None)

      Row() {
        List() {
          ForEach(this.jobQueue, (printJob:PrintJob)=>{
            ListItem(){
              printJobComponent({ mPrintJob: printJob});
            }.key(`JobManagerPage_ListItem_${printJob.jobId}`)
          }, printJob=>printJob.jobId)
        }
        .key('JobManagerPage_List_jobQueue')
        .edgeEffect(EdgeEffect.Spring)
        .divider({ strokeWidth: $r('app.float.print_job_item_divider_strokeWidth')
        , color: $r('app.color.divider_color'), startMargin: $r('app.float.print_job_item_divider_startMargin')})
      }
      .width($r('app.float.print_job_comp_width'))
      .height($r('app.float.print_job_height'))
      .margin({left:$r('app.float.print_job_margin_left'),right:$r('app.float.print_job_margin_right')})
      .alignItems(VerticalAlign.Top)
      Button($r('app.string.JobManagerPage_ok')).key('JobManagerPage_Button_confirmed')
        .fontColor($r('app.color.button_cancel_text'))
        .backgroundColor($r('app.color.button_color_cancel'))
        .width($r('app.float.print_job_button_width'))
        .height($r('app.float.print_job_button_height'))
        .margin({top:$r('app.float.print_job_button_margin_top'),bottom:$r('app.float.print_job_button_margin_bottom')})
        .onClick(()=>{
          this.abilityContext.terminateSelf().then((data) => {
            console.info('===>terminateSelfCallBack===>: '+data);
          });
        })
    }
    .width($r('app.float.print_job_width'))
    .backgroundColor(Color.White)
    .alignItems(HorizontalAlign.Center)


  }

  aboutToAppear() {

    this.abilityContext = GlobalThisHelper.getValue<common.UIAbilityContext>(GlobalThisStorageKey.KEY_JOB_MANAGER_ABILITY_CONTEXT)
    let data = {
      wantJobId : Constants.STRING_NONE
    }
    this.abilityContext.eventHub.emit(Constants.EVENT_GET_ABILITY_DATA, data);
    Log.info(TAG, 'aboutToAppear jobId: ' + JSON.stringify(data.wantJobId) );
    this.jobId = data.wantJobId;
    this.adapter = PrintAdapter.getInstance();
    this.adapter.getPrintJobCtl().createPrintJob(this.jobId)
    this.subscribe();
  }

  aboutToDisappear() {
    this.unsubscribe();
  }

  private subscribe() {
    var innerEventState = { eventId: AppCommonEvent.TERMINATE_JOB_MANAGER_ABILITY_EVENT }
    emitter.on(innerEventState, (eventData) => {
      Log.info(TAG, 'emitter TERMINATE_JOB_MANAGER_ABILITY_EVENT');
      this.abilityContext.terminateSelf().then((data) => {
        console.info('===>terminateSelfCallBack===>: '+data);
      });
    })
  }

  private unsubscribe() {
    emitter.off(AppCommonEvent.TERMINATE_JOB_MANAGER_ABILITY_EVENT)
  }

}

@Component
struct printJobComponent {
  @ObjectLink @Watch('checkBlocked') mPrintJob: PrintJob;
  @State errorFlag: boolean = false;
  @State deleteBackgroundColor:Resource = $r('app.color.effect_color_none');
  @Consume('IsBlocked') isBlocked: boolean;
  @Consume('BlockedReason') blockedReason: string;
  @Consume('Context') context : common.UIAbilityContext

  @Consume('PrintAdapter') adapter:PrintAdapter;
  private opt : any = undefined
  private jobNum : number = Constants.NUMBER_1

  build(){
    Row() {
      Stack(){
        Image(this.jobNum>Constants.NUMBER_1?$r('app.media.ic_two'):$r('app.media.ic_one'))
          .width($r('app.float.print_job_item_icon_width'))
          .height($r('app.float.print_job_item_icon_height'))
          .margin({left: $r('app.float.print_job_item_icon_margin_left'), right: $r('app.float.print_job_item_icon_margin_right')})
        Image($r('app.media.ic_job_tips'))
          .width($r('app.float.print_job_item_tips_width'))
          .height($r('app.float.print_job_item_tips_height'))
          .offset({x:$r('app.float.print_job_item_tips_offset_x'),y:$r('app.float.print_job_item_tips_offset_y')})
          .visibility(this.mPrintJob.jobState === PrintJobState.PRINT_JOB_BLOCKED?Visibility.Visible:Visibility.None)
      }
      Column() {
        Text(this.opt===null ? Constants.STRING_NONE : this.opt.jobName)
          .fontSize($r('app.float.font_size_body1'))
          .fontWeight(FontWeight.Medium)
          .textOverflow({ overflow: TextOverflow.Ellipsis })
        Text(this.opt===null ? Constants.STRING_NONE : this.opt.jobDescription)
          .fontSize($r('app.float.font_size_body2'))
          .fontColor($r('app.color.text_jobDes'))
          .fontWeight(FontWeight.Lighter)
          .textOverflow({ overflow: TextOverflow.Ellipsis })
          .margin({top:$r('app.float.print_job_item_des_margin_top'),bottom:$r('app.float.print_job_item_des_margin_bottom')});
        Text(this.getStateStr()).statusStyle(this.mPrintJob.jobState, this.mPrintJob.jobSubState)
      }
      .width($r('app.float.print_job_item_des_width'))
      .alignItems(HorizontalAlign.Start)
      Button({ type: ButtonType.Normal, stateEffect: true }) {
        Image($r('app.media.ic_delete')).width($r('app.float.image_comp_width')).height($r('app.float.image_comp_height'))
      }
      .width($r('app.float.print_job_delete_button_width'))
      .height($r('app.float.print_job_delete_button_height'))
      .backgroundColor(this.deleteBackgroundColor)
      .borderRadius($r('app.float.radius_s'))
      .margin({left:$r('app.float.print_job_delete_button_margin_left')})
      .visibility(this.isHideDeleteBtn(this.mPrintJob)? Visibility.None:Visibility.Visible)
      .onHover((isHover: boolean) => {
        if (isHover) {
          this.deleteBackgroundColor =  $r('app.color.effect_color_hover')
        } else {
          this.deleteBackgroundColor =  $r('app.color.effect_color_none')
        }
      })
      .onTouch((event: TouchEvent) => {
        if (event.type === TouchType.Down) {
          this.deleteBackgroundColor =  $r('app.color.effect_color_press')
        }
        if (event.type === TouchType.Up) {
          this.deleteBackgroundColor =  $r('app.color.effect_color_none')
        }

      })
      .onClick(()=>{
        this.adapter.getPrintJobCtl().cancelPrintJob(this.mPrintJob.jobId)
      })
    }
    .width($r('app.float.print_job_comp_width'))
    .height($r('app.float.print_job_item_height'))

  }

  private isHideDeleteBtn(printJob: PrintJob): boolean {
    if (printJob.jobState === PrintJobState.PRINT_JOB_COMPLETED) {
      return true;
    }
    return false;
  }

  aboutToAppear() {
    Log.info(TAG, 'aboutToAppear')
    this.opt = JSON.parse(this.mPrintJob.option)
    if (!CheckEmptyUtils.isEmpty(this.opt)) {
      this.jobNum =this.opt.jobNum
    }
    this.checkBlocked()
  }

  onPageShow(){
    Log.info(TAG, 'onPageShow')
  }

  getJobName(){
    let jobName = Constants.STRING_NONE
    if (!CheckEmptyUtils.isEmpty(this.opt)) {
      jobName = this.opt.jobName
    }
    return jobName
  }

  getStateStr(){
    Log.info(TAG, 'getStateStr , jobState =  ', this.mPrintJob.jobState );
    let name = Constants.STRING_NONE
    if(this.mPrintJob.jobState === PrintJobState.PRINT_JOB_PREPARED) {
      name = 'print_job_created'
    } else if(this.mPrintJob.jobState === PrintJobState.PRINT_JOB_QUEUED) {
      name = 'print_job_queued'
    } else if(this.mPrintJob.jobState === PrintJobState.PRINT_JOB_RUNNING) {
      name = 'print_job_printing'
    }else if(this.mPrintJob.jobState === PrintJobState.PRINT_JOB_COMPLETED) {
      if (this.mPrintJob.jobSubState === PrintJobSubState.PRINT_JOB_COMPLETED_SUCCESS) {
        name = 'print_job_completed'
      }else if(this.mPrintJob.jobSubState ===PrintJobSubState.PRINT_JOB_COMPLETED_FAILED){
        name = 'print_job_failed'
      }else if(this.mPrintJob.jobSubState ===PrintJobSubState.PRINT_JOB_COMPLETED_CANCELLED){
        name = 'print_job_cancelled'
      }
    } else if(this.mPrintJob.jobState === PrintJobState.PRINT_JOB_CANCELLING) {
      name = 'print_job_cancelling'
    } else {
      name = 'print_job_blocked'
    }
    return StringUtil.getString(name)
  }

  checkBlocked(){
    if (this.mPrintJob.jobState === undefined) {
      return
    }
    if (this.mPrintJob.jobState === PrintJobState.PRINT_JOB_BLOCKED) {
      this.isBlocked = true
      let subState = this.mPrintJob.jobSubState
      if (subState === PrintJobSubState.PRINT_JOB_BLOCK_DOOR_OPEN) {
        this.blockedReason = StringUtil.getString('printer_door_open')
      } else if (subState === PrintJobSubState.PRINT_JOB_BLOCK_BUSY) {
        this.blockedReason = StringUtil.getString('printer_busy')
      } else if (subState === PrintJobSubState.PRINT_JOB_BLOCK_JAMMED) {
        this.blockedReason = StringUtil.getString('printer_jammed')
      } else if (subState === PrintJobSubState.PRINT_JOB_BLOCK_LOW_ON_INK) {
        this.blockedReason = StringUtil.getString('printer_low_on_ink')
      } else if (subState === PrintJobSubState.PRINT_JOB_BLOCK_OFFLINE) {
        this.blockedReason = StringUtil.getString('printer_offline')
      } else if (subState === PrintJobSubState.PRINT_JOB_BLOCK_LOW_ON_TONER) {
        this.blockedReason = StringUtil.getString('printer_low_on_toner')
      } else if (subState === PrintJobSubState.PRINT_JOB_BLOCK_OUT_OF_INK) {
        this.blockedReason = StringUtil.getString('printer_out_of_ink')
      } else if (subState === PrintJobSubState.PRINT_JOB_BLOCK_OUT_OF_PAPER) {
        this.blockedReason = StringUtil.getString('printer_out_of_paper')
      } else if (subState === PrintJobSubState.PRINT_JOB_BLOCK_OUT_OF_TONER) {
        this.blockedReason = StringUtil.getString('printer_out_of_toner')
      } else if (subState === PrintJobSubState.PRINT_JOB_BLOCK_REALLY_LOW_ON_INK) {
        this.blockedReason = StringUtil.getString('printer_out_of_ink')
      } else if (subState === PrintJobSubState.PRINT_JOB_BLOCK_SERVICE_REQUEST) {
        this.blockedReason = StringUtil.getString('printer_check')
      } else if (subState === PrintJobSubState.PRINT_JOB_BLOCK_BAD_CERTIFICATE) {
        this.blockedReason = StringUtil.getString('printer_bad_certificate')
      }
      Log.debug(TAG,'checkBlocked: blockedReason = '+this.blockedReason)
    }else{
      this.isBlocked = false
      Log.info(TAG,'checkBlocked: not blocked jobState = '+this.mPrintJob.jobState)
    }
  }

}

/**
 * Block Tips
 */
export interface BlockTips {
  isJobBlocked:boolean;
  blockedReason:string;
  textColor:Resource;
  imageRes:Resource;
}
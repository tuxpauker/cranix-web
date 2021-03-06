import { Component, OnInit, OnDestroy, ViewChild, AfterContentInit, AfterViewInit, AfterViewChecked } from '@angular/core';
import { AuthenticationService } from 'src/app/services/auth.service';
import { Room, AccessStatus, AccessInRooms, SmartRoom, EduRoom } from 'src/app/shared/models/data-model';
import { EductaionService } from 'src/app/services/education.service';
import { takeWhile } from 'rxjs/operators';
import { Observable } from 'rxjs/internal/Observable';
import { TranslateService } from '@ngx-translate/core';
import { PopoverController, IonSelect, ModalController } from '@ionic/angular';
import { ActionsComponent } from 'src/app/shared/actions/actions.component';
import { JsonPipe } from '@angular/common';
import { GenericObjectService } from 'src/app/services/generic-object.service';
import { FilesCollectComponent } from 'src/app/shared/actions/files-collect/files-collect.component';
import { FilesUploadComponent } from 'src/app/shared/actions/files-upload/files-upload.component';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'cranix-room-control',
  templateUrl: './room-control.component.html',
  styleUrls: ['./room-control.component.scss'],
})
export class RoomControlComponent implements OnInit, OnDestroy, AfterViewInit {

  alive = true;

  direct: boolean;
  login: boolean;
  portal: boolean;
  printing: boolean;
  proxy: boolean;

  devices = [1, 2, 3, 4, 5, 6]
  room: EduRoom;

  selectedRoomId: number;

  rooms: Observable<Room[]>;

  gridSize: number = 2;
  @ViewChild('roomSelect') selectRef: IonSelect;

  gridSizes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

  roomStatusSub: Subscription;

  constructor(
    public authS: AuthenticationService,
    private eduS: EductaionService,
    public popoverCtrl: PopoverController,
    public modalController: ModalController,
    private objectS: GenericObjectService
  ) {
    this.rooms = this.eduS.getMyRooms();
  }
  ngOnInit() {
  }

  ngAfterViewInit() {

    if (this.authS.session.roomId) {
      this.selectedRoomId = parseInt(this.authS.session.roomId);
      this.statusTimer();
    } else if (!this.room && !this.authS.session.roomId) {
      this.openSelect();
    }
  }

  statusTimer() {
    this.roomStatusSub = interval(5000).pipe(takeWhile(() => this.alive)).subscribe((func => {
      this.getRoomStatus();
    }))
  }
  getRoomStatus() {
    this.eduS.getRoomById(this.selectedRoomId)
      .pipe(takeWhile(() => this.alive))
      .subscribe(res => {
        this.room = res
        console.log(`Rooms is: ${this.room.name}`)
      });
  }
  array(n: number): any[] {
    return Array(n);
  }

  sizeChange(ev) {
    console.log('event is: ', ev);
  }
  click() {
    console.log("Cliked");
  }

  getDevice(r, p) {
    return this.room.devices.find(e => e.row === r && e.place === p);
  }

  selectChanged(ev) {
    console.log(`Select roomId is: ${this.selectedRoomId}`)
    this.statusTimer();
  }
  openSelect() {
    this.selectRef.open();
  }

  /**
   * Opens an action menue for the content
   * @param ev 
   */
  async openAction(ev) {
    const popover = await this.popoverCtrl.create({
      component: ActionsComponent,
      event: ev,
      componentProps: {
        objectType: "education/room",
        objectIds: [this.room.id]
      },
      animated: true,
      showBackdrop: true
    });
    (await popover).present();
  }
  setAccess(type: string) {
    switch (type) {
      case 'login':
        this.room.accessInRooms.login = !this.room.accessInRooms.login;
        break;
      case 'proxy':
        this.room.accessInRooms.proxy = !this.room.accessInRooms.proxy;
        break;
      case 'direct':
        this.room.accessInRooms.direct = !this.room.accessInRooms.direct;
        break;
      case 'printing':
        this.room.accessInRooms.proxy = !this.room.accessInRooms.proxy;
        break;
    }
    let status: AccessInRooms = {
      accessType: "FW",
      roomId: this.room.id,
      printing: this.room.accessInRooms.printing,
      proxy: this.room.accessInRooms.proxy,
      portal: this.room.accessInRooms.portal,
      direct: this.room.accessInRooms.direct,
      login: this.room.accessInRooms.login
    }
    this.eduS.setAccessStatus(this.room.accessInRooms)
      .pipe(takeWhile(() => this.alive))
      .subscribe((res) => {
        console.log(JSON.stringify(res));
        this.objectS.responseMessage(res);
      }, err => {
        this.objectS.errorMessage(err);
      })
  }

  /**
   * Share the files in the room.
   */
  async onBTNSHARE() {
    const modal = await this.modalController.create({
      component: FilesUploadComponent,
      cssClass: 'small-modal',
      animated: true,
      swipeToClose: true,
      showBackdrop: true,
      componentProps: {
        objectType: "room",
        actionMap: { objectIds: [this.selectedRoomId] }
      }
    });
    (await modal).present();
  }
  /*
   *  Collect the files from the room
   */
  async onBTNCOLLECT() {
    const modal = await this.modalController.create({
      component: FilesCollectComponent,
      cssClass: 'small-modal',
      animated: true,
      swipeToClose: true,
      showBackdrop: true,
      componentProps: {
        objectType: "room",
        actionMap: { objectIds: [this.selectedRoomId] }
      }
    });
    (await modal).present();
    console.log('collect')
  }
  ngOnDestroy() {
    this.alive = false;
  }
}

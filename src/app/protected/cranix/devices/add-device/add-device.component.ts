import { Component, OnInit, Input, OnDestroy } from '@angular/core';
//own stuff
import { DevicesService } from 'src/app/services/devices.service';
import { GenericObjectService } from 'src/app/services/generic-object.service';
import { RoomsService } from 'src/app/services/rooms.service';
import { Device, Room, Hwconf } from 'src/app/shared/models/data-model';
import { ModalController } from '@ionic/angular';
import { LanguageService } from 'src/app/services/language.service';
import { AuthenticationService } from 'src/app/services/auth.service';
import { SelfManagementService } from 'src/app/services/selfmanagement.service';
import { takeWhile } from 'rxjs/operators';
import { Observable } from 'rxjs/internal/Observable';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';


@Component({
  selector: 'cranix-add-device',
  templateUrl: './add-device.component.html',
  styleUrls: ['./add-device.component.scss'],
})
export class AddDeviceComponent implements OnInit, OnDestroy {

  alive: boolean = true;
  ipAdresses: string[];
  deviceNames = {};
  roomId: number;
  name: string = "";
  device: Device = new Device();
  roomsToSelect: Room[] = [];
  addDeviceForm: FormGroup;
  hwConfs: Observable<Hwconf[]>;
  disabled: boolean = false;

  @Input() addHocRooms: Room[];
  @Input() public rooms: Room;

  constructor(
    public authService: AuthenticationService,
    public deviceService: DevicesService,
    public languageService: LanguageService,
    public modalCtrl: ModalController,
    public objectService: GenericObjectService,
    public roomService: RoomsService,
    private fb: FormBuilder,
    private selfS: SelfManagementService
  ) {
  }

  ngOnInit() {
    console.log('room is, :::', this.rooms);
    if (!this.addHocRooms) {
      console.log('no AddHOC')
      this.addDeviceForm = this.fb.group({
        ip: [, Validators.required],
        name: [],
        roomId: [],
        wlanMac: ['', Validators.pattern(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/)],
        hwconfId: [, Validators.required],
        serial: [''],
        inventary: [''],
        row: [''],
        place: [''],
        mac: ['', Validators.compose([Validators.pattern(/^((([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})))/), Validators.required])],

      });
      this.hwConfs = this.objectService.getObjects('hwconf');
    } else {
      this.addDeviceForm = this.fb.group({
        name: ['', Validators.required],
        mac: ['', Validators.compose([Validators.pattern(/^((([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})))/), Validators.required])],
        ip: [{ value: null, disabled: true }],
        roomId: [{ value: this.addHocRooms[0].id }, Validators.required],
        wlanMac: [{ value: null, disabled: true }],
        hwconfId: [{ value: this.addHocRooms[0].hwconfId, disabled: true }, Validators.required],
        serial: [{ value: null, disabled: true }],
        inventary: [{ value: null, disabled: true }],
        row: [{ value: null, disabled: true }],
        place: [{ value: null, disabled: true }],
      });
      console.log('AddhocRooms', this.addDeviceForm)
    }
    if (this.addHocRooms) {
      this.selfS.getMyRooms().subscribe(
        (val) => { this.roomsToSelect = val; }
      )
    } else {
      this.roomService.getRoomsToRegister().subscribe(
        (val) => { this.roomsToSelect = val; }
      )
      if (this.rooms) {
        this.roomId = this.rooms.id;
        this.addDeviceForm.controls['roomId'].patchValue(this.roomId);
        this.addDeviceForm.controls['roomId'].disable();
        this.addDeviceForm.controls['hwconfId'].patchValue(this.rooms.hwconfId);
        this.roomService.getAvailiableIPs(this.roomId)
          .pipe(takeWhile(() => this.alive))
          .subscribe((res) => {
            this.ipAdresses = res;
          })
      }
    }
  }

  public ngAfterViewInit() {
    while (document.getElementsByTagName('mat-tooltip-component').length > 0) { document.getElementsByTagName('mat-tooltip-component')[0].remove(); }
    console.log('After view:', this.addHocRooms);
  }

  onSubmit(devices: Device) {
    console.log('devices', devices);
    this.objectService.requestSent()
    this.disabled = true;
    if (this.addHocRooms) {
      devices.roomId = this.roomId;
      console.log('adding Addoc', devices);
      this.selfS.addDevice(devices)
        .pipe(takeWhile(() => this.alive))
        .subscribe((res) => {
          this.objectService.responseMessage(res);
          if (res.code == "OK") {
            this.modalCtrl.dismiss();
          }
        },
          (err) => { },
          () => { this.disabled = false; })
    } else {
      let newDevice = [];
      let macs = devices.mac.split('\n');
      let startIndex = this.ipAdresses.indexOf(devices.ip);
      if (macs.length == 1) {
        newDevice[0] = {
          name: devices.name,
          ip: this.ipAdresses[startIndex].split(' ')[0],
          mac: macs[0],
          hwconfId: devices.hwconfId,
          roomId: this.roomId
        }
      } else {
        for (let x = 0; x < macs.length; x++) {
          newDevice[x] = {
            name: this.ipAdresses[startIndex + x].split(' ')[1],
            ip: this.ipAdresses[startIndex + x].split(' ')[0],
            mac: macs[x],
            hwconfId: devices.hwconfId,
            roomId: this.roomId
          }
        }
      }
      this.roomService.addDevice(newDevice, this.roomId)
        .pipe(takeWhile(() => this.alive))
        .subscribe((responses) => {
          let response = this.languageService.trans("List of the results:");
          for (let resp of responses) {
            response = response + "<br>" + this.languageService.transResponse(resp);
          }
          this.objectService.okMessage(response)
          this.objectService.getAllObject('device');
        },
          (err) => {
            this.objectService.errorMessage(err)
          },
          () => {
            this.disabled = false;
            this.modalCtrl.dismiss()
          })
    }
  }

  ipChanged(ev) {
    this.addDeviceForm.controls['name'].patchValue(ev.detail.value.split(" ")[1])
  }

  roomChanged(ev) {
    console.log('rooms is: ', ev);
    this.roomId = ev.value.id;
    this.addDeviceForm.controls['hwconfId'].patchValue(ev.value.hwconfId);
    if (!this.addHocRooms) {
      this.roomService.getAvailiableIPs(ev.value.id)
        .pipe(takeWhile(() => this.alive))
        .subscribe((res) => {
          this.ipAdresses = res;
        })

    }
  }
  /**   onFormValuesChanged() {
      console.log('Form value is: ', this.addDeviceForm);
    }**/
  ngOnDestroy() {
    this.alive = false;
  }
}

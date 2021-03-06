import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { IonicSelectableComponent } from 'ionic-selectable';

//Own stuff
import { GenericObjectService } from 'src/app/services/generic-object.service';
import { CephalixService } from 'src/app/services/cephalix.service';
import { Institute } from 'src/app/shared/models/cephalix-data-model';
import { AuthenticationService } from 'src/app/services/auth.service';
import { User } from 'src/app/shared/models/data-model';
@Component({
  selector: 'cranix-institute-edit',
  templateUrl: './institute-edit.component.html',
  styleUrls: ['./institute-edit.component.scss'],
})
export class InstituteEditComponent implements OnInit {
  editForm;
  object: Institute = null;
  objectKeys: string[] = [];
  isourl: string = "";
  managerIds: number[] = [];
  managers: User[] = [];
  users: User[] = [];
  constructor(
    public authService: AuthenticationService,
    public cephalixService: CephalixService,
    public translateService: TranslateService,
    public objectService: GenericObjectService
  ) {
    this.object = this.objectService.selectedObject;
    this.cephalixService.getUsersFromInstitute(this.object.id).subscribe(
      (val) => {
        for (let man of val) {
          this.managerIds.push(man.id)
          this.managers.push(man)
        }
        console.log(this.managerIds)
      },
      (err) => { console.log(err) },
      () => {
        this.objectService.getObjects('user').subscribe(
          obj => {
            for (let user of obj) {
              if (user.role.toLowerCase() == "reseller" || user.role == "sysadmins") {
                this.users.push(user)
              }
            }
          }
        )
      }
    )
    if (this.objectService.cephalixDefaults.createIsoBy && this.objectService.cephalixDefaults.createIsoBy == 'regCode') {
      this.isourl = this.object.regCode;
    } else {
      this.isourl = this.object.uuid;
    }
    let institute = new Institute();
    if (!this.authService.isAllowed("customer.manage")) {
      delete institute.cephalixCustomerId;
    }
    this.objectKeys = Object.getOwnPropertyNames(institute);
    console.log("InstituteEditComponent:" + this.object.id);
  }

  ngOnInit() { }

  public ngAfterViewInit() {
    while (document.getElementsByTagName('mat-tooltip-component').length > 0) { document.getElementsByTagName('mat-tooltip-component')[0].remove(); }
  }
  onSubmit(form) {
    form['id'] = this.object.id;
    console.log(form)
    this.objectService.modifyObjectDialog(form, "institute");
  }

  compareFn(o1: User, o2: User | User[]) {
    if (!o1 || !o2) {
      return o1 === o2;
    }
    if (Array.isArray(o2)) {
      return o2.some((u: User) => u.id === o1.id);
    }
    return o1.id === o2.id;
  }

  setNextDefaults() {
    let subs = this.cephalixService.getNextDefaults().subscribe(
      (val) => {
        for (let key of this.objectKeys) {
          if (!this.object[key] && val[key]) {
            this.object[key] = val[key];
          }
        }
        this.ngOnInit();
      },
      (err) => { console.log(err) },
      () => { subs.unsubscribe() }
    )
  }

  writeConfig() {
    this.objectService.requestSent();
    let subs = this.cephalixService.writeConfig(this.object.id).subscribe(
      (serverResponse) => {
        this.objectService.responseMessage(serverResponse);
      },
      (err) => { console.log(err) },
      () => { subs.unsubscribe() }
    )
  }
  delete(ev: Event) {
    this.objectService.deleteObjectDialog(this.object, 'institute', '');
  }
  managerChanged(ev) {
    let newIds: number[]= [];
    for( let user of ev.detail.value ) {
      newIds.push(user.id)
    }
    console.log(this.managerIds);
    console.log(newIds)
    for (let id of this.managerIds) {
      if (newIds.indexOf(id) == -1) {
        this.cephalixService.deleteUserFromInstitute(id, this.object.id).subscribe(
          val => this.objectService.responseMessage(val)
        )
      }
    }
    for (let id of newIds) {
      if (this.managerIds.indexOf(id) == -1) {
        this.cephalixService.addUserToInstitute(id, this.object.id).subscribe(
          val => this.objectService.responseMessage(val)
        )
      }
    }
  }
}

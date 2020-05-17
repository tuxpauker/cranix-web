import { Component, OnInit } from '@angular/core';


import { GenericObjectService } from 'src/app/services/generic-object.service';
import { LanguageService} from 'src/app/services/language.service';
import { SystemConfig } from 'src/app/shared/models/data-model';
import { SystemService } from 'src/app/services/system.service';
@Component({
  selector: 'cranix-system-config',
  templateUrl: './system-config.component.html',
  styleUrls: ['./system-config.component.scss'],
})
export class SystemConfigComponent implements OnInit {

  configs: SystemConfig[] = [];
  toShow = "Basic";
  constructor(
    public objectService: GenericObjectService,
    public languageService: LanguageService,
    public systemService: SystemService
  ) { }

  ngOnInit() {
    let sub = this.systemService.getSystemConfiguration().subscribe(
      (val) => { this.configs = val },
      (err) => { console.log(err) },
      () => { sub.unsubscribe() }
    )
  }

  segmentChanged(event) {
      this.toShow = event.detail.value;
  }
  save(key: string){
    let sub = this.systemService.setSystemConfigValue(key,(<HTMLInputElement>document.getElementById(key)).value).subscribe(
      (val) => { if ( val.code == "OK") {
        this.objectService.okMessage(this.languageService.trans(val.value))
      } else {
        this.objectService.errorMessage(this.languageService.trans(val.value))
      }},
      (err) => {
        this.objectService.errorMessage(err);
      },
      ()=> {sub.unsubscribe()}
    )
  }

  togle(key: string, checked: boolean){
    let sub = this.systemService.setSystemConfigValue(key, checked ? "yes" : "no").subscribe(
      (val) => { if ( val.code == "OK") {
        this.objectService.okMessage(this.languageService.trans(val.value))
      } else {
        this.objectService.errorMessage(this.languageService.trans(val.value))
      }},
      (err) => {
        this.objectService.errorMessage(err);
      },
      ()=> {sub.unsubscribe()}
    )
  }
}

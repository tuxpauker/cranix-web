import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

//Own stuff
import { ActionBTNRenderer } from 'src/app/pipes/ag-action-renderer';
import { AuthenticationService } from 'src/app/services/auth.service';
import { LanguageService } from 'src/app/services/language.service';
import { SoftwareService } from 'src/app/services/softwares.service'
import { Installation } from 'src/app/shared/models/data-model';

@Component({
  selector: 'cranix-software-sets',
  templateUrl: './software-sets.component.html',
  styleUrls: ['./software-sets.component.scss'],
})
export class SoftwareSetsComponent implements OnInit {
  context;
  memberOptions;
  columnDefs = [];
  memberApi;
  memberColumnApi;
  memberSelection: Installation[] = [];
  memberData: Installation[] = [];
  autoGroupColumnDef;
  institute;
  selectedList: string[] = [];

  constructor(
    public authService: AuthenticationService,
    public router: Router,
    public softwareService: SoftwareService,
    private languageS: LanguageService
    ) {
    this.context = { componentParent: this };
    this.memberOptions = {
      defaultColDef: {
        resizable: true,
        sortable: true,
        hide: false
      },
      columnDefs: this.columnDefs,
      context: this.context,
      rowSelection: 'multiple'
    }
   }

  ngOnInit() {
    this.createColumnDefs();
    this.readMembers();
  }
  onMemberReady(params) {
    this.memberApi = params.api;
    this.memberColumnApi = params.columnApi;
    (<HTMLInputElement>document.getElementById("memberTable")).style.height = Math.trunc(window.innerHeight * 0.70) + "px";
  }

  onMemberSelectionChanged() {
    this.memberSelection = this.memberApi.getSelectedRows();
  }

  onMemberFilterChanged() {
    this.memberApi.setQuickFilter((<HTMLInputElement>document.getElementById("memberFilter")).value);
    this.memberApi.doLayout();
  }

  onResize(ev: Event) {
    (<HTMLInputElement>document.getElementById("memberTable")).style.height = Math.trunc(window.innerHeight * 0.70) + "px";
    //this.sizeAll();
  }
  sizeAll() {
    var allColumnIds = [];
    this.memberColumnApi.getAllColumns().forEach((column) => {
      allColumnIds.push(column.getColId());
    });
    this.memberColumnApi.autoSizeColumns(allColumnIds);
  }
  readMembers() {
    let subM = this.softwareService.getSoftwareStatus().subscribe(
      (val) => { this.memberData = val; console.log(val) },
      (err) => { console.log(err) },
      () => { subM.unsubscribe() });
  }
  createColumnDefs() {
    this.columnDefs = [
      {
        field: 'name',
        width: 200,
        pinned: 'left',
        headerName: this.languageS.trans('name')
      }, {
        headerName: "",
        width: 100,
        suppressSizeToFit: true,
        cellStyle: { 'padding': '2px', 'line-height': '36px' },
        field: 'actions',
        pinned: 'left',
        cellRendererFramework: ActionBTNRenderer
      },
      {
        field: 'description',
        headerName: this.languageS.trans('description'),
      },
      {
        field: 'softwares',
        headerName: this.languageS.trans('softwares'),
      },
      {
        field: 'hwconfs',
        headerName: this.languageS.trans('hwconfs'),
      },
      {
        field: 'rooms',
        headerName: this.languageS.trans('rooms'),
      },
      {
        field: 'devices',
        headerName: this.languageS.trans('devices')
      }
    ];
  }
  addSet(){
    this.router.navigate(['/pages/cranix/softwares/add-set']);
  }
  writeConfig(){
    //TODO
  }
  applyState(){
    //TODO
  }
}

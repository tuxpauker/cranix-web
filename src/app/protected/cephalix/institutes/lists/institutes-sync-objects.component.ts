import { Component, OnInit } from '@angular/core';

//Own stuff
import { CephalixService } from 'src/app/services/cephalix.service';
import { GenericObjectService } from 'src/app/services/generic-object.service';
import { LanguageService } from 'src/app/services/language.service';
import { Institute, SynchronizedObject } from 'src/app/shared/models/cephalix-data-model';

@Component({
  selector: 'cranix-institutes-sync-objects',
  templateUrl: './institutes-sync-objects.component.html'
})
export class InstitutesSyncObjectsComponent implements OnInit {

  context;
  memberOptions;
  columnDefs = [];
  memberApi;
  memberColumnApi;
  memberSelected: SynchronizedObject[] = [];
  memberData: SynchronizedObject[] = [];
  autoGroupColumnDef;
  institute;
  selectedList: string[] = [];

  constructor(
    private cephalixService: CephalixService,
    private objectService: GenericObjectService,
    private languageS: LanguageService
  ) {
    this.institute = <Institute>this.objectService.selectedObject;

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
    this.columnDefs = [
      {
        field: 'objectType',
        rowGroup: true, 
        hide: true,
        valueGetter: function(params) {
          return  params.context['componentParent'].languageS.trans(params.data.objectType + "s");
        }
      },
      {
        headerName: this.languageS.trans('name'),
        field: 'objectName',
      }
    ];
    this.autoGroupColumnDef = { 
      headerName: this.languageS.trans('objectType'),
      field: 'objectType',
      headerCheckboxSelection: false,
      headerCheckboxSelectionFilteredOnly: true,
      checkboxSelection: true,
      valueGetter: function(params) { return " ";   },
      minWidth: 250 
    };
  }

  ngOnInit() {
    this.readMembers();
  }

  onMemberReady(params) {

    this.memberApi = params.api;
    this.memberColumnApi = params.columnApi;
    (<HTMLInputElement>document.getElementById("memberTable")).style.height = Math.trunc(window.innerHeight * 0.70) + "px";
  }

  onMemberSelectionChanged() {
    this.memberSelected = this.memberApi.getSelectedRows();
  }

  onMemberFilterChanged() {
    this.memberApi.setQuickFilter((<HTMLInputElement>document.getElementById("memberFilter")).value);
    this.memberApi.doLayout();
  }

  onResize($event) {
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
    let subM = this.cephalixService.getObjectsToSynchronize().subscribe(
      (val) => { this.memberData = val; console.log(val) },
      (err) => { console.log(err) },
      () => { subM.unsubscribe() });
  }

}
import { Component, OnInit, ɵSWITCH_RENDERER2_FACTORY__POST_R3__, AfterContentInit } from '@angular/core';
import { GridOptions, GridApi, ColumnApi } from 'ag-grid-community';
import { PopoverController, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';

//own modules
import { ActionsComponent } from 'src/app/shared/actions/actions.component';
import { DateCellRenderer } from 'src/app/pipes/ag-date-renderer';
import { ActionBTNRenderer } from 'src/app/pipes/ag-action-renderer';
import { ObjectsEditComponent } from 'src/app/shared/objects-edit/objects-edit.component';
import { GenericObjectService } from 'src/app/services/generic-object.service';
import { LanguageService } from 'src/app/services/language.service';
import { SelectColumnsComponent } from 'src/app/shared/select-columns/select-columns.component';
import { Institute } from 'src/app/shared/models/cephalix-data-model'

@Component({
  selector: 'cranix-institutes',
  templateUrl: './institutes.component.html',
  styleUrls: ['./institutes.component.scss'],
})
export class InstitutesComponent implements OnInit {
  objectKeys: string[] = [];
  displayedColumns: string[] = ['name', 'uuid', 'locality', 'ipVPN', 'regCode', 'validity', 'actions'];
  sortableColumns: string[] = ['uuid', 'name', 'locality', 'ipVPN', 'regCode', 'validity'];
  gridOptions: GridOptions;
  columnDefs = [];
  gridApi: GridApi;
  columnApi: ColumnApi;
  rowSelection;
  context;
  selected: Institute[];
  title = 'app';
  rowData = [];
  objectIds: number[] = [];

  constructor(
    private objectService: GenericObjectService,
    public modalCtrl: ModalController,
    public popoverCtrl: PopoverController,
    public languageS: LanguageService,
    public route: Router,
    private storage: Storage
  ) {
    this.context = { componentParent: this };
    this.objectKeys = Object.getOwnPropertyNames(new Institute());
    this.createColumnDefs();
    this.gridOptions = <GridOptions>{
      defaultColDef: {
        resizable: true,
        sortable: true,
        hide: false
      },
      columnDefs: this.columnDefs,
      context: this.context,
      rowSelection: 'multiple',
     // domLayout: 'autoHeight',
      rowHeight: 35
    }
  }

  ngOnInit() {
    this.storage.get('InstitutesComponent.displayedColumns').then((val) => {
      let myArray = JSON.parse(val);
      if (myArray) {
        this.displayedColumns = (myArray).concat(['actions']);
        this.createColumnDefs();
      }
    });
    this.objectService.getObjects('institute').subscribe(obj => this.rowData = obj);
  }

  createColumnDefs() {
    let columnDefs = [];
    for (let key of this.objectKeys) {
      let col = {};
      col['field'] = key;
      col['headerName'] = this.languageS.trans(key);
      col['hide'] = (this.displayedColumns.indexOf(key) == -1);
      col['sortable'] = (this.sortableColumns.indexOf(key) != -1);
      col['minWidth'] = 110;
     // col['cellClass'] = 'aggrid-cell-center';
      switch (key) {
        case 'name': {
          col['headerCheckboxSelection'] = true;
          col['headerCheckboxSelectionFilteredOnly'] = true;
          col['checkboxSelection'] = true;
          col['width'] = 220;
          col['cellStyle'] = { 'padding-left' : '2px'};
          col['suppressSizeToFit'] = true;
          col['pinned'] = 'left';
          break;
        }
        case 'validity': {
          col['cellRendererFramework'] = DateCellRenderer;
          break;
        }
        case 'recDate': {
          col['cellRendererFramework'] = DateCellRenderer;
          break;
        }
      }
      columnDefs.push(col);
    }
    columnDefs.push({
      headerName: "",
      width: 100,
      suppressSizeToFit: true,
      cellStyle: { 'padding' : '2px', 'line-height' :'36px'},
      field: 'actions',
      pinned: 'right',
      cellRendererFramework: ActionBTNRenderer
    });
    this.columnDefs = columnDefs;
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
   // (<HTMLInputElement>document.getElementById("agGridTable")).style.height = Math.trunc(window.innerHeight * 0.75) + "px";
    //this.gridApi.sizeColumnsToFit();
   /* window.addEventListener('resize', function() {
      setTimeout(function() {
        params.api.sizeColumnsToFit();
        //this.sizeAll();
      });
    });*/

    
  }
  onSelectionChanged() {
    this.selected = this.gridApi.getSelectedRows();
  }

  onQuickFilterChanged() {
    this.gridApi.setQuickFilter((<HTMLInputElement>document.getElementById("quickFilter")).value);
    this.gridApi.doLayout();

  }
  /*onResize($event) {
   // (<HTMLInputElement>document.getElementById("agGridTable")).style.height = Math.trunc(window.innerHeight * 0.75) + "px";
    this.sizeAll();
    this.gridApi.sizeColumnsToFit();
  }*/
  onGridSizeChange(params){
    var allColumns = params.columnApi.getAllColumns();
    params.api.sizeColumnsToFit();

  }
  sizeAll() {
    var allColumnIds = [];
    this.columnApi.getAllColumns().forEach((column) => {
      allColumnIds.push(column.getColId());
    });
    this.columnApi.autoSizeColumns(allColumnIds);
  }

  public redirectToDelete = (institute: Institute) => {
    this.objectService.deleteObjectDialog(institute, 'institute')
  }
  /**
 * Open the actions menu with the selected object ids.
 * @param ev
 */
  async openActions(ev: any) {
    if (this.selected) {
      for (let i = 0; i < this.selected.length; i++) {
        this.objectIds.push(this.selected[i].id);
      }
    }
    const popover = await this.popoverCtrl.create({
      component: ActionsComponent,
      event: ev,
      componentProps: {
        objectType: "institute",
        objectIds: this.objectIds,
        selection: this.selected
      },
      animated: true,
      showBackdrop: true
    });
    (await popover).present();
  }
  async redirectToEdit(ev: Event, institute: Institute) {
    if (institute) {
      this.objectService.selectedObject = institute;
      this.route.navigate(['/pages/cephalix/institutes/' + institute.id]);
    } else {
      const modal = await this.modalCtrl.create({
        component: ObjectsEditComponent,
        componentProps: {
          objectType: "institute",
          objectAction: 'add',
          object: new Institute(),
          objectKeys: this.objectKeys
        },
        animated: true,
        swipeToClose: true,
        showBackdrop: true
      });
      modal.onDidDismiss().then((dataReturned) => {
        if (dataReturned.data) {
          console.log("Object was created or modified", dataReturned.data)
        }
      });
      (await modal).present();
    }
  }

  /**
  * Function to select the columns to show
  * @param ev
  */
    async openCollums(ev: any) {
      const modal = await this.modalCtrl.create({
        component: SelectColumnsComponent,
        componentProps: {
          columns: this.objectKeys,
          selected: this.displayedColumns,
          objectPath: "InstitutesComponent.displayedColumns"
        },
        animated: true,
        swipeToClose: true,
        backdropDismiss: false
      });
      modal.onDidDismiss().then((dataReturned) => {
        if (dataReturned.data) {
          this.displayedColumns = (dataReturned.data).concat(['actions']);
          this.createColumnDefs();
        }
      });
      (await modal).present().then((val) => {
        console.log("most lett vegrehajtva.")
      })
    }
  }

import { Component, OnInit, ɵSWITCH_RENDERER2_FACTORY__POST_R3__ } from '@angular/core';
import { GridOptions, GridApi, ColumnApi } from 'ag-grid-community';
import { PopoverController, ModalController } from '@ionic/angular';
import { Storage } from '@ionic/storage';

//own modules
import { ActionsComponent } from '../../../shared/actions/actions.component';
import { DateCellRenderer } from '../../../pipes/ag-date-renderer';
import { ActionBTNRenderer } from '../../../pipes/ag-action-renderer';
import { ObjectsEditComponent } from '../../../shared/objects-edit/objects-edit.component';
import { GenericObjectService } from '../../../services/generic-object.service';
import { LanguageService } from '../../../services/language.service';
import { SelectColumnsComponent } from '../../../shared/select-columns/select-columns.component';
import { Customer, Institute } from '../../../shared/models/cephalix-data-model'

@Component({
  selector: 'cranix-customers',
  templateUrl: './customers.page.html',
  styleUrls: ['./customers.page.scss'],
})
export class CustomersPage implements OnInit {
  objectKeys: string[] = [];
  displayedColumns: string[] = ['name', 'uuid', 'locality', 'ipVPN', 'regCode', 'validity', 'actions'];
  sortableColumns: string[] = ['name', 'uuid', 'locality', 'ipVPN', 'regCode', 'validity'];
  gridOptions: GridOptions;
  columnDefs = [];
  gridApi: GridApi;
  columnApi: ColumnApi;
  rowSelection;
  context;
  selected: Customer[];
  title = 'app';
  rowData = [];
  objectIds: number[] = [];

  constructor(
    public objectService: GenericObjectService,
    public modalCtrl: ModalController,
    public popoverCtrl: PopoverController,
    public languageS: LanguageService,
    private storage: Storage
  ) {
    this.objectKeys = Object.getOwnPropertyNames(new Customer());
    this.createColumnDefs();
    this.gridOptions = <GridOptions>{
      defaultColDef: {
        resizable: true,
        sortable: true,
        hide: false
      },
      columnDefs: this.columnDefs,
      context: this.context,
      rowHeight: 35
    }
    this.context = { componentParent: this };
    this.rowSelection = 'multiple';

  }
  ngOnInit() {
    this.storage.get('CustomersPage.displayedColumns').then((val) => {
      let myArray = JSON.parse(val);
      if (myArray) {
        this.displayedColumns = ['select'].concat(myArray).concat(['actions']);
        this.createColumnDefs();
      }
    });
    this.objectService.getObjects('customer').subscribe(obj => this.rowData = obj);
  }

  createColumnDefs() {
    let columnDefs = [];
    for (let key of this.objectKeys) {
      let col = {};
      col['field'] = key;
      col['headerName'] = this.languageS.trans(key);
      col['hide'] = (this.displayedColumns.indexOf(key) == -1);
      col['sortable'] = (this.displayedColumns.indexOf(key) == -1);
      switch (key) {
        case 'name': {
          col['headerCheckboxSelection'] = true;
          col['headerCheckboxSelectionFilteredOnly'] = true;
          col['checkboxSelection'] = true;
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
      field: 'actions',
      cellRendererFramework: ActionBTNRenderer
    });
    this.columnDefs = columnDefs;
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
    (<HTMLInputElement>document.getElementById("agGridTable")).style.height = Math.trunc(window.innerHeight * 0.7) + "px";
    this.gridApi.sizeColumnsToFit();
  }
  onSelectionChanged() {
    this.selected = this.gridApi.getSelectedRows();
  }

  onQuickFilterChanged() {
    this.gridApi.setQuickFilter((<HTMLInputElement>document.getElementById("quickFilter")).value);
    this.gridApi.doLayout();

  }
  onResize($event) {
    (<HTMLInputElement>document.getElementById("agGridTable")).style.height = Math.trunc(window.innerHeight * 0.75) + "px";
    this.sizeAll();
    this.gridApi.sizeColumnsToFit();
  }
  sizeAll() {
    var allColumnIds = [];
    this.columnApi.getAllColumns().forEach((column) => {
      allColumnIds.push(column.getColId());
    });
    this.columnApi.autoSizeColumns(allColumnIds);
  }

  public redirectToDelete = (customer: Customer) => {
    this.objectService.deleteObjectDialog(customer, 'customer')
  }
  /**
 * Open the actions menu with the selected object ids.
 * @param ev 
 */
  async redirectToAddInstitute(ev: any) {

    if( !this.selected) {
      this.objectService.selectObject();
      return;
    }
    if (this.selected.length > 1) {
      //TODO Warning
      return;
    }
    let institute = new Institute();
    institute.cephalixCustomerId = this.selected[0].id;
    const modal = await this.modalCtrl.create({
      component: ObjectsEditComponent,
      componentProps: {
        objectType: "institute",
        objectAction: "add",
        object: institute,
        objectKeys: Object.getOwnPropertyNames(institute)
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
  async redirectToEdit(ev: Event, customer: Customer) {
    let action = 'modify';
    if (customer == null) {
      customer = new Customer();
      action = 'add';
    }
    const modal = await this.modalCtrl.create({
      component: ObjectsEditComponent,
      componentProps: {
        objectType: "customer",
        objectAction: action,
        object: customer,
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
        objectPath: "CustomersPage.displayedColumns"
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

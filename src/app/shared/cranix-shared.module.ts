import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatTableModule,
  MatStepperModule,
  MatButtonModule,
  MatCheckboxModule,
  MatFormFieldModule,
  MatInputModule,
  MatOptionModule,
  MatSelectModule,
  MatIconModule,
  MatPaginatorModule,
  MatSortModule,
} from "@angular/material";
import { ToolbarComponent } from '../protected/toolbar/toolbar.component';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';



@NgModule({
  declarations: [ToolbarComponent],
  imports: [
  FormsModule,
  IonicModule,
  MatTableModule,
  MatStepperModule,
  MatButtonModule,
  MatCheckboxModule,
  MatFormFieldModule,
  MatInputModule,
  MatOptionModule,
  MatSelectModule,
  MatIconModule,
  MatPaginatorModule,
  MatSortModule,
  ReactiveFormsModule,
  TranslateModule
  ], exports: [
    FormsModule,
    IonicModule,
    MatTableModule,
    MatStepperModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatOptionModule,
    MatSelectModule,
    MatIconModule,
    MatPaginatorModule,
    MatSortModule,
    TranslateModule,
    ReactiveFormsModule,
    ToolbarComponent,
  ]
})
export class CranixSharedModule { }

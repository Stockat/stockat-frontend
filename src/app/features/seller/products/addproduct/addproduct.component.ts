import { Component } from '@angular/core';
import { GalleriaModule } from 'primeng/galleria';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Select } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { IftaLabelModule } from 'primeng/iftalabel';
import { MultiSelectModule } from 'primeng/multiselect';
import { FileUploadModule } from 'primeng/fileupload';
import { ProductService } from '../../../../core/services/product.service';
import { InputNumberModule } from 'primeng/inputnumber';
@Component({
  selector: 'app-addproduct',
  imports: [GalleriaModule,CardModule,ButtonModule,FloatLabelModule,
            FormsModule,Select,ReactiveFormsModule,InputTextModule,
            IftaLabelModule,MultiSelectModule,FileUploadModule,InputNumberModule,
          ],
  templateUrl: './addproduct.component.html',
  styleUrl: './addproduct.component.css'
})
export class AddproductComponent {

  productForm:FormGroup
  maxFeature=5;

  constructor(private productServ:ProductService){
    this.productForm = new FormGroup({
      title: new FormControl("", [Validators.required, Validators.minLength(3), Validators.maxLength(50)]),
      category: new FormControl("", [Validators.required]),
      price: new FormControl("", [Validators.required, Validators.min(1)]),
      minQuantity: new FormControl("", [Validators.required, Validators.min(1)]),
      location: new FormControl("", [Validators.required]),
      features: new FormArray([],[Validators.required]),
      tags: new FormControl([],[Validators.required]),
      images: new FormControl([],[Validators.required]),
  })}

  value1: string = "";
  images: string[] = [];
  cities:any = [];
  selectedCity: any;
  ngOnInit() {

    this.cities = [
      { name: 'New York', code: 'NY' },
      { name: 'Rome', code: 'RM' },
      { name: 'London', code: 'LDN' },
      { name: 'Istanbul', code: 'IST' },
      { name: 'Paris', code: 'PRS' }
  ];

    this.images = ["../../../../assets/1.png",
      "../../../../assets/2.png",
      "../../../../assets/3.png",
      "../../../../assets/4.png",
      "../../../../assets/5.png",
    ];
  }


  addproduct(){
    console.log(this.productForm.value);
  }


  get features(): FormArray {
    return this.productForm.get('features') as FormArray;
  }

  featureValues(i: number): FormArray {
    return this.features.at(i).get('values') as FormArray;
  }

addFeature(): void {
  const featureGroup = new FormGroup({
    key: new FormControl(''),
    values: new FormArray([new FormControl('')]) // at least one value
  });

  this.features.push(featureGroup);
}

addFeatureValue(featureIndex: number): void {
  this.featureValues(featureIndex).push(new FormControl(''));
}

  removeFeature(index: number): void {
    this.features.removeAt(index);
  }

  removeFeatureValue(featureIndex: number, valueIndex: number): void {
    this.featureValues(featureIndex).removeAt(valueIndex);
  }


//* img
uploadedImages: { file: File, preview: string }[] = [];

onSelect(event: any) {
  for (let file of event.files) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const image = {
        file,
        preview: e.target.result
      };
      this.uploadedImages.push(image);

      // update form field
      const current = this.productForm.value.images || [];
      this.productForm.patchValue({ images: [...current, image] });
    };
    reader.readAsDataURL(file);
  }

  // this.images = this.uploadedImages.map(img => img.preview);
  console.log(this.uploadedImages);
}

onRemove(event: any) {
  const removedFile = event.file;
  this.uploadedImages = this.uploadedImages.filter(
    (img) => img.file.name !== removedFile.name
  );
  this.productForm.patchValue({ images: this.uploadedImages });
}



  //! End Of Component
}

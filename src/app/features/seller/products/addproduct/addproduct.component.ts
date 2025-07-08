import { Component, ViewChild } from '@angular/core';
import { GalleriaModule } from 'primeng/galleria';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { AbstractControl, FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Select } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { FileUpload, FileUploadModule } from 'primeng/fileupload';
import { ProductService } from '../../../../core/services/product.service';
import { InputNumberModule } from 'primeng/inputnumber';
import { SharedService } from '../../../../shared/utils/shared.service';
import { CategoryService } from '../../../../core/services/category.service';
import { CategoryDto } from '../../../../core/models/category-models/categoryDto';
import { from } from 'rxjs';
import { ProductDto } from '../../../../core/models/product-models/productDto';
import { AddProductDto } from '../../../../core/models/product-models/addProductDto';
import { TagService } from '../../../../core/services/tag.service';
import { tagdto } from '../../../../core/models/tag-models/tagDto';
import { MessageModule } from 'primeng/message';
import { MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { IftaLabelModule } from 'primeng/iftalabel';
import { TextareaModule } from 'primeng/textarea';
import { AuthService } from '../../../../core/services/auth.service';
@Component({
  selector: 'app-addproduct',
  imports: [GalleriaModule,CardModule,ButtonModule,FloatLabelModule,
            FormsModule,Select,ReactiveFormsModule,InputTextModule,
            IftaLabelModule,MultiSelectModule,FileUploadModule,InputNumberModule,MessageModule,
            Toast,TextareaModule
          ],
  templateUrl: './addproduct.component.html',
  styleUrl: './addproduct.component.css',
  providers: [MessageService]
})
export class AddproductComponent {

  productForm:FormGroup
  maxFeature=5;
  productDto: AddProductDto = {
    name: '',
    description: '',
    price: 0,
    minQuantity: 0,
    categoryId: 0,
    sellerId: '',
    location: '',
    features: [],
    productTags: []
  };
  @ViewChild('imgref') imgref!: FileUpload;

  constructor(private productServ:ProductService,private sharedServ:SharedService,
              private categoryServ:CategoryService,private tagServ:TagService,
              private messageService: MessageService,private authServ:AuthService
            ){
    this.productForm = new FormGroup({
      title: new FormControl("", [Validators.required, Validators.minLength(3), Validators.maxLength(50)]),
      category: new FormControl("", [Validators.required]),
      price: new FormControl("", [Validators.required, Validators.min(1)]),
      minQuantity: new FormControl("", [Validators.required, Validators.min(1)]),
      description: new FormControl("", [Validators.required]),
      location: new FormControl("", [Validators.required]),
      features: new FormArray([],[this.featuresValidator()]),
      tags: new FormControl([],[Validators.required]),
      images: new FormControl<File[]>([], Validators.required),
  })}

  value1: string = "";
  images: string[] = [];
  extractedimages: File[] = [];
  cities:any = [];
  categories:CategoryDto[] = [];
  tags:tagdto[] = [];
  selectedCity: any;
  sellerId: string|null = '';
  ngOnInit() {

    this.sellerId=this.authServ.getCurrentUserId();
    if (!this.sellerId) {
      console.error("Seller ID is not available");
    }
    this.cities = this.sharedServ.governorates;

    this.categoryServ.getAllCategories().subscribe({
      next: (response) => {
        console.log("Categories fetched successfully:", response.data);
        this.categories = response.data;
      },
      error: (error) => {
        console.error("Error fetching categories:", error);
      }
    })

    this.tagServ.getAllTags().subscribe({
      next: (response) => {
        console.log("Tags fetched successfully:", response.data);
        this.tags = response.data;
      },
      error: (error) => {
        console.error("Error fetching tags:", error);
      }
    })

  }


  addproduct(){

    const formData = new FormData();

// Add images
//*
const wrappedImages = this.productForm.get("images")?.value || [];
console.log("Wrapped Images:", wrappedImages);
const files: File[] = wrappedImages.map((img: any) => img.file); // ✅ This fixes the issue

files.forEach((file) => {
  formData.append('images', file);
});

console.log("Images added to formData:", formData.getAll('images'));
console.log("Images added to formData:", this.productForm.get("images")?.value);
//*


    console.log(this.productForm.value);
    this.productDto.name = this.productForm.get("title")?.value
    this.productDto.categoryId = this.productForm.get("category")?.value
    this.productDto.price = this.productForm.get("price")?.value
    this.productDto.minQuantity = this.productForm.get("minQuantity")?.value
    this.productDto.location = this.productForm.get("location")?.value
    this.productDto.description = this.productForm.get("description")?.value
    this.productDto.sellerId =this.sellerId! //* Not Null For sure
    this.productDto.productTags = this.productForm.get("tags")?.value.map((tagId: number) => ({ tagId }));
    this.productDto.features = this.productDto.features = this.productForm.get("features")?.value.map((feature: any) => ({
      name: feature.key,
      featureValues: feature.values.map((value: string) => ({ name: value }))
    }));

    formData.append('productJson', JSON.stringify(this.productDto));

    this.messageService.add({ severity: 'info', summary: 'Info', detail: 'Wait a sec Inserting Your Data' });

    this.productServ.addProduct(formData).subscribe({
      next: (response) => {
        console.log("Product added successfully:", response.data);
        this.messageService.add({ severity: 'success', summary: 'success', detail: 'Product Added Successfully' });
        //* Reset Form
        this.productForm.reset();
        //* Remove Features Rows
        this.features.clear();
        //* Remove Selected Images
        this.imgref.clear();
        // Handle success response, e.g., navigate to product list or show a success message
      },
      error: (error) => {
        console.error("Error adding product:", error);
        this.messageService.add({ severity: 'danger', summary: 'danger', detail: 'Something Went Wrong Please Try Again Later' });
        // Handle error response, e.g., show an error message
      }
    })


    console.log(this.productDto);
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
uploadedImages: { file: File }[] = [];

onSelect(event: any) {
  for (let file of event.files) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const image = {
        file,
      };
      this.uploadedImages.push(image);

      // update form field
      const current = this.productForm.value.images || [];
      this.productForm.patchValue({ images: [...current, image] });
    };
    reader.readAsDataURL(file);
  }
  console.log(this.uploadedImages);
  this.productForm.get('images')?.markAsTouched();
}

onRemove(event: any) {
  const removedFile = event.file;
  this.uploadedImages = this.uploadedImages.filter(
    (img) => img.file.name !== removedFile.name
  );
  this.productForm.patchValue({ images: this.uploadedImages });
}

// onUpload(){
//   console.log("Uploaded Images: ");
//   this.productServ.uploadImgages(this.uploadedImages.map(img => img.file)).subscribe({
//     next: (response) => {
//       console.log("Images uploaded successfully:", response);

//      if(response.data.length > 0) {
//       response.data.forEach((img) => {
//         console.log(`Image URL: ${img.Url}, File ID: ${img.FileId}`);
//       });
//      }else{
//         console.log("No images uploaded.");
//      }

//     },
//     error: (error) => {
//       console.error("Error uploading images:", error);
//       // Handle error response
//     }
//   })
// }
//* Custom Validation
featuresValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const features = control.value;
    if (!features || features.length === 0) {
      return { required: true };
    }

    const isValid = features.every((feature: any) =>
      feature &&
      typeof feature.key === 'string' &&
      feature.key.trim() !== '' &&
      Array.isArray(feature.values) &&
      feature.values.length > 0 &&
      feature.values.every((v: string) => typeof v === 'string' && v.trim() !== '')
    );

    return isValid ? null : { invalidFormat: true };
  };
}
  //! End Of Component
}

import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../../../core/services/product.service';
import { UpdateProductDto } from '../../../../core/models/product-models/updateProductDto';
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
import { InputNumberModule } from 'primeng/inputnumber';
import { SharedService } from '../../../../shared/utils/shared.service';
import { CategoryService } from '../../../../core/services/category.service';
import { CategoryDto } from '../../../../core/models/category-models/categoryDto';
import { from } from 'rxjs';
import { ProductDto } from '../../../../core/models/product-models/productDto';
import { AddProductDto } from '../../../../core/models/product-models/addProductDto';
import { TagService } from '../../../../core/services/tag.service';
import { tagdto } from '../../../../core/models/tag-models/tagDto';
@Component({
  selector: 'app-update-product',
  imports: [GalleriaModule,CardModule,ButtonModule,FloatLabelModule,
    FormsModule,Select,ReactiveFormsModule,InputTextModule,
    IftaLabelModule,MultiSelectModule,FileUploadModule,InputNumberModule,
  ],
  templateUrl: './update-product.component.html',
  styleUrl: './update-product.component.css'
})
export class UpdateProductComponent implements OnInit {

  selectedProduct:UpdateProductDto|null = null;


  constructor(private productServ:ProductService,private sharedServ:SharedService,
    private categoryServ:CategoryService,private tagServ:TagService){
      this.productForm = new FormGroup({
        title: new FormControl("", [Validators.required, Validators.minLength(3), Validators.maxLength(50)]),
        category: new FormControl("", [Validators.required]),
        price: new FormControl("", [Validators.required, Validators.min(1)]),
        minQuantity: new FormControl("", [Validators.required, Validators.min(1)]),
        location: new FormControl("", [Validators.required]),
        features: new FormArray([],[Validators.required]),
        tags: new FormControl([],[Validators.required]),
        images: new FormControl<File[]>([], Validators.required),
    })
    }

//* Parameters

productForm:FormGroup
cities:any = [];
categories:CategoryDto[] = [];
tags:tagdto[] = [];
images: string[] = [];
removedimages: string[] = [];
updatedproductDto: UpdateProductDto = {
  id: 0,
  name: '',
  description: '',
  price: 0,
  minQuantity: 0,
  categoryId: 0,
  sellerId: '',
  location: '',
  features: [],
  productTags: [],
  images: []
};



  ngOnInit(): void {
//*
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

this.images = ["../../../../assets/1.png",
  "../../../../assets/2.png",
  "../../../../assets/3.png",
  "../../../../assets/4.png",
  "../../../../assets/5.png",
];
//*

    this.productServ.getProductForUpdate(9).subscribe({
      next: (res) => {
      console.log('Product details fetched successfully:', res.data);
      this.selectedProduct=res.data;
      this.images= this.selectedProduct.images?.map(img => img.imageUrl) || [];
      this.productForm.patchValue({
        title: this.selectedProduct.name,
        category: this.selectedProduct.categoryId,
        price: this.selectedProduct.price,
        minQuantity: this.selectedProduct.minQuantity,
        location: this.capitalizeFirstLetter(this.selectedProduct.location),
        tags: this.selectedProduct.productTags.map(tag => tag.tagId),
        images: this.selectedProduct.images || []
      });
      this.populateFeaturesFromData(this.selectedProduct.features);
      },
      error: (err) => {
        console.error('Error fetching product details:', err);
      }
    })
  }

//* Update Product
Updateproduct(){
  this.updatedproductDto.id = this.selectedProduct!.id; // Ensure selectedProduct is not null
  this.updatedproductDto.name= this.productForm.get("title")?.value;
  this.updatedproductDto.categoryId = this.productForm.get("category")?.value;
  this.updatedproductDto.price = this.productForm.get("price")?.value;
  this.updatedproductDto.minQuantity = this.productForm.get("minQuantity")?.value;
  this.updatedproductDto.location = this.productForm.get("location")?.value;
  this.updatedproductDto.sellerId = "64c5d9f7-690e-42d4-b035-1945ab3476db"; // Hardcoded for now
  this.updatedproductDto.productTags = this.productForm.get("tags")?.value.map((tagId: number) => ({ tagId }));
  this.updatedproductDto.features = this.productForm.get("features")?.value.map((feature: any) => ({
    name: feature.key,
    featureValues: feature.values.map((value: string) => ({ name: value }))
  }));
  this.updatedproductDto.images = this.selectedProduct!.images
  ?.filter(img => this.images.includes(img.imageUrl))
  .map(img => ({
    id: img.id,
    imageUrl: img.imageUrl
  }));

  const formData = new FormData();

  formData.append('productJson', JSON.stringify(this.updatedproductDto));

  const wrappedImages = this.productForm.get("images")?.value || [];
let files: File[] = wrappedImages.map((img: any) => img.file); // ✅ This fixes the issue
files=files.filter((file: File) => file instanceof File); // Ensure only File objects are included

files.forEach((file) => {
  formData.append('images', file);
});

    console.log("Updated Product DTO:",formData.get('productJson'));
    console.log("Updated Product DTO:",formData.getAll('images'));

 this.productServ.updateProduct(9, formData).subscribe({
    next: (response) => {
      console.log("Product updated successfully:", response.data);
      alert("Product updated successfully");
    },
    error: (error) => {
      console.error("Error updating product:", error);
    }
 })
}
//* Form
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
//* Populate Features
populateFeaturesFromData(featuresData: any[]) {
  this.features.clear(); // Clear previous entries

  featuresData.forEach(feature => {
    const valuesArray = new FormArray(
      feature.featureValues.map((fv: any) => new FormControl(fv.name))
    );

    const featureGroup = new FormGroup({
      key: new FormControl(feature.name),
      values: valuesArray
    });

    this.features.push(featureGroup);
  });
}
//*
//* Capitalize First Letter
capitalizeFirstLetter(value: string): string {
  if (!value) return '';
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}
//* Remove Existing Image From Array
removeExistingImage(index: number) {

  this.removedimages.push(this.images[index]); // Store removed image URL
  this.images = this.images.filter((_, i) => i !== index);
}

//*
//! End of component
}

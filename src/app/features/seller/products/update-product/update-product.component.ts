import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../../../core/services/product.service';
import {
  updateImageDto,
  UpdateProductDto,
} from '../../../../core/models/product-models/updateProductDto';
import { GalleriaModule } from 'primeng/galleria';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ActivatedRoute, ParamMap } from '@angular/router';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
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
import { MessageModule } from 'primeng/message';
import { MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { TextareaModule } from 'primeng/textarea';
@Component({
  selector: 'app-update-product',
  imports: [
    GalleriaModule,
    CardModule,
    ButtonModule,
    FloatLabelModule,
    FormsModule,
    Select,
    ReactiveFormsModule,
    InputTextModule,
    IftaLabelModule,
    MultiSelectModule,
    FileUploadModule,
    InputNumberModule,
    MessageModule,
    Toast,
    TextareaModule,
  ],
  templateUrl: './update-product.component.html',
  styleUrl: './update-product.component.css',
  providers: [MessageService],
})
export class UpdateProductComponent implements OnInit {
  selectedProduct: UpdateProductDto | null = null;

  constructor(
    private productServ: ProductService,
    private sharedServ: SharedService,
    private categoryServ: CategoryService,
    private tagServ: TagService,
    private messageService: MessageService,
    private route: ActivatedRoute
  ) {
    this.productForm = new FormGroup({
      title: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
      ]),
      category: new FormControl('', [Validators.required]),
      price: new FormControl('', [Validators.required, Validators.min(1)]),
      minQuantity: new FormControl('', [
        Validators.required,
        Validators.min(1),
      ]),
      location: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required]),
      features: new FormArray([], [this.featuresValidator()]),
      tags: new FormControl([], [Validators.required]),
      images: new FormControl<File[]>([], Validators.required),
    });
  }

  //* Parameters
  selectedProductId: number = 0;
  productForm: FormGroup;
  cities: any = [];
  categories: CategoryDto[] = [];
  tags: tagdto[] = [];
  images: updateImageDto[] = [];
  removedimages: updateImageDto[] = [];
  isLoading: boolean = false;
  isUpdating: boolean = false;
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
    images: [],
  };

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      this.selectedProductId = idParam ? +idParam : 0;
    });
    //*
    this.cities = this.sharedServ.governorates;
    this.getTags();
    this.getCategories();
    this.getproduct();
    //*
  }

  //* Update Product
  Updateproduct() {
    this.isUpdating = true;
    this.updatedproductDto.id = this.selectedProduct!.id; // Ensure selectedProduct is not null
    this.updatedproductDto.name = this.productForm.get('title')?.value;
    this.updatedproductDto.categoryId = this.productForm.get('category')?.value;
    this.updatedproductDto.price = this.productForm.get('price')?.value;
    this.updatedproductDto.minQuantity =
      this.productForm.get('minQuantity')?.value;
    this.updatedproductDto.location = this.productForm.get('location')?.value;
    this.updatedproductDto.description =
      this.productForm.get('description')?.value;
    this.updatedproductDto.sellerId = '64c5d9f7-690e-42d4-b035-1945ab3476db'; // Hardcoded for now
    this.updatedproductDto.productTags = this.productForm
      .get('tags')
      ?.value.map((tagId: number) => ({ tagId }));
    this.updatedproductDto.features = this.productForm
      .get('features')
      ?.value.map((feature: any) => ({
        name: feature.key,
        featureValues: feature.values.map((value: string) => ({ name: value })),
      }));

    this.updatedproductDto.images = this.selectedProduct!.images?.filter(
      (img) => this.images.includes(img)
    ).map((img) => ({
      id: img.id,
      imageUrl: img.imageUrl,
      fileId: img.fileId,
    }));

    console.log('Updated Product DTO:', this.updatedproductDto);
    const formData = new FormData();

    formData.append('productJson', JSON.stringify(this.updatedproductDto));

    //* Preparing  New Images
    const wrappedImages = this.productForm.get('images')?.value || [];
    let files: File[] = wrappedImages.map((img: any) => img.file); // ✅ This fixes the issue
    files = files.filter((file: File) => file instanceof File); // Ensure only File objects are included

    files.forEach((file) => {
      formData.append('images', file);
    });

    //* Preparing Removed Images
    formData.append('removedimages', JSON.stringify(this.removedimages));

    this.messageService.add({
      severity: 'info',
      summary: 'Info',
      detail: 'Wait a sec Updating Your Data',
    });
    this.productServ.updateProduct(this.selectedProductId, formData).subscribe({
      next: (response) => {
        this.getproduct();
        this.messageService.add({
          severity: 'success',
          summary: 'success',
          detail: 'Product Updated Successfully',
        });
        this.isUpdating = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'danger',
          summary: 'danger',
          detail: 'Something Went Wrong Please Try Again Later',
        });
        console.error('Error updating product:', error);
        this.isUpdating = false;
      },
    });
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
      values: new FormArray([new FormControl('')]), // at least one value
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

    featuresData.forEach((feature) => {
      const valuesArray = new FormArray(
        feature.featureValues.map((fv: any) => new FormControl(fv.name))
      );

      const featureGroup = new FormGroup({
        key: new FormControl(feature.name),
        values: valuesArray,
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
  //* get Selected Product For Update
  getproduct() {
    this.isLoading = true;
    this.productServ.getProductForUpdate(this.selectedProductId).subscribe({
      next: (res) => {
        this.selectedProduct = res.data;
        this.images = this.selectedProduct.images || [];
        this.productForm.patchValue({
          title: this.selectedProduct.name,
          category: this.selectedProduct.categoryId,
          price: this.selectedProduct.price,
          minQuantity: this.selectedProduct.minQuantity,
          description: this.selectedProduct.description,
          location: this.selectedProduct.location,
          tags: this.selectedProduct.productTags.map((tag) => tag.tagId),
          images: this.selectedProduct.images || [],
        });
        this.populateFeaturesFromData(this.selectedProduct.features);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching product details:', err);
        this.isLoading = false;
      },
    });
  }
  getCategories() {
    this.categoryServ.getAllCategories().subscribe({
      next: (response) => {
        console.log('Categories fetched successfully:', response.data);
        this.categories = response.data;
      },
      error: (error) => {
        console.error('Error fetching categories:', error);
      },
    });
  }
  getTags() {
    this.tagServ.getAllTags().subscribe({
      next: (response) => {
        console.log('Tags fetched successfully:', response.data);
        this.tags = response.data;
      },
      error: (error) => {
        console.error('Error fetching tags:', error);
      },
    });
  }

  //* Custom Validation
  featuresValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const features = control.value;
      if (!features || features.length === 0) {
        return { required: true };
      }

      const isValid = features.every(
        (feature: any) =>
          feature &&
          typeof feature.key === 'string' &&
          feature.key.trim() !== '' &&
          Array.isArray(feature.values) &&
          feature.values.length > 0 &&
          feature.values.every(
            (v: string) => typeof v === 'string' && v.trim() !== ''
          )
      );

      return isValid ? null : { invalidFormat: true };
    };
  }
  //! End of component
}

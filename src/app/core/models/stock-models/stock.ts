// stock model
export interface StockModel {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  stockFeatures: StockFeatureModel[];
}

// stock feature model
export interface StockFeatureModel {
  id: number;
  name: string;
  value: string;
}

// stock response

//     "producId": 5,
//     "productName": "Wireless Headphones007",
//     "quantity": 20,
//     "stockFeatures": [
//       {
//         "id": 61,
//         "name": null,
//         "value": null
//       },
//       {
//         "id": 62,
//         "name": null,
//         "value": null
//       },
//       {
//         "id": 63,
//         "name": null,
//         "value": null
//       },
//       {
//         "id": 64,
//         "name": null,
//         "value": null
//       },
//       {
//         "id": 65,
//         "name": null,
//         "value": null
//       },
//       {
//         "id": 66,
//         "name": null,
//         "value": null
//       },
//       {
//         "id": 67,
//         "name": null,
//         "value": null
//       },
//       {
//         "id": 68,
//         "name": null,
//         "value": null
//       },
//       {
//         "id": 69,
//         "name": null,
//         "value": null
//       },
//       {
//         "id": 70,
//         "name": null,
//         "value": null
//       },
//       {
//         "id": 71,
//         "name": null,
//         "value": null
//       },
//       {
//         "id": 72,
//         "name": null,
//         "value": null
//       }
//     ]
//   }
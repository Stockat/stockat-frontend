// stock model
export interface StockModel {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  stockStatus: string;
  stockFeatures: StockFeatureModel[];
}

// stock feature model
export interface StockFeatureModel {
  id: number;
  name: string;
  value: string;
}

// stock response

// {
//   "message": "Stocks retrieved successfully",
//   "status": 200,
//   "redirectUrl": null,
//   "data": [
//       {
//           "id": 1,
//           "productId": 1,
//           "productName": "Shirt",
//           "quantity": 15,
//           "stockStatus": "ForSale",
//           "stockFeatures": []
//       },
//       {
//           "id": 4,
//           "productId": 5,
//           "productName": "Wireless Headphones007",
//           "quantity": 6,
//           "stockStatus": "SoldOut",
//           "stockFeatures": [
//               {
//                   "id": 91,
//                   "name": "Color",
//                   "value": "blcak"
//               },
//               {
//                   "id": 92,
//                   "name": "Battery Life",
//                   "value": "24"
//               },
//               {
//                   "id": 93,
//                   "name": "Color",
//                   "value": "red"
//               },
//               {
//                   "id": 94,
//                   "name": "Battery Life",
//                   "value": "48"
//               },
//               {
//                   "id": 95,
//                   "name": "Color",
//                   "value": "yellow"
//               },
//               {
//                   "id": 96,
//                   "name": "Battery Life",
//                   "value": "88"
//               }
//           ]
//       },
//       {
//           "id": 12,
//           "productId": 5,
//           "productName": "Wireless Headphones007",
//           "quantity": 22,
//           "stockStatus": "ForSale",
//           "stockFeatures": [
//               {
//                   "id": 97,
//                   "name": "Color",
//                   "value": "white"
//               },
//               {
//                   "id": 98,
//                   "name": "Battery Life",
//                   "value": "24"
//               },
//               {
//                   "id": 99,
//                   "name": "Color",
//                   "value": "blue"
//               },
//               {
//                   "id": 100,
//                   "name": "Battery Life",
//                   "value": "48"
//               },
//               {
//                   "id": 101,
//                   "name": "Color",
//                   "value": "yellow"
//               },
//               {
//                   "id": 102,
//                   "name": "Battery Life",
//                   "value": "88"
//               },
//               {
//                   "id": 103,
//                   "name": "Color",
//                   "value": "white"
//               },
//               {
//                   "id": 104,
//                   "name": "Battery Life",
//                   "value": "24"
//               },
//               {
//                   "id": 105,
//                   "name": "Color",
//                   "value": "blue"
//               },
//               {
//                   "id": 106,
//                   "name": "Battery Life",
//                   "value": "48"
//               },
//               {
//                   "id": 107,
//                   "name": "Color",
//                   "value": "yellow"
//               },
//               {
//                   "id": 108,
//                   "name": "Battery Life",
//                   "value": "88"
//               }
//           ]
//       }
//   ]
// }
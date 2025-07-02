import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  constructor() { }

  governorates = [
    "Cairo",
    "Alexandria",
    "Giza",
    "Qalyubia",
    "Sharqia",
    "Dakahlia",
    "Beheira",
    "Kafr El Sheikh",
    "Gharbia",
    "Monufia",
    "Fayoum",
    "Beni Suef",
    "Minya",
    "Assiut",
    "Sohag",
    "Qena",
    "Luxor",
    "Aswan",
    "Red Sea",
    "New Valley",
    "Matrouh",
    "North Sinai",
    "South Sinai",
    "Port Said",
    "Suez",
    "Ismailia",
    "Damietta"
  ];

}

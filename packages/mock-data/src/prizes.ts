import type { Prize } from "./types";

/** Mock prize catalog — names/values from prize-quest-html5.html screens 01–02. */
export const prizes: Prize[] = [
  { id: "airpods-pro", name: "Apple AirPods Pro", category: "Electronics", value: 249, inStock: true, prizeType: "physical" },
  { id: "yeti-rambler", name: "YETI Rambler 64oz", category: "Outdoor", value: 80, inStock: true, prizeType: "physical" },
  { id: "amazon-100", name: "$100 Amazon Gift Card", category: "Gift cards", value: 100, inStock: true, prizeType: "digital" },
  { id: "galaxy-tab-s9", name: "Samsung Galaxy Tab S9", category: "Electronics", value: 799, inStock: true, prizeType: "physical" },
  { id: "sony-xm5", name: "Sony WH-1000XM5", category: "Electronics", value: 399, inStock: true, prizeType: "physical" },
  { id: "echo-show-15", name: "Amazon Echo Show 15", category: "Smart Home", value: 280, inStock: false, prizeType: "physical" },
  { id: "visa-250", name: "$250 Visa Gift Card", category: "Gift cards", value: 250, inStock: true, prizeType: "digital" },
];

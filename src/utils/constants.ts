import { RoundingMode, Unit } from "../types";

export const SUPPLY_CATEGORIES = [
  "Carnes",
  "Panificados",
  "Lácteos",
  "Salsas",
  "Verduras",
  "Bebidas",
  "Packaging",
  "Condimentos",
  "Otros",
];

export const UNITS: Unit[] = ["g", "kg", "ml", "l", "unit"];
export const ROUNDING_MODES: RoundingMode[] = ["none", "10", "50", "100", "up10", "up50", "up100"];

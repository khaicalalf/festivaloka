import type { FoodPreference } from "../types";
import { useLocalStorage } from "./useLocalStorage";

const DEFAULT_PREF: FoodPreference = {
  spicyLevel: "medium",
  halalOnly: true,
  notes: "",
};

export function usePreferences() {
  const [preferences, setPreferences] = useLocalStorage<FoodPreference>(
    "food-preferences",
    DEFAULT_PREF
  );

  return { preferences, setPreferences };
}

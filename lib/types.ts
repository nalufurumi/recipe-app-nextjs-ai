export type IngredientItem = {
  id: string;
  name: string;
  qty: string;
};

export type IngredientGroup = {
  name: string;
  items: IngredientItem[];
};

export type Step = {
  n: number;
  title: string;
  body: string;
};

export type Tip = {
  title: string;
  items: string[];
};

export type ChefCheck = {
  feasible: boolean;
  issues: string[];
  suggestions: string[];
};

export type StructuredRecipe = {
  title: string;
  description: string;
  servings: string;
  time: string;
  level: string;
  ingredientGroups: IngredientGroup[];
  steps: Step[];
  tips: Tip[];
  assumptions: string[];
};

export type Recipe = StructuredRecipe & {
  id: string;
  raw_input: string;
  chef_check: ChefCheck | null;
  created_at: string;
};

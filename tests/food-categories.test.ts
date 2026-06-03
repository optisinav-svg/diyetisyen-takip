import { describe, it, expect } from "vitest";
import { foodCategoriesService } from "@/lib/_core/food-categories-service";

describe("Food Categories Service", () => {
  describe("getAllCategories", () => {
    it("should return all categories", () => {
      const categories = foodCategoriesService.getAllCategories();
      expect(categories.length).toBeGreaterThan(0);
      expect(categories[0]).toHaveProperty("id");
      expect(categories[0]).toHaveProperty("name");
      expect(categories[0]).toHaveProperty("icon");
      expect(categories[0]).toHaveProperty("subCategories");
    });

    it("should have at least 8 main categories", () => {
      const categories = foodCategoriesService.getAllCategories();
      expect(categories.length).toBeGreaterThanOrEqual(8);
    });
  });

  describe("getCategoryById", () => {
    it("should return category by id", () => {
      const category = foodCategoriesService.getCategoryById("soups");
      expect(category).toBeDefined();
      expect(category?.name).toContain("Çorba");
    });

    it("should return undefined for invalid id", () => {
      const category = foodCategoriesService.getCategoryById("invalid");
      expect(category).toBeUndefined();
    });
  });

  describe("getSubCategory", () => {
    it("should return subcategory by id", () => {
      const subCategory = foodCategoriesService.getSubCategory("soups", "creamy-soups");
      expect(subCategory).toBeDefined();
      expect(subCategory?.name).toContain("Kremali");
    });

    it("should return undefined for invalid subcategory id", () => {
      const subCategory = foodCategoriesService.getSubCategory("soups", "invalid");
      expect(subCategory).toBeUndefined();
    });
  });

  describe("searchCategories", () => {
    it("should search categories by name", () => {
      const results = foodCategoriesService.searchCategories("Çorba");
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].name).toContain("Çorba");
    });

    it("should search categories by description", () => {
      const results = foodCategoriesService.searchCategories("besleyici");
      expect(results.length).toBeGreaterThan(0);
    });

    it("should return empty array for no matches", () => {
      const results = foodCategoriesService.searchCategories("nonexistent");
      expect(results.length).toBe(0);
    });

    it("should be case insensitive", () => {
      const results1 = foodCategoriesService.searchCategories("çorba");
      const results2 = foodCategoriesService.searchCategories("ÇORBA");
      expect(results1.length).toBe(results2.length);
    });
  });

  describe("searchSubCategories", () => {
    it("should search subcategories by name", () => {
      const results = foodCategoriesService.searchSubCategories("Kremali");
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].subCategory.name).toContain("Kremali");
    });

    it("should search subcategories by examples", () => {
      const results = foodCategoriesService.searchSubCategories("Tavuk");
      expect(results.length).toBeGreaterThan(0);
    });

    it("should return category with subcategory", () => {
      const results = foodCategoriesService.searchSubCategories("Kremali");
      expect(results[0]).toHaveProperty("category");
      expect(results[0]).toHaveProperty("subCategory");
    });
  });

  describe("searchFoodItems", () => {
    it("should search food items by name", () => {
      const results = foodCategoriesService.searchFoodItems("Tavuk");
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].item).toContain("Tavuk");
    });

    it("should return full path (category, subcategory, item)", () => {
      const results = foodCategoriesService.searchFoodItems("Elma");
      expect(results[0]).toHaveProperty("category");
      expect(results[0]).toHaveProperty("subCategory");
      expect(results[0]).toHaveProperty("item");
    });

    it("should be case insensitive", () => {
      const results1 = foodCategoriesService.searchFoodItems("tavuk");
      const results2 = foodCategoriesService.searchFoodItems("TAVUK");
      expect(results1.length).toBe(results2.length);
    });

    it("should return empty array for no matches", () => {
      const results = foodCategoriesService.searchFoodItems("nonexistent");
      expect(results.length).toBe(0);
    });
  });

  describe("getCategoryCount", () => {
    it("should return correct category count", () => {
      const count = foodCategoriesService.getCategoryCount();
      const categories = foodCategoriesService.getAllCategories();
      expect(count).toBe(categories.length);
    });
  });

  describe("getTotalSubCategoryCount", () => {
    it("should return total subcategory count", () => {
      const count = foodCategoriesService.getTotalSubCategoryCount();
      expect(count).toBeGreaterThan(0);
    });

    it("should match manual count", () => {
      const count = foodCategoriesService.getTotalSubCategoryCount();
      const categories = foodCategoriesService.getAllCategories();
      const manualCount = categories.reduce(
        (sum, cat) => sum + cat.subCategories.length,
        0
      );
      expect(count).toBe(manualCount);
    });
  });

  describe("getTotalFoodItemCount", () => {
    it("should return total food item count", () => {
      const count = foodCategoriesService.getTotalFoodItemCount();
      expect(count).toBeGreaterThan(0);
    });

    it("should match manual count", () => {
      const count = foodCategoriesService.getTotalFoodItemCount();
      const categories = foodCategoriesService.getAllCategories();
      const manualCount = categories.reduce(
        (sum, cat) =>
          sum +
          cat.subCategories.reduce((subSum, subCat) => subSum + subCat.examples.length, 0),
        0
      );
      expect(count).toBe(manualCount);
    });
  });

  describe("getStructuredData", () => {
    it("should return structured data", () => {
      const data = foodCategoriesService.getStructuredData();
      expect(data.length).toBeGreaterThan(0);
      expect(data[0]).toHaveProperty("id");
      expect(data[0]).toHaveProperty("name");
      expect(data[0]).toHaveProperty("subCategories");
    });

    it("should include item count in subcategories", () => {
      const data = foodCategoriesService.getStructuredData();
      expect(data[0].subCategories[0]).toHaveProperty("itemCount");
      expect(data[0].subCategories[0].itemCount).toBeGreaterThan(0);
    });

    it("should include examples in subcategories", () => {
      const data = foodCategoriesService.getStructuredData();
      expect(data[0].subCategories[0]).toHaveProperty("examples");
      expect(data[0].subCategories[0].examples.length).toBeGreaterThan(0);
    });
  });

  describe("Category Structure", () => {
    it("should have valid category structure", () => {
      const categories = foodCategoriesService.getAllCategories();
      categories.forEach((category) => {
        expect(category.id).toBeTruthy();
        expect(category.name).toBeTruthy();
        expect(category.icon).toBeTruthy();
        expect(category.description).toBeTruthy();
        expect(Array.isArray(category.subCategories)).toBe(true);
        expect(category.subCategories.length).toBeGreaterThan(0);

        category.subCategories.forEach((subCategory) => {
          expect(subCategory.id).toBeTruthy();
          expect(subCategory.name).toBeTruthy();
          expect(subCategory.description).toBeTruthy();
          expect(Array.isArray(subCategory.examples)).toBe(true);
          expect(subCategory.examples.length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe("Specific Categories", () => {
    it("should have soups category with subcategories", () => {
      const soups = foodCategoriesService.getCategoryById("soups");
      expect(soups).toBeDefined();
      expect(soups?.subCategories.length).toBeGreaterThan(0);
      expect(soups?.subCategories.some((s) => s.id === "creamy-soups")).toBe(true);
    });

    it("should have desserts category with subcategories", () => {
      const desserts = foodCategoriesService.getCategoryById("desserts");
      expect(desserts).toBeDefined();
      expect(desserts?.subCategories.length).toBeGreaterThan(0);
      expect(desserts?.subCategories.some((s) => s.id === "dairy-desserts")).toBe(true);
    });

    it("should have salads category with subcategories", () => {
      const salads = foodCategoriesService.getCategoryById("salads");
      expect(salads).toBeDefined();
      expect(salads?.subCategories.length).toBeGreaterThan(0);
      expect(salads?.subCategories.some((s) => s.id === "green-salads")).toBe(true);
    });
  });
});

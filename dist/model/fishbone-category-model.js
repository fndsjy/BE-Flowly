export function toFishboneCategoryResponse(category) {
    return {
        fishboneCategoryId: category.fishboneCategoryId,
        categoryCode: category.categoryCode,
        categoryName: category.categoryName,
        categoryDesc: category.categoryDesc ?? null,
        isActive: category.isActive,
        isDeleted: category.isDeleted,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
    };
}
export const toFishboneCategoryListResponse = toFishboneCategoryResponse;
//# sourceMappingURL=fishbone-category-model.js.map
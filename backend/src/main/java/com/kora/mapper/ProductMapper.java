package com.kora.mapper;

import com.kora.dto.response.ProductImageResponse;
import com.kora.dto.response.ProductResponse;
import com.kora.entity.Product;
import com.kora.entity.ProductImage;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import java.util.List;

@Mapper(componentModel = "spring")
public interface ProductMapper {

    @Mapping(target = "sellerId", source = "seller.id")
    @Mapping(target = "sellerName", source = "seller.fullName")
    @Mapping(target = "categoryId", source = "category.id")
    @Mapping(target = "categoryName", source = "category.name")
    ProductResponse toResponse(Product p);

    ProductImageResponse toImageResponse(ProductImage img);

    List<ProductImageResponse> toImageResponses(List<ProductImage> imgs);
}
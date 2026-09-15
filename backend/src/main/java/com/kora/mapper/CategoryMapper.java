package com.kora.mapper;

import com.kora.dto.response.CategoryResponse;
import com.kora.entity.Category;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CategoryMapper {
    @Mapping(target = "parentId", source = "parent.id")
    CategoryResponse toResponse(Category c);
}
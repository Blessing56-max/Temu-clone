package com.kora.service;

import com.kora.dto.request.CategoryRequest;
import com.kora.dto.response.CategoryResponse;
import com.kora.entity.Category;
import com.kora.exception.ApiException;
import com.kora.mapper.CategoryMapper;
import com.kora.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    @Transactional(readOnly = true)
    public List<CategoryResponse> listAll() {
        return categoryRepository.findAll().stream()
                .map(categoryMapper::toResponse)
                .toList();
    }

    @Transactional
    public CategoryResponse create(CategoryRequest req) {
        String slug = slugify(req.name());
        if (categoryRepository.existsBySlug(slug)) {
            throw new ApiException(HttpStatus.CONFLICT, "Category slug already exists: " + slug);
        }
        Category parent = null;
        if (req.parentId() != null) {
            parent = categoryRepository.findById(req.parentId())
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Parent category not found"));
        }
        Category c = Category.builder()
                .name(req.name())
                .slug(slug)
                .parent(parent)
                .build();
        return categoryMapper.toResponse(categoryRepository.save(c));
    }

    private String slugify(String input) {
        String s = Normalizer.normalize(input, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");
        return s;
    }
}
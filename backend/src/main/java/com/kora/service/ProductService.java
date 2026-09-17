package com.kora.service;

import com.kora.dto.request.ProductRequest;
import com.kora.dto.response.ProductResponse;
import com.kora.entity.*;
import com.kora.exception.ApiException;
import com.kora.mapper.ProductMapper;
import com.kora.repository.CategoryRepository;
import com.kora.repository.ProductRepository;
import com.kora.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final ProductMapper productMapper;

    @Transactional(readOnly = true)
    public Page<ProductResponse> search(String q, Long categoryId, BigDecimal minPrice,
                                        BigDecimal maxPrice, int page, int size) {
        Pageable pageable = PageRequest.of(page, Math.min(size, 50));
        String query = (q == null || q.isBlank()) ? null : q.trim();
        return productRepository.search(query, categoryId, minPrice, maxPrice, pageable)
                .map(productMapper::toResponse);
    }

    @Cacheable(value = "product", key = "#id")
    @Transactional(readOnly = true)
    public ProductResponse getById(Long id) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Product not found"));
        return productMapper.toResponse(p);
    }

    @Transactional
    public ProductResponse create(String sellerEmail, ProductRequest req) {
        User seller = userRepository.findByEmail(sellerEmail)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Seller not found"));

        Category category = null;
        if (req.categoryId() != null) {
            category = categoryRepository.findById(req.categoryId())
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Category not found"));
        }

        Product p = Product.builder()
                .seller(seller)
                .category(category)
                .name(req.name())
                .description(req.description())
                .price(req.price())
                .discountPrice(req.discountPrice())
                .stock(req.stock())
                .active(req.active() == null || req.active())
                .build();

        if (req.imageUrls() != null) {
            List<ProductImage> imgs = new ArrayList<>();
            int pos = 0;
            for (String url : req.imageUrls()) {
                imgs.add(ProductImage.builder().product(p).url(url).position(pos++).build());
            }
            p.setImages(imgs);
        }

        return productMapper.toResponse(productRepository.save(p));
    }

    @CacheEvict(value = "product", key = "#id")
    @Transactional
    public ProductResponse update(String sellerEmail, Long id, ProductRequest req) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Product not found"));

        if (!p.getSeller().getEmail().equals(sellerEmail)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You can only edit your own products");
        }

        if (req.categoryId() != null) {
            Category cat = categoryRepository.findById(req.categoryId())
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Category not found"));
            p.setCategory(cat);
        }

        p.setName(req.name());
        p.setDescription(req.description());
        p.setPrice(req.price());
        p.setDiscountPrice(req.discountPrice());
        p.setStock(req.stock());
        if (req.active() != null) p.setActive(req.active());

        if (req.imageUrls() != null) {
            p.getImages().clear();
            int pos = 0;
            for (String url : req.imageUrls()) {
                p.getImages().add(ProductImage.builder().product(p).url(url).position(pos++).build());
            }
        }

        return productMapper.toResponse(productRepository.save(p));
    }

    @CacheEvict(value = "product", key = "#id")
    @Transactional
    public void delete(String sellerEmail, Long id) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Product not found"));
        if (!p.getSeller().getEmail().equals(sellerEmail)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You can only delete your own products");
        }
        // Soft delete: hide from storefront but keep the row so past orders still reference it.
        p.setActive(false);
        p.setStock(0);
        productRepository.save(p);
    }
}
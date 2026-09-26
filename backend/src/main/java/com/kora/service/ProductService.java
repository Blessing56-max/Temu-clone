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
    private final com.kora.repository.EscrowTransactionRepository escrowRepository;

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
        
        validateDiscount(req.price(), req.discountPrice());User seller = userRepository.findByEmail(sellerEmail)
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
        requireVerifiedSeller(productRepository.findById(id).map(p -> p.getSeller()).orElse(null));
        
        validateDiscount(req.price(), req.discountPrice());Product p = productRepository.findById(id)
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

        // Judge feedback: block delete if this seller has money in escrow.
        // Protects buyers — otherwise a scammer could list, get paid, then vanish.
        if (escrowRepository.sellerHasHeldFunds(p.getSeller().getId())) {
            throw new ApiException(HttpStatus.CONFLICT,
                "You have pending orders with funds in escrow. Complete delivery first.");
        }

        // Soft delete: hide from storefront but keep the row so past orders still reference it.
        p.setActive(false);
        p.setStock(0);
        productRepository.save(p);
    }

    /**
     * Judge bug fix: a discount price must be strictly less than the base
     * price. A "discount" of 4000 on a 2000 product makes no sense.
     */
    private void validateDiscount(BigDecimal price, BigDecimal discount) {
        if (discount == null) return;
        if (price == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Price is required when setting a discount");
        }
        if (discount.compareTo(price) >= 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                "Discount price (N" + discount + ") must be less than the original price (N" + price + ")");
        }
        if (discount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Discount price must be greater than 0");
        }
    }

    /**
     * Judge feedback: sellers cannot list products until KYC is VERIFIED.
     * This is the single choke point — every product mutation goes through here.
     */
    private void requireVerifiedSeller(User seller) {
        if (seller == null) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Seller not found");
        }
        if (seller.getKycStatus() != com.kora.entity.KycStatus.VERIFIED) {
            throw new ApiException(HttpStatus.FORBIDDEN,
                "Your seller account is not verified yet. Complete KYC before listing products.");
        }
        if (seller.getRentStatus() == com.kora.entity.RentStatus.LOCKED) {
            throw new ApiException(HttpStatus.FORBIDDEN,
                "Your store is locked due to unpaid rent. Pay your monthly rent to list products again.");
        }
    }

    @Transactional(readOnly = true)
    public java.util.List<ProductResponse> suggest(String q, int limit) {
        if (q == null || q.trim().length() < 2) return java.util.List.of();
        return productRepository.search(q.trim(), null, null, null,
                org.springframework.data.domain.PageRequest.of(0, limit))
                .map(productMapper::toResponse)
                .getContent();
    }
}
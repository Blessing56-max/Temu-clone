package com.kora.service;

import com.kora.dto.request.ProductRequest;
import com.kora.dto.response.ProductResponse;
import com.kora.entity.Category;
import com.kora.entity.Product;
import com.kora.entity.Role;
import com.kora.entity.User;
import com.kora.exception.ApiException;
import com.kora.mapper.ProductMapper;
import com.kora.repository.CategoryRepository;
import com.kora.repository.ProductRepository;
import com.kora.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock ProductRepository productRepository;
    @Mock CategoryRepository categoryRepository;
    @Mock UserRepository userRepository;
    @Mock ProductMapper productMapper;

    @InjectMocks ProductService productService;

    @Test
    void create_happyPath_savesProduct() {
        User seller = User.builder().id(2L).email("seller@kora.test")
                .fullName("Seller").role(Role.SELLER).enabled(true).build();
        Category cat = Category.builder().id(1L).name("Electronics").slug("electronics").build();

        when(userRepository.findByEmail("seller@kora.test")).thenReturn(Optional.of(seller));
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(cat));
        when(productRepository.save(any(Product.class))).thenAnswer(inv -> {
            Product p = inv.getArgument(0);
            p.setId(10L);
            return p;
        });
        when(productMapper.toResponse(any(Product.class)))
                .thenReturn(mock(ProductResponse.class));

        var req = new ProductRequest("Headphones", "desc",
                new BigDecimal("45000"), null, 10, 1L,
                List.of("https://img.jpg"), true);

        ProductResponse result = productService.create("seller@kora.test", req);

        assertThat(result).isNotNull();
        verify(productRepository).save(any(Product.class));
    }

    @Test
    void create_missingSeller_throws401() {
        when(userRepository.findByEmail("ghost@kora.test")).thenReturn(Optional.empty());
        var req = new ProductRequest("X", null, BigDecimal.ONE, null, 1, null, null, true);

        assertThatThrownBy(() -> productService.create("ghost@kora.test", req))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("Seller not found");
    }

    @Test
    void update_notOwner_throws403() {
        User owner = User.builder().id(2L).email("owner@kora.test").build();
        Product existing = Product.builder().id(5L).seller(owner).build();
        when(productRepository.findById(5L)).thenReturn(Optional.of(existing));

        var req = new ProductRequest("X", null, BigDecimal.ONE, null, 1, null, null, true);

        assertThatThrownBy(() -> productService.update("hacker@kora.test", 5L, req))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("only edit your own");
    }
}
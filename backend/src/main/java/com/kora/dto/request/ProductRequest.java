package com.kora.dto.request;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;

public record ProductRequest(
    @NotBlank @Size(max = 255) String name,
    @Size(max = 5000) String description,
    @NotNull @DecimalMin("0.0") BigDecimal price,
    @DecimalMin("0.0") BigDecimal discountPrice,
    @NotNull @Min(0) Integer stock,
    Long categoryId,
    List<@Size(max = 500) String> imageUrls,
    Boolean active
) {}
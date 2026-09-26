package com.kora.dto.request;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;

public record ProductRequest(
    @NotBlank @Size(max = 255) String name,
    @Size(max = 5000) String description,
    @NotNull @DecimalMin(value = "1.0", message = "Price must be at least 1") @DecimalMax(value = "99999999.99", message = "Price is too large") BigDecimal price,
    @DecimalMin(value = "0.0", message = "Discount cannot be negative") BigDecimal discountPrice,
    @NotNull @Min(0) @Max(1000000) Integer stock,
    Long categoryId,
    List<@Size(max = 500) String> imageUrls,
    Boolean active
) {}
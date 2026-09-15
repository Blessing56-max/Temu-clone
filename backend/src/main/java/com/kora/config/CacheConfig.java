package com.kora.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        // Simple in-memory cache. Swap to RedisCacheManager later when Redis is added.
        return new ConcurrentMapCacheManager("product", "products", "categories");
    }
}
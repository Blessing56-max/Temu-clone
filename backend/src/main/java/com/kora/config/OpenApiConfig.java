package com.kora.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI koraOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Kora Marketplace API")
                        .description("Kora — Fast and Easy Marketing. E-commerce marketplace REST API.")
                        .version("v0.1.0")
                        .contact(new Contact().name("Adedayo Nathan & Adedayo Blessing")));
    }
}

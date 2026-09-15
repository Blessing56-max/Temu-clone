package com.kora;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class KoraApplication {
    public static void main(String[] args) {
        SpringApplication.run(KoraApplication.class, args);
    }
}
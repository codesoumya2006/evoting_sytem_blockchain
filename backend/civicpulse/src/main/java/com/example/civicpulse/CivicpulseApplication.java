package com.example.civicpulse;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EntityScan({
    "com.example.civicpulse.model",
    "com.example.civicpulse.blockchain",
    "com.example.civicpulse.state"
})
@EnableJpaRepositories("com.example.civicpulse.repo")
public class CivicpulseApplication {
	public static void main(String[] args) {
		SpringApplication.run(CivicpulseApplication.class, args);
	}
}

package com.team9.imageplatform.api;

import com.amazonaws.services.s3.AmazonS3;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ApiApplication {
	@Autowired
	private AmazonS3 s3;

	public static void main(String[] args) {
		SpringApplication.run(ApiApplication.class, args);
	}

	@PostConstruct
	public void testS3() {
		System.out.println("=== S3 버킷 목록 테스트 ===");
		s3.listBuckets().forEach(b -> System.out.println(b.getName()));
	}
}

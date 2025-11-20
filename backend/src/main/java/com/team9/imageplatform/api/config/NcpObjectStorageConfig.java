package com.team9.imageplatform.api.config;

import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.client.builder.AwsClientBuilder;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Naver Cloud Object Storage(NCP S3 호환) 연동을 위한 AmazonS3 클라이언트 설정.
 */
@Configuration
public class NcpObjectStorageConfig {

    @Value("${ncp.storage.endpoint}")
    private String endPoint;

    @Value("${ncp.storage.region}")
    private String regionName;

    @Value("${ncp.storage.access-key}")
    private String accessKey;

    @Value("${ncp.storage.secret-key}")
    private String secretKey;

    @Bean
    public AmazonS3 amazonS3() {
        return AmazonS3ClientBuilder.standard()
                .withEndpointConfiguration(
                        new AwsClientBuilder.EndpointConfiguration(endPoint, regionName)
                )
                .withCredentials(
                        new AWSStaticCredentialsProvider(
                                new BasicAWSCredentials(accessKey, secretKey)
                        )
                )
                // NCP Object Storage 쓸 때 path-style 강제 필요
                .withPathStyleAccessEnabled(true)
                .build();
    }
}

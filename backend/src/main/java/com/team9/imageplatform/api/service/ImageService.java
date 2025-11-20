package com.team9.imageplatform.api.service;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.CannedAccessControlList;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;
import com.team9.imageplatform.api.dto.ImageUploadResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDate;
import java.util.UUID;

/**
 * 이미지 파일을 NCP Object Storage에 업로드하는 서비스.
 */
@Service
@RequiredArgsConstructor
public class ImageService {

    private final AmazonS3 s3Client;

    @Value("${ncp.storage.bucket}")
    private String bucketName;

    @Value("${ncp.storage.base-folder}")
    private String baseFolder;

    @Value("${ncp.optimizer.domain}")
    private String optimizerDomain;

    @Value("${ncp.optimizer.query}")
    private String optimizerQuery;

    @Value("${ncp.optimizer.project-id}")
    private String optimizerProjectId;

    /**
     * MultipartFile을 Object Storage에 업로드하고,
     * 퍼블릭 URL과 오브젝트 키를 반환한다.
     */
    public ImageUploadResponse upload(MultipartFile file) {
        validateNotEmpty(file);
        validateImageContentType(file);

        String objectKey = buildObjectKey(file.getOriginalFilename());
        ObjectMetadata metadata = buildObjectMetadata(file);

        try (InputStream inputStream = file.getInputStream()) {
            PutObjectRequest request = new PutObjectRequest(
                    bucketName,
                    objectKey,
                    inputStream,
                    metadata
            ).withCannedAcl(CannedAccessControlList.PublicRead); // 개별 객체만 퍼블릭

            s3Client.putObject(request);
        } catch (IOException e) {
            // 실서비스라면 별도 예외 타입으로 래핑하는 것이 좋음
            throw new RuntimeException("이미지 업로드 중 오류가 발생했습니다.", e);
        }

        String objectUrl = buildPublicUrl(objectKey);
        String optimizedUrl = buildOptimizerUrl(objectKey);

        return new ImageUploadResponse(objectUrl, objectKey, optimizedUrl);
    }

    private void validateNotEmpty(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("비어 있는 파일은 업로드할 수 없습니다.");
        }
    }

    private void validateImageContentType(MultipartFile file) {
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("이미지 파일만 업로드할 수 있습니다.");
        }
    }

    /**
     * 업로드에 사용할 오브젝트 키를 생성한다.
     * 예) original/2025/11/20/uuid.jpg
     */
    private String buildObjectKey(String originalFilename) {
        String extension = extractExtension(originalFilename);
        String datePath = LocalDate.now().toString().replace("-", "/"); // 2025-11-20 → 2025/11/20
        String randomName = UUID.randomUUID().toString();

        return String.format("%s/%s/%s%s", baseFolder, datePath, randomName, extension);
    }

    private String extractExtension(String originalFilename) {
        if (originalFilename == null) {
            return "";
        }
        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex == -1) {
            return "";
        }
        return originalFilename.substring(dotIndex);
    }

    private ObjectMetadata buildObjectMetadata(MultipartFile file) {
        ObjectMetadata metadata = new ObjectMetadata();
        metadata.setContentLength(file.getSize());
        metadata.setContentType(file.getContentType());
        return metadata;
    }

    /**
     * 브라우저에서 접근 가능한 퍼블릭 URL을 생성한다.
     * AmazonS3 클라이언트가 가진 endpoint/bucket 설정을 그대로 사용.
     */
    private String buildPublicUrl(String objectKey) {
        return s3Client.getUrl(bucketName, objectKey).toString();
    }

    /**
     * Image Optimizer를 거친 리사이즈 이미지 URL을 생성한다.
     *
     * Image Optimizer URL 규칙 (예시):
     *   https://{optimizer-domain}/{projectId}/{objectKey}?{optimizerQuery}
     *
     * 대상 원본에 이미 bucket이 설정되어 있으므로,
     * 경로에 bucketName을 다시 붙이지 않는다.
     */
    private String buildOptimizerUrl(String objectKey) {
        return String.format(
                "%s/%s/%s?%s",
                optimizerDomain,
                optimizerProjectId,
                objectKey,
                optimizerQuery
        );
    }
}

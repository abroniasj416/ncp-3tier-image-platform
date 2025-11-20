package com.team9.imageplatform.api.dto;

/**
 * 이미지 업로드 결과를 반환하기 위한 DTO.
 *
 * @param objectUrl    업로드된 원본 이미지를 조회할 수 있는 URL
 * @param objectKey    Object Storage 내에서의 오브젝트 키 (경로)
 * @param optimizedUrl Image Optimizer를 통해 리사이징된 이미지 URL
 */
public record ImageUploadResponse(
        String objectUrl,
        String objectKey,
        String optimizedUrl
) {
}

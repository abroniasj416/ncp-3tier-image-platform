package com.team9.imageplatform.api.dto;

/**
 * 이미지 업로드 결과를 반환하기 위한 DTO.
 *
 * @param objectUrl 업로드된 이미지를 직접 조회할 수 있는 퍼블릭 URL
 * @param objectKey Object Storage 내에서의 오브젝트 키 (경로)
 */
public record ImageUploadResponse(
        String objectUrl,
        String objectKey
) {
}

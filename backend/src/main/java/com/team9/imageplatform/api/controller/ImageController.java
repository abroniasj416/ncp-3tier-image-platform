package com.team9.imageplatform.api.controller;

import com.team9.imageplatform.api.dto.ImageUploadResponse;
import com.team9.imageplatform.api.service.ImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * 이미지 업로드 관련 HTTP API를 제공하는 컨트롤러.
 */
@RestController
@RequestMapping("/api/images")
@RequiredArgsConstructor
public class ImageController {

    private final ImageService imageService;

    /**
     * 이미지 파일 하나를 업로드하고,
     * Object Storage URL과 오브젝트 키를 응답으로 반환한다.
     *
     * 요청 예시 (Postman / 브라우저):
     * - POST /api/images/upload
     * - form-data: file=<이미지 파일>
     */
    @PostMapping("/upload")
    public ResponseEntity<ImageUploadResponse> upload(@RequestParam("file") MultipartFile file) {
        ImageUploadResponse response = imageService.upload(file);
        return ResponseEntity.ok(response);
    }
}

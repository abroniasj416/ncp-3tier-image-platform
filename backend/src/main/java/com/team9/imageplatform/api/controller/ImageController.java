package com.team9.imageplatform.api.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
public class ImageController {

    @PostMapping("/api/images")
    public ResponseEntity<Map<String, Object>> uploadImage(
            @RequestParam("file") MultipartFile file
    ) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "빈 파일은 업로드할 수 없습니다."
            ));
        }

        // TODO: 여기에서 나중에 NCP Object Storage 업로드 + 썸네일/증명사진 리사이즈 로직 연결
        String originalFileName = file.getOriginalFilename();
        long size = file.getSize();

        // 지금은 "임시 URL"만 응답 (실제 저장 X)
        String fakeUrl = "https://example.com/images/" + originalFileName;

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", true,
                "fileName", originalFileName,
                "size", size,
                "previewUrl", fakeUrl,
                "message", "이미지 업로드 요청이 정상적으로 백엔드에 도달했습니다. (실제 저장 로직은 추후 구현 예정)"
        ));
    }
}

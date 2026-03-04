package com.sellerhelper.controller;

import com.sellerhelper.dto.mall.MallCreateRequest;
import com.sellerhelper.dto.mall.MallReorderRequest;
import com.sellerhelper.dto.mall.MallResponse;
import com.sellerhelper.dto.mall.MallUpdateRequest;
import com.sellerhelper.service.MallService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

/** 플랫폼(Mall) REST API */
@RestController
@RequestMapping("/api/malls")
@RequiredArgsConstructor
public class MallController {

    private final MallService mallService;

    @GetMapping
    public ResponseEntity<List<MallResponse>> list(
            @RequestParam(defaultValue = "false") boolean enabledOnly) {
        List<MallResponse> list = enabledOnly
                ? mallService.findAllEnabled()
                : mallService.findAll();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{uid}")
    public ResponseEntity<MallResponse> get(@PathVariable Long uid) {
        return ResponseEntity.ok(mallService.findByUid(uid));
    }

    @PostMapping
    public ResponseEntity<MallResponse> create(@Valid @RequestBody MallCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(mallService.create(request));
    }

    @PutMapping("/{uid}")
    public ResponseEntity<MallResponse> update(
            @PathVariable Long uid,
            @Valid @RequestBody MallUpdateRequest request) {
        return ResponseEntity.ok(mallService.update(uid, request));
    }

    @PutMapping("/reorder")
    public ResponseEntity<Void> reorder(@Valid @RequestBody MallReorderRequest request) {
        mallService.reorder(request.getMallUids());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{uid}")
    public ResponseEntity<Void> delete(@PathVariable Long uid) {
        mallService.delete(uid);
        return ResponseEntity.noContent().build();
    }
}

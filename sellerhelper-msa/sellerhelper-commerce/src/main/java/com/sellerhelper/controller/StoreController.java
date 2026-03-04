package com.sellerhelper.controller;

import com.sellerhelper.dto.store.StoreCreateRequest;
import com.sellerhelper.dto.store.StoreResponse;
import com.sellerhelper.dto.store.StoreUpdateRequest;
import com.sellerhelper.service.StoreService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

/** 스토어 REST API */
@RestController
@RequestMapping("/api/stores")
@RequiredArgsConstructor
public class StoreController {

    private final StoreService storeService;

    @GetMapping
    public ResponseEntity<List<StoreResponse>> list(
            @RequestParam(required = false) Long mallUid,
            @RequestParam(required = false) Long companyUid) {
        return ResponseEntity.ok(storeService.findAll(mallUid, companyUid));
    }

    @GetMapping("/{uid}")
    public ResponseEntity<StoreResponse> get(@PathVariable Long uid) {
        return ResponseEntity.ok(storeService.findByUid(uid));
    }

    @PostMapping
    public ResponseEntity<StoreResponse> create(@Valid @RequestBody StoreCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(storeService.create(request));
    }

    @PutMapping("/{uid}")
    public ResponseEntity<StoreResponse> update(
            @PathVariable Long uid,
            @Valid @RequestBody StoreUpdateRequest request) {
        return ResponseEntity.ok(storeService.update(uid, request));
    }

    @DeleteMapping("/{uid}")
    public ResponseEntity<Void> delete(@PathVariable Long uid) {
        storeService.delete(uid);
        return ResponseEntity.noContent().build();
    }
}

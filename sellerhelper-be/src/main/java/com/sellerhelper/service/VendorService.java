package com.sellerhelper.service;

import com.sellerhelper.dto.vendor.VendorResponse;
import com.sellerhelper.dto.vendor.VendorSaveRequest;
import com.sellerhelper.dto.vendor.VendorFormTemplatePreviewResponse;
import com.sellerhelper.dto.vendor.VendorFormTemplateMappingItem;
import com.sellerhelper.dto.vendor.VendorFormTemplateMappingSaveRequest;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sellerhelper.entity.User;
import com.sellerhelper.entity.Vendor;
import com.sellerhelper.repository.UserRepository;
import com.sellerhelper.repository.VendorRepository;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VendorService {

    private final VendorRepository vendorRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    @Getter
    @RequiredArgsConstructor
    public static class VendorTemplateFileResult {
        private final byte[] file;
        private final String fileName;
        private final String contentType;
    }

    @Transactional(readOnly = true)
    public List<VendorResponse> findMyVendors(Long userUid) {
        return vendorRepository.findByUser_UidOrderByUidDesc(userUid).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public VendorResponse createMyVendor(Long userUid, VendorSaveRequest req) {
        User user = userRepository.findById(userUid)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        Vendor vendor = Vendor.builder()
                .user(user)
                .vendorName(trim(req.getVendorName()))
                .businessNumber(trim(req.getBizNo()))
                .managerName(trim(req.getManagerName()))
                .address(trim(req.getAddress()))
                .addressDetail(trim(req.getAddressDetail()))
                .phone(trim(req.getPhone()))
                .email(trim(req.getEmail()))
                .memo(trim(req.getMemo()))
                .orderMethod("ETC")
                .shippingType("DIRECT")
                .active(req.getIsActive() == null || req.getIsActive())
                .build();

        return toResponse(vendorRepository.save(vendor));
    }

    @Transactional
    public VendorResponse updateMyVendor(Long userUid, Long vendorUid, VendorSaveRequest req) {
        Vendor vendor = vendorRepository.findByUidAndUser_Uid(vendorUid, userUid)
                .orElseThrow(() -> new IllegalArgumentException("발주업체를 찾을 수 없습니다."));

        vendor.setVendorName(trim(req.getVendorName()));
        vendor.setBusinessNumber(trim(req.getBizNo()));
        vendor.setManagerName(trim(req.getManagerName()));
        vendor.setAddress(trim(req.getAddress()));
        vendor.setAddressDetail(trim(req.getAddressDetail()));
        vendor.setPhone(trim(req.getPhone()));
        vendor.setEmail(trim(req.getEmail()));
        vendor.setMemo(trim(req.getMemo()));
        vendor.setActive(req.getIsActive() == null || req.getIsActive());

        return toResponse(vendorRepository.save(vendor));
    }

    @Transactional
    public VendorResponse uploadMyVendorFormTemplate(Long userUid, Long vendorUid, MultipartFile file) {
        Vendor vendor = vendorRepository.findByUidAndUser_Uid(vendorUid, userUid)
                .orElseThrow(() -> new IllegalArgumentException("발주업체를 찾을 수 없습니다."));
        applyFormTemplate(vendor, file);
        return toResponse(vendorRepository.save(vendor));
    }

    @Transactional(readOnly = true)
    public VendorTemplateFileResult findMyVendorFormTemplate(Long userUid, Long vendorUid) {
        Vendor vendor = vendorRepository.findByUidAndUser_Uid(vendorUid, userUid)
                .orElseThrow(() -> new IllegalArgumentException("발주업체를 찾을 수 없습니다."));
        byte[] file = vendor.getFormTemplateFile();
        if (file == null || file.length == 0) {
            throw new IllegalArgumentException("등록된 발주 양식 파일이 없습니다.");
        }
        return new VendorTemplateFileResult(
                file,
                trim(vendor.getFormTemplateFileName()),
                trim(vendor.getFormTemplateContentType())
        );
    }

    @Transactional(readOnly = true)
    public VendorFormTemplatePreviewResponse findMyVendorFormTemplatePreview(Long userUid, Long vendorUid) {
        Vendor vendor = vendorRepository.findByUidAndUser_Uid(vendorUid, userUid)
                .orElseThrow(() -> new IllegalArgumentException("발주업체를 찾을 수 없습니다."));
        byte[] file = vendor.getFormTemplateFile();
        if (file == null || file.length == 0) {
            throw new IllegalArgumentException("등록된 발주 양식 파일이 없습니다.");
        }
        String fileName = trim(vendor.getFormTemplateFileName());
        String lowerName = fileName == null ? "" : fileName.toLowerCase();
        try {
            if (lowerName.endsWith(".csv")) {
                return parseCsvPreview(file);
            }
            if (lowerName.endsWith(".xlsx")) {
                return parseWorkbookPreview(new XSSFWorkbook(new ByteArrayInputStream(file)));
            }
            if (lowerName.endsWith(".xls")) {
                return parseWorkbookPreview(new HSSFWorkbook(new ByteArrayInputStream(file)));
            }
            throw new IllegalArgumentException("미리보기를 지원하지 않는 파일 형식입니다.");
        } catch (IOException e) {
            throw new IllegalStateException("발주 양식 미리보기를 생성하지 못했습니다.");
        }
    }

    @Transactional(readOnly = true)
    public List<VendorFormTemplateMappingItem> findMyVendorFormTemplateMappings(Long userUid, Long vendorUid) {
        Vendor vendor = vendorRepository.findByUidAndUser_Uid(vendorUid, userUid)
                .orElseThrow(() -> new IllegalArgumentException("발주업체를 찾을 수 없습니다."));
        return parseMappings(vendor.getFormTemplateMappingJson());
    }

    @Transactional
    public List<VendorFormTemplateMappingItem> saveMyVendorFormTemplateMappings(
            Long userUid,
            Long vendorUid,
            VendorFormTemplateMappingSaveRequest request
    ) {
        Vendor vendor = vendorRepository.findByUidAndUser_Uid(vendorUid, userUid)
                .orElseThrow(() -> new IllegalArgumentException("발주업체를 찾을 수 없습니다."));
        List<VendorFormTemplateMappingItem> mappings = sanitizeMappings(request == null ? null : request.getMappings());
        vendor.setFormTemplateMappingJson(writeMappings(mappings));
        vendorRepository.save(vendor);
        return mappings;
    }

    private VendorResponse toResponse(Vendor vendor) {
        return VendorResponse.builder()
                .vendorId(vendor.getUid())
                .userId(vendor.getUser().getUid())
                .vendorName(vendor.getVendorName())
                .bizNo(vendor.getBusinessNumber())
                .managerName(vendor.getManagerName())
                .address(vendor.getAddress())
                .addressDetail(vendor.getAddressDetail())
                .phone(vendor.getPhone())
                .email(vendor.getEmail())
                .orderMethod(vendor.getOrderMethod())
                .shippingType(vendor.getShippingType())
                .isActive(vendor.getActive())
                .memo(vendor.getMemo())
                .formTemplateFileName(vendor.getFormTemplateFileName())
                .formTemplateContentType(vendor.getFormTemplateContentType())
                .hasFormTemplateFile(vendor.getFormTemplateFile() != null && vendor.getFormTemplateFile().length > 0)
                .formTemplateUploadedAt(vendor.getFormTemplateUploadedAt())
                .formTemplateMappings(parseMappings(vendor.getFormTemplateMappingJson()))
                .createdAt(vendor.getCreatedAt())
                .updatedAt(vendor.getUpdatedAt())
                .build();
    }

    private void applyFormTemplate(Vendor vendor, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("업로드할 발주 양식 파일이 없습니다.");
        }
        validateFormTemplateFile(file);
        try {
            vendor.setFormTemplateFile(file.getBytes());
            vendor.setFormTemplateFileName(trim(file.getOriginalFilename()));
            vendor.setFormTemplateContentType(trim(file.getContentType()));
            vendor.setFormTemplateUploadedAt(Instant.now());
        } catch (IOException e) {
            throw new IllegalStateException("발주 양식 파일을 처리하지 못했습니다.");
        }
    }

    private void validateFormTemplateFile(MultipartFile file) {
        long maxSize = 10L * 1024L * 1024L;
        if (file.getSize() > maxSize) {
            throw new IllegalArgumentException("발주 양식 파일은 10MB 이하만 업로드할 수 있습니다.");
        }
        String fileName = trim(file.getOriginalFilename());
        String lowerName = fileName == null ? "" : fileName.toLowerCase();
        if (!(lowerName.endsWith(".xlsx") || lowerName.endsWith(".xls") || lowerName.endsWith(".csv"))) {
            throw new IllegalArgumentException("발주 양식 파일은 xlsx/xls/csv 형식만 업로드할 수 있습니다.");
        }
    }

    private VendorFormTemplatePreviewResponse parseCsvPreview(byte[] fileBytes) throws IOException {
        List<String> headers = new ArrayList<>();
        List<List<String>> rows = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(new ByteArrayInputStream(fileBytes), StandardCharsets.UTF_8))) {
            String line;
            int lineNo = 0;
            while ((line = reader.readLine()) != null && lineNo <= 20) {
                List<String> cols = Arrays.stream(line.split(",", -1))
                        .map(String::trim)
                        .collect(Collectors.toList());
                if (lineNo == 0) {
                    headers = cols;
                } else {
                    rows.add(cols);
                }
                lineNo++;
            }
        }
        return VendorFormTemplatePreviewResponse.builder()
                .headers(headers)
                .rows(rows)
                .build();
    }

    private VendorFormTemplatePreviewResponse parseWorkbookPreview(Workbook workbook) throws IOException {
        try (workbook) {
            Sheet sheet = workbook.getNumberOfSheets() > 0 ? workbook.getSheetAt(0) : null;
            if (sheet == null) {
                return VendorFormTemplatePreviewResponse.builder()
                        .headers(Collections.emptyList())
                        .rows(Collections.emptyList())
                        .build();
            }
            DataFormatter formatter = new DataFormatter();
            Row headerRow = sheet.getRow(sheet.getFirstRowNum());
            if (headerRow == null) {
                return VendorFormTemplatePreviewResponse.builder()
                        .headers(Collections.emptyList())
                        .rows(Collections.emptyList())
                        .build();
            }

            int maxCell = Math.max(headerRow.getLastCellNum(), 0);
            List<String> headers = new ArrayList<>();
            for (int i = 0; i < maxCell; i++) {
                headers.add(getCellText(headerRow.getCell(i), formatter));
            }

            List<List<String>> rows = new ArrayList<>();
            int firstDataRowNum = headerRow.getRowNum() + 1;
            int last = Math.min(sheet.getLastRowNum(), firstDataRowNum + 19);
            for (int r = firstDataRowNum; r <= last; r++) {
                Row row = sheet.getRow(r);
                if (row == null) continue;
                List<String> cols = new ArrayList<>();
                for (int c = 0; c < headers.size(); c++) {
                    cols.add(getCellText(row.getCell(c), formatter));
                }
                rows.add(cols);
            }
            return VendorFormTemplatePreviewResponse.builder()
                    .headers(headers)
                    .rows(rows)
                    .build();
        }
    }

    private String getCellText(Cell cell, DataFormatter formatter) {
        if (cell == null) return "";
        return trim(formatter.formatCellValue(cell)) == null ? "" : trim(formatter.formatCellValue(cell));
    }

    private List<VendorFormTemplateMappingItem> sanitizeMappings(List<VendorFormTemplateMappingItem> mappings) {
        if (mappings == null) return Collections.emptyList();
        return mappings.stream()
                .map(m -> VendorFormTemplateMappingItem.builder()
                        .excelHeader(trim(m == null ? null : m.getExcelHeader()))
                        .systemKey(trim(m == null ? null : m.getSystemKey()))
                        .build())
                .filter(m -> m.getExcelHeader() != null && m.getSystemKey() != null)
                .collect(Collectors.toList());
    }

    private List<VendorFormTemplateMappingItem> parseMappings(String mappingJson) {
        if (trim(mappingJson) == null) return Collections.emptyList();
        try {
            List<VendorFormTemplateMappingItem> parsed = objectMapper.readValue(
                    mappingJson,
                    new TypeReference<List<VendorFormTemplateMappingItem>>() {}
            );
            return sanitizeMappings(parsed);
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    private String writeMappings(List<VendorFormTemplateMappingItem> mappings) {
        try {
            return objectMapper.writeValueAsString(mappings == null ? Collections.emptyList() : mappings);
        } catch (Exception e) {
            throw new IllegalStateException("발주 양식 매핑 정보를 저장하지 못했습니다.");
        }
    }

    private String trim(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}

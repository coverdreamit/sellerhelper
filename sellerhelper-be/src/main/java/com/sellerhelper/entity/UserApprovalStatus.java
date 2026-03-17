package com.sellerhelper.entity;

/**
 * 사용자 승인 단계
 * - PENDING_INITIAL_APPROVAL: 기존 데이터 호환용(신규 흐름에서 미사용)
 * - INITIAL_APPROVED: 회원가입 완료, 회사/증빙 등록 필요
 * - PENDING_FINAL_APPROVAL: 회사/증빙 등록 후 관리자 승인 대기
 * - APPROVED: 최종 승인 완료
 */
public enum UserApprovalStatus {
    PENDING_INITIAL_APPROVAL,
    INITIAL_APPROVED,
    PENDING_FINAL_APPROVAL,
    APPROVED
}

# 네이버 스마트스토어(커머스) API 솔루션 가이드 정리

> 참고: [커머스API 소개](https://apicenter.commerce.naver.com/docs/introduction), [기본 연동 요소 가이드](https://apicenter.commerce.naver.com/docs/solution-doc/3000/%EA%B8%B0%EB%B3%B8-%EC%97%B0%EB%8F%99-%EC%9A%94%EC%86%8C-%EA%B0%80%EC%9D%B4%EB%93%9C)

## 1. 개요

- **Base URL**: `https://api.commerce.naver.com/external`
- **인증**: OAuth2 클라이언트 자격증명 → 액세스 토큰 발급 후 `Authorization: Bearer {token}`
- **토큰 유형**
  - `SELF`: 솔루션 전용 API (JWE 해석, 사용 승인/해지 등)
  - `SELLER`: **판매자 스토어 데이터 접근** (상품, 주문, 정산, 문의 등) → `account_id`(판매자 UID) 필요

데이터를 “불러와야 하는” 영역은 아래와 같습니다.

---

## 2. 데이터 영역별 API (불러오기 대상)

### 2.1 상품 (Product)

| API | 메서드 | 경로 | 비고 |
|-----|--------|------|------|
| 상품 검색 | POST | `/v1/products/search` | ✅ 이미 연동됨 (`NaverCommerceProductService`) |

---

### 2.2 주문 (Order)

주문·배송 정보는 **상품 주문(product order)** 단위로 제공됩니다. 조회 범위는 **최대 24시간**이며, 기간 조회 시 일별로 나누어 호출해야 합니다.

| API | 메서드 | 경로 | 용도 |
|-----|--------|------|------|
| 상품 주문 목록(주문별) | GET | `/v1/pay-order/seller/orders/{orderId}/product-order-ids` | 특정 주문(orderId)에 속한 상품 주문 번호 목록 |
| **조건형 상품 주문 상세** | GET | `/v1/pay-order/seller/product-orders` | 조건(기간·상태 등)에 맞는 상품 주문 상세 조회 |
| **변경 상품 주문 내역** | GET | `/v1/pay-order/seller/product-orders/last-changed-statuses` | 변경 일시 기준 조회. `lastChangedFrom`(필수), `lastChangedTo`(선택, 미입력 시 24시간), 페이징 시 `moreSequence` |
| **상품 주문 상세 내역** | POST | `/v1/pay-order/seller/product-orders/query` | 상품 주문 번호 최대 300개로 상세 내역 조회 |

- 상품 주문 1건 = 주문 1건 안의 “상품/옵션 1줄”에 해당하며, 배송지·배송상태·정산액 등이 포함됩니다.

---

### 2.3 배송 (Shipping)

- **별도 “배송 전용” 목록 API는 없습니다.**
- 배송 정보는 **주문 조회 API** 응답의 **상품 주문 정보 구조체** 안에 포함됩니다.
  - `productOrderStatus`: 상품 주문(배송) 상태
  - `shippingAddress`, `shippingStartDate`, `shippingDueDate`, `shippingMemo`
  - `delivery`: 배송사, 송장번호, 배송상태, 발송일/배송완료일 등
- 배송 상태 변경·송장 등록 등은 별도 API로 제공될 수 있음 (문서 확인 필요).

---

### 2.4 정산 (Settlement)

| API | 메서드 | 경로 | 비고 |
|-----|--------|------|------|
| 일별 정산 내역 조회 | GET | `/v1/pay-settle/settle/daily` | 일별 정산 데이터 조회 (문서 버전별로 경로 상이할 수 있음) |

---

### 2.5 문의 (Inquiry)

| API | 메서드 | 경로 | 용도 |
|-----|--------|------|------|
| 고객 문의 답변 등록 | POST | `/v1/pay-merchant/inquiries/{inquiryNo}/answer` | 문의 답변 등록 |
| 문의 목록 조회 | (문서 확인) | pay-merchant 계열 | 문의 목록/상세는 API 문서에서 경로 확인 필요 |

---

## 3. 상품 주문 정보 구조체 요약

주문/배송/정산 데이터는 **상품 주문 정보 구조체** 한 건에 담깁니다.

- **order**: 주문 공통 (orderId, orderDate, paymentDate, 결제수단, 주문자 등)
- **productOrder**: 상품 주문 (상품명, 수량, 금액, 배송지, 배송예정일, **productOrderStatus**, **expectedSettlementAmount** 등)
- **delivery**: 배송 (배송사, 송장번호, 배송상태, 발송일/배달일 등)
- **cancel / return / exchange**: 취소·반품·교환 클레임 정보

---

## 4. 구현 시 참고 사항

1. **인증**: 주문/정산/문의는 판매자 데이터이므로 `SELLER` 토큰 + `account_id`(판매자 UID)가 필요할 수 있음. 현재 상품 검색은 `SELF`로 동작 중일 수 있으니, 주문 API 호출 시 403 등이 나오면 `SELLER` 발급 및 `account_id` 저장·사용을 검토.
2. **날짜**: 요청/응답 모두 **KST(UTC+9)**, ISO 8601 형식 (예: `yyyy-MM-dd'T'HH:mm:ss.SSS+09:00`).
3. **조회 기간**: 주문 조회는 최대 24시간 단위이므로, 기간이 길면 `lastChangedFrom`/`lastChangedTo`를 일별로 잘라서 반복 호출.
4. **페이징**: `last-changed-statuses` 응답의 `more` 객체(`moreFrom`, `moreSequence`)로 다음 페이지 요청.

---

## 5. 정리: “데이터 불러오기” 대상 목록

| 구분 | 데이터 | API 연동 여부 | 비고 |
|------|--------|----------------|------|
| 상품 | 상품 목록/검색 | ✅ 연동됨 | `NaverCommerceProductService` |
| 주문 | 주문·상품주문 상세 | 🔲 연동 필요 | 조건형 / 변경 내역 / query 조합 |
| 배송 | 배송 정보 | 주문 API 응답에 포함 | 별도 “배송 목록” API 없음 |
| 정산 | 일별 정산 | 🔲 연동 필요 | `pay-settle/settle/daily` |
| 문의 | 문의 목록·답변 | 🔲 연동 필요 | 목록 API 경로 문서 확인, 답변 등록 API 존재 |

이 가이드를 기준으로 **주문 → (배송 포함) → 정산 → 문의** 순으로 연동하면 됩니다.

---

## 6. 구현 현황 (sellerhelper-commerce)

| 구분 | 구현 | 비고 |
|------|------|------|
| 상품 검색 | ✅ `NaverCommerceProductService` | `/api/my-stores/{uid}/products` |
| 주문 (변경 내역) | ✅ `NaverCommerceOrderService` | `GET /api/my-stores/{uid}/orders/last-changed` |
| 주문 (상세) | ✅ 동일 서비스 | `POST /api/my-stores/{uid}/orders/details` (body: `productOrderIds`) |
| 정산 | 🔲 미구현 | `GET /v1/pay-settle/settle/daily` |
| 문의 | 🔲 미구현 | 문의 목록·답변 API 문서 확인 후 연동 |

/**
 * 상품 서비스 - 네이버 스마트스토어 API 연동
 * TODO: 백엔드 연동 시 /api/naver/products 호출 제거
 */

export async function fetchProducts(productNos = null) {
  const params = productNos?.length
    ? new URLSearchParams({ productNos: productNos.join(',') })
    : '';
  const url = `/api/naver/products${params ? `?${params}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `상품 조회 실패 (${res.status})`);
  }
  return res.json();
}

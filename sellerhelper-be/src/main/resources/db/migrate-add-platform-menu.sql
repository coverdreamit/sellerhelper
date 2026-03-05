-- 플랫폼 관리 메뉴(system-platform)를 ADMIN 역할에 추가
-- ADMIN의 menu_keys에 system-platform이 없을 때 실행

-- ADMIN 역할 menu_keys 전체 갱신 (system-platform 포함)
UPDATE roles 
SET menu_keys = 'dashboard,product,product-list,order,order-list,order-processing,order-claim,shipping,shipping-list,shipping-pending,shipping-transit,shipping-complete,sales,sales-status,sales-confirmation,sales-settlement,customer,customer-list,customer-inquiry,customer-claim,settings,settings-basic,settings-company,settings-notification,settings-store,settings-store-list,settings-user-log,settings-supplier,settings-supplier-list,settings-supplier-form,system,system-user,system-role,system-platform,system-code,system-log,system-setting'
WHERE code = 'ADMIN' AND (menu_keys IS NULL OR menu_keys NOT LIKE '%system-platform%');

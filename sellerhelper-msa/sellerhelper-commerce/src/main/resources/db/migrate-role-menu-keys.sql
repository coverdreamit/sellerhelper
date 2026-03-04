-- 기존 roles에 menu_keys 기본값 설정
-- JPA ddl-auto: update 후 또는 menu_keys 컬럼 추가 후 실행

-- 전체 메뉴 키 (ADMIN용)
-- dashboard,product,product-list,order,order-list,order-processing,order-claim,shipping,shipping-list,shipping-pending,shipping-transit,shipping-complete,sales,sales-status,sales-confirmation,sales-settlement,customer,customer-list,customer-inquiry,customer-claim,settings,settings-basic,settings-company,settings-notification,settings-store,settings-store-list,settings-user-log,settings-supplier,settings-supplier-list,settings-supplier-form,system,system-user,system-role,system-platform,system-code,system-log,system-setting

UPDATE roles SET menu_keys = 'dashboard,product,product-list,order,order-list,order-processing,order-claim,shipping,shipping-list,shipping-pending,shipping-transit,shipping-complete,sales,sales-status,sales-confirmation,sales-settlement,customer,customer-list,customer-inquiry,customer-claim,settings,settings-basic,settings-company,settings-notification,settings-store,settings-store-list,settings-user-log,settings-supplier,settings-supplier-list,settings-supplier-form,system,system-user,system-role,system-platform,system-code,system-log,system-setting'
WHERE code = 'ADMIN' AND (menu_keys IS NULL OR menu_keys = '');

UPDATE roles SET menu_keys = 'dashboard,product,product-list,order,order-list,order-processing,order-claim,shipping,shipping-list,shipping-pending,shipping-transit,shipping-complete,sales,sales-status,sales-confirmation,sales-settlement,customer,customer-list,customer-inquiry,customer-claim,settings,settings-basic,settings-company,settings-notification,settings-store,settings-store-list,settings-user-log,settings-supplier,settings-supplier-list,settings-supplier-form'
WHERE code IN ('USER', 'SELLER', 'ORDER') AND (menu_keys IS NULL OR menu_keys = '');

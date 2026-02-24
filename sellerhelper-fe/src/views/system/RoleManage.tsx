'use client';

import { useState, useEffect, useRef } from 'react';
import {
  fetchRoles,
  fetchRole,
  createRole,
  updateRole,
  deleteRole,
  type RoleItem,
} from '@/services/user.service';
import { MENU, type MenuItem } from '@/config/menu';
import { collectAllMenuKeys } from '@/config/menu';
import '@/styles/Settings.css';
import './RoleManage.css';

/** 메뉴 아이템과 그 자손들의 key 수집 */
function collectKeys(item: MenuItem): string[] {
  const keys = [item.key];
  if (item.children?.length) {
    item.children.forEach((c) => keys.push(...collectKeys(c)));
  }
  return keys;
}

const ALL_MENU_KEYS = collectAllMenuKeys(MENU).map((m) => m.key);

/** 상위 메뉴 체크 시 하위 전체 적용 트리 노드 */
function MenuTreeNode({
  item,
  menuKeys,
  onToggle,
}: {
  item: MenuItem;
  menuKeys: string[];
  onToggle: (item: MenuItem, checked: boolean) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const keys = collectKeys(item);
  const checkedCount = keys.filter((k) => menuKeys.includes(k)).length;
  const state: 'checked' | 'indeterminate' | 'unchecked' =
    checkedCount === keys.length ? 'checked' : checkedCount > 0 ? 'indeterminate' : 'unchecked';

  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = state === 'indeterminate';
  }, [state]);

  return (
    <div className="menu-tree-item">
      <label className="menu-tree-row">
        <input
          ref={inputRef}
          type="checkbox"
          checked={state === 'checked'}
          onChange={(e) => onToggle(item, e.target.checked)}
        />
        <span className="menu-tree-label">{item.label}</span>
      </label>
      {item.children && item.children.length > 0 && (
        <div className="menu-tree-children">
          {item.children.map((c) => (
            <MenuTreeNode key={c.key} item={c} menuKeys={menuKeys} onToggle={onToggle} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function RoleManage() {
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingUid, setEditingUid] = useState<number | null>(null);
  const [form, setForm] = useState<{
    code: string;
    name: string;
    description: string;
    menuKeys: string[];
  }>({ code: '', name: '', description: '', menuKeys: [] });
  const [saving, setSaving] = useState(false);

  const loadRoles = async () => {
    setLoading(true);
    setError('');
    try {
      const list = await fetchRoles();
      setRoles(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : '권한 목록 조회 실패');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  const handleAdd = () => {
    setEditingUid(null);
    setForm({ code: '', name: '', description: '', menuKeys: [] });
  };

  const handleEdit = async (uid: number) => {
    setError('');
    try {
      const role = await fetchRole(uid);
      setForm({
        code: role.code,
        name: role.name,
        description: role.description ?? '',
        menuKeys: role.menuKeys ?? [],
      });
      setEditingUid(uid);
    } catch (e) {
      setError(e instanceof Error ? e.message : '권한 조회 실패');
    }
  };

  /** 상위 메뉴 체크: 해당 메뉴와 모든 자손 추가/제거 */
  const handleParentMenuToggle = (item: MenuItem, checked: boolean) => {
    const keysToUpdate = collectKeys(item);
    setForm((prev) => {
      const next = new Set(prev.menuKeys);
      if (checked) keysToUpdate.forEach((k) => next.add(k));
      else keysToUpdate.forEach((k) => next.delete(k));
      return { ...prev, menuKeys: [...next] };
    });
  };

  const handleSave = async () => {
    setError('');
    setSaving(true);
    try {
      if (editingUid) {
        await updateRole(editingUid, {
          name: form.name,
          description: form.description || undefined,
          menuKeys: form.menuKeys,
        });
        setEditingUid(null);
      } else {
        if (!form.code.trim()) {
          setError('권한 코드를 입력하세요.');
          return;
        }
        await createRole({
          code: form.code.trim().toUpperCase(),
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          menuKeys: form.menuKeys,
        });
      }
      setForm({ code: '', name: '', description: '', menuKeys: [] });
      await loadRoles();
    } catch (e) {
      setError(e instanceof Error ? e.message : '저장 실패');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (uid: number) => {
    if (!confirm('이 권한을 삭제하시겠습니까? (해당 권한을 가진 사용자가 있으면 삭제할 수 없습니다)')) return;
    setError('');
    try {
      await deleteRole(uid);
      if (editingUid === uid) {
        setEditingUid(null);
        setForm({ code: '', name: '', description: '', menuKeys: [] });
      }
      await loadRoles();
    } catch (e) {
      setError(e instanceof Error ? e.message : '삭제 실패');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    setForm((prev) => ({
      ...prev,
      menuKeys: checked ? [...ALL_MENU_KEYS] : [],
    }));
  };

  /** 재귀 메뉴 트리 렌더링 (상위 체크 시 하위 전체 적용) */
  const renderMenuTree = (items: MenuItem[]) =>
    items.map((item) => (
      <MenuTreeNode
        key={item.key}
        item={item}
        menuKeys={form.menuKeys}
        onToggle={handleParentMenuToggle}
      />
    ));

  return (
    <div className="settings-page role-manage-page">
      <h1>권한 관리</h1>
      <p className="page-desc">
        권한 코드를 추가/수정/삭제하고, 각 권한에 접근 가능한 메뉴를 넣었다 뺐다 할 수 있습니다.
      </p>

      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}

      <div className="role-manage-grid">
        <section className="settings-section role-list-section">
          <h2>권한 목록</h2>
          {loading ? (
            <p>로딩 중...</p>
          ) : (
            <div className="settings-table-wrap">
              <table className="settings-table">
                <thead>
                  <tr>
                    <th>코드</th>
                    <th>권한명</th>
                    <th>메뉴 수</th>
                    <th>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map((r) => (
                    <tr key={r.uid} className={editingUid === r.uid ? 'active' : ''}>
                      <td>{r.code}</td>
                      <td>{r.name}</td>
                      <td>{(r.menuKeys ?? []).length}개</td>
                      <td className="cell-actions">
                        <button
                          type="button"
                          className="btn-link"
                          onClick={() => handleEdit(r.uid)}
                        >
                          편집
                        </button>
                        <button
                          type="button"
                          className="btn-link text-danger"
                          onClick={() => handleDelete(r.uid)}
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="settings-actions" style={{ marginTop: 12 }}>
            <button type="button" className="btn btn-primary" onClick={handleAdd}>
              + 권한 추가
            </button>
          </div>
        </section>

        <section className="settings-section role-form-section">
          <h2>{editingUid ? '권한 편집' : '새 권한 추가'}</h2>
          <div className="role-form">
            <div className="form-row">
              <label>권한 코드</label>
              <div>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
                  placeholder="예: CS"
                  disabled={!!editingUid}
                  maxLength={50}
                />
                {editingUid && (
                  <span className="form-hint">코드는 수정할 수 없습니다.</span>
                )}
              </div>
            </div>
            <div className="form-row">
              <label>권한명</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="예: CS 담당"
                maxLength={100}
              />
            </div>
            <div className="form-row">
              <label>설명</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="선택"
                maxLength={500}
              />
            </div>

            <div className="form-row form-row--stack">
              <label>
                접근 메뉴
                <span className="form-hint" style={{ marginLeft: 8 }}>
                  체크한 메뉴만 해당 권한으로 접근 가능합니다.
                </span>
              </label>
              <div className="menu-keys-toolbar">
                <label className="checkbox-inline">
                  <input
                    type="checkbox"
                    checked={
                      ALL_MENU_KEYS.length > 0 && form.menuKeys.length === ALL_MENU_KEYS.length
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                  전체 선택
                </label>
                <span className="form-hint" style={{ marginLeft: 12 }}>
                  상위 메뉴 체크 시 하위 메뉴가 함께 적용됩니다.
                </span>
              </div>
              <div className="menu-keys-tree">
                {renderMenuTree(MENU)}
              </div>
            </div>

            <div className="settings-actions" style={{ marginTop: 16 }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? '저장 중...' : '저장'}
              </button>
              {editingUid && (
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    setEditingUid(null);
                    setForm({ code: '', name: '', description: '', menuKeys: [] });
                  }}
                >
                  취소
                </button>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

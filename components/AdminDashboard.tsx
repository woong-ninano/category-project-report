
import React, { useState } from 'react';
import { SiteConfig, ContentItem } from '../types';
import { uploadImage } from '../lib/supabase';

interface AdminDashboardProps {
  config: SiteConfig;
  onSave: (newConfig: SiteConfig) => Promise<boolean>;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ config, onSave, onLogout }) => {
  const [editConfig, setEditConfig] = useState<SiteConfig>(config);
  const [activeTab, setActiveTab] = useState<'MO' | 'PC'>('MO');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPwdChange, setShowPwdChange] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditConfig(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'itemImage', itemIdx?: number, imgIdx?: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('파일 크기가 너무 큽니다. (최대 10MB)');
      return;
    }

    try {
      setIsUploading(true);
      const publicUrl = await uploadImage(file);
      
      if (type === 'logo') {
        setEditConfig(prev => ({ ...prev, headerLogoUrl: publicUrl }));
      } else if (type === 'itemImage' && itemIdx !== undefined && imgIdx !== undefined) {
        const itemKey = activeTab === 'MO' ? 'contentItemsMO' : 'contentItemsPC';
        const newItems = [...editConfig[itemKey]];
        newItems[itemIdx].images[imgIdx] = publicUrl;
        setEditConfig(prev => ({ ...prev, [itemKey]: newItems }));
      }
    } catch (error: any) {
      alert('파일 업로드 중 오류가 발생했습니다: ' + error.message);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleItemChange = (index: number, field: keyof ContentItem, value: any) => {
    const itemKey = activeTab === 'MO' ? 'contentItemsMO' : 'contentItemsPC';
    const newItems = [...editConfig[itemKey]];
    newItems[index] = { ...newItems[index], [field]: value };
    setEditConfig(prev => ({ ...prev, [itemKey]: newItems }));
  };

  const addItem = () => {
    const itemKey = activeTab === 'MO' ? 'contentItemsMO' : 'contentItemsPC';
    const newItems = [
      ...editConfig[itemKey],
      { category: `${activeTab} Section ${(editConfig[itemKey].length + 1).toString().padStart(2, '0')}`, title: '새 섹션 타이틀', description: '내용을 입력하세요.', images: [""] }
    ];
    setEditConfig(prev => ({ ...prev, [itemKey]: newItems }));
  };

  const removeItem = (index: number) => {
    if (window.confirm("정말 이 섹션을 삭제하시겠습니까?")) {
      const itemKey = activeTab === 'MO' ? 'contentItemsMO' : 'contentItemsPC';
      const newItems = editConfig[itemKey].filter((_, i) => i !== index);
      setEditConfig(prev => ({ ...prev, [itemKey]: newItems }));
    }
  };

  const moveItemUp = (index: number) => {
    if (index === 0) return;
    const itemKey = activeTab === 'MO' ? 'contentItemsMO' : 'contentItemsPC';
    const newItems = [...editConfig[itemKey]];
    [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
    setEditConfig(prev => ({ ...prev, [itemKey]: newItems }));
  };

  const moveItemDown = (index: number) => {
    const itemKey = activeTab === 'MO' ? 'contentItemsMO' : 'contentItemsPC';
    if (index === editConfig[itemKey].length - 1) return;
    const newItems = [...editConfig[itemKey]];
    [newItems[index + 1], newItems[index]] = [newItems[index], newItems[index + 1]];
    setEditConfig(prev => ({ ...prev, [itemKey]: newItems }));
  };

  const addImageField = (itemIdx: number) => {
    const itemKey = activeTab === 'MO' ? 'contentItemsMO' : 'contentItemsPC';
    const newItems = [...editConfig[itemKey]];
    newItems[itemIdx].images.push("");
    setEditConfig(prev => ({ ...prev, [itemKey]: newItems }));
  };

  const removeImageField = (itemIdx: number, imgIdx: number) => {
    const itemKey = activeTab === 'MO' ? 'contentItemsMO' : 'contentItemsPC';
    const newItems = [...editConfig[itemKey]];
    newItems[itemIdx].images = newItems[itemIdx].images.filter((_, i) => i !== imgIdx);
    setEditConfig(prev => ({ ...prev, [itemKey]: newItems }));
  };

  const handleSaveConfig = async () => {
    if (isSaving) return;
    try {
      setIsSaving(true);
      await onSave(editConfig);
    } finally {
      setIsSaving(false);
    }
  };

  const currentItems = activeTab === 'MO' ? editConfig.contentItemsMO : editConfig.contentItemsPC;

  return (
    <div className="min-h-screen bg-gray-50 pt-12 pb-24 px-6 overflow-y-auto text-[#333]">
      <div className="max-w-4xl mx-auto">
        <div className="sticky top-0 z-50 flex flex-col gap-4 mb-10 py-4 bg-gray-50/80 backdrop-blur-md border-b border-gray-100">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <span className="text-[#004a99]">시스템</span> 관리자
              {isSaving && <span className="text-xs text-blue-500 animate-pulse uppercase">Saving...</span>}
            </h1>
            <div className="flex gap-3">
              <a href="/" target="_blank" className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:text-[#004a99] transition-all">홈 화면</a>
              <button onClick={onLogout} className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-red-500 transition-all">로그아웃</button>
              <button disabled={isSaving} onClick={handleSaveConfig} className="px-8 py-2 bg-[#004a99] text-white font-bold rounded-xl hover:bg-blue-800 shadow-lg">저장하기</button>
            </div>
          </div>
        </div>

        {/* Basic Settings (공통) */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-8">
          <h2 className="text-xl font-bold mb-8 flex items-center gap-2">
            <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div> 기본 시스템 정보 (공통)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-3">
              <label className="text-sm font-bold text-gray-600">로고 이미지</label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center border border-dashed border-gray-200 overflow-hidden shrink-0">
                  {editConfig.headerLogoUrl && <img src={editConfig.headerLogoUrl} className="w-full h-full object-contain p-1" />}
                </div>
                <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'logo')} className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700" />
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <label className="text-sm font-bold text-gray-600">프로젝트명</label>
              <input name="headerProjectTitle" value={editConfig.headerProjectTitle} onChange={handleInputChange} className="border border-gray-200 rounded-xl px-4 py-3" />
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="flex border-b border-gray-100">
            <button 
              onClick={() => setActiveTab('MO')}
              className={`flex-1 py-5 font-bold transition-all ${activeTab === 'MO' ? 'text-[#004a99] bg-white border-b-4 border-[#004a99]' : 'text-gray-400 bg-gray-50 hover:bg-gray-100'}`}
            >
              MOBILE Configuration
            </button>
            <button 
              onClick={() => setActiveTab('PC')}
              className={`flex-1 py-5 font-bold transition-all ${activeTab === 'PC' ? 'text-[#004a99] bg-white border-b-4 border-[#004a99]' : 'text-gray-400 bg-gray-50 hover:bg-gray-100'}`}
            >
              PC Configuration
            </button>
          </div>

          <div className="p-8">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <div className={`w-1.5 h-6 rounded-full ${activeTab === 'MO' ? 'bg-orange-500' : 'bg-blue-500'}`}></div>
                {activeTab} 상세 컨텐츠 구성
              </h2>
              <button onClick={addItem} className={`px-6 py-2 font-bold rounded-xl transition-all text-sm ${activeTab === 'MO' ? 'bg-orange-50 text-orange-600 hover:bg-orange-100' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}>+ 섹션 추가</button>
            </div>

            <div className="space-y-12">
              {currentItems.map((item, idx) => (
                <div key={idx} className="p-8 bg-gray-50 rounded-2xl relative group border border-gray-100 hover:border-blue-200 transition-all">
                  <div className="absolute -top-3 left-6 px-4 py-1.5 bg-[#333] text-white text-[10px] font-black rounded-full shadow-lg z-10 tracking-widest uppercase">
                    {item.category || `${activeTab} SEC ${(idx + 1).toString().padStart(2, '0')}`}
                  </div>

                  <div className="absolute top-6 right-6 flex items-center gap-2">
                    <button onClick={() => moveItemUp(idx)} disabled={idx === 0} className="text-gray-400 hover:text-blue-600 p-2 disabled:opacity-10"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" /></svg></button>
                    <button onClick={() => moveItemDown(idx)} disabled={idx === currentItems.length - 1} className="text-gray-400 hover:text-blue-600 p-2 disabled:opacity-10"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg></button>
                    <button onClick={() => removeItem(idx)} className="text-gray-400 hover:text-red-500 p-2"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                  </div>

                  <div className="flex flex-col gap-6 mt-2">
                    <div className="grid grid-cols-1 gap-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-gray-400 uppercase">카테고리</label>
                        <input type="text" value={item.category || ''} onChange={(e) => handleItemChange(idx, 'category', e.target.value)} className="bg-white border border-gray-200 rounded-xl px-4 py-3 font-bold" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-gray-400 uppercase">타이틀</label>
                        <textarea value={item.title} onChange={(e) => handleItemChange(idx, 'title', e.target.value)} rows={2} className="text-lg font-bold bg-white border border-gray-200 rounded-xl px-4 py-3 resize-none" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-gray-400 uppercase">설명</label>
                        <textarea value={item.description} onChange={(e) => handleItemChange(idx, 'description', e.target.value)} className="bg-white border border-gray-200 rounded-xl px-4 py-3 h-24 resize-none" />
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-4">
                      <label className="text-xs font-bold text-gray-400 uppercase">이미지 (400*800 권장)</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {item.images.map((img, imgIdx) => (
                          <div key={imgIdx} className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col gap-3">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold text-gray-300">IMAGE {imgIdx + 1}</span>
                              <button onClick={() => removeImageField(idx, imgIdx)} className="text-red-300 hover:text-red-500"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                            </div>
                            {img && <img src={img} className="h-32 object-contain bg-gray-50 rounded" />}
                            <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'itemImage', idx, imgIdx)} className="text-[10px]" />
                          </div>
                        ))}
                        <button onClick={() => addImageField(idx)} className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-gray-400 hover:bg-white transition-all text-xs font-bold">+ 이미지 추가</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

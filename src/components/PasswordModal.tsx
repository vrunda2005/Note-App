import React, { useState } from 'react';

export default function PasswordModal({ passwordError, isLoading, onSubmit, onCancel }: { passwordError?: string, isLoading?: boolean, onSubmit: (p: string) => void, onCancel: () => void }) {
    const [pw, setPw] = useState('');
    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-gray-900 p-6 rounded shadow max-w-md w-full">
                <h3 className="text-lg font-bold mb-3">Enter password to unlock</h3>
                <input type="password" value={pw} onChange={e => setPw(e.target.value)} className="w-full p-2 border rounded mb-2" onKeyDown={(e) => { if (e.key === 'Enter') onSubmit(pw); }} />
                {passwordError && <p className="text-red-600 mb-2">{passwordError}</p>}
                <div className="flex justify-end gap-2">
                    <button onClick={onCancel} className="px-3 py-1 border rounded">Cancel</button>
                    <button onClick={() => onSubmit(pw)} disabled={isLoading} className="px-3 py-1 bg-blue-600 text-white rounded">{isLoading ? 'Unlocking...' : 'Unlock'}</button>
                </div>
            </div>
        </div>
    );
}

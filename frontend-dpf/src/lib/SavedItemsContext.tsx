import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getAuthUser } from './auth';
import http from './http';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';

interface SavedItemsContextType {
  savedItems: string[]; // Format "Type:Id" e.g. "Program:1"
  toggleSave: (id: number, type: 'Article' | 'Program') => Promise<void>;
  isSaved: (id: number, type: 'Article' | 'Program') => boolean;
  isLoading: boolean;
  refreshSavedItems: () => Promise<void>;
}

const SavedItemsContext = createContext<SavedItemsContextType | undefined>(undefined);

export const SavedItemsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [savedItems, setSavedItems] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshSavedItems = useCallback(async () => {
    const user = getAuthUser();
    if (!user || user.role_label?.toLowerCase() !== 'mitra') {
      setSavedItems([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await http.get<{ saved_items: string[] }>('/mitra/saved-items/status');
      setSavedItems(response.data.saved_items || []);
    } catch (error) {
      console.error('Failed to fetch saved items status', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSavedItems();
  }, [refreshSavedItems]);

  const toggleSave = async (id: number, type: 'Article' | 'Program') => {
    const user = getAuthUser();
    if (!user) {
      Swal.fire({
        title: 'Fitur Khusus Mitra',
        text: 'Silakan login sebagai Mitra untuk menggunakan fitur simpan item.',
        icon: 'info',
        confirmButtonText: 'Tutup',
        confirmButtonColor: '#10b981' // Brand Green
      });
      return;
    }

    if (user.role_label?.toLowerCase() !== 'mitra') {
      Swal.fire({
        title: 'Akses Terbatas',
        text: 'Maaf, fitur simpan item hanya tersedia untuk pengguna dengan status Mitra.',
        icon: 'warning',
        confirmButtonText: 'Mengerti',
        confirmButtonColor: '#10b981'
      });
      return;
    }

    try {
      const response = await http.post<{ status: 'saved' | 'removed', message: string }>('/mitra/saved-items/toggle', { id, type });
      
      const itemKey = `${type}:${id}`;
      if (response.data.status === 'saved') {
        setSavedItems(prev => [...prev, itemKey]);
        Swal.fire({
          title: 'Berhasil!',
          text: 'Item telah ditambahkan ke daftar favorit Anda.',
          icon: 'success',
          confirmButtonColor: '#10b981',
          timer: 2000,
          timerProgressBar: true
        });
      } else {
        setSavedItems(prev => prev.filter(item => item !== itemKey));
        Swal.fire({
          title: 'Dihapus',
          text: 'Item telah dihapus dari daftar favorit.',
          icon: 'success',
          confirmButtonColor: '#10b981',
          timer: 1500,
          timerProgressBar: true
        });
      }
    } catch (error) {
      toast.error('Gagal memproses permintaan.');
    }
  };

  const isSaved = (id: number, type: 'Article' | 'Program') => {
    return savedItems.includes(`${type}:${id}`);
  };

  return (
    <SavedItemsContext.Provider value={{ savedItems, toggleSave, isSaved, isLoading, refreshSavedItems }}>
      {children}
    </SavedItemsContext.Provider>
  );
};

export const useSavedItems = () => {
  const context = useContext(SavedItemsContext);
  if (context === undefined) {
    throw new Error('useSavedItems must be used within a SavedItemsProvider');
  }
  return context;
};

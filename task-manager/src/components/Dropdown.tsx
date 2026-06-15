import { useState, useRef, useEffect, useContext } from 'react';
import { ChevronDown } from 'lucide-react';
import { UserContext } from '../contexts/userContext';

export default function ActingAsDropdown() {


  const [isOpen, setIsOpen] = useState(false);
  // const [selectedRole, setSelectedRole] = useState("Randi");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Opsi role yang bisa dipilih
  // const roles = ['Luna Park', 'Workspace Admin', 'Guest User'];

  // Menutup dropdown jika pengguna mengklik di luar area komponen
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

    // context
   const context = useContext(UserContext);
   
   if (!context) {
     return (
       <button className="flex items-center gap-2 bg-[#1b1528]/60 border border-gray-800/80 rounded-full py-1.5 px-4 text-xs text-gray-500">
        Loading Context...
      </button>
    );
  }

  const { users, role, setRole } = context;
  const roles = users;



  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Tombol Utama Dropdown */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-[#1b1528]/60 hover:bg-[#251d36]/80 border border-gray-800/80 rounded-full py-1.5 px-4 text-xs backdrop-blur-sm transition-all focus:outline-none focus:border-purple-500/50"
      >
        <span className="text-gray-500 font-medium tracking-wider uppercase text-[10px]">
          Acting As
        </span>
        <div className="flex items-center gap-1.5 font-semibold text-gray-200 ml-1">
          {/* Indikator Titik Ungu */}
          <span className="w-2 h-2 rounded-full bg-purple-500 inline-block"></span>
          {role}
          <ChevronDown 
            size={14} 
            className={`text-gray-500 ml-0.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          />
        </div>
      </button>

      {/* Menu Dropdown Menu (Muncul saat isOpen = true) */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[#130f1c] border border-gray-800/80 shadow-xl shadow-black/40 p-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-100">
          {roles.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setRole(item.username);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-2 ${
                role === item.username
                  ? 'bg-purple-500/10 text-purple-400 font-semibold'
                  : 'text-gray-400 hover:bg-gray-800/40 hover:text-gray-200'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${role === item.username ? 'bg-purple-500' : 'bg-transparent'}`}></span>
              {item.username}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
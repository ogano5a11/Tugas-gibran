import { useEffect, useState, useContext, useRef } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, Loader, XCircle, MessageSquare, Send, 
  ClipboardList, MessageCircle, LogOut, Search, MoreVertical 
} from 'lucide-react';

interface Booking {
  id: string;
  service_name: string;
  customer_name: string;
  status: string;
  booking_date: string;
  total_price: number;
}

interface ChatContact {
  id: string;
  name: string;
  email: string;
  unread: number;
}

interface Message {
  id: string;
  content: string;
  role: 'customer' | 'admin';
  created_at: string;
  sender_id: string;
}

export default function Dashboard() {
  const authContext = useContext(AuthContext);
  const user = authContext?.user;
  const signOut = authContext?.signOut;
  
  const [activeTab, setActiveTab] = useState<'orders' | 'chat'>('orders');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // --- STATE DATA ---
  const [bookings, setBookings] = useState<Booking[]>([]);
  
  // --- STATE CHAT ---
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(null);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [reply, setReply] = useState('');
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const lastMessageCount = useRef(0);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      alert("Halaman ini khusus Admin!");
      navigate('/');
      return;
    }

    fetchBookings();
    fetchContacts();

    const interval = setInterval(() => {
        fetchBookings();
        fetchContacts();
        
        if (selectedContact) {
            fetchChatHistory(selectedContact.id);
        }
    }, 3000);

    return () => clearInterval(interval);
  }, [user, selectedContact]); 

  useEffect(() => {
    const handleClickOutside = (event: any) => {
        if (!event.target.closest('.dropdown-container')) {
            setOpenDropdownId(null);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (activeTab === 'chat') {
        if (chatMessages.length === 0) {
            lastMessageCount.current = 0;
        } else if (chatMessages.length > lastMessageCount.current) {
            scrollToBottom();
            lastMessageCount.current = chatMessages.length;
        }
    }
  }, [chatMessages, activeTab]);

  // --- API CALLS ---

  const fetchBookings = async () => {
    try {
      const res = await fetch('http://localhost/beres-api/get_bookings.php');
      const data = await res.json();
      if (data.success) setBookings(data.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const fetchContacts = async () => {
    try {
        const res = await fetch('http://localhost/beres-api/get_chat_contacts.php');
        const data = await res.json();
        if (data.success) {
            setContacts(data.data);
        }
    } catch (e) { console.error(e); }
  };

  const fetchChatHistory = async (userId: string) => {
      try {
          const res = await fetch(`http://localhost/beres-api/get_chat_history.php?user_id=${userId}`);
          const data = await res.json();
          if (data.success) {
              setChatMessages(data.data);
          }
      } catch (e) { console.error(e); }
  };

  const handleContactSelect = (contact: ChatContact) => {
      setSelectedContact(contact);
      setChatMessages([]); 
      lastMessageCount.current = 0; 
      fetchChatHistory(contact.id);
  };

  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim() || !user || !selectedContact) return;

    try {
        await fetch('http://localhost/beres-api/send_messages.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sender_id: user.id,
                receiver_id: selectedContact.id,
                content: reply,
                role: 'admin'
            })
        });
        setReply('');
        fetchChatHistory(selectedContact.id);
    } catch (e) { alert("Gagal kirim pesan"); }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
        const res = await fetch('http://localhost/beres-api/update_booking.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, status: newStatus })
        });
        const data = await res.json();
        if (data.success) {
            alert(`Status diubah: ${newStatus}`);
            fetchBookings();
            setOpenDropdownId(null);
        }
    } catch (e) { alert("Error koneksi"); }
  };

  const handleLogout = async () => {
    if (window.confirm('Keluar?')) {
        if (signOut) await signOut();
        navigate('/login');
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, 100);
  };

  const toggleDropdown = (id: string) => {
    if (openDropdownId === id) {
        setOpenDropdownId(null);
    } else {
        setOpenDropdownId(id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Selesai': return 'bg-green-100 text-green-800';
      case 'Diproses': return 'bg-blue-100 text-blue-800';
      case 'Dibatalkan': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) return <div className="p-8 text-center">Loading Dashboard...</div>;

  return (
    <div className="w-full h-screen flex flex-col bg-gray-50 px-6 py-6 overflow-hidden">
      
      {/* Header Dashboard */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 flex-shrink-0">
        <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
            <p className="text-gray-500">Panel Kontrol Utama</p>
        </div>
        <div className="flex items-center gap-3">
            <div className="bg-green-50 px-4 py-2 rounded-full text-green-700 font-bold border border-green-200">
                Halo, {user?.name}
            </div>
            <button onClick={handleLogout} className="bg-red-50 text-red-600 p-2 rounded-full border border-red-200 hover:bg-red-100">
                <LogOut size={20} />
            </button>
        </div>
      </div>

      {/* Tabs Navigasi */}
      <div className="flex space-x-4 border-b border-gray-200 mb-6 flex-shrink-0">
        <button onClick={() => setActiveTab('orders')} className={`pb-3 px-4 flex items-center gap-2 font-medium border-b-2 ${activeTab === 'orders' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            <ClipboardList size={20} /> Daftar Pesanan
        </button>
        <button onClick={() => setActiveTab('chat')} className={`pb-3 px-4 flex items-center gap-2 font-medium border-b-2 ${activeTab === 'chat' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            <MessageCircle size={20} /> Live Chat
        </button>
      </div>

      {/* KONTEN UTAMA */}
      <div className="flex-1 overflow-hidden relative">
        
        {/* --- TAB PESANAN (DENGAN DROPDOWN) --- */}
        {activeTab === 'orders' && (
            <div className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden h-full flex flex-col absolute inset-0">
                <div className="overflow-auto flex-1 pb-20"> {/* pb-20 agar dropdown paling bawah tidak terpotong */}
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Layanan</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Pelanggan</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Tanggal</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {bookings.length === 0 ? (
                           <tr>
                              <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Belum ada pesanan masuk.</td>
                           </tr>
                      ) : (
                          bookings.map((booking) => (
                            <tr key={booking.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4">{booking.service_name}</td>
                              <td className="px-6 py-4">{booking.customer_name}</td>
                              <td className="px-6 py-4">{booking.booking_date}</td>
                              <td className="px-6 py-4"><span className={`px-2 text-xs font-bold rounded-full ${getStatusColor(booking.status)}`}>{booking.status}</span></td>
                              
                              {/* KOLOM AKSI (DROPDOWN) */}
                              <td className="px-6 py-4 text-center relative">
                                <div className="dropdown-container inline-block">
                                    <button 
                                        onClick={() => toggleDropdown(booking.id)} 
                                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors focus:outline-none"
                                    >
                                        <MoreVertical size={20} />
                                    </button>

                                    {/* MENU DROPDOWN */}
                                    {openDropdownId === booking.id && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50 animate-fade-in origin-top-right">
                                            <div className="py-1">
                                                {booking.status === 'Pending' && (
                                                    <button 
                                                        onClick={() => updateStatus(booking.id, 'Diproses')}
                                                        className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2"
                                                    >
                                                        <Loader size={16} /> Proses Pesanan
                                                    </button>
                                                )}
                                                
                                                {booking.status === 'Diproses' && (
                                                    <button 
                                                        onClick={() => updateStatus(booking.id, 'Selesai')}
                                                        className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 flex items-center gap-2"
                                                    >
                                                        <CheckCircle size={16} /> Selesaikan
                                                    </button>
                                                )}

                                                {(booking.status !== 'Selesai' && booking.status !== 'Dibatalkan') ? (
                                                    <button 
                                                        onClick={() => updateStatus(booking.id, 'Dibatalkan')}
                                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                    >
                                                        <XCircle size={16} /> Batalkan Pesanan
                                                    </button>
                                                ) : (
                                                    <span className="block w-full text-center px-4 py-2 text-xs text-gray-400 italic">
                                                        Tidak ada aksi tersedia
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
            </div>
        )}

        {/* --- TAB CHAT --- */}
        {activeTab === 'chat' && (
            <div className="bg-white shadow-lg rounded-xl border border-gray-200 flex overflow-hidden absolute inset-0">
                
                {/* 1. SIDEBAR KONTAK */}
                <div className="w-1/3 md:w-1/4 border-r border-gray-200 flex flex-col bg-gray-50">
                    <div className="p-4 border-b border-gray-200 bg-white">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input type="text" placeholder="Cari..." className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-1 focus:ring-green-500" />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {contacts.length === 0 ? (
                            <p className="p-4 text-center text-gray-500 text-sm">Belum ada pelanggan.</p>
                        ) : (
                            contacts.map((contact) => (
                                <div 
                                    key={contact.id}
                                    onClick={() => handleContactSelect(contact)}
                                    className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-100 transition-colors border-b border-gray-100 ${selectedContact?.id === contact.id ? 'bg-green-50 border-l-4 border-l-green-600' : ''}`}
                                >
                                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-bold flex-shrink-0">
                                        {contact.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-900 truncate">{contact.name}</h3>
                                        <p className="text-xs text-gray-500 truncate">{contact.email}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* 2. AREA CHAT */}
                <div className="flex-1 flex flex-col bg-white min-w-0">
                    {selectedContact ? (
                        <>
                            <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center gap-3 flex-shrink-0">
                                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                                    {selectedContact.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{selectedContact.name}</h3>
                                    <p className="text-xs text-green-600">Online</p>
                                </div>
                            </div>

                            <div className="flex-1 p-6 overflow-y-auto bg-[#e5ded8] space-y-3">
                                {chatMessages.length === 0 ? (
                                    <p className="text-center text-gray-500 text-sm mt-10 bg-white/50 p-2 rounded inline-block mx-auto">Belum ada riwayat chat.</p>
                                ) : (
                                    chatMessages.map((msg) => (
                                        <div key={msg.id} className={`flex ${msg.role === 'admin' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] rounded-lg px-4 py-2 text-sm shadow-sm relative ${
                                                msg.role === 'admin' 
                                                ? 'bg-[#d9fdd3] text-gray-900 rounded-tr-none' 
                                                : 'bg-white text-gray-900 rounded-tl-none'
                                            }`}>
                                                {msg.content}
                                                <div className="text-[10px] text-gray-500 text-right mt-1 opacity-70">
                                                    {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                                <div ref={chatEndRef} />
                            </div>

                            <form onSubmit={sendReply} className="p-4 bg-gray-100 border-t border-gray-200 flex-shrink-0">
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        value={reply} 
                                        onChange={(e) => setReply(e.target.value)} 
                                        placeholder="Ketik pesan..." 
                                        className="flex-1 px-4 py-3 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-green-500" 
                                    />
                                    <button 
                                        type="submit" 
                                        disabled={!reply.trim()} 
                                        className="bg-green-600 text-white p-3 rounded-full hover:bg-green-700 transition-colors disabled:opacity-50 flex-shrink-0"
                                    >
                                        <Send size={20} />
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-gray-400">
                            <MessageSquare size={64} className="mb-4 opacity-20" />
                            <h3 className="text-lg font-semibold text-gray-500">Beres.in Web Chat</h3>
                            <p className="text-sm">Pilih salah satu pelanggan untuk mulai membalas pesan.</p>
                        </div>
                    )}
                </div>

            </div>
        )}

      </div>
    </div>
  );
}
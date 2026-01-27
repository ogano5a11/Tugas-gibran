import { useState, useEffect, useRef, useContext } from 'react';
import { MessageCircle, X, Send, Loader } from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';

interface Message {
  id: string;
  content: string;
  role: 'customer' | 'admin';
  created_at: string;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const authContext = useContext(AuthContext);
  const user = authContext?.user;

  useEffect(() => {
    let interval: any;

    if (isOpen) {
      fetchMessages();
      interval = setInterval(() => {
        fetchMessages(false);
      }, 3000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen]);

  // FUNGSI FETCH KE PHP
  const fetchMessages = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = await fetch('http://localhost/beres-api/get_messages.php');
      const data = await res.json();
      
      if (data.success) {
        setMessages((prev) => {
             if (prev.length !== data.data.length) {
                 setTimeout(scrollToBottom, 100);
                 return data.data;
             }
             return prev;
        });
      }
    } catch (error) {
      console.error("Gagal ambil pesan:", error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    if (!user) {
      alert("Silakan login untuk mengirim pesan.");
      return;
    }

    try {
      // KIRIM KE PHP
      const response = await fetch('http://localhost/beres-api/send_messages.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender_id: user.id,
          content: newMessage,
          role: 'customer'
        }),
      });

      const result = await response.json();

      if (result.success) {
        setNewMessage('');
        fetchMessages(false);
      } else {
        alert("Gagal mengirim pesan");
      }

    } catch (error: any) {
      console.error("Gagal kirim pesan:", error);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {/* Jendela Chat */}
      {isOpen && (
        <div className="bg-white rounded-lg shadow-xl w-80 sm:w-96 mb-4 overflow-hidden border border-gray-200 flex flex-col h-[500px]">
          {/* Header */}
          <div className="bg-green-600 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
              <h3 className="font-semibold">Chat Admin</h3>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="hover:bg-green-700 p-1 rounded transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Area Pesan */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            {loading ? (
              <div className="flex justify-center mt-4 text-gray-400">
                <Loader className="animate-spin" size={24} />
              </div>
            ) : messages.length === 0 ? (
              <p className="text-center text-gray-500 text-sm mt-4">
                Halo! Ada yang bisa kami bantu? Silakan tulis pesan Anda.
              </p>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'customer' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 text-sm shadow-sm ${
                        msg.role === 'customer'
                          ? 'bg-green-600 text-white rounded-tr-none'
                          : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Tulis pesan..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="bg-green-600 text-white p-2 rounded-full hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={18} />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tombol Floating */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${
          isOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-green-600 hover:bg-green-700'
        } text-white p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 flex items-center justify-center`}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
    </div>
  );
}
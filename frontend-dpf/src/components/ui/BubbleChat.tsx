import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle, faPaperPlane, faComments } from "@fortawesome/free-solid-svg-icons";
import http from "../../lib/http";

type Message = {
    id: number;
    consultation_id: number;
    sender_type: "user" | "admin";
    sender_id: number | null;
    message: string;
    is_read: boolean;
    created_at: string;
};

type BubbleChatProps = {
    consultationId: number;
    onNewMessage?: () => void;
};

export function BubbleChat({ consultationId, onNewMessage }: BubbleChatProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Load messages
    const loadMessages = async () => {
        try {
            const res = await http.get<Message[]>(`/admin/consultations/${consultationId}/messages`);
            setMessages(res.data);
            setTimeout(scrollToBottom, 100);
        } catch (error) {
            console.error("Failed to load messages:", error);
        } finally {
            setLoading(false);
        }
    };

    // Send message
    const sendMessage = async () => {
        if (!newMessage.trim() || sending) return;

        setSending(true);
        try {
            const res = await http.post<Message>(`/admin/consultations/${consultationId}/messages`, {
                message: newMessage.trim(),
            });

            setMessages((prev) => [...prev, res.data]);
            setNewMessage("");
            setTimeout(scrollToBottom, 100);

            if (onNewMessage) onNewMessage();
        } catch (error) {
            console.error("Failed to send message:", error);
        } finally {
            setSending(false);
        }
    };

    // Mark as read
    const markAsRead = async () => {
        try {
            await http.post(`/admin/consultations/${consultationId}/messages/mark-read`);
            setUnreadCount(0);
            setMessages((prev) =>
                prev.map((msg) => (msg.sender_type === "user" ? { ...msg, is_read: true } : msg))
            );
        } catch (error) {
            console.error("Failed to mark as read:", error);
        }
    };

    // Load unread count
    const loadUnreadCount = async () => {
        try {
            const res = await http.get<{ count: number }>(`/admin/consultations/${consultationId}/messages/unread-count`);
            setUnreadCount(res.data.count);
        } catch (error) {
            console.error("Failed to load unread count:", error);
        }
    };

    // Initial load & Polling
    useEffect(() => {
        loadMessages();
        loadUnreadCount();

        const interval = setInterval(() => {
            // Silent polling
            http.get<Message[]>(`/admin/consultations/${consultationId}/messages`)
                .then((res) => {
                    setMessages((prev) => {
                        if (res.data.length !== prev.length) {
                            const newMessages = res.data;
                            // Check for new user messages to trigger notification/scroll
                            const oldUserMsgCount = prev.filter(m => m.sender_type === 'user').length;
                            const newUserMsgCount = newMessages.filter(m => m.sender_type === 'user').length;

                            if (newUserMsgCount > oldUserMsgCount) {
                                if (onNewMessage) onNewMessage();
                                setTimeout(scrollToBottom, 100);
                            }
                            return newMessages;
                        }
                        return prev;
                    });

                    loadUnreadCount();
                })
                .catch(console.error);
        }, 2000); // Poll every 2 seconds

        return () => clearInterval(interval);
    }, [consultationId]);

    // Format time
    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
        }).format(date);
    };

    return (
        <div className="flex h-full flex-col rounded-[28px] border border-primary-100 bg-white shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 p-5">
                <div className="flex items-center gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-700 ring-1 ring-primary-100">
                        <FontAwesomeIcon icon={faComments} />
                    </span>
                    <div>
                        <h3 className="font-heading text-lg font-semibold text-slate-900">Chat Konsultasi</h3>
                        <p className="text-xs text-slate-500">Real-time messaging (Polling)</p>
                    </div>
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={markAsRead}
                        className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 ring-1 ring-amber-100 transition hover:bg-amber-100"
                    >
                        <FontAwesomeIcon icon={faCircle} className="h-2 w-2" />
                        {unreadCount} baru
                    </button>
                )}
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-4 overflow-y-auto p-5" style={{ maxHeight: "500px" }}>
                {loading ? (
                    <div className="flex items-center justify-center py-10">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                        <FontAwesomeIcon icon={faComments} className="mb-3 text-4xl text-slate-300" />
                        <p className="text-sm font-semibold text-slate-500">Belum ada pesan</p>
                        <p className="mt-1 text-xs text-slate-400">Mulai percakapan dengan mengirim pesan</p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.sender_type === "admin" ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`max-w-[75%] rounded-2xl px-4 py-3 ${msg.sender_type === "admin"
                                        ? "bg-primary-600 text-white"
                                        : "bg-slate-100 text-slate-900"
                                    }`}
                            >
                                <p className="text-sm leading-relaxed">{msg.message}</p>
                                <p
                                    className={`mt-1 text-[10px] font-semibold ${msg.sender_type === "admin" ? "text-primary-100" : "text-slate-500"
                                        }`}
                                >
                                    {formatTime(msg.created_at)}
                                </p>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-slate-200 p-4">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        sendMessage();
                    }}
                    className="flex items-center gap-3"
                >
                    <input
                        ref={inputRef}
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Ketik pesan..."
                        className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-primary-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100"
                        disabled={sending}
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-sm transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                        <FontAwesomeIcon icon={faPaperPlane} />
                    </button>
                </form>
            </div>
        </div>
    );
}

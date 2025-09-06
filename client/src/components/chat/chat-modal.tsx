import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Send, X } from "lucide-react";
import { Message } from "@shared/schema";

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  interventionId: number;
  otherUser: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
  };
}

export default function ChatModal({ isOpen, onClose, interventionId, otherUser }: ChatModalProps) {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState("");
  const [ws, setWs] = useState<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Fetch messages
  const { data: messages, isLoading } = useQuery({
    queryKey: [`/api/messages/${interventionId}`],
    enabled: isOpen,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest("POST", "/api/messages", {
        interventionId,
        receiverId: otherUser.id,
        content,
      });
    },
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: [`/api/messages/${interventionId}`] });
    },
  });

  // WebSocket connection
  useEffect(() => {
    if (isOpen && user) {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      const socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        // Authenticate with the WebSocket
        socket.send(JSON.stringify({
          type: 'auth',
          userId: user.id,
        }));
        setWs(socket);
      };

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'message' && data.data.interventionId === interventionId) {
          // Refresh messages when new message received
          queryClient.invalidateQueries({ queryKey: [`/api/messages/${interventionId}`] });
        }
      };

      socket.onclose = () => {
        setWs(null);
      };

      return () => {
        socket.close();
      };
    }
  }, [isOpen, user, interventionId, queryClient]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    sendMessageMutation.mutate(newMessage);
    
    // Send via WebSocket for real-time delivery
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'chat',
        interventionId,
        receiverId: otherUser.id,
        content: newMessage,
      }));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (dateInput: Date | string | null | undefined) => {
    if (!dateInput) {
      return ''; // Ou gérer selon le besoin, par exemple 'N/A'
    }
    const date = new Date(dateInput);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md h-96 flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="flex flex-row items-center justify-between p-4 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <Avatar className="w-8 h-8">
              <AvatarImage 
                src={otherUser.profileImageUrl} 
                alt={`${otherUser.firstName} ${otherUser.lastName}`} 
              />
              <AvatarFallback>
                {otherUser.firstName[0]}{otherUser.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-base">
                {otherUser.firstName} {otherUser.lastName}
              </DialogTitle>
              <p className="text-xs text-green-600">En ligne</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto chat-messages space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="loading-skeleton h-12 rounded-lg"></div>
              ))}
            </div>
          ) : Array.isArray(messages) && messages.length === 0 ? (
            <div className="text-center text-slate-500 py-8">
              <p>Aucun message. Démarrez la conversation !</p>
            </div>
          ) : (
            <>
              {Array.isArray(messages) && messages.map((message: Message) => (
                <div 
                  key={message.id} 
                  className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`chat-bubble ${
                      message.senderId === user?.id ? 'chat-bubble-sent' : 'chat-bubble-received'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.senderId === user?.id ? 'text-blue-200' : 'text-slate-500'
                    }`}>
                      {formatTime(message.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center space-x-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Tapez votre message..."
              disabled={sendMessageMutation.isPending}
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sendMessageMutation.isPending}
              size="sm"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

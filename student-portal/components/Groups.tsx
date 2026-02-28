
import React, { useState, useEffect, useRef } from 'react';
import { Message, Group, Attachment } from '../types';
import { Send, Users, MoreVertical, Paperclip, X, FileText, Download, File, Plus, Hash, Zap, Pin, BarChart2, Check, Copy, Image as ImageIcon, Video, Music, LogOut, Shield, Crown, Settings, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { io, Socket } from 'socket.io-client';

interface GroupsProps {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  groups?: Group[];
  setGroups?: React.Dispatch<React.SetStateAction<Group[]>>;
}

interface PendingAttachment extends Attachment {
    file?: File;
}

const uploadFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async () => {
            try {
                const response = await fetch('/api/upload', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: file.name,
                        type: file.type,
                        data: reader.result
                    })
                });
                const data = await response.json();
                resolve(data.url);
            } catch (err) {
                reject(err);
            }
        };
        reader.readAsDataURL(file);
    });
};

const Groups: React.FC<GroupsProps> = ({ messages, setMessages, groups = [], setGroups }) => {
  const [activeGroupId, setActiveGroupId] = useState<string>('');
  const [inputText, setInputText] = useState('');
  const [pendingAttachment, setPendingAttachment] = useState<PendingAttachment | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'JOIN' | 'CREATE'>('JOIN');
  const [joinCode, setJoinCode] = useState('');
  const [createName, setCreateName] = useState('');

  // New Modal States for Header Actions
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Poll Creation State
  const [isPollModalOpen, setIsPollModalOpen] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const socketRef = useRef<Socket | null>(null);
  
  const myGroups = groups.filter(g => g.members.includes('me'));
  const activeGroup = myGroups.find(g => g.id === activeGroupId);
  
  // Sorting messages client-side by createdAt (oldest to newest)
  const activeMessages = messages
    .filter(m => m.groupId === activeGroupId)
    .sort((a, b) => a.createdAt - b.createdAt);
    
  const pinnedMessages = activeMessages.filter(m => m.isPinned);

  // Initialize Socket
  useEffect(() => {
    socketRef.current = io();
    const socket = socketRef.current;

    socket.on('connect', () => {
        console.log('Connected to server');
        // Join all my groups to receive updates
        groups.forEach(g => {
            if (g.members.includes('me')) {
                socket.emit('join_group', g.id);
            }
        });
    });

    socket.on('receive_message', (message: Message) => {
        setMessages(prev => {
            if (prev.some(m => m.id === message.id)) return prev;
            return [...prev, message];
        });
    });

    socket.on('history', (historyMessages: Message[]) => {
        setMessages(prev => {
            const existingIds = new Set(prev.map(m => m.id));
            const newMsgs = historyMessages.filter(m => !existingIds.has(m.id));
            return [...prev, ...newMsgs];
        });
    });

    socket.on('poll_updated', (updatedMsg: Message) => {
        setMessages(prev => prev.map(m => m.id === updatedMsg.id ? updatedMsg : m));
    });

    return () => {
        socket.disconnect();
    };
  }, []); // Run once on mount

  // Join group when active group changes (to ensure we get history/updates)
  useEffect(() => {
      if (activeGroupId && socketRef.current) {
          socketRef.current.emit('join_group', activeGroupId);
      }
  }, [activeGroupId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages.length, pendingAttachment]);

  // Set initial active group if none selected
  useEffect(() => {
    if (!activeGroupId && myGroups.length > 0) {
        setActiveGroupId(myGroups[0].id);
    } else if (activeGroupId && !myGroups.find(g => g.id === activeGroupId)) {
        setActiveGroupId(myGroups.length > 0 ? myGroups[0].id : '');
    }
  }, [groups, activeGroupId]);

  // --- Logic: Group Management ---

  const generateInviteCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createName.trim() || !setGroups) return;
    
    const newGroup: Group = {
        id: Date.now().toString(),
        name: createName,
        inviteCode: generateInviteCode(),
        members: ['me'],
        createdBy: 'me',
        createdAt: Date.now(),
        type: 'PROJECT'
    };
    
    setGroups(prev => [...prev, newGroup]);
    socketRef.current?.emit('join_group', newGroup.id);
    setActiveGroupId(newGroup.id);
    setCreateName('');
    setIsModalOpen(false);
  };

  const handleJoinGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim() || !setGroups) return;
    
    const groupToJoin = groups.find(g => g.inviteCode === joinCode.trim());
    if (groupToJoin) {
        if (!groupToJoin.members.includes('me')) {
            const updatedGroup = { ...groupToJoin, members: [...groupToJoin.members, 'me'] };
            setGroups(prev => prev.map(g => g.id === groupToJoin.id ? updatedGroup : g));
        }
        socketRef.current?.emit('join_group', groupToJoin.id);
        setActiveGroupId(groupToJoin.id);
        setJoinCode('');
        setIsModalOpen(false);
    } else {
        alert("Invalid Invite Code");
    }
  };

  const handleLeaveGroup = () => {
    if (!activeGroup || !setGroups) return;
    if (window.confirm(`Are you sure you want to leave ${activeGroup.name}?`)) {
       setGroups(prevGroups => prevGroups.map(g => {
           if (g.id === activeGroup.id) {
               return { ...g, members: g.members.filter(m => m !== 'me') };
           }
           return g;
       }));
       socketRef.current?.emit('leave_group', activeGroup.id);
       setIsSettingsModalOpen(false);
       setActiveGroupId(''); // Force re-selection
    }
  };

  const handleDeleteGroup = () => {
     if (!activeGroup || !setGroups) return;
     if (window.confirm(`Are you sure you want to delete ${activeGroup.name}? This cannot be undone.`)) {
         setGroups(prevGroups => prevGroups.filter(g => g.id !== activeGroup.id));
         setIsSettingsModalOpen(false);
         setActiveGroupId(''); // Force re-selection
     }
  };

  const copyInviteCode = () => {
      if (activeGroup) {
          navigator.clipboard.writeText(activeGroup.inviteCode);
      }
  };

  // --- Logic: Attachments ---

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    let type: Attachment['type'] = 'other';
    if (file.type.startsWith('image/')) type = 'image';
    else if (file.type.startsWith('video/')) type = 'video';
    else if (file.type.startsWith('audio/')) type = 'audio';
    else if (file.type === 'application/pdf') type = 'pdf';
    else if (file.type.includes('word') || file.type.includes('document')) type = 'doc';
    else if (file.name.endsWith('.docx')) type = 'docx';

    // Simulate file object (using createObjectURL for local preview)
    const url = URL.createObjectURL(file);
    setPendingAttachment({
        name: file.name,
        type,
        url,
        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
        file: file // Store raw file for upload
    });
    
    e.target.value = ''; // Reset input
  };

  // --- Logic: Messaging & Pinning ---

  const togglePin = (msgId: string) => {
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, isPinned: !m.isPinned } : m));
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && !pendingAttachment) || !activeGroupId) return;

    setIsUploading(true);
    let finalAttachment: Attachment | undefined = undefined;

    if (pendingAttachment) {
        if (pendingAttachment.file) {
            try {
                const uploadedUrl = await uploadFile(pendingAttachment.file);
                finalAttachment = {
                    name: pendingAttachment.name,
                    type: pendingAttachment.type,
                    url: uploadedUrl,
                    size: pendingAttachment.size
                };
            } catch (error) {
                console.error("File upload failed:", error);
                alert("Failed to upload file. Please try again.");
                setIsUploading(false);
                return;
            }
        } else {
            finalAttachment = pendingAttachment;
        }
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: 'me',
      senderName: 'Me',
      text: inputText,
      createdAt: Date.now(),
      isMe: true,
      groupId: activeGroupId,
      type: 'text',
      isPinned: false,
      attachment: finalAttachment
    };

    // Optimistic update
    setMessages(prev => [...prev, newMessage]);
    
    socketRef.current?.emit('send_message', { groupId: activeGroupId, message: newMessage });

    setInputText('');
    setPendingAttachment(null);
    setIsUploading(false);
  };
  
  // --- Logic: Polls ---

  const handleCreatePoll = () => {
    if (!pollQuestion.trim() || pollOptions.some(o => !o.trim())) return;
    
    const pollMsg: Message = {
        id: Date.now().toString(),
        senderId: 'me',
        senderName: 'Me',
        text: '',
        createdAt: Date.now(),
        isMe: true,
        groupId: activeGroupId,
        type: 'poll',
        isPinned: false,
        pollData: {
            question: pollQuestion,
            options: pollOptions.map((opt, i) => ({ id: `opt-${i}`, text: opt })),
            votes: {}
        }
    };
    
    setMessages(prev => [...prev, pollMsg]);
    socketRef.current?.emit('send_message', { groupId: activeGroupId, message: pollMsg });

    setIsPollModalOpen(false);
    setPollQuestion('');
    setPollOptions(['', '']);
  };

  const handleVote = (msgId: string, optionId: string) => {
    // Optimistic update
    setMessages(prev => prev.map(msg => {
        if (msg.id !== msgId || !msg.pollData) return msg;
        const newVotes = { ...msg.pollData.votes, 'me': optionId };
        return { ...msg, pollData: { ...msg.pollData, votes: newVotes } };
    }));

    socketRef.current?.emit('update_poll', { 
        groupId: activeGroupId, 
        messageId: msgId, 
        optionId, 
        userId: 'me' 
    });
  };

  // --- Render Helpers ---

  const renderAttachment = (attachment: Attachment) => {
      if (attachment.type === 'image') {
          return (
              <div className="mb-2 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-black">
                  <img src={attachment.url} alt={attachment.name} className="max-w-full max-h-64 object-contain" />
              </div>
          );
      }
      
      if (attachment.type === 'video') {
          return (
              <div className="mb-2 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-black">
                  <video src={attachment.url} controls className="max-w-full max-h-64" />
              </div>
          );
      }

      if (attachment.type === 'audio') {
          return (
              <div className="mb-2 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 flex items-center gap-3 min-w-[200px]">
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <Music className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate mb-1">{attachment.name}</p>
                      <audio src={attachment.url} controls className="w-full h-6" />
                  </div>
              </div>
          );
      }

      // Default for PDF, Doc, Other
      let Icon = File;
      if (attachment.type === 'pdf') Icon = FileText;
      if (attachment.type === 'doc' || attachment.type === 'docx') Icon = FileText;
      
      return (
          <a href={attachment.url} download={attachment.name} className="flex items-center gap-3 p-3 mb-2 bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 transition-colors group/file text-left max-w-full">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center text-orange-600 dark:text-orange-400 flex-shrink-0">
                  <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">{attachment.name}</p>
                  <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">{attachment.size || 'FILE'}</p>
              </div>
              <Download className="w-4 h-4 text-zinc-400 group-hover/file:text-zinc-600 dark:group-hover/file:text-white transition-colors" />
          </a>
      );
  };

  const renderPoll = (msg: Message) => {
    if (!msg.pollData) return null;
    const totalVotes = Object.keys(msg.pollData.votes).length;
    
    return (
        <div className="min-w-[260px]">
            <p className="font-bold text-sm mb-3">{msg.pollData.question}</p>
            <div className="space-y-2">
                {msg.pollData.options.map(opt => {
                    const votesForOpt = Object.values(msg.pollData.votes || {}).filter(v => v === opt.id).length;
                    const percent = totalVotes === 0 ? 0 : Math.round((votesForOpt / totalVotes) * 100);
                    const isVoted = msg.pollData?.votes['me'] === opt.id;

                    return (
                        <div key={opt.id} onClick={() => handleVote(msg.id, opt.id)} className="cursor-pointer relative group">
                            <div className="flex justify-between text-xs font-semibold mb-1 relative z-10 px-1">
                                <span>{opt.text}</span>
                                <span>{percent}%</span>
                            </div>
                            <div className={`h-9 rounded-lg border relative overflow-hidden transition-all ${isVoted ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20' : 'border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900'}`}>
                                <div 
                                    className={`absolute inset-y-0 left-0 transition-all duration-500 ${isVoted ? 'bg-violet-200 dark:bg-violet-500/30' : 'bg-zinc-200 dark:bg-zinc-700'}`} 
                                    style={{ width: `${percent}%` }} 
                                />
                                <div className="absolute inset-0 flex items-center px-3">
                                   <span className="text-xs font-medium z-10 truncate w-full">{opt.text}</span>
                                </div>
                                {isVoted && <Check className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-500" />}
                            </div>
                        </div>
                    );
                })}
            </div>
            <p className="text-[10px] text-zinc-400 mt-2 text-right font-bold uppercase tracking-wider">{totalVotes} Votes</p>
        </div>
    );
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex rounded-[2rem] overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl relative">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,video/*,audio/*,.pdf,.doc,.docx" className="hidden" />

      {/* 1. Group Management (Left Sidebar) */}
      <div className="w-80 border-r border-zinc-100 dark:border-zinc-800 flex flex-col hidden md:flex bg-zinc-50/50 dark:bg-zinc-950/50">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
           <h3 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">Groups</h3>
           <button onClick={() => setIsModalOpen(true)} className="p-2 bg-white dark:bg-zinc-800 hover:bg-violet-100 dark:hover:bg-violet-900/30 text-zinc-500 hover:text-violet-600 rounded-xl transition-colors border border-zinc-200 dark:border-zinc-700 shadow-sm">
               <Plus className="w-5 h-5" />
           </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {myGroups.map(group => (
              <div 
                key={group.id}
                onClick={() => setActiveGroupId(group.id)}
                className={`p-4 rounded-2xl cursor-pointer transition-all border group relative ${
                    activeGroupId === group.id 
                    ? 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 shadow-lg' 
                    : 'bg-transparent border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                    <h4 className={`text-sm font-bold ${activeGroupId === group.id ? 'text-zinc-900 dark:text-white' : 'text-zinc-500 dark:text-zinc-400'}`}>{group.name}</h4>
                    {group.type === 'CLASS' && <Hash className="w-3 h-3 text-zinc-400" />}
                    {group.type === 'PROJECT' && <Zap className="w-3 h-3 text-amber-400" />}
                </div>
                <div className="flex justify-between items-end mt-2">
                    <span className="text-[10px] font-bold bg-zinc-100 dark:bg-zinc-900 px-2 py-1 rounded text-zinc-400 font-mono tracking-wider">{group.inviteCode}</span>
                    <p className="text-[10px] text-zinc-400">{group.members.length} members</p>
                </div>
              </div>
          ))}
          {myGroups.length === 0 && (
             <div className="flex flex-col items-center justify-center py-10 text-center text-zinc-400">
                <Users className="w-10 h-10 mb-3 opacity-20" />
                <p className="text-xs font-bold uppercase tracking-wider">No Groups Yet</p>
                <button onClick={() => setIsModalOpen(true)} className="mt-4 text-xs font-bold text-violet-500 hover:underline">Create One</button>
             </div>
          )}
        </div>
      </div>

      {/* 2. Real-Time Chat (Right Panel) */}
      {activeGroup ? (
        <div className="flex-1 flex flex-col bg-white dark:bg-zinc-900 relative">
          
          {/* Header */}
          <div className="h-20 flex-shrink-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-8 z-20">
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-lg shadow-violet-500/20 font-bold text-lg select-none">
                   {activeGroup.name.charAt(0)}
                </div>
                <div className="min-w-0">
                   <h3 className="font-bold text-lg text-zinc-900 dark:text-white leading-none truncate">{activeGroup.name}</h3>
                   <button onClick={copyInviteCode} className="flex items-center gap-2 mt-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded px-1.5 py-0.5 -ml-1.5 transition-colors group/code">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Code:</span>
                      <span className="text-[10px] font-mono font-bold text-zinc-600 dark:text-zinc-300 group-hover/code:text-violet-500 transition-colors">{activeGroup.inviteCode}</span>
                      <Copy className="w-3 h-3 text-zinc-300 group-hover/code:text-violet-500" />
                   </button>
                </div>
             </div>
             <div className="flex items-center gap-2">
                 <button 
                   onClick={() => setIsMembersModalOpen(true)}
                   className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800"
                   title="Members"
                 >
                     <Users className="w-5 h-5" />
                 </button>
                 <button 
                   onClick={() => setIsSettingsModalOpen(true)}
                   className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800"
                   title="Settings"
                 >
                     <Settings className="w-5 h-5" />
                 </button>
             </div>
          </div>

          {/* Sticky Header for Pinned Messages */}
          {pinnedMessages.length > 0 && (
             <div className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 p-2 z-10 overflow-x-auto no-scrollbar flex gap-2 shadow-inner">
                {pinnedMessages.map(msg => (
                    <div key={msg.id} className="flex-shrink-0 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 flex items-start gap-3 w-64 shadow-sm group relative">
                        <Pin className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5 fill-amber-500" />
                        <div className="flex-1 overflow-hidden">
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-0.5">{msg.senderName}</p>
                            <p className="text-xs font-medium text-zinc-900 dark:text-white truncate">{msg.text || (msg.attachment ? `[Attachment: ${msg.attachment.name}]` : '[Poll]')}</p>
                        </div>
                        <button onClick={() => togglePin(msg.id)} className="absolute top-2 right-2 text-zinc-300 hover:text-zinc-500 dark:hover:text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                ))}
             </div>
          )}

          {/* Messages List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/50 dark:bg-black/20">
             {activeMessages.map((msg) => (
               <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'} group relative`}>
                  
                  {/* Avatar for others */}
                  {!msg.isMe && (
                      <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-xs font-bold mr-2 self-end mb-1 border border-indigo-200 dark:border-indigo-800">
                          {msg.senderName.charAt(0)}
                      </div>
                  )}

                  <div className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'} max-w-[85%] sm:max-w-[70%]`}>
                      {!msg.isMe && (
                          <span className="text-[10px] font-bold text-zinc-400 mb-1 ml-1">{msg.senderName}</span>
                      )}
                      
                      <div className={`p-4 rounded-2xl shadow-sm relative text-sm group/bubble ${
                        msg.type === 'poll' 
                            ? 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white w-full'
                            : msg.isMe 
                                ? 'bg-indigo-600 text-white rounded-tr-sm shadow-indigo-500/10' 
                                : 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-tl-sm'
                      }`}>
                          {/* Pin Icon if Pinned */}
                          {msg.isPinned && <Pin className="w-3 h-3 absolute -top-1.5 -right-1.5 bg-amber-400 text-white fill-current rounded-full p-0.5 shadow-sm z-10" />}
                          
                          {/* Pin Action (On Hover) */}
                          <button 
                            onClick={() => togglePin(msg.id)}
                            className={`absolute -right-8 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-zinc-400 hover:text-amber-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 opacity-0 group-hover/bubble:opacity-100 transition-all ${msg.isMe ? '-left-8 right-auto' : '-right-8'}`}
                            title={msg.isPinned ? "Unpin" : "Pin"}
                          >
                             <Pin className={`w-3.5 h-3.5 ${msg.isPinned ? 'fill-amber-500 text-amber-500' : ''}`} />
                          </button>

                          {msg.attachment && renderAttachment(msg.attachment)}
                          
                          {msg.type === 'poll' ? renderPoll(msg) : <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>}
                      </div>
                      
                      <span className="text-[9px] font-bold text-zinc-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity select-none">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                  </div>
               </div>
             ))}
             
             <div ref={messagesEndRef} />
          </div>

          {/* 3. Input Area with File Simulation */}
          <div className="p-4 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 relative z-20">
             
             {/* Preview Chip */}
             {pendingAttachment && (
                 <div className="mb-3 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl flex items-center justify-between animate-in slide-in-from-bottom-2 border border-zinc-200 dark:border-zinc-700 shadow-sm max-w-md">
                     <div className="flex items-center gap-3 overflow-hidden">
                         <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                             {pendingAttachment.type === 'image' ? <ImageIcon className="w-5 h-5" /> : 
                              pendingAttachment.type === 'video' ? <Video className="w-5 h-5" /> : 
                              pendingAttachment.type === 'audio' ? <Music className="w-5 h-5" /> : 
                              <File className="w-5 h-5" />}
                         </div>
                         <div className="min-w-0">
                             <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">{pendingAttachment.name}</p>
                             <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{pendingAttachment.size}</p>
                         </div>
                     </div>
                     <button onClick={() => setPendingAttachment(null)} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full transition-colors text-zinc-500">
                         <X className="w-4 h-4" />
                     </button>
                 </div>
             )}

             <form onSubmit={sendMessage} className="flex items-end gap-2">
                <button type="button" onClick={() => setIsPollModalOpen(true)} className="p-3 text-zinc-400 hover:text-indigo-500 transition-colors bg-zinc-50 dark:bg-zinc-800 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700">
                   <BarChart2 className="w-5 h-5" />
                </button>
                <button type="button" onClick={handleFileClick} className="p-3 text-zinc-400 hover:text-indigo-500 transition-colors bg-zinc-50 dark:bg-zinc-800 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700">
                   <Paperclip className="w-5 h-5" />
                </button>
                <div className="flex-1 bg-zinc-50 dark:bg-zinc-800 rounded-xl flex items-center px-4 border border-zinc-100 dark:border-zinc-800 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
                    <input 
                      type="text" 
                      value={inputText}
                      onChange={e => setInputText(e.target.value)}
                      placeholder={`Message ${activeGroup.name}...`}
                      className="flex-1 bg-transparent py-3 outline-none text-sm font-medium dark:text-white placeholder:text-zinc-400"
                    />
                </div>
                <button type="submit" disabled={(!inputText.trim() && !pendingAttachment) || isUploading} className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 disabled:opacity-50 disabled:scale-100 active:scale-95 transition-all shadow-indigo-500/20 flex items-center justify-center min-w-[3rem]">
                  {isUploading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
             </form>
          </div>

        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-zinc-50 dark:bg-black text-zinc-400">
            <Users className="w-16 h-16 mb-4 opacity-20" />
            <p className="font-bold">Select a group to start chatting</p>
            <button onClick={() => setIsModalOpen(true)} className="mt-4 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-colors">Create a Group</button>
        </div>
      )}

      {/* --- Modals --- */}

      {/* Join/Create Group Modal */}
      <AnimatePresence>
        {isModalOpen && (
            <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-zinc-900 w-full max-w-sm p-8 rounded-[2rem] shadow-2xl border border-zinc-200 dark:border-zinc-800">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-black text-zinc-900 dark:text-white">Groups</h3>
                        <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5 text-zinc-500" /></button>
                    </div>

                    <div className="flex p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl mb-6">
                        <button onClick={() => setModalTab('JOIN')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${modalTab === 'JOIN' ? 'bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-white' : 'text-zinc-500'}`}>Join Group</button>
                        <button onClick={() => setModalTab('CREATE')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${modalTab === 'CREATE' ? 'bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-white' : 'text-zinc-500'}`}>Create New</button>
                    </div>
                    
                    {modalTab === 'JOIN' ? (
                        <form onSubmit={handleJoinGroup} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Invite Code</label>
                                <input type="text" value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} placeholder="XY7B2A" className="w-full mt-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 font-mono font-bold text-lg text-center tracking-widest uppercase focus:ring-2 focus:ring-indigo-500 outline-none" autoFocus />
                            </div>
                            <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg mt-4">Join Group</button>
                        </form>
                    ) : (
                        <form onSubmit={handleCreateGroup} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Group Name</label>
                                <input type="text" value={createName} onChange={e => setCreateName(e.target.value)} placeholder="Project Alpha" className="w-full mt-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-indigo-500 outline-none" autoFocus />
                            </div>
                            <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg mt-4">Create Group</button>
                        </form>
                    )}
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      {/* Members Modal */}
      <AnimatePresence>
        {isMembersModalOpen && activeGroup && (
            <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-zinc-900 w-full max-w-sm p-8 rounded-[2rem] shadow-2xl border border-zinc-200 dark:border-zinc-800">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-black text-zinc-900 dark:text-white flex items-center gap-2"><Users className="w-5 h-5 text-indigo-500" /> Members</h3>
                        <button onClick={() => setIsMembersModalOpen(false)}><X className="w-5 h-5 text-zinc-500" /></button>
                    </div>

                    <div className="max-h-64 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                        {activeGroup.members.map((memberId, idx) => (
                             <div key={idx} className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-700">
                                 <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold uppercase shadow-sm">
                                     {memberId.charAt(0)}
                                 </div>
                                 <div className="flex-1 min-w-0">
                                     <p className="font-bold text-zinc-900 dark:text-white text-sm truncate">{memberId === 'me' ? 'You' : memberId}</p>
                                     <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">{memberId === activeGroup.createdBy ? 'Owner' : 'Member'}</p>
                                 </div>
                                 {memberId === activeGroup.createdBy && <Crown className="w-4 h-4 text-amber-500 fill-amber-500" />}
                             </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      {/* Settings Modal (More Actions) */}
      <AnimatePresence>
        {isSettingsModalOpen && activeGroup && (
            <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-zinc-900 w-full max-w-sm p-8 rounded-[2rem] shadow-2xl border border-zinc-200 dark:border-zinc-800">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-black text-zinc-900 dark:text-white flex items-center gap-2"><Settings className="w-5 h-5 text-zinc-500" /> Group Settings</h3>
                        <button onClick={() => setIsSettingsModalOpen(false)}><X className="w-5 h-5 text-zinc-500" /></button>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Invite Code</label>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 bg-zinc-100 dark:bg-zinc-800 p-4 rounded-xl text-center font-mono text-xl font-bold tracking-widest text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700">
                                    {activeGroup.inviteCode}
                                </div>
                                <button onClick={copyInviteCode} className="p-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg">
                                    <Copy className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="pt-4 space-y-3 border-t border-zinc-100 dark:border-zinc-800">
                             <button 
                                onClick={handleLeaveGroup}
                                className="w-full py-4 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
                             >
                                 <LogOut className="w-4 h-4" /> Leave Group
                             </button>

                             {activeGroup.createdBy === 'me' && (
                                 <button 
                                    onClick={handleDeleteGroup}
                                    className="w-full py-4 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/10 dark:hover:bg-rose-900/20 text-rose-600 dark:text-rose-400 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
                                 >
                                     <Trash2 className="w-4 h-4" /> Delete Group
                                 </button>
                             )}
                        </div>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      {/* Create Poll Modal */}
      <AnimatePresence>
        {isPollModalOpen && (
            <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-zinc-900 w-full max-w-sm p-8 rounded-[2rem] shadow-2xl border border-zinc-200 dark:border-zinc-800">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-black text-zinc-900 dark:text-white flex items-center gap-2"><BarChart2 className="w-5 h-5 text-indigo-500" /> Create Poll</h3>
                        <button onClick={() => setIsPollModalOpen(false)}><X className="w-5 h-5 text-zinc-500" /></button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Question</label>
                            <input type="text" value={pollQuestion} onChange={e => setPollQuestion(e.target.value)} placeholder="When should we meet?" className="w-full mt-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-indigo-500 outline-none" />
                        </div>
                        <div className="space-y-2">
                             <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Options</label>
                             {pollOptions.map((opt, idx) => (
                                 <div key={idx} className="flex gap-2">
                                     <input type="text" value={opt} onChange={e => {
                                         const newOpts = [...pollOptions];
                                         newOpts[idx] = e.target.value;
                                         setPollOptions(newOpts);
                                     }} placeholder={`Option ${idx + 1}`} className="flex-1 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none" />
                                     {pollOptions.length > 2 && <button onClick={() => setPollOptions(pollOptions.filter((_, i) => i !== idx))}><X className="w-4 h-4 text-zinc-400" /></button>}
                                 </div>
                             ))}
                             {pollOptions.length < 5 && (
                                 <button onClick={() => setPollOptions([...pollOptions, ''])} className="text-xs font-bold text-indigo-500 flex items-center gap-1 mt-2"><Plus className="w-3 h-3" /> Add Option</button>
                             )}
                        </div>
                        <button onClick={handleCreatePoll} className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg mt-4">Post Poll</button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Groups;

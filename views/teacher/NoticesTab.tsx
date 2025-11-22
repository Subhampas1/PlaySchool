
import React, { useState } from 'react';
import { Notice, NoticePriority, NoticeCategory } from '../../types';
import Card from '../../components/Card';
import Modal from '../../components/Modal';
import { CheckCircleIcon, MegaphoneIcon } from '../../components/icons';

interface NoticesTabProps {
    notices: Notice[];
    onMarkRead: (noticeId: string) => Promise<void>;
    userId: string;
}

const priorityColors: Record<NoticePriority, { border: string; bg: string }> = {
    normal: { border: 'border-gray-300 dark:border-gray-600', bg: 'bg-white dark:bg-gray-800' },
    high: { border: 'border-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/10' },
    urgent: { border: 'border-red-500', bg: 'bg-red-50 dark:bg-red-900/10' },
};

const categoryConfig: Record<NoticeCategory, { bg: string; color: string }> = {
    'General': { bg: 'bg-gray-100 dark:bg-gray-700', color: 'text-gray-700 dark:text-gray-300' },
    'Academic': { bg: 'bg-indigo-100 dark:bg-indigo-900/50', color: 'text-indigo-700 dark:text-indigo-300' },
    'Holiday': { bg: 'bg-pink-100 dark:bg-pink-900/50', color: 'text-pink-700 dark:text-pink-300' },
    'Event': { bg: 'bg-amber-100 dark:bg-amber-900/50', color: 'text-amber-700 dark:text-amber-300' },
    'Emergency': { bg: 'bg-red-100 dark:bg-red-900/50', color: 'text-red-700 dark:text-red-300' },
    'Fee Reminder': { bg: 'bg-emerald-100 dark:bg-emerald-900/50', color: 'text-emerald-700 dark:text-emerald-300' },
};

const NoticesTab: React.FC<NoticesTabProps> = ({ notices, onMarkRead, userId }) => {
    const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
    const [isMarking, setIsMarking] = useState(false);

    const handleNoticeClick = (notice: Notice) => {
        setSelectedNotice(notice);
    };

    const handleMarkAsRead = async () => {
        if (!selectedNotice) return;
        setIsMarking(true);
        try {
            await onMarkRead(selectedNotice.id);
        } catch (error) {
            alert("Failed to mark as read");
        } finally {
            setIsMarking(false);
            setSelectedNotice(null);
        }
    };

    const isRead = (notice: Notice) => notice.readBy?.includes(userId);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">School Notices</h2>
            {notices.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                    {notices.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(notice => (
                        <Card 
                            key={notice.id} 
                            className={`p-5 border-l-4 cursor-pointer hover:shadow-lg transition-all transform hover:-translate-y-0.5 ${priorityColors[notice.priority].border} ${priorityColors[notice.priority].bg}`}
                        >
                            <div onClick={() => handleNoticeClick(notice)}>
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        {notice.category && (
                                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${categoryConfig[notice.category]?.bg} ${categoryConfig[notice.category]?.color}`}>
                                                {notice.category}
                                            </span>
                                        )}
                                        {!isRead(notice) && (
                                            <span className="flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-rose-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{notice.date}</span>
                                </div>
                                
                                <h3 className={`text-lg font-bold mb-1 ${isRead(notice) ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>
                                    {notice.title}
                                </h3>
                                
                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{notice.content}</p>

                                <div className="mt-3 text-xs text-sky-600 dark:text-sky-400 font-semibold">
                                    Click to view details &rarr;
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="p-8 text-center">
                    <MegaphoneIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 dark:text-gray-400">There are currently no new notices.</p>
                </Card>
            )}

            {/* Notice Details Modal */}
            <Modal
                isOpen={!!selectedNotice}
                onClose={() => setSelectedNotice(null)}
                title=""
            >
                {selectedNotice && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            {selectedNotice.category && (
                                <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${categoryConfig[selectedNotice.category]?.bg} ${categoryConfig[selectedNotice.category]?.color}`}>
                                    {selectedNotice.category}
                                </span>
                            )}
                            <span className="text-sm text-gray-500 dark:text-gray-400">{selectedNotice.date}</span>
                        </div>
                        
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{selectedNotice.title}</h3>
                        
                        <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                            <p className="text-gray-700 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                                {selectedNotice.content}
                            </p>
                        </div>

                        <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                            {isRead(selectedNotice) ? (
                                <button disabled className="w-full flex items-center justify-center gap-2 py-3 bg-gray-100 text-gray-500 font-bold rounded-xl dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed">
                                    <CheckCircleIcon className="w-5 h-5" />
                                    Read
                                </button>
                            ) : (
                                <button 
                                    onClick={handleMarkAsRead}
                                    disabled={isMarking}
                                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
                                >
                                    {isMarking ? 'Updating...' : 'Mark as Read'}
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default NoticesTab;

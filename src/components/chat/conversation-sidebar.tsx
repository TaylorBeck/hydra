'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { 
  MessageSquare, 
  Plus, 
  Search, 
  MoreHorizontal, 
  Archive, 
  Trash2, 
  Edit3,
  Download,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useConversations, useDeleteConversation, useArchiveConversation } from '@/hooks/chat/use-conversations';
import { useAuthContext } from '@/components/auth/auth-provider';
import type { ConversationListItem } from '@/types/chat';
import { cn } from '@/lib/utils';

interface ConversationSidebarProps {
  currentConversationId?: string | null;
  onConversationSelect: (conversationId: string) => void;
  onNewConversation: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
}

interface ConversationItemProps {
  conversation: ConversationListItem;
  isActive: boolean;
  isCollapsed: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onArchive: () => void;
  onExport: () => void;
  onRename: () => void;
}

function ConversationItem({
  conversation,
  isActive,
  isCollapsed,
  onSelect,
  onDelete,
  onArchive,
  onExport,
  onRename,
}: ConversationItemProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'Unknown';
    }
  };

  return (
    <div
      className={cn(
        'group relative flex items-center gap-3 rounded-lg p-3 hover:bg-accent/50 cursor-pointer transition-colors',
        isActive && 'bg-accent',
        isCollapsed && 'justify-center p-2'
      )}
      onClick={onSelect}
    >
      <div className="flex-shrink-0">
        <MessageSquare className="h-4 w-4 text-muted-foreground" />
      </div>
      
      {!isCollapsed && (
        <>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-sm font-medium truncate">
                {conversation.title}
              </h4>
              <Badge variant="secondary" className="text-xs">
                {conversation.model_used.split('-')[0]}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="truncate">
                {conversation.lastMessageContent || 'No messages'}
              </span>
              <span className="flex-shrink-0 ml-2">
                {formatDate(conversation.lastMessageAt || conversation.created_at)}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">
                {conversation.messageCount} messages
              </span>
            </div>
          </div>

          <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(true);
                }}
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onRename(); }}>
                <Edit3 className="mr-2 h-4 w-4" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onExport(); }}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onArchive(); }}>
                <Archive className="mr-2 h-4 w-4" />
                Archive
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}
    </div>
  );
}

export function ConversationSidebar({
  currentConversationId,
  onConversationSelect,
  onNewConversation,
  isCollapsed = false,
  onToggleCollapse,
  className,
}: ConversationSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const { isAuthenticated, isLoading: authLoading } = useAuthContext();
  
  const { 
    data: conversations = [], 
    isLoading: conversationsLoading, 
    error,
    isFetching 
  } = useConversations({
    search: searchQuery,
    archived: showArchived,
  });

  // Add a timeout to prevent infinite loading
  const [hasTimedOut, setHasTimedOut] = useState(false);
  
  useEffect(() => {
    if (conversationsLoading) {
      const timeout = setTimeout(() => {
        setHasTimedOut(true);
      }, 10000); // 10 second timeout
      
      return () => clearTimeout(timeout);
    } else {
      setHasTimedOut(false);
    }
  }, [conversationsLoading]);

  // Determine the actual loading state with better logic
  const shouldShowLoading = !hasTimedOut && (
    authLoading || 
    (isAuthenticated && conversationsLoading && !error)
  );
  
  // Debug logging
  console.log('Conversations Debug:', { 
    conversations, 
    conversationsLoading, 
    authLoading,
    shouldShowLoading,
    hasTimedOut,
    isFetching,
    error, 
    isAuthenticated,
    userHasConversations: conversations.length > 0
  });

  const deleteConversationMutation = useDeleteConversation();
  const archiveConversationMutation = useArchiveConversation();

  const handleDelete = async (conversationId: string) => {
    if (confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
      await deleteConversationMutation.mutateAsync(conversationId);
      
      // If we deleted the current conversation, start a new one
      if (conversationId === currentConversationId) {
        onNewConversation();
      }
    }
  };

  const handleArchive = async (conversationId: string) => {
    await archiveConversationMutation.mutateAsync({
      id: conversationId,
      archived: !showArchived, // Archive if showing active, unarchive if showing archived
    });
  };

  const handleExport = (conversationId: string) => {
    // TODO: Implement export functionality
    console.log('Export conversation:', conversationId);
  };

  const handleRename = (conversationId: string) => {
    // TODO: Implement rename functionality
    console.log('Rename conversation:', conversationId);
  };

  if (!isAuthenticated) {
    return (
      <div className={cn(
        'flex flex-col h-full bg-muted/30 border-r transition-all duration-200',
        isCollapsed ? 'w-16' : 'w-80',
        className
      )}>
        {/* Header for unauthenticated users */}
        <div className="flex items-center justify-between p-4 border-b">
          {!isCollapsed && (
            <h2 className="font-semibold text-sm">Conversations</h2>
          )}
          <div className="flex items-center gap-1">
            {onToggleCollapse && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onToggleCollapse}
                title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>
        
        {/* Content area */}
        <div 
          className={cn(
            'flex-1 flex flex-col items-center justify-center p-4 text-center',
            isCollapsed && 'cursor-pointer hover:bg-muted/50 transition-colors'
          )}
          onClick={isCollapsed ? onToggleCollapse : undefined}
        >
          <MessageSquare className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          {!isCollapsed && (
            <p className="text-sm text-muted-foreground">
              Sign in to save your conversations
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      'flex flex-col h-full bg-muted/30 border-r transition-all duration-200',
      isCollapsed ? 'w-16' : 'w-80',
      className
    )}>
      {/* Header */}
      <div 
        className={cn(
          'flex items-center justify-between p-4 border-b',
          isCollapsed && 'cursor-pointer hover:bg-muted/50 transition-colors'
        )}
        onClick={isCollapsed ? onToggleCollapse : undefined}
      >
        {!isCollapsed && (
          <h2 className="font-semibold text-sm">Conversations</h2>
        )}
        <div className="flex items-center gap-1">
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onNewConversation}
              title="New conversation"
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
          {onToggleCollapse && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onToggleCollapse();
              }}
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </div>

      {!isCollapsed && (
        <>
          {/* Search */}
          <div className="p-4 pb-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>

          {/* Archive toggle */}
          <div className="px-4 pb-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start h-8"
              onClick={() => setShowArchived(!showArchived)}
            >
              <Archive className="mr-2 h-4 w-4" />
              {showArchived ? 'Show Active' : 'Show Archived'}
            </Button>
          </div>

          <Separator />
        </>
      )}

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        <div 
          className={cn(
            'p-2',
            isCollapsed && 'cursor-pointer hover:bg-muted/50 transition-colors'
          )}
          onClick={isCollapsed ? onToggleCollapse : undefined}
        >
          {isCollapsed ? (
            // Collapsed state - show conversation count or icon
            <div className="flex flex-col items-center justify-center py-4">
              <MessageSquare className="h-6 w-6 text-muted-foreground mb-2" />
              {conversations.length > 0 && (
                <div className="bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {conversations.length > 99 ? '99+' : conversations.length}
                </div>
              )}
            </div>
          ) : shouldShowLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-16 bg-muted/50 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : error || hasTimedOut ? (
            <div className="text-center py-8">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 text-destructive" />
              <p className="text-sm text-destructive">
                {hasTimedOut ? 'Loading timed out' : 'Failed to load conversations'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {hasTimedOut ? 'This might be normal if you have no conversations yet' : 'Check your connection and try again'}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {searchQuery 
                  ? 'No conversations found' 
                  : showArchived 
                    ? 'No archived conversations'
                    : 'Start a conversation to see it here'
                }
              </p>
              {!searchQuery && !showArchived && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={onNewConversation}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Chat
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              {conversations.map((conversation) => (
                <ConversationItem
                  key={conversation.id}
                  conversation={conversation}
                  isActive={conversation.id === currentConversationId}
                  isCollapsed={isCollapsed}
                  onSelect={() => onConversationSelect(conversation.id)}
                  onDelete={() => handleDelete(conversation.id)}
                  onArchive={() => handleArchive(conversation.id)}
                  onExport={() => handleExport(conversation.id)}
                  onRename={() => handleRename(conversation.id)}
                />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

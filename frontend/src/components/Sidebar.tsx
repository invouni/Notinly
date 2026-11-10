
import { useState } from "react";
import {
  Drill,
  Plus,
  FileText,
  Folder,
  FolderOpen,
  Star,
  Clock3,
  Sparkles,
  ChevronRight,
  MoreHorizontal,
  Pencil,
  Copy,
  Trash2,
  FilePlus,
  FolderPlus,
  LayoutDashboard,
  Search,
} from "lucide-react";

import {
  Sidebar as ShadSidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
} from "@/components/ui/sidebar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// Types
export type Note = {
  id: string;
  title: string;
  type: "note" | "folder";
  children?: Note[];
};

type NoteAction = "rename" | "duplicate" | "delete";

interface SidebarProps {
  onCreateNote?: () => void;
  onCreateFolder?: () => void;
  onCreateCanvas?: () => void;
  onNavigate?: (id: string) => void;
  onSelectNote?: (note: Note) => void;
  onAction?: (action: NoteAction, item: Note) => void;
  activeView?: string;
}

// Navigation
const navigation = [
  { id: "all", label: "All Notes", icon: FileText },
  { id: "favorites", label: "Favorites", icon: Star },
  { id: "recent", label: "Recent", icon: Clock3 },
  { id: "ai", label: "AI Assistant", icon: Sparkles },
];

// Temporary data
const initialTree: Note[] = [
  {
    id: "1",
    title: "Getting Started",
    type: "folder",
    children: [
      { id: "2", title: "Welcome to Zero", type: "note" },
      { id: "3", title: "Quick Guide", type: "note" },
    ],
  },
  {
    id: "4",
    title: "Development",
    type: "folder",
    children: [
      { id: "5", title: "Project Ideas", type: "note" },
      { id: "6", title: "Architecture", type: "note" },
    ],
  },
  { id: "7", title: "Untitled Note", type: "note" },
];

// Dropdown trigger styled as a native button.
// Compatible with the current shadcn Base UI implementation.
function NoteActions({
  item,
  onAction,
}: {
  item: Note;
  onAction?: (action: NoteAction, item: Note) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity hover:bg-sidebar-accent hover:text-foreground group-hover:opacity-100 focus-visible:opacity-100"
        aria-label={`Actions for ${item.title}`}
      >
        <MoreHorizontal size={16} />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onClick={() => onAction?.("rename", item)}>
          <Pencil /> Rename
        </DropdownMenuItem>
      <DropdownMenuItem onClick={() => onAction?.("rename", item)}>
          <Star /> favourite
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAction?.("duplicate", item)}>
          <Copy /> Duplicate
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => onAction?.("delete", item)}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Recursive folder tree
function TreeItem({
  item,
  depth = 0,
  onSelectNote,
  onAction,
}: {
  item: Note;
  depth?: number;
  onSelectNote?: (note: Note) => void;
  onAction?: (action: NoteAction, item: Note) => void;
}) {
  const [open, setOpen] = useState(true);
  const isFolder = item.type === "folder";

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div
        className="group flex min-w-0 items-center gap-1"
        style={{ paddingLeft: `${depth * 12}px` }}
      >
        {isFolder ? (
          <CollapsibleTrigger className="flex h-8 min-w-0 flex-1 items-center gap-2 rounded-md px-2 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
            <ChevronRight
              size={15}
              className={`shrink-0 transition-transform ${
                open ? "rotate-90" : ""
              }`}
            />
            {open ? (
              <FolderOpen size={16} className="shrink-0" />
            ) : (
              <Folder size={16} className="shrink-0" />
            )}
            <span className="truncate">{item.title}</span>
          </CollapsibleTrigger>
        ) : (
          <button
            type="button"
            onClick={() => onSelectNote?.(item)}
            className="flex h-8 min-w-0 flex-1 items-center gap-2 rounded-md px-2 text-left text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <FileText size={15} className="shrink-0" />
            <span className="truncate">{item.title}</span>
          </button>
        )}

        <NoteActions item={item} onAction={onAction} />
      </div>

      {isFolder && (
        <CollapsibleContent>
          <div className="space-y-1">
            {item.children?.map((child) => (
              <TreeItem
                key={child.id}
                item={child}
                depth={depth + 1}
                onSelectNote={onSelectNote}
                onAction={onAction}
              />
            ))}
          </div>
        </CollapsibleContent>
      )}
    </Collapsible>
  );
}

export default function Sidebar({
  onCreateNote,
  onCreateFolder,
  onCreateCanvas,
  onNavigate,
  onSelectNote,
  onAction,
  activeView = "all",
}: SidebarProps) {
  const [tree] = useState(initialTree);

  return (
    <ShadSidebar collapsible="icon">

      {/* BRAND */}
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Drill size={21} />
          </div>

          <div className="grid min-w-0 flex-1 text-sm leading-tight">
            <span className="truncate font-bold tracking-widest">
              NOTION ZERO
            </span>
            <span className="text-xs text-muted-foreground">
              YOUR SECOND BRAIN
            </span>
          </div>
        </div>

        {/* NEW MENU */}
        <DropdownMenu>
          <DropdownMenuTrigger className="mt-3 flex h-9 w-full items-center gap-2 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
            <Plus size={17} />
            <span>New Note</span>
            <span className="ml-auto text-xs opacity-60">⌘ N</span>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="start" className="w-52">
            <DropdownMenuItem onClick={onCreateNote}>
              <FilePlus /> New Note
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onCreateFolder}>
              <FolderPlus /> New Folder
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onCreateCanvas}>
              <LayoutDashboard /> New Canvas
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarHeader>

      <Separator />

      <SidebarContent>
        {/* NAVIGATION */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map(({ id, label, icon: Icon }) => (
                <SidebarMenuItem key={id}>
                  <SidebarMenuButton
                    isActive={activeView === id}
                    tooltip={label}
                    onClick={() => onNavigate?.(id)}
                  >
                    <Icon />
                    <span>{label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* WORKSPACE */}
        <SidebarGroup>
          <div className="flex items-center justify-between">
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>

            <DropdownMenu>
              <DropdownMenuTrigger
                className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                aria-label="Create workspace item"
              >
                <Plus size={16} />
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onCreateNote}>
                  <FilePlus /> New Note
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onCreateFolder}>
                  <FolderPlus /> New Folder
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <SidebarGroupContent>
            <SidebarMenu>
              {tree.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <TreeItem
                    item={item}
                    onSelectNote={onSelectNote}
                    onAction={onAction}
                  />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* FOOTER */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Search notes">
              <Search />
              <span>Search notes</span>
              <span className="ml-auto text-xs text-muted-foreground">
                ⌘ K
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </ShadSidebar>
  );
}

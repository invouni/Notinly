
import { useCallback, useEffect, useState } from "react";
import {
  FileText,
  Plus,
  X,
} from "lucide-react";

import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";

import { Button } from "@/components/ui/button";
import Sidebar, { type Note } from "./Sidebar";
import Editor from "./Editor";

type Tab = Note;

export default function Workspace() {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [contents, setContents] = useState<Record<string, string>>({});

  const activeTab = tabs.find((tab) => tab.id === activeId);

  const openTab = useCallback((note: Note) => {
    if (note.type === "folder") return;

    setTabs((prev) => {
      if (prev.some((tab) => tab.id === note.id)) return prev;
      return [...prev, note];
    });

    setActiveId(note.id);
  }, []);

  const createNote = useCallback(() => {
    const note: Note = {
      id: crypto.randomUUID(),
      title: "Untitled Note",
      type: "note",
    };

    setTabs((prev) => [...prev, note]);
    setActiveId(note.id);
  }, []);

  const closeTab = useCallback(
    (id: string) => {
      setTabs((prev) => {
        const index = prev.findIndex((tab) => tab.id === id);
        const updated = prev.filter((tab) => tab.id !== id);

        if (activeId === id) {
          const nextTab = updated[Math.min(index, updated.length - 1)];
          setActiveId(nextTab?.id ?? null);
        }

        return updated;
      });
    },
    [activeId],
  );

  const switchTab = useCallback(
    (direction: 1 | -1) => {
      if (tabs.length < 2) return;

      const index = tabs.findIndex((tab) => tab.id === activeId);
      const nextIndex =
        (index + direction + tabs.length) % tabs.length;

      setActiveId(tabs[nextIndex].id);
    },
    [tabs, activeId],
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const modifier = e.ctrlKey || e.metaKey;

      if (!modifier) return;

      if (e.key === "Tab") {
        e.preventDefault();
        switchTab(e.shiftKey ? -1 : 1);
      }

      if (e.key.toLowerCase() === "w") {
        e.preventDefault();
        if (activeId) closeTab(activeId);
      }

      if (e.key.toLowerCase() === "n") {
        e.preventDefault();
        createNote();
      }

      if (/^[1-9]$/.test(e.key)) {
        const tab = tabs[Number(e.key) - 1];
        if (tab) {
          e.preventDefault();
          setActiveId(tab.id);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [tabs, activeId, switchTab, closeTab, createNote]);

  const renameNote = (title: string) => {
    if (!activeId) return;

    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === activeId
          ? { ...tab, title }
          : tab,
      ),
    );
  };

  return (
    <SidebarProvider defaultOpen>
      <Sidebar
        activeView="all"
        onCreateNote={createNote}
        onCreateFolder={() => console.log("Create folder")}
        onCreateCanvas={() => console.log("Create canvas")}
        onNavigate={(id) => console.log("Navigate:", id)}
        onSelectNote={openTab}
        onAction={(action, item) =>
          console.log(action, item)
        }
      />

      <SidebarInset className="min-h-screen bg-background">
        <main className="flex h-screen flex-col overflow-hidden">

          {/* Editor tabs */}
          <header className="flex h-12 shrink-0 items-center border-b border-border">
            <div className="flex min-w-0 flex-1 items-center overflow-x-auto">
              {tabs.map((tab) => (
                <div
                  key={tab.id}
                  className={`group flex h-12 shrink-0 items-center border-r border-border ${
                    activeId === tab.id
                      ? "bg-surface text-foreground"
                      : "text-muted-foreground hover:bg-surface-hover"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setActiveId(tab.id)}
                    className="flex h-full items-center gap-2 px-4 text-sm"
                  >
                    <FileText size={15} />
                    <span className="max-w-36 truncate">
                      {tab.title || "Untitled Note"}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => closeTab(tab.id)}
                    title="Close tab"
                    className="mr-2 rounded p-1 opacity-0 hover:bg-muted group-hover:opacity-100"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>

            <Button
              type="button"
              size="icon"
              variant="ghost"
              title="New note (Ctrl + N)"
              className="mx-2 shrink-0"
              onClick={createNote}
            >
              <Plus size={17} />
            </Button>
          </header>

          {/* Active editor */}
          <section className="min-h-0 flex-1 overflow-hidden">
            {activeTab ? (
              <Editor
                key={activeTab.id}
                title={activeTab.title}
                content={contents[activeTab.id] || ""}
                onChange={(content) =>
                  setContents((prev) => ({
                    ...prev,
                    [activeTab.id]: content,
                  }))
                }
                onTitleChange={renameNote}
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
                <FileText size={42} strokeWidth={1} />
                <p className="text-sm">
                  Open a note or create a new one
                </p>

                <Button
                  variant="outline"
                  onClick={createNote}
                >
                  <Plus size={16} />
                  Create note
                </Button>
              </div>
            )}
          </section>

          {/* Status bar */}
          <footer className="flex h-7 shrink-0 items-center justify-between border-t border-border px-4 text-xs text-muted-foreground">
            <span>
              {activeTab?.title || "No document open"}
            </span>
            <span>
              {tabs.length} open {tabs.length === 1 ? "tab" : "tabs"}
            </span>
          </footer>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

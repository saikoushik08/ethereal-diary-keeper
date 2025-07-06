// src/components/DiaryEditor.tsx
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import ImageExtension from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List as ListIcon,
  ListOrdered,
  Image as ImageIcon,
  CheckSquare,
  Tag,
  Save,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Json } from "@/lib/supabase/types";

interface Todo { text: string; done: boolean; }
interface Entry {
  id: string;
  title: string;
  content: string;
  mood: string;
  tags: string[];
  todos?: Todo[];
  created_at?: string;
  user_id?: string;
}
interface DiaryEditorProps { existingEntry: Entry | null; }

export const DiaryEditor = ({ existingEntry }: DiaryEditorProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(existingEntry?.title || "");
  const [mood, setMood] = useState(existingEntry?.mood || "neutral");
  const [tags, setTags] = useState<string[]>(existingEntry?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [todos, setTodos] = useState<Todo[]>(existingEntry?.todos || []);
  const [todoText, setTodoText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
      }),
      Underline,
      ImageExtension.configure({
  allowBase64: true,
  HTMLAttributes: {
    style: "max-width: 100%; height: auto;",
  },
}),
      Placeholder.configure({ placeholder: "Write your entry..." }),
    ],
    content: existingEntry?.content || "",
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      if (editor && title && !isSaving && !isDeleting) saveEntry(true);
    }, 30000);
    return () => clearTimeout(timer);
  }, [title, mood, tags, todos, editor]);

  const moodOptions = [
    { value: "happy", label: "😄 Happy", color: "bg-green-100 text-green-800" },
    { value: "calm", label: "😌 Calm", color: "bg-blue-100 text-blue-800" },
    { value: "neutral", label: "😐 Neutral", color: "bg-pink-100 text-pink-800 " },
    { value: "sad", label: "😔 Sad", color: "bg-purple-100 text-purple-800" },
    { value: "anxious", label: "😰 Anxious", color: "bg-yellow-100 text-yellow-800" },
    { value: "angry", label: "😠 Angry", color: "bg-red-100 text-red-800" },
  ];

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!todoText.trim()) return;
    setTodos([...todos, { text: todoText.trim(), done: false }]);
    setTodoText("");
  };
  const toggleTodo = (i: number) => {
    const c = [...todos]; c[i].done = !c[i].done; setTodos(c);
  };

  const addTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagInput.trim() || tags.includes(tagInput.trim())) return;
    setTags([...tags, tagInput.trim()]);
    setTagInput("");
  };
  const removeTag = (t: string) => setTags(tags.filter(x => x !== t));

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      editor?.chain().focus().setImage({ src }).run();
    };
    reader.readAsDataURL(file);
  };
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.target.files?.[0] && handleImageUpload(e.target.files[0]);
  };

  const saveEntry = async (auto = false) => {
    if (!editor || !title || !user) {
      toast({ title: "Missing fields", variant: "destructive" });
      return;
    }
    const html = editor.getHTML();
    setIsSaving(true);
    try {
      const todosJson = todos.length ? (todos as unknown as Json) : null;
      const payload = {
        title,
        content: html,
        mood,
        tags,
        todos: todosJson,
        user_id: user.id,
      };
      let result;
      if (existingEntry) {
        const { data, error } = await supabase
          .from("entries")
          .update(payload)
          .eq("id", existingEntry.id)
          .select();
        if (error) throw error;
        result = data![0];
      } else {
        const { data, error } = await supabase
          .from("entries")
          .insert(payload)
          .select();
        if (error) throw error;
        result = data![0];
      }
      if (!auto) {
        toast({ title: existingEntry ? "Updated" : "Saved" });
        if (!existingEntry) navigate(`/diary/${result.id}`);
      }
    } catch {
      toast({ title: "Error saving", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };
  const deleteEntry = async () => {
    if (!existingEntry || !confirm("Delete this entry?")) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("entries")
        .delete()
        .eq("id", existingEntry.id);
      if (error) throw error;
      toast({ title: "Deleted" });
      navigate("/diary");
    } catch {
      toast({ title: "Error deleting", variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="diary-editor-container">
      <div className="mb-6">
        <Label className="text-lg">Entry Title</Label>
        <Input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="My day was…"
          className="mt-1"
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-4 bg-gray-50 p-2 rounded dark:bg-[#111827]">
        {[
          { cmd: "toggleBold", icon: <Bold size={18} />, active: editor?.isActive("bold") },
          { cmd: "toggleItalic", icon: <Italic size={18} />, active: editor?.isActive("italic") },
          { cmd: "toggleUnderline", icon: <UnderlineIcon size={18} />, active: editor?.isActive("underline") },
          {
            cmd: "toggleBulletList",
            icon: <ListIcon size={18} />,
            active: editor?.isActive("bulletList"),
          },
          {
            cmd: "toggleOrderedList",
            icon: <ListOrdered size={18} />,
            active: editor?.isActive("orderedList"),
          },
        ].map(({ cmd, icon, active }) => (
          <Button
            key={cmd}
            variant={active ? "default" : "ghost"}
            size="sm"
            onClick={() => editor?.chain().focus()[cmd]().run()}
          >
            {icon}
          </Button>
        ))}

        <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()}>
          <UploadCloud size={18} />
        </Button>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={onFileChange}
        />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const url = prompt("Paste image URL");
            url && editor?.chain().focus().setImage({ src: url }).run();
          }}
        >
          <ImageIcon size={18} />
        </Button>
      </div>

      <div className="border rounded p-3 min-h-[200px] dark:bg-[#111827]">
        {editor ? (
          <EditorContent
              editor={editor}
                className="
                   prose dark:prose-invert focus:outline-none
                   [&_ul]:list-disc [&_ul]:list-outside [&_ul]:pl-6
                   [&_ol]:list-decimal [&_ol]:list-outside [&_ol]:pl-6
                   [&_li]:ml-2"/>
        ) : (
          <p>Loading editor…</p>
        )}
      </div>

      <Tabs defaultValue="mood" className="mt-6">
        <TabsList>
          <TabsTrigger value="mood">Mood</TabsTrigger>
          <TabsTrigger value="todos">To‑Do</TabsTrigger>
          <TabsTrigger value="tags">Tags</TabsTrigger>
        </TabsList>

        <TabsContent value="mood" className="mt-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {moodOptions.map(o => (
              <Button
                key={o.value}
                variant={mood === o.value ? "secondary" : "outline"}
                className={mood === o.value ? o.color : ""}
                onClick={() => setMood(o.value)}
              >
                {o.label}
              </Button>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="todos" className="mt-2">
          <form onSubmit={addTodo} className="flex gap-2 mb-4">
            <Input
              value={todoText}
              onChange={e => setTodoText(e.target.value)}
              placeholder="New task…"
            />
            <Button type="submit">Add</Button>
          </form>
          <div className="space-y-2">
            {todos.map((t, i) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-white dark:bg-[#111827] rounded">
                <Button size="sm" variant="ghost" onClick={() => toggleTodo(i)}>
                  <CheckSquare
                    size={18}
                    fill={t.done ? "currentColor" : "none"}
                    className={t.done ? "text-green-500" : "text-gray-400"}
                  />
                </Button>
                <span className={t.done ? "line-through opacity-60" : ""}>{t.text}</span>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tags" className="mt-2">
          <form onSubmit={addTag} className="flex gap-2 mb-4">
            <Input
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              placeholder="New tag…"
            />
            <Button type="submit">Add</Button>
          </form>
          <div className="flex flex-wrap gap-2">
            {tags.map(t => (
              <Badge key={t} variant="secondary" className="flex items-center gap-1">
                {t}
                <Button variant="ghost" size="sm" onClick={() => removeTag(t)}>
                  ×
                </Button>
              </Badge>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={() => navigate("/diary")} disabled={isSaving}>
          Cancel
        </Button>
        <div className="flex gap-2">
          {existingEntry && (
            <Button variant="destructive" onClick={deleteEntry} disabled={isDeleting}>
              <Trash2 size={18} /> Delete
            </Button>
          )}
          <Button onClick={() => saveEntry(false)} disabled={isSaving}>
            <Save size={18} /> {isSaving ? "Saving…" : "Save Entry"}
          </Button>
        </div>
      </div>
    </div>
  );
};

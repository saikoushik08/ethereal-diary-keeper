
import { useState, useEffect, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Image as ImageIcon,
  CheckSquare,
  Tag,
  Save,
  Trash2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

interface Todo {
  text: string;
  done: boolean;
}

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

interface DiaryEditorProps {
  existingEntry: Entry | null;
}

export const DiaryEditor = ({ existingEntry }: DiaryEditorProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState(existingEntry?.title || "");
  const [content, setContent] = useState(existingEntry?.content || "");
  const [mood, setMood] = useState(existingEntry?.mood || "neutral");
  const [tag, setTag] = useState("");
  const [tags, setTags] = useState<string[]>(existingEntry?.tags || []);
  const [todos, setTodos] = useState<Todo[]>(existingEntry?.todos || []);
  const [todoText, setTodoText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  // Auto-save effect
  useEffect(() => {
    const saveTimer = setTimeout(() => {
      if (title && content && !isSaving && !isDeleting) {
        saveEntry(true);
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearTimeout(saveTimer);
  }, [title, content, mood, tags, todos]);

  // Function to insert text formatting at cursor position
  const insertFormat = (format: string) => {
    const textarea = document.querySelector(".diary-editor") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    let insertedText = "";

    switch (format) {
      case "bold":
        insertedText = `**${selectedText}**`;
        break;
      case "italic":
        insertedText = `*${selectedText}*`;
        break;
      case "underline":
        insertedText = `<u>${selectedText}</u>`;
        break;
      case "list":
        insertedText = `\n- ${selectedText}`;
        break;
      case "ordered-list":
        insertedText = `\n1. ${selectedText}`;
        break;
      case "image":
        insertedText = `![${selectedText || "Image description"}](image-url)`;
        break;
      default:
        insertedText = selectedText;
    }

    const newContent = 
      textarea.value.substring(0, start) + 
      insertedText + 
      textarea.value.substring(end);
    
    setContent(newContent);
    
    // Set focus back to textarea
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + insertedText.length;
      textarea.selectionEnd = start + insertedText.length;
    }, 0);
  };

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!todoText.trim()) return;
    
    setTodos([...todos, { text: todoText, done: false }]);
    setTodoText("");
  };

  const toggleTodo = (index: number) => {
    const newTodos = [...todos];
    newTodos[index].done = !newTodos[index].done;
    setTodos(newTodos);
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tag.trim() || tags.includes(tag)) return;
    
    setTags([...tags, tag]);
    setTag("");
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const saveEntry = async (isAutoSave = false) => {
    if (!title) {
      toast({
        title: "Title required",
        description: "Please add a title for your entry.",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication error",
        description: "You need to be logged in to save entries.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSaving(true);

      const entryData = {
        title,
        content,
        mood,
        tags,
        todos: todos.length > 0 ? todos : null,
        user_id: user.id,
      };

      let result;

      if (existingEntry) {
        // Update existing entry
        const { data, error } = await supabase
          .from('entries')
          .update(entryData)
          .eq('id', existingEntry.id)
          .select();

        if (error) throw error;
        result = data[0];
      } else {
        // Create new entry
        const { data, error } = await supabase
          .from('entries')
          .insert(entryData)
          .select();

        if (error) throw error;
        result = data[0];
      }

      if (!isAutoSave) {
        toast({
          title: existingEntry ? "Entry updated" : "Entry saved",
          description: existingEntry 
            ? "Your diary entry has been updated." 
            : "Your diary entry has been saved.",
        });

        if (!existingEntry) {
          navigate(`/diary/${result.id}`);
        }
      }
    } catch (error) {
      console.error("Error saving entry:", error);
      toast({
        title: "Error",
        description: "Failed to save your entry. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const deleteEntry = async () => {
    if (!existingEntry) return;
    
    if (!confirm("Are you sure you want to delete this entry? This action cannot be undone.")) {
      return;
    }

    try {
      setIsDeleting(true);
      
      const { error } = await supabase
        .from('entries')
        .delete()
        .eq('id', existingEntry.id);

      if (error) throw error;

      toast({
        title: "Entry deleted",
        description: "Your diary entry has been deleted.",
      });

      navigate('/diary');
    } catch (error) {
      console.error("Error deleting entry:", error);
      toast({
        title: "Error",
        description: "Failed to delete your entry. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleContentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const moodOptions = [
    { value: "happy", label: "😄 Happy", color: "bg-green-100 text-green-800" },
    { value: "calm", label: "😌 Calm", color: "bg-blue-100 text-blue-800" },
    { value: "neutral", label: "😐 Neutral", color: "bg-gray-100 text-gray-800" },
    { value: "sad", label: "😔 Sad", color: "bg-purple-100 text-purple-800" },
    { value: "anxious", label: "😰 Anxious", color: "bg-yellow-100 text-yellow-800" },
    { value: "angry", label: "😠 Angry", color: "bg-red-100 text-red-800" },
  ];

  return (
    <div className="diary-editor-container">
      <div className="mb-6">
        <Label htmlFor="entry-title" className="text-lg font-medium">Entry Title</Label>
        <Input
          id="entry-title"
          placeholder="What's on your mind today?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-lg mt-1"
        />
      </div>

      <div className="mb-6">
        <div className="diary-toolbar flex flex-wrap gap-1 mb-2 bg-gray-50 p-2 rounded">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertFormat("bold")}
            title="Bold"
          >
            <Bold size={18} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertFormat("italic")}
            title="Italic"
          >
            <Italic size={18} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertFormat("underline")}
            title="Underline"
          >
            <Underline size={18} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertFormat("list")}
            title="Bullet List"
          >
            <List size={18} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertFormat("ordered-list")}
            title="Numbered List"
          >
            <ListOrdered size={18} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertFormat("image")}
            title="Insert Image"
          >
            <ImageIcon size={18} />
          </Button>
        </div>

        <textarea
          placeholder="Start writing your thoughts here..."
          value={content}
          onChange={handleContentChange}
          className="diary-editor w-full focus:outline-none min-h-[300px] p-3 border rounded-md"
        />
      </div>

      <Tabs defaultValue="mood">
        <TabsList>
          <TabsTrigger value="mood">Mood</TabsTrigger>
          <TabsTrigger value="todos">To-Do List</TabsTrigger>
          <TabsTrigger value="tags">Tags</TabsTrigger>
        </TabsList>
        
        <TabsContent value="mood" className="p-4 bg-white rounded-md shadow-sm mt-2 border">
          <div className="text-lg mb-3">How are you feeling today?</div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {moodOptions.map((option) => (
              <Button
                key={option.value}
                type="button"
                variant="outline"
                className={`justify-start ${mood === option.value ? option.color : ""}`}
                onClick={() => setMood(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="todos" className="p-4 bg-white rounded-md shadow-sm mt-2 border">
          <form onSubmit={handleAddTodo} className="mb-4 flex">
            <Input
              placeholder="Add a task..."
              value={todoText}
              onChange={(e) => setTodoText(e.target.value)}
              className="mr-2"
            />
            <Button type="submit">Add</Button>
          </form>
          
          <div className="space-y-2">
            {todos.map((todo, index) => (
              <div
                key={index}
                className="flex items-center p-2 bg-white border rounded-md"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="mr-2"
                  onClick={() => toggleTodo(index)}
                >
                  <CheckSquare 
                    size={18} 
                    className={todo.done ? "text-green-500" : "text-gray-400"} 
                    fill={todo.done ? "currentColor" : "none"}
                  />
                </Button>
                <span className={todo.done ? "line-through text-gray-400" : ""}>
                  {todo.text}
                </span>
              </div>
            ))}
            {todos.length === 0 && (
              <p className="text-gray-500 text-center py-4">No tasks yet. Add something to do!</p>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="tags" className="p-4 bg-white rounded-md shadow-sm mt-2 border">
          <form onSubmit={handleAddTag} className="mb-4 flex">
            <Input
              placeholder="Add a tag..."
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="mr-2"
            />
            <Button type="submit">
              <Tag size={18} className="mr-2" />
              Add
            </Button>
          </form>
          
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge 
                key={tag}
                variant="secondary"
                className="px-3 py-1 cursor-pointer"
                onClick={() => removeTag(tag)}
              >
                {tag}
                <span className="ml-2">×</span>
              </Badge>
            ))}
            {tags.length === 0 && (
              <p className="text-gray-500 text-center py-4 w-full">No tags yet. Add some to categorize your entry!</p>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-between mt-6">
        <div>
          {existingEntry && (
            <Button
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={deleteEntry}
              disabled={isDeleting || isSaving}
            >
              <Trash2 size={18} className="mr-2" />
              Delete
            </Button>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate('/diary')}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={() => saveEntry()}
            className="bg-diary-purple hover:bg-diary-purple/90"
            disabled={isSaving}
          >
            <Save size={18} className="mr-2" />
            {isSaving ? 'Saving...' : 'Save Entry'}
          </Button>
        </div>
      </div>
    </div>
  );
};

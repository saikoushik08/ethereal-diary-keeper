
import { useState, useEffect } from "react";
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
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Entry {
  id: string;
  title: string;
  content: string;
  mood: string;
  tags: string[];
  date: Date;
}

export const DiaryEditor = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("neutral");
  const [tag, setTag] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [todos, setTodos] = useState<{ text: string; done: boolean }[]>([]);
  const [todoText, setTodoText] = useState("");
  const { toast } = useToast();

  // Auto-save effect
  useEffect(() => {
    const saveTimer = setTimeout(() => {
      if (title || content) {
        saveEntry();
      }
    }, 5000);

    return () => clearTimeout(saveTimer);
  }, [title, content, mood, tags, todos]);

  const saveEntry = () => {
    if (!title) return;

    const entry: Entry = {
      id: Date.now().toString(),
      title,
      content,
      mood,
      tags,
      date: new Date(),
    };

    // In a real app, save to backend API
    console.log("Saving entry:", entry);
    
    // For demo, save to localStorage
    const entries = JSON.parse(localStorage.getItem("diaryEntries") || "[]");
    entries.push(entry);
    localStorage.setItem("diaryEntries", JSON.stringify(entries));
    
    toast({
      title: "Entry saved",
      description: "Your diary entry has been automatically saved.",
    });
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

  const insertFormat = (format: string) => {
    // In a real implementation, we would use a proper rich text editor library
    // This is just a simple demonstration
    setContent(content + ` [${format}] `);
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
        <div className="diary-toolbar">
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
          onChange={(e) => setContent(e.target.value)}
          className="diary-editor w-full focus:outline-none min-h-[300px]"
        />
      </div>

      <Tabs defaultValue="mood">
        <TabsList>
          <TabsTrigger value="mood">Mood</TabsTrigger>
          <TabsTrigger value="todos">To-Do List</TabsTrigger>
          <TabsTrigger value="tags">Tags</TabsTrigger>
        </TabsList>
        
        <TabsContent value="mood" className="p-4 bg-white rounded-md shadow-sm mt-2">
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
        
        <TabsContent value="todos" className="p-4 bg-white rounded-md shadow-sm mt-2">
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
        
        <TabsContent value="tags" className="p-4 bg-white rounded-md shadow-sm mt-2">
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

      <div className="flex justify-end mt-6">
        <Button
          variant="outline"
          className="mr-2"
          onClick={() => {
            setTitle("");
            setContent("");
            setMood("neutral");
            setTags([]);
            setTodos([]);
          }}
        >
          Discard
        </Button>
        <Button
          onClick={saveEntry}
          className="bg-diary-purple hover:bg-diary-purple/90"
        >
          Save Entry
        </Button>
      </div>
    </div>
  );
};

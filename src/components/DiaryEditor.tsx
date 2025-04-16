
import { useState, useRef, useEffect } from "react";
import { Editor, EditorState, RichUtils, AtomicBlockUtils, convertToRaw, convertFromRaw } from 'draft-js';
import 'draft-js/dist/Draft.css';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Bold, Italic, Underline, Image as ImageIcon, Link, List, ListOrdered } from "lucide-react";
import { Json } from "@/integrations/supabase/types"; // Import Supabase Json type

// Define TodoItem interface
interface TodoItem {
  text: string;
  completed: boolean;
}

// Draft.js media component
const MediaComponent = ({ block, contentState }) => {
  const entity = contentState.getEntity(block.getEntityAt(0));
  const { src } = entity.getData();
  const type = entity.getType();

  if (type === 'image') {
    return <img src={src} alt="Entry image" className="max-w-full h-auto my-4 rounded-md" />;
  }
  return null;
};

const DiaryEditor = ({ entryId, initialContent, onSave }) => {
  const [editorState, setEditorState] = useState(() => {
    if (initialContent) {
      try {
        const contentState = convertFromRaw(JSON.parse(initialContent));
        return EditorState.createWithContent(contentState);
      } catch (e) {
        console.error("Error parsing editor content:", e);
        return EditorState.createEmpty();
      }
    }
    return EditorState.createEmpty();
  });
  
  const [title, setTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [autoSave, setAutoSave] = useState(false);
  const [mood, setMood] = useState("neutral");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [todoInput, setTodoInput] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Load entry data if editing existing entry
    const loadEntry = async () => {
      if (entryId) {
        try {
          const { data, error } = await supabase
            .from('entries')
            .select('*')
            .eq('id', entryId)
            .maybeSingle();
          
          if (error) throw error;
          
          if (data) {
            setTitle(data.title);
            setMood(data.mood || "neutral");
            setTags(data.tags || []);
            
            // Parse todos array from JSON
            if (data.todos) {
              try {
                const parsedTodos = Array.isArray(data.todos) 
                  ? data.todos.map(todo => typeof todo === 'object' ? todo : JSON.parse(String(todo)))
                  : [];
                setTodos(parsedTodos as TodoItem[]);
              } catch (e) {
                console.error("Error parsing todos:", e);
                setTodos([]);
              }
            }
            
            if (data.content) {
              try {
                const contentState = convertFromRaw(JSON.parse(data.content));
                setEditorState(EditorState.createWithContent(contentState));
              } catch (e) {
                console.error("Error parsing editor content:", e);
              }
            }
          }
        } catch (error) {
          console.error("Error loading entry:", error);
          toast({
            title: "Error loading entry",
            description: "Could not load the diary entry.",
            variant: "destructive"
          });
        }
      }
    };
    
    // Check user settings for auto-save
    const checkSettings = () => {
      const settingsStr = localStorage.getItem('diary_settings');
      if (settingsStr) {
        try {
          const settings = JSON.parse(settingsStr);
          setAutoSave(settings.autoSave || false);
        } catch (e) {
          console.error("Error parsing settings:", e);
        }
      }
    };
    
    loadEntry();
    checkSettings();
  }, [entryId, toast]);

  // Focus editor on mount
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
  }, []);

  // Auto-save functionality
  useEffect(() => {
    let saveInterval;
    
    if (autoSave && user) {
      saveInterval = setInterval(() => {
        if (title.trim()) {
          handleSave(false);
        }
      }, 30000); // Auto-save every 30 seconds
    }
    
    return () => {
      if (saveInterval) clearInterval(saveInterval);
    };
  }, [autoSave, title, editorState, user, tags, mood, todos]);

  const handleKeyCommand = (command, editorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    
    if (newState) {
      setEditorState(newState);
      return 'handled';
    }
    
    return 'not-handled';
  };

  const toggleInlineStyle = (style) => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, style));
  };

  const toggleBlockType = (blockType) => {
    setEditorState(RichUtils.toggleBlockType(editorState, blockType));
  };

  const handleImageUpload = async (file) => {
    if (!file || !user) return;
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('diary-images')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage
        .from('diary-images')
        .getPublicUrl(filePath);
      
      const contentState = editorState.getCurrentContent();
      const contentStateWithEntity = contentState.createEntity(
        'image',
        'IMMUTABLE',
        { src: data.publicUrl }
      );
      
      const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
      const newEditorState = EditorState.set(editorState, { 
        currentContent: contentStateWithEntity 
      });
      
      setEditorState(AtomicBlockUtils.insertAtomicBlock(
        newEditorState,
        entityKey,
        ' '
      ));
      
      toast({
        title: "Image uploaded",
        description: "Image has been added to your entry."
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Upload failed",
        description: "There was a problem uploading your image.",
        variant: "destructive"
      });
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleAddTodo = () => {
    if (todoInput.trim()) {
      setTodos([...todos, { text: todoInput.trim(), completed: false }]);
      setTodoInput("");
    }
  };

  const handleToggleTodo = (index) => {
    const newTodos = [...todos];
    newTodos[index].completed = !newTodos[index].completed;
    setTodos(newTodos);
  };

  const handleRemoveTodo = (index) => {
    setTodos(todos.filter((_, i) => i !== index));
  };

  const handleSave = async (showToast = true) => {
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please add a title for your entry.",
        variant: "destructive"
      });
      return;
    }
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to save entries.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      const contentState = editorState.getCurrentContent();
      const content = JSON.stringify(convertToRaw(contentState));
      
      // Convert todos to a format that can be stored in Supabase
      const todoData = todos as unknown as Json;
      
      const entryData = {
        title,
        content,
        mood,
        tags,
        todos: todoData,
        user_id: user.id,
        updated_at: new Date().toISOString()
      };
      
      let result;
      
      if (entryId) {
        // Update existing entry
        result = await supabase
          .from('entries')
          .update(entryData)
          .eq('id', entryId);
      } else {
        // Create new entry
        result = await supabase
          .from('entries')
          .insert({
            ...entryData,
            created_at: new Date().toISOString()
          });
      }
      
      if (result.error) throw result.error;
      
      if (showToast) {
        toast({
          title: entryId ? "Entry updated" : "Entry saved",
          description: entryId 
            ? "Your diary entry has been updated." 
            : "Your diary entry has been saved."
        });
      }
      
      // Call the onSave callback if provided
      if (onSave) {
        onSave(result.data);
      }
    } catch (error) {
      console.error("Error saving entry:", error);
      toast({
        title: "Save failed",
        description: "There was a problem saving your entry.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Custom block renderer for media
  const blockRendererFn = (block) => {
    if (block.getType() === 'atomic') {
      return {
        component: MediaComponent,
        editable: false,
      };
    }
    return null;
  };
  
  const currentStyle = editorState.getCurrentInlineStyle();
  const selection = editorState.getSelection();
  const blockType = editorState
    .getCurrentContent()
    .getBlockForKey(selection.getStartKey())
    .getType();

  return (
    <div className="w-full max-w-4xl mx-auto p-4 dark:bg-gray-900">
      <Input
        type="text"
        placeholder="Entry Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="text-2xl font-bold mb-4 px-4 py-3 bg-white/80 backdrop-blur-sm border-0 rounded-lg shadow-sm focus:ring-2 focus:ring-diary-purple dark:bg-gray-800 dark:text-white"
      />
      
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden mb-6 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex flex-wrap gap-1 px-4 py-2 border-b border-gray-200 bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
          <Button 
            variant="ghost" 
            size="sm"
            className={`${currentStyle.has('BOLD') ? 'bg-gray-200 dark:bg-gray-600' : ''}`}
            onClick={() => toggleInlineStyle('BOLD')}
          >
            <Bold size={18} />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className={`${currentStyle.has('ITALIC') ? 'bg-gray-200 dark:bg-gray-600' : ''}`}
            onClick={() => toggleInlineStyle('ITALIC')}
          >
            <Italic size={18} />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className={`${currentStyle.has('UNDERLINE') ? 'bg-gray-200 dark:bg-gray-600' : ''}`}
            onClick={() => toggleInlineStyle('UNDERLINE')}
          >
            <Underline size={18} />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className={`${blockType === 'unordered-list-item' ? 'bg-gray-200 dark:bg-gray-600' : ''}`}
            onClick={() => toggleBlockType('unordered-list-item')}
          >
            <List size={18} />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className={`${blockType === 'ordered-list-item' ? 'bg-gray-200 dark:bg-gray-600' : ''}`}
            onClick={() => toggleBlockType('ordered-list-item')}
          >
            <ListOrdered size={18} />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => fileInputRef.current.click()}
          >
            <ImageIcon size={18} />
          </Button>
          <input 
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleImageUpload(e.target.files[0]);
                e.target.value = null; // Reset file input
              }
            }}
          />
        </div>
        
        <div className="px-4 py-3 min-h-[300px] dark:text-white">
          <Editor
            editorState={editorState}
            onChange={setEditorState}
            handleKeyCommand={handleKeyCommand}
            ref={editorRef}
            blockRendererFn={blockRendererFn}
            placeholder="Write your thoughts here..."
          />
        </div>
      </div>
      
      {/* Mood selector, tags, todos, and save buttons */}
      
      <div className="flex justify-end mt-6">
        <Button 
          variant="outline" 
          className="mr-2"
          onClick={() => window.history.back()}
        >
          Cancel
        </Button>
        <Button 
          variant="default"
          onClick={() => handleSave()}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : (entryId ? "Update Entry" : "Save Entry")}
        </Button>
      </div>
    </div>
  );
};

export default DiaryEditor;

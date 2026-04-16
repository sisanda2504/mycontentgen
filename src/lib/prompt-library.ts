export interface PromptTemplate {
  id: string;
  title: string;
  prompt: string;
  category: "text" | "image" | "code";
  icon: string;
}

export const promptLibrary: PromptTemplate[] = [
  // Text
  { id: "t1", title: "Blog Post", prompt: "Write a detailed blog post about", category: "text", icon: "📝" },
  { id: "t2", title: "Email Draft", prompt: "Write a professional email about", category: "text", icon: "📧" },
  { id: "t3", title: "Social Caption", prompt: "Write an engaging social media caption for", category: "text", icon: "📱" },
  { id: "t4", title: "Product Description", prompt: "Write a compelling product description for", category: "text", icon: "🛍️" },
  { id: "t5", title: "Story Starter", prompt: "Write a creative short story beginning with", category: "text", icon: "📖" },
  { id: "t6", title: "Poem", prompt: "Write an evocative poem about", category: "text", icon: "🎭" },
  { id: "t7", title: "Resume Summary", prompt: "Write a professional resume summary for a", category: "text", icon: "💼" },
  { id: "t8", title: "Tagline", prompt: "Create 5 catchy taglines for", category: "text", icon: "✨" },
  // Image
  { id: "i1", title: "Portrait Art", prompt: "A stunning digital portrait of", category: "image", icon: "🎨" },
  { id: "i2", title: "Landscape", prompt: "A breathtaking landscape of", category: "image", icon: "🏔️" },
  { id: "i3", title: "Logo Design", prompt: "A modern minimalist logo for", category: "image", icon: "💎" },
  { id: "i4", title: "Abstract Art", prompt: "An abstract digital artwork with", category: "image", icon: "🌀" },
  { id: "i5", title: "Product Shot", prompt: "A professional product photo of", category: "image", icon: "📸" },
  { id: "i6", title: "Fantasy Scene", prompt: "An epic fantasy scene featuring", category: "image", icon: "🐉" },
  // Code
  { id: "c1", title: "React Component", prompt: "Create a React component that", category: "code", icon: "⚛️" },
  { id: "c2", title: "API Endpoint", prompt: "Write a REST API endpoint for", category: "code", icon: "🔌" },
  { id: "c3", title: "Algorithm", prompt: "Implement an efficient algorithm for", category: "code", icon: "🧮" },
  { id: "c4", title: "Database Query", prompt: "Write an SQL query to", category: "code", icon: "🗃️" },
  { id: "c5", title: "Python Script", prompt: "Write a Python script that", category: "code", icon: "🐍" },
  { id: "c6", title: "CSS Animation", prompt: "Create a CSS animation for", category: "code", icon: "🎬" },
];

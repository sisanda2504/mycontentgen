import { createFileRoute } from "@tanstack/react-router";
import { AuthProvider } from "@/components/AuthProvider";
import { Generator } from "@/components/Generator";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "GenMix — AI Content Generator | Text, Images, Code & PicMix" },
      { name: "description", content: "Create stunning text, images, and code with AI. Mix your pictures with PicMix. Free AI-powered content generator." },
    ],
  }),
});

function Index() {
  return (
    <AuthProvider>
      <Generator />
    </AuthProvider>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { Mininja } from "@/components/mininja";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <Mininja />;
}

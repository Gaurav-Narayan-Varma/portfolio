import { type Tool } from "@/types/stackTypes";

export type Project = {
    name: string;
    description: string;
    overviewImage: string;
    logoImage: string;
    slug: string;
    stack: Tool[];
  };
  
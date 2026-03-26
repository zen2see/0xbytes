"use client";

import * as React from "react";
// Removed unused lucide-react import
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { useTheme } from "./theme-provider";
import { Palette } from "@phosphor-icons/react"; // Using Phosphor icons as they are already in use.

export function ThemeSwitcher() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="fixed bottom-4 right-4 z-50">
          <Palette className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("neutral-dark")}>
          Neutral Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("ocean-blue-dark")}>
          Ocean Blue Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("forest-green-dark")}>
          Forest Green Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("orange-dark")}>
          Orange Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("violet-dark")}>
          Violet Dark
        </DropdownMenuItem>
        <DropdownMenuSeparator /> {/* Optional separator */}
        <DropdownMenuItem onClick={() => setTheme("neutral-light")}>
          Neutral Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("mint-light")}>
          Mint Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("cream-light")}>
          Cream Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("light-blue")}>
          Light Blue
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Adding DropdownMenuSeparator for better UI, assuming it's available in shadcn/ui
// If not, it will cause a build error and need to be added or removed.
import { DropdownMenuSeparator } from "./ui/dropdown-menu";

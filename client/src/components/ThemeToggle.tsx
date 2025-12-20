import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function ThemeToggle() {
  const { theme, actualTheme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 rounded-lg hover:bg-accent"
            >
              {actualTheme === "dark" ? (
                <Moon className="h-4 w-4 text-blue-400" />
              ) : (
                <Sun className="h-4 w-4 text-yellow-500" />
              )}
              <span className="sr-only">تبديل المظهر</span>
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>تغيير المظهر</p>
        </TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem 
          onClick={() => setTheme("light")}
          className={`cursor-pointer ${theme === "light" ? "bg-accent" : ""}`}
        >
          <Sun className="ml-2 h-4 w-4 text-yellow-500" />
          <span>فاتح</span>
          {theme === "light" && <span className="mr-auto text-primary">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("dark")}
          className={`cursor-pointer ${theme === "dark" ? "bg-accent" : ""}`}
        >
          <Moon className="ml-2 h-4 w-4 text-blue-400" />
          <span>داكن</span>
          {theme === "dark" && <span className="mr-auto text-primary">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("system")}
          className={`cursor-pointer ${theme === "system" ? "bg-accent" : ""}`}
        >
          <Monitor className="ml-2 h-4 w-4 text-gray-500" />
          <span>تلقائي</span>
          {theme === "system" && <span className="mr-auto text-primary">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

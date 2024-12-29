import { ThemeSwitcherBtn } from "@/components/ThemeSwitcherBtn";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AlignCenter, Menu } from "lucide-react";
import supabaseClient from "@/config/supabaseClient";

type Props = {};

const Navbar = (props: Props) => {
  const [userName, setUserName] = useState("User");
  const [userEmail, setUserEmail] = useState("user@example.com");

  useEffect(() => {
    // Fetch user data
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabaseClient.auth.getUser();
      if (user) {
        setUserName(user.user_metadata?.name || "User");
        setUserEmail(user.email || "user@example.com");
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabaseClient.auth.signOut();
    // window.location.href = "/login"; // Redirect to login page after logout
  };

  return (
    <div className="w-full">
      <DesktopNavbar userName={userName} userEmail={userEmail} onLogout={handleLogout} />
      <MobileNavbar userName={userName} userEmail={userEmail} onLogout={handleLogout} />
    </div>
  );
};

export default Navbar;

// Items for Navbar
const items = [
  { label: "Dashboard", link: "/" },
  { label: "Transaction", link: "/transaction" },
  { label: "Manage", link: "/manage" },
];

// Desktop Navbar
function DesktopNavbar({
  userName,
  userEmail,
  onLogout,
}: {
  userName: string;
  userEmail: string;
  onLogout: () => void;
}) {
  return (
    <div className="border-separate border-b bg-background hidden md:flex justify-center">
      <nav className="container flex items-center justify-between lg:px-0 px-2">
        <div className="flex w-full h-[80px] min-h-[60px] items-center justify-between gap-x-4">
          <div className="flex h-full items-center gap-2">
            <Logo />
            <div className="flex h-full">
              {items.map((item) => (
                <NavbarItem key={item.label} link={item.link} label={item.label} />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeSwitcherBtn />
            <UserNav userName={userName} userEmail={userEmail} onLogout={onLogout} />
          </div>
        </div>
      </nav>
    </div>
  );
}

// Navbar Item Component
function NavbarItem({
  link,
  label,
  clickCallBack,
}: {
  link: string;
  label: string;
  clickCallBack?: () => void;
}) {
  const location = useLocation();
  const isActive = location.pathname === link;

  return (
    <div className="relative flex items-center">
      <Link
        to={link}
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "w-full justify-start text-lg text-muted-foreground hover:text-foreground",
          isActive && "text-foreground"
        )}
        onClick={() => {
          if (clickCallBack) clickCallBack();
        }}
      >
        {label}
      </Link>
      {isActive && (
        <div className="absolute -bottom-[2px] left-1/2 hidden h-[2px] w-[80%] -translate-x-1/2 rounded-xl bg-foreground md:block"></div>
      )}
    </div>
  );
}

// Logo
function Logo() {
  return (
    <div className="lg:text-2xl text-xl font-semibold bg-gradient-to-r from-[#e49932] to-[#fbc02d] bg-clip-text text-transparent">
      BudgetTracker
    </div>
  );
}

// User Navigation Menu with Logout Button
function UserNav({
  userName,
  userEmail,
  onLogout,
}: {
  userName: string;
  userEmail: string;
  onLogout: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userName}</p>
            <p className="text-xs leading-none text-muted-foreground">{userEmail}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={onLogout} style={{ textAlign: 'center' , cursor:'pointer' }}>Logout</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Mobile Navbar
function MobileNavbar({
  userName,
  userEmail,
  onLogout,
}: {
  userName: string;
  userEmail: string;
  onLogout: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="block border-separate bg-background md:hidden">
      <nav className="container flex items-center justify-between sm:px-0 px-2 m-auto">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant={"ghost"} size={"icon"}>
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[400px] sm:w-[540px]" side="left">
            <Logo />
            <div className="flex flex-col gap-1 pt-4">
              {items.map((item) => (
                <NavbarItem
                  key={item.label}
                  link={item.link}
                  label={item.label}
                  clickCallBack={() => setIsOpen(false)}
                />
              ))}
            </div>
            <div className="flex flex-col gap-2 pt-4">
              <Button variant="outline" onClick={onLogout} className="w-full">
                Logout
              </Button>
            </div>
            <div className="flex justify-end">
              <ThemeSwitcherBtn />
            </div>
          </SheetContent>
        </Sheet>
        <div className="flex h-[80px] min-h-[60px] items-center gap-x-4">
          <Logo />
        </div>
        <div className="flex items-center gap-2">
          <UserNav userName={userName} userEmail={userEmail} onLogout={onLogout} />
        </div>
      </nav>
    </div>
  );
}

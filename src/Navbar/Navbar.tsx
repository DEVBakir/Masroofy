import { ThemeSwitcherBtn } from "@/components/ThemeSwitcherBtn"
import { Button, buttonVariants } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {Link, useLocation} from "react-router-dom"
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

type Props = {}

const Navbar = (props: Props) => {
  return (
    <div className="w-full">
        <DesktopNavbar />
        <MobileNavbar />
    </div>
  )
}

export default Navbar

const items = [
    { label: "Dashboard" , link: "/"},
    { label: "Transaction" , link: "/transaction"},
    { label: "Manage" , link: "/manage"}

]

function DesktopNavbar() {
    return (
        <div className="border-separate border-b bg-background hidden md:flex justify-center">
            <nav className="container flex items-center justify-between px-8">
                <div className="flex w-full h-[80px] min-h-[60px] items-center justify-between gap-x-4">
                    <div className="flex h-full items-center gap-2">
                        <Logo />
                        <div className="flex h-full">
                        {
                            items.map((item) => (
                                <NavbarItem 
                                key={item.label}
                                link={item.link}
                                label={item.label}
                                />
                            ))
                        }
                        </div>
                    </div>
                   
                    <div className="flex items-center gap-2">
                            <ThemeSwitcherBtn />
                            <UserNav />
                        </div>
                </div>
            </nav>
        </div>
    )
}

function Logo() {
    return (
        <div className="lg:text-2xl text-xl font-semibold bg-gradient-to-r from-[#e49932] to-[#fbc02d] bg-clip-text text-transparent">
        BudgetTracker
      </div>
      
    )
}


function NavbarItem({link,label,clickCallBack}: {link: string;
    label: string; clickCallBack?: ()=> void
}){
    const location = useLocation()
    const isActive = location.pathname === link

    return (
        <div className="relative flex items-center">
            <Link to={link} 
            className={     
                    cn(buttonVariants({variant:"ghost"}),
                    "w-full justify-start text-lg text-muted-foreground hover:text-foreground",
                    isActive && "text-foreground"
                )}
            onClick={()=> {
                if (clickCallBack) clickCallBack();
            }}
                >
                {label}
            </Link>
            {
                isActive && (
                    <div className="absolute -bottom-[2px] left-1/2 hidden h-[2px] w-[80%]  -translate-x-1/2 rounded-xl bg-foreground md:block">
                    </div>
                )
            }
        </div>
    )
}

function UserNav() {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarFallback>B</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">Hadj Said Bakir</p>
              <p className="text-xs leading-none text-muted-foreground">
                hsbakir.dev@gmail.com
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
        </DropdownMenuContent>
      </DropdownMenu>
    );
}

function MobileNavbar() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="block border-separate bg-background md:hidden">
            <nav className="container flex items-center justify-between sm:px-8 px-5 m-auto">
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild>
                        <Button variant={"ghost"} size={"icon"}>
                            <Menu />
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="w-[400px] sm:w-[540px]" side="left">
                        <Logo />
                        <div className="flex flex-col gap-1 pt-4">
                            {
                                items.map((item)=> (
                                    <NavbarItem 
                                        key={item.label}
                                        link={item.link}
                                        label={item.label}
                                        clickCallBack={()=> setIsOpen(false)}
                                    />
                                ))
                            }
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
                    <UserNav />
                </div>
            </nav>
        </div>
    )
}
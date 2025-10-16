import { Twitter, Linkedin } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-1">
                <h3 className="font-headline text-lg font-bold">StudyMune</h3>
                <p className="text-muted-foreground mt-2 text-sm">Your all-in-one platform for academic excellence.</p>
            </div>
            <div className="col-span-1">
                <h4 className="font-semibold mb-4">Quick Links</h4>
                <ul className="space-y-2">
                    <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Home</Link></li>
                    <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Pricing</Link></li>
                </ul>
            </div>
            <div className="col-span-1">
                <h4 className="font-semibold mb-4">Company</h4>
                <ul className="space-y-2">
                    <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">About Us</Link></li>
                    <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Contact</Link></li>
                    <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Terms & Policies</Link></li>
                    <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Refund Policy</Link></li>
                </ul>
            </div>
            <div className="col-span-1">
                <h4 className="font-semibold mb-4">Follow Us</h4>
                <div className="flex space-x-4">
                    <Link href="#" className="text-muted-foreground hover:text-primary"><Twitter className="h-6 w-6" /></Link>
                    <Link href="#" className="text-muted-foreground hover:text-primary"><Linkedin className="h-6 w-6" /></Link>
                </div>
            </div>
        </div>
        <div className="border-t mt-8 pt-4 text-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} StudyMune. All rights reserved.
            </p>
        </div>
      </div>
    </footer>
  );
}

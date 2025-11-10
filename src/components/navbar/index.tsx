import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full p-3 sm:p-4 max-h-[90px] border-b border-gray-200 shadow-md">
      <div className="flex items-center justify-between h-full max-w-7xl mx-auto">
        <div className="relative h-8 w-8 sm:h-10 sm:w-10">
          <Link href={"/"}>
            <Image
              src="/ozzy_logo.png"
              alt="ozzy-logo"
              fill
              className="object-contain"
              priority
              sizes="(max-width: 640px) 32px, 42px"
              unoptimized
            />
          </Link>
        </div>
        <div className="relative h-7 w-7 sm:h-9 sm:w-9">
          <Link
            href="https://github.com/leonardoTavaresM"
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Image
              src="/github.svg"
              alt="GitHub"
              fill
              className="object-contain hover:opacity-80 transition-opacity"
              sizes="(max-width: 640px) 28px, 32px"
            />
          </Link>
        </div>
      </div>
    </nav>
  );
}

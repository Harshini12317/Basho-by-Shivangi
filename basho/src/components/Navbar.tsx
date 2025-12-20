import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full bg-gradient-to-r from-[#442D1C] via-[#652810] to-[#8E5022] text-white shadow-2xl z-50 border-b-4 border-[#C85428]/30 rounded-b-3xl backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-[#EDD8B4] transform hover:rotate-1 transition-transform hover:scale-105">
              Basho Pottery
            </Link>
          </div>
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-[#EDD8B4] hover:text-[#8E5022] transition-all duration-300 transform hover:scale-110 hover:-rotate-2 font-semibold bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full">
              Home
            </Link>
            <Link href="/products" className="text-[#EDD8B4] hover:text-[#8E5022] transition-all duration-300 transform hover:scale-110 hover:rotate-2 font-semibold bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full">
              Products
            </Link>
            <Link href="/about" className="text-[#EDD8B4] hover:text-[#8E5022] transition-all duration-300 transform hover:scale-110 hover:rotate-1 font-semibold bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full">
              About
            </Link>
            <Link href="/favorites" className="text-[#EDD8B4] hover:text-[#8E5022] transition-all duration-300 transform hover:scale-110 hover:-rotate-1 font-semibold bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full">
              ♥ Fav
            </Link>
            <Link href="/checkout" className="text-[#EDD8B4] hover:text-[#8E5022] transition-all duration-300 transform hover:scale-110 hover:rotate-1 font-semibold bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full">
              🛒 Cart
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
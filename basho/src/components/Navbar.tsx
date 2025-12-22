import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full glassmorphism text-[#442D1C] shadow-2xl z-50 border-b-4 border-[#C85428]/30 elegant-rounded-b-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold serif text-[#442D1C] transform hover:rotate-1 transition-transform hover:scale-105">
              BASHO BYY SHIVANGI
            </Link>
          </div>
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-[#442D1C] hover:text-[#8E5022] transition-all duration-300 transform hover:scale-110 hover:-rotate-2 font-semibold bg-[#EDD8B4]/20 hover:bg-[#EDD8B4]/40 px-6 py-3 elegant-rounded-full hover-lift">
              Home
            </Link>
            <Link href="/products" className="text-[#442D1C] hover:text-[#8E5022] transition-all duration-300 transform hover:scale-110 hover:rotate-2 font-semibold bg-[#EDD8B4]/20 hover:bg-[#EDD8B4]/40 px-6 py-3 elegant-rounded-full hover-lift">
              Products
            </Link>
            <Link href="/custom-order" className="text-[#442D1C] hover:text-[#8E5022] transition-all duration-300 transform hover:scale-110 hover:-rotate-2 font-semibold bg-[#EDD8B4]/20 hover:bg-[#EDD8B4]/40 px-6 py-3 elegant-rounded-full hover-lift">
              Custom Order
            </Link>
            <Link href="/about" className="text-[#442D1C] hover:text-[#8E5022] transition-all duration-300 transform hover:scale-110 hover:rotate-1 font-semibold bg-[#EDD8B4]/20 hover:bg-[#EDD8B4]/40 px-6 py-3 elegant-rounded-full hover-lift">
              About
            </Link>
            <Link href="/favorites" className="text-[#442D1C] hover:text-[#8E5022] transition-all duration-300 transform hover:scale-110 hover:-rotate-1 font-semibold bg-[#EDD8B4]/20 hover:bg-[#EDD8B4]/40 px-6 py-3 elegant-rounded-full hover-lift">
              ♥ Fav
            </Link>
            <Link href="/checkout" className="text-[#442D1C] hover:text-[#8E5022] transition-all duration-300 transform hover:scale-110 hover:rotate-1 font-semibold bg-[#EDD8B4]/20 hover:bg-[#EDD8B4]/40 px-6 py-3 elegant-rounded-full hover-lift">
              🛒 Cart
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
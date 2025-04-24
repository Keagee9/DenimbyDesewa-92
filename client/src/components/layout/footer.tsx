import { Link } from "wouter";
import { 
  FaInstagram, 
  FaTiktok, 
  FaSnapchat, 
  FaWhatsapp,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope
} from "react-icons/fa";

export function Footer() {
  return (
    <footer className="bg-neutral-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="text-xl font-bold mb-4">Denim by Desewa</h3>
            <p className="text-neutral-400 mb-4">
              Premium quality denim clothing and accessories for style-conscious individuals.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://www.instagram.com/denimbydesewa?igsh=dzJ2cnB1dnV0bXk1&utm_source=qr" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white hover:text-primary transition-colors"
              >
                <FaInstagram className="text-xl" />
              </a>
              <a 
                href="https://www.tiktok.com/@denimbydesewa" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white hover:text-primary transition-colors"
              >
                <FaTiktok className="text-xl" />
              </a>
              <a 
                href="https://snapchat.com/t/Uw2Fa3P1" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white hover:text-primary transition-colors"
              >
                <FaSnapchat className="text-xl" />
              </a>
              <a 
                href="https://wa.me/2349033221858" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white hover:text-primary transition-colors"
              >
                <FaWhatsapp className="text-xl" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4">Shop</h3>
            <ul className="space-y-2 text-neutral-400">
              <li>
                <Link href="/shop">
                  <a className="hover:text-white transition-colors">All Products</a>
                </Link>
              </li>
              <li>
                <Link href="/new-arrivals">
                  <a className="hover:text-white transition-colors">New Arrivals</a>
                </Link>
              </li>
              <li>
                <Link href="/shop?featured=true">
                  <a className="hover:text-white transition-colors">Featured</a>
                </Link>
              </li>
              <li>
                <Link href="/shop?category=accessories">
                  <a className="hover:text-white transition-colors">Accessories</a>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4">Customer Service</h3>
            <ul className="space-y-2 text-neutral-400">
              <li>
                <Link href="/contact">
                  <a className="hover:text-white transition-colors">Contact Us</a>
                </Link>
              </li>
              <li>
                <Link href="/shipping">
                  <a className="hover:text-white transition-colors">Shipping & Returns</a>
                </Link>
              </li>
              <li>
                <Link href="/faq">
                  <a className="hover:text-white transition-colors">FAQ</a>
                </Link>
              </li>
              <li>
                <Link href="/size-guide">
                  <a className="hover:text-white transition-colors">Size Guide</a>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4">Contact</h3>
            <ul className="space-y-2 text-neutral-400">
              <li className="flex items-start">
                <FaMapMarkerAlt className="mt-1 mr-3 text-primary" />
                <span>Lagos, Nigeria</span>
              </li>
              <li className="flex items-start">
                <FaPhone className="mt-1 mr-3 text-primary" />
                <span>+234 903 322 1858</span>
              </li>
              <li className="flex items-start">
                <FaEnvelope className="mt-1 mr-3 text-primary" />
                <span>info@denimbydesewa.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-neutral-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-neutral-500 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} Denim by Desewa. All rights reserved.
          </p>
          <div className="flex space-x-4">
            <Link href="/privacy">
              <a className="text-neutral-500 hover:text-white text-sm">
                Privacy Policy
              </a>
            </Link>
            <Link href="/terms">
              <a className="text-neutral-500 hover:text-white text-sm">
                Terms of Service
              </a>
            </Link>
            <Link href="/refund">
              <a className="text-neutral-500 hover:text-white text-sm">
                Refund Policy
              </a>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

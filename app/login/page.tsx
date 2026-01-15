import Image from 'next/image';
import { LoginPageClient } from './LoginPageClient';

export default async function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Static content */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center p-12">
        {/* Glass effect container with gradient */}
        <div className="relative z-10 w-full h-full flex flex-col p-12 rounded-3xl backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden">
          {/* Gradient background image */}
          <Image src="/Shape.png" alt="Background Shape" fill className="object-cover opacity-70 -z-10" priority />
          {/* Logo */}
          <div className="mb-auto">
            <Image src="/blockx-logo.svg" alt="BlockX" width={100} height={32} className="h-6 lg:h-7 xl:h-8 w-auto" />
          </div>

          {/* Phone mockup with stacked images */}
          <div className="flex items-center justify-center flex-1">
            <div className="relative">
              <Image
                src="/blockx-phone.png"
                alt="Phone"
                width={400}
                height={800}
                className="w-auto h-[60vh] lg:h-[65vh] xl:h-[70vh] object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative overflow-hidden">
        {/* Background image */}
        <Image src="/login-bg.png" alt="Background" fill className="object-cover opacity-60" priority />
        {/* Mobile logo */}
        <div className="lg:hidden mb-8 flex justify-center absolute top-6 left-0 right-0 z-10">
          <Image src="/blockx-logo.svg" alt="BlockX" width={120} height={36} className="h-9 w-auto" />
        </div>
        <LoginPageClient />
      </div>
    </div>
  );
}

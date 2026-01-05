// import { ModeToggle } from '@/components/mode-toggle';
// import { UserDropdown } from '@/components/user-dropdown';
// import { getServerSession } from '@/lib/get-session';
// import Link from 'next/link';

// export async function Navbar() {
//   const session = await getServerSession();
//   const user = session?.user;

//   if (!user) return null;

//   return (
//     <header className='bg-background border-b'>
//       <div className='mx-auto flex max-w-6xl items-center justify-between px-4 py-3'>
//         <Link
//           href='/dashboard'
//           className='flex items-center gap-2 font-semibold'
//         >
//           Sadna Tracker
//         </Link>
//         <nav className='flex items-center gap-6'>
//           <Link
//             href='/dashboard'
//             className='text-sm font-medium text-muted-foreground hover:text-foreground transition-colors'
//           >
//             Dashboard
//           </Link>
//           <Link
//             href='/dashboard/tracker'
//             className='text-sm font-medium text-muted-foreground hover:text-foreground transition-colors'
//           >
//             Tracker
//           </Link>
//         </nav>
//         <div className='flex items-center gap-2'>
//           <ModeToggle />
//           <UserDropdown user={user} />
//         </div>
//       </div>
//     </header>
//   );
// }

import { getServerSession } from '@/lib/get-session';
import { NavbarClient } from './navbar-client';

export async function Navbar() {
  const session = await getServerSession();
  const user = session?.user;

  if (!user) return null;

  return <NavbarClient user={user} />;
}

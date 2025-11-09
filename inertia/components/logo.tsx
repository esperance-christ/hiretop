import React from 'react';
import { cn } from '~/lib/utils';

const Logo = ({ className }: { className?: string }) => {
  return (
    <div className="flex items-center space-x-2" role="img" aria-label="Logo hireTop">
      <div className="bg-green-600 p-1.5 rounded-lg">
        <span className="text-white font-bold text-sm">hire</span>
      </div>
      <span className={cn('text-xl font-bold', className)}>hireTop</span>
      <span className="block h-2 w-2 rounded-full bg-amber-400" />
    </div>
  );
};

export default Logo;

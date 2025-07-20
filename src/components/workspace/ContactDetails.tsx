'use client';

import { Mail, Phone, User } from 'lucide-react';

export default function ContactDetails() {
  return (
    <div className="bg-gradient-to-r from-gray-800 to-gray-700 border-l-4 border-green-500 p-3 mb-6 rounded-lg">
      <div className="flex items-center justify-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-green-400" />
          <span className="font-semibold text-white">Contact: Nishen Harichunder - Creator</span>
        </div>
        <div className="flex items-center space-x-2">
          <Mail className="h-4 w-4 text-blue-400" />
          <a href="mailto:nishenh@ftechkzn.co.za" className="text-blue-400 hover:text-blue-300">
            nishenh@ftechkzn.co.za
          </a>
        </div>
        <div className="flex items-center space-x-2">
          <Phone className="h-4 w-4 text-yellow-400" />
          <span className="text-yellow-400">074 745 1618</span>
        </div>
      </div>
    </div>
  );
}
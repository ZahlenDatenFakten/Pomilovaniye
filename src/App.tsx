import React from 'react';
import GovernorDecreeView from './components/GovernorDecreeView';

export default function App() {
  const mockUser = {
    id: '123',
    role: 'Губернатор',
    full_name: 'Test Governor',
    discord_roles: ['1527281334135947285']
  };

  return (
    <div className="p-8">
      <GovernorDecreeView user={mockUser} />
    </div>
  );
}

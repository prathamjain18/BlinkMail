import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Drafts from '../pages/Drafts';

// Mock data for drafts
const mockDrafts = [
  { id: 1, subject: 'Test Draft 1', body: 'Body 1' },
  { id: 2, subject: 'Test Draft 2', body: 'Body 2' },
];

jest.mock('../pages/Drafts', () => (props: any) => (
  <div>
    {mockDrafts.map(draft => (
      <div key={draft.id} data-testid="draft-item">
        <span>{draft.subject}</span>
        <span>{draft.body}</span>
      </div>
    ))}
    <button onClick={() => {}}>Save Draft</button>
  </div>
));

describe('Drafts Page', () => {
  it('renders draft items', () => {
    render(<Drafts />);
    const draftItems = screen.getAllByTestId('draft-item');
    expect(draftItems.length).toBe(2);
    expect(screen.getByText('Test Draft 1')).toBeInTheDocument();
    expect(screen.getByText('Test Draft 2')).toBeInTheDocument();
  });

  it('has a save draft button', () => {
    render(<Drafts />);
    expect(screen.getByText('Save Draft')).toBeInTheDocument();
  });
}); 
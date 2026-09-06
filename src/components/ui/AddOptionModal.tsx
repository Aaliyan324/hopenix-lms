import React, { useState } from 'react';
import { Modal } from './Modal';
import { Input } from './Input';
import { Button } from './Button';
import { useToast } from './Toast';
import { apiFetch } from '../../lib/api';

interface AddOptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'class' | 'subject';
  onCreated: (newOption: { id: string; name: string }) => void;
}

export const AddOptionModal: React.FC<AddOptionModalProps> = ({
  isOpen,
  onClose,
  type,
  onCreated,
}) => {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isClass = type === 'class';
  const title = isClass ? 'Add New Class / Grade' : 'Add New Subject';
  const label = isClass ? 'Class / Grade Name *' : 'Subject Name *';
  const placeholder = isClass ? 'e.g. Class 11, Nursery, O-Level' : 'e.g. Mathematics, History, Physics';
  const endpoint = isClass ? '/class-grades' : '/subjects';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = name.trim();
    if (!trimmed) {
      setError('Please enter a value.');
      return;
    }

    try {
      setSaving(true);
      const data = await apiFetch<{ classGrade?: { id: string; name: string }; subject?: { id: string; name: string } }>(
        endpoint,
        {
          method: 'POST',
          body: JSON.stringify({ name: trimmed }),
        }
      );

      const createdObj = isClass ? data.classGrade : data.subject;
      if (createdObj) {
        toast(`${isClass ? 'Class/Grade' : 'Subject'} "${createdObj.name}" created successfully!`, 'success');
        onCreated(createdObj);
        setName('');
        onClose();
      }
    } catch (err: any) {
      const msg = err.message || 'Something went wrong. Please try again.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <Input
            label={label}
            placeholder={placeholder}
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setName(e.target.value);
              if (error) setError(null);
            }}
            required
            autoFocus
          />
          {error && <p className="text-xs text-rose-400 font-semibold mt-1">{error}</p>}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
          <Button variant="outline" type="button" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={saving}>
            Save {isClass ? 'Class' : 'Subject'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { providerAPI, uploadAPI } from '@/lib/api';

export default function EditProfilePage() {
  const { user, updateUser } = useAuth();
  const router = useRouter();

  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [profession, setProfession] = useState((user as any)?.profession || '');
  const [description, setDescription] = useState((user as any)?.description || '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Update profile text fields
      await providerAPI.updateProfile({
        first_name: firstName,
        last_name: lastName,
        profession: profession || undefined,
        description: description || undefined,
      });

      // Upload image if provided
      let imageResp: any = null;
      if (imageFile) {
        imageResp = await uploadAPI.uploadProfileImage(imageFile);
      }

      // Update local context user
      const updated: any = {
        first_name: firstName,
        last_name: lastName,
      };
      if (profession) updated.profession = profession;
      if (description) updated.description = description;
      if (imageResp && (imageResp.fullImageUrl || imageResp.imageUrl)) {
        updated.profile_image = imageResp.fullImageUrl || imageResp.imageUrl;
      }

      updateUser(updated);
      setSuccess('Profile updated successfully');
      setTimeout(() => {
        router.push('/dashboard');
      }, 900);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-4">Edit Profile</h1>

      {error && <div className="mb-4 text-red-600">{error}</div>}
      {success && <div className="mb-4 text-green-600">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
        <div>
          <label className="block text-sm font-medium text-gray-700">First name</label>
          <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md p-2" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Last name</label>
          <input value={lastName} onChange={(e) => setLastName(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md p-2" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Profession (optional)</label>
          <input value={profession} onChange={(e) => setProfession(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md p-2" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description (optional)</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md p-2" rows={4} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Profile image (optional)</label>
          <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)} className="mt-1" />
        </div>

        <div className="flex items-center justify-end space-x-2">
          <button type="button" onClick={() => router.back()} className="px-4 py-2 rounded border border-gray-200">Cancel</button>
          <button type="submit" disabled={loading} className="px-4 py-2 rounded bg-indigo-600 text-white">
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

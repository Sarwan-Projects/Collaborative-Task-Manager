import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Mail, Calendar, Shield, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useUpdateProfile } from '../hooks/useAuth';
import { profileSchema, ProfileInput } from '../lib/validations';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function Profile() {
  const { user } = useAuth();
  const updateProfile = useUpdateProfile();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty }
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || ''
    }
  });

  const onSubmit = (data: ProfileInput) => {
    updateProfile.mutate(data);
  };

  return (
    <div className="max-w-3xl mx-auto fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
        <p className="text-gray-500">Manage your account information and preferences</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
        {/* Header with gradient */}
        <div className="h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        
        {/* Profile Info */}
        <div className="px-8 pb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-16 mb-8">
            <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl border-4 border-white">
              <span className="text-5xl text-white font-bold">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="text-center sm:text-left pb-2">
              <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
              <p className="text-gray-500">{user?.email}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-4 text-center">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
              </div>
              <p className="text-sm text-gray-500">Member since</p>
              <p className="font-semibold text-gray-900">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
              </p>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-4 text-center">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Shield className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-sm text-gray-500">Account Status</p>
              <p className="font-semibold text-emerald-600">Active</p>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 text-center">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Mail className="w-5 h-5 text-amber-600" />
              </div>
              <p className="text-sm text-gray-500">Email Status</p>
              <p className="font-semibold text-amber-600">Verified</p>
            </div>
          </div>

          {/* Edit Form */}
          <div className="border-t border-gray-100 pt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Edit Profile</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Input
                label="Full Name"
                placeholder="Your name"
                error={errors.name?.message}
                icon={<User className="w-5 h-5" />}
                {...register('name')}
              />

              <Input
                label="Email Address"
                value={user?.email}
                disabled
                className="bg-gray-50"
                icon={<Mail className="w-5 h-5" />}
              />

              <div className="flex justify-end pt-4">
                <Button 
                  type="submit" 
                  variant="gradient"
                  isLoading={updateProfile.isPending}
                  disabled={!isDirty}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="mt-8 bg-white rounded-2xl border border-red-100 p-6">
        <h3 className="text-lg font-semibold text-red-600 mb-2">Danger Zone</h3>
        <p className="text-gray-500 text-sm mb-4">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <Button variant="danger" size="sm" disabled>
          Delete Account
        </Button>
      </div>
    </div>
  );
}

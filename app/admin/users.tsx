import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Image,
  TextInput,
  Modal,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import {
  useListAllUsersQuery,
  useUpdateUserMutation,
  useUpdateUserRoleMutation,
} from '@/store/services/adminApi';
import {
  User,
  Mail,
  Phone,
  MapPin,
  RefreshCw,
  Search,
  Edit2,
  Shield,
  CheckCircle,
  XCircle,
  X,
} from 'lucide-react-native';

interface UserFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  is_active: boolean;
  role: 'client' | 'provider' | 'admin';
}

export default function UserManagement() {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'client' | 'provider' | 'admin'>('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [formData, setFormData] = useState<UserFormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    is_active: true,
    role: 'client',
  });

  const {
    data: users,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useListAllUsersQuery();

  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [updateUserRole, { isLoading: isUpdatingRole }] = useUpdateUserRoleMutation();

  if (!user || (user.role !== 'admin' && !user.admin)) {
    router.back();
    return null;
  }

  const openEditModal = (userData: any) => {
    setSelectedUser(userData);
    setFormData({
      first_name: userData.first_name || '',
      last_name: userData.last_name || '',
      email: userData.email || '',
      phone_number: userData.phone_number || '',
      is_active: userData.is_active !== false,
      role: userData.role || 'client',
    });
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedUser(null);
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone_number: '',
      is_active: true,
      role: 'client',
    });
  };

  const handleSubmit = async () => {
    if (!selectedUser) return;

    if (!formData.first_name.trim() || !formData.last_name.trim() || !formData.email.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      console.log('Updating user:', selectedUser.pkid, formData);
      
      const updateData: any = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        is_active: formData.is_active,
      };
      
      if (formData.phone_number) {
        updateData.phone_number = formData.phone_number;
      }

      await updateUser({
        pkid: selectedUser.pkid,
        data: updateData,
      }).unwrap();

      if (formData.role !== selectedUser.role) {
        await updateUserRole({
          userId: selectedUser.id || String(selectedUser.pkid),
          role: formData.role,
        }).unwrap();
      }

      Alert.alert('Success', 'User updated successfully');
      closeModal();
      refetch();
    } catch (err: any) {
      console.error('Update user error:', err);
      Alert.alert('Error', err?.data?.detail || 'Failed to update user');
    }
  };

  const handleToggleActive = async (userData: any) => {
    const action = userData.is_active !== false ? 'deactivate' : 'activate';
    Alert.alert(
      `${action.charAt(0).toUpperCase() + action.slice(1)} User`,
      `Are you sure you want to ${action} ${userData.full_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action.charAt(0).toUpperCase() + action.slice(1),
          style: action === 'deactivate' ? 'destructive' : 'default',
          onPress: async () => {
            try {
              console.log(`${action} user:`, userData.pkid);
              await updateUser({
                pkid: userData.pkid,
                data: { is_active: userData.is_active === false },
              }).unwrap();
              Alert.alert('Success', `User ${action}d successfully`);
              refetch();
            } catch (err: any) {
              console.error(`${action} user error:`, err);
              Alert.alert('Error', err?.data?.detail || `Failed to ${action} user`);
            }
          },
        },
      ]
    );
  };

  const filteredUsers = users?.filter((u) => {
    const matchesSearch =
      searchQuery === '' ||
      u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  }) || [];

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'User Management',
          headerStyle: { backgroundColor: '#2D1A46' },
          headerTintColor: 'white',
          headerTitleStyle: { fontWeight: '700' },
        }}
      />

      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Search size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          <TouchableOpacity
            style={[styles.filterChip, roleFilter === 'all' && styles.filterChipActive]}
            onPress={() => setRoleFilter('all')}
          >
            <Text style={[styles.filterText, roleFilter === 'all' && styles.filterTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, roleFilter === 'client' && styles.filterChipActive]}
            onPress={() => setRoleFilter('client')}
          >
            <Text style={[styles.filterText, roleFilter === 'client' && styles.filterTextActive]}>
              Clients
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, roleFilter === 'provider' && styles.filterChipActive]}
            onPress={() => setRoleFilter('provider')}
          >
            <Text style={[styles.filterText, roleFilter === 'provider' && styles.filterTextActive]}>
              Providers
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, roleFilter === 'admin' && styles.filterChipActive]}
            onPress={() => setRoleFilter('admin')}
          >
            <Text style={[styles.filterText, roleFilter === 'admin' && styles.filterTextActive]}>
              Admins
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2D1A46" />
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Failed to load users</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <RefreshCw size={20} color="white" />
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isFetching} onRefresh={refetch} />
          }
        >
          {filteredUsers.length === 0 ? (
            <View style={styles.emptyContainer}>
              <User size={64} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>No Users Found</Text>
              <Text style={styles.emptyText}>
                {searchQuery || roleFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'No users in the system'}
              </Text>
            </View>
          ) : (
            filteredUsers.map((userData) => (
              <View key={userData.pkid} style={styles.userCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.userInfo}>
                    {userData.profile_photo ? (
                      <Image
                        source={{ uri: userData.profile_photo }}
                        style={styles.avatar}
                      />
                    ) : (
                      <View style={styles.avatarPlaceholder}>
                        <User size={24} color="#6B7280" />
                      </View>
                    )}
                    <View style={styles.userDetails}>
                      <Text style={styles.userName}>{userData.full_name}</Text>
                      <View style={styles.badgeRow}>
                        <View
                          style={[
                            styles.roleBadge,
                            userData.role === 'admin' && styles.roleAdmin,
                            userData.role === 'provider' && styles.roleProvider,
                            userData.role === 'client' && styles.roleClient,
                          ]}
                        >
                          <Shield size={12} color="white" />
                          <Text style={styles.roleText}>{userData.role}</Text>
                        </View>
                        {userData.is_active !== false ? (
                          <View style={styles.statusActive}>
                            <CheckCircle size={12} color="#10B981" />
                            <Text style={styles.statusActiveText}>Active</Text>
                          </View>
                        ) : (
                          <View style={styles.statusInactive}>
                            <XCircle size={12} color="#DC2626" />
                            <Text style={styles.statusInactiveText}>Inactive</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                </View>

                <View style={styles.cardBody}>
                  <View style={styles.infoRow}>
                    <Mail size={16} color="#6B7280" />
                    <Text style={styles.infoText}>{userData.email}</Text>
                  </View>
                  {userData.phone_number && (
                    <View style={styles.infoRow}>
                      <Phone size={16} color="#6B7280" />
                      <Text style={styles.infoText}>{userData.phone_number}</Text>
                    </View>
                  )}
                  {(userData.city || userData.country) && (
                    <View style={styles.infoRow}>
                      <MapPin size={16} color="#6B7280" />
                      <Text style={styles.infoText}>
                        {[userData.city, userData.country].filter(Boolean).join(', ')}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.cardFooter}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.editActionButton]}
                    onPress={() => openEditModal(userData)}
                    disabled={isUpdating || isUpdatingRole}
                  >
                    <Edit2 size={16} color="#3B82F6" />
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      userData.is_active !== false
                        ? styles.deactivateButton
                        : styles.activateButton,
                    ]}
                    onPress={() => handleToggleActive(userData)}
                    disabled={isUpdating || isUpdatingRole}
                  >
                    {userData.is_active !== false ? (
                      <>
                        <XCircle size={16} color="#DC2626" />
                        <Text style={styles.deactivateButtonText}>Deactivate</Text>
                      </>
                    ) : (
                      <>
                        <CheckCircle size={16} color="#10B981" />
                        <Text style={styles.activateButtonText}>Activate</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit User</Text>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  First Name <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  value={formData.first_name}
                  onChangeText={(text) => setFormData({ ...formData, first_name: text })}
                  placeholder="First Name"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  Last Name <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  value={formData.last_name}
                  onChangeText={(text) => setFormData({ ...formData, last_name: text })}
                  placeholder="Last Name"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  Email <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                  placeholder="email@example.com"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  value={formData.phone_number}
                  onChangeText={(text) => setFormData({ ...formData, phone_number: text })}
                  placeholder="+1234567890"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Role</Text>
                <View style={styles.roleSelector}>
                  {(['client', 'provider', 'admin'] as const).map((role) => (
                    <TouchableOpacity
                      key={role}
                      style={[
                        styles.roleOption,
                        formData.role === role && styles.roleOptionActive,
                      ]}
                      onPress={() => setFormData({ ...formData, role })}
                    >
                      <Text
                        style={[
                          styles.roleOptionText,
                          formData.role === role && styles.roleOptionTextActive,
                        ]}
                      >
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <TouchableOpacity
                  style={styles.toggleRow}
                  onPress={() => setFormData({ ...formData, is_active: !formData.is_active })}
                >
                  <Text style={styles.label}>Account Active</Text>
                  <View
                    style={[
                      styles.toggle,
                      formData.is_active && styles.toggleActive,
                    ]}
                  >
                    <View
                      style={[
                        styles.toggleThumb,
                        formData.is_active && styles.toggleThumbActive,
                      ]}
                    />
                  </View>
                </TouchableOpacity>
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={closeModal}
                  disabled={isUpdating || isUpdatingRole}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.submitButton,
                    (isUpdating || isUpdatingRole) && styles.buttonDisabled,
                  ]}
                  onPress={handleSubmit}
                  disabled={isUpdating || isUpdatingRole}
                >
                  {isUpdating || isUpdatingRole ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.submitButtonText}>Update</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  searchSection: {
    backgroundColor: 'white',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingLeft: 12,
    fontSize: 16,
    color: '#111827',
  },
  filterContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  filterChipActive: {
    backgroundColor: '#2D1A46',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterTextActive: {
    color: 'white',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 12,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#DC2626',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D1A46',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  userCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  roleAdmin: {
    backgroundColor: '#8B5CF6',
  },
  roleProvider: {
    backgroundColor: '#3B82F6',
  },
  roleClient: {
    backgroundColor: '#10B981',
  },
  roleText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'white',
    textTransform: 'capitalize',
  },
  statusActive: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#D1FAE5',
    gap: 4,
  },
  statusActiveText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10B981',
  },
  statusInactive: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
    gap: 4,
  },
  statusInactiveText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#DC2626',
  },
  cardBody: {
    gap: 8,
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#4B5563',
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  editActionButton: {
    backgroundColor: '#DBEAFE',
  },
  editButtonText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '600',
  },
  deactivateButton: {
    backgroundColor: '#FEE2E2',
  },
  deactivateButtonText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '600',
  },
  activateButton: {
    backgroundColor: '#D1FAE5',
  },
  activateButtonText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  form: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#DC2626',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: 'white',
  },
  roleSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  roleOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  roleOptionActive: {
    backgroundColor: '#2D1A46',
  },
  roleOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  roleOptionTextActive: {
    color: 'white',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggle: {
    width: 51,
    height: 31,
    borderRadius: 16,
    backgroundColor: '#D1D5DB',
    justifyContent: 'center',
    padding: 2,
  },
  toggleActive: {
    backgroundColor: '#10B981',
  },
  toggleThumb: {
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: 'white',
  },
  toggleThumbActive: {
    transform: [{ translateX: 20 }],
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  submitButton: {
    backgroundColor: '#2D1A46',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});

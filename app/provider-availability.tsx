import { router, Stack } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, Alert, Switch, TextInput } from 'react-native';
import { ArrowLeft, Calendar, Clock, Plus, AlertCircle } from 'lucide-react-native';
import { 
  useGetProviderAvailabilityQuery, 
  useSetProviderAvailabilityMutation,
  useUpdateProviderAvailabilityMutation,
  useDeleteProviderAvailabilityMutation,
  useGetAvailabilityExceptionsQuery,
  useCreateAvailabilityExceptionMutation,
  useDeleteAvailabilityExceptionMutation
} from '@/store/services/appointmentApi';

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

export default function ProviderAvailabilityScreen() {
  const { data: availability, isLoading, refetch } = useGetProviderAvailabilityQuery();
  const { data: exceptions, refetch: refetchExceptions } = useGetAvailabilityExceptionsQuery();
  const [setAvailability] = useSetProviderAvailabilityMutation();
  const [updateAvailability] = useUpdateProviderAvailabilityMutation();
  const [deleteAvailability] = useDeleteProviderAvailabilityMutation();
  const [createException] = useCreateAvailabilityExceptionMutation();
  const [deleteException] = useDeleteAvailabilityExceptionMutation();

  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');

  const [showExceptionForm, setShowExceptionForm] = useState(false);
  const [exceptionDate, setExceptionDate] = useState('');
  const [exceptionType, setExceptionType] = useState<'unavailable' | 'modified_hours'>('unavailable');
  const [exceptionStartTime, setExceptionStartTime] = useState('');
  const [exceptionEndTime, setExceptionEndTime] = useState('');
  const [exceptionReason, setExceptionReason] = useState('');

  const handleToggleDay = async (dayOfWeek: number, availabilityId: string | undefined, isAvailable: boolean) => {
    try {
      if (isAvailable && availabilityId) {
        await deleteAvailability(availabilityId).unwrap();
      } else {
        await setAvailability({
          day_of_week: dayOfWeek,
          start_time: '09:00:00',
          end_time: '17:00:00',
          is_available: true,
        }).unwrap();
      }
      refetch();
    } catch (error: any) {
      console.error('Toggle availability error:', error);
      Alert.alert('Error', error?.data?.detail || 'Failed to update availability');
    }
  };

  const handleEditDay = (dayOfWeek: number, startTime: string, endTime: string) => {
    setEditingDay(dayOfWeek);
    setEditStartTime(startTime.slice(0, 5));
    setEditEndTime(endTime.slice(0, 5));
  };

  const handleSaveTime = async (availabilityId: string) => {
    if (!editStartTime || !editEndTime) {
      Alert.alert('Error', 'Please enter both start and end times');
      return;
    }

    try {
      await updateAvailability({
        id: availabilityId,
        start_time: editStartTime + ':00',
        end_time: editEndTime + ':00',
      }).unwrap();
      setEditingDay(null);
      setEditStartTime('');
      setEditEndTime('');
      refetch();
      Alert.alert('Success', 'Time updated successfully');
    } catch (error: any) {
      console.error('Update time error:', error);
      Alert.alert('Error', error?.data?.detail || 'Failed to update time');
    }
  };

  const handleCancelEdit = () => {
    setEditingDay(null);
    setEditStartTime('');
    setEditEndTime('');
  };

  const handleCreateException = async () => {
    if (!exceptionDate) {
      Alert.alert('Error', 'Please enter a date (YYYY-MM-DD)');
      return;
    }

    if (exceptionType === 'modified_hours' && (!exceptionStartTime || !exceptionEndTime)) {
      Alert.alert('Error', 'Please enter start and end times for modified hours');
      return;
    }

    try {
      await createException({
        exception_date: exceptionDate,
        exception_type: exceptionType,
        start_time: exceptionType === 'modified_hours' ? exceptionStartTime : undefined,
        end_time: exceptionType === 'modified_hours' ? exceptionEndTime : undefined,
        reason: exceptionReason || undefined,
      }).unwrap();
      
      setExceptionDate('');
      setExceptionStartTime('');
      setExceptionEndTime('');
      setExceptionReason('');
      setShowExceptionForm(false);
      refetchExceptions();
      Alert.alert('Success', 'Exception created successfully');
    } catch (error: any) {
      console.error('Create exception error:', error);
      Alert.alert('Error', error?.data?.detail || 'Failed to create exception');
    }
  };

  const handleDeleteException = async (exceptionId: string) => {
    Alert.alert(
      'Delete Exception',
      'Are you sure you want to delete this exception?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteException(exceptionId).unwrap();
              refetchExceptions();
              Alert.alert('Success', 'Exception deleted successfully');
            } catch (error: any) {
              console.error('Delete exception error:', error);
              Alert.alert('Error', error?.data?.detail || 'Failed to delete exception');
            }
          },
        },
      ]
    );
  };

  const getAvailabilityForDay = (dayOfWeek: number) => {
    return availability?.find(a => a.day_of_week === dayOfWeek);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: true,
          headerTitle: 'Availability Settings',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft color="#2D1A46" size={24} />
            </TouchableOpacity>
          ),
          headerStyle: {
            backgroundColor: '#F4A896',
          },
          headerTintColor: 'white',
        }} 
      />

      <ScrollView style={styles.content}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2D1A46" />
          </View>
        ) : (
          <>
            {/* Weekly Availability */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Weekly Schedule</Text>
              <Text style={styles.sectionDescription}>
                Set your regular weekly availability
              </Text>

              {DAYS_OF_WEEK.map((day) => {
                const dayAvailability = getAvailabilityForDay(day.value);
                const isAvailable = dayAvailability?.is_available || false;
                const isEditing = editingDay === day.value;

                return (
                  <View key={day.value} style={styles.dayCard}>
                    <View style={styles.dayHeader}>
                      <Text style={styles.dayLabel}>{day.label}</Text>
                      <Switch
                        value={isAvailable}
                        onValueChange={() => handleToggleDay(day.value, dayAvailability?.id, isAvailable)}
                        trackColor={{ false: '#E5E5E5', true: '#F4A896' }}
                        thumbColor={isAvailable ? '#2D1A46' : '#f4f3f4'}
                      />
                    </View>

                    {isAvailable && dayAvailability && (
                      <View style={styles.hoursContainer}>
                        {isEditing ? (
                          <View style={styles.editTimeForm}>
                            <View style={styles.timeInputRow}>
                              <View style={styles.timeInputWrapper}>
                                <Text style={styles.timeInputLabel}>Start</Text>
                                <TextInput
                                  style={styles.timeInput}
                                  value={editStartTime}
                                  onChangeText={setEditStartTime}
                                  placeholder="09:00"
                                  placeholderTextColor="#999"
                                />
                              </View>
                              <Text style={styles.timeSeparator}>-</Text>
                              <View style={styles.timeInputWrapper}>
                                <Text style={styles.timeInputLabel}>End</Text>
                                <TextInput
                                  style={styles.timeInput}
                                  value={editEndTime}
                                  onChangeText={setEditEndTime}
                                  placeholder="17:00"
                                  placeholderTextColor="#999"
                                />
                              </View>
                            </View>
                            <View style={styles.editActions}>
                              <TouchableOpacity
                                style={styles.editCancelButton}
                                onPress={handleCancelEdit}
                              >
                                <Text style={styles.editCancelText}>Cancel</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={styles.editSaveButton}
                                onPress={() => handleSaveTime(dayAvailability.id)}
                              >
                                <Text style={styles.editSaveText}>Save</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        ) : (
                          <TouchableOpacity
                            style={styles.timeRow}
                            onPress={() => handleEditDay(day.value, dayAvailability.start_time, dayAvailability.end_time)}
                          >
                            <Clock color="#666" size={16} />
                            <Text style={styles.timeText}>
                              {dayAvailability.start_time.slice(0, 5)} - {dayAvailability.end_time.slice(0, 5)}
                            </Text>
                            <Text style={styles.editHint}>(Tap to edit)</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>

            {/* Exceptions */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Exceptions</Text>
                <TouchableOpacity 
                  style={styles.addExceptionButton}
                  onPress={() => setShowExceptionForm(!showExceptionForm)}
                >
                  <Plus color="white" size={20} />
                </TouchableOpacity>
              </View>
              <Text style={styles.sectionDescription}>
                Block dates or modify hours for specific days
              </Text>

              {showExceptionForm && (
                <View style={styles.exceptionForm}>
                  <Text style={styles.formLabel}>Exception Type</Text>
                  <View style={styles.typeButtons}>
                    <TouchableOpacity
                      style={[
                        styles.typeButton,
                        exceptionType === 'unavailable' && styles.typeButtonActive
                      ]}
                      onPress={() => setExceptionType('unavailable')}
                    >
                      <Text style={[
                        styles.typeButtonText,
                        exceptionType === 'unavailable' && styles.typeButtonTextActive
                      ]}>
                        Unavailable
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.typeButton,
                        exceptionType === 'modified_hours' && styles.typeButtonActive
                      ]}
                      onPress={() => setExceptionType('modified_hours')}
                    >
                      <Text style={[
                        styles.typeButtonText,
                        exceptionType === 'modified_hours' && styles.typeButtonTextActive
                      ]}>
                        Modified Hours
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.formLabel}>Date (YYYY-MM-DD)</Text>
                  <TextInput
                    style={styles.input}
                    value={exceptionDate}
                    onChangeText={setExceptionDate}
                    placeholder="2024-12-25"
                    placeholderTextColor="#999"
                  />

                  {exceptionType === 'modified_hours' && (
                    <>
                      <Text style={styles.formLabel}>Start Time (HH:MM:SS)</Text>
                      <TextInput
                        style={styles.input}
                        value={exceptionStartTime}
                        onChangeText={setExceptionStartTime}
                        placeholder="10:00:00"
                        placeholderTextColor="#999"
                      />

                      <Text style={styles.formLabel}>End Time (HH:MM:SS)</Text>
                      <TextInput
                        style={styles.input}
                        value={exceptionEndTime}
                        onChangeText={setExceptionEndTime}
                        placeholder="15:00:00"
                        placeholderTextColor="#999"
                      />
                    </>
                  )}

                  <Text style={styles.formLabel}>Reason (Optional)</Text>
                  <TextInput
                    style={styles.input}
                    value={exceptionReason}
                    onChangeText={setExceptionReason}
                    placeholder="Holiday, Personal day, etc."
                    placeholderTextColor="#999"
                  />

                  <View style={styles.formActions}>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => {
                        setShowExceptionForm(false);
                        setExceptionDate('');
                        setExceptionStartTime('');
                        setExceptionEndTime('');
                        setExceptionReason('');
                      }}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.saveButton}
                      onPress={handleCreateException}
                    >
                      <Text style={styles.saveButtonText}>Create</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {exceptions && exceptions.length > 0 ? (
                <View style={styles.exceptionsList}>
                  {exceptions.map((exception) => (
                    <View key={exception.id} style={styles.exceptionCard}>
                      <View style={styles.exceptionTopRow}>
                        <View style={styles.exceptionHeader}>
                          <Calendar color="#2D1A46" size={20} />
                          <Text style={styles.exceptionDate}>{exception.exception_date}</Text>
                        </View>
                        <TouchableOpacity
                          style={styles.deleteExceptionButton}
                          onPress={() => exception.id && handleDeleteException(exception.id)}
                        >
                          <Text style={styles.deleteExceptionText}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                      <View style={styles.exceptionDetails}>
                        <View style={[
                          styles.exceptionTypeBadge,
                          { backgroundColor: exception.exception_type === 'unavailable' ? '#FFEBEE' : '#E3F2FD' }
                        ]}>
                          <Text style={[
                            styles.exceptionTypeText,
                            { color: exception.exception_type === 'unavailable' ? '#F44336' : '#2196F3' }
                          ]}>
                            {exception.exception_type === 'unavailable' ? 'Unavailable' : 'Modified Hours'}
                          </Text>
                        </View>
                        {exception.start_time && exception.end_time && (
                          <Text style={styles.exceptionTime}>
                            {exception.start_time.slice(0, 5)} - {exception.end_time.slice(0, 5)}
                          </Text>
                        )}
                      </View>
                      {exception.reason && (
                        <Text style={styles.exceptionReason}>{exception.reason}</Text>
                      )}
                    </View>
                  ))}
                </View>
              ) : !showExceptionForm && (
                <View style={styles.emptyExceptions}>
                  <AlertCircle color="#ccc" size={48} />
                  <Text style={styles.emptyText}>No exceptions set</Text>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  backButton: {
    padding: 8,
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  section: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D1A46',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  dayCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D1A46',
  },
  hoursContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeText: {
    fontSize: 14,
    color: '#666',
  },
  addExceptionButton: {
    backgroundColor: '#2D1A46',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exceptionForm: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D1A46',
    marginBottom: 8,
    marginTop: 12,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeButtonActive: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  typeButtonTextActive: {
    color: '#4CAF50',
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#2D1A46',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  exceptionsList: {
    gap: 12,
  },
  exceptionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  exceptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  exceptionDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D1A46',
  },
  exceptionDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  exceptionTypeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  exceptionTypeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  exceptionTime: {
    fontSize: 14,
    color: '#666',
  },
  exceptionReason: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  emptyExceptions: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
  },
  editTimeForm: {
    gap: 12,
  },
  timeInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timeInputWrapper: {
    flex: 1,
  },
  timeInputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  timeInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  timeSeparator: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
  },
  editActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editCancelButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  editCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  editSaveButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#2D1A46',
    alignItems: 'center',
  },
  editSaveText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  editHint: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginLeft: 8,
  },
  exceptionTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  deleteExceptionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#FFEBEE',
  },
  deleteExceptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F44336',
  },
});


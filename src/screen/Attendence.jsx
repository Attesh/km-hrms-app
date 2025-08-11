import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  Button,
  Dimensions,
  ScrollView,
  Platform
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Calendar } from 'react-native-calendars';
import Header from '../components/Header';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../config';
import { format, parseISO, addMonths, subMonths } from 'date-fns';
import Sidebar from '../components/Sidebar';

const { width } = Dimensions.get('window');

const Attendance = ({ navigation }) => {
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [monthlyData, setMonthlyData] = useState({
    dates: [],
    data: []
  });
  const [viewType, setViewType] = useState('daily');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [employeeFilter, setEmployeeFilter] = useState('all');
  const [employees, setEmployees] = useState([]);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const [monthYear, setMonthYear] = useState(new Date());
  const [showYearPicker, setShowYearPicker] = useState(false);

  // Toggle sidebar visibility
  const toggleSidebar = () => setSidebarVisible(!isSidebarVisible);

  // Fetch data when dependencies change
  useEffect(() => {
    fetchEmployees();
    if (viewType === 'monthly') {
      fetchMonthlyAttendanceData();
    } else {
      fetchAttendanceData();
    }
  }, [viewType, startDate, endDate, employeeFilter, monthYear]);

  // Fetch employee list
  const fetchEmployees = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.get(`${BASE_URL}/employees`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmployees(response.data.data);
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  // Fetch monthly attendance data
 const fetchMonthlyAttendanceData = async () => {
  try {
    setLoading(true);
    
    // Get current date
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth(); // 0-11
    
    // Check if selected month is in the future
    if (
      monthYear.getFullYear() > currentYear || 
      (monthYear.getFullYear() === currentYear && monthYear.getMonth() > currentMonth)
    ) {
      // Future month - no data available
      setMonthlyData({
        dates: [],
        data: []
      });
      setError('No data available for future months');
      return;
    }

    const token = await AsyncStorage.getItem('userToken');
    const url = `${BASE_URL}/attendance/monthly?month=${monthYear.getMonth() + 1}&year=${monthYear.getFullYear()}`;
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` }
    });

    setMonthlyData({
      dates: response.data.dates || [],
      data: response.data.data || []
    });
    setError(null);
  } catch (err) {
    setError(err.message);
    setMonthlyData({
      dates: [],
      data: []
    });
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};

  // Fetch daily or filtered attendance data
  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      let url = `${BASE_URL}/attendance/`;

      if (viewType === 'daily') {
        const selectedDate = format(startDate, 'yyyy-MM-dd');
        url += `daily?date=${selectedDate}`;
      } else if (viewType === 'filter') {
         if (employeeFilter !== 'all') {
          url += `filter?employee_id=${employeeFilter}&start_date=${format(startDate, 'yyyy-MM-dd')}&end_date=${format(endDate, 'yyyy-MM-dd')}`;
        } else {
          url += `filter?date=${format(startDate, 'yyyy-MM-dd')}&end_date=${format(endDate, 'yyyy-MM-dd')}`;
        }
      }

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setAttendanceData(response.data.data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      setAttendanceData([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle refresh action
  const handleRefresh = () => {
    setRefreshing(true);
    if (viewType === 'monthly') {
      fetchMonthlyAttendanceData();
    } else {
      fetchAttendanceData();
    }
  };

  // Date selection handlers
  const handleStartDateSelect = (day) => {
    const selectedDate = new Date(day.year, day.month - 1, day.day);
    setStartDate(selectedDate);
    setShowStartDatePicker(false);
  };

  const handleEndDateSelect = (day) => {
    const selectedDate = new Date(day.year, day.month - 1, day.day);
    setEndDate(selectedDate);
    setShowEndDatePicker(false);
  };

  // Month navigation
  const navigateMonth = (direction) => {
    setMonthYear(direction === 'next' ? addMonths(monthYear, 1) : subMonths(monthYear, 1));
  };

  // Handle year change
  const handleYearChange = (year) => {
    const newDate = new Date(monthYear);
    newDate.setFullYear(year);
    setMonthYear(newDate);
  };

  // Status rendering helpers
  const renderStatusIcon = (status) => {
    const iconProps = {
      size: 20,
      style: styles.statusIcon
    };

    switch(status) {
      case 'on_time':
        return <Icon name="check-circle" {...iconProps} style={[iconProps.style, styles.presentText]} />;
      case 'late':
      case 'late_25':
      case 'late_50':
      case 'late_absent':
        return <Icon name="watch-later" {...iconProps} style={[iconProps.style, styles.checkedInText]} />;
      case 'absent':
        return <Icon name="cancel" {...iconProps} style={[iconProps.style, styles.absentText]} />;
      case 'holiday':
        return <Icon name="beach-access" {...iconProps} style={[iconProps.style, styles.holidayText]} />;
      case 'public_holiday':
        return <Icon name="celebration" {...iconProps} style={[iconProps.style, styles.holidayText]} />;
      case 'leave':
        return <Icon name="flight-takeoff" {...iconProps} style={[iconProps.style, styles.leaveText]} />;
      case 'no_roster':
        return <Icon name="help-outline" {...iconProps} style={[iconProps.style, styles.noRosterText]} />;
      case 'not_joined':
        return <Icon name="block" {...iconProps} style={[iconProps.style, styles.notJoinedText]} />;
      default:
        return <Icon name="help-outline" {...iconProps} style={[iconProps.style, styles.defaultStatusText]} />;
    }
  };

  const renderStatusText = (status) => {
    switch(status) {
      case 'on_time': return 'On Time';
      case 'late': return 'Late';
      case 'late_25': return 'Late 25%';
      case 'late_50': return 'Late 50%';
      case 'late_absent': return 'Late Absent';
      case 'absent': return 'Absent';
      case 'holiday': return 'Holiday';
      case 'public_holiday': return 'Public Holiday';
      case 'leave': return 'On Leave';
      case 'no_roster': return 'No Roster';
      case 'not_joined': return 'Not Joined';
      default: return status;
    }
  };

  // Filter data based on search query
  const filteredData = viewType === 'monthly' 
    ? monthlyData.data.filter(item => 
        item.employee_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : attendanceData.filter(item => 
        item.employee_name.toLowerCase().includes(searchQuery.toLowerCase())
      );

  // Render daily attendance item
  const renderDailyItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.employeeHeader}>
        <Text style={styles.employeeName}>{item.employee_name}</Text>
        <Text style={styles.dateText}>{format(parseISO(item.date), 'MMM dd, yyyy')}</Text>
      </View>
      
      <View style={styles.dailyDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Status:</Text>
          <View style={styles.statusContainer}>
            {renderStatusIcon(item.status)}
            <Text style={[
              styles.detailValue,
              styles.statusText,
              item.status === 'present' && styles.presentText,
              item.status === 'absent' && styles.absentText,
              item.status === 'check_in' && styles.checkedInText
            ]}>
              {formatStatus(item.status)}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.timeContainer}>
        <View style={styles.timeColumn}>
          <Text style={styles.timeLabel}>Check In</Text>
          <Text style={styles.timeValue}>{formatTime(item.check_in)}</Text>
        </View>
        
        <View style={styles.timeColumn}>
          <Text style={styles.timeLabel}>Check Out</Text>
          <Text style={styles.timeValue}>{formatTime(item.check_out)}</Text>
        </View>
        
        <View style={styles.timeColumn}>
          <Text style={styles.timeLabel}>Total Hours</Text>
          <Text style={styles.timeValue}>{formatHours(item.total_hours)}</Text>
        </View>
      </View>
      
      <View style={styles.timeContainer}>
        <View style={styles.timeColumn}>
          <Text style={styles.timeLabel}>On Time Status</Text>
          <Text style={styles.timeValue}>{formatStatus(item.on_time_status) || 'N/A'}</Text>
        </View>
        
        <View style={styles.timeColumn}>
          <Text style={styles.timeLabel}>Roster Start</Text>
          <Text style={styles.timeValue}>{formatTime(item.roster_start)}</Text>
        </View>
        
        <View style={styles.timeColumn}>
          <Text style={styles.timeLabel}>Roster End</Text>
          <Text style={styles.timeValue}>{formatTime(item.roster_end)}</Text>
        </View>
      </View>
    </View>
  );

  // Render monthly attendance item
  const renderMonthlyItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.employeeHeader}>
        <Text style={styles.employeeName}>{item.employee_name}</Text>
        <Text style={[styles.existsText, item.exists === 'yes' ? styles.activeText : styles.inactiveText]}>
          {item.exists === 'yes' ? 'Active' : 'Inactive'}
        </Text>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <View style={styles.monthlyDatesContainer}>
          {monthlyData.dates.map((date, index) => (
            <View key={`${item.employee_id}-${date}-${index}`} style={styles.dateCell}>
              <Text style={styles.dateText}>{date.split(',')[0]}</Text>
              <Text style={styles.dayText}>{date.split(',')[1]}</Text>
              <View style={styles.statusContainer}>
                {renderStatusIcon(item[date] || 'unknown')}
                <Text style={styles.statusTextSmall}>
                  {renderStatusText(item[date] || 'unknown').split(' ')[0]}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  // Render the component
  return (
    <SafeAreaView style={styles.container}>
      <Header title="Attendance" onMenuPress={toggleSidebar} />
      <View style={styles.mainContent}>
        <Sidebar
          navigation={navigation}
          isVisible={isSidebarVisible}
          setSidebarVisible={setSidebarVisible}
        />
        
        {/* Filter Controls */}
        <View style={styles.filterContainer}>
          <View style={styles.viewTypePicker}>
            <Picker
              selectedValue={viewType}
              style={styles.picker}
              onValueChange={(itemValue) => {
                setViewType(itemValue);
                const today = new Date();
                setStartDate(today);
                setEndDate(today);
                setEmployeeFilter('all');
              }}
              dropdownIconColor="#007bff"
            >
              <Picker.Item label="Daily View" value="daily" />
              <Picker.Item label="Monthly View" value="monthly" />
              <Picker.Item label="Date Range" value="filter" />
            </Picker>
          </View>

          {/* Filter Options */}
          {viewType === 'filter' && (
            <View style={styles.filterOptions}>
              <View style={styles.employeePicker}>
                <Picker
                  selectedValue={employeeFilter}
                  style={styles.picker}
                  onValueChange={(itemValue) => setEmployeeFilter(itemValue)}
                  dropdownIconColor="#007bff"
                >
                  <Picker.Item label="All Employees" value="all" />
                  {employees.map(emp => (
                    <Picker.Item 
                      key={emp.id} 
                      label={emp.name} 
                      value={emp.employee_id} 
                    />
                  ))}
                </Picker>
              </View>
              
              <View style={styles.datePickersContainer}>
                <TouchableOpacity 
                  style={styles.dateButton}
                  onPress={() => setShowStartDatePicker(true)}
                >
                  <Icon name="calendar-today" size={20} color="#007bff" />
                  <Text style={styles.dateButtonText}>
                    {format(startDate, 'MMM dd, yyyy')}
                  </Text>
                </TouchableOpacity>
                
                <Text style={styles.dateRangeSeparator}>to</Text>
                
                <TouchableOpacity 
                  style={styles.dateButton}
                  onPress={() => setShowEndDatePicker(true)}
                >
                  <Icon name="calendar-today" size={20} color="#007bff" />
                  <Text style={styles.dateButtonText}>
                    {format(endDate, 'MMM dd, yyyy')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          
          {/* Monthly View Controls */}
          {viewType === 'monthly' && (
            <View style={styles.monthControls}>
              <TouchableOpacity 
                style={styles.monthNavButton}
                onPress={() => navigateMonth('prev')}
              >
                <Icon name="chevron-left" size={24} color="#007bff" />
              </TouchableOpacity>
              
              <View style={styles.monthDisplay}>
                <TextInput
                  style={styles.monthInput}
                  value={format(monthYear, 'MMMM')}
                  editable={false}
                />
                <TouchableOpacity 
                  onPress={() => setShowYearPicker(true)}
                  style={styles.yearButton}
                >
                  <Text style={styles.yearButtonText}>
                    {format(monthYear, 'yyyy')}
                  </Text>
                  <Icon name="arrow-drop-down" size={20} color="#007bff" />
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity 
                style={styles.monthNavButton}
                onPress={() => navigateMonth('next')}
              >
                <Icon name="chevron-right" size={24} color="#007bff" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search employees..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close" size={20} color="#999" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Status Legend */}
        {viewType === 'monthly' && (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.legendScroll}
          >
            <View style={styles.legendContainer}>
              <View style={styles.legendItem}>
                <Icon name="check-circle" style={[styles.legendIcon, styles.presentText]} />
                <Text style={styles.legendText}>On Time</Text>
              </View>
              <View style={styles.legendItem}>
                <Icon name="watch-later" style={[styles.legendIcon, styles.checkedInText]} />
                <Text style={styles.legendText}>Late</Text>
              </View>
              <View style={styles.legendItem}>
                <Icon name="cancel" style={[styles.legendIcon, styles.absentText]} />
                <Text style={styles.legendText}>Absent</Text>
              </View>
              <View style={styles.legendItem}>
                <Icon name="celebration" style={[styles.legendIcon, styles.holidayText]} />
                <Text style={styles.legendText}>Holiday</Text>
              </View>
              <View style={styles.legendItem}>
                <Icon name="flight-takeoff" style={[styles.legendIcon, styles.leaveText]} />
                <Text style={styles.legendText}>Leave</Text>
              </View>
            </View>
          </ScrollView>
        )}

        {/* Content Area */}
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007bff" />
            <Text style={styles.loadingText}>Loading attendance data...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Icon name="error-outline" size={40} color="#e74c3c" />
            <Text style={styles.errorText}>Error loading data: {error}</Text>
            <TouchableOpacity onPress={handleRefresh} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : filteredData.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="info-outline" size={40} color="#999" />
            <Text style={styles.emptyText}>No attendance records found</Text>
            <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
              <Icon name="refresh" size={20} color="#007bff" />
              <Text style={styles.refreshText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={filteredData}
            renderItem={viewType === 'monthly' ? renderMonthlyItem : renderDailyItem}
            keyExtractor={(item, index) => `${item.employee_id}-${viewType}-${index}-${item.date || format(startDate, 'yyyy-MM-dd')}`}
            contentContainerStyle={styles.listContent}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            ListFooterComponent={<View style={styles.listFooter} />}
          />
        )}

        {/* Start Date Picker Modal */}
        <Modal visible={showStartDatePicker} animationType="slide" transparent>
          <View style={styles.modalContainer}>
            <View style={styles.calendarModalContent}>
              <Calendar
                current={format(startDate, 'yyyy-MM-dd')}
                onDayPress={handleStartDateSelect}
                markedDates={{
                  [format(startDate, 'yyyy-MM-dd')]: {
                    selected: true, 
                    selectedColor: '#007bff',
                    selectedTextColor: '#ffffff'
                  }
                }}
                theme={calendarTheme}
              />
              <View style={styles.modalButtons}>
                <Button 
                  title="Close" 
                  onPress={() => setShowStartDatePicker(false)} 
                  color="#007bff"
                />
              </View>
            </View>
          </View>
        </Modal>

        {/* End Date Picker Modal */}
        <Modal visible={showEndDatePicker} animationType="slide" transparent>
          <View style={styles.modalContainer}>
            <View style={styles.calendarModalContent}>
              <Calendar
                current={format(endDate, 'yyyy-MM-dd')}
                onDayPress={handleEndDateSelect}
                markedDates={{
                  [format(endDate, 'yyyy-MM-dd')]: {
                    selected: true, 
                    selectedColor: '#007bff',
                    selectedTextColor: '#ffffff'
                  }
                }}
                theme={calendarTheme}
                minDate={format(startDate, 'yyyy-MM-dd')}
              />
              <View style={styles.modalButtons}>
                <Button 
                  title="Close" 
                  onPress={() => setShowEndDatePicker(false)} 
                  color="#007bff"
                />
              </View>
            </View>
          </View>
        </Modal>

        {/* Year Picker Modal */}
        <Modal visible={showYearPicker} animationType="slide" transparent>
          <View style={styles.modalContainer}>
            <View style={styles.pickerModalContent}>
              <Picker
                selectedValue={monthYear.getFullYear()}
                onValueChange={(itemValue) => {
                  handleYearChange(itemValue);
                }}
                style={styles.yearPicker}
              >
                {Array.from({ length: 10 }, (_, i) => {
                  const year = new Date().getFullYear() - 5 + i;
                  return (
                    <Picker.Item 
                      key={year} 
                      label={year.toString()} 
                      value={year} 
                    />
                  );
                })}
              </Picker>
              <View style={styles.modalButtons}>
                <Button 
                  title="Done" 
                  onPress={() => setShowYearPicker(false)} 
                  color="#007bff"
                />
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

// Calendar theme configuration
const calendarTheme = {
  backgroundColor: '#ffffff',
  calendarBackground: '#ffffff',
  textSectionTitleColor: '#007bff',
  selectedDayBackgroundColor: '#007bff',
  selectedDayTextColor: '#ffffff',
  todayTextColor: '#007bff',
  dayTextColor: '#2d4150',
  textDisabledColor: '#d9e1e8',
  arrowColor: '#007bff',
  monthTextColor: '#007bff',
  textDayFontWeight: '500',
  textMonthFontWeight: 'bold',
  textDayHeaderFontWeight: '500',
  textDayFontSize: 16,
  textMonthFontSize: 18,
  textDayHeaderFontSize: 14
};

// Helper functions
const formatStatus = (status) => {
  const statusMap = {
    'check_in': 'Checked In',
    'present': 'Present',
    'absent': 'Absent',
    'on_time': 'On Time',
    'late': 'Late',
    'holiday': 'Holiday',
    'leave': 'Leave',
    'no_roster': 'No Roster',
    'not_joined': 'Not Joined'
  };
  return statusMap[status] || status.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

const formatTime = (time) => {
  if (!time || time === '00:00:00') return '--:--';
  return time.includes(':') ? time.substring(0, 5) : time;
};

const formatHours = (hours) => {
  if (!hours || hours === '00:00') return '00:00';
  return hours.includes(':') ? hours.substring(0, 5) : hours;
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  mainContent: {
    flex: 1,
  },
   filterContainer: {
    padding: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  viewTypePicker: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginBottom: 10,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
    color: '#333',
  },
  filterOptions: {
    marginTop: 10,
  },
  employeePicker: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginBottom: 10,
    overflow: 'hidden',
  },
  datePickersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 6,
    backgroundColor: '#fff',
  },
  dateButtonText: {
    marginLeft: 8,
    color: '#333',
    fontSize: 14,
  },
  dateRangeSeparator: {
    marginHorizontal: 4,
    color: '#666',
    fontSize: 14,
  },
  monthControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  monthNavButton: {
    padding: 8,
  },
  monthDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  monthInput: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    padding: 8,
    textAlign: 'center',
    minWidth: 120,
  },
  yearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginLeft: 8,
  },
  yearButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007bff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
    color: '#333',
    paddingHorizontal: 8,
  },
  legendScroll: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    minHeight: 60,
  },
  legendContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    paddingVertical: 6,
  },
  legendIcon: {
    fontSize: 20,
    marginRight: 6,
  },
  legendText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  listContent: {
    padding: 12,
  },
  listFooter: {
    height: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  employeeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 8,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  dateText: {
    fontSize: 12,
    color: '#666',
  },
  existsText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  activeText: {
    color: '#2ecc71',
  },
  inactiveText: {
    color: '#e74c3c',
  },
  dailyDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 6,
    alignItems: 'center',
  },
  detailLabel: {
    color: '#666',
    fontSize: 14,
    marginRight: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  presentText: {
    color: '#2ecc71',
  },
  absentText: {
    color: '#e74c3c',
  },
  checkedInText: {
    color: '#f39c12',
  },
  holidayText: {
    color: '#3498db',
  },
  leaveText: {
    color: '#9b59b6',
  },
  noRosterText: {
    color: '#95a5a6',
  },
  notJoinedText: {
    color: '#7f8c8d',
  },
  defaultStatusText: {
    color: '#333',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeColumn: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 4,
  },
  timeLabel: {
    color: '#666',
    fontSize: 12,
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  scrollContainer: {
    paddingRight: 16,
  },
  monthlyDatesContainer: {
    flexDirection: 'row',
    paddingBottom: 8,
  },
  dateCell: {
    width: 60,
    alignItems: 'center',
    marginRight: 8,
    padding: 6,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    borderRadius: 6,
    backgroundColor: '#fafafa',
  },
  dayText: {
    fontSize: 10,
    color: '#666',
    marginVertical: 2,
  },
  statusTextSmall: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#e74c3c',
    marginTop: 12,
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 14,
  },
  retryButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#666',
    marginTop: 12,
    marginBottom: 20,
    fontSize: 14,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  refreshText: {
    marginLeft: 6,
    color: '#007bff',
    fontSize: 14,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  calendarModalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: width - 40,
    maxHeight: '80%',
  },
  pickerModalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: width - 40,
  },
  yearPicker: {
    width: '100%',
  },
  modalButtons: {
    marginTop: 16,
  },
});

export default Attendance;
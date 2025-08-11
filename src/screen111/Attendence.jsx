import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import Icon from 'react-native-vector-icons/MaterialIcons';
import SearchBox from '../components/SearchBox'; // ✅ import reusable component

const Attendance = ({ navigation }) => {
  const [isSidebarVisible, setSidebarVisible] = useState(false);

  const toggleSidebar = () => setSidebarVisible(!isSidebarVisible);

  // Sample static attendance data
  const attendanceList = [
    { id: 1, name: 'Imran Ali', date: '2025-07-31', status: 'Present' },
    { id: 2, name: 'Ayesha Khan', date: '2025-07-31', status: 'Absent' },
    { id: 3, name: 'Usman Raza', date: '2025-07-31', status: 'Present' },
    { id: 4, name: 'Sana Tariq', date: '2025-07-31', status: 'Leave' },
  ];

  

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Attendance" onMenuPress={toggleSidebar} />

      <View style={styles.mainContent}>
          <Sidebar
          navigation={navigation}
          isVisible={isSidebarVisible}
          setSidebarVisible={setSidebarVisible}
        />

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Attendance Record</Text>
          {attendanceList.map((item) => (
            <View key={item.id} style={styles.card}>
              <Icon
                name={
                  item.status === 'Present'
                    ? 'check-circle'
                    : item.status === 'Absent'
                    ? 'cancel'
                    : 'event-busy'
                }
                size={30}
                color={
                  item.status === 'Present'
                    ? 'green'
                    : item.status === 'Absent'
                    ? 'red'
                    : 'orange'
                }
                style={styles.icon}
              />
              <View>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.details}>Date: {item.date}</Text>
                <Text style={styles.details}>Status: {item.status}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      <Footer />
    </SafeAreaView>
  );
};

export default Attendance;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
  },
  content: {
    padding: 16,
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  icon: {
    marginRight: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
  },
  details: {
    fontSize: 14,
    color: '#555',
  },
});